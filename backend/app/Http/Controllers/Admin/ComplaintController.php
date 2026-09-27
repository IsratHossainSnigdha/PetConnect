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
            "SELECT id, subject, status, user_id FROM complaints WHERE id = ?",
            [$id]
        );

        if (! $complaint) {
            return response()->json(['message' => 'Complaint not found.'], 404);
        }

        $newStatus = $validated['status'];

        /*
        |----------------------------------------------------------------------
        | REMEMBER THE HIGH-WATER MARK OF THE NOTIFICATIONS TABLE
        |----------------------------------------------------------------------
        |
        | We never INSERT a notification here. The database does it on its own:
        | the trigger trg_notify_user_on_complaint_resolved fires on the UPDATE
        | below and writes one for the complaint owner.
        |
        | To be able to SHOW the admin that it happened, we note the largest
        | notification id that exists BEFORE the update. Anything above this
        | afterwards was created by the trigger, not by us.
        |
        | COALESCE(..., 0) because MAX() on an empty table returns NULL, and
        | "id > NULL" matches nothing.
        */
        $notificationsBefore = DB::selectOne(
            "SELECT COALESCE(MAX(id), 0) AS max_id FROM notifications"
        )->max_id;

        // Who is doing this? The `admin` middleware has already guaranteed this
        // request belongs to a logged-in platform_admin, so there is always a
        // user here.
        $adminId = $request->user()->id;

        /*
        |----------------------------------------------------------------------
        | WHERE THE TRANSACTION LIVES                          (issue #64)
        |----------------------------------------------------------------------
        |
        | Resolving a complaint is TWO writes to TWO different tables:
        |
        |     1. UPDATE complaints           - close the complaint
        |     2. INSERT INTO admin_activities - record who closed it
        |
        | Run separately, a crash between them leaves the database lying: a
        | complaint that looks resolved with nothing saying who did it, or an
        | audit row for something that never happened. A transaction makes them
        | ONE indivisible step - either both land or neither does. That is
        | ATOMICITY, the A in ACID.
        |
        | For RESOLVING, that transaction is now inside the database, in
        | sp_resolve_complaint: it runs START TRANSACTION, both writes, then
        | COMMIT, and a DECLARE EXIT HANDLER FOR SQLEXCEPTION that ROLLBACKs if
        | anything fails. So the guarantee belongs to the database and applies
        | to every caller, not only to this controller.
        |
        | That is also why there is no DB::beginTransaction() around the CALL
        | below. MySQL has no nested transactions - a START TRANSACTION inside
        | the procedure would silently COMMIT an outer one, which would break
        | the very thing we are trying to guarantee.
        |
        | Any OTHER status is still handled here, in a PHP transaction, because
        | there is no procedure for reopening or rejecting a complaint.
        */
        if ($newStatus === 'Resolved') {

            /*
            | The two ? are IN parameters, bound like any other value. @st and
            | @msg are session variables catching the two OUT parameters, read
            | back by the SELECT underneath.
            |
            | By the time this returns, the procedure has already COMMITted or
            | ROLLBACKed. There is nothing left for PHP to do but report.
            */
            DB::statement(
                'CALL sp_resolve_complaint(?, ?, @st, @msg)',
                [$id, $adminId]
            );

            $outcome = DB::selectOne('SELECT @st AS status, @msg AS message');

            if ($outcome->status !== 'success') {
                /*
                | A rule the procedure enforced said no - already resolved, or
                | the complaint disappeared. Nothing is broken, so this is not
                | a 500. 409 Conflict means "valid request, but it clashes with
                | the current state of the thing".
                |
                | Nothing needs rolling back here: the procedure already did it.
                */
                return response()->json([
                    'message' => $outcome->message,
                ], 409);
            }

        } else {

            DB::beginTransaction();

            try {
                /*
                | resolved_by / resolved_at are cleared, because a complaint
                | that is no longer resolved must not keep claiming it was
                | resolved by someone.
                |
                | NOW() is MySQL's clock, never PHP's. Laravel's app timezone is
                | UTC while the MySQL server runs on local time, so mixing the
                | two put a six hour gap between columns on the same row.
                */
                $affected = DB::update(
                    "UPDATE complaints
                     SET status      = ?,
                         resolved_by = NULL,
                         resolved_at = NULL,
                         updated_at  = NOW()
                     WHERE id = ?",
                    [$newStatus, $id]
                );

                /*
                | DB::update returns HOW MANY ROWS it changed. Zero means the
                | complaint vanished between the SELECT above and this UPDATE,
                | so the audit row we are about to write would describe
                | something that never happened. Throwing jumps to the catch,
                | which ROLLBACKs.
                */
                if ($affected === 0) {
                    throw new \RuntimeException(
                        'The complaint could not be updated, so nothing was saved.'
                    );
                }

                // Second write: the audit trail. If THIS fails, the UPDATE
                // above is undone as well - the other half of atomicity.
                DB::insert(
                    "INSERT INTO admin_activities
                        (admin_id, complaint_id, action, details, created_at, updated_at)
                     VALUES (?, ?, ?, ?, NOW(), NOW())",
                    [
                        $adminId,
                        $id,
                        // e.g. 'complaint_rejected' - lowercased so the tag is
                        // stable even if the display spelling ever changes.
                        'complaint_' . strtolower($newStatus),
                        'Changed complaint #' . $id . ' ("' . $complaint->subject . '") from '
                            . $complaint->status . ' to ' . $newStatus . '.',
                    ]
                );

                DB::commit();
            } catch (\Throwable $e) {
                /*
                | ROLLBACK throws away EVERY change made since
                | beginTransaction - including the UPDATE that already
                | "worked". The database ends up exactly as it was before this
                | request, with no half-finished data left behind.
                */
                DB::rollBack();

                return response()->json([
                    'message' => 'Could not update the complaint. No changes were saved.',
                    'error'   => $e->getMessage(),
                ], 500);
            }
        }

        /*
        |----------------------------------------------------------------------
        | WHAT DID THE TRIGGER DO?
        |----------------------------------------------------------------------
        |
        | Now that the transaction has COMMITted, anything in notifications
        | above the id we noted earlier was inserted by the trigger. There is no
        | INSERT INTO notifications anywhere in this controller - if a row comes
        | back here, the database created it by itself.
        |
        | This is only read so the admin page can confirm the owner was told.
        | Resolving is the only status the trigger reacts to, so for Pending,
        | Rejected or Escalated this correctly comes back empty.
        */
        $notification = DB::selectOne(
            "SELECT
                 notifications.id,
                 notifications.user_id,
                 notifications.title,
                 notifications.message,
                 notifications.created_at,
                 users.name  AS user_name,
                 users.email AS user_email
             FROM notifications
             JOIN users ON users.id = notifications.user_id
             WHERE notifications.id > ?
               AND notifications.user_id = ?
             ORDER BY notifications.id DESC
             LIMIT 1",
            [$notificationsBefore, $complaint->user_id]
        );

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
            // null unless the trigger fired.
            'notification' => $notification,
        ]);
    }

    /**
     * NOTIFICATION FEED  ->  GET /api/admin/notifications
     *
     * What the admin bell shows.
     *
     * This is deliberately NOT the same as GET /api/notifications. That one is
     * "my own notifications" (WHERE user_id = me), and for an admin it is
     * always empty - the complaint trigger notifies the person who FILED the
     * complaint, never the admin who resolved it.
     *
     * So this is an oversight view: the notifications the system has generated
     * for everyone, newest first, each one showing who received it.
     */
    public function notifications()
    {
        /*
        | JOIN, not LEFT JOIN. notifications.user_id is NOT NULL with a foreign
        | key, so every notification is guaranteed to have a recipient.
        |
        | LIMIT 20 because this feeds a small dropdown - there is no reason to
        | send the whole table to the browser and throw most of it away.
        */
        $notifications = DB::select(
            "SELECT
                 notifications.id,
                 notifications.title,
                 notifications.message,
                 notifications.is_read,
                 notifications.created_at,
                 users.id    AS user_id,
                 users.name  AS user_name,
                 users.email AS user_email
             FROM notifications
             JOIN users ON users.id = notifications.user_id
             ORDER BY notifications.created_at DESC, notifications.id DESC
             LIMIT 20"
        );

        // Drives the red dot. COUNT in SQL rather than counting in JavaScript,
        // because the list above is capped at 20 and the true unread total may
        // be larger.
        $unread = DB::selectOne(
            "SELECT COUNT(*) AS total FROM notifications WHERE is_read = 0"
        )->total;

        return response()->json([
            'message'       => 'Notifications fetched successfully.',
            'count'         => count($notifications),
            'unread'        => (int) $unread,
            'notifications' => $notifications,
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
