import React, { useState, useEffect } from "react";
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
  Eye,
  EyeOff,
} from "lucide-react";

import { fetchMe, updateProfile, changePassword } from "../../api/auth";

/*
|------------------------------------------------------------------------------
| ADMIN PROFILE  -  reading and writing YOUR OWN row in the users table
|------------------------------------------------------------------------------
|
| This page used to display a hard-coded "Alex Morgan". Nothing was stored, so
| pressing Save only changed a variable in memory and a refresh wiped it.
|
| Now it is a genuine read/write view of one database row:
|
|     page loads   ->  GET /api/auth/me      ->  SELECT * FROM users WHERE id = ?
|     press Save   ->  PUT /api/auth/profile ->  UPDATE users SET ... WHERE id = ?
|
| WHICH row? The server works that out from the Bearer token, never from
| anything the browser sends. That is deliberate: if the browser could name the
| id, anyone could edit anyone else's profile just by changing a number.
|
| COLUMN NAMING NOTE
| The screen says "Location" but the column has always been called `address`.
| Rather than rename a column other code already reads, we translate between
| the two names in loadProfile() and handleSave() below. Renaming a live column
| is a breaking change; mapping a label is free.
*/

// The users table stores a role as an ENUM value like 'platform_admin'.
// This turns that into something worth showing a human.
const ROLE_LABELS = {
  platform_admin: "Global Admin",
  shelter_staff: "Shelter Staff",
  adopter: "Adopter",
};

export default function AdminProfile({ darkMode }) {
  const navigate = useNavigate();

  const [editing, setEditing] = useState(false);

  // Starts EMPTY, not with fake data. Showing invented values while the real
  // ones load would mean the user briefly reads something untrue.
  const [profile, setProfile] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    location: "",
    role: "",
  });

  const [tempProfile, setTempProfile] = useState(profile);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);

  // created_at from the database, shown as "Member Since".
  const [memberSince, setMemberSince] = useState("");

  /*
  | PASSWORD CHANGE state.
  |
  | Kept completely separate from `profile`. Passwords are never loaded from
  | the server (only their bcrypt hash exists, and it never leaves the
  | database), so these fields start blank and are wiped after every attempt.
  */
  const [pwOpen, setPwOpen] = useState(false);
  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [pwErrors, setPwErrors] = useState({});
  const [pwSaving, setPwSaving] = useState(false);

  // Show/hide toggles for the password inputs.
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  // users.password_changed_at - null for accounts that never changed it.
  const [passwordChangedAt, setPasswordChangedAt] = useState(null);

  /*
  | "Now", captured ONCE when the page opens.
  |
  | Calling Date.now() while rendering would make the component impure: the
  | same state could produce a different result on each re-render. Reading the
  | clock in a useState initialiser happens exactly once, which keeps rendering
  | predictable. A "days ago" label does not need to tick live anyway.
  */
  const [nowMs] = useState(() => Date.now());

  /*
  | READ  ->  GET /api/auth/me
  |
  | Runs once when the page mounts. The empty dependency array [] is what means
  | "once" - leave it out and this would re-run on every render, hammering the
  | database in an infinite loop.
  */
  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        const user = await fetchMe();
        if (cancelled) return;

        const mapped = {
          name: user.name ?? "",
          // The column is NULLable, so it can genuinely be null. ?? "" keeps
          // React inputs "controlled" - passing null would make React warn
          // about switching between controlled and uncontrolled inputs.
          username: user.username ?? "",
          email: user.email ?? "",
          phone: user.phone ?? "",
          location: user.address ?? "",     // column `address` -> label "Location"
          role: ROLE_LABELS[user.role] ?? user.role,
        };

        setProfile(mapped);
        setTempProfile(mapped);

        // created_at is filled in automatically by the timestamps() columns.
        if (user.created_at) {
          setMemberSince(
            new Date(user.created_at).toLocaleDateString(undefined, {
              month: "long",
              year: "numeric",
            })
          );
        }

        // NULL until the password is changed for the first time. We fall back
        // to created_at in the label below, rather than inventing a date.
        setPasswordChangedAt(user.password_changed_at ?? null);
      } catch (error) {
        if (!cancelled) setLoadError(error.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleEdit = () => {
    // Copy the saved values into the draft. Editing a COPY is what lets Cancel
    // work - the original stays untouched until the UPDATE actually succeeds.
    setTempProfile(profile);
    setEditing(true);
  };

  /*
  | "Last changed ..." - turns a timestamp into readable text.
  |
  | If password_changed_at is NULL the password has never been rotated, so we
  | describe it from the account's creation date instead of guessing.
  */
  const passwordAgeLabel = () => {
    const stamp = passwordChangedAt;

    if (!stamp) {
      return memberSince ? `Never changed since ${memberSince}` : "Never changed";
    }

    // 86400000 = milliseconds in a day
    const days = Math.floor((nowMs - new Date(stamp)) / 86400000);

    if (days <= 0) return "Last changed today";
    if (days === 1) return "Last changed yesterday";
    return `Last changed ${days} days ago`;
  };

  const openPasswordModal = () => {
    setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setPwErrors({});
    setPwOpen(true);
  };

  /*
  | CHANGE PASSWORD  ->  PUT /api/auth/password
  */
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwSaving(true);
    setPwErrors({});

    try {
      const result = await changePassword(pwForm);

      // Update the label immediately from the row the server returned.
      setPasswordChangedAt(result.user.password_changed_at ?? new Date().toISOString());

      setPwOpen(false);
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });

      // revoked_sessions counts the OTHER token rows that were deleted, i.e.
      // other devices that have just been signed out.
      alert(
        result.revoked_sessions > 0
          ? `Password changed. ${result.revoked_sessions} other session(s) were signed out.`
          : "Password changed successfully."
      );
    } catch (error) {
      if (error.status === 422) {
        // Per-field messages, e.g.
        //   current_password: ["Your current password is incorrect."]
        //   password: ["The new password must be different from your current one."]
        setPwErrors(error.errors || {});
      } else {
        alert(error.message);
      }
    } finally {
      setPwSaving(false);
      // Never leave the typed password sitting in memory longer than needed.
      setPwForm((prev) => ({ ...prev, currentPassword: "" }));
    }
  };

  /*
  | WRITE  ->  PUT /api/auth/profile
  */
  const handleSave = async () => {
    setSaving(true);

    try {
      const updated = await updateProfile({
        name: tempProfile.name,
        // Send null rather than "" for an empty username. The column is
        // NULLable and UNIQUE: many rows may be NULL, but two rows both
        // holding the empty string "" would collide with each other.
        username: tempProfile.username || null,
        email: tempProfile.email,
        phone: tempProfile.phone || null,
        address: tempProfile.location || null,   // label "Location" -> column `address`
      });

      // Rebuild state from the SERVER's response, not from tempProfile. The
      // response is what is actually stored - it reflects any trimming or
      // normalising the backend applied.
      const mapped = {
        name: updated.name ?? "",
        username: updated.username ?? "",
        email: updated.email ?? "",
        phone: updated.phone ?? "",
        location: updated.address ?? "",
        role: ROLE_LABELS[updated.role] ?? updated.role,
      };

      setProfile(mapped);
      setTempProfile(mapped);
      setEditing(false);
    } catch (error) {
      // A 422 lands here too - e.g. that username already belongs to somebody
      // else, which is the UNIQUE index doing its job.
      alert(error.message);
    } finally {
      setSaving(false);
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

        /* Change-password modal */

        .pw-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(16, 44, 69, 0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 60;
          padding: 20px;
        }

        .pw-card {
          background: #ffffff;
          border-radius: 14px;
          width: 100%;
          max-width: 420px;
          max-height: 90vh;
          overflow-y: auto;
          padding: 24px;
          box-shadow: 0 20px 50px rgba(16, 44, 69, 0.3);
        }

        .pw-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 18px;
        }

        .pw-header h3 {
          font-size: 17px;
          font-weight: 700;
          color: #102c45;
        }

        .pw-header p {
          font-size: 12px;
          color: #64748b;
          margin-top: 3px;
        }

        .pw-close {
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

        .pw-field {
          margin-bottom: 14px;
        }

        .pw-field label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: #102c45;
          margin-bottom: 5px;
        }

        .pw-input-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
          border: 1px solid rgba(40, 105, 147, 0.25);
          border-radius: 9px;
          padding: 10px 12px;
          background: #fff;
        }

        .pw-input-wrap:focus-within {
          border-color: #286993;
        }

        .pw-input-wrap.has-error {
          border-color: #ef4444;
        }

        .pw-input-wrap input {
          border: none;
          outline: none;
          flex: 1;
          font-size: 13px;
          color: #102c45;
          background: transparent;
        }

        .pw-eye {
          background: none;
          border: none;
          cursor: pointer;
          color: #64748b;
          display: flex;
        }

        .pw-error {
          color: #b91c1c;
          font-size: 11px;
          margin-top: 4px;
        }

        .pw-hint {
          background: rgba(40, 105, 147, 0.07);
          border-radius: 9px;
          padding: 10px 12px;
          font-size: 11px;
          color: #475569;
          line-height: 1.6;
          margin-bottom: 15px;
        }

        .pw-actions {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          margin-top: 18px;
        }

        .pw-actions button {
          padding: 9px 16px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          border: none;
        }

        .pw-cancel {
          background: rgba(100, 116, 139, 0.12);
          color: #475569;
        }

        .pw-submit {
          background: #286993;
          color: #fff;
        }

        .pw-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
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

          {/*
            Three distinct states, shown differently on purpose:
            loading / failed / loaded. Never render a form full of blanks while
            a request is still running - it looks like empty data.
          */}
          {loading && (
            <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "16px" }}>
              Loading your profile from the database...
            </p>
          )}

          {loadError && (
            <p style={{ color: "#b91c1c", fontSize: "14px", marginBottom: "16px" }}>
              {loadError}
            </p>
          )}


          <div className="profile-grid">

            {/* LEFT PROFILE CARD */}

            <div className="glass-card profile-card">

              <div className="profile-avatar-wrapper">

                {/*
                  There is no avatar column in the users table yet, so this
                  stays a placeholder image. The alt text at least uses the
                  real name now.
                */}
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"
                  alt={profile.name || "Administrator"}
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
                    {/* Derived from users.created_at, set by timestamps() */}
                    <span>{memberSince || "-"}</span>
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
                    onClick={() => {
                      // Throw the draft away and restore the saved values.
                      // Nothing was written, so there is nothing to undo in
                      // the database.
                      setTempProfile(profile);
                      setEditing(false);
                    }}
                    disabled={saving}
                  >
                    <X size={14} />
                    Cancel
                  </button>

                  <button
                    className="save-btn"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    <Save size={14} />
                    {saving ? "Saving..." : "Save Changes"}
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
                    {/* Derived from users.password_changed_at */}
                    <span>
                      {passwordAgeLabel()}
                    </span>
                  </div>

                </div>

                <button className="security-action" onClick={openPasswordModal}>
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

      {/*
      |------------------------------------------------------------------------
      | CHANGE PASSWORD MODAL
      |------------------------------------------------------------------------
      |
      | Three fields, none of them ever pre-filled. The current password is
      | required even though you are already logged in - that is what stops
      | somebody who grabbed your session from locking you out of your own
      | account.
      */}
      {pwOpen && (
        <div className="pw-backdrop">
          <div className="pw-card">

            <div className="pw-header">
              <div>
                <h3>Change Password</h3>
                <p>UPDATE users SET password = &lt;new hash&gt; WHERE id = you</p>
              </div>
              <button className="pw-close" onClick={() => setPwOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <div className="pw-hint">
              Your password is stored only as a one-way <strong>bcrypt hash</strong>,
              so it can never be read back out of the database - not even by an
              administrator. Changing it also signs you out everywhere else.
            </div>

            <form onSubmit={handleChangePassword}>

              <div className="pw-field">
                <label>Current Password</label>
                <div className={`pw-input-wrap ${pwErrors.current_password ? "has-error" : ""}`}>
                  <Lock size={15} color="#64748b" />
                  <input
                    type={showCurrentPw ? "text" : "password"}
                    value={pwForm.currentPassword}
                    onChange={(e) =>
                      setPwForm({ ...pwForm, currentPassword: e.target.value })
                    }
                    placeholder="The password you use now"
                    required
                  />
                  <button
                    type="button"
                    className="pw-eye"
                    onClick={() => setShowCurrentPw(!showCurrentPw)}
                  >
                    {showCurrentPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {pwErrors.current_password && (
                  <div className="pw-error">{pwErrors.current_password[0]}</div>
                )}
              </div>

              <div className="pw-field">
                <label>New Password</label>
                <div className={`pw-input-wrap ${pwErrors.password ? "has-error" : ""}`}>
                  <KeyRound size={15} color="#64748b" />
                  <input
                    type={showNewPw ? "text" : "password"}
                    value={pwForm.newPassword}
                    onChange={(e) =>
                      setPwForm({ ...pwForm, newPassword: e.target.value })
                    }
                    placeholder="At least 8 chars, mixed case, number, symbol"
                    required
                  />
                  <button
                    type="button"
                    className="pw-eye"
                    onClick={() => setShowNewPw(!showNewPw)}
                  >
                    {showNewPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {pwErrors.password && (
                  <div className="pw-error">{pwErrors.password[0]}</div>
                )}
              </div>

              <div className="pw-field">
                <label>Confirm New Password</label>
                <div className="pw-input-wrap">
                  <KeyRound size={15} color="#64748b" />
                  <input
                    type={showNewPw ? "text" : "password"}
                    value={pwForm.confirmPassword}
                    onChange={(e) =>
                      setPwForm({ ...pwForm, confirmPassword: e.target.value })
                    }
                    placeholder="Type the new password again"
                    required
                  />
                </div>
              </div>

              <div className="pw-actions">
                <button
                  type="button"
                  className="pw-cancel"
                  onClick={() => setPwOpen(false)}
                  disabled={pwSaving}
                >
                  Cancel
                </button>
                <button type="submit" className="pw-submit" disabled={pwSaving}>
                  {pwSaving ? "Updating..." : "Update Password"}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}
    </>
  );
}