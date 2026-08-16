import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dog,
  ArrowLeft,
  Edit3,
  Mail,
  Phone,
  ShieldCheck,
  Lock,
  Save,
  X,
  Activity,
  Calendar,
  MapPin,
  User,
  KeyRound,
} from "lucide-react";

export default function AdminProfile({ darkMode }) {
  const navigate = useNavigate();

  const [editing, setEditing] = useState(false);

  const [profile, setProfile] = useState({
    name: "Alex Morgan",
    username: "alex.m",
    email: "alex.morgan@petconnect.com",
    phone: "+880 1712-345678",
    location: "Dhaka, Bangladesh",
    role: "Global Admin",
  });

  const [tempProfile, setTempProfile] = useState(profile);

  const handleEdit = () => {
    setTempProfile(profile);
    setEditing(true);
  };

  const handleSave = () => {
    setProfile(tempProfile);
    setEditing(false);
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

        html,
        body,
        #root {
          width: 100%;
          min-height: 100%;
        }

        .profile-page {
          min-height: 100vh;
          width: 100%;
          background:
            linear-gradient(
              135deg,
              #d8e8f8,
              #f0f4f8,
              #d0ede4,
              #e6d8ff,
              #dcf0f8
            );

          background-size: 500% 500%;
          animation: profileMesh 18s ease infinite;

          color: #102c45;
          position: relative;
          overflow: hidden;
        }

        @keyframes profileMesh {
          0% {
            background-position: 0% 50%;
          }

          25% {
            background-position: 50% 100%;
          }

          50% {
            background-position: 100% 50%;
          }

          75% {
            background-position: 50% 0%;
          }

          100% {
            background-position: 0% 50%;
          }
        }

        /* Ambient background */

        .profile-page::before {
          content: "";
          position: fixed;
          width: 500px;
          height: 500px;
          top: -150px;
          left: -120px;
          border-radius: 50%;
          background: rgba(40, 105, 147, 0.12);
          filter: blur(90px);
          pointer-events: none;
        }

        .profile-page::after {
          content: "";
          position: fixed;
          width: 500px;
          height: 500px;
          bottom: -180px;
          right: -100px;
          border-radius: 50%;
          background: rgba(30, 88, 125, 0.14);
          filter: blur(100px);
          pointer-events: none;
        }

        /* Navbar */

        .profile-navbar {
          height: 75px;
          width: 100%;
          padding: 0 32px;

          display: flex;
          align-items: center;
          justify-content: space-between;

          background: rgba(230, 240, 250, 0.88);
          backdrop-filter: blur(15px);
          -webkit-backdrop-filter: blur(15px);

          border-bottom: 1px solid rgba(255, 255, 255, 0.8);

          position: relative;
          z-index: 5;
        }

        .profile-brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .brand-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;

          background: #286993;
          color: white;

          display: flex;
          align-items: center;
          justify-content: center;

          box-shadow: 0 4px 10px rgba(40, 105, 147, 0.3);
        }

        .brand-title {
          font-size: 16px;
          font-weight: 700;
        }

        .brand-subtitle {
          font-size: 11px;
          color: #64748b;
          margin-top: 2px;
        }

        .back-btn {
          display: flex;
          align-items: center;
          gap: 8px;

          border: none;
          background: rgba(40, 105, 147, 0.1);

          color: #286993;

          padding: 10px 14px;
          border-radius: 10px;

          font-size: 13px;
          font-weight: 600;

          cursor: pointer;
          transition: 0.2s;
        }

        .back-btn:hover {
          background: rgba(40, 105, 147, 0.18);
        }

        /* Main */

        .profile-content {
          width: 100%;
          max-width: 1150px;
          margin: auto;

          padding: 35px;

          position: relative;
          z-index: 2;
        }

        .page-heading {
          margin-bottom: 24px;
        }

        .page-heading h1 {
          font-size: 26px;
          font-weight: 700;
          color: #102c45;
        }

        .page-heading p {
          margin-top: 5px;
          color: #64748b;
          font-size: 13px;
        }

        /* Layout */

        .profile-grid {
          display: grid;
          grid-template-columns: 330px 1fr;
          gap: 22px;
        }

        .glass-card {
          background: rgba(230, 240, 250, 0.82);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);

          border-radius: 18px;

          border: 1px solid rgba(255, 255, 255, 0.9);

          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
        }

        /* Left profile card */

        .profile-card {
          padding: 28px;
          text-align: center;
          height: fit-content;
        }

        .profile-avatar-wrapper {
          position: relative;
          width: 105px;
          height: 105px;
          margin: 0 auto 18px;
        }

        .profile-avatar {
          width: 105px;
          height: 105px;
          border-radius: 50%;
          object-fit: cover;

          border: 4px solid rgba(255, 255, 255, 0.8);

          box-shadow:
            0 8px 25px rgba(40, 105, 147, 0.2);
        }

        .online-dot {
          position: absolute;
          right: 5px;
          bottom: 7px;

          width: 18px;
          height: 18px;

          background: #10b981;
          border-radius: 50%;

          border: 3px solid #e6f0fa;
        }

        .profile-card h2 {
          font-size: 20px;
          color: #102c45;
        }

        .profile-role {
          margin-top: 5px;
          color: #286993;
          font-size: 13px;
          font-weight: 600;
        }

        .profile-status {
          display: inline-flex;
          align-items: center;
          gap: 5px;

          margin-top: 14px;

          padding: 5px 11px;
          border-radius: 20px;

          background: rgba(16, 185, 129, 0.12);
          color: #059669;

          font-size: 11px;
          font-weight: 700;
        }

        .profile-divider {
          height: 1px;
          background: rgba(40, 105, 147, 0.1);
          margin: 24px 0;
        }

        .profile-meta {
          display: flex;
          flex-direction: column;
          gap: 15px;

          text-align: left;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 11px;
        }

        .meta-icon {
          width: 34px;
          height: 34px;
          border-radius: 9px;

          background: rgba(40, 105, 147, 0.1);
          color: #286993;

          display: flex;
          align-items: center;
          justify-content: center;

          flex-shrink: 0;
        }

        .meta-text small {
          display: block;
          color: #64748b;
          font-size: 10px;
          margin-bottom: 2px;
        }

        .meta-text span {
          color: #102c45;
          font-size: 12px;
          font-weight: 600;
        }

        /* Right side */

        .details-card {
          padding: 25px;
        }

        .card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;

          margin-bottom: 22px;
        }

        .card-header h3 {
          font-size: 16px;
          color: #102c45;
        }

        .card-header p {
          font-size: 11px;
          color: #64748b;
          margin-top: 4px;
        }

        .edit-btn {
          display: flex;
          align-items: center;
          gap: 6px;

          border: none;
          background: #286993;
          color: white;

          padding: 9px 14px;
          border-radius: 9px;

          font-size: 12px;
          font-weight: 600;

          cursor: pointer;

          box-shadow: 0 4px 12px rgba(40, 105, 147, 0.2);
        }

        .edit-btn:hover {
          background: #1f587d;
        }

        /* Form */

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .form-group.full {
          grid-column: span 2;
        }

        .form-group label {
          font-size: 11px;
          font-weight: 700;
          color: #64748b;
        }

        .input-wrapper {
          position: relative;
        }

        .input-wrapper svg {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);

          color: #286993;
        }

        .form-input {
          width: 100%;

          padding: 11px 12px 11px 39px;

          border: 1px solid rgba(40, 105, 147, 0.15);
          border-radius: 9px;

          background: rgba(255, 255, 255, 0.5);

          color: #102c45;

          outline: none;
          font-size: 12px;
        }

        .form-input:focus {
          border-color: #286993;
          box-shadow: 0 0 0 3px rgba(40, 105, 147, 0.08);
        }

        .form-input:disabled {
          cursor: default;
          opacity: 0.8;
        }

        .save-row {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 22px;
        }

        .cancel-btn {
          padding: 9px 15px;
          border-radius: 9px;

          border: 1px solid rgba(40, 105, 147, 0.2);
          background: transparent;

          color: #102c45;

          font-size: 12px;
          font-weight: 600;

          cursor: pointer;
        }

        .save-btn {
          display: flex;
          align-items: center;
          gap: 6px;

          padding: 9px 15px;
          border-radius: 9px;

          border: none;
          background: #286993;
          color: white;

          font-size: 12px;
          font-weight: 600;

          cursor: pointer;
        }

        /* Bottom cards */

        .bottom-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 22px;

          margin-top: 22px;
        }

        .security-card,
        .activity-card {
          padding: 22px;
        }

        .security-item {
          display: flex;
          align-items: center;
          justify-content: space-between;

          padding: 13px 0;

          border-bottom: 1px solid rgba(40, 105, 147, 0.08);
        }

        .security-item:last-child {
          border-bottom: none;
        }

        .security-left {
          display: flex;
          align-items: center;
          gap: 11px;
        }

        .security-icon {
          width: 35px;
          height: 35px;
          border-radius: 9px;

          background: rgba(40, 105, 147, 0.1);
          color: #286993;

          display: flex;
          align-items: center;
          justify-content: center;
        }

        .security-left strong {
          display: block;
          font-size: 12px;
          color: #102c45;
        }

        .security-left span {
          display: block;
          margin-top: 3px;
          font-size: 10px;
          color: #64748b;
        }

        .security-action {
          border: none;
          background: transparent;

          color: #286993;

          font-size: 11px;
          font-weight: 700;

          cursor: pointer;
        }

        /* Activity */

        .activity-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .activity-item {
          display: flex;
          gap: 11px;
        }

        .activity-dot {
          width: 9px;
          height: 9px;
          margin-top: 5px;

          border-radius: 50%;
          background: #286993;

          flex-shrink: 0;
        }

        .activity-text strong {
          display: block;
          font-size: 12px;
          color: #102c45;
        }

        .activity-text span {
          display: block;
          margin-top: 3px;
          color: #64748b;
          font-size: 10px;
        }

        /* Dark mode */

        .profile-page.dark {
          background:
            linear-gradient(
              135deg,
              #050d14,
              #0b1721,
              #101f2b,
              #07121a,
              #09151e
            );

          color: white;
        }

        .profile-page.dark .profile-navbar {
          background: rgba(30, 48, 61, 0.85);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .profile-page.dark .glass-card {
          background: rgba(30, 48, 61, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
        }

        .profile-page.dark .page-heading h1,
        .profile-page.dark .profile-card h2,
        .profile-page.dark .card-header h3,
        .profile-page.dark .meta-text span,
        .profile-page.dark .security-left strong,
        .profile-page.dark .activity-text strong,
        .profile-page.dark .form-input {
          color: white;
        }

        .profile-page.dark .form-input {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.1);
        }

        .profile-page.dark .profile-divider,
        .profile-page.dark .security-item {
          border-color: rgba(255, 255, 255, 0.08);
        }

        /* Responsive */

        @media (max-width: 850px) {
          .profile-grid {
            grid-template-columns: 1fr;
          }

          .bottom-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 600px) {
          .profile-content {
            padding: 20px;
          }

          .profile-navbar {
            padding: 0 20px;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .form-group.full {
            grid-column: span 1;
          }

          .brand-subtitle {
            display: none;
          }
        }

      `}</style>

      <div className={`profile-page ${darkMode ? "dark" : ""}`}>

        {/* NAVBAR */}

        <header className="profile-navbar">

          <div className="profile-brand">

            <div className="brand-icon">
              <Dog size={22} />
            </div>

            <div>
              <div className="brand-title">
                Pet Admin
              </div>

              <div className="brand-subtitle">
                Platform Administration
              </div>
            </div>

          </div>

          <button
            className="back-btn"
            onClick={() => navigate("/admin")}
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>

        </header>


        {/* MAIN CONTENT */}

        <main className="profile-content">

          <div className="page-heading">
            <h1>My Profile</h1>
            <p>
              Manage your administrator account and security settings
            </p>
          </div>


          <div className="profile-grid">

            {/* LEFT PROFILE CARD */}

            <div className="glass-card profile-card">

              <div className="profile-avatar-wrapper">

                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"
                  alt="Alex Morgan"
                  className="profile-avatar"
                />

                <span className="online-dot"></span>

              </div>

              <h2>{profile.name}</h2>

              <div className="profile-role">
                {profile.role}
              </div>

              <div className="profile-status">
                <span>●</span>
                Active Account
              </div>


              <div className="profile-divider"></div>


              <div className="profile-meta">

                <div className="meta-item">

                  <div className="meta-icon">
                    <Mail size={16} />
                  </div>

                  <div className="meta-text">
                    <small>Email</small>
                    <span>{profile.email}</span>
                  </div>

                </div>


                <div className="meta-item">

                  <div className="meta-icon">
                    <Phone size={16} />
                  </div>

                  <div className="meta-text">
                    <small>Phone</small>
                    <span>{profile.phone}</span>
                  </div>

                </div>


                <div className="meta-item">

                  <div className="meta-icon">
                    <MapPin size={16} />
                  </div>

                  <div className="meta-text">
                    <small>Location</small>
                    <span>{profile.location}</span>
                  </div>

                </div>


                <div className="meta-item">

                  <div className="meta-icon">
                    <Calendar size={16} />
                  </div>

                  <div className="meta-text">
                    <small>Member Since</small>
                    <span>January 2024</span>
                  </div>

                </div>

              </div>

            </div>


            {/* RIGHT DETAILS CARD */}

            <div className="glass-card details-card">

              <div className="card-header">

                <div>
                  <h3>Personal Information</h3>
                  <p>
                    Update your administrator profile details
                  </p>
                </div>

                {!editing && (
                  <button
                    className="edit-btn"
                    onClick={handleEdit}
                  >
                    <Edit3 size={14} />
                    Edit Profile
                  </button>
                )}

              </div>


              <div className="form-grid">

                {/* Name */}

                <div className="form-group">

                  <label>Full Name</label>

                  <div className="input-wrapper">

                    <User size={15} />

                    <input
                      className="form-input"
                      value={
                        editing
                          ? tempProfile.name
                          : profile.name
                      }
                      disabled={!editing}
                      onChange={(e) =>
                        setTempProfile({
                          ...tempProfile,
                          name: e.target.value,
                        })
                      }
                    />

                  </div>

                </div>


                {/* Username */}

                <div className="form-group">

                  <label>Username</label>

                  <div className="input-wrapper">

                    <User size={15} />

                    <input
                      className="form-input"
                      value={
                        editing
                          ? tempProfile.username
                          : profile.username
                      }
                      disabled={!editing}
                      onChange={(e) =>
                        setTempProfile({
                          ...tempProfile,
                          username: e.target.value,
                        })
                      }
                    />

                  </div>

                </div>


                {/* Email */}

                <div className="form-group">

                  <label>Email Address</label>

                  <div className="input-wrapper">

                    <Mail size={15} />

                    <input
                      className="form-input"
                      value={
                        editing
                          ? tempProfile.email
                          : profile.email
                      }
                      disabled={!editing}
                      onChange={(e) =>
                        setTempProfile({
                          ...tempProfile,
                          email: e.target.value,
                        })
                      }
                    />

                  </div>

                </div>


                {/* Phone */}

                <div className="form-group">

                  <label>Phone Number</label>

                  <div className="input-wrapper">

                    <Phone size={15} />

                    <input
                      className="form-input"
                      value={
                        editing
                          ? tempProfile.phone
                          : profile.phone
                      }
                      disabled={!editing}
                      onChange={(e) =>
                        setTempProfile({
                          ...tempProfile,
                          phone: e.target.value,
                        })
                      }
                    />

                  </div>

                </div>


                {/* Location */}

                <div className="form-group full">

                  <label>Location</label>

                  <div className="input-wrapper">

                    <MapPin size={15} />

                    <input
                      className="form-input"
                      value={
                        editing
                          ? tempProfile.location
                          : profile.location
                      }
                      disabled={!editing}
                      onChange={(e) =>
                        setTempProfile({
                          ...tempProfile,
                          location: e.target.value,
                        })
                      }
                    />

                  </div>

                </div>

              </div>


              {editing && (

                <div className="save-row">

                  <button
                    className="cancel-btn"
                    onClick={() => setEditing(false)}
                  >
                    <X size={14} />
                    Cancel
                  </button>

                  <button
                    className="save-btn"
                    onClick={handleSave}
                  >
                    <Save size={14} />
                    Save Changes
                  </button>

                </div>

              )}

            </div>

          </div>


          {/* BOTTOM SECTION */}

          <div className="bottom-grid">


            {/* SECURITY */}

            <div className="glass-card security-card">

              <div className="card-header">

                <div>
                  <h3>Security</h3>
                  <p>
                    Keep your administrator account secure
                  </p>
                </div>

              </div>


              <div className="security-item">

                <div className="security-left">

                  <div className="security-icon">
                    <Lock size={16} />
                  </div>

                  <div>
                    <strong>Password</strong>
                    <span>
                      Last changed 30 days ago
                    </span>
                  </div>

                </div>

                <button className="security-action">
                  Change
                </button>

              </div>


              <div className="security-item">

                <div className="security-left">

                  <div className="security-icon">
                    <ShieldCheck size={16} />
                  </div>

                  <div>
                    <strong>Two-Factor Authentication</strong>
                    <span>
                      Extra protection for your account
                    </span>
                  </div>

                </div>

                <button className="security-action">
                  Enabled
                </button>

              </div>


              <div className="security-item">

                <div className="security-left">

                  <div className="security-icon">
                    <KeyRound size={16} />
                  </div>

                  <div>
                    <strong>Admin Permissions</strong>
                    <span>
                      Full platform access
                    </span>
                  </div>

                </div>

                <button className="security-action">
                  View
                </button>

              </div>

            </div>


            {/* ACTIVITY */}

            <div className="glass-card activity-card">

              <div className="card-header">

                <div>
                  <h3>Recent Activity</h3>
                  <p>
                    Your latest administrator actions
                  </p>
                </div>

                <Activity
                  size={18}
                  color="#286993"
                />

              </div>


              <div className="activity-list">

                <div className="activity-item">

                  <div className="activity-dot"></div>

                  <div className="activity-text">

                    <strong>
                      Updated shelter information
                    </strong>

                    <span>
                      Paws Rescue • 2 hours ago
                    </span>

                  </div>

                </div>


                <div className="activity-item">

                  <div className="activity-dot"></div>

                  <div className="activity-text">

                    <strong>
                      Reviewed a complaint
                    </strong>

                    <span>
                      Shelter #SLT003 • Yesterday
                    </span>

                  </div>

                </div>


                <div className="activity-item">

                  <div className="activity-dot"></div>

                  <div className="activity-text">

                    <strong>
                      Added a new shelter
                    </strong>

                    <span>
                      Hope for Paws • 3 days ago
                    </span>

                  </div>

                </div>


                <div className="activity-item">

                  <div className="activity-dot"></div>

                  <div className="activity-text">

                    <strong>
                      Security settings updated
                    </strong>

                    <span>
                      Two-factor authentication • 5 days ago
                    </span>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </main>

      </div>
    </>
  );
}