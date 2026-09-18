/*
|------------------------------------------------------------------------------
| ADMIN COMPLAINTS API   (issue #41)
|------------------------------------------------------------------------------
|
| These hit /api/admin/complaints, which is the ADMIN view - every complaint
| from every user.
|
| Do not confuse it with src/api/complaints.js, which hits /api/complaints:
| that is the adopter view and deliberately returns only your own complaints
| (its SQL has WHERE complaints.user_id = you).
|
*/

import { apiFetch } from './client';

/**
 * LIST ALL  ->  GET /api/admin/complaints
 *
 * filters may contain { status, category, search }. They become a query
 * string, which the controller turns into SQL WHERE clauses - so MySQL does
 * the filtering, not the browser.
 */
export async function fetchAdminComplaints(filters = {}) {
  const params = new URLSearchParams();

  if (filters.status) params.append('status', filters.status);
  if (filters.category) params.append('category', filters.category);
  if (filters.search) params.append('search', filters.search);

  const qs = params.toString();

  return apiFetch(`/admin/complaints${qs ? `?${qs}` : ''}`);
}

/**
 * READ ONE  ->  GET /api/admin/complaints/{id}
 */
export async function fetchAdminComplaint(id) {
  return apiFetch(`/admin/complaints/${id}`);
}

/**
 * CHANGE STATUS  ->  PUT /api/admin/complaints/{id}
 *
 * Runs: UPDATE complaints SET status = ? WHERE id = ?
 * status must be exactly 'Pending', 'Resolved' or 'Rejected' - those are the
 * values the ENUM column allows.
 */
export async function updateComplaintStatus(id, status) {
  return apiFetch(`/admin/complaints/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}
