import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Dog,
  LayoutDashboard,
  FileText,
  User,
  Settings,
  Bell,
  Moon,
  Sun,
  LogOut,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit,
  Save,
  X,
  Flag,
  Menu,
} from "lucide-react";

import {
  apiFetch,
  getToken,
  getCachedUser,
  setSession,
  clearSession,
} from "../../api/client";

import "./adopterProfile.css";

export default function AdopterProfile({
  darkMode,
  toggleDarkMode,
}) {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [user, setUser] = useState(
    getCachedUser() || {}
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  /* =========================
     FETCH CURRENT USER
  ========================= */

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        setError("");

        const token = getToken();

        if (!token) {
          navigate("/login");
          return;
        }

        const response = await apiFetch("/auth/me");

        const authenticatedUser = response.user;

        setUser(authenticatedUser);

        setSession(
          token,
          authenticatedUser
        );

        setFormData({
          name: authenticatedUser.name || "",
          email: authenticatedUser.email || "",
          phone: authenticatedUser.phone || "",
          address: authenticatedUser.address || "",
        });
      } catch (err) {
        console.error("Profile error:", err);

        if (err.status === 401) {
          clearSession();
          navigate("/login");
          return;
        }

        setError(
          err.message ||
            "Unable to load profile."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  /* =========================
     USER DATA
  ========================= */

  const userName =
    user?.name ||
    user?.username ||
    "Adopter";

  const avatarLetter =
    userName.charAt(0).toUpperCase();

  /* =========================
     NAVIGATION
  ========================= */

  const handleNavigation = (page) => {
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
      navigate("/dashboard/adopter");
    }
  };

  /* =========================
     FORM HANDLER
  ========================= */

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  /* =========================
     SAVE PROFILE
  ========================= */

  const handleSave = async () => {
    try {
      setLoading(true);
      setError("");

      // Backend route is:
      // PUT /api/auth/profile
      const response = await apiFetch(
        "/auth/profile",
        {
          method: "PUT",
          body: JSON.stringify(formData),
        }
      );

      const updatedUser =
        response.user || {
          ...user,
          ...formData,
        };

      setUser(updatedUser);

      const token = getToken();

      if (token) {
        setSession(
          token,
          updatedUser
        );
      }

      setEditing(false);
    } catch (err) {
      console.error(
        "Update profile error:",
        err
      );

      if (err.status === 401) {
        clearSession();
        navigate("/login");
        return;
      }

      setError(
        err.message ||
          "Unable to update profile."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     CANCEL EDIT
  ========================= */

  const handleCancel = () => {
    setFormData({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      address: user.address || "",
    });

    setEditing(false);
    setError("");
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
     LOADING
  ========================= */

  if (loading && !user.name) {
    return (
      <div
        className={`app-container ${
          darkMode ? "dark" : ""
        }`}
      >
        <div className="profile-loading">
          <div className="loading-spinner" />

          <h3>
            Loading your profile...
          </h3>

          <p>
            Please wait while we fetch
            your information.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`app-container ${
        darkMode ? "dark" : ""
      }`}
    >
      {/* =========================
          MOBILE SIDEBAR OVERLAY
      ========================= */}

      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() =>
            setSidebarOpen(false)
          }
        />
      )}

      {/* =========================
          SIDEBAR
      ========================= */}

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

          {/* DASHBOARD */}

          <button
            className="nav-item"
            onClick={() =>
              handleNavigation(
                "dashboard"
              )
            }
          >
            <LayoutDashboard size={19} />

            <span>
              Dashboard
            </span>
          </button>

          {/* APPLICATIONS */}

          <button
            className="nav-item"
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

          {/* PROFILE */}

          <button
            className="nav-item active"
            onClick={() =>
              handleNavigation(
                "profile"
              )
            }
          >
            <User size={19} />

            <span>
              Profile
            </span>
          </button>

          {/* COMPLAINTS */}

          <button
            className="nav-item"
            onClick={() =>
              handleNavigation(
                "complaints"
              )
            }
          >
            <Flag size={19} />

            <span>
              Complaints
            </span>
          </button>

          {/* SETTINGS */}

          <button
            className="nav-item"
            onClick={() =>
              handleNavigation(
                "settings"
              )
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
          MAIN WRAPPER
      ========================= */}

      <div className="main-wrapper">

        {/* =========================
            TOPBAR
        ========================= */}

        <header className="topbar">

          <div className="topbar-left">

            {/* MOBILE MENU */}

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

            {/* PAGE TITLE */}

            <div className="page-title">
              <h1>
                My Profile
              </h1>

              <p>
                View and manage your
                Pet Connect profile
              </p>
            </div>

          </div>

          {/* TOPBAR RIGHT */}

          <div className="topbar-right">

            {/* THEME */}

            <button
              className="theme-btn"
              onClick={
                toggleDarkMode
              }
              title="Toggle theme"
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

              <span className="notification-dot" />
            </button>

            {/* PROFILE */}

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

        {/* =========================
            CONTENT
        ========================= */}

        <main className="content">

          {/* ERROR */}

          {error && (
            <div className="profile-error">
              {error}
            </div>
          )}

          {/* =========================
              PROFILE HEADER
          ========================= */}

          <section className="profile-header-card">

            <div className="profile-header-left">

              <div className="large-profile-avatar">
                {avatarLetter}
              </div>

              <div>
                <h2>
                  {userName}
                </h2>

                <p>
                  Pet Adopter
                </p>
              </div>

            </div>

            {!editing ? (
              <button
                className="edit-profile-btn"
                onClick={() =>
                  setEditing(true)
                }
              >
                <Edit size={16} />

                Edit Profile
              </button>
            ) : (
              <div className="profile-actions">

                <button
                  className="cancel-btn"
                  onClick={
                    handleCancel
                  }
                >
                  <X size={16} />

                  Cancel
                </button>

                <button
                  className="save-btn"
                  onClick={
                    handleSave
                  }
                  disabled={loading}
                >
                  <Save size={16} />

                  {loading
                    ? "Saving..."
                    : "Save Changes"}
                </button>

              </div>
            )}

          </section>

          {/* =========================
              PROFILE GRID
          ========================= */}

          <section className="profile-grid">

            {/* =========================
                PERSONAL INFORMATION
            ========================= */}

            <div className="profile-section-card">

              <div className="profile-section-title">

                <h3>
                  Personal Information
                </h3>

                <p>
                  Your basic account
                  information
                </p>

              </div>

              <div className="profile-fields">

                {/* NAME */}

                <div className="profile-field">

                  <label>
                    Full Name
                  </label>

                  {editing ? (
                    <input
                      type="text"
                      name="name"
                      value={
                        formData.name
                      }
                      onChange={
                        handleChange
                      }
                    />
                  ) : (
                    <div className="field-value">

                      <User size={17} />

                      <span>
                        {user.name ||
                          "Not provided"}
                      </span>

                    </div>
                  )}

                </div>

                {/* EMAIL */}

                <div className="profile-field">

                  <label>
                    Email Address
                  </label>

                  {editing ? (
                    <input
                      type="email"
                      name="email"
                      value={
                        formData.email
                      }
                      onChange={
                        handleChange
                      }
                    />
                  ) : (
                    <div className="field-value">

                      <Mail size={17} />

                      <span>
                        {user.email ||
                          "Not provided"}
                      </span>

                    </div>
                  )}

                </div>

                {/* PHONE */}

                <div className="profile-field">

                  <label>
                    Phone Number
                  </label>

                  {editing ? (
                    <input
                      type="text"
                      name="phone"
                      value={
                        formData.phone
                      }
                      onChange={
                        handleChange
                      }
                    />
                  ) : (
                    <div className="field-value">

                      <Phone size={17} />

                      <span>
                        {user.phone ||
                          "Not provided"}
                      </span>

                    </div>
                  )}

                </div>

                {/* ADDRESS */}

                <div className="profile-field">

                  <label>
                    Address
                  </label>

                  {editing ? (
                    <textarea
                      name="address"
                      value={
                        formData.address
                      }
                      onChange={
                        handleChange
                      }
                      rows="3"
                    />
                  ) : (
                    <div className="field-value">

                      <MapPin size={17} />

                      <span>
                        {user.address ||
                          "Not provided"}
                      </span>

                    </div>
                  )}

                </div>

              </div>
            </div>

            {/* =========================
                ACCOUNT INFORMATION
            ========================= */}

            <div className="profile-section-card">

              <div className="profile-section-title">

                <h3>
                  Account Information
                </h3>

                <p>
                  Details about your
                  Pet Connect account
                </p>

              </div>

              <div className="account-info">

                {/* ACCOUNT TYPE */}

                <div className="account-item">

                  <div className="account-icon">
                    <User size={18} />
                  </div>

                  <div>

                    <span>
                      Account Type
                    </span>

                    <strong>
                      Pet Adopter
                    </strong>

                  </div>

                </div>

                {/* EMAIL */}

                <div className="account-item">

                  <div className="account-icon">
                    <Mail size={18} />
                  </div>

                  <div>

                    <span>
                      Email
                    </span>

                    <strong>
                      {user.email ||
                        "Not provided"}
                    </strong>

                  </div>

                </div>

                {/* MEMBER SINCE */}

                <div className="account-item">

                  <div className="account-icon">
                    <Calendar size={18} />
                  </div>

                  <div>

                    <span>
                      Member Since
                    </span>

                    <strong>
                      {user.created_at
                        ? new Date(
                            user.created_at
                          ).toLocaleDateString(
                            "en-US",
                            {
                              month:
                                "short",
                              year:
                                "numeric",
                            }
                          )
                        : "Recently"}
                    </strong>

                  </div>

                </div>

              </div>
            </div>

          </section>

        </main>
      </div>
    </div>
  );
}