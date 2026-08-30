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
            // The column is ENUM('Pending','Resolved','Rejected') - the value
            // must match exactly, capital letter included.
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
                'pending'  => $counts['Pending']  ?? 0,
                'resolved' => $counts['Resolved'] ?? 0,
                'rejected' => $counts['Rejected'] ?? 0,
            ],
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
            // These three strings are exactly the values the ENUM allows.
            // Keep this list and the migration's ENUM identical - if they
            // drift apart, validation passes and then the UPDATE fails with a
            // raw SQL error.
            'status' => ['required', 'in:Pending,Resolved,Rejected'],
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
