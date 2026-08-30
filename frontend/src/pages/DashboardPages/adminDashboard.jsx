import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from "react-router-dom";
import {
  Dog,
  Sun,
  Moon,
  LayoutDashboard,
  Building2,
  Flag,
  BarChart3,
  Settings,
  LogOut,
  Bell,
  ChevronDown,
  Home,
  Users,
  ShieldAlert,
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
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: Arial, Helvetica, sans-serif;
        }

        html, body, #root {
          width: 100%;
          height: 100%;
          overflow: hidden;
        }

        .dashboard-container {
          width: 100vw;
          height: 100vh;
          background: linear-gradient(135deg, #d8e8f8, #f0f4f8, #d0ede4, #e6d8ff, #dcf0f8);
          background-size: 500% 500%;
          animation: globalMeshFlow 18s ease infinite;
          position: relative;
          display: flex;
          overflow: hidden;
          color: #102c45;
        }

        @keyframes globalMeshFlow {
          0% { background-position: 0% 50%; }
          25% { background-position: 50% 100%; }
          50% { background-position: 100% 50%; }
          75% { background-position: 50% 0%; }
          100% { background-position: 0% 50%; }
        }

        /* Ambient Orbs */
        .dashboard-container::before {
          content: '';
          position: absolute;
          top: -120px;
          left: -120px;
          width: 500px;
          height: 500px;
          background: rgba(40, 105, 147, 0.12);
          border-radius: 50%;
          filter: blur(85px);
          z-index: 1;
          animation: floatOrb1 12s ease-in-out infinite alternate;
          pointer-events: none;
        }

        .dashboard-container::after {
          content: '';
          position: absolute;
          bottom: -150px;
          right: -120px;
          width: 550px;
          height: 550px;
          background: rgba(30, 88, 125, 0.15);
          border-radius: 50%;
          filter: blur(95px);
          z-index: 1;
          animation: floatOrb2 15s ease-in-out infinite alternate;
          pointer-events: none;
        }

        @keyframes floatOrb1 {
          0% { transform: translate(0, 0) scale(1) rotate(0deg); }
          50% { transform: translate(80px, 100px) scale(1.2) rotate(45deg); }
          100% { transform: translate(-40px, 60px) scale(0.95) rotate(90deg); }
        }

        @keyframes floatOrb2 {
          0% { transform: translate(0, 0) scale(1) rotate(0deg); }
          50% { transform: translate(-100px, -80px) scale(1.25) rotate(-45deg); }
          100% { transform: translate(60px, -40px) scale(1.05) rotate(-90deg); }
        }

        .paw-pattern-bg {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          z-index: 2;
          pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512' width='55' height='55' fill='rgba(40, 105, 147, 0.05)'%3E%3Cg transform='rotate(28 256 256)'%3E%3Cpath d='M256 210c-30.9 0-56 25.1-56 56s25.1 56 56 56 56-25.1 56-56-25.1-56-56-56zm-84-28c14.9 0 27-12.1 27-27s-12.1-27-27-27-27 12.1-27 27 12.1 27 27 27zm168 0c14.9 0 27-12.1 27-27s-12.1-27-27-27-27 12.1-27 27 12.1 27 27 27zM108 300c16.6 0 30-13.4 30-30s-13.4-30-30-30-30 13.4-30 30 13.4 30 30 30zm296 0c16.6 0 30-13.4 30-30s-13.4-30-30-30-30 13.4-30 30 13.4 30 30 30 z'/%3E%3C/g%3E%3C/svg%3E");
          background-size: 210px 210px;
        }

        /* Sidebar */
        .sidebar {
          width: 260px;
          height: 100%;
          background: rgba(230, 240, 250, 0.9);
          backdrop-filter: blur(15px);
          -webkit-backdrop-filter: blur(15px);
          border-right: 1px solid rgba(255, 255, 255, 0.8);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 24px 18px;
          z-index: 10;
          box-shadow: 4px 0 20px rgba(0, 0, 0, 0.03);
          flex-shrink: 0;
        }

        .sidebar-top {
          display: flex;
          flex-direction: column;
          gap: 30px;
        }

        .sidebar-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
        }

        .brand-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #286993;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 4px 10px rgba(40, 105, 147, 0.3);
        }

        .brand-title {
          font-size: 16px;
          font-weight: 700;
          color: #102c45;
          line-height: 1.2;
        }

        .brand-subtitle {
          font-size: 11px;
          color: #64748b;
          font-weight: 500;
        }

        .sidebar-menu {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .menu-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          color: #64748b;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
          width: 100%;
        }

        .menu-item:hover {
          background: rgba(40, 105, 147, 0.1);
          color: #286993;
        }

        .menu-item.active {
          background: #286993;
          color: white;
          box-shadow: 0 4px 15px rgba(40, 105, 147, 0.3);
        }

        .sidebar-bottom {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .logout-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          color: #ef4444;
          background: rgba(239, 68, 68, 0.08);
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          width: 100%;
        }

        .logout-btn:hover {
          background: rgba(239, 68, 68, 0.15);
        }

        /* Main Content Wrapper */
        .main-wrapper {
          flex: 1;
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow: hidden;
          z-index: 10;
        }

        /* Top Navbar */
        .dash-navbar {
          height: 75px;
          background: rgba(230, 240, 250, 0.9);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 32px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
          border-bottom: 1px solid rgba(255, 255, 255, 0.8);
          flex-shrink: 0;
        }

        .dash-welcome h1 {
          font-size: 20px;
          font-weight: 700;
          color: #102c45;
        }

        .dash-welcome p {
          font-size: 13px;
          color: #64748b;
        }

        .dash-nav-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .icon-badge-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(40, 105, 147, 0.1);
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #286993;
          cursor: pointer;
          position: relative;
          transition: background 0.2s;
        }

        .icon-badge-btn:hover {
          background: rgba(40, 105, 147, 0.18);
        }

        .badge-dot {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 8px;
          height: 8px;
          background: #ef4444;
          border-radius: 50%;
          border: 2px solid #e2edf5;
        }

        .admin-profile-pill {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 6px 12px;
          background: rgba(40, 105, 147, 0.08);
          border-radius: 30px;
          cursor: pointer;
          border: 1px solid rgba(40, 105, 147, 0.15);
        }

        .admin-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          object-fit: cover;
        }

        .admin-info .admin-name {
          font-size: 13px;
          font-weight: 700;
          color: #102c45;
        }

        .admin-info .admin-role {
          font-size: 11px;
          color: #64748b;
        }

        /* Content Area */
        .dash-content {
          flex: 1;
          padding: 24px 32px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .dash-content::-webkit-scrollbar {
          width: 6px;
        }
        .dash-content::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 16px;
        }

        .stat-card {
          background: rgba(230, 240, 250, 0.85);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          padding: 18px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.9);
          display: flex;
          flex-direction: column;
          gap: 12px;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .stat-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 14px 30px rgba(40, 105, 147, 0.1);
        }

        .stat-icon-wrapper {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: rgba(40, 105, 147, 0.12);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #286993;
        }

        .stat-details .stat-number {
          font-size: 20px;
          font-weight: 700;
          color: #102c45;
        }

        .stat-details .stat-label {
          font-size: 12px;
          color: #64748b;
          font-weight: 600;
        }

        .stat-action {
          font-size: 11px;
          font-weight: 700;
          color: #286993;
          cursor: pointer;
          display: inline-block;
          margin-top: auto;
        }

        .stat-action:hover {
          text-decoration: underline;
        }

        /* Two Column Section */
        .dash-grid-lower {
          display: grid;
          grid-template-columns: 2fr 1.2fr;
          gap: 20px;
        }

        .dash-card {
          background: rgba(230, 240, 250, 0.85);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.9);
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .dash-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .dash-card-title h3 {
          font-size: 16px;
          font-weight: 700;
          color: #102c45;
        }

        .dash-card-title p {
          font-size: 12px;
          color: #64748b;
        }

        .action-btn-sm {
          background: #286993;
          color: white;
          border: none;
          padding: 8px 14px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          box-shadow: 0 4px 12px rgba(40, 105, 147, 0.2);
          transition: background 0.2s;
        }

        .action-btn-sm:hover {
          background: #1f587d;
        }

        .action-btn-outline {
          background: transparent;
          color: #102c45;
          border: 1px solid rgba(40, 105, 147, 0.2);
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
        }

        /* Table Styling */
        .table-responsive {
          width: 100%;
          overflow-x: auto;
        }

        .custom-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
          text-align: left;
        }

        .custom-table th {
          background: rgba(40, 105, 147, 0.08);
          color: #64748b;
          font-weight: 600;
          padding: 10px 12px;
          border-bottom: 1px solid rgba(40, 105, 147, 0.12);
        }

        .custom-table td {
          padding: 12px;
          border-bottom: 1px solid rgba(40, 105, 147, 0.08);
          color: #102c45;
          vertical-align: middle;
        }

        .shelter-cell {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 600;
        }

        .shelter-thumb {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          object-fit: cover;
        }

        .status-badge {
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          display: inline-block;
        }

        .status-badge.active {
          background: rgba(16, 185, 129, 0.12);
          color: #059669;
        }

        .status-badge.pending {
          background: rgba(245, 158, 11, 0.12);
          color: #d97706;
        }

        .status-badge.inactive {
          background: rgba(100, 116, 139, 0.12);
          color: #64748b;
        }

        .table-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .table-action-icon {
          width: 28px;
          height: 28px;
          border-radius: 6px;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          background: rgba(40, 105, 147, 0.1);
          color: #286993;
          transition: background 0.2s;
        }

        .table-action-icon:hover {
          background: rgba(40, 105, 147, 0.2);
        }

        .table-action-icon.delete:hover {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
        }

        /* ---- States for real data loading (empty / error / spinner) ---- */
        .table-message {
          padding: 24px 12px;
          text-align: center;
          font-size: 13px;
          color: #64748b;
        }

        .table-message.error {
          color: #b91c1c;
        }

        .spin {
          animation: spinner 0.9s linear infinite;
          display: inline-block;
        }

        @keyframes spinner {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        /* ---- Filter bar above the shelter table ---- */
        .filter-bar {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 12px 0;
          flex-wrap: wrap;
        }

        .filter-search {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(255, 255, 255, 0.7);
          border: 1px solid rgba(40, 105, 147, 0.2);
          border-radius: 8px;
          padding: 6px 10px;
          flex: 1;
          min-width: 160px;
        }

        .filter-search input {
          border: none;
          outline: none;
          background: transparent;
          font-size: 12px;
          width: 100%;
          color: #102c45;
        }

        .filter-select {
          border: 1px solid rgba(40, 105, 147, 0.2);
          border-radius: 8px;
          padding: 7px 10px;
          font-size: 12px;
          background: rgba(255, 255, 255, 0.7);
          color: #102c45;
          cursor: pointer;
        }

        /* ---- Modal (Add / Edit shelter form) ---- */
        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(16, 44, 69, 0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 50;
          padding: 20px;
        }

        .modal-card {
          background: #ffffff;
          border-radius: 14px;
          width: 100%;
          max-width: 460px;
          max-height: 90vh;
          overflow-y: auto;
          padding: 22px;
          box-shadow: 0 20px 50px rgba(16, 44, 69, 0.3);
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .modal-header h3 {
          font-size: 17px;
          font-weight: 700;
          color: #102c45;
        }

        .modal-header p {
          font-size: 12px;
          color: #64748b;
          margin-top: 2px;
        }

        .modal-close {
          background: rgba(40, 105, 147, 0.1);
          border: none;
          border-radius: 8px;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #286993;
          flex-shrink: 0;
        }

        .form-field {
          margin-bottom: 13px;
        }

        .form-field label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: #102c45;
          margin-bottom: 5px;
        }

        .form-field .col-hint {
          font-weight: 400;
          color: #94a3b8;
          font-size: 11px;
        }

        .form-field input,
        .form-field select {
          width: 100%;
          border: 1px solid rgba(40, 105, 147, 0.25);
          border-radius: 8px;
          padding: 9px 11px;
          font-size: 13px;
          color: #102c45;
          outline: none;
          background: #fff;
        }

        .form-field input:focus,
        .form-field select:focus {
          border-color: #286993;
        }

        .form-field input.has-error,
        .form-field select.has-error {
          border-color: #ef4444;
        }

        .field-error {
          color: #b91c1c;
          font-size: 11px;
          margin-top: 4px;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          margin-top: 18px;
        }

        .modal-actions button {
          padding: 9px 16px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          border: none;
        }

        .btn-cancel {
          background: rgba(100, 116, 139, 0.12);
          color: #475569;
        }

        .btn-save {
          background: #286993;
          color: #fff;
        }

        .btn-save:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* ---- View panel: shelter + its related staff rows ---- */
        .view-row {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          font-size: 13px;
          padding: 7px 0;
          border-bottom: 1px solid rgba(40, 105, 147, 0.08);
        }

        .view-row span:first-child {
          color: #64748b;
        }

        .view-row span:last-child {
          color: #102c45;
          font-weight: 600;
          text-align: right;
          word-break: break-word;
        }

        .view-section-title {
          font-size: 13px;
          font-weight: 700;
          color: #102c45;
          margin: 16px 0 6px;
        }

        /* Complaints List (Right Side) */
        .complaints-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .complaint-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px;
          background: rgba(255, 255, 255, 0.5);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.8);
          cursor: pointer;
          transition: background 0.2s;
        }

        .complaint-item:hover {
          background: rgba(255, 255, 255, 0.8);
        }

        .complaint-left {
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }

        .complaint-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .complaint-details h4 {
          font-size: 13px;
          font-weight: 700;
          color: #102c45;
        }

        .complaint-details p {
          font-size: 11px;
          color: #64748b;
          margin-top: 2px;
        }

        .complaint-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;
        }

        .priority-badge {
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 10px;
          font-weight: 700;
        }

        .priority-badge.high {
          background: rgba(239, 68, 68, 0.12);
          color: #ef4444;
        }

        .priority-badge.medium {
          background: rgba(245, 158, 11, 0.12);
          color: #d97706;
        }

        .priority-badge.low {
          background: rgba(59, 130, 246, 0.12);
          color: #2563eb;
        }

        .complaint-time {
          font-size: 10px;
          color: #64748b;
        }

        /* Dashboard Footer */
        .dashboard-footer {
          text-align: center;
          font-size: 12px;
          color: #64748b;
          padding: 10px 0 0 0;
          margin-top: auto;
        }

        /* Dark Mode overrides */
        .dashboard-container.dark {
          background: linear-gradient(135deg, #050d14, #0b1721, #101f2b, #07121a, #09151e);
          color: white;
        }

        .dashboard-container.dark .sidebar {
          background: rgba(30, 48, 61, 0.85);
          border-right: 1px solid rgba(255, 255, 255, 0.05);
        }

        .dashboard-container.dark .brand-title,
        .dashboard-container.dark .dash-welcome h1,
        .dashboard-container.dark .stat-number,
        .dashboard-container.dark .dash-card-title h3,
        .dashboard-container.dark .custom-table td,
        .dashboard-container.dark .admin-name,
        .dashboard-container.dark .complaint-details h4 {
          color: white;
        }

        .dashboard-container.dark .dash-navbar {
          background: rgba(30, 48, 61, 0.85);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .dashboard-container.dark .stat-card,
        .dashboard-container.dark .dash-card,
        .dashboard-container.dark .complaint-item {
          background: rgba(30, 48, 61, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
        }

        .dashboard-container.dark .complaint-item:hover {
          background: rgba(40, 65, 82, 0.85);
        }
      `}</style>

      <div className={`dashboard-container ${darkMode ? 'dark' : ''}`}>
        <div className="paw-pattern-bg"></div>

        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-top">
            <div className="sidebar-brand" onClick={() => navigate("/")}>
              <div className="brand-icon">
                <Dog size={22} />
              </div>
              <div>
                <div className="brand-title">Pet Admin</div>
                <div className="brand-subtitle">Platform Administration</div>
              </div>
            </div>

            <div className="sidebar-menu">
              <button 
                className={`menu-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => setActiveTab('dashboard')}
              >
                <LayoutDashboard size={18} /> Dashboard
              </button>
              <button 
                className={`menu-item ${activeTab === 'shelters' ? 'active' : ''}`}
                onClick={() => navigate('/shelters/admin')}
              >
                <Building2 size={18} /> Shelters
              </button>
              <button 
                className={`menu-item ${activeTab === 'complaints' ? 'active' : ''}`}
                onClick={() => setActiveTab('complaints')}
              >
                <Flag size={18} /> Complaints
              </button>
              <button 
                className={`menu-item ${activeTab === 'reports' ? 'active' : ''}`}
                onClick={() => setActiveTab('reports')}
              >
                <BarChart3 size={18} /> Reports
              </button>
              <button 
                className={`menu-item ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => setActiveTab('settings')}
              >
                <Settings size={18} /> Settings
              </button>
            </div>
          </div>

          <div className="sidebar-bottom">
            {/*
              A real logout now: this DELETEs the row from
              personal_access_tokens so the token stops working server-side.
              Simply navigating away would leave it valid.
            */}
            <button
              className="logout-btn"
              onClick={handleLogout}
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="main-wrapper">
          {/* Top Navigation */}
          <header className="dash-navbar">
            <div className="dash-welcome">
              <h1>Dashboard</h1>
              <p>Welcome back, Alex M.</p>
            </div>

            <div className="dash-nav-right">
              <button 
                className="icon-badge-btn"
                onClick={toggleDarkMode}
                title="Toggle Theme"
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              <button className="icon-badge-btn">
                <Bell size={18} />
                <span className="badge-dot"></span>
              </button>

            <div
  className="admin-profile-pill"
  onClick={() => navigate("/profile/admin")}
>
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                  alt={currentUser?.name || 'Admin'}
                  className="admin-avatar"
                />
                <div className="admin-info">
                  {/*
                    The real signed-in user, from GET /auth/me.
                    ?. is optional chaining - currentUser is null until the
                    request comes back, and reading .name off null would crash.
                  */}
                  <div className="admin-name">{currentUser?.name || 'Loading...'}</div>
                  <div className="admin-role">
                    {currentUser?.role === 'platform_admin' ? 'Global Admin' : currentUser?.role}
                  </div>
                </div>
                <ChevronDown size={14} color="#64748b" />
              </div>
            </div>
          </header>

          {/* Dashboard Scrollable Body */}
          <div className="dash-content">
            {/* Top Stat Cards */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon-wrapper">
                  <Home size={20} />
                </div>
                <div className="stat-details">
                  {/*
                    Every number below comes from GET /admin/stats, which runs
                    SELECT COUNT(*) and GROUP BY queries. MySQL does the
                    counting and sends back one small number per card.

                    `stats` is null until that request returns, so each value
                    falls back to '...' rather than rendering a misleading 0.
                  */}
                  <div className="stat-number">{stats ? stats.total_shelters : '...'}</div>
                  <div className="stat-label">Total Shelters</div>
                </div>
                <span className="stat-action" onClick={() => navigate('/shelters/admin')}>View all shelters</span>
              </div>

              <div className="stat-card">
                <div className="stat-icon-wrapper">
                  <Users size={20} />
                </div>
                <div className="stat-details">
                  {/* SELECT COUNT(*) FROM users; */}
                  <div className="stat-number">{stats ? stats.total_users : '...'}</div>
                  <div className="stat-label">Platform Users</div>
                </div>
                <span className="stat-action">
                  {stats ? `${stats.total_adopters} adopters, ${stats.total_staff} staff` : ''}
                </span>
              </div>

              <div className="stat-card">
                <div className="stat-icon-wrapper">
                  <Flag size={20} />
                </div>
                <div className="stat-details">
                  {/* From GROUP BY status - shelters awaiting approval */}
                  <div className="stat-number">{stats ? stats.pending_shelters : '...'}</div>
                  <div className="stat-label">Pending Approval</div>
                </div>
                <span className="stat-action" onClick={() => setStatusFilter('pending')}>Review now</span>
              </div>

              {/*
                TOTAL PETS  (issue #20)
                    SELECT COUNT(*) FROM pets;
              */}
              <div className="stat-card">
                <div className="stat-icon-wrapper">
                  <Dog size={20} />
                </div>
                <div className="stat-details">
                  <div className="stat-number">{stats ? stats.total_pets : '...'}</div>
                  <div className="stat-label">Total Pets</div>
                </div>
                <span className="stat-action">Across all shelters</span>
              </div>

              {/*
                PENDING COMPLAINTS  (issue #20)
                    SELECT COUNT(*) FROM complaints WHERE status = 'Pending';
              */}
              <div className="stat-card">
                <div className="stat-icon-wrapper">
                  <ShieldAlert size={20} />
                </div>
                <div className="stat-details">
                  <div className="stat-number">{stats ? stats.pending_complaints : '...'}</div>
                  <div className="stat-label">Pending Complaints</div>
                </div>
                <span className="stat-action" onClick={() => setActiveTab('complaints')}>
                  Review now
                </span>
              </div>
            </div>

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