import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";

// Landing
import LandingPage from "./pages/LandingPage/landingPage";

// Login
import LoginPage from "./pages/LoginPage/loginPage";

// Route guard
import RequireAuth from "./components/RequireAuth";

// Signup Pages
import GlobalSignup from "./pages/SignupPages/globalSignup";
import AdopterSignup from "./pages/SignupPages/adopterSignup";
import ShelterSignup from "./pages/SignupPages/shelterSignup";
import AdminSignup from "./pages/SignupPages/adminSignup";

// Dashboard Pages
import AdminDashboard from "./pages/DashboardPages/adminDashboard";
import AdopterDashboard from "./pages/DashboardPages/adopterDashboard";
import ShelterDashboard from "./pages/DashboardPages/shelterDashboard";

// Profile Pages
import AdminProfile from "./pages/ProfilePages/adminProfile";
import AdopterProfile from "./pages/ProfilePages/adopterProfile";
import ShelterProfile from "./pages/ProfilePages/shelterProfile";


// Application Pages
import AdopterApplications from "./pages/ApplicationPages/adopterApplications";

// Complaint Pages
import AdopterComplaints from "./pages/ComplaintPages/adopterComplaints";

export default function App() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("petConnectTheme") === "dark";
  });

  useEffect(() => {
    localStorage.setItem(
      "petConnectTheme",
      darkMode ? "dark" : "light"
    );
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  return (
    <Routes>

      {/* =========================
          LANDING PAGE
      ========================= */}
      <Route
        path="/"
        element={
          <LandingPage
            darkMode={darkMode}
            toggleDarkMode={toggleDarkMode}
          />
        }
      />

      {/* =========================
          SIGNUP PAGES
      ========================= */}
      <Route
        path="/signup"
        element={
          <GlobalSignup
            darkMode={darkMode}
            toggleDarkMode={toggleDarkMode}
          />
        }
      />

      <Route
        path="/signup/adopter"
        element={
          <AdopterSignup
            darkMode={darkMode}
            toggleDarkMode={toggleDarkMode}
          />
        }
      />

      <Route
        path="/signup/shelter"
        element={
          <ShelterSignup
            darkMode={darkMode}
            toggleDarkMode={toggleDarkMode}
          />
        }
      />

      <Route
        path="/signup/admin"
        element={
          <AdminSignup
            darkMode={darkMode}
            toggleDarkMode={toggleDarkMode}
          />
        }
      />

      {/* Shelter staff signup */}
      <Route
        path="/signup/staff"
        element={
          <ShelterSignup
            darkMode={darkMode}
            toggleDarkMode={toggleDarkMode}
          />
        }
      />

      {/* =========================
          LOGIN
      ========================= */}
      <Route
        path="/login"
        element={
          <LoginPage
            darkMode={darkMode}
            toggleDarkMode={toggleDarkMode}
          />
        }
      />

      {/* =========================
          ADMIN DASHBOARD
      ========================= */}
      <Route
        path="/dashboard/admin"
        element={
          <RequireAuth role="platform_admin">
            <AdminDashboard
              darkMode={darkMode}
              toggleDarkMode={toggleDarkMode}
            />
          </RequireAuth>
        }
      />

      {/* =========================
          ADOPTER DASHBOARD
      ========================= */}
      <Route
        path="/dashboard/adopter"
        element={
          <RequireAuth role="adopter">
            <AdopterDashboard
              darkMode={darkMode}
              toggleDarkMode={toggleDarkMode}
            />
          </RequireAuth>
        }
      />

      {/* =========================
          SHELTER DASHBOARD
      ========================= */}
      <Route
        path="/dashboard/shelter"
        element={
          <RequireAuth role="shelter_staff">
            <ShelterDashboard
              darkMode={darkMode}
              toggleDarkMode={toggleDarkMode}
            />
          </RequireAuth>
        }
      />

      {/* =========================
          ADMIN PROFILE
      ========================= */}
      <Route
        path="/profile/admin"
        element={
          <RequireAuth role="platform_admin">
            <AdminProfile
              darkMode={darkMode}
              toggleDarkMode={toggleDarkMode}
            />
          </RequireAuth>
        }
      />

      {/* =========================
          ADOPTER PROFILE
      ========================= */}
      <Route
        path="/profile/adopter"
        element={
          <RequireAuth role="adopter">
            <AdopterProfile
              darkMode={darkMode}
              toggleDarkMode={toggleDarkMode}
            />
          </RequireAuth>
        }
      />

      {/* =========================
          SHELTER PROFILE
      ========================= */}
      <Route
        path="/profile/shelter"
        element={
          <RequireAuth role="shelter_staff">
            <ShelterProfile
              darkMode={darkMode}
              toggleDarkMode={toggleDarkMode}
            />
          </RequireAuth>
        }
      />

      {/* =========================
          ADOPTER APPLICATIONS
      ========================= */}
      <Route
        path="/applications/adopter"
        element={
          <RequireAuth role="adopter">
            <AdopterApplications
              darkMode={darkMode}
              toggleDarkMode={toggleDarkMode}
            />
          </RequireAuth>
        }
      />

      <Route
        path="/complaints/adopter"
        element={
          <AdopterComplaints
            darkMode={darkMode}
            toggleDarkMode={toggleDarkMode}
          />
        }
      />

    </Routes>
  );
}