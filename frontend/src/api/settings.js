/*
|------------------------------------------------------------------------------
| SETTINGS API
|------------------------------------------------------------------------------
|
| These hit /api/settings, which always works on THE LOGGED-IN USER. The user
| id is taken from the auth token on the server, never sent from here - if the
| browser could choose the id, anyone could overwrite someone else's settings.
|
| The save goes through the stored procedure sp_save_user_settings, which owns
| the validation and the transaction. Its UPDATE fires the trigger
| trg_log_user_settings_change, which is what fills the history below. Nothing
| in JavaScript or PHP writes those history rows.
|
*/

import { apiFetch } from './client';

/**
 * GET /api/settings
 *
 * Returns { saved, settings }. `saved` is false for a user who has never saved
 * - the server hands back defaults rather than null, and does NOT create a row
 * (a GET must not write).
 */
export async function fetchSettings() {
  return apiFetch('/settings');
}

/**
 * PUT /api/settings
 *
 * Sends all five values every time. The procedure decides whether that is an
 * INSERT (first save) or an UPDATE (a change), so this does not need to know.
 */
export async function saveSettings(settings) {
  return apiFetch('/settings', {
    method: 'PUT',
    body: JSON.stringify(settings),
  });
}

/**
 * GET /api/settings/history
 *
 * One row per setting that actually changed, written by the trigger.
 */
export async function fetchSettingsHistory() {
  return apiFetch('/settings/history');
}
