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
import React, { useState, useEffect } from 'react';
import LandingPage from './pages/LandingPage/landingPage';
import GlobalSignup from './pages/SignupPages/globalSignup';
import AdopterSignup from './pages/SignupPages/adopterSignup';
import ShelterSignup from './pages/SignupPages/shelterSignup';
import AdminSignup from './pages/SignupPages/adminSignup';
import AdminDashboard from './pages/DashboardPages/adminDashboard';
import AdminProfile from './pages/DashboardPages/AdminProfile';
import AdopterDashboard from './pages/DashboardPages/adopterDashboard';

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

    
  // Valid routes list
  const validPages = [
    'home', 'landing', 'signup', 'admin-signup-select', 
    'global-signup', 'admin-signup', 'adopter-form', 
    'staff-form', 'admin-portal', 'staff-portal', 'login',
    'admin-dashboard', 'admin-profile', 'adopter-dashboard' 
  ];

  return (
    <div style={{ width: '100vw', minHeight: '100vh', overflowX: 'hidden' }}>
      {/* Home / Landing Page */}
      {(currentPage === 'home' || currentPage === 'landing') && (
        <LandingPage
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          setCurrentPage={setCurrentPage}
        />
      )}
      
      {/* Global Signup / Role Selection Page */}
      {(currentPage === 'signup' || currentPage === 'admin-signup-select' || currentPage === 'global-signup') && (
        <GlobalSignup
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          setCurrentPage={setCurrentPage}
        />
      )}

      {/* Platform Admin Signup Page */}
      {currentPage === 'admin-signup' && (
        <AdminSignup
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          setCurrentPage={setCurrentPage}
        />
      )}

      {/* Potential Adopter Form Page */}
      {currentPage === 'adopter-form' && (
        <AdopterSignup
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          setCurrentPage={setCurrentPage}
        />
      )}

      {/* Shelter Staff Form Page */}
      {currentPage === 'staff-form' && (
        <ShelterSignup
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          setCurrentPage={setCurrentPage}
        />
      )}

      {/* Admin Dashboard Page */}
      {currentPage === 'admin-dashboard' && (
        <AdminDashboard
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          setCurrentPage={setCurrentPage}
        />
      )}

      {/* Adopter Dashboard Page */}
      {currentPage === 'adopter-dashboard' && (
        <AdopterDashboard
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          setCurrentPage={setCurrentPage}
        />
      )}

      {/* Admin Profile Page */}
      {currentPage === 'admin-profile' && (
        <AdminProfile
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          setCurrentPage={setCurrentPage}
        />
      )}

      {/* Platform Admin Portal */}
      {currentPage === 'admin-portal' && (
        <div style={{ padding: '50px', textAlign: 'center', fontFamily: 'Arial', background: darkMode ? '#050d14' : '#f0f4f9', color: darkMode ? '#fff' : '#102c45', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h2>Platform Admin Portal</h2>
          <button 
            onClick={() => setCurrentPage('global-signup')}
            style={{ padding: '10px 20px', marginTop: '20px', cursor: 'pointer', background: '#286993', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}
          >
            Back to Selection
          </button>
        </div>
      )}

      {/* Shelter Staff Portal */}
      {currentPage === 'staff-portal' && (
        <div style={{ padding: '50px', textAlign: 'center', fontFamily: 'Arial', background: darkMode ? '#050d14' : '#f0f4f9', color: darkMode ? '#fff' : '#102c45', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h2>Shelter Staff Portal</h2>
          <button 
            onClick={() => setCurrentPage('global-signup')}
            style={{ padding: '10px 20px', marginTop: '20px', cursor: 'pointer', background: '#38a169', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}
          >
            Back to Selection
          </button>
        </div>
      )}

      {/* Login Page */}
      {currentPage === 'login' && (
        <div style={{ padding: '50px', textAlign: 'center', fontFamily: 'Arial', background: darkMode ? '#050d14' : '#f0f4f9', color: darkMode ? '#fff' : '#102c45', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h2>Login Page</h2>
          <p style={{ marginTop: '10px' }}>Login functionality will be available here soon.</p>
          <button 
            onClick={() => setCurrentPage('landing')}
            style={{ padding: '10px 20px', marginTop: '20px', cursor: 'pointer', background: '#dd6b20', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}
          >
            Back to Home
          </button>
        </div>
      )}

      {/* Fallback Safety Net */}
      {!validPages.includes(currentPage) && (
        <div style={{ padding: '50px', textAlign: 'center', fontFamily: 'Arial', background: darkMode ? '#050d14' : '#f0f4f9', color: darkMode ? '#fff' : '#102c45', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h2>Oops! Page Not Found</h2>
          <p style={{ marginTop: '10px' }}>The page you are looking for does not exist or was renamed.</p>
          <button 
            onClick={() => setCurrentPage('home')}
            style={{ padding: '10px 20px', marginTop: '20px', cursor: 'pointer', background: '#286993', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}
          >
            Go to Home
          </button>
        </div>
      )}
    </div>
  );
}