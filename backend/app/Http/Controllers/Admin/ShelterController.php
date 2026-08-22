<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Shelter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

/*
|--------------------------------------------------------------------------
| ADMIN SHELTER CONTROLLER  -  the four database operations (CRUD)
|--------------------------------------------------------------------------
|
| Every database-driven application is built from exactly four operations.
| They map onto SQL, onto HTTP methods, and onto the methods in this file:
|
|   WHAT        SQL       HTTP VERB   URL                    METHOD HERE
|   ---------   -------   ---------   --------------------   -----------
|   Create      INSERT    POST        /api/admin/shelters    store()
|   Read (all)  SELECT    GET         /api/admin/shelters    index()
|   Read (one)  SELECT    GET         /api/admin/shelters/5  show()
|   Update      UPDATE    PUT         /api/admin/shelters/5  update()
|   Delete      DELETE    DELETE      /api/admin/shelters/5  destroy()
|
| Notice the URL never contains a verb like "/deleteShelter". The HTTP METHOD
| is the verb and the URL is the NOUN (the resource). That convention is what
| makes an API "RESTful".
|
| Each method below returns JSON, because the React admin dashboard - not a
| Blade template - is what renders the screen.
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
        // Shelter::query() starts building a SELECT statement. Nothing has
        // touched MySQL yet - we are just assembling the query in memory.
        $query = Shelter::query()

            // withCount('staff') attaches a "staff_count" number to every row by
            // adding a correlated subquery to the SELECT:
            //
            //   SELECT shelters.*,
            //          (SELECT COUNT(*) FROM users
            //           WHERE users.shelter_id = shelters.id) AS staff_count
            //   FROM shelters;
            //
            // This is the fix for the classic "N+1 query problem". The naive way
            // is to fetch 100 shelters and then call $shelter->staff()->count()
            // inside a loop - that fires 1 + 100 = 101 separate queries at the
            // database. withCount does the whole job in ONE query.
            ->withCount('staff');

        // ---- OPTIONAL FILTER: ?search=paws --------------------------------
        // when() only applies the closure if the value is present, so we do not
        // need an if/else around the query builder.
        $query->when($request->query('search'), function ($q, $search) {
            // The inner function groups the OR conditions inside brackets.
            // Without the grouping, SQL operator precedence would produce
            //     WHERE status = 'active' AND name LIKE ... OR location LIKE ...
            // which leaks inactive shelters into the result. We want
            //     WHERE status = 'active' AND (name LIKE ... OR location LIKE ...)
            $q->where(function ($group) use ($search) {
                // "%" is the SQL wildcard: '%paws%' matches "Paws Rescue"
                // and "Happy Paws" alike.
                $group->where('name', 'LIKE', "%{$search}%")
                      ->orWhere('location', 'LIKE', "%{$search}%")
                      ->orWhere('contact_email', 'LIKE', "%{$search}%");
            });
        });

        // ---- OPTIONAL FILTER: ?status=active ------------------------------
        $query->when($request->query('status'), function ($q, $status) {
            // SQL: AND status = 'active'
            // This is the query our index('status') from the migration speeds up.
            $q->where('status', $status);
        });

        // ORDER BY created_at DESC  -> newest shelters at the top of the table.
        // get() is the moment the query is finally SENT to MySQL and rows come back.
        $shelters = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'message'  => 'Shelters fetched successfully.',
            'count'    => $shelters->count(),
            'shelters' => $shelters,
        ]);
    }

    /**
     * CREATE  ->  POST /api/admin/shelters
     */
    public function store(Request $request)
    {
        // STEP 1: VALIDATE BEFORE YOU TOUCH THE DATABASE.
        // If validation fails Laravel stops here and automatically returns HTTP
        // 422 with a JSON list of errors - the React form reads that and shows
        // the messages. Nothing is written to MySQL.
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                // 'unique:shelters,name' makes Laravel run a checking query:
                //     SELECT COUNT(*) FROM shelters WHERE name = ?
                //
                // IMPORTANT: this does NOT replace the UNIQUE index in the
                // migration - it complements it. Validation gives the user a
                // friendly "name already taken" message; the database
                // constraint is the guarantee that a duplicate can never be
                // stored even if two admins submit at the same instant.
                'unique:shelters,name',
            ],
            'location'      => ['required', 'string', 'max:255'],
            'contact_email' => ['required', 'email', 'max:255', 'unique:shelters,contact_email'],

            // Same phone format the signup pages use: optional +88 or 01 prefix.
            'contact_phone' => ['required', 'regex:/^(?:\+88|01)?\d{11}$/'],

            // Rule::in() mirrors the ENUM in the migration. Keep the two lists
            // identical - if they drift apart, validation passes but the INSERT
            // explodes with a raw SQL error.
            'status'        => ['required', Rule::in(['active', 'pending', 'inactive'])],
        ]);

        // STEP 2: INSERT.
        // create() builds and runs:
        //     INSERT INTO shelters (name, location, contact_email, contact_phone,
        //                           status, created_at, updated_at)
        //     VALUES (?, ?, ?, ?, ?, NOW(), NOW());
        //
        // Those "?" are PREPARED STATEMENT placeholders. The values travel to
        // MySQL separately from the SQL text, so a name like
        //     Robert'); DROP TABLE shelters;--
        // is stored as harmless text instead of being executed. This is how
        // Eloquent makes SQL INJECTION impossible here.
        $shelter = Shelter::create($validated);

        // 201 Created is the correct status code for "a new row now exists",
        // as opposed to a plain 200 OK.
        return response()->json([
            'message' => 'Shelter created successfully.',
            'shelter' => $shelter,
        ], 201);
    }

    /**
     * READ ONE  ->  GET /api/admin/shelters/{shelter}
     *
     * ROUTE MODEL BINDING: because the parameter is type-hinted as Shelter,
     * Laravel reads the {shelter} id out of the URL and runs
     *     SELECT * FROM shelters WHERE id = ? LIMIT 1;
     * before this method even starts. If no row matches, it returns 404
     * automatically and the body below never executes.
     */
    public function show(Shelter $shelter)
    {
        // load() runs the relationship query on demand (lazy loading):
        //     SELECT id, name, email, role FROM users WHERE shelter_id = ?;
        //
        // We list the columns explicitly instead of using SELECT *. Fetching
        // only what you need keeps the result small - and here it also avoids
        // shipping password hashes across the network.
        $shelter->load(['staff' => function ($query) {
            $query->select('id', 'name', 'email', 'phone', 'role', 'shelter_id');
            // shelter_id MUST be in the select list, otherwise Eloquent cannot
            // match the returned users back to their parent shelter.
        }]);

        return response()->json([
            'message' => 'Shelter fetched successfully.',
            'shelter' => $shelter,
        ]);
    }

    /**
     * UPDATE  ->  PUT /api/admin/shelters/{shelter}
     */
    public function update(Request $request, Shelter $shelter)
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                // THE CLASSIC UPDATE TRAP:
                // A plain 'unique:shelters,name' would reject the shelter's OWN
                // name, because a row with that name already exists - itself!
                // Editing only the phone number would fail with "name taken".
                //
                // Rule::unique(...)->ignore($shelter->id) adds an exclusion:
                //     SELECT COUNT(*) FROM shelters WHERE name = ? AND id <> ?
                Rule::unique('shelters', 'name')->ignore($shelter->id),
            ],
            'location'      => ['required', 'string', 'max:255'],
            'contact_email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('shelters', 'contact_email')->ignore($shelter->id),
            ],
            'contact_phone' => ['required', 'regex:/^(?:\+88|01)?\d{11}$/'],
            'status'        => ['required', Rule::in(['active', 'pending', 'inactive'])],
        ]);

        // update() runs:
        //     UPDATE shelters
        //     SET name = ?, location = ?, ..., updated_at = NOW()
        //     WHERE id = ?;
        //
        // The WHERE clause is the important part. A bare "UPDATE shelters SET
        // status = 'inactive'" with no WHERE would rewrite EVERY row in the
        // table. Eloquent always scopes the update to this one primary key.
        $shelter->update($validated);

        return response()->json([
            'message' => 'Shelter updated successfully.',
            // fresh() re-SELECTs the row so the response shows exactly what is
            // now stored - including the database-generated updated_at.
            'shelter' => $shelter->fresh(),
        ]);
    }

    /**
     * DELETE  ->  DELETE /api/admin/shelters/{shelter}
     */
    public function destroy(Shelter $shelter)
    {
        // Remember the count BEFORE deleting, so we can tell the admin how many
        // staff accounts were affected.
        $affectedStaff = $shelter->staff()->count();

        // A TRANSACTION groups several statements so they either ALL succeed or
        // ALL get undone. If the DELETE succeeded but the machine crashed a
        // millisecond later, a transaction guarantees you are never left with a
        // half-finished change.
        //
        // This is the "A" in the ACID properties: ATOMICITY - the whole block
        // behaves as one indivisible operation.
        DB::transaction(function () use ($shelter) {
            // SQL: DELETE FROM shelters WHERE id = ?;
            //
            // We do NOT have to clear users.shelter_id by hand. The foreign key
            // was created with nullOnDelete(), so MySQL itself runs
            //     UPDATE users SET shelter_id = NULL WHERE shelter_id = ?
            // as part of the same statement. Letting the DATABASE enforce this
            // is safer than remembering to do it in PHP every single time.
            $shelter->delete();
        });

        return response()->json([
            'message'        => 'Shelter deleted successfully.',
            'affected_staff' => $affectedStaff,
        ]);
    }
}
