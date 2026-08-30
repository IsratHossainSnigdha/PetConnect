import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
  Dog,
  Sun,
  Moon,
  LogOut,
  LayoutDashboard,
  PawPrint,
  Heart,
  Clock,
  CheckCircle,
  Plus,
  Bell,
  User,
  Settings,
  Menu,
  X,
} from "lucide-react";

import "./shelterDashboard.css";

export default function ShelterDashboard({
  darkMode,
  toggleDarkMode,
}) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    treatment: 0,
    adopted: 0,
    pending: 0
  });

  const [pets, setPets] = useState([]);
  const [adoptionRequests, setAdoptionRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  
  const [userData, setUserData] = useState({
    name: "Shelter Staff",
    role: "Administrator"
  });

  
  useEffect(() => {
    const storedUser = localStorage.getItem("petconnect_user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUserData({
          name: parsedUser.name || parsedUser.username || "Shelter Staff",
          role: parsedUser.role || parsedUser.user_type || "Administrator"
        });
      } catch (e) {
        console.error("Error parsing user data from localStorage", e);
      }
    }
  }, []);

 
  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem("petconnect_token");
      
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/shelter/dashboard", {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (response.data) {
          setStats(response.data.stats);
          setPets(response.data.pets);
          setAdoptionRequests(response.data.adoptionRequests);
          
          
          localStorage.setItem('cached_shelter_stats', JSON.stringify(response.data.stats));
          localStorage.setItem('cached_shelter_pets', JSON.stringify(response.data.pets));
        }
      } catch (error) {
        console.error("API Fetch Error, falling back to cache:", error);
        
       
        const cachedStats = localStorage.getItem('cached_shelter_stats');
        const cachedPets = localStorage.getItem('cached_shelter_pets');

        if (cachedStats) setStats(JSON.parse(cachedStats));
        if (cachedPets) {
          const parsedPets = JSON.parse(cachedPets);
          setPets(parsedPets);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const goTo = (path) => {
    closeSidebar();
    navigate(path);
  };

  const handleLogout = () => {
    localStorage.removeItem("petconnect_token");
    localStorage.removeItem("petconnect_user");
    navigate("/login");
  };

  const statsCards = [
    {
      title: "Total Pets",
      value: stats.total,
      icon: <PawPrint size={24} />,
      className: "green",
    },
    {
      title: "Available for Adoption",
      value: stats.available,
      icon: <Heart size={24} />,
      className: "blue",
    },
    {
      title: "Pending Requests",
      value: stats.pending,
      icon: <Clock size={24} />,
      className: "orange",
    },
    {
      title: "Adopted",
      value: stats.adopted,
      icon: <CheckCircle size={24} />,
      className: "purple",
    },
  ];

  return (
    <>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: Arial, Helvetica, sans-serif;
        }

        html, body {
          width: 100%;
          height: 100%;
          margin: 0;
          padding: 0;
          background: #f0f4f9;
          color: #102c45;
          overflow: hidden;
        }

        #root {
          width: 100%;
          height: 100%;
          overflow: hidden;
        }

        .dashboard-container {
          width: 100vw;
          height: 100vh;
          background: linear-gradient(135deg, #e6f2ff, #f9f4ef, #e3f6ee, #f0e6ff, #e8f4f8);
          background-size: 500% 500%;
          animation: globalMeshFlow 18s ease infinite;
          position: relative;
          overflow: hidden;
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

        .dashboard-container::before {
          content: '';
          position: absolute;
          top: -120px;
          left: -120px;
          width: 500px;
          height: 500px;
          background: rgba(56, 161, 105, 0.12);
          border-radius: 50%;
          filter: blur(85px);
          z-index: 1;
          animation: floatOrb1 12s ease-in-out infinite alternate;
        }

        .dashboard-container::after {
          content: '';
          position: absolute;
          bottom: -150px;
          right: -120px;
          width: 550px;
          height: 550px;
          background: rgba(40, 105, 147, 0.15);
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

        .dashboard-container.dark {
          background: linear-gradient(135deg, #050d14, #0b1721, #101f2b, #07121a, #09151e);
          color: white;
        }
      `}</style>

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

          <div className="navbar-center">Shelter Staff Portal</div>

          <div className="navbar-right">
            <button
              className="icon-button mobile-menu"
              onClick={() => setSidebarOpen((previous) => !previous)}
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

            <button className="sidebar-item active" onClick={() => goTo("/dashboard/shelter")} type="button">
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

            <button className="sidebar-item" onClick={() => goTo("/settings")} type="button">
              <Settings size={18} />
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
          <main className="dashboard-main">
            <section className="welcome-section">
              <div>
                <h1>Welcome back, {userData.name}! 👋</h1>
                <p>Here's what's happening at your shelter today.</p>
              </div>

              <button className="add-pet-button" onClick={() => goTo("/dashboard/shelter/add-pet")} type="button">
                <Plus size={18} />
                Add New Pet
              </button>
            </section>

            {/* STATISTICS */}
            <section className="stats-grid">
              {statsCards.map((stat, index) => (
                <div className="stat-card" key={index}>
                  <div className="stat-text">
                    <span>{stat.title}</span>
                    <strong>{stat.value}</strong>
                  </div>
                  <div className={`stat-icon ${stat.className}`}>
                    {stat.icon}
                  </div>
                </div>
              ))}
            </section>

            {/* CONTENT GRID */}
            <div className="content-grid">
              {/* LEFT COLUMN */}
              <div>
                <div className="dashboard-card">
                  <div className="card-header">
                    <h2>Recent Pets</h2>
                    <button className="view-all" onClick={() => goTo("/dashboard/shelter/manage-pets")} type="button">
                      View All
                    </button>
                  </div>

                  <div className="table-wrapper">
                    <table className="pet-table">
                      <thead>
                        <tr>
                          <th>Pet</th>
                          <th>Type</th>
                          <th>Age</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pets.length > 0 ? (
                          pets.map((pet, index) => (
                            <tr key={pet.id || index}>
                              <td>
                                <div className="pet-info">
                                  <div className="pet-avatar">
                                    {pet.image ? (
                                      <img 
                                        src={pet.image} 
                                        alt={pet.name} 
                                        style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} 
                                      />
                                    ) : (
                                      <PawPrint size={17} />
                                    )}
                                  </div>
                                  <span className="pet-name">{pet.name}</span>
                                </div>
                              </td>
                              <td>{pet.type}</td>
                              <td>{pet.age || 'N/A'}</td>
                              <td>
                                <span className={`status ${pet.status ? pet.status.toLowerCase().replace(/\s+/g, '-') : 'available'}`}>
                                  {pet.status}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>
                              {loading ? "Loading pets..." : "No pets found."}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN */}
              <div>
                <div className="dashboard-card">
                  <div className="card-header">
                    <h2>Recent Adoption Requests</h2>
                  </div>

                  {adoptionRequests.length > 0 ? (
                    adoptionRequests.map((request, index) => (
                      <div className="request-item" key={index}>
                        <div className="request-user">
                          <div className="request-avatar">
                            <User size={17} />
                          </div>
                          <div>
                            <strong>{request.name}</strong>
                            <span>Requested {request.pet}</span>
                          </div>
                        </div>

                        <div className="request-right">
                          <span className={`status ${request.status.toLowerCase()}`}>
                            {request.status}
                          </span>
                          <small>{request.date}</small>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p style={{ padding: '15px', textAlign: 'center' }}>
                      {loading ? "Loading requests..." : "No recent requests."}
                    </p>
                  )}
                </div>

                {/* QUICK ACTIONS */}
                <div className="dashboard-card">
                  <div className="card-header">
                    <h2>Quick Actions</h2>
                  </div>

                  <div className="quick-actions">
                    <button className="quick-action" onClick={() => goTo("/dashboard/shelter/add-pet")} type="button">
                      <Plus size={20} />
                      <strong>Add Pet</strong>
                      <span>Register a new shelter pet</span>
                    </button>

                    <button className="quick-action" onClick={() => goTo("/profile/shelter")} type="button">
                      <User size={20} />
                      <strong>My Profile</strong>
                      <span>View or edit staff profile</span>
                    </button>

                    <button className="quick-action" onClick={() => goTo("/settings")} type="button">
                      <Settings size={20} />
                      <span>Manage account settings</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}