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
                 users.role  AS user_role
             FROM complaints
             JOIN users ON users.id = complaints.user_id
             WHERE complaints.id = ?",
            [$id]
        );

        if (! $complaint) {
            return response()->json(['message' => 'Complaint not found.'], 404);
        }

        return response()->json(['complaint' => $complaint]);
    }

    /**
     * CHANGE STATUS  ->  PUT /api/admin/complaints/{id}
     *
     * This is the whole point of the admin page: reviewing a complaint and
     * marking it Resolved or Rejected.
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

        $exists = DB::selectOne("SELECT id FROM complaints WHERE id = ?", [$id]);

        if (! $exists) {
            return response()->json(['message' => 'Complaint not found.'], 404);
        }

        /*
        |     UPDATE complaints SET status = ? WHERE id = ?;
        |
        | The WHERE is the important half. Without it every complaint in the
        | table would be set to the same status, and there is no undo.
        */
        DB::update(
            "UPDATE complaints SET status = ?, updated_at = NOW() WHERE id = ?",
            [$validated['status'], $id]
        );

        return response()->json([
            'message'   => 'Complaint marked as ' . $validated['status'] . '.',
            // Read the row back so the response shows what is actually stored.
            'complaint' => DB::selectOne(
                "SELECT complaints.*, users.name AS user_name, users.email AS user_email
                 FROM complaints
                 JOIN users ON users.id = complaints.user_id
                 WHERE complaints.id = ?",
                [$id]
            ),
        ]);
    }
}
