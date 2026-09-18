import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";

// Saves the API token + user into localStorage, so the app is logged in.
import { setSession } from "../../api/client";
import {
  Dog,
  Heart,
  Sun,
  Moon,
  ArrowLeft,
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  Eye,
  EyeOff
} from 'lucide-react';

export default function AdopterSignup({
  darkMode,
  toggleDarkMode
}) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const API = import.meta.env.VITE_API_URL;
  

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'fullName') {
      const filteredValue = value.replace(/[0-9]/g, '');
      setFormData({ ...formData, [name]: filteredValue });
      return;
    }

    setFormData({ ...formData, [name]: value });
  };

 const handleSubmit = async (e) => {
  e.preventDefault();

  const nameRegex = /^[A-Za-z\s]+$/;
  if (!nameRegex.test(formData.fullName)) {
    alert("Name cannot contain numbers or special characters.");
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

  setLoading(true); // Start loading

  try {
    const response = await fetch("http://127.0.0.1:8000/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        password: formData.password,
        password_confirmation: formData.confirmPassword,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Registration failed.");
      return;
    }

    alert("Adopter Account Created Successfully!");

    // AUTO-LOGIN: the register endpoint returns a token, so save it and the
    // app is already authenticated - no second password prompt.
    setSession(data.token, data.user);

    navigate("/dashboard/adopter");
  } catch (error) {
    console.error(error);
    alert("Cannot connect to the server.");
  } finally {
    setLoading(false); // Stop loading
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

        /* স্ক্রল ও ওভারফ্লো সমস্যা স্থায়ীভাবে সমাধানের জন্য ফিক্সড প্রপার্টি */
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
          background: rgba(221, 107, 32, 0.12);
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
          background: #dd6b20;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 4px 10px rgba(221, 107, 32, 0.3);
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
          color: #dd6b20;
        }

        .nav-right {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .theme-btn {
          background: rgba(221, 107, 32, 0.1);
          border: none;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #dd6b20;
          transition: background 0.2s;
        }

        .theme-btn:hover {
          background: rgba(221, 107, 32, 0.2);
        }

        .back-btn {
          background: none;
          border: 1px solid #dd6b20;
          color: #dd6b20;
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
          background: #dd6b20;
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
          padding: 25px 30px;
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.9);
          max-height: 82vh;
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
          margin-bottom: 20px;
        }

        .form-header h2 {
          font-size: 22px;
          font-weight: 700;
          color: #102c45;
          margin-bottom: 6px;
        }

        .form-header p {
          font-size: 13px;
          color: #666;
        }

        .input-group {
          margin-bottom: 14px;
        }

        .input-group label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: #333;
          margin-bottom: 4px;
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
  padding: 10px 40px 10px 40px;
  border: 1px solid #cbd5e1;
  border-radius: 9px;
  font-size: 13px;
  outline: none;
  background: #fff;
  color: #102c45;
  caret-color: #102c45;
  transition: all 0.2s;
}

.input-with-icon input::placeholder {
  color: #64748b;
}

        .input-with-icon input:focus {
          border-color: #dd6b20;
          box-shadow: 0 0 0 3px rgba(221, 107, 32, 0.15);
        }

        .submit-btn {
          width: 100%;
          background: #dd6b20;
          border: none;
          padding: 11px;
          border-radius: 25px;
          font-size: 14px;
          font-weight: 700;
          color: white;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(221, 107, 32, 0.3);
          transition: background 0.2s;
          margin-top: 8px;
        }

        .submit-btn:hover {
          background: #c05621;
        }

        .auth-footer-text {
          font-size: 13px;
          color: #333;
          margin-top: 15px;
          text-align: center;
        }

        .auth-footer-text span {
          color: #dd6b20;
          font-weight: 700;
          cursor: pointer;
          text-decoration: underline;
        }

        /* Dark Mode Styling */
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

        .container.dark .form-header p,
        .container.dark .auth-footer-text {
          color: #cbd5e1;
        }

        .container.dark .back-btn {
          border-color: #ff9f43;
          color: #ff9f43;
        }
        .container.dark .back-btn:hover {
          background: #ff9f43;
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
          border-color: #ff9f43;
          box-shadow: 0 0 0 3px rgba(255, 159, 67, 0.2);
        }

        @media (max-width: 768px) {
          .navbar {
            padding: 0 20px;
          }
          .signup-card {
            padding: 18px;
            max-height: 85vh;
          }
        }
      `}</style>

      <div className={`container ${darkMode ? 'dark' : ''}`}>
        
        <div className="paw-pattern-bg"></div>

        {/* Navbar */}
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
            Adopter Portal
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

        {/* Content Body / Form */}
        <div className="main-content">
          <div className="signup-card">
            <div className="form-header">
              <h2>Become an Adopter</h2>
              <p>Create an account to browse and adopt your new furry friend!</p>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Full Name */}
              <div className="input-group">
                <label>Full Name</label>
                <div className="input-with-icon">
                  <User className="input-icon" size={18} />
                  <input
                    type="text"
                    name="fullName"
                    placeholder="e.g. Ishrat Jahan Ifa"
                    value={formData.fullName}
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
                    placeholder="e.g. user@example.com"
                    value={formData.email}
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
                    name="phone"
                    placeholder="e.g. 017XXXXXXXX"
                    pattern="^(?:\+88|01)?\d{11}$"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Address */}
              <div className="input-group">
                <label>Address</label>
                <div className="input-with-icon">
                  <MapPin className="input-icon" size={18} />
                  <input
                    type="text"
                    name="address"
                    placeholder="e.g. House 12, Road 5, Block C, Dhaka"
                    value={formData.address}
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
                    placeholder="Re-enter your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                  <span className="eye-icon" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </span>
                </div>
              </div>

            <button type="submit" className="submit-btn" disabled={loading}>
  {loading ? "Creating Account..." : "REGISTER AS ADOPTER"}
</button>
            </form>

            <div className="auth-footer-text">
              Already have an account?{' '}
              <span onClick={() => setCurrentPage && setCurrentPage('login')}>
                Log In
              </span>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}