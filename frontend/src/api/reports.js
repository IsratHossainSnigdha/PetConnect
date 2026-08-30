/*
|------------------------------------------------------------------------------
| ADMIN REPORTS API   (issue #42)
|------------------------------------------------------------------------------
|
| One endpoint returns every report, so the page makes ONE request instead of
| seven. Each report is an aggregate query - COUNT / GROUP BY / JOIN - run by
| MySQL, so only the summarised numbers cross the network.
*/

import { apiFetch } from './client';

/**
 * GET /api/admin/reports
 *
 * Returns { reports: { overview, pets_per_shelter, pets_by_status,
 *                      pets_by_type, applications_by_status,
 *                      applications_by_day, complaints_by_category,
 *                      busiest_shelters } }
 */
export async function fetchReports() {
  return apiFetch('/admin/reports');
}
