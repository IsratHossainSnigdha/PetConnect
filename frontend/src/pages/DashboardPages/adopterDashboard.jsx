import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  LayoutDashboard,
  FileText,
  User,
  Settings,
  Bell,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  Clock,
  CheckCircle,
  XCircle,
  ChevronRight,
  PawPrint,
  Flag,
} from "lucide-react";

import {
  apiFetch,
  getToken,
  getCachedUser,
  setSession,
  clearSession,
} from "../../api/client";

import "./adopterDashboard.css";

const AdopterDashboard = ({ darkMode, toggleDarkMode }) => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const token = getToken();

        if (!token) {
          navigate("/auth/login");
          return;
        }

        // Get authenticated user
        const meResponse = await apiFetch("/auth/me");

        const authenticatedUser =
          meResponse?.user || meResponse;

        if (authenticatedUser) {
          setUser(authenticatedUser);
          setSession(token, authenticatedUser);
        } else {
          const cachedUser = getCachedUser();

          if (cachedUser) {
            setUser(cachedUser);
          }
        }

        // Get adopter dashboard data
        const dashboardResponse =
          await apiFetch("/adopter/dashboard");

        setDashboard(dashboardResponse);
      } catch (err) {
        console.error("Dashboard error:", err);

        if (err?.status === 401) {
          clearSession();
          navigate("/auth/login");
          return;
        }

        setError(
          err?.message ||
            "Unable to load dashboard. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await apiFetch("/auth/logout", {
        method: "POST",
      });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      clearSession();
      navigate("/auth/login");
    }
  };

  const goTo = (path) => {
    setSidebarOpen(false);
    navigate(path);
  };

  if (loading) {
    return (
      <div
        className={`adopter-dashboard ${
          darkMode ? "dark" : ""
        }`}
      >
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`adopter-dashboard ${
          darkMode ? "dark" : ""
        }`}
      >
        <div className="dashboard-error">
          <XCircle size={48} />

          <h2>Something went wrong</h2>

          <p>{error}</p>

          <button
            className="primary-button"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const stats = dashboard?.stats || {};

  const totalApplications = stats.total ?? 0;
  const pendingApplications = stats.pending ?? 0;
  const approvedApplications = stats.approved ?? 0;
  const rejectedApplications = stats.rejected ?? 0;

  const firstName =
    user?.name?.split(" ")[0] || "Adopter";

  return (
    <div
      className={`adopter-dashboard ${
        darkMode ? "dark" : ""
      }`}
    >
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ================= SIDEBAR ================= */}

      <aside
        className={`adopter-sidebar ${
          sidebarOpen ? "sidebar-open" : ""
        }`}
      >
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="logo-icon">
            <PawPrint size={24} />
          </div>

          <div>
            <h2>PetConnect</h2>
            <span>Adopter Portal</span>
          </div>

          <button
            className="mobile-close"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={22} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">

          <button
            className="nav-item active"
            onClick={() =>
              goTo("/dashboard/adopter")
            }
          >
            <LayoutDashboard size={19} />
            <span>Dashboard</span>
          </button>

          <button
            className="nav-item"
            onClick={() =>
              goTo("/applications/adopter")
            }
          >
            <FileText size={19} />
            <span>My Applications</span>
          </button>

          <button
            className="nav-item"
            onClick={() =>
              goTo("/profile/adopter")
            }
          >
            <User size={19} />
            <span>My Profile</span>
          </button>

          <button
            className="nav-item"
            onClick={() =>
              goTo("/complaints/adopter")
            }
          >
            <Flag size={19} />
            <span>Complaints</span>
          </button>

        </nav>

        {/* Bottom navigation */}
        <div className="sidebar-bottom">

          <button
            className="nav-item"
            onClick={() =>
              goTo("/profile/adopter")
            }
          >
            <Settings size={19} />
            <span>Settings</span>
          </button>

          <button
            className="nav-item logout-item"
            onClick={handleLogout}
          >
            <LogOut size={19} />
            <span>Logout</span>
          </button>

        </div>
      </aside>

      {/* ================= MAIN ================= */}

      <main className="adopter-main">

        {/* Header */}
        <header className="dashboard-header">

          <div className="header-left">

            <button
              className="mobile-menu"
              onClick={() =>
                setSidebarOpen(true)
              }
            >
              <Menu size={23} />
            </button>

            <div>
              <h1>Dashboard</h1>

              <p>
                Welcome back, {firstName}!
              </p>
            </div>

          </div>

          {/* Header actions */}
          <div className="header-actions">

            {/* Notifications */}
            <button
              className="icon-button"
              title="Notifications"
            >
              <Bell size={20} />

              <span className="notification-dot"></span>
            </button>

            {/* Dark mode */}
            <button
              className="icon-button"
              onClick={toggleDarkMode}
              title={
                darkMode
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
            >
              {darkMode ? (
                <Sun size={20} />
              ) : (
                <Moon size={20} />
              )}
            </button>

            {/* Profile */}
            <button
              className="profile-mini"
              onClick={() =>
                goTo("/profile/adopter")
              }
            >
              <div className="profile-avatar">
                {(user?.name || "A")
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div className="profile-mini-info">

                <strong>
                  {user?.name || "Adopter"}
                </strong>

                <span>Adopter</span>

              </div>
            </button>

          </div>
        </header>

        {/* ================= CONTENT ================= */}

        <div className="dashboard-content">

          {/* Page heading */}
          <div className="dashboard-page-heading">

            <div>
              <h2>Overview</h2>

              <p>
                Keep track of your adoption applications.
              </p>
            </div>

          </div>

          {/* ================= STATISTICS ================= */}

          <section className="section">

            <div className="stats-grid">

              {/* Total */}
              <div className="stat-card">

                <div className="stat-icon total">
                  <FileText size={21} />
                </div>

                <div className="stat-info">

                  <span>
                    Total Applications
                  </span>

                  <strong>
                    {totalApplications}
                  </strong>

                </div>

              </div>

              {/* Pending */}
              <div className="stat-card">

                <div className="stat-icon pending">
                  <Clock size={21} />
                </div>

                <div className="stat-info">

                  <span>Pending</span>

                  <strong>
                    {pendingApplications}
                  </strong>

                </div>

              </div>

              {/* Approved */}
              <div className="stat-card">

                <div className="stat-icon approved">
                  <CheckCircle size={21} />
                </div>

                <div className="stat-info">

                  <span>Approved</span>

                  <strong>
                    {approvedApplications}
                  </strong>

                </div>

              </div>

              {/* Rejected */}
              <div className="stat-card">

                <div className="stat-icon rejected">
                  <XCircle size={21} />
                </div>

                <div className="stat-info">

                  <span>Rejected</span>

                  <strong>
                    {rejectedApplications}
                  </strong>

                </div>

              </div>

            </div>

          </section>

          {/* ================= QUICK ACTIONS ================= */}

          <section className="section">

            <div className="section-heading">

              <div>
                <h2>Quick Access</h2>

                <p>
                  Manage your PetConnect account.
                </p>
              </div>

            </div>

            <div className="quick-actions">

              {/* My Applications */}
              <button
                className="quick-action-card"
                onClick={() =>
                  goTo("/applications/adopter")
                }
              >

                <div className="quick-action-icon">
                  <FileText size={21} />
                </div>

                <div>
                  <strong>
                    My Applications
                  </strong>

                  <span>
                    Check your application status
                  </span>
                </div>

                <ChevronRight size={19} />

              </button>

              {/* My Profile */}
              <button
                className="quick-action-card"
                onClick={() =>
                  goTo("/profile/adopter")
                }
              >

                <div className="quick-action-icon">
                  <User size={21} />
                </div>

                <div>
                  <strong>
                    My Profile
                  </strong>

                  <span>
                    View and update your profile
                  </span>
                </div>

                <ChevronRight size={19} />

              </button>

              {/* Complaints */}
              <button
                className="quick-action-card"
                onClick={() =>
                  goTo("/complaints/adopter")
                }
              >

                <div className="quick-action-icon">
                  <Flag size={21} />
                </div>

                <div>
                  <strong>
                    Complaints
                  </strong>

                  <span>
                    Submit or track a complaint
                  </span>
                </div>

                <ChevronRight size={19} />

              </button>

            </div>

          </section>

        </div>
      </main>
    </div>
  );
};

export default AdopterDashboard;