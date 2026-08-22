import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dog, Mail, Lock, Eye, EyeOff, ArrowLeft, LogIn } from 'lucide-react';

import { login } from '../../api/auth';

/*
|------------------------------------------------------------------------------
| LOGIN PAGE
|------------------------------------------------------------------------------
|
| The signup pages already linked to "/login", but the page did not exist yet.
| Without it nothing could identify WHICH user is using the app, so every
| screen had to fall back on hard-coded placeholder data.
|
| WHAT HAPPENS WHEN YOU PRESS "Log In":
|
|   1. POST /api/auth/login  with { email, password }
|   2. Laravel: SELECT * FROM users WHERE email = ? LIMIT 1
|   3. Laravel: bcrypt-compare the password against the stored HASH
|      (the real password is never stored anywhere, so it cannot be compared
|       directly - see AuthController for the full explanation)
|   4. Laravel: INSERT a row into personal_access_tokens, return the token
|   5. Browser: save the token, then redirect based on the user's ROLE column
|
| Step 5 is why one login page serves all three kinds of user: the `role`
| ENUM in the database decides where you land.
*/
export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);

      // ROLE-BASED REDIRECT.
      // We trust the role that came back from the DATABASE, not anything the
      // browser could have tampered with.
      if (user.role === 'platform_admin') {
        navigate('/dashboard/admin');
      } else if (user.role === 'shelter_staff') {
        navigate('/dashboard/shelter');
      } else {
        navigate('/dashboard/adopter');
      }
    } catch (err) {
      // The backend deliberately returns the SAME message for "no such email"
      // and "wrong password", so an attacker cannot use this form to discover
      // which email addresses are registered.
      setError(err.message);
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

        html, body, #root {
          width: 100%;
          height: 100%;
          overflow: hidden;
        }

        .login-container {
          width: 100vw;
          height: 100vh;
          background: linear-gradient(135deg, #e6f2ff, #f9f4ef, #e3f6ee, #f0e6ff, #e8f4f8);
          background-size: 500% 500%;
          animation: globalMeshFlow 18s ease infinite;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #102c45;
          padding: 20px;
        }

        @keyframes globalMeshFlow {
          0% { background-position: 0% 50%; }
          25% { background-position: 50% 100%; }
          50% { background-position: 100% 50%; }
          75% { background-position: 50% 0%; }
          100% { background-position: 0% 50%; }
        }

        .login-container::before {
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
        }

        .login-container::after {
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
        }

        .login-card {
          position: relative;
          z-index: 3;
          width: 100%;
          max-width: 420px;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border-radius: 18px;
          padding: 32px;
          box-shadow: 0 20px 55px rgba(16, 44, 69, 0.18);
        }

        .login-back {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: none;
          border: none;
          color: #64748b;
          font-size: 13px;
          cursor: pointer;
          margin-bottom: 16px;
        }

        .login-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 6px;
        }

        .login-brand-icon {
          width: 40px;
          height: 40px;
          border-radius: 11px;
          background: #286993;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .login-brand h1 {
          font-size: 21px;
          font-weight: 800;
          color: #102c45;
        }

        .login-sub {
          font-size: 13px;
          color: #64748b;
          margin-bottom: 22px;
        }

        .login-field {
          margin-bottom: 15px;
        }

        .login-field label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 6px;
          color: #102c45;
        }

        .login-input-wrap {
          display: flex;
          align-items: center;
          gap: 9px;
          border: 1px solid rgba(40, 105, 147, 0.25);
          border-radius: 10px;
          padding: 11px 13px;
          background: #fff;
        }

        .login-input-wrap:focus-within {
          border-color: #286993;
        }

        .login-input-wrap input {
          border: none;
          outline: none;
          flex: 1;
          font-size: 14px;
          color: #102c45;
          background: transparent;
        }

        .login-eye {
          background: none;
          border: none;
          cursor: pointer;
          color: #64748b;
          display: flex;
        }

        .login-error {
          background: rgba(239, 68, 68, 0.1);
          color: #b91c1c;
          border-radius: 9px;
          padding: 10px 12px;
          font-size: 13px;
          margin-bottom: 15px;
          white-space: pre-line;
        }

        .login-submit {
          width: 100%;
          background: #286993;
          color: #fff;
          border: none;
          border-radius: 10px;
          padding: 12px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 6px;
          box-shadow: 0 6px 18px rgba(40, 105, 147, 0.25);
        }

        .login-submit:hover:not(:disabled) {
          background: #1f587d;
        }

        .login-submit:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .login-footer {
          text-align: center;
          font-size: 13px;
          color: #64748b;
          margin-top: 18px;
        }

        .login-footer span {
          color: #286993;
          font-weight: 700;
          cursor: pointer;
        }
      `}</style>

      <div className="login-container">
        <div className="login-card">
          <button className="login-back" onClick={() => navigate('/')}>
            <ArrowLeft size={15} /> Back to home
          </button>

          <div className="login-brand">
            <div className="login-brand-icon">
              <Dog size={22} />
            </div>
            <h1>PetConnect</h1>
          </div>
          <p className="login-sub">Log in to your account</p>

          {/* Any error from the server is shown here rather than in an alert() */}
          {error && <div className="login-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="login-field">
              <label>Email Address</label>
              <div className="login-input-wrap">
                <Mail size={17} color="#64748b" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div className="login-field">
              <label>Password</label>
              <div className="login-input-wrap">
                <Lock size={17} color="#64748b" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  required
                />
                <button
                  type="button"
                  className="login-eye"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <button type="submit" className="login-submit" disabled={loading}>
              <LogIn size={17} />
              {loading ? 'Checking credentials...' : 'Log In'}
            </button>
          </form>

          <p className="login-footer">
            Do not have an account?{' '}
            <span onClick={() => navigate('/signup')}>Sign up</span>
          </p>
        </div>
      </div>
    </>
  );
}
