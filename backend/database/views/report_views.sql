-- ============================================================================
-- REPORT VIEWS
-- ============================================================================
--
-- A VIEW is a stored SELECT. It holds no data of its own - every time you read
-- one, MySQL runs the query underneath and gives you fresh rows. Think of it
-- as a saved question rather than a copy of the answer.
--
-- Why the report queries live here instead of in PHP:
--
--   * The SQL is written once. Any caller - this app, a teammate's script, a
--     reporting tool - gets the same numbers, because they all read the same
--     definition.
--   * The controller stops being a place where SQL hides. It becomes
--     SELECT * FROM v_report_x, which is hard to get wrong.
--   * If a rule changes (say "adopted" gets renamed), it is fixed in one
--     place instead of hunted through PHP strings.
--
-- CREATE OR REPLACE means re-running this file just overwrites the old
-- definition, so the migration is safe to run again.
--
-- The lines reading "-- >>>> NEXT VIEW" are separators the migration splits
-- on. They are not SQL.
-- ============================================================================


-- The six headline numbers, as ONE row.
--
-- Each number is a scalar subquery: a SELECT that returns exactly one value,
-- used in place of a column. Six subqueries in one statement means one trip to
-- the database instead of six.
CREATE OR REPLACE VIEW v_report_overview AS
SELECT
    (SELECT COUNT(*) FROM shelters)     AS total_shelters,
    (SELECT COUNT(*) FROM pets)         AS total_pets,
    (SELECT COUNT(*) FROM users)        AS total_users,
    (SELECT COUNT(*) FROM applications) AS total_applications,

    -- lowercase 'approved': that is how the applications ENUM spells it
    (SELECT COUNT(*) FROM applications WHERE status = 'approved')
        AS total_adoptions,

    -- capital 'Pending': the complaints ENUM spells it this way
    (SELECT COUNT(*) FROM complaints WHERE status = 'Pending')
        AS pending_complaints;

-- >>>> NEXT VIEW

-- How many pets each shelter holds.
--
-- LEFT JOIN, not JOIN: a shelter with no pets must still appear showing 0.
-- A plain JOIN would silently drop it, and an empty shelter is exactly what a
-- manager wants to notice.
--
-- COUNT(pets.id), not COUNT(*): for a shelter with no pets the LEFT JOIN still
-- produces one row full of NULLs. COUNT(*) would count that row and report 1.
-- COUNT(column) skips NULLs and correctly reports 0.
--
-- SUM(condition) counts matches - in MySQL a comparison is 1 when true and 0
-- when false, so summing them counts the trues.
CREATE OR REPLACE VIEW v_report_pets_per_shelter AS
SELECT
    shelters.id,
    shelters.name,
    shelters.location,
    COUNT(pets.id)                 AS total_pets,
    SUM(pets.status = 'available') AS available_pets,
    SUM(pets.status = 'adopted')   AS adopted_pets
FROM shelters
LEFT JOIN pets ON pets.shelter_id = shelters.id
GROUP BY shelters.id, shelters.name, shelters.location
ORDER BY total_pets DESC, shelters.name;

-- >>>> NEXT VIEW

-- Pets split by status: available / adopted / ...
CREATE OR REPLACE VIEW v_report_pets_by_status AS
SELECT status, COUNT(*) AS total
FROM pets
GROUP BY status
ORDER BY total DESC;

-- >>>> NEXT VIEW

-- Pets split by type (Dog, Cat, ...).
CREATE OR REPLACE VIEW v_report_pets_by_type AS
SELECT type, COUNT(*) AS total
FROM pets
GROUP BY type
ORDER BY total DESC;

-- >>>> NEXT VIEW

-- Adoption applications split by outcome.
CREATE OR REPLACE VIEW v_report_applications_by_status AS
SELECT status, COUNT(*) AS total
FROM applications
GROUP BY status
ORDER BY total DESC;

-- >>>> NEXT VIEW

-- Applications per day for the last 30 days.
--
-- created_at is a TIMESTAMP, accurate to the second. Grouping by it directly
-- would put two applications made one second apart in different buckets - one
-- row per application, which is not a report at all. DATE() throws the time
-- away so a whole day groups into one row.
--
-- The view is NOT frozen to the day it was created: DATE_SUB(NOW(), ...) is
-- evaluated every time the view is read, so "last 30 days" always means the 30
-- days up to now.
--
-- WHERE runs BEFORE grouping, so old rows are thrown away before MySQL does
-- the work. (HAVING is the filter that runs after grouping.)
CREATE OR REPLACE VIEW v_report_applications_by_day AS
SELECT
    DATE(created_at) AS `day`,
    COUNT(*)         AS total
FROM applications
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY DATE(created_at)
ORDER BY `day`;

-- >>>> NEXT VIEW

-- Complaints split by category, with how many are still open.
CREATE OR REPLACE VIEW v_report_complaints_by_category AS
SELECT
    category,
    COUNT(*)                AS total,
    SUM(status = 'Pending') AS still_pending
FROM complaints
GROUP BY category
ORDER BY total DESC;

-- >>>> NEXT VIEW

-- Which shelters actually rehome the most animals?
--
-- The widest query in the project: THREE tables joined.
--     shelters -> pets -> applications
--
-- Both joins are LEFT so a shelter with no pets, or pets but no applications,
-- still appears with zeros instead of vanishing.
--
-- COUNT(DISTINCT pets.id) matters. Joining three tables multiplies rows: a
-- shelter with 2 pets and 3 applications each produces 6 rows, and a plain
-- COUNT(pets.id) would report 6 pets instead of 2. DISTINCT counts each pet id
-- once however many times the join repeated it.
--
-- HAVING filters AFTER grouping. You cannot write WHERE COUNT(*) > 0, because
-- at WHERE time the groups do not exist yet.
CREATE OR REPLACE VIEW v_report_busiest_shelters AS
SELECT
    shelters.id,
    shelters.name,
    COUNT(DISTINCT pets.id)               AS pets_listed,
    COUNT(applications.id)                AS applications_received,
    SUM(applications.status = 'approved') AS adoptions_completed
FROM shelters
LEFT JOIN pets         ON pets.shelter_id = shelters.id
LEFT JOIN applications ON applications.pet_id = pets.id
GROUP BY shelters.id, shelters.name
HAVING pets_listed > 0
-- shelters.name is a TIEBREAKER, and it is not decoration. Two shelters with
-- the same adoptions and the same applications are equal on both sort keys, and
-- SQL guarantees nothing about the order of rows it considers equal - the same
-- query can return them in a different order on different runs. Ending on a
-- column that is unique makes the report stable.
ORDER BY adoptions_completed DESC, applications_received DESC, shelters.name
LIMIT 10;
