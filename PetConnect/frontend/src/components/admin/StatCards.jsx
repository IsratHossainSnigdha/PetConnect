import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Users, Flag, Dog, ShieldAlert } from 'lucide-react';

/*
|==============================================================================
| STAT CARDS   (issue #34)
|==============================================================================
|
| The row of headline numbers at the top of the dashboard.
|
| Every value comes from GET /api/admin/stats, where each one is a COUNT() or
| a GROUP BY run by MySQL - see Admin\StatsController. This component does not
| fetch anything; the page passes the finished `stats` object in.
|
| WHY EVERY CARD CHECKS `stats ?`
| `stats` is null until the request comes back. Rendering 0 in the meantime
| would show a number that is not true - "0 shelters" reads as a fact, not as
| "still loading". Falling back to '...' says the honest thing.
|
| PROPS
|   stats             the stats object from the API, or null while loading
|   onFilterPending   called when "Review now" on Pending Approval is clicked
*/
export default function StatCards({ stats, onFilterPending }) {
  const navigate = useNavigate();

  return (
    <div className="stats-grid">

      {/* SELECT COUNT(*) FROM shelters; */}
      <div className="stat-card">
        <div className="stat-icon-wrapper"><Home size={20} /></div>
        <div className="stat-details">
          <div className="stat-number">{stats ? stats.total_shelters : '...'}</div>
          <div className="stat-label">Total Shelters</div>
        </div>
        <span className="stat-action" onClick={() => navigate('/shelters/admin')}>
          View all shelters
        </span>
      </div>

      {/* SELECT COUNT(*) FROM users; the sub-line comes from GROUP BY role */}
      <div className="stat-card">
        <div className="stat-icon-wrapper"><Users size={20} /></div>
        <div className="stat-details">
          <div className="stat-number">{stats ? stats.total_users : '...'}</div>
          <div className="stat-label">Platform Users</div>
        </div>
        <span className="stat-action">
          {stats ? `${stats.total_adopters} adopters, ${stats.total_staff} staff` : ''}
        </span>
      </div>

      {/* From GROUP BY shelters.status - the ones awaiting approval */}
      <div className="stat-card">
        <div className="stat-icon-wrapper"><Flag size={20} /></div>
        <div className="stat-details">
          <div className="stat-number">{stats ? stats.pending_shelters : '...'}</div>
          <div className="stat-label">Pending Approval</div>
        </div>
        <span className="stat-action" onClick={onFilterPending}>Review now</span>
      </div>

      {/* SELECT COUNT(*) FROM pets;   (issue #20) */}
      <div className="stat-card">
        <div className="stat-icon-wrapper"><Dog size={20} /></div>
        <div className="stat-details">
          <div className="stat-number">{stats ? stats.total_pets : '...'}</div>
          <div className="stat-label">Total Pets</div>
        </div>
        <span className="stat-action">Across all shelters</span>
      </div>

      {/* SELECT COUNT(*) FROM complaints WHERE status = 'Pending';  (issue #20)
          Capital P - that is how the ENUM spells it. */}
      <div className="stat-card">
        <div className="stat-icon-wrapper"><ShieldAlert size={20} /></div>
        <div className="stat-details">
          <div className="stat-number">{stats ? stats.pending_complaints : '...'}</div>
          <div className="stat-label">Pending Complaints</div>
        </div>
        <span className="stat-action" onClick={() => navigate('/complaints/admin')}>
          Review now
        </span>
      </div>
    </div>
  );
}
