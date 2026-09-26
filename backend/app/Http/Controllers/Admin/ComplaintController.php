<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/*
|==============================================================================
| ADMIN COMPLAINT CONTROLLER   (issue #41)
|==============================================================================
|
| There are already complaint endpoints for the ADOPTER, in
| Api/ComplaintController. Those deliberately show you only your OWN
| complaints:
|
|     WHERE complaints.user_id = <the logged-in user>
|
| The admin needs the opposite: EVERY complaint from EVERY user, plus the
| ability to change a complaint's status. That is a different question, so it
| gets its own controller rather than adding an "am I an admin?" branch inside
| the adopter one.
|
| These routes sit behind the `admin` middleware, so only a platform_admin can
| reach them.
|
*/
class ComplaintController extends Controller
{
    /**
     * LIST ALL  ->  GET /api/admin/complaints
     *
     * Optional filters:  ?status=Pending  ?category=other  ?search=noise
     */
    public function index(Request $request)
    {
        /*
        |----------------------------------------------------------------------
        | THE JOIN
        |----------------------------------------------------------------------
        |
        | complaints.user_id is just a number. To show who complained we glue
        | the users table on:
        |
        |     JOIN users ON users.id = complaints.user_id
        |
        | A plain (INNER) JOIN is correct here, unlike the shelters/admin join.
        | complaints.user_id is NOT NULL with a foreign key, so every complaint
        | is guaranteed to have a matching user - there is no "orphan" case for
        | a LEFT JOIN to rescue.
        |
        | Use LEFT JOIN when the link is optional; use JOIN when it is required.
        */
        $sql = "SELECT
                    complaints.id,
                    complaints.subject,
                    complaints.category,
                    complaints.description,
                    complaints.status,
                    complaints.created_at,
                    complaints.updated_at,
                    users.id    AS user_id,
                    users.name  AS user_name,
                    users.email AS user_email,
                    users.role  AS user_role
                FROM complaints
                JOIN users ON users.id = complaints.user_id
                WHERE 1 = 1";

        // 1 = 1 is always true, so every filter below can just append " AND ..."
        // without us tracking which one comes first.
        $params = [];

        if ($request->query('status')) {
            // The column is ENUM('Pending','Resolved','Rejected','Escalated')
            // - the value must match exactly, capital letter included.
            $sql .= " AND complaints.status = ?";
            $params[] = $request->query('status');
        }

        if ($request->query('category')) {
            $sql .= " AND complaints.category = ?";
            $params[] = $request->query('category');
        }

        if ($request->query('search')) {
            // Search the subject, the description, and who reported it.
            // The brackets keep the OR group together so it cannot swallow
            // the status filter above.
            $sql .= " AND (complaints.subject LIKE ?
                        OR complaints.description LIKE ?
                        OR users.name LIKE ?)";

            $like = '%' . $request->query('search') . '%';
            $params[] = $like;
            $params[] = $like;
            $params[] = $like;
        }

        // Newest complaints first - an admin wants the fresh ones at the top.
        $sql .= " ORDER BY complaints.created_at DESC";

        $complaints = DB::select($sql, $params);

        /*
        | A count per status, for the summary cards on the page.
        |
        | GROUP BY collapses all the rows sharing a status into one line and
        | COUNT tells us how many were collapsed - three numbers from one
        | query instead of three separate COUNT queries.
        */
        $statusRows = DB::select(
            "SELECT status, COUNT(*) AS total FROM complaints GROUP BY status"
        );

        $counts = [];
        foreach ($statusRows as $row) {
            $counts[$row->status] = $row->total;
        }

        return response()->json([
            'message'    => 'Complaints fetched successfully.',
            'count'      => count($complaints),
            'complaints' => $complaints,
            'summary'    => [
                // ?? 0 because GROUP BY only returns rows for statuses that
                // actually exist. With no rejected complaints there is no
                // 'Rejected' row at all, and we want 0 rather than an error.
                'pending'   => $counts['Pending']   ?? 0,
                'resolved'  => $counts['Resolved']  ?? 0,
                'rejected'  => $counts['Rejected']  ?? 0,
                'escalated' => $counts['Escalated'] ?? 0,
            ],
        ]);
    }

    /**
     * ESCALATE OLD COMPLAINTS  ->  POST /api/admin/complaints/escalate
     *
     * This endpoint does almost nothing itself. All the work happens inside
     * MySQL, in the stored procedure sp_escalate_old_complaints, which loops
     * over the pending complaints one at a time and flags the ones that have
     * been waiting too long.
     *
     * The procedure is in database/procedures/sp_escalate_old_complaints.sql
     * and is installed by a migration.
     */
    public function escalateOld(Request $request)
    {
        /*
        |----------------------------------------------------------------------
        | HOW MANY DAYS IS "TOO LONG"
        |----------------------------------------------------------------------
        |
        | 7 by default, because that is the rule in the task. It is accepted as
        | an argument rather than hardcoded inside the procedure so the same
        | procedure can be reused if the rule changes, and so it is easy to
        | demonstrate with a smaller number.
        |
        | Cast to int. The value goes into an INT parameter, and casting here
        | means a request sending days=abc becomes 0 and gets caught by the
        | check below instead of reaching MySQL.
        */
        $maxDays = (int) $request->input('days', 7);

        if ($maxDays < 1) {
            return response()->json([
                'message' => 'days must be a whole number of at least 1.',
            ], 422);
        }

        /*
        |----------------------------------------------------------------------
        | CALLING A PROCEDURE THAT HAS OUT PARAMETERS
        |----------------------------------------------------------------------
        |
        | The procedure signature is:
        |
        |     sp_escalate_old_complaints(IN p_max_days, OUT p_checked, OUT p_escalated)
        |
        | An IN parameter is a normal value, so it uses a ? placeholder like any
        | other query - MySQL never sees it as SQL text, which is what stops
        | injection.
        |
        | An OUT parameter cannot be a ?, because the procedure needs somewhere
        | to WRITE to. So we hand it two MySQL session variables instead. The
        | @ prefix means "session variable": it belongs to this one database
        | connection and lives until the connection closes, which is how the
        | values survive long enough for the next query to read them.
        |
        | So this is always two steps - CALL to run it, then SELECT to collect
        | what it wrote. A procedure has no return value the way a PHP function
        | does; OUT parameters are how it reports back.
        */
        DB::statement(
            'CALL sp_escalate_old_complaints(?, @checked, @escalated)',
            [$maxDays]
        );

        $result = DB::selectOne(
            'SELECT @checked AS checked, @escalated AS escalated'
        );

        // The rows the loop just changed, so the admin can see WHICH complaints
        // were escalated rather than only a number.
        $escalated = DB::select(
            "SELECT
                 complaints.id,
                 complaints.subject,
                 complaints.category,
                 complaints.status,
                 complaints.created_at,
                 DATEDIFF(NOW(), complaints.created_at) AS days_pending,
                 users.name AS user_name
             FROM complaints
             JOIN users ON users.id = complaints.user_id
             WHERE complaints.status = 'Escalated'
             ORDER BY complaints.created_at ASC"
        );

        return response()->json([
            'message' => $result->escalated > 0
                ? $result->escalated . ' complaint(s) escalated for admin attention.'
                : 'No complaints have been pending longer than ' . $maxDays . ' days.',
            // (int) because MySQL hands session variables back as strings.
            'checked'   => (int) $result->checked,
            'escalated' => (int) $result->escalated,
            'max_days'  => $maxDays,
            'complaints' => $escalated,
        ]);
    }

    /**
     * READ ONE  ->  GET /api/admin/complaints/{id}
     */
    public function show($id)
    {
        $complaint = DB::selectOne(
            "SELECT
                 complaints.*,
                 users.name  AS user_name,
                 users.email AS user_email,
                 users.phone AS user_phone,
                 users.role  AS user_role,
                 admins.name AS resolved_by_name
             FROM complaints
             JOIN users ON users.id = complaints.user_id
             LEFT JOIN users AS admins ON admins.id = complaints.resolved_by
             WHERE complaints.id = ?",
            [$id]
        );

        if (! $complaint) {
            return response()->json(['message' => 'Complaint not found.'], 404);
        }

        return response()->json(['complaint' => $complaint]);
    }

    /**
     * CHANGE STATUS  ->  PUT /api/admin/complaints/{id}       (issue #64)
     *
     * This is the whole point of the admin page: reviewing a complaint and
     * marking it Resolved or Rejected.
     *
     * It now writes to TWO tables, so it runs inside a TRANSACTION.
     */
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            // These four strings are exactly the values the ENUM allows.
            // Keep this list and the migration's ENUM identical - if they
            // drift apart, validation passes and then the UPDATE fails with a
            // raw SQL error.
            //
            // 'Escalated' is in the list because the loop can set it, so an
            // admin has to be able to move such a complaint on to Resolved or
            // Rejected afterwards.
            'status' => ['required', 'in:Pending,Resolved,Rejected,Escalated'],
        ]);

        $complaint = DB::selectOne(
            "SELECT id, subject, status FROM complaints WHERE id = ?",
            [$id]
        );

        if (! $complaint) {
            return response()->json(['message' => 'Complaint not found.'], 404);
        }

        $newStatus = $validated['status'];

        // Who is doing this? The `admin` middleware has already guaranteed this
        // request belongs to a logged-in platform_admin, so there is always a
        // user here.
        $adminId = $request->user()->id;

        /*
        |----------------------------------------------------------------------
        | WHY THIS NEEDS A TRANSACTION
        |----------------------------------------------------------------------
        |
        | Resolving a complaint is now TWO writes to TWO different tables:
        |
        |     1. UPDATE complaints        - close the complaint
        |     2. INSERT INTO admin_activities - record who closed it
        |
        | Run separately, a crash between them leaves the database lying: the
        | complaint looks resolved but nothing says who did it, or an audit row
        | claims an action that never actually happened.
        |
        | A transaction makes the two writes ONE indivisible step. That is
        | ATOMICITY - the A in ACID. Either both land or neither does; there is
        | no state where only half the work is saved.
        |
        | These three calls send exactly the SQL you would type by hand:
        |
        |     DB::beginTransaction()  ->  START TRANSACTION
        |     DB::commit()            ->  COMMIT
        |     DB::rollBack()          ->  ROLLBACK
        |
        | Nothing between START and COMMIT is visible to any other connection.
        | Until COMMIT runs, the changes exist only inside this transaction.
        */
        DB::beginTransaction();

        try {
            /*
            | resolved_by / resolved_at only mean something for a complaint that
            | is actually resolved. Moving one back to Pending or Rejected has
            | to CLEAR them, otherwise the row would keep claiming it was
            | resolved by someone.
            */
            $resolvedBy = $newStatus === 'Resolved' ? $adminId : null;

            // NOW() is MySQL's own clock, not PHP's. One source of truth for
            // time means rows cannot disagree about ordering.
            $resolvedAt = $newStatus === 'Resolved' ? now() : null;

            $affected = DB::update(
                "UPDATE complaints
                 SET status      = ?,
                     resolved_by = ?,
                     resolved_at = ?,
                     updated_at  = NOW()
                 WHERE id = ?",
                [$newStatus, $resolvedBy, $resolvedAt, $id]
            );

            /*
            | DB::update returns HOW MANY ROWS it changed. Zero means the
            | complaint vanished between the SELECT above and this UPDATE, so
            | the audit row we are about to write would describe something that
            | never happened.
            |
            | Throwing here jumps to the catch block, which ROLLBACKs. This is
            | the "if the complaint update fails, no activity record is
            | created" half of the acceptance criteria.
            */
            if ($affected === 0) {
                throw new \RuntimeException(
                    'The complaint could not be updated, so nothing was saved.'
                );
            }

            // Second write: the audit trail. If THIS fails, the UPDATE above is
            // undone as well - the other half of atomicity.
            DB::insert(
                "INSERT INTO admin_activities
                    (admin_id, complaint_id, action, details, created_at, updated_at)
                 VALUES (?, ?, ?, ?, NOW(), NOW())",
                [
                    $adminId,
                    $id,
                    // e.g. 'complaint_resolved' - lowercased so the tag is
                    // stable even if the display spelling ever changes.
                    'complaint_' . strtolower($newStatus),
                    'Changed complaint #' . $id . ' ("' . $complaint->subject . '") from '
                        . $complaint->status . ' to ' . $newStatus . '.',
                ]
            );

            // Both writes succeeded. COMMIT makes them permanent and visible to
            // everyone else. Before this line, no other connection could see
            // either change.
            DB::commit();
        } catch (\Throwable $e) {
            /*
            | Something failed. ROLLBACK throws away EVERY change made since
            | beginTransaction - including the UPDATE that already "worked".
            | The database ends up exactly as it was before this request, with
            | no half-finished data left behind.
            */
            DB::rollBack();

            return response()->json([
                'message' => 'Could not update the complaint. No changes were saved.',
                'error'   => $e->getMessage(),
            ], 500);
        }

        return response()->json([
            'message'   => 'Complaint marked as ' . $newStatus . '.',
            // Read the row back so the response shows what is actually stored.
            // The LEFT JOIN is to the RESOLVING ADMIN, and it must be LEFT:
            // an unresolved complaint has resolved_by = NULL, and an INNER JOIN
            // would drop those rows from the result entirely.
            'complaint' => DB::selectOne(
                "SELECT
                     complaints.*,
                     users.name   AS user_name,
                     users.email  AS user_email,
                     admins.name  AS resolved_by_name
                 FROM complaints
                 JOIN users ON users.id = complaints.user_id
                 LEFT JOIN users AS admins ON admins.id = complaints.resolved_by
                 WHERE complaints.id = ?",
                [$id]
            ),
        ]);
    }

    /**
     * ADMIN ACTIVITY LOG  ->  GET /api/admin/activities
     *
     * The audit trail written by the transaction above. Proves that every
     * resolved complaint has a matching activity record.
     *
     * Optional filter:  ?complaint_id=12
     */
    public function activities(Request $request)
    {
        /*
        | Both JOINs are LEFT JOINs on purpose. admin_activities.admin_id and
        | complaint_id are nullOnDelete, so a log row can outlive the admin or
        | the complaint it refers to. An INNER JOIN would silently hide exactly
        | those rows - and hiding rows is the one thing an audit log must never
        | do.
        */
        $sql = "SELECT
                    admin_activities.id,
                    admin_activities.action,
                    admin_activities.details,
                    admin_activities.created_at,
                    admin_activities.admin_id,
                    admin_activities.complaint_id,
                    users.name AS admin_name,
                    complaints.subject AS complaint_subject,
                    complaints.status  AS complaint_status
                FROM admin_activities
                LEFT JOIN users      ON users.id = admin_activities.admin_id
                LEFT JOIN complaints ON complaints.id = admin_activities.complaint_id
                WHERE 1 = 1";

        $params = [];

        if ($request->query('complaint_id')) {
            $sql .= " AND admin_activities.complaint_id = ?";
            $params[] = $request->query('complaint_id');
        }

        // Newest first, which is what the created_at index is there for.
        $sql .= " ORDER BY admin_activities.created_at DESC, admin_activities.id DESC
                  LIMIT 50";

        $activities = DB::select($sql, $params);

        return response()->json([
            'message'    => 'Admin activity fetched successfully.',
            'count'      => count($activities),
            'activities' => $activities,
        ]);
    }
}
