import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";

// Landing Page
import LandingPage from "./pages/LandingPage/landingPage";

// Login
import LoginPage from "./pages/LoginPage/loginPage";

// Auth Guard
import RequireAuth from "./components/RequireAuth";

// Signup Pages
import GlobalSignup from "./pages/SignupPages/globalSignup";
import AdopterSignup from "./pages/SignupPages/adopterSignup";
import ShelterSignup from "./pages/SignupPages/shelterSignup";
import AdminSignup from "./pages/SignupPages/adminSignup";

// Dashboards & Add Pet / Manage Pets
import AdopterDashboard from "./pages/DashboardPages/adopterDashboard";
import ShelterDashboard from "./pages/DashboardPages/shelterDashboard";
import AddPet from "./pages/DashboardPages/AddPet";
import ManagePets from "./pages/DashboardPages/ManagePets";

// My Profile Page
import MyProfile from "./pages/DashboardPages/MyProfile";

// Application Pages
import AdopterApplications from "./pages/ApplicationPages/adopterApplications";

// Admin Complaints (issue #41)
import AdminComplaints from "./pages/ComplaintPages/adminComplaints";

// Admin Reports (issue #42)
import AdminReports from "./pages/ReportPages/adminReports";

// Shelter Pages (issue #35)
import AdminShelters from "./pages/ShelterPages/adminShelters";

// Complaint Pages
import AdopterComplaints from "./pages/ComplaintPages/adopterComplaints";

export default function App() {
  // ================================
  // USER
  // ================================
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.error("Error loading user:", error);
      return null;
    }
  });

  // ================================
  // DARK MODE
  // ================================
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });

  // ================================
  // TOGGLE DARK MODE
  // ================================
  const toggleDarkMode = () => {
    setDarkMode((previous) => !previous);
  };

  // ================================
  // SAVE DARK MODE
  // ================================
  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  // ================================
  // SAVE USER
  // ================================
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    }
  }, [user]);

  return (
    <Routes>

      {/* LANDING */}
      <Route
        path="/"
        element={<LandingPage />}
      />

      {/* LOGIN */}
      <Route
        path="/login"
        element={
          <LoginPage setUser={setUser} />
        }
      />

      {/* SIGNUP */}
      <Route
        path="/signup"
        element={<GlobalSignup />}
      />
      <Route
        path="/signup/adopter"
        element={<AdopterSignup />}
      />
      <Route
        path="/signup/shelter"
        element={<ShelterSignup />}
      />
      <Route
        path="/signup/staff"
        element={<ShelterSignup />}
      />
      <Route
        path="/signup/admin"
        element={<AdminSignup />}
      />

      {/* ADOPTER DASHBOARD */}
      <Route
        path="/dashboard/adopter"
        element={
          <RequireAuth>
            <AdopterDashboard
              darkMode={darkMode}
              toggleDarkMode={toggleDarkMode}
            />
          </RequireAuth>
        }
      />

      {/* SHELTER DASHBOARD */}
      <Route
        path="/dashboard/shelter"
        element={
          <RequireAuth>
            <ShelterDashboard
              darkMode={darkMode}
              toggleDarkMode={toggleDarkMode}
            />
          </RequireAuth>
        }
      />

      {/* ADD PET ROUTE */}
      <Route
        path="/dashboard/shelter/add-pet"
        element={
          <RequireAuth>
            <AddPet
              darkMode={darkMode}
              toggleDarkMode={toggleDarkMode}
            />
          </RequireAuth>
        }
      />

      {/* MANAGE PETS ROUTE */}
      <Route
        path="/dashboard/shelter/manage-pets"
        element={
          <RequireAuth>
            <ManagePets
              darkMode={darkMode}
              toggleDarkMode={toggleDarkMode}
            />
          </RequireAuth>
        }
      />

      {/* MY PROFILE ROUTE */}
      <Route
        path="/profile/shelter"
        element={
          <RequireAuth>
            <MyProfile
              darkMode={darkMode}
              toggleDarkMode={toggleDarkMode}
            />
          </RequireAuth>
        }
      />

      {/* =========================
          SHELTER MANAGEMENT  (issue #35)
      ========================= */}
      <Route
        path="/shelters/admin"
        element={
          <RequireAuth role="platform_admin">
            <AdminShelters
              darkMode={darkMode}
              toggleDarkMode={toggleDarkMode}
            />
          </RequireAuth>
        }
      />

      {/* =========================
          ADMIN COMPLAINTS  (issue #41)
      ========================= */}
      <Route
        path="/complaints/admin"
        element={
          <RequireAuth role="platform_admin">
            <AdminComplaints
              darkMode={darkMode}
              toggleDarkMode={toggleDarkMode}
            />
          </RequireAuth>
        }
      />

      {/* =========================
          ADMIN REPORTS  (issue #42)
      ========================= */}
      <Route
        path="/reports/admin"
        element={
          <RequireAuth role="platform_admin">
            <AdminReports
              darkMode={darkMode}
              toggleDarkMode={toggleDarkMode}
            />
          </RequireAuth>
        }
      />

      {/* 404 */}
      <Route
        path="*"
        element={
          <div
            style={{
              minHeight: "100vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              fontFamily: "Arial, sans-serif",
            }}
          >
            <h1>404</h1>
            <p>Page Not Found</p>
          </div>
        }
      />

    </Routes>
  );
}