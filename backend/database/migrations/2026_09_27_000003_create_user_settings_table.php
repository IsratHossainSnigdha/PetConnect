<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/*
|==============================================================================
| USER SETTINGS
|==============================================================================
|
| The settings page currently keeps its choices in the browser's localStorage,
| which means they live on ONE device and vanish when the browser is cleared.
| This table moves them into the database, so a user gets the same settings on
| any machine they sign in from.
|
| ONE ROW PER USER
|
|   The unique index on user_id is what enforces that. Without it a bug could
|   quietly create a second settings row for the same person, and then "which
|   one is right?" has no answer. The database refuses instead.
|
*/
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_settings', function (Blueprint $table) {
            $table->id();

            /*
            | cascadeOnDelete here, unlike the audit tables.
            |
            | The question is always "does this row still mean anything once
            | its parent is gone?" A deleted user's preferences mean nothing to
            | anyone, so they should go too. Compare admin_activities, where
            | the row IS still meaningful and uses nullOnDelete.
            */
            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();

            // The four toggles on the settings page. Defaults match what the
            // page shows a brand new user.
            $table->boolean('email_notifications')->default(true);
            $table->boolean('adoption_alerts')->default(true);
            $table->boolean('public_profile')->default(true);
            $table->boolean('dark_mode')->default(false);

            $table->string('language')->default('English');

            $table->timestamps();

            // One settings row per user - see the note at the top.
            $table->unique('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_settings');
    }
};
