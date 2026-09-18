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

// Dashboards & Pet Management
import AdopterDashboard from "./pages/DashboardPages/adopterDashboard";
import ShelterDashboard from "./pages/DashboardPages/shelterDashboard";
import AdminDashboard from "./pages/DashboardPages/adminDashboard";
import AddPet from "./pages/DashboardPages/AddPet";
import ManagePets from "./pages/DashboardPages/ManagePets";

// Profile Page
import MyProfile from "./pages/DashboardPages/MyProfile";
import AdminProfile from "./pages/ProfilePages/adminProfile";

// Application Pages
import AdopterApplications from "./pages/ApplicationPages/adopterApplications";

// Complaint Pages
import AdopterComplaints from "./pages/ComplaintPages/adopterComplaints";
import AdminComplaints from "./pages/ComplaintPages/adminComplaints";

// Report Pages
import AdminReports from "./pages/ReportPages/adminReports";

// Shelter Pages
import AdminShelters from "./pages/ShelterPages/adminShelters";
import ShelterDetail from "./pages/ShelterPages/shelterDetail";
import AdopterProfile from "./pages/ProfilePages/adopterProfile";

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
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  return (
    <Routes>
      {/* =========================
          LANDING PAGE
      ========================= */}
      <Route path="/" element={<LandingPage />} />

      {/* =========================
          LOGIN
      ========================= */}
      <Route path="/login" element={<LoginPage setUser={setUser} />} />

      {/* =========================
          SIGNUP
      ========================= */}
      <Route path="/signup" element={<GlobalSignup />} />

      <Route path="/signup/adopter" element={<AdopterSignup />} />

      <Route path="/signup/shelter" element={<ShelterSignup />} />

      {/* STAFF SIGNUP */}
      <Route path="/signup/staff" element={<ShelterSignup />} />

      <Route path="/signup/admin" element={<AdminSignup />} />

      {/* =========================
          ADOPTER ROUTES
      ========================= */}

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

      {/* ADOPTER APPLICATIONS */}
      <Route
        path="/applications/adopter"
        element={
          <RequireAuth>
            <AdopterApplications
              darkMode={darkMode}
              toggleDarkMode={toggleDarkMode}
            />
          </RequireAuth>
        }
      />

      {/* ADOPTER COMPLAINTS */}
      <Route
        path="/complaints/adopter"
        element={
          <RequireAuth>
            <AdopterComplaints
              darkMode={darkMode}
              toggleDarkMode={toggleDarkMode}
            />
          </RequireAuth>
        }
      />

      <Route
        path="/profile/adopter"
        element={
          <RequireAuth>
            <AdopterProfile
              darkMode={darkMode}
              toggleDarkMode={toggleDarkMode}
            />
          </RequireAuth>
        }
      />

      {/* =========================
          SHELTER ROUTES
      ========================= */}

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

      {/* ADD PET */}
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

      {/* MANAGE PETS */}
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

      {/* SHELTER PROFILE */}
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
          ADMIN ROUTES
      ========================= */}

      {/* ADMIN DASHBOARD */}
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

      {/* ADMIN PROFILE */}
      <Route
        path="/profile/admin"
        element={
          <RequireAuth role="platform_admin">
            <MyProfile
              darkMode={darkMode}
              toggleDarkMode={toggleDarkMode}
            />
          </RequireAuth>
        }
      />

      {/* ADMIN SHELTER MANAGEMENT */}
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

      {/* SHELTER DETAILS */}
      <Route
        path="/shelters/admin/:id"
        element={
          <RequireAuth role="platform_admin">
            <ShelterDetail
              darkMode={darkMode}
              toggleDarkMode={toggleDarkMode}
            />
          </RequireAuth>
        }
      />

      {/* ADMIN COMPLAINTS */}
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

      {/* ADMIN REPORTS */}
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

      {/* =========================
          404 PAGE
      ========================= */}
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