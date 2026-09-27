<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/*
|==============================================================================
| SETTINGS CONTROLLER
|==============================================================================
|
| The settings page used to keep its choices in the browser's localStorage,
| which means they lived on one device and disappeared when the browser was
| cleared. These endpoints move them into the database.
|
| Every route here works on THE LOGGED-IN USER only. The id always comes from
| $request->user()->id - the authenticated session - and never from the
| request body. If it came from the body, anyone could send someone else's id
| and overwrite their settings.
|
| The writing is done by sp_save_user_settings, which owns the validation, the
| INSERT-or-UPDATE decision and the transaction. This controller does not write
| to user_settings at all.
|
*/
class SettingsController extends Controller
{
    /**
     * GET /api/settings
     *
     * The logged-in user's settings.
     */
    public function show(Request $request)
    {
        $userId = $request->user()->id;

        $settings = DB::selectOne(
            "SELECT
                 email_notifications,
                 adoption_alerts,
                 public_profile,
                 dark_mode,
                 language,
                 updated_at
             FROM user_settings
             WHERE user_id = ?",
            [$userId]
        );

        /*
        | A user who has never opened the settings page has no row yet. Rather
        | than returning null and making the page handle a special case, hand
        | back the same defaults the table would have used.
        |
        | Nothing is written here - a GET must not create rows. The row appears
        | the first time they actually save.
        */
        if (! $settings) {
            return response()->json([
                'message'  => 'Default settings returned - nothing saved yet.',
                'saved'    => false,
                'settings' => [
                    'email_notifications' => true,
                    'adoption_alerts'     => true,
                    'public_profile'      => true,
                    'dark_mode'           => false,
                    'language'            => 'English',
                ],
            ]);
        }

        return response()->json([
            'message'  => 'Settings fetched successfully.',
            'saved'    => true,
            'settings' => [
                // MySQL hands booleans back as 0/1, and as strings through
                // PDO. Casting here means the JSON carries real true/false
                // instead of "1", which a JavaScript checkbox would otherwise
                // have to second-guess.
                'email_notifications' => (bool) $settings->email_notifications,
                'adoption_alerts'     => (bool) $settings->adoption_alerts,
                'public_profile'      => (bool) $settings->public_profile,
                'dark_mode'           => (bool) $settings->dark_mode,
                'language'            => $settings->language,
                'updated_at'          => $settings->updated_at,
            ],
        ]);
    }

    /**
     * PUT /api/settings
     *
     * Saves the logged-in user's settings through the stored procedure.
     */
    public function update(Request $request)
    {
        /*
        | 'boolean' accepts true/false, 1/0 and "1"/"0", which is what an HTML
        | form or a JSON checkbox might send.
        |
        | The language list is repeated inside the procedure on purpose. This
        | check gives a friendly error; the one in the database is the rule
        | that cannot be bypassed by a different caller.
        */
        $validated = $request->validate([
            'email_notifications' => ['required', 'boolean'],
            'adoption_alerts'     => ['required', 'boolean'],
            'public_profile'      => ['required', 'boolean'],
            'dark_mode'           => ['required', 'boolean'],
            'language'            => ['required', 'in:English,Bangla'],
        ]);

        $userId = $request->user()->id;

        /*
        |----------------------------------------------------------------------
        | THE WRITE HAPPENS IN THE DATABASE
        |----------------------------------------------------------------------
        |
        | sp_save_user_settings runs START TRANSACTION, decides whether this is
        | an INSERT (first save) or an UPDATE (a change), and COMMITs. Its
        | UPDATE also fires trg_log_user_settings_change, which writes one
        | history row per field that actually changed.
        |
        | So one CALL produces up to five history rows, and none of that is
        | written by PHP.
        |
        | There is deliberately no DB::beginTransaction() here: MySQL has no
        | nested transactions, and an outer one would be silently committed by
        | the START TRANSACTION inside the procedure.
        |
        | (int) on the booleans because the procedure's parameters are TINYINT,
        | and PHP's false would otherwise bind as an empty string.
        */
        DB::statement(
            'CALL sp_save_user_settings(?, ?, ?, ?, ?, ?, @st, @msg)',
            [
                $userId,
                (int) $validated['email_notifications'],
                (int) $validated['adoption_alerts'],
                (int) $validated['public_profile'],
                (int) $validated['dark_mode'],
                $validated['language'],
            ]
        );

        $outcome = DB::selectOne('SELECT @st AS status, @msg AS message');

        if ($outcome->status !== 'success') {
            // The procedure already rolled back, so there is nothing to undo
            // here. 422 because the request itself was unacceptable.
            return response()->json(['message' => $outcome->message], 422);
        }

        /*
        | Read back what is actually STORED rather than echoing what was sent.
        | If the database changed or rejected anything, the page sees the truth.
        |
        | show() returns a JsonResponse, so take its array back out, swap in the
        | procedure's message ("Settings created." or "Settings updated.") and
        | send that.
        */
        $body = $this->show($request)->getData(true);
        $body['message'] = $outcome->message;

        return response()->json($body);
    }

    /**
     * GET /api/settings/history
     *
     * What the trigger recorded: one row per setting that was changed.
     */
    public function history(Request $request)
    {
        $userId = $request->user()->id;

        $history = DB::select(
            "SELECT setting_name, old_value, new_value, changed_at
             FROM user_settings_history
             WHERE user_id = ?
             ORDER BY changed_at DESC, id DESC
             LIMIT 50",
            [$userId]
        );

        return response()->json([
            'message' => 'Settings history fetched successfully.',
            'count'   => count($history),
            'history' => $history,
        ]);
    }
}
