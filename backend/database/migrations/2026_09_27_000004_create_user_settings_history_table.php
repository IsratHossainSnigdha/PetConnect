<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/*
|==============================================================================
| SETTINGS CHANGE HISTORY
|==============================================================================
|
| user_settings only remembers what the settings are RIGHT NOW. This table
| remembers what they USED to be - one row per change, written automatically by
| the trigger trg_log_user_settings_change.
|
| It answers "when did this get switched off, and what was it before?", which
| the settings table alone cannot.
|
| Nothing in PHP writes to this table. The trigger is the only author.
|
*/
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_settings_history', function (Blueprint $table) {
            $table->id();

            /*
            | nullOnDelete, not cascade.
            |
            | A history row is still meaningful after the user is gone - that
            | is the whole point of a history. Compare user_settings itself,
            | which IS cascadeOnDelete because current preferences for a
            | deleted user mean nothing.
            */
            $table->foreignId('user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            // Which setting changed, e.g. 'email_notifications'.
            $table->string('setting_name');

            // Stored as text so one table can hold booleans, strings and
            // anything added later without a schema change.
            $table->string('old_value')->nullable();
            $table->string('new_value')->nullable();

            $table->timestamp('changed_at')->useCurrent();

            // "Show me this user's changes, newest first" is the only question
            // this table gets asked, so that is what the index serves.
            $table->index(['user_id', 'changed_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_settings_history');
    }
};
