import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dog,
  Sun,
  Moon,
  LogOut,
  LayoutDashboard,
  PawPrint,
  User,
  Settings as SettingsIcon,
  Menu,
  X,
  Bell,
  CheckCircle2
} from "lucide-react";

import "./Settings.css";

export default function Settings({ darkMode, toggleDarkMode }) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ইউজার ডেটা স্টেট (Navbar ও Profile Mini এর জন্য)
  const [userData, setUserData] = useState({
    name: "Shelter Staff",
    email: "staff@petconnect.com",
    role: "Administrator"
  });

  const [settings, setSettings] = useState({
    emailNotifications: true,
    adoptionAlerts: true,
    publicProfile: true,
    language: "English"
  });

  const [successMessage, setSuccessMessage] = useState("");

  // লোকালস্টোরেজ থেকে ইউজার লোড করা
  useEffect(() => {
    const storedUser = localStorage.getItem("petconnect_user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUserData({
          name: parsedUser.name || parsedUser.username || "Shelter Staff",
          email: parsedUser.email || "staff@petconnect.com",
          role: parsedUser.role || parsedUser.user_type || "Administrator"
        });
      } catch (e) {
        console.error("Error parsing user data", e);
      }
    }

    // সেভ করা সেটিংস লোড করা (যদি থাকে)
    const savedSettings = localStorage.getItem("petconnect_app_settings");
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error("Error parsing settings", e);
      }
    }
  }, []);

  const closeSidebar = () => setSidebarOpen(false);

  const goTo = (path) => {
    closeSidebar();
    navigate(path);
  };

  const handleLogout = () => {
    localStorage.removeItem("petconnect_token");
    localStorage.removeItem("petconnect_user");
    navigate("/login");
  };

  const handleToggleChange = (key) => {
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    localStorage.setItem("petconnect_app_settings", JSON.stringify(updated));
    showNotification("Preferences updated successfully!");
  };

  const showNotification = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
  };

  return (
    <div className={`dashboard-container ${darkMode ? "dark" : ""}`}>
      {/* ================= NAVBAR ================= */}
      <nav className="dashboard-navbar">
        <div className="dashboard-logo" onClick={() => goTo("/")}>
          <div className="dashboard-logo-icon">
            <Dog size={24} />
          </div>
          <div className="dashboard-logo-text">
            PET<br />CONNECT
          </div>
        </div>

        <div className="navbar-center">System Settings</div>

        <div className="navbar-right">
          <button
            className="icon-button mobile-menu"
            onClick={() => setSidebarOpen((prev) => !prev)}
            title="Menu"
            type="button"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <button className="icon-button" onClick={toggleDarkMode} title="Toggle Theme" type="button">
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button className="icon-button" title="Notifications" type="button">
            <Bell size={18} />
          </button>

          <div className="profile-mini">
            <div className="profile-avatar">
              <User size={17} />
            </div>
            <div className="profile-info">
              <strong>{userData.name}</strong>
              <span>{userData.role}</span>
            </div>
          </div>
        </div>
      </nav>

      {/* ================= DASHBOARD LAYOUT ================= */}
      <div className="dashboard-layout">
        {/* ================= SIDEBAR ================= */}
        <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
          <div className="sidebar-title">Main Menu</div>

          <button className="sidebar-item" onClick={() => goTo("/dashboard/shelter")} type="button">
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </button>

          <button className="sidebar-item" onClick={() => goTo("/dashboard/shelter/manage-pets")} type="button">
            <PawPrint size={18} />
            <span>Manage Pets</span>
          </button>

          <div className="sidebar-title account-title">Account</div>

          <button className="sidebar-item" onClick={() => goTo("/profile/shelter")} type="button">
            <User size={18} />
            <span>My Profile</span>
          </button>

          <button className="sidebar-item active" onClick={() => goTo("/settings")} type="button">
            <SettingsIcon size={18} />
            <span>Settings</span>
          </button>

          <div className="sidebar-bottom">
            <button className="sidebar-item logout-item" onClick={handleLogout} type="button">
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* ================= MAIN CONTENT ================= */}
        <main className="dashboard-main" style={{ overflowY: 'auto' }}>
          <section className="welcome-section" style={{ marginBottom: '20px' }}>
            <div>
              <h1>App Settings ⚙️</h1>
              <p>Manage your notification preferences and system settings locally.</p>
            </div>
          </section>

          {successMessage && (
            <div className="toast-msg">
              <CheckCircle2 size={18} /> {successMessage}
            </div>
          )}

          <div className="settings-grid">
            {/* Preferences & Notifications */}
            <div className="dashboard-card" style={{ marginTop: '0', gridColumn: '1 / -1' }}>
              <div className="card-header">
                <h2><Bell size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Preferences & Notifications</h2>
              </div>
              
              <div className="toggle-row">
                <div>
                  <strong>Email Notifications</strong>
                  <p style={{ fontSize: '13px', opacity: 0.7 }}>Receive email updates on system activities.</p>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={() => handleToggleChange("emailNotifications")}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="toggle-row">
                <div>
                  <strong>Instant Adoption Alerts</strong>
                  <p style={{ fontSize: '13px', opacity: 0.7 }}>Get notified immediately when a user applies for pet adoption.</p>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={settings.adoptionAlerts}
                    onChange={() => handleToggleChange("adoptionAlerts")}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="toggle-row" style={{ borderBottom: 'none' }}>
                <div>
                  <strong>Public Shelter Status</strong>
                  <p style={{ fontSize: '13px', opacity: 0.7 }}>Show shelter availability status on public directories.</p>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={settings.publicProfile}
                    onChange={() => handleToggleChange("publicProfile")}
                  />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}