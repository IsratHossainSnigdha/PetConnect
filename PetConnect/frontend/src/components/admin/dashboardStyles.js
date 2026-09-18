/*
|==============================================================================
| ADMIN DASHBOARD STYLES   (issue #34)
|==============================================================================
|
| The dashboard CSS used to sit in a 900-line template literal in the middle of
| adminDashboard.jsx, which buried the actual component logic.
|
| It is exported as a plain string and injected by the page with a <style> tag,
| exactly as before - the styles are unchanged, they just live somewhere you can
| find them.
|
| These class names are shared: AdminSidebar, AdminTopbar and StatCards all use
| them, which is why the CSS stays with the page that renders those components
| rather than being split up too.
*/

const dashboardStyles = `
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
`;

export default dashboardStyles;
