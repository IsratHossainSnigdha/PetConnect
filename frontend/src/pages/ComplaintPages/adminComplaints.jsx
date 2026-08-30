import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dog,
  ArrowLeft,
  Flag,
  Search,
  RefreshCw,
  Eye,
  X,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';

import {
  fetchAdminComplaints,
  fetchAdminComplaint,
  updateComplaintStatus,
} from '../../api/adminComplaints';

/*
|==============================================================================
| ADMIN COMPLAINTS PAGE   (issue #41)
|==============================================================================
|
| Lets a platform admin read every complaint and mark each one Resolved or
| Rejected.
|
|     this page -> src/api/adminComplaints.js -> /api/admin/complaints
|                                                 (Admin\ComplaintController)
|
| The table is one SELECT with a JOIN to users, so each row can show WHO
| complained rather than a bare user_id number. Changing a status is one
| UPDATE ... WHERE id = ?.
|
| Note the capital letters: the status column is
| ENUM('Pending','Resolved','Rejected'), so 'pending' would never match.
*/

const STATUSES = ['Pending', 'Resolved', 'Rejected'];

export default function AdminComplaints() {
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [summary, setSummary] = useState({ pending: 0, resolved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  // Filters -> query string -> SQL WHERE clauses.
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [viewing, setViewing] = useState(null);
  const [savingId, setSavingId] = useState(null);   // which row is mid-update

  /*
  | READ  ->  GET /api/admin/complaints
  */
  const loadComplaints = useCallback(async () => {
    setLoading(true);
    setLoadError('');

    try {
      const data = await fetchAdminComplaints({ search, status: statusFilter });
      setComplaints(data.complaints);
      setSummary(data.summary);      // the GROUP BY counts
    } catch (error) {
      setLoadError(error.message || 'Could not reach the server.');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  // Debounced so typing does not fire a query per keystroke.
  useEffect(() => {
    const timer = setTimeout(() => loadComplaints(), 350);
    return () => clearTimeout(timer);
  }, [loadComplaints]);

  /*
  | CHANGE STATUS  ->  PUT /api/admin/complaints/{id}
  */
  const handleStatusChange = async (complaint, newStatus) => {
    // Nothing to do if it already has that status - skip the round trip.
    if (complaint.status === newStatus) return;

    setSavingId(complaint.id);

    try {
      await updateComplaintStatus(complaint.id, newStatus);
      // Re-read from the database so the table and the summary counts both
      // reflect what is actually stored.
      await loadComplaints();
    } catch (error) {
      alert(error.message);
    } finally {
      setSavingId(null);
    }
  };

  const handleView = async (complaint) => {
    try {
      const data = await fetchAdminComplaint(complaint.id);
      setViewing(data.complaint);
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box;
            font-family: Arial, Helvetica, sans-serif; }

        html, body, #root {
          width: 100%;
          min-height: 100%;
          /* Set explicitly: the dashboard stylesheet uses overflow:hidden, and
             without this the page inherits it and refuses to scroll. */
          overflow-x: hidden;
          overflow-y: auto;
        }

        .cp-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #e6f2ff, #f9f4ef, #e3f6ee, #f0e6ff, #e8f4f8);
          background-size: 400% 400%;
          animation: cpFlow 20s ease infinite;
          color: #102c45;
          padding-bottom: 40px;
        }

        @keyframes cpFlow {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .cp-topbar {
          height: 68px; background: rgba(255,255,255,0.9);
          backdrop-filter: blur(12px);
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 26px; box-shadow: 0 2px 14px rgba(16,44,69,0.07);
          position: sticky; top: 0; z-index: 20;
        }

        .cp-brand { display: flex; align-items: center; gap: 10px; }

        .cp-brand-icon {
          width: 36px; height: 36px; border-radius: 10px;
          background: #286993; color: #fff;
          display: flex; align-items: center; justify-content: center;
        }

        .cp-brand h1 { font-size: 17px; font-weight: 800; }
        .cp-brand p  { font-size: 11px; color: #64748b; }

        .cp-back {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(40,105,147,0.1); color: #286993;
          border: none; border-radius: 9px; padding: 9px 14px;
          font-size: 13px; font-weight: 600; cursor: pointer;
        }

        .cp-back:hover { background: rgba(40,105,147,0.18); }

        .cp-container {
          /* min() = "whichever is smaller". Wide screens get 1560px;
             narrow ones fall back to 94% of the viewport instead of
             overflowing. */
          max-width: min(1560px, 94vw);
          margin: 0 auto;
          padding: 26px 24px 0;
        }

        .cp-heading h2 { font-size: 24px; font-weight: 800; }
        .cp-heading p  { font-size: 13px; color: #64748b; margin-top: 3px; }

        .cp-summary {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 14px; margin: 20px 0;
        }

        .cp-sum-card {
          background: rgba(255,255,255,0.85); border-radius: 13px;
          padding: 15px 17px; display: flex; align-items: center; gap: 12px;
          box-shadow: 0 3px 14px rgba(16,44,69,0.06);
        }

        .cp-sum-icon {
          width: 38px; height: 38px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }

        .cp-sum-icon.pending  { background: rgba(245,158,11,0.14); color: #d97706; }
        .cp-sum-icon.resolved { background: rgba(16,185,129,0.14); color: #059669; }
        .cp-sum-icon.rejected { background: rgba(239,68,68,0.14);  color: #dc2626; }

        .cp-sum-num   { font-size: 21px; font-weight: 800; line-height: 1.1; }
        .cp-sum-label { font-size: 11px; color: #64748b; }

        .cp-card {
          background: rgba(255,255,255,0.88); border-radius: 15px;
          padding: 20px; box-shadow: 0 4px 20px rgba(16,44,69,0.07);
        }

        .cp-card-head { margin-bottom: 14px; }
        .cp-card-head h3 { font-size: 16px; font-weight: 700; }
        .cp-card-head p  { font-size: 12px; color: #64748b; }

        .cp-filters {
          display: flex; align-items: center; gap: 9px;
          flex-wrap: wrap; margin-bottom: 15px;
        }

        .cp-search {
          display: flex; align-items: center; gap: 7px;
          background: #fff; border: 1px solid rgba(40,105,147,0.22);
          border-radius: 9px; padding: 8px 12px; flex: 1; min-width: 200px;
        }

        .cp-search input {
          border: none; outline: none; background: transparent;
          font-size: 13px; width: 100%; color: #102c45;
        }

        .cp-select {
          border: 1px solid rgba(40,105,147,0.22); border-radius: 9px;
          padding: 9px 12px; font-size: 13px; background: #fff;
          color: #102c45; cursor: pointer;
        }

        .cp-btn-ghost {
          background: transparent; color: #286993;
          border: 1px solid rgba(40,105,147,0.25); border-radius: 9px;
          padding: 8px 13px; font-size: 12px; font-weight: 600; cursor: pointer;
          display: inline-flex; align-items: center; gap: 6px;
        }

        .cp-table-wrap { width: 100%; overflow-x: auto; }
        .cp-table { width: 100%; border-collapse: collapse; font-size: 13px; text-align: left; }

        .cp-table th {
          background: rgba(40,105,147,0.08); color: #64748b; font-weight: 600;
          padding: 11px 12px; white-space: nowrap;
          border-bottom: 1px solid rgba(40,105,147,0.12);
        }

        .cp-table td {
          padding: 12px; border-bottom: 1px solid rgba(40,105,147,0.08);
          vertical-align: middle;
        }

        .cp-table tbody tr:hover { background: rgba(40,105,147,0.03); }

        .cp-muted { color: #64748b; font-size: 11px; }

        .cp-subject { font-weight: 600; }

        .cp-desc {
          color: #64748b; font-size: 11px; display: block;
          max-width: 320px; overflow: hidden; text-overflow: ellipsis;
          white-space: nowrap;
        }

        .cp-badge {
          padding: 4px 10px; border-radius: 20px;
          font-size: 11px; font-weight: 700; display: inline-block;
        }

        .cp-badge.Pending  { background: rgba(245,158,11,0.13); color: #d97706; }
        .cp-badge.Resolved { background: rgba(16,185,129,0.13); color: #059669; }
        .cp-badge.Rejected { background: rgba(239,68,68,0.13);  color: #dc2626; }

        .cp-cat {
          background: rgba(40,105,147,0.09); color: #286993;
          padding: 3px 9px; border-radius: 6px; font-size: 11px; font-weight: 600;
          text-transform: capitalize;
        }

        .cp-row-actions { display: flex; align-items: center; gap: 7px; }

        .cp-status-select {
          border: 1px solid rgba(40,105,147,0.25); border-radius: 7px;
          padding: 5px 8px; font-size: 12px; background: #fff; cursor: pointer;
        }

        .cp-status-select:disabled { opacity: 0.5; cursor: wait; }

        .cp-icon-btn {
          width: 29px; height: 29px; border-radius: 7px; border: none;
          display: flex; align-items: center; justify-content: center;
          background: rgba(40,105,147,0.1); color: #286993; cursor: pointer;
        }

        .cp-icon-btn:hover { background: rgba(40,105,147,0.2); }

        .cp-msg { padding: 26px 12px; text-align: center; font-size: 13px; color: #64748b; }
        .cp-msg.error { color: #b91c1c; }

        .cp-spin { animation: cpSpin 0.9s linear infinite; display: inline-block; }
        @keyframes cpSpin { to { transform: rotate(360deg); } }

        .cp-backdrop {
          position: fixed; inset: 0; background: rgba(16,44,69,0.45);
          display: flex; align-items: center; justify-content: center;
          z-index: 60; padding: 20px;
        }

        .cp-modal {
          background: #fff; border-radius: 14px; width: 100%; max-width: 480px;
          max-height: 90vh; overflow-y: auto; padding: 22px;
          box-shadow: 0 20px 50px rgba(16,44,69,0.3);
        }

        .cp-modal-head {
          display: flex; align-items: flex-start; justify-content: space-between;
          margin-bottom: 16px;
        }

        .cp-modal-head h3 { font-size: 17px; font-weight: 700; }
        .cp-modal-head p  { font-size: 11px; color: #64748b; margin-top: 3px; }

        .cp-close {
          background: rgba(40,105,147,0.1); border: none; border-radius: 8px;
          width: 30px; height: 30px; display: flex; align-items: center;
          justify-content: center; cursor: pointer; color: #286993; flex-shrink: 0;
        }

        .cp-view-row {
          display: flex; justify-content: space-between; gap: 12px;
          font-size: 13px; padding: 8px 0;
          border-bottom: 1px solid rgba(40,105,147,0.08);
        }

        .cp-view-row span:first-child { color: #64748b; }
        .cp-view-row span:last-child  { font-weight: 600; text-align: right; word-break: break-word; }

        .cp-desc-box {
          background: rgba(40,105,147,0.05); border-radius: 9px;
          padding: 12px; font-size: 13px; line-height: 1.6; margin-top: 12px;
          white-space: pre-wrap;
        }

        .cp-modal-actions {
          display: flex; justify-content: flex-end; gap: 8px; margin-top: 18px;
        }

        .cp-cancel {
          background: rgba(100,116,139,0.12); color: #475569; border: none;
          border-radius: 8px; padding: 9px 16px;
          font-size: 13px; font-weight: 600; cursor: pointer;
        }
      `}</style>

      <div className="cp-page">

        <header className="cp-topbar">
          <div className="cp-brand">
            <div className="cp-brand-icon"><Dog size={20} /></div>
            <div>
              <h1>PetConnect</h1>
              <p>Complaints Review</p>
            </div>
          </div>

          <button className="cp-back" onClick={() => navigate('/dashboard/admin')}>
            <ArrowLeft size={15} /> Back to Dashboard
          </button>
        </header>

        <div className="cp-container">

          <div className="cp-heading">
            <h2>Complaints</h2>
            <p>Every complaint submitted on the platform, with who reported it.</p>
          </div>

          {/* These three come from the GROUP BY in the backend */}
          <div className="cp-summary">
            <div className="cp-sum-card">
              <div className="cp-sum-icon pending"><Clock size={19} /></div>
              <div>
                <div className="cp-sum-num">{loading ? '...' : summary.pending}</div>
                <div className="cp-sum-label">Pending</div>
              </div>
            </div>

            <div className="cp-sum-card">
              <div className="cp-sum-icon resolved"><CheckCircle size={19} /></div>
              <div>
                <div className="cp-sum-num">{loading ? '...' : summary.resolved}</div>
                <div className="cp-sum-label">Resolved</div>
              </div>
            </div>

            <div className="cp-sum-card">
              <div className="cp-sum-icon rejected"><XCircle size={19} /></div>
              <div>
                <div className="cp-sum-num">{loading ? '...' : summary.rejected}</div>
                <div className="cp-sum-label">Rejected</div>
              </div>
            </div>

            <div className="cp-sum-card">
              <div className="cp-sum-icon" style={{ background: 'rgba(40,105,147,0.12)', color: '#286993' }}>
                <Flag size={19} />
              </div>
              <div>
                <div className="cp-sum-num">{loading ? '...' : complaints.length}</div>
                <div className="cp-sum-label">Shown</div>
              </div>
            </div>
          </div>

          <div className="cp-card">

            <div className="cp-card-head">
              <h3>All Complaints</h3>
              <p>Change a status with the dropdown - it runs an UPDATE straight away.</p>
            </div>

            <div className="cp-filters">
              <div className="cp-search">
                <Search size={15} color="#64748b" />
                <input
                  type="text"
                  placeholder="Search subject, description or reporter..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <select
                className="cp-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All statuses</option>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              <button className="cp-btn-ghost" onClick={loadComplaints} title="Re-run the SELECT">
                <RefreshCw size={13} /> Refresh
              </button>
            </div>

            <div className="cp-table-wrap">
              <table className="cp-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Subject</th>
                    <th>Category</th>
                    <th>Reported by</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {loading && (
                    <tr>
                      <td colSpan={7} className="cp-msg">
                        <RefreshCw size={14} className="cp-spin" /> Loading complaints...
                      </td>
                    </tr>
                  )}

                  {!loading && loadError && (
                    <tr><td colSpan={7} className="cp-msg error">{loadError}</td></tr>
                  )}

                  {!loading && !loadError && complaints.length === 0 && (
                    <tr>
                      <td colSpan={7} className="cp-msg">
                        No complaints matched. The query returned 0 rows.
                      </td>
                    </tr>
                  )}

                  {!loading && !loadError && complaints.map((c) => (
                    <tr key={c.id}>
                      <td>#{c.id}</td>

                      <td>
                        <span className="cp-subject">{c.subject}</span>
                        <span className="cp-desc">{c.description}</span>
                      </td>

                      <td><span className="cp-cat">{c.category}</span></td>

                      {/*
                        user_name and user_email are not columns of complaints -
                        they came from the JOIN to the users table.
                      */}
                      <td>
                        <strong>{c.user_name}</strong>
                        <br />
                        <span className="cp-muted">{c.user_email}</span>
                      </td>

                      <td className="cp-muted">
                        {new Date(c.created_at).toLocaleDateString()}
                      </td>

                      <td><span className={`cp-badge ${c.status}`}>{c.status}</span></td>

                      <td>
                        <div className="cp-row-actions">
                          {/*
                            Changing this dropdown fires the UPDATE immediately.
                            The options are exactly the ENUM values, so an
                            invalid status cannot be chosen.
                          */}
                          <select
                            className="cp-status-select"
                            value={c.status}
                            disabled={savingId === c.id}
                            onChange={(e) => handleStatusChange(c, e.target.value)}
                          >
                            {STATUSES.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>

                          <button className="cp-icon-btn" title="View" onClick={() => handleView(c)}>
                            <Eye size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* ---------------- VIEW PANEL ---------------- */}
      {viewing && (
        <div className="cp-backdrop">
          <div className="cp-modal">

            <div className="cp-modal-head">
              <div>
                <h3>{viewing.subject}</h3>
                <p>Row id {viewing.id} of the complaints table</p>
              </div>
              <button className="cp-close" onClick={() => setViewing(null)}>
                <X size={16} />
              </button>
            </div>

            <div className="cp-view-row">
              <span>Status</span>
              <span><span className={`cp-badge ${viewing.status}`}>{viewing.status}</span></span>
            </div>

            <div className="cp-view-row"><span>Category</span><span>{viewing.category}</span></div>

            <div className="cp-view-row">
              <span>Reported by</span>
              <span>{viewing.user_name} ({viewing.user_role})</span>
            </div>

            <div className="cp-view-row"><span>Email</span><span>{viewing.user_email}</span></div>

            {viewing.user_phone && (
              <div className="cp-view-row"><span>Phone</span><span>{viewing.user_phone}</span></div>
            )}

            <div className="cp-view-row">
              <span>Submitted</span>
              <span>{new Date(viewing.created_at).toLocaleString()}</span>
            </div>

            <div className="cp-desc-box">{viewing.description}</div>

            <div className="cp-modal-actions">
              <button type="button" className="cp-cancel" onClick={() => setViewing(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
