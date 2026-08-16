import React, { useState } from 'react';
import {
  Dog,
  ShieldAlert,
  Home,
  Heart,
  Sun,
  Moon,
  ArrowLeft
} from 'lucide-react';

export default function GlobalSignup({
  darkMode,
  toggleDarkMode,
  setCurrentPage
}) {
  const [selectedRole, setSelectedRole] = useState(null);

  // Handle Card / Sign Up Click
  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    if (setCurrentPage) {
      if (role === 'adopter') {
        setCurrentPage('adopter-form'); // potential adopter-এর ফর্ম পেজ
      } else if (role === 'admin') {
        setCurrentPage('admin-signup'); // নতুন অ্যাডমিন সাইন-আপ পেজ
      } else if (role === 'staff') {
        setCurrentPage('staff-form'); // shelter staff-এর জন্য নির্দিষ্ট সাইন-আপ ফর্ম পেজ
      }
    } else {
      alert(`Selected Role: ${role}`);
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

        html, body, #root {
          width: 100%;
          height: 100%;
          margin: 0;
          padding: 0;
          background: #f0f4f9;
          color: #102c45;
        }

        .container {
          width: 100vw;
          height: 100vh;
          min-width: 100vw;
          min-height: 100vh;
          background: linear-gradient(135deg, #e6f2ff, #f9f4ef, #e3f6ee, #f0e6ff, #e8f4f8);
          background-size: 500% 500%;
          animation: globalMeshFlow 18s ease infinite;
          position: fixed;
          top: 0;
          left: 0;
          overflow-y: auto;
          overflow-x: hidden;
          display: flex;
          flex-direction: column;
        }

        @keyframes globalMeshFlow {
          0% { background-position: 0% 50%; }
          25% { background-position: 50% 100%; }
          50% { background-position: 100% 50%; }
          75% { background-position: 50% 0%; }
          100% { background-position: 0% 50%; }
        }

        .container::before {
          content: '';
          position: absolute;
          top: -120px;
          left: -120px;
          width: 500px;
          height: 500px;
          background: rgba(40, 105, 147, 0.18);
          border-radius: 50%;
          filter: blur(85px);
          z-index: 1;
          animation: floatOrb1 12s ease-in-out infinite alternate;
        }

        .container::after {
          content: '';
          position: absolute;
          bottom: -150px;
          right: -120px;
          width: 550px;
          height: 550px;
          background: rgba(74, 184, 130, 0.15);
          border-radius: 50%;
          filter: blur(95px);
          z-index: 1;
          animation: floatOrb2 15s ease-in-out infinite alternate;
        }

        @keyframes floatOrb1 {
          0% { transform: translate(0, 0) scale(1) rotate(0deg); }
          50% { transform: translate(80px, 100px) scale(1.2) rotate(45deg); }
          100% { transform: translate(-40px, 60px) scale(0.95) rotate(90deg); }
        }

        @keyframes floatOrb2 {
          0% { transform: translate(0, 0) scale(1) rotate(0deg); }
          50% { transform: translate(-100px, -80px) scale(1.25) rotate(-45deg); }
          100% { transform: translate(60px, -40px) scale(1.05) rotate(-90deg); }
        }

        .paw-pattern-bg {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          z-index: 2;
          pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512' width='55' height='55' fill='rgba(40, 105, 147, 0.05)'%3E%3Cg transform='rotate(28 256 256)'%3E%3Cpath d='M256 210c-30.9 0-56 25.1-56 56s25.1 56 56 56 56-25.1 56-56-25.1-56-56-56zm-84-28c14.9 0 27-12.1 27-27s-12.1-27-27-27-27 12.1-27 27 12.1 27 27 27zm168 0c14.9 0 27-12.1 27-27s-12.1-27-27-27-27 12.1-27 27 12.1 27 27 27zM108 300c16.6 0 30-13.4 30-30s-13.4-30-30-30-30 13.4-30 30 13.4 30 30 30zm296 0c16.6 0 30-13.4 30-30s-13.4-30-30-30-30 13.4-30 30 13.4 30 30 30 z'/%3E%3C/g%3E%3C/svg%3E");
          background-size: 210px 210px;
        }

        .navbar {
          height: 75px;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 50px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
          position: relative;
          z-index: 10;
          width: 100%;
          flex-shrink: 0;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
        }

        .logo-icon {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: #286993;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 4px 10px rgba(40, 105, 147, 0.3);
        }

        .logo-text {
          font-size: 22px;
          font-weight: 700;
          line-height: 1.1;
          color: #102c45;
        }

        .navbar-title {
          font-size: 18px;
          font-weight: 600;
          color: #286993;
        }

        .nav-right {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .theme-btn {
          background: rgba(40, 105, 147, 0.1);
          border: none;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #286993;
          transition: background 0.2s;
        }

        .theme-btn:hover {
          background: rgba(40, 105, 147, 0.2);
        }

        .back-btn {
          background: none;
          border: 1px solid #286993;
          color: #286993;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s;
        }

        .back-btn:hover {
          background: #286993;
          color: white;
        }

        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 5;
          padding: 30px 20px;
        }

        .selection-heading {
          font-size: 26px;
          font-weight: 700;
          color: #102c45;
          margin-bottom: 30px;
          text-align: center;
        }

        .role-cards-container {
          display: flex;
          justify-content: center;
          align-items: stretch;
          gap: 25px;
          flex-wrap: wrap;
          max-width: 1100px;
          width: 100%;
          margin-bottom: 30px;
        }

        .role-card {
          width: 320px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.9);
          display: flex;
          flex-direction: column;
          transition: all 0.3s ease;
        }

        .role-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 15px 35px rgba(40, 105, 147, 0.18);
        }

        .card-header-banner {
          height: 130px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }

        .admin-banner {
          background: linear-gradient(135deg, #dceff9 0%, #a2d2eb 100%);
        }

        .staff-banner {
          background: linear-gradient(135deg, #dbfbee 0%, #a3e4c1 100%);
        }

        .adopter-banner {
          background: linear-gradient(135deg, #fff3e0 0%, #ffcc80 100%);
        }

        .banner-icon-box {
          font-size: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
        }

        .card-info-body {
          padding: 25px;
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .role-title {
          font-size: 20px;
          font-weight: 700;
          color: #102c45;
          margin-bottom: 8px;
          text-align: center;
        }

        .role-desc {
          font-size: 13px;
          color: #555;
          text-align: center;
          margin-bottom: 18px;
          line-height: 1.4;
          min-height: 36px;
        }

        .features-box {
          font-size: 12px;
          color: #444;
          background: rgba(0, 0, 0, 0.02);
          padding: 12px;
          border-radius: 10px;
          margin-bottom: 25px;
          flex: 1;
        }

        .features-title {
          font-weight: 700;
          color: #102c45;
          margin-bottom: 4px;
        }

        .card-signup-btn {
          width: 100%;
          border: none;
          padding: 12px;
          border-radius: 25px;
          font-size: 14px;
          font-weight: 700;
          color: white;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease;
          text-align: center;
        }

        .admin-btn {
          background: #286993;
        }
        .admin-btn:hover {
          background: #1f587d;
        }

        .staff-btn {
          background: #38a169;
        }
        .staff-btn:hover {
          background: #2f855a;
        }

        .adopter-btn {
          background: #dd6b20;
        }
        .adopter-btn:hover {
          background: #c05621;
        }

        .auth-footer-text {
          font-size: 14px;
          color: #333;
          margin-top: 10px;
          text-align: center;
        }

        .auth-footer-text span {
          color: #286993;
          font-weight: 700;
          cursor: pointer;
          text-decoration: underline;
        }

        .container.dark {
          background: linear-gradient(135deg, #050d14, #0b1721, #101f2b, #07121a, #09151e);
          color: white;
        }

        .container.dark .paw-pattern-bg {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512' width='55' height='55' fill='rgba(255, 255, 255, 0.035)'%3E%3Cg transform='rotate(28 256 256)'%3E%3Cpath d='M256 210c-30.9 0-56 25.1-56 56s25.1 56 56 56 56-25.1 56-56-25.1-56-56-56zm-84-28c14.9 0 27-12.1 27-27s-12.1-27-27-27-27 12.1-27 27 12.1 27 27 27zm168 0c14.9 0 27-12.1 27-27s-12.1-27-27-27-27 12.1-27 27 12.1 27 27 27zM108 300c16.6 0 30-13.4 30-30s-13.4-30-30-30-30 13.4-30 30 13.4 30 30 30zm296 0c16.6 0 30-13.4 30-30s-13.4-30-30-30-30 13.4-30 30 13.4 30 30 30 z'/%3E%3C/g%3E%3C/svg%3E");
        }

        .container.dark .navbar {
          background: rgba(30, 48, 61, 0.85);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .container.dark .logo-text,
        .container.dark .navbar-title,
        .container.dark .selection-heading {
          color: white;
        }

        .container.dark .back-btn {
          border-color: #55a9d7;
          color: #55a9d7;
        }
        .container.dark .back-btn:hover {
          background: #55a9d7;
          color: #050d14;
        }

        .container.dark .theme-btn {
          background: rgba(255, 255, 255, 0.1);
          color: #f7b85c;
        }

        .container.dark .role-card {
          background: rgba(30, 48, 61, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
        }

        .container.dark .role-title {
          color: white;
        }

        .container.dark .role-desc {
          color: #cbd5e1;
        }

        .container.dark .features-box {
          background: rgba(255, 255, 255, 0.04);
          color: #e2e8f0;
        }

        .container.dark .features-title {
          color: #6ee7b7;
        }

        .container.dark .auth-footer-text {
          color: #cbd5e1;
        }

        .container.dark .admin-banner {
          background: linear-gradient(135deg, rgba(85, 169, 215, 0.2) 0%, rgba(30, 48, 61, 0.8) 100%);
        }
        .container.dark .staff-banner {
          background: linear-gradient(135deg, rgba(74, 184, 130, 0.2) 0%, rgba(30, 48, 61, 0.8) 100%);
        }
        .container.dark .adopter-banner {
          background: linear-gradient(135deg, rgba(247, 184, 92, 0.2) 0%, rgba(30, 48, 61, 0.8) 100%);
        }

        @media (max-width: 1024px) {
          .role-cards-container {
            flex-direction: column;
            align-items: center;
          }
          .role-card {
            width: 100%;
            max-width: 320px;
          }
        }

        @media (max-width: 950px) {
          .navbar {
            padding: 0 20px;
          }
        }
      `}</style>

      <div className={`container ${darkMode ? 'dark' : ''}`}>
        
        <div className="paw-pattern-bg"></div>

        <nav className="navbar">
          <div className="logo" onClick={() => setCurrentPage && setCurrentPage('landing')}>
            <div className="logo-icon">
              <Dog size={24} />
            </div>
            <div className="logo-text">
              PET
              <br />
              CONNECT
            </div>
          </div>

          <div className="navbar-title">
            Select Your Account Type
          </div>

          <div className="nav-right">
            <button
              className="theme-btn"
              onClick={toggleDarkMode}
              title="Toggle Theme"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button
              className="back-btn"
              onClick={() => setCurrentPage && setCurrentPage('landing')}
            >
              <ArrowLeft size={16} /> Back
            </button>
          </div>
        </nav>

        <div className="main-content">
          <h2 className="selection-heading">Choose Your Portal</h2>

          <div className="role-cards-container">
            
            {/* 1. Platform Admin Card */}
            <div className="role-card">
              <div className="card-header-banner admin-banner">
                <div className="banner-icon-box">
                  💻⚙️
                </div>
              </div>
              <div className="card-info-body">
                <h3 className="role-title">Platform Admin</h3>
                <p className="role-desc">For system managers and data overview.</p>
                <div className="features-box">
                  <div className="features-title">Features:</div>
                  Manage platform data, view reports, configure settings.
                </div>
                <button
                  className="card-signup-btn admin-btn"
                  onClick={() => handleRoleSelect('admin')}
                >
                  SIGN UP
                </button>
              </div>
            </div>

            {/* 2. Shelter Staff Card */}
            <div className="role-card">
              <div className="card-header-banner staff-banner">
                <div className="banner-icon-box">
                  🏡🐶
                </div>
              </div>
              <div className="card-info-body">
                <h3 className="role-title">Shelter Staff</h3>
                <p className="role-desc">For shelter workers and volunteers.</p>
                <div className="features-box">
                  <div className="features-title">Features:</div>
                  List new animals, manage adoption requests, update pet profiles.
                </div>
                <button
                  className="card-signup-btn staff-btn"
                  onClick={() => handleRoleSelect('staff')}
                >
                  SIGN UP
                </button>
              </div>
            </div>

            {/* 3. Potential Adopter Card */}
            <div className="role-card">
              <div className="card-header-banner adopter-banner">
                <div className="banner-icon-box">
                  🧑‍🤝‍🧑🐶
                </div>
              </div>
              <div className="card-info-body">
                <h3 className="role-title">Potential Adopter</h3>
                <p className="role-desc">For people looking to adopt a pet.</p>
                <div className="features-box">
                  <div className="features-title">Features:</div>
                  Browse pets, save favorites, submit adoption applications.
                </div>
                <button
                  className="card-signup-btn adopter-btn"
                  onClick={() => handleRoleSelect('adopter')}
                >
                  SIGN UP
                </button>
              </div>
            </div>

          </div>

          <div className="auth-footer-text">
            Already have an account?{' '}
            <span onClick={() => setCurrentPage && setCurrentPage('login')}>
              Log In
            </span>
          </div>

        </div>

      </div>
    </>
  );
}