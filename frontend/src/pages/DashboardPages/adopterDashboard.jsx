import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Dog,
  LayoutDashboard,
  FileText,
  User,
  Settings,
  Search,
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

export default function AdopterDashboard({
  darkMode,
  toggleDarkMode,
}) {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");

  /* =========================
     BACKEND DATA
  ========================= */

  const [dashboardData, setDashboardData] = useState(null);
  const [applications, setApplications] = useState([]);

  const [currentUser, setCurrentUser] = useState(
    getCachedUser()
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =========================
     FETCH DASHBOARD
  ========================= */

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const token = getToken();

        if (!token) {
          navigate("/login");
          return;
        }

        /* Get authenticated user */
        const userResponse = await apiFetch("/auth/me");

        const authenticatedUser = userResponse.user;

        setCurrentUser(authenticatedUser);

        setSession(
          token,
          authenticatedUser
        );

        /* Get dashboard data */
        const data = await apiFetch(
          "/adopter/dashboard"
        );

        console.log(
          "Adopter dashboard response:",
          data
        );

        setDashboardData(data);

        setApplications(
          Array.isArray(data.applications)
            ? data.applications
            : []
        );

      } catch (err) {
        console.error(
          "Dashboard error:",
          err
        );

        if (err.status === 401) {
          clearSession();
          navigate("/login");
          return;
        }

        setError(
          err.message ||
            "Unable to load dashboard."
        );

      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [navigate]);

  /* =========================
     NAVIGATION
  ========================= */

  const handleNavigation = (page) => {
    setActivePage(page);
    setSidebarOpen(false);

    if (page === "dashboard") {
      navigate("/dashboard/adopter");
    }

    if (page === "applications") {
      navigate("/applications/adopter");
    }

    if (page === "profile") {
      navigate("/profile/adopter");
    }

    if (page === "complaints") {
      navigate("/complaints/adopter");
    }

    if (page === "settings") {
      setActivePage("settings");
    }
  };

  /* =========================
     LOGOUT
  ========================= */

  const handleLogout = async () => {
    try {
      await apiFetch("/auth/logout", {
        method: "POST",
      });
    } catch (err) {
      console.error(
        "Logout error:",
        err
      );
    } finally {
      clearSession();
      navigate("/login");
    }
  };

  /* =========================
     USER
  ========================= */

  const user = currentUser || {};

  const userName =
    user.name ||
    user.username ||
    "Adopter";

  const avatarLetter =
    userName.charAt(0).toUpperCase();

  /* =========================
     STATISTICS
  ========================= */

  const statistics =
    dashboardData?.statistics || {};

  const totalApplications =
    statistics.total_applications ??
    applications.length;

  const pendingApplications =
    statistics.pending_applications ??
    applications.filter(
      (application) =>
        application.status?.toLowerCase() ===
        "pending"
    ).length;

  const approvedApplications =
    statistics.approved_applications ??
    applications.filter(
      (application) =>
        application.status?.toLowerCase() ===
        "approved"
    ).length;

  const rejectedApplications =
    statistics.rejected_applications ??
    applications.filter(
      (application) =>
        application.status?.toLowerCase() ===
        "rejected"
    ).length;

  /* =========================
     SEARCH
  ========================= */

  const filteredApplications =
    applications.filter((application) => {
      const search =
        searchQuery.toLowerCase();

      const petName =
        application.pet?.name ||
        application.pet_name ||
        application.petName ||
        "";

      const petType =
        application.pet?.type ||
        application.pet_type ||
        application.type ||
        application.breed ||
        "";

      const shelter =
        application.pet?.shelter?.name ||
        application.shelter?.name ||
        application.shelter_name ||
        application.shelterName ||
        "";

      const status =
        application.status || "";

      return (
        petName
          .toLowerCase()
          .includes(search) ||
        petType
          .toLowerCase()
          .includes(search) ||
        shelter
          .toLowerCase()
          .includes(search) ||
        status
          .toLowerCase()
          .includes(search)
      );
    });

  /* =========================
     APPLICATION HELPERS
  ========================= */

  const getPetName = (application) => {
    return (
      application.pet?.name ||
      application.pet_name ||
      application.petName ||
      "Unknown Pet"
    );
  };

  const getPetType = (application) => {
    return (
      application.pet?.type ||
      application.pet_type ||
      application.type ||
      application.breed ||
      "Pet"
    );
  };

  const getShelterName = (application) => {
    return (
      application.pet?.shelter?.name ||
      application.shelter?.name ||
      application.shelter_name ||
      application.shelterName ||
      "Unknown Shelter"
    );
  };

  const getApplicationDate = (
    application
  ) => {
    const date =
      application.created_at ||
      application.date ||
      application.application_date;

    if (!date) {
      return "Date unavailable";
    }

    const parsedDate = new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return date;
    }

    return parsedDate.toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    );
  };

  const getStatusIcon = (status) => {
    const normalizedStatus =
      status?.toLowerCase();

    if (
      normalizedStatus ===
      "approved"
    ) {
      return (
        <CheckCircle size={17} />
      );
    }

    if (
      normalizedStatus ===
      "rejected"
    ) {
      return (
        <XCircle size={17} />
      );
    }

    return <Clock size={17} />;
  };

  /* =========================
     LOADING
  ========================= */

  if (loading) {
    return (
      <div
        className={`dashboard-container ${
          darkMode ? "dark" : ""
        }`}
      >
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>

          <h3>
            Loading your dashboard...
          </h3>

          <p>
            Please wait while we fetch your
            adoption information.
          </p>
        </div>
      </div>
    );
  }

  /* =========================
     ERROR
  ========================= */

  if (error) {
    return (
      <div
        className={`dashboard-container ${
          darkMode ? "dark" : ""
        }`}
      >
        <div className="dashboard-error">
          <div className="error-icon">
            <XCircle size={28} />
          </div>

          <h3>
            Unable to load dashboard
          </h3>

          <p>{error}</p>

          <button
            className="retry-btn"
            onClick={() =>
              window.location.reload()
            }
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`dashboard-container ${
        darkMode ? "dark" : ""
      }`}
    >

      {/* MOBILE SIDEBAR OVERLAY */}

      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() =>
            setSidebarOpen(false)
          }
        />
      )}

      {/* SIDEBAR */}

      <aside
        className={`sidebar ${
          sidebarOpen ? "open" : ""
        }`}
      >

        {/* LOGO */}

        <div
          className="sidebar-logo"
          onClick={() =>
            navigate(
              "/dashboard/adopter"
            )
          }
        >
          <div className="logo-icon">
            <Dog size={23} />
          </div>

          <div className="logo-text">
            PET
            <br />
            <span>CONNECT</span>
          </div>
        </div>

        {/* NAVIGATION */}

        <div className="sidebar-content">

          <div className="sidebar-label">
            Main Menu
          </div>

          <button
            className={`nav-item ${
              activePage === "dashboard"
                ? "active"
                : ""
            }`}
            onClick={() =>
              handleNavigation(
                "dashboard"
              )
            }
          >
            <LayoutDashboard size={19} />
            <span>Dashboard</span>
          </button>

          <button
            className={`nav-item ${
              activePage === "applications"
                ? "active"
                : ""
            }`}
            onClick={() =>
              handleNavigation(
                "applications"
              )
            }
          >
            <FileText size={19} />

            <span>
              My Applications
            </span>
          </button>

          <button
            className={`nav-item ${
              activePage === "profile"
                ? "active"
                : ""
            }`}
            onClick={() =>
              handleNavigation(
                "profile"
              )
            }
          >
            <User size={19} />
            <span>Profile</span>
          </button>

          <button
            className={`nav-item ${
              activePage === "complaints"
                ? "active"
                : ""
            }`}
            onClick={() =>
              handleNavigation(
                "complaints"
              )
            }
          >
            <Flag size={19} />
            <span>Complaints</span>
          </button>

          <button
            className={`nav-item ${
              activePage === "settings"
                ? "active"
                : ""
            }`}
            onClick={() =>
              handleNavigation(
                "settings"
              )
            }
          >
            <Settings size={19} />
            <span>Settings</span>
          </button>

        </div>

        {/* LOGOUT */}

        <div className="sidebar-bottom">

          <button
            className="logout-btn"
            onClick={handleLogout}
          >
            <LogOut size={19} />
            <span>Logout</span>
          </button>

        </div>

      </aside>

      {/* MAIN */}

      <div className="main-wrapper">

        {/* TOPBAR */}

        <header className="topbar">

          <div className="topbar-left">

            <button
              className="mobile-menu-btn"
              onClick={() =>
                setSidebarOpen(
                  !sidebarOpen
                )
              }
            >
              {sidebarOpen ? (
                <X size={20} />
              ) : (
                <Menu size={20} />
              )}
            </button>

            <div className="page-title">

              <h1>
                {activePage ===
                  "dashboard"
                  ? "Dashboard"
                  : activePage ===
                    "applications"
                  ? "My Applications"
                  : activePage ===
                    "profile"
                  ? "Profile"
                  : activePage ===
                    "complaints"
                  ? "Complaints"
                  : "Settings"}
              </h1>

              <p>
                Manage your Pet Connect
                account
              </p>

            </div>

          </div>

          <div className="topbar-right">

            <div className="search-box">

              <Search size={17} />

              <input
                type="text"
                placeholder="Search applications..."
                value={searchQuery}
                onChange={(e) =>
                  setSearchQuery(
                    e.target.value
                  )
                }
              />

            </div>

            <button
              className="theme-btn"
              onClick={
                toggleDarkMode
              }
              title="Toggle Theme"
            >
              {darkMode ? (
                <Sun size={18} />
              ) : (
                <Moon size={18} />
              )}
            </button>

            <button
              className="icon-btn"
              title="Notifications"
            >
              <Bell size={18} />

              <span className="notification-dot" />
            </button>

            <button
              className="profile-btn"
              onClick={() =>
                navigate(
                  "/profile/adopter"
                )
              }
              title="View Profile"
            >
              <div className="profile-avatar">
                {avatarLetter}
              </div>

              <div className="profile-info">
                <strong>
                  {userName}
                </strong>

                <span>
                  Adopter
                </span>
              </div>
            </button>

          </div>

        </header>

        {/* CONTENT */}

        <main className="content">

          {/* =========================
              DASHBOARD
          ========================= */}

          {activePage ===
            "dashboard" && (
            <>

              <section className="welcome-section">

                <h2>
                  Welcome back,{" "}
                  {userName}! 🐾
                </h2>

                <p>
                  Keep track of your
                  adoption journey and find
                  your perfect companion.
                </p>

              </section>

              {/* STATISTICS */}

              <section className="stats-grid">

                <div className="stat-card">

                  <div className="stat-info">
                    <p>
                      Total Applications
                    </p>

                    <h3>
                      {totalApplications}
                    </h3>
                  </div>

                  <div className="stat-icon orange-icon">
                    <FileText size={21} />
                  </div>

                </div>

                <div className="stat-card">

                  <div className="stat-info">
                    <p>Pending</p>

                    <h3>
                      {pendingApplications}
                    </h3>
                  </div>

                  <div className="stat-icon blue-icon">
                    <Clock size={21} />
                  </div>

                </div>

                <div className="stat-card">

                  <div className="stat-info">
                    <p>Approved</p>

                    <h3>
                      {approvedApplications}
                    </h3>
                  </div>

                  <div className="stat-icon green-icon">
                    <CheckCircle size={21} />
                  </div>

                </div>

                <div className="stat-card">

                  <div className="stat-info">
                    <p>Rejected</p>

                    <h3>
                      {rejectedApplications}
                    </h3>
                  </div>

                  <div className="stat-icon red-icon">
                    <XCircle size={21} />
                  </div>

                </div>

              </section>

              {/* DASHBOARD GRID */}

              <section className="dashboard-grid">

                {/* RECENT APPLICATIONS */}

                <div className="section-card">

                  <div className="section-header">

                    <h3>
                      Recent Applications
                    </h3>

                    <button
                      className="view-all-btn"
                      onClick={() =>
                        handleNavigation(
                          "applications"
                        )
                      }
                    >
                      View All
                    </button>

                  </div>

                  <div className="application-list">

                    {filteredApplications.length >
                    0 ? (
                      filteredApplications.map(
                        (application) => (
                          <div
                            className="application-row"
                            key={
                              application.id
                            }
                          >

                            <div className="pet-info">

                              <div className="pet-avatar">
                                <PawPrint
                                  size={21}
                                />
                              </div>

                              <div className="pet-details">

                                <h4>
                                  {getPetName(
                                    application
                                  )}
                                </h4>

                                <p>
                                  {getPetType(
                                    application
                                  )}
                                  {" • "}
                                  {getShelterName(
                                    application
                                  )}
                                </p>

                              </div>

                            </div>

                            <div className="application-meta">

                              <span
                                className={`status ${
                                  (
                                    application.status ||
                                    "Pending"
                                  ).toLowerCase()
                                }`}
                              >
                                {getStatusIcon(
                                  application.status
                                )}

                                {application.status ||
                                  "Pending"}
                              </span>

                              <span className="application-date">
                                {getApplicationDate(
                                  application
                                )}
                              </span>

                            </div>

                          </div>
                        )
                      )
                    ) : (
                      <div className="empty-state">

                        <div className="empty-state-icon">
                          <Search size={23} />
                        </div>

                        <h4>
                          No applications found
                        </h4>

                        <p>
                          {searchQuery
                            ? "Try searching with a different keyword."
                            : "You haven't submitted any adoption applications yet."}
                        </p>

                      </div>
                    )}

                  </div>

                </div>

                {/* QUICK ACTIONS */}

                <div className="section-card">

                  <div className="section-header">

                    <h3>
                      Quick Actions
                    </h3>

                  </div>

                  <div className="quick-actions">

                    {/* APPLICATIONS */}

                    <button
                      className="quick-action"
                      onClick={() =>
                        handleNavigation(
                          "applications"
                        )
                      }
                    >
                      <div className="quick-action-icon">
                        <FileText size={18} />
                      </div>

                      <div className="quick-action-text">
                        <strong>
                          My Applications
                        </strong>

                        <span>
                          Track your adoption
                          applications
                        </span>
                      </div>

                      <ChevronRight size={16} />
                    </button>

                    {/* PROFILE */}

                    <button
                      className="quick-action"
                      onClick={() =>
                        navigate(
                          "/profile/adopter"
                        )
                      }
                    >
                      <div className="quick-action-icon">
                        <User size={18} />
                      </div>

                      <div className="quick-action-text">
                        <strong>
                          My Profile
                        </strong>

                        <span>
                          View and edit your
                          information
                        </span>
                      </div>

                      <ChevronRight size={16} />
                    </button>

                    {/* SETTINGS */}

                    <button
                      className="quick-action"
                      onClick={() =>
                        handleNavigation(
                          "settings"
                        )
                      }
                    >
                      <div className="quick-action-icon">
                        <Settings size={18} />
                      </div>

                      <div className="quick-action-text">
                        <strong>
                          Settings
                        </strong>

                        <span>
                          Manage your account
                        </span>
                      </div>

                      <ChevronRight size={16} />
                    </button>

                  </div>

                </div>

              </section>

            </>
          )}

          {/* =========================
              APPLICATIONS
          ========================= */}

          {activePage ===
            "applications" && (
            <section className="section-card">

              <div className="section-header">

                <h3>
                  My Applications
                </h3>

                <span className="application-count">
                  {totalApplications}{" "}
                  applications
                </span>

              </div>

              <div className="application-list">

                {filteredApplications.length >
                0 ? (
                  filteredApplications.map(
                    (application) => (
                      <div
                        className="application-row"
                        key={
                          application.id
                        }
                      >

                        <div className="pet-info">

                          <div className="pet-avatar">
                            <PawPrint
                              size={21}
                            />
                          </div>

                          <div className="pet-details">

                            <h4>
                              {getPetName(
                                application
                              )}
                            </h4>

                            <p>
                              {getPetType(
                                application
                              )}
                              {" • "}
                              {getShelterName(
                                application
                              )}
                            </p>

                          </div>

                        </div>

                        <div className="application-meta">

                          <span
                            className={`status ${
                              (
                                application.status ||
                                "Pending"
                              ).toLowerCase()
                            }`}
                          >
                            {getStatusIcon(
                              application.status
                            )}

                            {application.status ||
                              "Pending"}
                          </span>

                          <span className="application-date">
                            {getApplicationDate(
                              application
                            )}
                          </span>

                        </div>

                      </div>
                    )
                  )
                ) : (
                  <div className="empty-state">

                    <div className="empty-state-icon">
                      <FileText size={23} />
                    </div>

                    <h4>
                      No applications
                    </h4>

                    <p>
                      You haven't submitted
                      any adoption
                      applications yet.
                    </p>

                  </div>
                )}

              </div>

            </section>
          )}

          {/* =========================
              SETTINGS
          ========================= */}

          {activePage ===
            "settings" && (
            <section className="section-card">

              <div className="section-header">

                <h3>
                  Settings
                </h3>

              </div>

              <div className="settings-content">

                <div className="settings-option">

                  <div>

                    <strong>
                      Dark Mode
                    </strong>

                    <span>
                      Change the appearance
                      of Pet Connect
                    </span>

                  </div>

                  <button
                    className="theme-btn"
                    onClick={
                      toggleDarkMode
                    }
                  >
                    {darkMode ? (
                      <Sun size={18} />
                    ) : (
                      <Moon size={18} />
                    )}
                  </button>

                </div>

              </div>

            </section>
          )}

        </main>

      </div>
    </div>
  );
}