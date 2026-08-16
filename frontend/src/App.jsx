import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";

// Landing
import LandingPage from "./pages/LandingPage/landingPage";

// Login
import LoginPage from "./pages/LoginPage/loginPage";

// Route guard - keeps signed-out visitors off the dashboards
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

export default function App() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("petConnectTheme") === "dark";
  });

  useEffect(() => {
    localStorage.setItem("petConnectTheme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  return (
    <Routes>
      {/* Landing */}
      <Route
        path="/"
        element={<LandingPage darkMode={darkMode} toggleDarkMode={toggleDarkMode} />}
      />

      {/* Signup */}
      <Route
        path="/signup"
        element={<GlobalSignup darkMode={darkMode} toggleDarkMode={toggleDarkMode} />}
      />

      <Route
        path="/signup/adopter"
        element={<AdopterSignup darkMode={darkMode} toggleDarkMode={toggleDarkMode} />}
      />

      <Route
        path="/signup/shelter"
        element={<ShelterSignup darkMode={darkMode} toggleDarkMode={toggleDarkMode} />}
      />

      <Route
        path="/signup/admin"
        element={<AdminSignup darkMode={darkMode} toggleDarkMode={toggleDarkMode} />}
      />

      {/* Login - the signup pages already linked here */}
      <Route
        path="/login"
        element={<LoginPage darkMode={darkMode} toggleDarkMode={toggleDarkMode} />}
      />

      {/*
        Dashboards - wrapped in RequireAuth so a signed-out visitor is bounced
        to /login instead of seeing the page. The `role` prop additionally keeps
        an adopter out of the admin dashboard.

        Remember this is only the UI layer; the server enforces the same rules
        independently on every API call.
      */}
      <Route
        path="/dashboard/admin"
        element={
          <RequireAuth role="platform_admin">
            <AdminDashboard darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
          </RequireAuth>
        }
      />

      <Route
        path="/dashboard/adopter"
        element={
          <RequireAuth role="adopter">
            <AdopterDashboard darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
          </RequireAuth>
        }
      />

      <Route
        path="/dashboard/shelter"
        element={
          <RequireAuth role="shelter_staff">
            <ShelterDashboard darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
          </RequireAuth>
        }
      />

      <Route
  path="/signup/staff"
  element={
    <ShelterSignup
      darkMode={darkMode}
      toggleDarkMode={toggleDarkMode}
    />
  }
/>

      {/* Profile Pages */}
      <Route
        path="/profile/admin"
        element={
          <RequireAuth role="platform_admin">
            <AdminProfile darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
          </RequireAuth>
        }
      />

      <Route
        path="/profile/adopter"
        element={<AdopterProfile darkMode={darkMode} toggleDarkMode={toggleDarkMode} />}
      />

      <Route
        path="/profile/shelter"
        element={<ShelterProfile darkMode={darkMode} toggleDarkMode={toggleDarkMode} />}
      />
    </Routes>
  );
}