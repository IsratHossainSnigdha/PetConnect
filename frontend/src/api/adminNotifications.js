/*
|------------------------------------------------------------------------------
| ADMIN NOTIFICATION FEED
|------------------------------------------------------------------------------
|
| Feeds the bell in the admin topbar.
|
| Hits /api/admin/notifications, which is the ADMIN view - every notification
| the system has generated, for every user, with the recipient's name attached.
|
| Do not confuse it with /api/notifications, which is "my own notifications".
| That endpoint is always empty for an admin, because the complaint trigger
| notifies the user who FILED the complaint, not the admin who resolved it.
|
| Most of the rows here are written by the database itself:
|   trg_notify_user_on_complaint_resolved  - when a complaint is resolved
|   notify_shelter_staff_after_application - when an adoption form is submitted
|
*/

import { apiFetch } from './client';

/**
 * GET /api/admin/notifications
 *
 * Returns { message, count, unread, notifications }, newest first, capped at
 * 20 rows. `unread` is a COUNT over the whole table, not just the 20 returned,
 * so the red dot stays accurate.
 */
export async function fetchAdminNotifications() {
  return apiFetch('/admin/notifications');
}
