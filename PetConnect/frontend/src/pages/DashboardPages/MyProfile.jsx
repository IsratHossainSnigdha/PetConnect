import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Edit3, 
  Save, 
  X, 
  ShieldCheck, 
  Heart,
  Dog,
  Sun,
  Moon
} from "lucide-react";

export default function MyProfile({ darkMode, toggleDarkMode }) {
  const navigate = useNavigate();

 
  const [userProfile, setUserProfile] = useState({
    name: "Ishrat Jahan Ifa",
    email: "ifa@petconnect.com",
    phone: "+880 1234 567890",
    role: "Shelter Administrator",
    address: "Dhaka, Bangladesh",
    bio: "Passionate animal lover and shelter manager working to find loving homes for rescued pets.",
    avatar: ""
  });

  const [isEditing, setIsEditing] = useState(false);
  const [tempProfile, setTempProfile] = useState(userProfile);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

 
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("petconnect_token") || localStorage.getItem("token");

      try {
        const response = await axios.get("http://127.0.0.1:8000/api/user/profile", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (response.data) {
          setUserProfile(response.data);
          setTempProfile(response.data);
        }
      } catch (error) {
        console.log("API profile fetch failed, using localStorage data:", error);
        
        const savedUser = localStorage.getItem("petconnect_user") || localStorage.getItem("user");
        if (savedUser) {
          try {
            const parsedUser = JSON.parse(savedUser);
            const updatedProfile = {
              ...userProfile,
              name: parsedUser.name || userProfile.name,
              email: parsedUser.email || userProfile.email,
              role: parsedUser.role || userProfile.role,
            };
            setUserProfile(updatedProfile);
            setTempProfile(updatedProfile);
          } catch (e) {
            console.error("Error parsing user from localStorage", e);
          }
        }
      }
    };

    fetchProfile();
  }, []);

  
  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    const token = localStorage.getItem("petconnect_token") || localStorage.getItem("token");

    try {
      const response = await axios.put("http://127.0.0.1:8000/api/user/profile", tempProfile, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setUserProfile(response.data.profile || tempProfile);
      localStorage.setItem("petconnect_user_profile", JSON.stringify(tempProfile));
      setIsEditing(false);
      setSuccessMessage("Profile updated successfully on server!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("API update error, saving locally:", error);
      setUserProfile(tempProfile);
      localStorage.setItem("petconnect_user_profile", JSON.stringify(tempProfile));
      setIsEditing(false);
      setSuccessMessage("Profile updated locally (Server offline/error)!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } finally {
      setLoading(false);
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

        .profile-container {
          width: 100vw;
          height: 100vh;
          background: linear-gradient(135deg, #e6f2ff, #f9f4ef, #e3f6ee, #f0e6ff, #e8f4f8);
          background-size: 500% 500%;
          animation: globalMeshFlow 18s ease infinite;
          position: relative;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          color: #102c45;
        }

        @keyframes globalMeshFlow {
          0% { background-position: 0% 50%; }
          25% { background-position: 50% 100%; }
          50% { background-position: 100% 50%; }
          75% { background-position: 50% 0%; }
          100% { background-position: 0% 50%; }
        }

        .profile-container::before {
          content: '';
          position: fixed;
          top: -120px;
          left: -120px;
          width: 500px;
          height: 500px;
          background: rgba(56, 161, 105, 0.12);
          border-radius: 50%;
          filter: blur(85px);
          z-index: 0;
          animation: floatOrb1 12s ease-in-out infinite alternate;
        }

        .profile-container::after {
          content: '';
          position: fixed;
          bottom: -150px;
          right: -120px;
          width: 550px;
          height: 550px;
          background: rgba(40, 105, 147, 0.15);
          border-radius: 50%;
          filter: blur(95px);
          z-index: 0;
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

        .profile-container.dark {
          background: linear-gradient(135deg, #050d14, #0b1721, #101f2b, #07121a, #09151e);
          color: white;
        }

        .dashboard-navbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 15px 30px;
          background: rgba(255, 255, 255, 0.75);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.3);
          z-index: 10;
        }

        .dark .dashboard-navbar {
          background: rgba(11, 23, 33, 0.75);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .dashboard-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
        }

        .dashboard-logo-icon {
          width: 40px;
          height: 40px;
          background: #286993;
          color: white;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .dashboard-logo-text {
          font-weight: bold;
          font-size: 13px;
          line-height: 1.1;
          letter-spacing: 0.5px;
        }

        .icon-button {
          background: rgba(0, 0, 0, 0.05);
          border: none;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          color: inherit;
        }

        .dark .icon-button {
          background: rgba(255, 255, 255, 0.08);
        }

        .icon-button:hover {
          background: rgba(40, 105, 147, 0.2);
        }

        .profile-content-wrapper {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 30px 20px;
          z-index: 2;
        }

        .profile-top-bar {
          width: 100%;
          max-width: 800px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .back-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.6);
          border: 1px solid rgba(0, 0, 0, 0.08);
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          color: inherit;
          transition: all 0.2s;
        }

        .dark .back-btn {
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .back-btn:hover {
          background: rgba(40, 105, 147, 0.15);
        }

        .success-banner {
          width: 100%;
          max-width: 800px;
          background: rgba(56, 161, 105, 0.15);
          border: 1px solid #38a169;
          color: #2f855a;
          padding: 12px 20px;
          border-radius: 10px;
          margin-bottom: 20px;
          font-weight: 600;
          text-align: center;
        }

        .dark .success-banner {
          color: #68d391;
        }

        .profile-card {
          width: 100%;
          max-width: 800px;
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.5);
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
          overflow: hidden;
          padding: 30px;
        }

        .dark .profile-card {
          background: rgba(17, 31, 43, 0.75);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }

        .profile-banner-area {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 25px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
          padding-bottom: 25px;
        }

        .dark .profile-banner-area {
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .profile-avatar-wrapper {
          width: 90px;
          height: 90px;
          border-radius: 50%;
          background: #286993;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(40, 105, 147, 0.3);
          flex-shrink: 0;
        }

        .profile-avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .profile-info-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          width: 100%;
        }

        .profile-name {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 5px;
        }

        .profile-role-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: rgba(40, 105, 147, 0.12);
          color: #286993;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
        }

        .dark .profile-role-badge {
          background: rgba(56, 161, 105, 0.2);
          color: #68d391;
        }

        .edit-profile-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #286993;
          color: white;
          border: none;
          padding: 10px 18px;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .edit-profile-btn:hover {
          background: #1f5273;
        }

        .profile-bio {
          font-size: 15px;
          line-height: 1.6;
          opacity: 0.85;
          margin-bottom: 25px;
        }

        .profile-info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
        }

        .info-item {
          display: flex;
          align-items: center;
          gap: 15px;
          background: rgba(255, 255, 255, 0.5);
          padding: 15px;
          border-radius: 12px;
          border: 1px solid rgba(0, 0, 0, 0.04);
        }

        .dark .info-item {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .info-icon {
          color: #286993;
          flex-shrink: 0;
        }

        .dark .info-icon {
          color: #68d391;
        }

        .info-label {
          font-size: 12px;
          opacity: 0.7;
          display: block;
          margin-bottom: 2px;
        }

        .info-value {
          font-size: 15px;
          font-weight: 600;
        }

        .profile-edit-form h3 {
          margin-bottom: 20px;
          font-size: 20px;
        }

        .form-group {
          margin-bottom: 15px;
        }

        .form-group label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 6px;
          opacity: 0.9;
        }

        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 12px 15px;
          background: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(0, 0, 0, 0.1);
          border-radius: 10px;
          font-size: 14px;
          color: inherit;
          outline: none;
          transition: border-color 0.2s;
        }

        .dark .form-group input,
        .dark .form-group textarea {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .form-group input:focus,
        .form-group textarea:focus {
          border-color: #286993;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 25px;
        }

        .cancel-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(0, 0, 0, 0.06);
          border: none;
          padding: 10px 18px;
          border-radius: 10px;
          font-weight: 600;
          color: inherit;
          cursor: pointer;
        }

        .dark .cancel-btn {
          background: rgba(255, 255, 255, 0.08);
        }

        .save-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #38a169;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .save-btn:hover {
          background: #2f855a;
        }
      `}</style>

      <div className={`profile-container ${darkMode ? "dark" : ""}`}>
        
        <nav className="dashboard-navbar">
          <div className="dashboard-logo" onClick={() => navigate("/dashboard/shelter")}>
            <div className="dashboard-logo-icon">
              <Dog size={24} />
            </div>
            <div className="dashboard-logo-text">
              PET
              <br />
              CONNECT
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button
              className="icon-button"
              onClick={toggleDarkMode}
              title="Toggle Theme"
              type="button"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </nav>

        <div className="profile-content-wrapper">
          
          <div className="profile-top-bar">
            <button 
              onClick={() => navigate(-1)}
              className="back-btn"
              type="button"
            >
              <ArrowLeft size={18} /> Back
            </button>
            <h2 style={{ fontSize: '20px', fontWeight: '700' }}>My Profile</h2>
          </div>

          {successMessage && (
            <div className="success-banner">
              {successMessage}
            </div>
          )}

          <div className="profile-card">
            
            {!isEditing ? (
              <div>
                <div className="profile-banner-area">
                  <div className="profile-avatar-wrapper">
                    {userProfile.avatar ? (
                      <img src={userProfile.avatar} alt="Profile" className="profile-avatar-img" />
                    ) : (
                      <User size={45} />
                    )}
                  </div>

                  <div className="profile-info-header">
                    <div>
                      <h3 className="profile-name">{userProfile.name}</h3>
                      <span className="profile-role-badge">
                        <ShieldCheck size={14} /> {userProfile.role}
                      </span>
                    </div>
                    <button 
                      onClick={() => { setTempProfile(userProfile); setIsEditing(true); }}
                      className="edit-profile-btn"
                      type="button"
                    >
                      <Edit3 size={16} /> Edit Profile
                    </button>
                  </div>
                </div>

                <p className="profile-bio">{userProfile.bio}</p>

                <div className="profile-info-grid">
                  <div className="info-item">
                    <Mail size={20} className="info-icon" />
                    <div>
                      <span className="info-label">Email Address</span>
                      <p className="info-value">{userProfile.email}</p>
                    </div>
                  </div>

                  <div className="info-item">
                    <Phone size={20} className="info-icon" />
                    <div>
                      <span className="info-label">Phone Number</span>
                      <p className="info-value">{userProfile.phone}</p>
                    </div>
                  </div>

                  <div className="info-item">
                    <MapPin size={20} className="info-icon" />
                    <div>
                      <span className="info-label">Location</span>
                      <p className="info-value">{userProfile.address}</p>
                    </div>
                  </div>

                  <div className="info-item">
                    <Heart size={20} className="info-icon" />
                    <div>
                      <span className="info-label">Account Activity</span>
                      <p className="info-value">Active Member</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              
              <form onSubmit={handleSave} className="profile-edit-form">
                <h3>Edit Profile Information</h3>
                
                <div className="form-group">
                  <label>Full Name</label>
                  <input 
                    type="text" 
                    value={tempProfile.name || ""} 
                    onChange={(e) => setTempProfile({ ...tempProfile, name: e.target.value })}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <input 
                    type="email" 
                    value={tempProfile.email || ""} 
                    onChange={(e) => setTempProfile({ ...tempProfile, email: e.target.value })}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  <input 
                    type="text" 
                    value={tempProfile.phone || ""} 
                    onChange={(e) => setTempProfile({ ...tempProfile, phone: e.target.value })} 
                  />
                </div>

                <div className="form-group">
                  <label>Location / Address</label>
                  <input 
                    type="text" 
                    value={tempProfile.address || ""} 
                    onChange={(e) => setTempProfile({ ...tempProfile, address: e.target.value })} 
                  />
                </div>

                <div className="form-group">
                  <label>Profile Picture URL (Optional)</label>
                  <input 
                    type="url" 
                    placeholder="https://example.com/avatar.jpg"
                    value={tempProfile.avatar || ""} 
                    onChange={(e) => setTempProfile({ ...tempProfile, avatar: e.target.value })} 
                  />
                </div>

                <div className="form-group">
                  <label>Bio</label>
                  <textarea 
                    rows="3"
                    value={tempProfile.bio || ""} 
                    onChange={(e) => setTempProfile({ ...tempProfile, bio: e.target.value })} 
                  />
                </div>

                <div className="modal-actions">
                  <button 
                    type="button" 
                    onClick={() => setIsEditing(false)}
                    className="cancel-btn"
                  >
                    <X size={16} /> Cancel
                  </button>
                  <button 
                    type="submit"
                    className="save-btn"
                    disabled={loading}
                  >
                    <Save size={16} /> {loading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      </div>
    </>
  );
}