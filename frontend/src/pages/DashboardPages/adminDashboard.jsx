import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Flag,
  Eye,
  Edit,
  Trash2,
  Plus,
  X,
  Search,
  RefreshCw
} from 'lucide-react';

// Our database access layer. Each function is one SQL operation on the
// `shelters` table - see src/api/shelters.js for the full round trip.
import {
  fetchShelters,
  fetchShelter,
  createShelter,
  updateShelter,
  deleteShelter,
  fetchStats,
  fetchAdmins
} from '../../api/shelters';

import { fetchMe, logout } from '../../api/auth';

// Extracted pieces of this page (issue #34)
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminTopbar from '../../components/admin/AdminTopbar';
import StatCards from '../../components/admin/StatCards';
import dashboardStyles from '../../components/admin/dashboardStyles';

// The shape of a blank "Add New Shelter" form. Every key here must match a
// COLUMN NAME in the shelters table, because this object is JSON-encoded and
// handed straight to Laravel's validator, which then inserts it.
const EMPTY_FORM = {
  name: '',
  location: '',
  contact_email: '',
  contact_phone: '',
  status: 'pending',   // matches the DEFAULT 'pending' in the migration

  // issue #17: which platform admin manages this shelter.
  // '' means "nobody assigned" and is sent to the API as null.
  admin_id: '',
};

export default function AdminDashboard({ darkMode, toggleDarkMode, setCurrentPage }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();

  /*
  |--------------------------------------------------------------------------
  | STATE: the React copy of what lives in the database
  |--------------------------------------------------------------------------
  |
  | React can only draw what is in its state. The rows in MySQL are on another
  | machine (well, another process), so the pattern is always:
  |
  |     1. ask the API for rows        (SELECT)
  |     2. store them in state         <- `shelters` below
  |     3. render the table from state
  |     4. after any INSERT/UPDATE/DELETE, re-fetch so state matches the DB again
  |
  | Step 4 is the important habit. If you only edited the local array and
  | skipped the re-fetch, the screen could drift out of sync with the real
  | data - for example it would miss the `updated_at` value that MySQL just
  | generated, or a change another admin made a second ago.
  */
  const [shelters, setShelters] = useState([]);   // the rows from SELECT * FROM shelters
  const [loading, setLoading]   = useState(true); // true while the query is in flight
  const [loadError, setLoadError] = useState(''); // network / server failure message

  // Filters. These are sent to the backend as ?search=&status= and become
  // SQL WHERE clauses - the database does the filtering, not the browser.
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal (the Add / Edit popup form)
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null); // null = creating, number = editing
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({}); // Laravel's 422 errors, per field
  const [saving, setSaving] = useState(false);      // disables the button mid-request

  // "View" popup showing one shelter plus its related staff rows.
  const [viewing, setViewing] = useState(null);

  // The signed-in admin (from GET /auth/me) and the dashboard counters
  // (from GET /admin/stats, which are COUNT/GROUP BY aggregates).
  const [currentUser, setCurrentUser] = useState(null);
  const [stats, setStats] = useState(null);

  /*
  | The list of platform admins that can be assigned to a shelter (issue #17).
  | Loaded once, because it changes far less often than the shelter list.
  */
  const [admins, setAdmins] = useState([]);

  /*
  | Load the signed-in user and the statistics once, when the dashboard opens.
  |
  | Promise.all fires BOTH requests at the same time instead of waiting for the
  | first to finish before starting the second. Two round trips that each take
  | 40ms cost 40ms in total this way, not 80ms.
  */
  useEffect(() => {
    let cancelled = false;

    Promise.all([fetchMe(), fetchStats(), fetchAdmins()])
      .then(([user, statsData, adminData]) => {
        if (cancelled) return;
        setCurrentUser(user);
        setStats(statsData.stats);
        setAdmins(adminData.admins);   // fills the "Assigned Admin" dropdown
      })
      .catch(() => {
        // RequireAuth already handles an expired session by redirecting to
        // /login, so there is nothing useful to show here.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogout = async () => {
    await logout();      // DELETE FROM personal_access_tokens WHERE id = ...
    navigate('/login');
  };

  /*
  | Re-run the COUNT queries after anything that changes the table.
  |
  | This is called only after an INSERT / UPDATE / DELETE - deliberately NOT
  | inside loadShelters(), which also runs on every keystroke in the search box.
  | Searching does not change any counts, so re-counting there would be pure
  | wasted work for the database.
  */
  const refreshStats = async () => {
    try {
      const data = await fetchStats();
      setStats(data.stats);
    } catch {
      // A stale counter is not worth interrupting the user over.
    }
  };

  /*
  |--------------------------------------------------------------------------
  | READ  ->  SELECT * FROM shelters
  |--------------------------------------------------------------------------
  |
  | useCallback keeps this function identity stable between renders, so the
  | useEffect below does not re-run on every single keystroke elsewhere.
  */
  const loadShelters = useCallback(async () => {
    setLoading(true);
    setLoadError('');

    try {
      const data = await fetchShelters({ search, status: statusFilter });
      setShelters(data.shelters);
    } catch (error) {
      // Most common cause: the Laravel server is not running, so fetch() cannot
      // even connect. Say so plainly instead of showing an empty table, which
      // would wrongly look like "there are no shelters".
      setLoadError(error.message || 'Could not reach the server.');
    } finally {
      // finally always runs, success or failure, so the spinner cannot get stuck.
      setLoading(false);
    }
  }, [search, statusFilter]);

  /*
  | Run loadShelters() once when the dashboard mounts, and again whenever the
  | search box or status filter changes.
  |
  | The setTimeout is a DEBOUNCE. Without it, typing "paws" fires four separate
  | SELECT queries (p, pa, paw, paws). Waiting 350ms after the last keystroke
  | sends just one. Every query you avoid is real load taken off MySQL.
  */
  useEffect(() => {
    const timer = setTimeout(() => {
      loadShelters();
    }, 350);

    // The cleanup function cancels the pending timer if the user types again
    // before it fires.
    return () => clearTimeout(timer);
  }, [loadShelters]);

  /*
  |--------------------------------------------------------------------------
  | FORM HELPERS
  |--------------------------------------------------------------------------
  */
  const openCreateModal = () => {
    setEditingId(null);      // null tells handleSave to INSERT rather than UPDATE
    setForm(EMPTY_FORM);
    setFormErrors({});
    setModalOpen(true);
  };

  const openEditModal = (shelter) => {
    setEditingId(shelter.id);   // remember WHICH row - this becomes the SQL WHERE id = ?

    // Pre-fill the form with the row's current values. We copy field by field
    // rather than passing the whole shelter object, because that object also
    // carries id / created_at / staff_count, which are not editable columns.
    setForm({
      name: shelter.name,
      location: shelter.location,
      contact_email: shelter.contact_email,
      contact_phone: shelter.contact_phone,
      status: shelter.status,

      // The database stores NULL when no admin is assigned, but an HTML
      // <select> can only hold a string. ?? '' converts null into the empty
      // option; handleSave converts it back to null on the way out.
      admin_id: shelter.admin_id ?? '',
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    // [name] is a computed key: the input's name attribute must equal the
    // column name, so <input name="location"> updates form.location.
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  /*
  |--------------------------------------------------------------------------
  | CREATE and UPDATE  ->  INSERT INTO ... / UPDATE ... WHERE id = ?
  |--------------------------------------------------------------------------
  |
  | One handler covers both, because the form is identical. The only difference
  | is which SQL statement the backend ends up running, and that is decided by
  | whether editingId holds a row id.
  */
  const handleSave = async (e) => {
    e.preventDefault();      // stop the browser doing a full page reload
    setSaving(true);
    setFormErrors({});

    /*
    | The <select> gives us a STRING ("3") or the empty string. The database
    | column is a number or NULL, so convert before sending:
    |
    |     ""   -> null   (no admin assigned)
    |     "3"  -> 3      (a real foreign key value)
    |
    | Sending "" would fail validation, because "" is not a valid users.id.
    */
    const payload = {
      ...form,
      admin_id: form.admin_id === '' ? null : Number(form.admin_id),
    };

    try {
      if (editingId) {
        await updateShelter(editingId, payload);   // PUT  -> UPDATE
      } else {
        await createShelter(payload);              // POST -> INSERT
      }

      setModalOpen(false);
      await loadShelters();   // re-SELECT so the table shows the saved row
      await refreshStats();   // the counters may have changed too
    } catch (error) {
      if (error.status === 422) {
        // Validation failure. error.errors looks like:
        //   { name: ["The name has already been taken."] }
        // We show each message under its own input instead of one big alert.
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
  | DELETE  ->  DELETE FROM shelters WHERE id = ?
  |--------------------------------------------------------------------------
  */
  const handleDelete = async (shelter) => {
    // A DELETE cannot be undone, so confirm first. (A production system often
    // uses a "soft delete" instead - a deleted_at column that hides the row
    // while keeping the data recoverable.)
    const confirmed = window.confirm(
      `Delete "${shelter.name}"?\n\n` +
      `This removes the row from the shelters table permanently.\n` +
      `Any staff accounts linked to it will have their shelter_id set to NULL ` +
      `because of the ON DELETE SET NULL foreign key - their logins are NOT deleted.`
    );

    if (!confirmed) return;

    try {
      const result = await deleteShelter(shelter.id);
      await loadShelters();   // re-SELECT; the deleted row is simply gone
      await refreshStats();

      if (result.affected_staff > 0) {
        alert(`Shelter deleted. ${result.affected_staff} staff account(s) were unlinked.`);
      }
    } catch (error) {
      alert(error.message);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | VIEW ONE  ->  SELECT ... WHERE id = ?  plus the related staff rows
  |--------------------------------------------------------------------------
  */
  const handleView = async (shelter) => {
    try {
      const data = await fetchShelter(shelter.id);
      setViewing(data.shelter);
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <>
      <style>{dashboardStyles}</style>

      <div className={`dashboard-container ${darkMode ? 'dark' : ''}`}>
        <div className="paw-pattern-bg"></div>

        <AdminSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onLogout={handleLogout}
        />

        {/* Main Content Area */}
        <div className="main-wrapper">
          {/* Top Navigation */}
          <AdminTopbar
            title="Dashboard"
            currentUser={currentUser}
            darkMode={darkMode}
            onToggleTheme={toggleDarkMode}
          />

          {/* Dashboard Scrollable Body */}
          <div className="dash-content">
            {/* Top Stat Cards */}
            <StatCards stats={stats} onFilterPending={() => setStatusFilter('pending')} />
            {/* Lower Two Column Grid (Shelter Management & Complaints to Review) */}
            <div className="dash-grid-lower">
              {/* Left Column: Shelter Management Table */}
              <div className="dash-card">
                <div className="dash-card-header">
                  <div className="dash-card-title">
                    <h3>Shelter Management</h3>
                    <p>Manage shelter directory and records</p>
                  </div>
                  <button className="action-btn-sm" onClick={openCreateModal}>
                    <Plus size={16} /> Add New Shelter
                  </button>
                </div>

                {/*
                  FILTER BAR
                  Both inputs only update state. The useEffect above notices the
                  change and re-runs the query, so MySQL does the filtering with
                  a WHERE clause rather than JavaScript filtering an array here.
                */}
                <div className="filter-bar">
                  <div className="filter-search">
                    <Search size={14} color="#64748b" />
                    <input
                      type="text"
                      placeholder="Search name, location or email..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>

                  <select
                    className="filter-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    {/* An empty value means "no WHERE status clause at all" */}
                    <option value="">All statuses</option>
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="inactive">Inactive</option>
                  </select>

                  <button
                    className="action-btn-outline"
                    onClick={loadShelters}
                    title="Re-run the SELECT query"
                  >
                    <RefreshCw size={13} /> Refresh
                  </button>
                </div>

                <div className="table-responsive">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Shelter Name</th>
                        <th>Location</th>
                        {/* issue #17: comes from the JOIN to the users table */}
                        <th>Assigned Admin</th>
                        <th>Contact</th>
                        <th>Staff</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/*
                        THREE THINGS CAN HAPPEN WHEN YOU QUERY A DATABASE, and a
                        good UI shows all three differently:
                          1. still waiting for the answer  -> spinner
                          2. the query failed              -> error message
                          3. the query worked but found 0 rows -> "no rows" message
                        Collapsing 2 and 3 into a blank table is the classic bug:
                        a dead server then looks exactly like an empty database.
                      */}
                      {loading && (
                        <tr>
                          <td colSpan={8} className="table-message">
                            <RefreshCw size={14} className="spin" /> Loading shelters from the database...
                          </td>
                        </tr>
                      )}

                      {!loading && loadError && (
                        <tr>
                          <td colSpan={8} className="table-message error">
                            {loadError}
                            <br />
                            Is the Laravel server running at {import.meta.env.VITE_API_URL}?
                          </td>
                        </tr>
                      )}

                      {!loading && !loadError && shelters.length === 0 && (
                        <tr>
                          <td colSpan={8} className="table-message">
                            No shelters matched. The query returned 0 rows.
                          </td>
                        </tr>
                      )}

                      {/*
                        .map() turns each ROW from the database into one <tr>.
                        The `key` must be the PRIMARY KEY: it is guaranteed unique
                        and stable, which is exactly what React needs to tell rows
                        apart when the list changes. Never use the array index -
                        it shifts when a row is deleted and React then updates the
                        wrong row.
                      */}
                      {!loading && !loadError && shelters.map((shelter) => (
                        <tr key={shelter.id}>
                          {/* The real AUTO_INCREMENT id, padded for display only */}
                          <td>SLT{String(shelter.id).padStart(3, '0')}</td>

                          <td>
                            <div className="shelter-cell">{shelter.name}</div>
                          </td>

                          <td>{shelter.location}</td>

                          {/*
                            ASSIGNED ADMIN  (issue #17)

                            admin_name and admin_email do not exist in the
                            shelters table - they were pulled in by the
                            LEFT JOIN to users in ShelterController@index.

                            They are null when no admin is assigned, which is
                            why we check before rendering rather than printing
                            an empty box.
                          */}
                          <td>
                            {shelter.admin_name ? (
                              <>
                                <strong>{shelter.admin_name}</strong>
                                <br />
                                <span style={{ color: '#64748b', fontSize: '11px' }}>
                                  {shelter.admin_email}
                                </span>
                              </>
                            ) : (
                              <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>
                                Not assigned
                              </span>
                            )}
                          </td>

                          <td>
                            {shelter.contact_email}
                            <br />
                            <span style={{ color: '#64748b', fontSize: '11px' }}>
                              {shelter.contact_phone}
                            </span>
                          </td>

                          {/*
                            staff_count came from withCount('staff') - a COUNT(*)
                            subquery on the users table, computed by MySQL.
                          */}
                          <td>{shelter.staff_count}</td>

                          <td>
                            {/* The CSS class matches the ENUM value exactly */}
                            <span className={`status-badge ${shelter.status}`}>
                              {shelter.status}
                            </span>
                          </td>

                          <td>
                            <div className="table-actions">
                              <button
                                className="table-action-icon"
                                title="View"
                                onClick={() => handleView(shelter)}
                              >
                                <Eye size={14} />
                              </button>
                              <button
                                className="table-action-icon"
                                title="Edit"
                                onClick={() => openEditModal(shelter)}
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                className="table-action-icon delete"
                                title="Delete"
                                onClick={() => handleDelete(shelter)}
                              >
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


              {/* Right Column: Complaints to Review */}
              <div className="dash-card">
                <div className="dash-card-header">
                  <div className="dash-card-title">
                    <h3>Complaints to Review</h3>
                    <p>Review and take action on reported complaints</p>
                  </div>
                  <button className="action-btn-outline" onClick={() => setActiveTab('complaints')}>View All</button>
                </div>

                <div className="complaints-list">
                  <div className="complaint-item">
                    <div className="complaint-left">
                      <div className="complaint-icon"><Flag size={16} /></div>
                      <div className="complaint-details">
                        <h4>Shelter #SLT003 Conditions</h4>
                        <p>Reported regarding overcrowding in enclosures.</p>
                      </div>
                    </div>
                    <div className="complaint-right">
                      <span className="priority-badge high">High</span>
                      <span className="complaint-time">2 hrs ago</span>
                    </div>
                  </div>

                  <div className="complaint-item">
                    <div className="complaint-left">
                      <div className="complaint-icon"><Flag size={16} /></div>
                      <div className="complaint-details">
                        <h4>Adoption Fee Discrepancy</h4>
                        <p>User reported incorrect listing fee at Paws Rescue.</p>
                      </div>
                    </div>
                    <div className="complaint-right">
                      <span className="priority-badge medium">Medium</span>
                      <span className="complaint-time">Yesterday</span>
                    </div>
                  </div>

                  <div className="complaint-item">
                    <div className="complaint-left">
                      <div className="complaint-icon"><Flag size={16} /></div>
                      <div className="complaint-details">
                        <h4>Unresponsive Shelter Admin</h4>
                        <p>City Kitty Care not responding to adoption queries.</p>
                      </div>
                    </div>
                    <div className="complaint-right">
                      <span className="priority-badge low">Low</span>
                      <span className="complaint-time">3 days ago</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="dashboard-footer">
              <p>&copy; 2026 PetConnect Platform Administration. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>

      {/*
      |------------------------------------------------------------------------
      | ADD / EDIT MODAL  ->  one form, two SQL statements
      |------------------------------------------------------------------------
      |
      | `modalOpen && (...)` is conditional rendering: when modalOpen is false
      | the whole block is simply not in the page.
      |
      | Each input's `name` attribute is the COLUMN NAME in the shelters table.
      | That is what lets handleFormChange update the right field generically,
      | and it is why Laravel's validator recognises every key we send.
      */}
      {modalOpen && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <div>
                <h3>{editingId ? 'Edit Shelter' : 'Add New Shelter'}</h3>
                <p>
                  {editingId
                    ? `UPDATE shelters SET ... WHERE id = ${editingId}`
                    : 'INSERT INTO shelters (...) VALUES (...)'}
                </p>
              </div>
              <button className="modal-close" onClick={() => setModalOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="form-field">
                <label>
                  Shelter Name <span className="col-hint">- column: name (UNIQUE)</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleFormChange}
                  className={formErrors.name ? 'has-error' : ''}
                  placeholder="Paws Rescue"
                />
                {/*
                  formErrors.name is the array Laravel sent back for this column,
                  e.g. ["The name has already been taken."] - which is the UNIQUE
                  constraint being reported in plain English.
                */}
                {formErrors.name && <div className="field-error">{formErrors.name[0]}</div>}
              </div>

              <div className="form-field">
                <label>
                  Location <span className="col-hint">- column: location</span>
                </label>
                <input
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleFormChange}
                  className={formErrors.location ? 'has-error' : ''}
                  placeholder="Dhaka, Bangladesh"
                />
                {formErrors.location && <div className="field-error">{formErrors.location[0]}</div>}
              </div>

              <div className="form-field">
                <label>
                  Contact Email <span className="col-hint">- column: contact_email (UNIQUE)</span>
                </label>
                <input
                  type="email"
                  name="contact_email"
                  value={form.contact_email}
                  onChange={handleFormChange}
                  className={formErrors.contact_email ? 'has-error' : ''}
                  placeholder="contact@shelter.org"
                />
                {formErrors.contact_email && (
                  <div className="field-error">{formErrors.contact_email[0]}</div>
                )}
              </div>

              <div className="form-field">
                <label>
                  Contact Phone <span className="col-hint">- column: contact_phone</span>
                </label>
                <input
                  type="text"
                  name="contact_phone"
                  value={form.contact_phone}
                  onChange={handleFormChange}
                  className={formErrors.contact_phone ? 'has-error' : ''}
                  placeholder="01712345678"
                />
                {formErrors.contact_phone && (
                  <div className="field-error">{formErrors.contact_phone[0]}</div>
                )}
              </div>

              <div className="form-field">
                <label>
                  Status <span className="col-hint">- column: status (ENUM)</span>
                </label>
                {/*
                  These three options are exactly the values allowed by the ENUM
                  in the migration. Using a <select> instead of a text input means
                  an invalid value can never even be typed - the UI mirrors the
                  database constraint.
                */}
                <select
                  name="status"
                  value={form.status}
                  onChange={handleFormChange}
                  className={formErrors.status ? 'has-error' : ''}
                >
                  <option value="active">active</option>
                  <option value="pending">pending</option>
                  <option value="inactive">inactive</option>
                </select>
                {formErrors.status && <div className="field-error">{formErrors.status[0]}</div>}
              </div>

              {/*
                ASSIGNED ADMIN  (issue #17)

                The value saved is the admin's `id`, not their name - that id
                goes into shelters.admin_id, which is the FOREIGN KEY. Storing
                the name instead would break the moment somebody renamed
                themselves, and would let a typo point at nobody at all.
              */}
              <div className="form-field">
                <label>
                  Assigned Admin{' '}
                  <span className="col-hint">- column: admin_id (foreign key to users.id)</span>
                </label>
                <select
                  name="admin_id"
                  value={form.admin_id}
                  onChange={handleFormChange}
                  className={formErrors.admin_id ? 'has-error' : ''}
                >
                  {/* Empty value = store NULL = "nobody is responsible yet" */}
                  <option value="">-- No admin assigned --</option>

                  {admins.map((admin) => (
                    <option key={admin.id} value={admin.id}>
                      {admin.name} ({admin.email})
                      {admin.manages_count > 0 ? ` - manages ${admin.manages_count}` : ''}
                    </option>
                  ))}
                </select>
                {formErrors.admin_id && (
                  <div className="field-error">{formErrors.admin_id[0]}</div>
                )}
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                {/* disabled while saving so a double-click cannot insert two rows */}
                <button type="submit" className="btn-save" disabled={saving}>
                  {saving ? 'Saving...' : editingId ? 'Update Shelter' : 'Create Shelter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/*
      |------------------------------------------------------------------------
      | VIEW PANEL  ->  one shelter and its related staff (the JOIN payoff)
      |------------------------------------------------------------------------
      |
      | This is where the foreign key earns its keep. Because users.shelter_id
      | points at shelters.id, the backend can hand back the staff belonging to
      | this shelter without us storing any names twice.
      */}
      {viewing && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <div>
                <h3>{viewing.name}</h3>
                <p>Row id {viewing.id} of the shelters table</p>
              </div>
              <button className="modal-close" onClick={() => setViewing(null)}>
                <X size={16} />
              </button>
            </div>

            <div className="view-row"><span>Location</span><span>{viewing.location}</span></div>
            <div className="view-row"><span>Contact email</span><span>{viewing.contact_email}</span></div>
            <div className="view-row"><span>Contact phone</span><span>{viewing.contact_phone}</span></div>

            {/* From the LEFT JOIN to users (issue #17) */}
            <div className="view-row">
              <span>Assigned admin</span>
              <span>
                {viewing.admin_name
                  ? `${viewing.admin_name} (${viewing.admin_email})`
                  : 'Not assigned'}
              </span>
            </div>

            <div className="view-row">
              <span>Status</span>
              <span><span className={`status-badge ${viewing.status}`}>{viewing.status}</span></span>
            </div>
            {/* created_at / updated_at are maintained by Laravel automatically */}
            <div className="view-row">
              <span>Created at</span>
              <span>{new Date(viewing.created_at).toLocaleString()}</span>
            </div>
            <div className="view-row">
              <span>Updated at</span>
              <span>{new Date(viewing.updated_at).toLocaleString()}</span>
            </div>

            <div className="view-section-title">
              Linked staff accounts ({viewing.staff?.length ?? 0})
            </div>

            {/* SELECT id, name, email FROM users WHERE shelter_id = <this id> */}
            {viewing.staff && viewing.staff.length > 0 ? (
              viewing.staff.map((member) => (
                <div className="view-row" key={member.id}>
                  <span>{member.name}</span>
                  <span>{member.email}</span>
                </div>
              ))
            ) : (
              <div className="table-message" style={{ padding: '10px 0', textAlign: 'left' }}>
                No user rows have shelter_id = {viewing.id} yet. Staff get linked when
                somebody registers through the shelter signup page.
              </div>
            )}

            <div className="modal-actions">
              <button type="button" className="btn-cancel" onClick={() => setViewing(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}