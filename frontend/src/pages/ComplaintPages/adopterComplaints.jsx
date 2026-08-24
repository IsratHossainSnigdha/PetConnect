import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Dog,
  LayoutDashboard,
  FileText,
  User,
  Settings,
  Bell,
  LogOut,
  Sun,
  Moon,
  MessageSquareWarning,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";

import {
  clearSession,
  apiFetch,
} from "../../api/client";

import {
  getComplaints,
  createComplaint,
} from "../../api/complaints";

import "./adopterComplaints.css";

export default function AdopterComplaints({
  darkMode,
  toggleDarkMode,
}) {
  const navigate = useNavigate();

  const [showForm, setShowForm] = useState(false);

  const [complaints, setComplaints] = useState([]);

  const [loading, setLoading] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");

  const [complaint, setComplaint] = useState({
    subject: "",
    category: "General",
    description: "",
  });

  /* =========================
     LOAD COMPLAINTS
  ========================= */

  useEffect(() => {
    loadComplaints();
  }, []);

  const loadComplaints = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getComplaints();

      setComplaints(data.complaints || []);
    } catch (err) {
      console.error("Failed to load complaints:", err);

      setError(
        err.message ||
          "Failed to load complaints."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     NAVIGATION
  ========================= */

  const handleNavigation = (page) => {
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
      navigate("/settings/adopter");
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
      console.error("Logout error:", err);
    } finally {
      clearSession();
      navigate("/login");
    }
  };

  /* =========================
     FORM
  ========================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !complaint.subject.trim() ||
      !complaint.description.trim()
    ) {
      setError(
        "Please fill in all required fields."
      );

      return;
    }

    try {
      setSubmitting(true);
      setError("");

      await createComplaint({
        subject: complaint.subject.trim(),
        category: complaint.category,
        description:
          complaint.description.trim(),
      });

      setComplaint({
        subject: "",
        category: "General",
        description: "",
      });

      setShowForm(false);

      await loadComplaints();
    } catch (err) {
      console.error(
        "Complaint submission error:",
        err
      );

      setError(
        err.message ||
          "Failed to submit complaint."
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* =========================
     STATUS ICON
  ========================= */

  const getStatusIcon = (status) => {
    if (status === "Resolved") {
      return <CheckCircle size={16} />;
    }

    if (status === "Rejected") {
      return <XCircle size={16} />;
    }

    return <Clock size={16} />;
  };

  /* =========================
     DATE
  ========================= */

  const formatDate = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    );
  };

  return (
    <div
      className={`complaints-container ${
        darkMode ? "dark" : ""
      }`}
    >
      {/* =========================
          SIDEBAR
      ========================= */}

      <aside className="sidebar">

        {/* LOGO */}

        <div
          className="sidebar-logo"
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
            <span>CONNECT</span>
          </div>
        </div>

        {/* MENU */}

        <div className="sidebar-content">

          <div className="sidebar-label">
            Main Menu
          </div>

          {/* Dashboard */}

          <button
            className="nav-item"
            onClick={() =>
              handleNavigation("dashboard")
            }
          >
            <LayoutDashboard size={19} />

            <span>
              Dashboard
            </span>
          </button>

          {/* Applications */}

          <button
            className="nav-item"
            onClick={() =>
              handleNavigation("applications")
            }
          >
            <FileText size={19} />

            <span>
              My Applications
            </span>
          </button>

          {/* Profile */}

          <button
            className="nav-item"
            onClick={() =>
              handleNavigation("profile")
            }
          >
            <User size={19} />

            <span>
              Profile
            </span>
          </button>

          {/* Complaints */}

          <button
            className="nav-item active"
            onClick={() =>
              handleNavigation("complaints")
            }
          >
            <MessageSquareWarning size={19} />

            <span>
              Complaints
            </span>
          </button>

          {/* Settings */}

          <button
            className="nav-item"
            onClick={() =>
              handleNavigation("settings")
            }
          >
            <Settings size={19} />

            <span>
              Settings
            </span>
          </button>

        </div>

        {/* LOGOUT */}

        <div className="sidebar-bottom">

          <button
            className="logout-btn"
            onClick={handleLogout}
          >
            <LogOut size={19} />

            <span>
              Logout
            </span>
          </button>

        </div>

      </aside>

      {/* =========================
          MAIN
      ========================= */}

      <div className="main-wrapper">

        {/* TOPBAR */}

        <header className="topbar">

          <div className="page-title">

            <h1>
              Complaints
            </h1>

            <p>
              Submit and track your complaints
            </p>

          </div>

          <div className="topbar-right">

            {/* THEME */}

            <button
              className="theme-btn"
              onClick={toggleDarkMode}
              title="Toggle Theme"
            >
              {darkMode ? (
                <Sun size={18} />
              ) : (
                <Moon size={18} />
              )}
            </button>

            {/* NOTIFICATIONS */}

            <button
              className="icon-btn"
              title="Notifications"
            >
              <Bell size={18} />
            </button>

            {/* PROFILE */}

            <button
              className="profile-btn"
              onClick={() =>
                navigate("/profile/adopter")
              }
            >
              <div className="profile-avatar">
                <User size={18} />
              </div>

              <div className="profile-info">

                <strong>
                  Adopter
                </strong>

                <span>
                  Pet Adopter
                </span>

              </div>
            </button>

          </div>

        </header>

        {/* =========================
            CONTENT
        ========================= */}

        <main className="content">

          {/* HEADER */}

          <section className="complaints-header">

            <div>

              <h2>
                My Complaints
              </h2>

              <p>
                Report an issue or track your
                previous complaints.
              </p>

            </div>

            <button
              className="new-complaint-btn"
              onClick={() =>
                setShowForm(!showForm)
              }
            >
              <Plus size={18} />

              New Complaint
            </button>

          </section>

          {/* ERROR */}

          {error && (
            <div className="complaint-error">
              {error}
            </div>
          )}

          {/* =========================
              FORM
          ========================= */}

          {showForm && (

            <section className="complaint-form-card">

              <div className="form-header">

                <div>

                  <h3>
                    Submit a Complaint
                  </h3>

                  <p>
                    Tell us about the issue you
                    are experiencing.
                  </p>

                </div>

              </div>

              <form onSubmit={handleSubmit}>

                {/* SUBJECT */}

                <div className="form-group">

                  <label>
                    Subject
                  </label>

                  <input
                    type="text"
                    placeholder="Enter complaint subject"
                    value={
                      complaint.subject
                    }
                    onChange={(e) =>
                      setComplaint({
                        ...complaint,
                        subject:
                          e.target.value,
                      })
                    }
                    disabled={submitting}
                  />

                </div>

                {/* CATEGORY */}

                <div className="form-group">

                  <label>
                    Category
                  </label>

                  <select
                    value={
                      complaint.category
                    }
                    onChange={(e) =>
                      setComplaint({
                        ...complaint,
                        category:
                          e.target.value,
                      })
                    }
                    disabled={submitting}
                  >
                    <option value="General">
                      General
                    </option>

                    <option value="Application">
                      Application
                    </option>

                    <option value="Shelter">
                      Shelter
                    </option>

                    <option value="Pet">
                      Pet
                    </option>

                    <option value="Account">
                      Account
                    </option>

                    <option value="Other">
                      Other
                    </option>

                  </select>

                </div>

                {/* DESCRIPTION */}

                <div className="form-group">

                  <label>
                    Description
                  </label>

                  <textarea
                    rows="5"
                    placeholder="Describe your complaint..."
                    value={
                      complaint.description
                    }
                    onChange={(e) =>
                      setComplaint({
                        ...complaint,
                        description:
                          e.target.value,
                      })
                    }
                    disabled={submitting}
                  />

                </div>

                {/* ACTIONS */}

                <div className="form-actions">

                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() =>
                      setShowForm(false)
                    }
                    disabled={submitting}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="submit-btn"
                    disabled={submitting}
                  >
                    {submitting
                      ? "Submitting..."
                      : "Submit Complaint"}
                  </button>

                </div>

              </form>

            </section>
          )}

          {/* =========================
              COMPLAINT HISTORY
          ========================= */}

          <section className="complaints-section">

            <div className="section-header">

              <div>

                <h3>
                  Complaint History
                </h3>

                <p>
                  View the status of your
                  submitted complaints.
                </p>

              </div>

              <span className="complaint-count">
                {complaints.length} complaints
              </span>

            </div>

            <div className="complaints-list">

              {/* LOADING */}

              {loading ? (

                <div className="empty-state">

                  <h4>
                    Loading complaints...
                  </h4>

                </div>

              ) : complaints.length === 0 ? (

                /* EMPTY */

                <div className="empty-state">

                  <div className="empty-icon">

                    <MessageSquareWarning
                      size={25}
                    />

                  </div>

                  <h4>
                    No complaints yet
                  </h4>

                  <p>
                    You haven't submitted any
                    complaints.
                  </p>

                </div>

              ) : (

                /* LIST */

                complaints.map((item) => (

                  <div
                    className="complaint-row"
                    key={item.id}
                  >

                    <div className="complaint-icon">

                      <MessageSquareWarning
                        size={20}
                      />

                    </div>

                    <div className="complaint-details">

                      <h4>
                        {item.subject}
                      </h4>

                      <p>
                        {item.description}
                      </p>

                      <span className="complaint-meta">
                        {item.category} •{" "}
                        {formatDate(
                          item.created_at
                        )}
                      </span>

                    </div>

                    <span
                      className={`complaint-status ${
                        item.status.toLowerCase()
                      }`}
                    >
                      {getStatusIcon(
                        item.status
                      )}

                      {item.status}
                    </span>

                  </div>

                ))

              )}

            </div>

          </section>

        </main>

      </div>

    </div>
  );
}