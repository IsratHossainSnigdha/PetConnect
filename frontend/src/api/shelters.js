/*
|------------------------------------------------------------------------------
| SHELTER API CLIENT
|------------------------------------------------------------------------------
|
| Every function here maps to one SQL operation on the `shelters` table.
| All of them go through apiFetch(), which attaches the Bearer token - these
| routes are admin-only now, so a request without a valid token gets 401 and a
| request from a non-admin gets 403.
|
| THE ROUND TRIP - what happens when the admin clicks "Save":
|
|   React component
|        |  calls createShelter({...})
|        v
|   this file --> apiFetch --- HTTP POST + token ---> routes/api.php
|                                                          |
|                                        auth:sanctum (who are you?)
|                                        admin        (are you allowed?)
|                                                          |
|                                                          v
|                                              ShelterController@store
|                                                          |  validates, then
|                                                          v
|                                              INSERT INTO shelters ...
|                                                          |
|        <------------------ JSON response ----------------+
|        v
|   React re-fetches the list -> the table re-renders
|
*/

import { apiFetch } from './client';

/**
 * READ ALL  ->  GET /api/admin/shelters
 *
 * `filters` may contain { search, status }. They become a query string
 * (?search=paws&status=active) which the controller turns into SQL WHERE
 * clauses. Filtering in the DATABASE rather than in JavaScript matters: with
 * 10,000 shelters you do not want to download all of them to show five.
 */
export async function fetchShelters(filters = {}) {
  // URLSearchParams handles escaping, so searching "Paws & Claws" becomes
  // "Paws%20%26%20Claws" instead of breaking the URL.
  const params = new URLSearchParams();

  if (filters.search) params.append('search', filters.search);
  if (filters.status) params.append('status', filters.status);

  const queryString = params.toString();

  return apiFetch(`/admin/shelters${queryString ? `?${queryString}` : ''}`);
}

/**
 * READ ONE  ->  GET /api/admin/shelters/{id}
 * Returns the shelter plus its related staff users (the hasMany relationship).
 */
export async function fetchShelter(id) {
  return apiFetch(`/admin/shelters/${id}`);
}

/**
 * CREATE  ->  POST /api/admin/shelters   (SQL INSERT)
 */
export async function createShelter(shelter) {
  return apiFetch('/admin/shelters', {
    method: 'POST',
    body: JSON.stringify(shelter),
  });
}

/**
 * UPDATE  ->  PUT /api/admin/shelters/{id}   (SQL UPDATE)
 *
 * PUT means "replace this resource with what I am sending", so we send every
 * field, not only the changed ones. That is why the edit form is pre-filled
 * with the row's current values.
 */
export async function updateShelter(id, shelter) {
  return apiFetch(`/admin/shelters/${id}`, {
    method: 'PUT',
    body: JSON.stringify(shelter),
  });
}

/**
 * DELETE  ->  DELETE /api/admin/shelters/{id}   (SQL DELETE)
 * No body needed - the id in the URL is the whole instruction.
 */
export async function deleteShelter(id) {
  return apiFetch(`/admin/shelters/${id}`, { method: 'DELETE' });
}

/**
 * DASHBOARD STATS  ->  GET /api/admin/stats
 * COUNT(*) and GROUP BY aggregates, computed by MySQL rather than in JS.
 */
export async function fetchStats() {
  return apiFetch('/admin/stats');
}
