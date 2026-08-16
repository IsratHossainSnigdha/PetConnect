import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";

// Landing
import LandingPage from "./pages/LandingPage/landingPage";

// Signup Pages
import GlobalSignup from "./pages/SignupPages/globalSignup";
import AdopterSignup from "./pages/SignupPages/adopterSignup";
import ShelterSignup from "./pages/SignupPages/shelterSignup";
import AdminSignup from "./pages/SignupPages/adminSignup";

// Dashboard Pages
import AdminDashboard from "./pages/DashboardPages/adminDashboard";
import AdopterDashboard from "./pages/DashboardPages/adopterDashboard";
import ShelterDashboard from "./pages/DashboardPages/shelterDashboard";

// Profile pages
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
        element={
          <LandingPage
            darkMode={darkMode}
            toggleDarkMode={toggleDarkMode}
          />
        }
      />

      {/* Signup */}
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

      {/* Dashboards */}
      <Route
        path="/dashboard/admin"
        element={<AdminDashboard darkMode={darkMode} toggleDarkMode={toggleDarkMode} />}
      />

      <Route
        path="/dashboard/adopter"
        element={<AdopterDashboard darkMode={darkMode} toggleDarkMode={toggleDarkMode} />}
      />

      <Route
        path="/dashboard/shelter"
        element={<ShelterDashboard darkMode={darkMode} toggleDarkMode={toggleDarkMode} />}
      />
      <Route
  path="/profile/admin"
  element={<AdminProfile darkMode={darkMode} toggleDarkMode={toggleDarkMode} />}
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