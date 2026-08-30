<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;

/*
|==============================================================================
| REPORT CONTROLLER   (issue #42)
|==============================================================================
|
| Every query in this file is a REPORT: it does not list rows, it SUMMARISES
| them. That is what aggregate functions are for.
|
| The three building blocks used throughout:
|
|   COUNT(*)     how many rows
|   GROUP BY     split the rows into buckets, then aggregate each bucket
|   JOIN         pull in a name from another table so the report is readable
|
| THE GOLDEN RULE OF GROUP BY
|
|     every column in the SELECT must either appear in the GROUP BY,
|     or be wrapped in an aggregate function.
|
| Why: after grouping, one output row stands for MANY input rows. Asking for
| a plain column that differs between them has no single answer.
|
| A NOTE ON THE TWO status COLUMNS - they are spelled differently:
|
|     applications.status  ENUM('pending','approved','rejected')   lowercase
|     complaints.status    ENUM('Pending','Resolved','Rejected')   capitalised
|
| That inconsistency comes from two people building two tables. The queries
| below match each one exactly, because 'Pending' would never match 'pending'.
|
*/
class ReportController extends Controller
{
    /**
     * GET /api/admin/reports
     *
     * Returns every report in one response, so the page makes one request
     * instead of seven.
     */
    public function index()
    {
        return response()->json([
            'message' => 'Reports generated successfully.',
            'reports' => [
                'overview'            => $this->overview(),
                'pets_per_shelter'    => $this->petsPerShelter(),
                'pets_by_status'      => $this->petsByStatus(),
                'pets_by_type'        => $this->petsByType(),
                'applications_by_status' => $this->applicationsByStatus(),
                'applications_by_day' => $this->applicationsByDay(),
                'complaints_by_category' => $this->complaintsByCategory(),
                'busiest_shelters'    => $this->busiestShelters(),
            ],
        ]);
    }

    /**
     * The headline totals.
     *
     * One query, one subquery per number - so one trip to the database
     * instead of six.
     */
    private function overview()
    {
        return DB::selectOne(
            "SELECT
                 (SELECT COUNT(*) FROM shelters)     AS total_shelters,
                 (SELECT COUNT(*) FROM pets)         AS total_pets,
                 (SELECT COUNT(*) FROM users)        AS total_users,
                 (SELECT COUNT(*) FROM applications) AS total_applications,

                 -- lowercase 'approved': that is how the applications ENUM
                 -- spells it
                 (SELECT COUNT(*) FROM applications WHERE status = 'approved')
                     AS total_adoptions,

                 -- capital 'Pending': the complaints ENUM spells it this way
                 (SELECT COUNT(*) FROM complaints WHERE status = 'Pending')
                     AS pending_complaints"
        );
    }

    /**
     * How many pets does each shelter hold?
     *
     *     shelters  LEFT JOIN  pets  ->  GROUP BY shelter  ->  COUNT
     */
    private function petsPerShelter()
    {
        /*
        | TWO THINGS HERE ARE EASY TO GET WRONG.
        |
        | 1. LEFT JOIN, not JOIN.
        |    A shelter with no pets yet must still appear in the report,
        |    showing 0. A plain JOIN would silently drop it, and an empty
        |    shelter is exactly the thing a manager wants to notice.
        |
        | 2. COUNT(pets.id), not COUNT(*).
        |    For a shelter with no pets the LEFT JOIN still produces one row,
        |    filled with NULLs. COUNT(*) counts that row and wrongly reports 1.
        |    COUNT(column) skips NULLs and correctly reports 0.
        |
        | SUM(condition) counts matches: in MySQL a comparison is 1 when true
        | and 0 when false, so summing them gives a count of the trues.
        */
        return DB::select(
            "SELECT
                 shelters.id,
                 shelters.name,
                 shelters.location,
                 COUNT(pets.id)                              AS total_pets,
                 SUM(pets.status = 'available')              AS available_pets,
                 SUM(pets.status = 'adopted')                AS adopted_pets
             FROM shelters
             LEFT JOIN pets ON pets.shelter_id = shelters.id
             GROUP BY shelters.id, shelters.name, shelters.location
             ORDER BY total_pets DESC, shelters.name"
        );
    }

    /**
     * Pets split by status: available / pending / adopted.
     */
    private function petsByStatus()
    {
        return DB::select(
            "SELECT status, COUNT(*) AS total
             FROM pets
             GROUP BY status
             ORDER BY total DESC"
        );
    }

    /**
     * Pets split by type (Dog, Cat, ...).
     */
    private function petsByType()
    {
        return DB::select(
            "SELECT type, COUNT(*) AS total
             FROM pets
             GROUP BY type
             ORDER BY total DESC"
        );
    }

    /**
     * Adoption applications split by outcome.
     */
    private function applicationsByStatus()
    {
        return DB::select(
            "SELECT status, COUNT(*) AS total
             FROM applications
             GROUP BY status
             ORDER BY total DESC"
        );
    }

    /**
     * Applications per day for the last 30 days.
     */
    private function applicationsByDay()
    {
        /*
        | GROUPING BY A DATE
        |
        | created_at is a TIMESTAMP, accurate to the second. Grouping by it
        | directly would put two applications made one second apart into
        | different buckets - you would get one row per application, which is
        | not a report at all.
        |
        | DATE(created_at) throws the time away and keeps only the day, so
        | everything from the same day groups together.
        |
        | The WHERE limits it to the last 30 days:
        |     DATE_SUB(NOW(), INTERVAL 30 DAY)   =   "30 days before now"
        |
        | Filtering BEFORE grouping is deliberate. WHERE runs first and throws
        | old rows away, so MySQL groups a smaller set. (HAVING is the filter
        | that runs AFTER grouping, for conditions on the aggregate itself.)
        */
        return DB::select(
            "SELECT
                 DATE(created_at) AS day,
                 COUNT(*)         AS total
             FROM applications
             WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
             GROUP BY DATE(created_at)
             ORDER BY day"
        );
    }

    /**
     * Complaints split by category, with how many are still open.
     */
    private function complaintsByCategory()
    {
        return DB::select(
            "SELECT
                 category,
                 COUNT(*)                       AS total,
                 SUM(status = 'Pending')        AS still_pending
             FROM complaints
             GROUP BY category
             ORDER BY total DESC"
        );
    }

    /**
     * Which shelters actually rehome the most animals?
     *
     * This is the widest query in the project: THREE tables joined together.
     *
     *     shelters  ->  pets  ->  applications
     *
     * Read the chain as: for each shelter, find its pets, then find the
     * applications for those pets, then count the approved ones.
     */
    private function busiestShelters()
    {
        /*
        | Both joins are LEFT so a shelter with no pets, or with pets but no
        | applications, still appears with zeros rather than vanishing.
        |
        | COUNT(DISTINCT pets.id) is important. Joining three tables multiplies
        | rows: a shelter with 2 pets and 3 applications each produces 6 rows.
        | A plain COUNT(pets.id) would then report 6 pets instead of 2.
        | DISTINCT counts each pet id once, however many times it was repeated
        | by the join.
        |
        | HAVING filters AFTER grouping, which is the difference from WHERE.
        | You cannot write "WHERE COUNT(*) > 0" because at WHERE time the
        | groups do not exist yet. Here we keep only shelters that have at
        | least one pet.
        */
        return DB::select(
            "SELECT
                 shelters.id,
                 shelters.name,
                 COUNT(DISTINCT pets.id)         AS pets_listed,
                 COUNT(applications.id)          AS applications_received,
                 SUM(applications.status = 'approved') AS adoptions_completed
             FROM shelters
             LEFT JOIN pets         ON pets.shelter_id = shelters.id
             LEFT JOIN applications ON applications.pet_id = pets.id
             GROUP BY shelters.id, shelters.name
             HAVING pets_listed > 0
             ORDER BY adoptions_completed DESC, applications_received DESC
             LIMIT 10"
        );
    }
}
