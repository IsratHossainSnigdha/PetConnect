<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/*
|--------------------------------------------------------------------------
| MIGRATION: record WHEN the password was last changed
|--------------------------------------------------------------------------
|
| The profile page says "Last changed 30 days ago", but nothing in the
| database recorded that - it was a hard-coded string. One nullable TIMESTAMP
| column makes it a real fact.
|
| WHY NOT REUSE users.updated_at?
| updated_at changes on EVERY write to the row - editing your phone number
| would make it look as though you had just changed your password. A separate
| column is the only way to answer a separate question.
|
| WHY NULLABLE?
| Accounts that already exist have never changed their password through this
| feature, and we must not invent a date for them. NULL means "genuinely
| unknown", which is different from any date we could make up. The UI shows
| the account's created_at as a fallback instead.
|
| NOTE: this stores only a TIMESTAMP, never any password history. Keeping old
| password hashes around would be a liability with no benefit here.
|
*/
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->timestamp('password_changed_at')->nullable()->after('password');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('password_changed_at');
        });
    }
};
