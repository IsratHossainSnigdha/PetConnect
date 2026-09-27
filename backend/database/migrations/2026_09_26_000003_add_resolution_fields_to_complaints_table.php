<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/*
|==============================================================================
| WHO RESOLVED THE COMPLAINT, AND WHEN            (issue #64)
|==============================================================================
|
| The complaints table already stores a status, but not who changed it. Once an
| admin resolves a complaint we want to be able to answer "who closed this, and
| when?" without digging through a log.
|
|     resolved_by  ->  users.id of the admin who did it
|     resolved_at  ->  the moment they did it
|
| Both are NULLABLE, because a complaint that is still Pending has not been
| resolved by anyone yet. NULL here means "has not happened", which is exactly
| what NULL is for.
|
*/
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('complaints', function (Blueprint $table) {
            /*
            | nullOnDelete() means: if that admin's account is ever deleted,
            | set this column back to NULL instead of deleting the complaint.
            |
            | The alternative, cascadeOnDelete(), would delete the whole
            | complaint when the admin who resolved it leaves - destroying a
            | user's complaint because of something an admin did. The question
            | to ask is always "does this row still mean anything once its
            | parent is gone?" A resolved complaint still means something, so
            | SET NULL is correct.
            */
            $table->foreignId('resolved_by')
                ->nullable()
                ->after('status')
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamp('resolved_at')
                ->nullable()
                ->after('resolved_by');
        });
    }

    public function down(): void
    {
        Schema::table('complaints', function (Blueprint $table) {
            // The foreign key has to go before the column it is attached to,
            // or MySQL refuses to drop the column.
            $table->dropForeign(['resolved_by']);
            $table->dropColumn(['resolved_by', 'resolved_at']);
        });
    }
};
