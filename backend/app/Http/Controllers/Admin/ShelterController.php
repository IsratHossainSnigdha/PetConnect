<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/*
|==============================================================================
| ADMIN SHELTER CONTROLLER  -  the four database operations, in raw SQL
|==============================================================================
|
| Every database application is built from four operations, called CRUD. They
| map onto SQL, onto HTTP methods, and onto the methods in this file:
|
|   WHAT        SQL       HTTP     URL                    METHOD HERE
|   ---------   -------   ------   --------------------   -----------
|   Create      INSERT    POST     /api/admin/shelters    store()
|   Read (all)  SELECT    GET      /api/admin/shelters    index()
|   Read (one)  SELECT    GET      /api/admin/shelters/5  show()
|   Update      UPDATE    PUT      /api/admin/shelters/5  update()
|   Delete      DELETE    DELETE   /api/admin/shelters/5  destroy()
|
| Notice the URL never contains a verb like "/deleteShelter". The HTTP METHOD
| is the verb and the URL is the NOUN. That convention is what makes an API
| "RESTful".
|
|------------------------------------------------------------------------------
| WHY THE "?" MARKS IN EVERY QUERY
|------------------------------------------------------------------------------
|
| Never paste user input into a query string:
|
|     BAD:   "SELECT * FROM shelters WHERE name = '$name'"
|
| If someone types    ' OR '1'='1
| the query becomes   WHERE name = '' OR '1'='1'     -> returns EVERY row.
| That attack is called SQL INJECTION.
|
| Writing ? and passing the value separately makes MySQL treat it as pure
| text, never as commands. This is a PREPARED STATEMENT.
|
*/
class ShelterController extends Controller
{
    /**
     * READ ALL  ->  GET /api/admin/shelters
     *
     * Powers the "Shelter Management" table in the admin dashboard.
     */
    public function index(Request $request)
    {
        /*
        |----------------------------------------------------------------------
        | A CORRELATED SUBQUERY - counting staff per shelter
        |----------------------------------------------------------------------
        |
        | We want each shelter AND how many staff accounts belong to it.
        |
        | The subquery in the SELECT list runs once per shelter row, counting
        | the users whose shelter_id matches that shelter's id. It is called
        | "correlated" because it refers to the outer query (shelters.id).
        |
        | This is the fix for the classic "N+1 query problem": the naive way is
        | to fetch 100 shelters and then run one COUNT per shelter inside a
        | loop, which is 101 separate trips to the database. This does the
        | whole job in ONE.
        */
        /*
        |----------------------------------------------------------------------
        | THE JOIN  (issue #17)
        |----------------------------------------------------------------------
        |
        | shelters.admin_id only stores a NUMBER - say 3. Nobody wants to read
        | "admin_id: 3"; they want "Tashrik Halim, admin@petconnect.com".
        |
        | A JOIN glues the users table on so we can show those words:
        |
        |     LEFT JOIN users ON users.id = shelters.admin_id
        |                 ^              ^                ^
        |            table to add   its key      matches this column
        |
        | IT MUST BE A *LEFT* JOIN, NOT A PLAIN ONE.
        |
        | A plain (INNER) JOIN keeps only rows where a match is found. A
        | shelter with no admin assigned has admin_id = NULL, which matches
        | nothing - so an inner JOIN would make those shelters VANISH from the
        | admin's list entirely. LEFT JOIN keeps every shelter and simply
        | leaves the admin columns NULL when there is nobody assigned.
        |
        | "AS" renames the columns because BOTH tables have a column called
        | `name`. Without renaming, users.name would overwrite shelters.name in
        | the result and every shelter would appear to be called "Tashrik".
        */
        $sql = "SELECT
                    shelters.*,
                    admins.id    AS admin_id,
                    admins.name  AS admin_name,
                    admins.email AS admin_email,
                    admins.phone AS admin_phone,
                    (SELECT COUNT(*) FROM users
                     WHERE users.shelter_id = shelters.id) AS staff_count
                FROM shelters
                LEFT JOIN users AS admins ON admins.id = shelters.admin_id
                WHERE 1 = 1";

        /*
        | "users AS admins" gives the table a nickname (an ALIAS) for this
        | query. It is not required here, but it makes the SELECT read as
        | "admins.name" instead of "users.name", which is much clearer when
        | the same users table could be joined for several different reasons.
        */

        /*
        | "WHERE 1 = 1" is always true, so it changes nothing - but it lets
        | every optional filter below simply bolt " AND ..." onto the end,
        | instead of us tracking which condition is the first one and needs
        | the word WHERE rather than AND.
        */

        $params = [];   // the values that will fill in each ?

        // ---- optional: ?search=paws ---------------------------------------
        if ($request->query('search')) {

            /*
            | The brackets around the three OR conditions are essential.
            |
            | Without them, SQL operator precedence reads this as
            |     WHERE status = 'active' AND name LIKE ... OR location LIKE ...
            | which leaks inactive shelters into the results. The brackets keep
            | the OR group together:
            |     WHERE status = 'active' AND (name LIKE ... OR location LIKE ...)
            */
            $sql .= " AND (shelters.name LIKE ?
                        OR shelters.location LIKE ?
                        OR shelters.contact_email LIKE ?)";

            // % is the SQL wildcard, so '%paws%' matches "Paws Rescue"
            // and "Happy Paws" alike. The same value is needed three times.
            $like = '%' . $request->query('search') . '%';
            $params[] = $like;
            $params[] = $like;
            $params[] = $like;
        }

        // ---- optional: ?status=active -------------------------------------
        if ($request->query('status')) {
            // This is the comparison the index on `status` speeds up.
            $sql .= " AND shelters.status = ?";
            $params[] = $request->query('status');
        }

        // Newest shelters at the top of the table.
        $sql .= " ORDER BY shelters.created_at DESC";

        $shelters = DB::select($sql, $params);

        return response()->json([
            'message'  => 'Shelters fetched successfully.',
            'count'    => count($shelters),
            'shelters' => $shelters,
        ]);
    }

    /**
     * CREATE  ->  POST /api/admin/shelters
     */
    public function store(Request $request)
    {
        // STEP 1: validate BEFORE touching the database. If this fails,
        // Laravel returns 422 with the messages and nothing is written.
        $validated = $request->validate([
            'name'          => ['required', 'string', 'max:255'],
            'location'      => ['required', 'string', 'max:255'],
            'contact_email' => ['required', 'email', 'max:255'],
            'contact_phone' => ['required', 'regex:/^(?:\+88|01)?\d{11}$/'],
            'status'        => ['required', 'in:active,pending,inactive'],

            // The shelter's assigned admin (issue #17). nullable = "not assigned yet".
            // exists:users,id makes the database confirm the id is real before we
            // try to store it, so we return a clear message instead of a raw
            // foreign-key error.
            'admin_id'      => ['nullable', 'integer', 'exists:users,id'],
        ]);

        /*
        | STEP 2: check the UNIQUE columns by hand.
        |
        | The database has UNIQUE indexes on name and contact_email, so a
        | duplicate is impossible either way - but MySQL would throw a raw
        | error. Asking first lets us return a friendly per-field message that
        | the React form can show next to the right input.
        */
        $duplicate = DB::selectOne(
            "SELECT
                 SUM(name = ?)          AS name_taken,
                 SUM(contact_email = ?) AS email_taken
             FROM shelters",
            [$validated['name'], $validated['contact_email']]
        );

        /*
        | SUM(name = ?) is a neat trick: in MySQL a comparison produces 1 when
        | true and 0 when false, so summing them counts the matches. It lets us
        | check both columns in a single query instead of two.
        */
        $errors = [];
        if ($duplicate->name_taken > 0)  { $errors['name'] = ['The name has already been taken.']; }
        if ($duplicate->email_taken > 0) { $errors['contact_email'] = ['The contact email has already been taken.']; }

        if ($errors) {
            return response()->json([
                'message' => 'The given data was invalid.',
                'errors'  => $errors,
            ], 422);
        }

        /*
        | STEP 3: the INSERT.
        |
        |     INSERT INTO table (columns...) VALUES (values...);
        |
        | The column list and the value list must line up in the same order.
        | NOW() is a MySQL function giving the current date and time - we set
        | created_at and updated_at by hand, because raw SQL has nothing doing
        | it for us.
        */
        DB::insert(
            "INSERT INTO shelters
                (name, location, contact_email, contact_phone, status, admin_id, created_at, updated_at)
             VALUES
                (?, ?, ?, ?, ?, ?, NOW(), NOW())",
            [
                $validated['name'],
                $validated['location'],
                $validated['contact_email'],
                $validated['contact_phone'],
                $validated['status'],

                // ?? null turns a missing field into a real SQL NULL, which is
                // how we store "no admin assigned yet".
                $validated['admin_id'] ?? null,
            ]
        );

        // getPdo()->lastInsertId() returns the id MySQL just generated for the
        // AUTO_INCREMENT column, so we can read the finished row back.
        $newId = DB::getPdo()->lastInsertId();

        $shelter = DB::selectOne("SELECT * FROM shelters WHERE id = ?", [$newId]);

        // 201 means "a new row now exists", as opposed to a plain 200 OK.
        return response()->json([
            'message' => 'Shelter created successfully.',
            'shelter' => $shelter,
        ], 201);
    }

    /**
     * READ ONE  ->  GET /api/admin/shelters/{id}
     */
    public function show($id)
    {
        // The same LEFT JOIN as the list, so the View panel also shows who
        // manages this shelter.
        $shelter = DB::selectOne(
            "SELECT
                 shelters.*,
                 admins.id    AS admin_id,
                 admins.name  AS admin_name,
                 admins.email AS admin_email,
                 admins.phone AS admin_phone
             FROM shelters
             LEFT JOIN users AS admins ON admins.id = shelters.admin_id
             WHERE shelters.id = ?",
            [$id]
        );

        if (! $shelter) {
            return response()->json(['message' => 'Shelter not found.'], 404);
        }

        /*
        | Fetch the staff belonging to this shelter.
        |
        | We list the columns explicitly rather than using SELECT *. Asking for
        | only what you need keeps the result small, and here it also avoids
        | sending password hashes across the network.
        */
        $shelter->staff = DB::select(
            "SELECT id, name, email, phone, role
             FROM users
             WHERE shelter_id = ?
             ORDER BY name",
            [$id]
        );

        return response()->json([
            'message' => 'Shelter fetched successfully.',
            'shelter' => $shelter,
        ]);
    }

    /**
     * UPDATE  ->  PUT /api/admin/shelters/{id}
     */
    public function update(Request $request, $id)
    {
        $exists = DB::selectOne("SELECT id FROM shelters WHERE id = ?", [$id]);

        if (! $exists) {
            return response()->json(['message' => 'Shelter not found.'], 404);
        }

        $validated = $request->validate([
            'name'          => ['required', 'string', 'max:255'],
            'location'      => ['required', 'string', 'max:255'],
            'contact_email' => ['required', 'email', 'max:255'],
            'contact_phone' => ['required', 'regex:/^(?:\+88|01)?\d{11}$/'],
            'status'        => ['required', 'in:active,pending,inactive'],

            // The shelter's assigned admin (issue #17). nullable = "not assigned yet".
            // exists:users,id makes the database confirm the id is real before we
            // try to store it, so we return a clear message instead of a raw
            // foreign-key error.
            'admin_id'      => ['nullable', 'integer', 'exists:users,id'],
        ]);

        /*
        | THE CLASSIC UPDATE TRAP.
        |
        | Checking "is this name taken?" the same way as on create would reject
        | the shelter's OWN name - because a row with that name does exist:
        | itself. Editing only the phone number would fail with "name taken".
        |
        | The fix is the extra condition   AND id <> ?   which means
        | "ignore my own row". <> is SQL for "not equal to".
        */
        $duplicate = DB::selectOne(
            "SELECT
                 SUM(name = ?)          AS name_taken,
                 SUM(contact_email = ?) AS email_taken
             FROM shelters
             WHERE id <> ?",
            [$validated['name'], $validated['contact_email'], $id]
        );

        $errors = [];
        if ($duplicate->name_taken > 0)  { $errors['name'] = ['The name has already been taken.']; }
        if ($duplicate->email_taken > 0) { $errors['contact_email'] = ['The contact email has already been taken.']; }

        if ($errors) {
            return response()->json([
                'message' => 'The given data was invalid.',
                'errors'  => $errors,
            ], 422);
        }

        /*
        | THE UPDATE.
        |
        | THE WHERE IS THE MOST IMPORTANT PART OF THIS QUERY.
        | Leave it off and you rewrite every row in the table:
        |
        |     UPDATE shelters SET status = 'inactive';   <- ALL shelters
        |
        | There is no undo. Write the WHERE first, then fill in the SET.
        */
        DB::update(
            "UPDATE shelters SET
                 name          = ?,
                 location      = ?,
                 contact_email = ?,
                 contact_phone = ?,
                 status        = ?,
                 admin_id      = ?,
                 updated_at    = NOW()
             WHERE id = ?",
            [
                $validated['name'],
                $validated['location'],
                $validated['contact_email'],
                $validated['contact_phone'],
                $validated['status'],

                // Sending admin_id as null here also UNASSIGNS an admin,
                // which is how the "-- No admin assigned --" option works.
                $validated['admin_id'] ?? null,

                $id,
            ]
        );

        return response()->json([
            'message' => 'Shelter updated successfully.',
            // Read the row back so the response shows exactly what is stored,
            // including the updated_at that MySQL just generated.
            'shelter' => DB::selectOne("SELECT * FROM shelters WHERE id = ?", [$id]),
        ]);
    }

    /**
     * DELETE  ->  DELETE /api/admin/shelters/{id}
     */
    public function destroy($id)
    {
        // Count the staff BEFORE deleting, so we can tell the admin how many
        // accounts were affected. Afterwards the information is gone.
        $staff = DB::selectOne(
            "SELECT COUNT(*) AS total FROM users WHERE shelter_id = ?",
            [$id]
        );

        /*
        |     DELETE FROM shelters WHERE id = ?;
        |
        | We do NOT clear users.shelter_id by hand. The foreign key was created
        | with ON DELETE SET NULL, so MySQL runs
        |     UPDATE users SET shelter_id = NULL WHERE shelter_id = ?
        | as part of the same statement.
        |
        | That choice was deliberate: removing a shelter from the platform must
        | not silently destroy people's login accounts. Letting the DATABASE
        | enforce the rule is safer than remembering to write it in PHP every
        | time.
        |
        | DB::delete() returns how many rows it removed, so 0 means "no such
        | shelter".
        */
        $deleted = DB::delete("DELETE FROM shelters WHERE id = ?", [$id]);

        if ($deleted === 0) {
            return response()->json(['message' => 'Shelter not found.'], 404);
        }

        return response()->json([
            'message'        => 'Shelter deleted successfully.',
            'affected_staff' => $staff->total,
        ]);
    }

    /**
     * LIST ADMINS  ->  GET /api/admin/admins        (issue #17)
     *
     * Fills the "Assigned Admin" dropdown on the add/edit form. Without this
     * the admin would have to type a raw id number, which nobody should be
     * asked to do.
     */
    public function admins()
    {
        /*
        | Only platform admins can be assigned to a shelter, so we filter on
        | the role column:
        |
        |     SELECT id, name, email FROM users
        |     WHERE role = 'platform_admin'
        |     ORDER BY name;
        |
        | We ask for three columns rather than SELECT *, because the dropdown
        | needs nothing else - and it keeps password hashes off the network.
        |
        | The correlated subquery counts how many shelters each admin already
        | manages, so the dropdown can show "Tashrik Halim (2 shelters)" and
        | the workload is visible before assigning another one.
        */
        $admins = DB::select(
            "SELECT
                 users.id,
                 users.name,
                 users.email,
                 (SELECT COUNT(*) FROM shelters
                  WHERE shelters.admin_id = users.id) AS manages_count
             FROM users
             WHERE users.role = 'platform_admin'
             ORDER BY users.name"
        );

        return response()->json([
            'message' => 'Admins fetched successfully.',
            'admins'  => $admins,
        ]);
    }
}
