import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";


import { 
  Dog, 
  Sun, 
  Moon, 
  ArrowLeft, 
  ShieldAlert, 
  User, 
  Phone, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Key 
} from 'lucide-react';



export default function AdminSignup({ darkMode, toggleDarkMode }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    number: '',
    email: '',
    password: '',
    confirmPassword: '',
    adminKey: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showAdminKey, setShowAdminKey] = useState(false);
  const [loading, setLoading] = useState(false);
const API = import.meta.env.VITE_API_URL;

  const handleChange = (e) => {
    const { name, value } = e.target;

   
    if (name === 'name') {
      const filteredValue = value.replace(/[0-9]/g, '');
      setFormData({ ...formData, [name]: filteredValue });
      return;
    }

    
    if (name === 'number') {
      const filteredValue = value.replace(/[^0-9+]/g, '');
      setFormData({ ...formData, [name]: filteredValue });
      return;
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  const nameRegex = /^[A-Za-z\s.'-]+$/;
  if (!nameRegex.test(formData.name)) {
    alert("Name cannot contain numbers.");
    return;
  }

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

  if (!passwordRegex.test(formData.password)) {
    alert("Password is too weak.");
    return;
  }

  if (formData.password !== formData.confirmPassword) {
    alert("Passwords do not match!");
    return;
  }

  setLoading(true);

  try {
    const response = await fetch(`${API}/auth/admin/register`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  body: JSON.stringify({
    name: formData.name.trim(),
    number: formData.number.trim(),
    email: formData.email.trim().toLowerCase(),
    password: formData.password,
    password_confirmation: formData.confirmPassword,
    adminKey: formData.adminKey,
  }),
});

let data;

try {
  data = await response.json();
} catch {
  data = { message: "Unexpected server response." };
}

if (!response.ok) {
  if (data.errors) {
    alert(Object.values(data.errors).flat().join("\n"));
  } else {
    alert(data.message);
  }
  return;
}

    alert("Platform Admin Registered Successfully!");

// Clear the form
setFormData({
  name: '',
  number: '',
  email: '',
  password: '',
  confirmPassword: '',
  adminKey: ''
});

// Go to the admin portal
navigate("/dashboard/admin");
  } catch (error) {
    alert("Cannot connect to the server.");
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

        .container {
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

        .container::before {
          content: '';
          position: absolute;
          top: -120px;
          left: -120px;
          width: 500px;
          height: 500px;
          background: rgba(40, 105, 147, 0.12);
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
          background: rgba(30, 88, 125, 0.15);
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
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512' width='55' height='55' fill='rgba(40, 105, 147, 0.05)'%3E%3Cg transform='rotate(28 256 256)'%3E%3Cpath d='M256 210c-30.9 0-56 25.1-56 56s25.1 56 56 56 56-25.1 56-56-25.1-56-56-56zm-84-28c14.9 0 27-12.1 27-27s-12.1-27-27-27-27 12.1-27 27 12.1 27 27 27zm168 0c14.9 0 27-12.1 27-27s-12.1-27-27-27-27 12.1-27 27 12.1 27 27 27zM108 300c16.6 0 30-13.4 30-30s-13.4-30-30-30-30 13.4-30 30 13.4 30 30 30zm296 0c16.6 0 30-13.4 30-30s-13.4-30-30-30-30 13.4-30 30 13.4 30 30 30z'/%3E%3C/g%3E%3C/svg%3E");
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
          padding: 20px;
          overflow-y: auto;
        }

        .signup-card {
          width: 100%;
          max-width: 500px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 22px 30px;
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.9);
          max-height: 84vh;
          overflow-y: auto;
        }

        .signup-card::-webkit-scrollbar {
          width: 5px;
        }
        .signup-card::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }

        .form-header {
          text-align: center;
          margin-bottom: 15px;
        }

        .form-header h2 {
          font-size: 22px;
          font-weight: 700;
          color: #102c45;
          margin-bottom: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .form-header p {
          font-size: 13px;
          color: #666;
        }

        .input-group {
          margin-bottom: 12px;
        }

        .input-group label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: #333;
          margin-bottom: 3px;
        }

        .input-with-icon {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 14px;
          color: #888;
        }

        .eye-icon {
          position: absolute;
          right: 14px;
          color: #888;
          cursor: pointer;
        }

        .input-with-icon input {
          width: 100%;
          padding: 9px 40px 9px 40px;
          border: 1px solid #cbd5e1;
          border-radius: 9px;
          font-size: 13px;
          outline: none;
          background: #fff;
          color: #102c45;
          transition: all 0.2s;
        }

        .input-with-icon input:focus {
          border-color: #286993;
          box-shadow: 0 0 0 3px rgba(40, 105, 147, 0.15);
        }

        .submit-btn {
          width: 100%;
          background: #286993;
          border: none;
          padding: 11px;
          border-radius: 25px;
          font-size: 14px;
          font-weight: 700;
          color: white;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(40, 105, 147, 0.3);
          transition: background 0.2s;
          margin-top: 5px;
        }

        .submit-btn:hover {
          background: #1f587d;
        }

        /* Dark Mode */
        .container.dark {
          background: linear-gradient(135deg, #050d14, #0b1721, #101f2b, #07121a, #09151e);
          color: white;
        }

        .container.dark .navbar {
          background: rgba(30, 48, 61, 0.85);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .container.dark .logo-text,
        .container.dark .navbar-title,
        .container.dark .form-header h2 {
          color: white;
        }

        .container.dark .form-header p {
          color: #cbd5e1;
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

        .container.dark .signup-card {
          background: rgba(30, 48, 61, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4);
        }

        .container.dark .signup-card::-webkit-scrollbar-thumb {
          background: #475569;
        }

        .container.dark .input-group label {
          color: #e2e8f0;
        }

        .container.dark .input-with-icon input {
          background: rgba(15, 23, 42, 0.6);
          border-color: rgba(255, 255, 255, 0.15);
          color: white;
        }

        .container.dark .input-with-icon input:focus {
          border-color: #55a9d7;
          box-shadow: 0 0 0 3px rgba(85, 169, 215, 0.2);
        }

        .submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
      `}</style>

      <div className={`container ${darkMode ? 'dark' : ''}`}>
        <div className="paw-pattern-bg"></div>

        <nav className="navbar">
         <div className="logo" onClick={() => navigate("/")}>
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
            Admin Portal
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
  onClick={() => navigate("/signup")}
>
              <ArrowLeft size={16} /> Back
            </button>
          </div>
        </nav>

        <div className="main-content">
          <div className="signup-card">
            <div className="form-header">
              <h2>
                <ShieldAlert size={26} color="#286993" /> Admin Signup
              </h2>
              <p>Register a new platform administrator account</p>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Full Name */}
              <div className="input-group">
                <label>Full Name</label>
                <div className="input-with-icon">
                  <User className="input-icon" size={18} />
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="input-group">
                <label>Phone Number</label>
                <div className="input-with-icon">
                  <Phone className="input-icon" size={18} />
                  <input
                    type="tel"
                    name="number"
                    placeholder="Enter your phone number"
                    value={formData.number}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="input-group">
                <label>Email Address</label>
                <div className="input-with-icon">
                  <Mail className="input-icon" size={18} />
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="input-group">
                <label>Password</label>
                <div className="input-with-icon">
                  <Lock className="input-icon" size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <span className="eye-icon" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </span>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="input-group">
                <label>Confirm Password</label>
                <div className="input-with-icon">
                  <Lock className="input-icon" size={18} />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Re-enter password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                  <span className="eye-icon" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </span>
                </div>
              </div>

              {/* Admin Secret Key */}
              <div className="input-group">
                <label>Admin Secret Key</label>
                <div className="input-with-icon">
                  <Key className="input-icon" size={18} />
                  <input
                    type={showAdminKey ? "text" : "password"}
                    name="adminKey"
                    placeholder="Enter security clearance key"
                    value={formData.adminKey}
                    onChange={handleChange}
                    required
                  />
                  <span className="eye-icon" onClick={() => setShowAdminKey(!showAdminKey)}>
                    {showAdminKey ? <EyeOff size={18} /> : <Eye size={18} />}
                  </span>
                </div>
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
  {loading ? "Creating Admin..." : "Register as Admin"}
</button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}