import React, { useState } from 'react';
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
  Wrench, 
  Eye, 
  Edit, 
  Trash2, 
  Plus 
} from 'lucide-react';

export default function AdminDashboard({ darkMode, toggleDarkMode, setCurrentPage }) {
  const [activeTab, setActiveTab] = useState('dashboard');

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
            <div className="sidebar-brand" onClick={() => setCurrentPage && setCurrentPage('landing')}>
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
                onClick={() => setActiveTab('shelters')}
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
            <button 
              className="logout-btn"
              onClick={() => setCurrentPage && setCurrentPage('landing')}
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

              <div className="admin-profile-pill">
                <img 
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" 
                  alt="Admin" 
                  className="admin-avatar" 
                />
                <div className="admin-info">
                  <div className="admin-name">Alex M.</div>
                  <div className="admin-role">Global Admin</div>
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
                  <div className="stat-number">142</div>
                  <div className="stat-label">Total Shelters</div>
                </div>
                <span className="stat-action" onClick={() => setActiveTab('shelters')}>View all shelters</span>
              </div>

              <div className="stat-card">
                <div className="stat-icon-wrapper">
                  <Users size={20} />
                </div>
                <div className="stat-details">
                  <div className="stat-number">12K+</div>
                  <div className="stat-label">Platform Users</div>
                </div>
                <span className="stat-action">View users</span>
              </div>

              <div className="stat-card">
                <div className="stat-icon-wrapper">
                  <Flag size={20} />
                </div>
                <div className="stat-details">
                  <div className="stat-number">7</div>
                  <div className="stat-label">Open Complaints</div>
                </div>
                <span className="stat-action" onClick={() => setActiveTab('complaints')}>Review now</span>
              </div>

              <div className="stat-card">
                <div className="stat-icon-wrapper">
                  <ShieldAlert size={20} />
                </div>
                <div className="stat-details">
                  <div className="stat-number">1</div>
                  <div className="stat-label">Security Alerts</div>
                </div>
                <span className="stat-action">View alerts</span>
              </div>

              <div className="stat-card">
                <div className="stat-icon-wrapper">
                  <Wrench size={20} />
                </div>
                <div className="stat-details">
                  <div className="stat-number">58</div>
                  <div className="stat-label">Admin Actions</div>
                </div>
                <span className="stat-action">View logs</span>
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
                  <button className="action-btn-sm">
                    <Plus size={16} /> Add New Shelter
                  </button>
                </div>

                <div className="table-responsive">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Shelter Name</th>
                        <th>Location</th>
                        <th>Admin Contact</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>SLT001</td>
                        <td>
                          <div className="shelter-cell">
                            <img src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=60&auto=format&fit=crop&q=80" alt="Paws Rescue" className="shelter-thumb" />
                            Paws Rescue
                          </div>
                        </td>
                        <td>Dhaka, Bangladesh</td>
                        <td>Emily R.</td>
                        <td><span className="status-badge active">Active</span></td>
                        <td>
                          <div className="table-actions">
                            <button className="table-action-icon" title="View"><Eye size={14} /></button>
                            <button className="table-action-icon" title="Edit"><Edit size={14} /></button>
                            <button className="table-action-icon delete" title="Delete"><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td>SLT002</td>
                        <td>
                          <div className="shelter-cell">
                            <img src="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=60&auto=format&fit=crop&q=80" alt="Happy Tails" className="shelter-thumb" />
                            Happy Tails Shelter
                          </div>
                        </td>
                        <td>Chattogram, Bangladesh</td>
                        <td>John D.</td>
                        <td><span className="status-badge active">Active</span></td>
                        <td>
                          <div className="table-actions">
                            <button className="table-action-icon" title="View"><Eye size={14} /></button>
                            <button className="table-action-icon" title="Edit"><Edit size={14} /></button>
                            <button className="table-action-icon delete" title="Delete"><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td>SLT003</td>
                        <td>
                          <div className="shelter-cell">
                            <img src="https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=60&auto=format&fit=crop&q=80" alt="City Kitty" className="shelter-thumb" />
                            City Kitty Care
                          </div>
                        </td>
                        <td>Sylhet, Bangladesh</td>
                        <td>Sarah L.</td>
                        <td><span className="status-badge pending">Pending</span></td>
                        <td>
                          <div className="table-actions">
                            <button className="table-action-icon" title="View"><Eye size={14} /></button>
                            <button className="table-action-icon" title="Edit"><Edit size={14} /></button>
                            <button className="table-action-icon delete" title="Delete"><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td>SLT004</td>
                        <td>
                          <div className="shelter-cell">
                            <img src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=60&auto=format&fit=crop&q=80" alt="Animal Haven" className="shelter-thumb" />
                            Animal Haven BD
                          </div>
                        </td>
                        <td>Rajshahi, Bangladesh</td>
                        <td>Michael T.</td>
                        <td><span className="status-badge inactive">Inactive</span></td>
                        <td>
                          <div className="table-actions">
                            <button className="table-action-icon" title="View"><Eye size={14} /></button>
                            <button className="table-action-icon" title="Edit"><Edit size={14} /></button>
                            <button className="table-action-icon delete" title="Delete"><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td>SLT005</td>
                        <td>
                          <div className="shelter-cell">
                            <img src="https://images.unsplash.com/photo-1517849845537-4d257902454a?w=60&auto=format&fit=crop&q=80" alt="Hope for Paws" className="shelter-thumb" />
                            Hope for Paws
                          </div>
                        </td>
                        <td>Khulna, Bangladesh</td>
                        <td>Linda K.</td>
                        <td><span className="status-badge active">Active</span></td>
                        <td>
                          <div className="table-actions">
                            <button className="table-action-icon" title="View"><Eye size={14} /></button>
                            <button className="table-action-icon" title="Edit"><Edit size={14} /></button>
                            <button className="table-action-icon delete" title="Delete"><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
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
    </>
  );
}