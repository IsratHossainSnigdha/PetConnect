import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Dog,
  LayoutDashboard,
  FileText,
  Settings,
  User,
  Search,
  Bell,
  Moon,
  Sun,
  LogOut,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Heart,
  Flag,
} from "lucide-react";

import "./adopterApplications.css";

export default function AdopterApplications({
  darkMode,
  toggleDarkMode,
}) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const applications = [
    {
      id: 1,
      petName: "Max",
      type: "Golden Retriever",
      shelter: "Happy Paws Shelter",
      date: "Aug 18, 2026",
      status: "Pending",
    },
    {
      id: 2,
      petName: "Luna",
      type: "Persian Cat",
      shelter: "Safe Haven",
      date: "Aug 15, 2026",
      status: "Approved",
    },
    {
      id: 3,
      petName: "Rocky",
      type: "German Shepherd",
      shelter: "Hope Animal Center",
      date: "Aug 10, 2026",
      status: "Rejected",
    },
  ];

  /* =========================
     SEARCH
  ========================= */

  const filteredApplications = applications.filter(
    (application) =>
      application.petName
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      application.type
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      application.shelter
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      application.status
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  /* =========================
     STATUS ICON
  ========================= */

  const getStatusIcon = (status) => {
    if (status === "Approved") {
      return <CheckCircle size={17} />;
    }

    if (status === "Rejected") {
      return <XCircle size={17} />;
    }

    return <Clock size={17} />;
  };

  /* =========================
     LOGOUT
  ========================= */

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  /* =========================
     NAVIGATION
  ========================= */

  const goToComplaints = () => {
    navigate("/complaints/adopter");
  };

  return (
    <div
      className={`app-container ${
        darkMode ? "dark" : ""
      }`}
    >
      {/* =========================
          SIDEBAR
      ========================= */}

      <aside className="sidebar">
        {/* LOGO */}

        <div
          className="logo"
          onClick={() =>
            navigate("/dashboard/adopter")
          }
        >
          <div className="logo-icon">
            <Dog size={23} />
          </div>

          <div className="logo-text">
            PET
            <br />
            CONNECT
          </div>
        </div>

        {/* MENU */}

        <div className="menu">
          <button
            type="button"
            className="menu-item"
            onClick={() =>
              navigate("/dashboard/adopter")
            }
          >
            <LayoutDashboard size={18} />

            <span>Dashboard</span>
          </button>

          <button
            type="button"
            className="menu-item active"
            onClick={() =>
              navigate("/applications/adopter")
            }
          >
            <FileText size={18} />

            <span>My Applications</span>
          </button>

          <button
            type="button"
            className="menu-item"
            onClick={() =>
              navigate("/profile/adopter")
            }
          >
            <User size={18} />

            <span>Profile</span>
          </button>

          <button
            type="button"
            className="menu-item"
            onClick={goToComplaints}
          >
            <Flag size={18} />

            <span>Complaints</span>
          </button>

          <button
            type="button"
            className="menu-item"
            onClick={() =>
              navigate("/settings/adopter")
            }
          >
            <Settings size={18} />

            <span>Settings</span>
          </button>
        </div>

        {/* LOGOUT */}

        <div className="sidebar-bottom">
          <button
            type="button"
            className="menu-item"
            onClick={logout}
          >
            <LogOut size={18} />

            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* =========================
          MAIN
      ========================= */}

      <main className="main">
        {/* TOPBAR */}

        <header className="topbar">
          <div className="page-title">
            <h1>My Applications</h1>

            <p>
              Track your pet adoption applications
            </p>
          </div>

          <div className="top-actions">
            <button
              type="button"
              className="icon-btn"
              onClick={toggleDarkMode}
              title="Toggle theme"
            >
              {darkMode ? (
                <Sun size={18} />
              ) : (
                <Moon size={18} />
              )}
            </button>

            <button
              type="button"
              className="icon-btn"
              title="Notifications"
            >
              <Bell size={18} />
            </button>

            <button
              type="button"
              className="profile-btn"
              onClick={() =>
                navigate("/profile/adopter")
              }
            >
              <div className="profile-avatar">
                <User size={18} />
              </div>

              <div className="profile-info">
                <div className="profile-name">
                  Adopter
                </div>

                <div className="profile-role">
                  Pet Adopter
                </div>
              </div>
            </button>
          </div>
        </header>

        {/* =========================
            CONTENT
        ========================= */}

        <section className="content">
          {/* STATISTICS */}

          <div className="stats">
            <div className="stat-card">
              <div className="stat-icon">
                <FileText size={21} />
              </div>

              <div>
                <div className="stat-number">
                  {applications.length}
                </div>

                <div className="stat-label">
                  Total Applications
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <Clock size={21} />
              </div>

              <div>
                <div className="stat-number">
                  {
                    applications.filter(
                      (application) =>
                        application.status ===
                        "Pending"
                    ).length
                  }
                </div>

                <div className="stat-label">
                  Pending
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <Heart size={21} />
              </div>

              <div>
                <div className="stat-number">
                  {
                    applications.filter(
                      (application) =>
                        application.status ===
                        "Approved"
                    ).length
                  }
                </div>

                <div className="stat-label">
                  Approved
                </div>
              </div>
            </div>
          </div>

          {/* APPLICATION SECTION */}

          <div className="application-section">
            <div className="section-header">
              <div className="section-title">
                <h2>Adoption Applications</h2>

                <p>
                  View and track all your submitted
                  applications.
                </p>
              </div>

              <div className="search-box">
                <Search size={17} />

                <input
                  type="text"
                  placeholder="Search applications..."
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                />
              </div>
            </div>

            <div className="application-list">
              <div className="application-row table-header">
                <div>Pet</div>
                <div>Shelter</div>
                <div>Application Date</div>
                <div>Status</div>
                <div>Action</div>
              </div>

              {filteredApplications.length === 0 ? (
                <div className="empty">
                  No applications found.
                </div>
              ) : (
                filteredApplications.map(
                  (application) => (
                    <div
                      className="application-row"
                      key={application.id}
                    >
                      <div className="pet-info">
                        <div className="pet-avatar">
                          <Dog size={21} />
                        </div>

                        <div>
                          <div className="pet-name">
                            {application.petName}
                          </div>

                          <div className="pet-type">
                            {application.type}
                          </div>
                        </div>
                      </div>

                      <div className="text">
                        {application.shelter}
                      </div>

                      <div className="date">
                        {application.date}
                      </div>

                      <div>
                        <span
                          className={`status ${application.status.toLowerCase()}`}
                        >
                          {getStatusIcon(
                            application.status
                          )}

                          {application.status}
                        </span>
                      </div>

                      <div>
                        <button
                          type="button"
                          className="view-btn"
                          title="View Application"
                        >
                          <Eye size={17} />
                        </button>
                      </div>
                    </div>
                  )
                )
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}