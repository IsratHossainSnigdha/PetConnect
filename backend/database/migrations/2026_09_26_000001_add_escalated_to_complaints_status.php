<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/*
|==============================================================================
| ADD 'Escalated' TO complaints.status          (issue: escalate old complaints)
|==============================================================================
|
| The column started life as:
|
|     status ENUM('Pending', 'Resolved', 'Rejected')
|
| An ENUM is a fixed list. MySQL stores the value as a small number internally
| (Pending = 1, Resolved = 2, Rejected = 3) and REFUSES anything outside the
| list, which is exactly why it is a good choice for a status column - a typo
| like 'pendng' is rejected by the database instead of silently saved.
|
| But it also means we cannot just start writing 'Escalated'. The list itself
| has to be changed first, or the escalation procedure fails with:
|
|     Data truncated for column 'status' at row 1
|
| There is no "ADD VALUE" command in MySQL. To change an ENUM you restate the
| whole list with MODIFY COLUMN, so the old three values are repeated below on
| purpose - leaving one out would wipe those rows.
|
| Existing rows are untouched: their stored numbers still point at the same
| names because we ADDED to the end of the list rather than reordering it.
| That ordering matters. Had we written ENUM('Escalated','Pending',...) every
| existing 'Pending' row would suddenly read 'Escalated'.
|
*/
return new class extends Migration
{
    public function up(): void
    {
        // Laravel's schema builder cannot change an ENUM without an extra
        // package, so this is plain SQL sent straight to MySQL.
        DB::statement(
            "ALTER TABLE complaints
             MODIFY COLUMN status
             ENUM('Pending', 'Resolved', 'Rejected', 'Escalated')
             NOT NULL DEFAULT 'Pending'"
        );
    }

    public function down(): void
    {
        // Going back means the value 'Escalated' would no longer be legal, so
        // any row still holding it has to be put back to 'Pending' FIRST.
        // Shrink the list while such a row exists and MySQL silently turns it
        // into an empty string.
        DB::update(
            "UPDATE complaints SET status = 'Pending' WHERE status = 'Escalated'"
        );

        DB::statement(
            "ALTER TABLE complaints
             MODIFY COLUMN status
             ENUM('Pending', 'Resolved', 'Rejected')
             NOT NULL DEFAULT 'Pending'"
        );
    }
};
