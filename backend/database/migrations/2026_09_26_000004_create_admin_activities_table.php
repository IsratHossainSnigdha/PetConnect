<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/*
|==============================================================================
| ADMIN ACTIVITY / AUDIT TABLE                    (issue #64)
|==============================================================================
|
| One row per action an admin takes. The complaints table only remembers the
| CURRENT state of a complaint; this table remembers the HISTORY of what was
| done to it, which is what an audit trail is.
|
| It is the second half of the transaction in Admin\ComplaintController@update:
| resolving a complaint writes to complaints AND writes a row here, and either
| both happen or neither does.
|
*/
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('admin_activities', function (Blueprint $table) {
            $table->id();

            /*
            | WHY BOTH FOREIGN KEYS ARE nullOnDelete() AND NOT cascadeOnDelete()
            |
            | An audit trail whose rows disappear is not an audit trail. If the
            | complaint is deleted, or the admin's account is removed, we still
            | want the record that the action happened - so those columns go to
            | NULL and the row survives.
            |
            | That is the opposite choice from complaints.user_id, which IS
            | cascadeOnDelete: a complaint is meaningless without the person who
            | filed it, but a log entry is still meaningful on its own.
            */
            $table->foreignId('admin_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->foreignId('complaint_id')
                ->nullable()
                ->constrained('complaints')
                ->nullOnDelete();

            // What happened, as a short machine-readable tag, e.g.
            // 'complaint_resolved' or 'complaint_rejected'.
            $table->string('action');

            // A human-readable sentence, for showing in the UI.
            $table->text('details')->nullable();

            $table->timestamps();

            /*
            | The activity list is always read newest-first:
            |
            |     ORDER BY created_at DESC
            |
            | Without an index MySQL would have to read every row and sort them
            | all. With one it can walk the index backwards and stop early.
            */
            $table->index('created_at');

            // "Show me everything done to complaint #12" is the other common
            // question, so that column gets an index too.
            $table->index('complaint_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('admin_activities');
    }
};
