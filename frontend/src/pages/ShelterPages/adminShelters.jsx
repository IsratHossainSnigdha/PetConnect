import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dog,
  ArrowLeft,
  Building2,
  Search,
  RefreshCw,
  Plus,
  Eye,
  Edit,
  Trash2,
  X,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react';

import {
  fetchShelters,
  createShelter,
  updateShelter,
  deleteShelter,
  fetchAdmins,
} from '../../api/shelters';

/*
|==============================================================================
| SHELTER MANAGEMENT PAGE   (issue #35)
|==============================================================================
|
| A dedicated screen for everything to do with shelters, instead of squeezing
| the table into a corner of the dashboard.
|
| WHAT TALKS TO WHAT
|
|     this page  ->  src/api/shelters.js  ->  /api/admin/shelters
|                                              (ShelterController, raw SQL)
|
| Every button here ends up as one SQL statement:
|
|     the table          SELECT ... LEFT JOIN users ...
|     Add New Shelter    INSERT INTO shelters ...
|     Edit               UPDATE shelters SET ... WHERE id = ?
|     Delete             DELETE FROM shelters WHERE id = ?
|
*/

// A blank form. Every key matches a COLUMN in the shelters table, because this
// object is sent as JSON straight to the API.
const EMPTY_FORM = {
  name: '',
  location: '',
  description: '',
  contact_email: '',
  contact_phone: '',
  status: 'pending',
  admin_id: '',        // '' means "no admin assigned" -> stored as NULL
};

export default function AdminShelters() {
  const navigate = useNavigate();

  // --- the rows we got back from the database -------------------------------
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  // --- filters (sent to the API, turned into SQL WHERE clauses) -------------
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // --- the add / edit popup -------------------------------------------------
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);   // null = adding, number = editing
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // The admin list for the "Assigned Admin" dropdown
  const [admins, setAdmins] = useState([]);

  /*
  | READ  ->  GET /api/admin/shelters
  |
  | useCallback keeps this function stable between renders so the useEffect
  | below does not re-run more often than it needs to.
  */
  const loadShelters = useCallback(async () => {
    setLoading(true);
    setLoadError('');

    try {
      const data = await fetchShelters({ search, status: statusFilter });
      setShelters(data.shelters);
    } catch (error) {
      // Say what actually went wrong. An empty table with no message looks
      // like "there are no shelters", which is a different thing entirely.
      setLoadError(error.message || 'Could not reach the server.');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  /*
  | Re-run the query when the filters change.
  |
  | The 350ms timer is a DEBOUNCE: without it, typing "paws" would fire four
  | separate SELECT queries (p, pa, paw, paws). This waits until you stop
  | typing and sends one.
  */
  useEffect(() => {
    const timer = setTimeout(() => loadShelters(), 350);
    return () => clearTimeout(timer);
  }, [loadShelters]);

  // The admin list for the dropdown. Loaded once - it changes rarely.
  useEffect(() => {
    fetchAdmins()
      .then((data) => setAdmins(data.admins))
      .catch(() => {
        // The page still works without it; the dropdown is just empty.
      });
  }, []);

  /*
  |--------------------------------------------------------------------------
  | ADD / EDIT
  |--------------------------------------------------------------------------
  */
  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setModalOpen(true);
  };

  const openEdit = (shelter) => {
    setEditingId(shelter.id);   // this id becomes the SQL "WHERE id = ?"

    setForm({
      name: shelter.name,
      location: shelter.location,
      description: shelter.description ?? '',
      contact_email: shelter.contact_email,
      contact_phone: shelter.contact_phone,
      status: shelter.status,
      // The column holds NULL, but a <select> can only hold a string.
      admin_id: shelter.admin_id ?? '',
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // The input's name attribute matches the column name, so one handler
    // covers every field.
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormErrors({});

    // "" from the dropdown must become a real null, and "3" must become 3.
    const payload = {
      ...form,
      admin_id: form.admin_id === '' ? null : Number(form.admin_id),
    };

    try {
      if (editingId) {
        await updateShelter(editingId, payload);   // UPDATE
      } else {
        await createShelter(payload);              // INSERT
      }

      setModalOpen(false);
      await loadShelters();      // re-SELECT so the table matches the database
    } catch (error) {
      if (error.status === 422) {
        // Laravel sends { errors: { name: ["..."] } } - show each message
        // under its own input.
        setFormErrors(error.errors || {});
      } else {
        alert(error.message);
      }
    } finally {
      setSaving(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | DELETE
  |--------------------------------------------------------------------------
  */
  const handleDelete = async (shelter) => {
    const ok = window.confirm(
      `Delete "${shelter.name}"?\n\n` +
      `This removes the row from the shelters table permanently.\n` +
      `Staff accounts linked to it are NOT deleted - their shelter_id is set ` +
      `to NULL by the foreign key.`
    );

    if (!ok) return;

    try {
      const result = await deleteShelter(shelter.id);
      await loadShelters();

      if (result.affected_staff > 0) {
        alert(`Shelter deleted. ${result.affected_staff} staff account(s) were unlinked.`);
      }
    } catch (error) {
      alert(error.message);
    }
  };

  /*
  | Small counters for the summary strip. These are counted in JavaScript
  | rather than SQL on purpose: the rows are already here, so asking the
  | database again would be a wasted round trip for the same answer.
  */
  const countByStatus = (value) => shelters.filter((s) => s.status === value).length;

  return (
    <>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box;
            font-family: Arial, Helvetica, sans-serif; }

        html, body, #root { width: 100%; min-height: 100%; }

        .sp-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #e6f2ff, #f9f4ef, #e3f6ee, #f0e6ff, #e8f4f8);
          background-size: 400% 400%;
          animation: spFlow 20s ease infinite;
          color: #102c45;
          padding-bottom: 40px;
        }

        @keyframes spFlow {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .sp-topbar {
          height: 68px;
          background: rgba(255,255,255,0.9);
          backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 26px;
          box-shadow: 0 2px 14px rgba(16,44,69,0.07);
          position: sticky;
          top: 0;
          z-index: 20;
        }

        .sp-brand { display: flex; align-items: center; gap: 10px; }

        .sp-brand-icon {
          width: 36px; height: 36px; border-radius: 10px;
          background: #286993; color: #fff;
          display: flex; align-items: center; justify-content: center;
        }

        .sp-brand h1 { font-size: 17px; font-weight: 800; }
        .sp-brand p  { font-size: 11px; color: #64748b; }

        .sp-back {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(40,105,147,0.1); color: #286993;
          border: none; border-radius: 9px;
          padding: 9px 14px; font-size: 13px; font-weight: 600; cursor: pointer;
        }

        .sp-back:hover { background: rgba(40,105,147,0.18); }

        .sp-container { max-width: 1180px; margin: 0 auto; padding: 26px 22px 0; }

        .sp-heading h2 { font-size: 24px; font-weight: 800; }
        .sp-heading p  { font-size: 13px; color: #64748b; margin-top: 3px; }

        /* summary strip */
        .sp-summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 14px;
          margin: 20px 0;
        }

        .sp-sum-card {
          background: rgba(255,255,255,0.85);
          border-radius: 13px;
          padding: 15px 17px;
          display: flex; align-items: center; gap: 12px;
          box-shadow: 0 3px 14px rgba(16,44,69,0.06);
        }

        .sp-sum-icon {
          width: 38px; height: 38px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          background: rgba(40,105,147,0.12); color: #286993;
          flex-shrink: 0;
        }

        .sp-sum-num   { font-size: 21px; font-weight: 800; line-height: 1.1; }
        .sp-sum-label { font-size: 11px; color: #64748b; }

        /* card holding the table */
        .sp-card {
          background: rgba(255,255,255,0.88);
          border-radius: 15px;
          padding: 20px;
          box-shadow: 0 4px 20px rgba(16,44,69,0.07);
        }

        .sp-card-head {
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 12px; margin-bottom: 14px;
        }

        .sp-card-head h3 { font-size: 16px; font-weight: 700; }
        .sp-card-head p  { font-size: 12px; color: #64748b; }

        .sp-btn {
          background: #286993; color: #fff; border: none;
          border-radius: 9px; padding: 9px 15px;
          font-size: 13px; font-weight: 600; cursor: pointer;
          display: inline-flex; align-items: center; gap: 7px;
        }

        .sp-btn:hover { background: #1f587d; }
        .sp-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .sp-btn-ghost {
          background: transparent; color: #286993;
          border: 1px solid rgba(40,105,147,0.25);
          border-radius: 9px; padding: 8px 13px;
          font-size: 12px; font-weight: 600; cursor: pointer;
          display: inline-flex; align-items: center; gap: 6px;
        }

        /* filters */
        .sp-filters {
          display: flex; align-items: center; gap: 9px;
          flex-wrap: wrap; margin-bottom: 15px;
        }

        .sp-search {
          display: flex; align-items: center; gap: 7px;
          background: #fff; border: 1px solid rgba(40,105,147,0.22);
          border-radius: 9px; padding: 8px 12px; flex: 1; min-width: 200px;
        }

        .sp-search input {
          border: none; outline: none; background: transparent;
          font-size: 13px; width: 100%; color: #102c45;
        }

        .sp-select {
          border: 1px solid rgba(40,105,147,0.22);
          border-radius: 9px; padding: 9px 12px;
          font-size: 13px; background: #fff; color: #102c45; cursor: pointer;
        }

        /* table */
        .sp-table-wrap { width: 100%; overflow-x: auto; }

        .sp-table { width: 100%; border-collapse: collapse; font-size: 13px; text-align: left; }

        .sp-table th {
          background: rgba(40,105,147,0.08); color: #64748b;
          font-weight: 600; padding: 11px 12px; white-space: nowrap;
          border-bottom: 1px solid rgba(40,105,147,0.12);
        }

        .sp-table td {
          padding: 12px; border-bottom: 1px solid rgba(40,105,147,0.08);
          vertical-align: middle;
        }

        .sp-table tbody tr:hover { background: rgba(40,105,147,0.03); }

        .sp-muted { color: #64748b; font-size: 11px; }
        .sp-none  { color: #94a3b8; font-style: italic; }

        .sp-badge {
          padding: 4px 10px; border-radius: 20px;
          font-size: 11px; font-weight: 700; display: inline-block;
          text-transform: capitalize;
        }

        .sp-badge.active   { background: rgba(16,185,129,0.12); color: #059669; }
        .sp-badge.pending  { background: rgba(245,158,11,0.12); color: #d97706; }
        .sp-badge.inactive { background: rgba(100,116,139,0.12); color: #64748b; }

        .sp-actions { display: flex; gap: 7px; }

        .sp-icon-btn {
          width: 29px; height: 29px; border-radius: 7px; border: none;
          display: flex; align-items: center; justify-content: center;
          background: rgba(40,105,147,0.1); color: #286993; cursor: pointer;
        }

        .sp-icon-btn:hover { background: rgba(40,105,147,0.2); }
        .sp-icon-btn.danger:hover { background: rgba(239,68,68,0.18); color: #ef4444; }

        .sp-msg { padding: 26px 12px; text-align: center; font-size: 13px; color: #64748b; }
        .sp-msg.error { color: #b91c1c; }

        .sp-spin { animation: spSpin 0.9s linear infinite; display: inline-block; }
        @keyframes spSpin { to { transform: rotate(360deg); } }

        /* modal */
        .sp-backdrop {
          position: fixed; inset: 0; background: rgba(16,44,69,0.45);
          display: flex; align-items: center; justify-content: center;
          z-index: 60; padding: 20px;
        }

        .sp-modal {
          background: #fff; border-radius: 14px; width: 100%; max-width: 460px;
          max-height: 90vh; overflow-y: auto; padding: 22px;
          box-shadow: 0 20px 50px rgba(16,44,69,0.3);
        }

        .sp-modal-head {
          display: flex; align-items: flex-start; justify-content: space-between;
          margin-bottom: 16px;
        }

        .sp-modal-head h3 { font-size: 17px; font-weight: 700; }
        .sp-modal-head p  { font-size: 11px; color: #64748b; margin-top: 3px; }

        .sp-close {
          background: rgba(40,105,147,0.1); border: none; border-radius: 8px;
          width: 30px; height: 30px; display: flex; align-items: center;
          justify-content: center; cursor: pointer; color: #286993; flex-shrink: 0;
        }

        .sp-field { margin-bottom: 13px; }

        .sp-field label {
          display: block; font-size: 12px; font-weight: 600; margin-bottom: 5px;
        }

        .sp-hint { font-weight: 400; color: #94a3b8; font-size: 11px; }

        .sp-field input, .sp-field select {
          width: 100%; border: 1px solid rgba(40,105,147,0.25);
          border-radius: 8px; padding: 9px 11px; font-size: 13px;
          color: #102c45; outline: none; background: #fff;
        }

        .sp-field input:focus, .sp-field select:focus { border-color: #286993; }
        .sp-field input.bad, .sp-field select.bad { border-color: #ef4444; }

        .sp-err { color: #b91c1c; font-size: 11px; margin-top: 4px; }

        .sp-modal-actions {
          display: flex; justify-content: flex-end; gap: 8px; margin-top: 18px;
        }

        .sp-cancel {
          background: rgba(100,116,139,0.12); color: #475569; border: none;
          border-radius: 8px; padding: 9px 16px;
          font-size: 13px; font-weight: 600; cursor: pointer;
        }

        .sp-view-row {
          display: flex; justify-content: space-between; gap: 12px;
          font-size: 13px; padding: 8px 0;
          border-bottom: 1px solid rgba(40,105,147,0.08);
        }

        .sp-view-row span:first-child { color: #64748b; }
        .sp-view-row span:last-child  { font-weight: 600; text-align: right; word-break: break-word; }

        .sp-section-title { font-size: 13px; font-weight: 700; margin: 16px 0 6px; }
      `}</style>

      <div className="sp-page">

        <header className="sp-topbar">
          <div className="sp-brand">
            <div className="sp-brand-icon"><Dog size={20} /></div>
            <div>
              <h1>PetConnect</h1>
              <p>Shelter Management</p>
            </div>
          </div>

          <button className="sp-back" onClick={() => navigate('/dashboard/admin')}>
            <ArrowLeft size={15} /> Back to Dashboard
          </button>
        </header>

        <div className="sp-container">

          <div className="sp-heading">
            <h2>Shelters</h2>
            <p>Add, edit and remove shelters, and see which admin manages each one.</p>
          </div>

          {/* summary strip - counted from the rows already loaded */}
          <div className="sp-summary">
            <div className="sp-sum-card">
              <div className="sp-sum-icon"><Building2 size={19} /></div>
              <div>
                <div className="sp-sum-num">{loading ? '...' : shelters.length}</div>
                <div className="sp-sum-label">Shelters shown</div>
              </div>
            </div>

            <div className="sp-sum-card">
              <div className="sp-sum-icon"><CheckCircle size={19} /></div>
              <div>
                <div className="sp-sum-num">{loading ? '...' : countByStatus('active')}</div>
                <div className="sp-sum-label">Active</div>
              </div>
            </div>

            <div className="sp-sum-card">
              <div className="sp-sum-icon"><Clock size={19} /></div>
              <div>
                <div className="sp-sum-num">{loading ? '...' : countByStatus('pending')}</div>
                <div className="sp-sum-label">Pending</div>
              </div>
            </div>

            <div className="sp-sum-card">
              <div className="sp-sum-icon"><XCircle size={19} /></div>
              <div>
                <div className="sp-sum-num">{loading ? '...' : countByStatus('inactive')}</div>
                <div className="sp-sum-label">Inactive</div>
              </div>
            </div>
          </div>

          <div className="sp-card">

            <div className="sp-card-head">
              <div>
                <h3>Shelter Directory</h3>
                <p>Each row is one row of the shelters table, joined to its admin.</p>
              </div>
              <button className="sp-btn" onClick={openAdd}>
                <Plus size={15} /> Add New Shelter
              </button>
            </div>

            {/*
              The filters only set state. The useEffect notices and re-runs the
              query, so MySQL does the filtering with a WHERE clause - we never
              download every shelter and sift through them in the browser.
            */}
            <div className="sp-filters">
              <div className="sp-search">
                <Search size={15} color="#64748b" />
                <input
                  type="text"
                  placeholder="Search by name, location or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <select
                className="sp-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All statuses</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="inactive">Inactive</option>
              </select>

              <button className="sp-btn-ghost" onClick={loadShelters} title="Re-run the SELECT">
                <RefreshCw size={13} /> Refresh
              </button>
            </div>

            <div className="sp-table-wrap">
              <table className="sp-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Shelter</th>
                    <th>Location</th>
                    <th>Assigned Admin</th>
                    <th>Contact</th>
                    <th>Staff</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {/*
                    Three different things can happen when you query a database,
                    and each needs its own message:
                      still waiting / the query failed / it worked but found nothing.
                    Showing a blank table for all three is the classic bug - a
                    dead server then looks exactly like an empty database.
                  */}
                  {loading && (
                    <tr>
                      <td colSpan={8} className="sp-msg">
                        <RefreshCw size={14} className="sp-spin" /> Loading shelters...
                      </td>
                    </tr>
                  )}

                  {!loading && loadError && (
                    <tr><td colSpan={8} className="sp-msg error">{loadError}</td></tr>
                  )}

                  {!loading && !loadError && shelters.length === 0 && (
                    <tr>
                      <td colSpan={8} className="sp-msg">
                        No shelters matched. The query returned 0 rows.
                      </td>
                    </tr>
                  )}

                  {/*
                    key must be the PRIMARY KEY - it is unique and stable, which
                    is what React needs to tell rows apart. Never use the array
                    index: it shifts when a row is deleted.
                  */}
                  {!loading && !loadError && shelters.map((shelter) => (
                    <tr key={shelter.id}>
                      <td>SLT{String(shelter.id).padStart(3, '0')}</td>

                      <td>
                        <strong
                          style={{ cursor: 'pointer', color: '#286993' }}
                          onClick={() => navigate(`/shelters/admin/${shelter.id}`)}
                        >
                          {shelter.name}
                        </strong>
                      </td>

                      <td>{shelter.location}</td>

                      {/*
                        admin_name and admin_email are NOT columns of shelters -
                        they arrived through the LEFT JOIN to users. They are
                        null when nobody is assigned.
                      */}
                      <td>
                        {shelter.admin_name ? (
                          <>
                            <strong>{shelter.admin_name}</strong>
                            <br />
                            <span className="sp-muted">{shelter.admin_email}</span>
                          </>
                        ) : (
                          <span className="sp-none">Not assigned</span>
                        )}
                      </td>

                      <td>
                        {shelter.contact_email}
                        <br />
                        <span className="sp-muted">{shelter.contact_phone}</span>
                      </td>

                      {/* staff_count came from a COUNT(*) subquery in the SQL */}
                      <td>{shelter.staff_count}</td>

                      <td>
                        <span className={`sp-badge ${shelter.status}`}>{shelter.status}</span>
                      </td>

                      <td>
                        <div className="sp-actions">
                          {/* Opens that shelter's own page (its pets, staff, reviews) */}
                          <button
                            className="sp-icon-btn"
                            title="Open shelter page"
                            onClick={() => navigate(`/shelters/admin/${shelter.id}`)}
                          >
                            <Eye size={14} />
                          </button>
                          <button className="sp-icon-btn" title="Edit" onClick={() => openEdit(shelter)}>
                            <Edit size={14} />
                          </button>
                          <button className="sp-icon-btn danger" title="Delete" onClick={() => handleDelete(shelter)}>
                            <Trash2 size={14} />
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

      {/* ---------------- ADD / EDIT MODAL ---------------- */}
      {modalOpen && (
        <div className="sp-backdrop">
          <div className="sp-modal">

            <div className="sp-modal-head">
              <div>
                <h3>{editingId ? 'Edit Shelter' : 'Add New Shelter'}</h3>
                <p>
                  {editingId
                    ? `UPDATE shelters SET ... WHERE id = ${editingId}`
                    : 'INSERT INTO shelters (...) VALUES (...)'}
                </p>
              </div>
              <button className="sp-close" onClick={() => setModalOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="sp-field">
                <label>Shelter Name <span className="sp-hint">- column: name (UNIQUE)</span></label>
                <input
                  type="text" name="name" value={form.name} onChange={handleChange}
                  className={formErrors.name ? 'bad' : ''} placeholder="Paws Rescue"
                />
                {formErrors.name && <div className="sp-err">{formErrors.name[0]}</div>}
              </div>

              <div className="sp-field">
                <label>Location <span className="sp-hint">- column: location</span></label>
                <input
                  type="text" name="location" value={form.location} onChange={handleChange}
                  className={formErrors.location ? 'bad' : ''} placeholder="Dhaka, Bangladesh"
                />
                {formErrors.location && <div className="sp-err">{formErrors.location[0]}</div>}
              </div>

              {/* ERD attribute `description`. Nullable, so it can be left blank. */}
              <div className="sp-field">
                <label>Description <span className="sp-hint">- column: description (optional)</span></label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="What this shelter does, who it helps..."
                  style={{
                    width: '100%',
                    border: '1px solid rgba(40,105,147,0.25)',
                    borderRadius: '8px',
                    padding: '9px 11px',
                    fontSize: '13px',
                    color: '#102c45',
                    outline: 'none',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div className="sp-field">
                <label>Contact Email <span className="sp-hint">- column: contact_email (UNIQUE)</span></label>
                <input
                  type="email" name="contact_email" value={form.contact_email} onChange={handleChange}
                  className={formErrors.contact_email ? 'bad' : ''} placeholder="contact@shelter.org"
                />
                {formErrors.contact_email && <div className="sp-err">{formErrors.contact_email[0]}</div>}
              </div>

              <div className="sp-field">
                <label>Contact Phone <span className="sp-hint">- column: contact_phone</span></label>
                <input
                  type="text" name="contact_phone" value={form.contact_phone} onChange={handleChange}
                  className={formErrors.contact_phone ? 'bad' : ''} placeholder="01712345678"
                />
                {formErrors.contact_phone && <div className="sp-err">{formErrors.contact_phone[0]}</div>}
              </div>

              <div className="sp-field">
                <label>Status <span className="sp-hint">- column: status (ENUM)</span></label>
                {/* These are exactly the values the ENUM allows, so an invalid
                    one cannot even be typed - the UI mirrors the constraint. */}
                <select
                  name="status" value={form.status} onChange={handleChange}
                  className={formErrors.status ? 'bad' : ''}
                >
                  <option value="active">active</option>
                  <option value="pending">pending</option>
                  <option value="inactive">inactive</option>
                </select>
                {formErrors.status && <div className="sp-err">{formErrors.status[0]}</div>}
              </div>

              <div className="sp-field">
                <label>
                  Assigned Admin <span className="sp-hint">- column: admin_id (foreign key to users.id)</span>
                </label>
                {/* We save the admin's ID, not their name. The id is the foreign
                    key; a name would break the moment somebody renamed themselves. */}
                <select
                  name="admin_id" value={form.admin_id} onChange={handleChange}
                  className={formErrors.admin_id ? 'bad' : ''}
                >
                  <option value="">-- No admin assigned --</option>
                  {admins.map((admin) => (
                    <option key={admin.id} value={admin.id}>
                      {admin.name} ({admin.email})
                      {admin.manages_count > 0 ? ` - manages ${admin.manages_count}` : ''}
                    </option>
                  ))}
                </select>
                {formErrors.admin_id && <div className="sp-err">{formErrors.admin_id[0]}</div>}
              </div>

              <div className="sp-modal-actions">
                <button type="button" className="sp-cancel" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="sp-btn" disabled={saving}>
                  {saving ? 'Saving...' : editingId ? 'Update Shelter' : 'Create Shelter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* The old view modal is gone - the Eye button now opens the
          shelter's own page at /shelters/admin/:id instead. */}

    </>
  );
}
