import React, { useState, useEffect } from 'react';
import {
  Search,
  Sun,
  Moon,
  Dog,
  MapPin,
  Sparkles,
  HeartHandshake
} from 'lucide-react';

export default function LandingPage({
  darkMode,
  toggleDarkMode,
  setCurrentPage
}) {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dynamic state for rotating pet emojis in "Meet Our Pets"
  const petEmojiList = [
    ['🐶', '🐱', '🐕', '🐈', '🐩', '🐈‍⬛'],
    ['🦊', '🐹', '🐾', '🦮', '🦊' , '🐈'],
    ['🐕', '🐈', '🐱', '🐾', '🐶', '🐈‍⬛']
  ];
  const [emojiIndex, setEmojiIndex] = useState(0);

  // Dynamic state for active step in "How it Works"
  const [activeStep, setActiveStep] = useState(0);

  // Dynamic state for scanning city simulation in "Find Shelters"
  const shelterCities = ['Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi'];
  const [cityIndex, setCityIndex] = useState(0);

  useEffect(() => {
    // Rotate pet emojis every 3 seconds
    const emojiInterval = setInterval(() => {
      setEmojiIndex((prev) => (prev + 1) % petEmojiList.length);
    }, 3000);

    // Cycle active step for How it Works every 2 seconds
    const stepInterval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 3);
    }, 2000);

    // Cycle radar city text every 2.5 seconds
    const cityInterval = setInterval(() => {
      setCityIndex((prev) => (prev + 1) % shelterCities.length);
    }, 2500);

    return () => {
      clearInterval(emojiInterval);
      clearInterval(stepInterval);
      clearInterval(cityInterval);
    };
  }, []);

  // Search Handler
  const handleSearch = (e) => {
    e.preventDefault();

    if (searchQuery.trim() !== '') {
      alert(`Searching for: ${searchQuery}`);
    } else {
      alert('Please enter a type, breed, or location.');
    }
  };

  // Get Started Handler (Fixed to 'global-signup')
  const handleGetStarted = () => {
    if (setCurrentPage) {
      setCurrentPage('global-signup');
    } else {
      alert("Welcome to Pet Connect! Let's find your perfect pet.");
    }
  };

  // Login Handler (Fixed to 'global-signup')
  const handleLogin = () => {
    if (setCurrentPage) {
      setCurrentPage('global-signup');
    } else {
      alert('Sign Up / Login page will open here.');
    }
  };

  return (
    <>
      {/* =========================
          CSS
      ========================= */}

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

        /* =========================
            Main Container (Soft, Clean, Cute Paw Prints & Animated Background)
        ========================= */

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

        /* Floating Ambient Glow Orbs */
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

        /* Extra Soft, Spread-out, Right-Rotated & Clean Cute Paw Prints Pattern Overlay */
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


        /* =========================
            Navbar
        ========================= */

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


        /* Logo */

        .logo {
          display: flex;
          align-items: center;
          gap: 10px;
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
          font-size: 25px;
          font-weight: 700;
          line-height: 1;
          color: #102c45;
        }


        /* Navigation */

        .nav-links {
          display: flex;
          align-items: center;
          gap: 30px;
        }

        .nav-link {
          background: none;
          border: none;

          text-decoration: none;

          color: #333;

          font-size: 15px;

          font-weight: 600;

          cursor: pointer;
          transition: color 0.2s;
        }

        .nav-link:hover {
          color: #286993;
        }


        /* Theme Button */

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


        /* Login Button */

        .login-btn {
          background: #286993;

          color: white;

          border: none;
          border-radius: 25px;

          padding: 12px 24px;

          font-size: 14px;
          font-weight: 600;

          cursor: pointer;

          box-shadow: 0 4px 12px rgba(40, 105, 147, 0.25);
          transition: background 0.2s, transform 0.2s;
        }

        .login-btn:hover {
          background: #1f587d;
          transform: translateY(-1px);
        }


        /* =========================
            Hero Section
        ========================= */

        .hero {
          flex: 1;
          min-height: 320px;

          position: relative;

          overflow: hidden;

          background: linear-gradient(
            90deg,
            rgba(237, 249, 253, 0.8) 0%,
            rgba(237, 249, 253, 0.5) 45%,
            rgba(244, 238, 231, 0.6) 100%
          );
          backdrop-filter: blur(5px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.6);
          display: flex;
          align-items: center;
          z-index: 5;
        }

        .hero-content {
          position: relative;

          z-index: 6;

          padding: 40px 50px;

          width: 58%;
        }

        .hero h1 {
          font-size: 40px;

          line-height: 1.1;

          color: #102c45;

          margin-bottom: 15px;
        }

        .hero p {
          font-size: 17px;

          font-weight: 600;

          margin-bottom: 16px;

          color: #222;
        }


        /* Search Box - Centered with text match */

        .search-box {
          width: 100%;
          max-width: 460px;
          height: 48px;
          margin: 0 auto;

          background: white;

          border-radius: 25px;

          display: flex;
          align-items: center;

          padding-left: 18px;

          box-shadow:
            0 8px 20px rgba(0, 0, 0, 0.08);

          overflow: hidden;
          border: 1px solid rgba(40, 105, 147, 0.15);
        }

        .search-box input {
          flex: 1;

          border: none;

          outline: none;

          font-size: 14px;

          color: #333;

          background: transparent;
        }

        .search-box input::placeholder {
          color: #888;
        }

        .search-btn {
          width: 42px;
          height: 42px;

          border: none;

          border-radius: 50%;

          background: #286993;

          color: white;

          display: flex;
          align-items: center;
          justify-content: center;

          cursor: pointer;
          margin-right: 3px;
          transition: background 0.2s;
        }

        .search-btn:hover {
          background: #1f587d;
        }


        /* Hero Image */

        .hero-image {
          position: absolute;

          right: 0;
          top: 0;

          width: 48%;
          height: 100%;

          object-fit: cover;
          mask-image: linear-gradient(to right, transparent 0%, black 20%);
          -webkit-mask-image: linear-gradient(to right, transparent 0%, black 20%);
        }


        /* =========================
            Cards (Made Larger)
        ========================= */

        .cards {
          display: flex;

          justify-content: center;

          gap: 35px;

          position: relative;

          z-index: 5;

          margin: 35px 0;

          padding: 0 50px;
          flex-shrink: 0;
        }

        .card {
          width: 270px;
          height: 215px;

          border-radius: 18px;

          overflow: hidden;

          box-shadow:
            0 10px 30px rgba(0, 0, 0, 0.09);

          text-align: center;

          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);

          cursor: pointer;

          transition: all 0.3s ease;
          border: 1px solid rgba(255, 255, 255, 0.8);
        }

        .card:hover {
          transform: translateY(-6px);
          box-shadow: 0 14px 35px rgba(40, 105, 147, 0.18);
        }


        /* Card Title (Larger Text) */

        .card-title {
          height: 60px;

          display: flex;

          justify-content: center;

          align-items: center;

          font-size: 19px;

          font-weight: 700;

          color: #111;
        }


        /* Card Header Colors */

        .pets .card-title {
          background: #55a9d7;
          color: white;
        }

        .shelter .card-title {
          background: #4ab882;
          color: white;
        }

        .works .card-title {
          background: #f7b85c;
          color: white;
        }


        /* Card Body */

        .card-body {
          height: 155px;

          display: flex;

          justify-content: center;

          align-items: center;
        }


        /* Pets Card */

        .pets .card-body {
          background: #dceff9;
        }

        .pet-emojis {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px 14px;
          font-size: 30px;
          text-align: center;
          transition: opacity 0.4s ease-in-out;
        }


        /* Shelter Card */

        .shelter .card-body {
          background: radial-gradient(circle, #dbfbee 0%, #b2ebd2 100%);
          background-size: 200% 200%;
          animation: dynamicShelterBg 6s ease infinite;
          position: relative;
          overflow: hidden;
          flex-direction: column;
          gap: 8px;
        }

        @keyframes dynamicShelterBg {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .radar-container {
          position: relative;
          width: 68px;
          height: 68px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .radar-ripple {
          position: absolute;
          width: 100%;
          height: 100%;
          border: 1.5px solid rgba(74, 184, 130, 0.6);
          border-radius: 50%;
          animation: radarPulse 2s infinite ease-out;
        }

        .radar-ripple:nth-child(2) {
          animation-delay: 0.8s;
        }

        .radar-box {
          position: relative;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #ffffff;
          border-radius: 50%;
          box-shadow: 0 4px 12px rgba(74, 184, 130, 0.3);
          border: 1px solid rgba(74, 184, 130, 0.3);
          z-index: 2;
        }

        .radar-pin {
          color: #2e8b57;
          animation: bouncePin 1.5s infinite ease-in-out;
        }

        .radar-status {
          font-size: 13px;
          font-weight: 700;
          color: #2e8b57;
          background: rgba(255, 255, 255, 0.85);
          padding: 4px 12px;
          border-radius: 12px;
          letter-spacing: 0.3px;
          box-shadow: 0 2px 6px rgba(74, 184, 130, 0.2);
          transition: all 0.3s ease;
        }

        @keyframes radarPulse {
          0% {
            transform: scale(0.6);
            opacity: 1;
          }
          100% {
            transform: scale(1.6);
            opacity: 0;
          }
        }

        @keyframes bouncePin {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }


        /* Works Card */

        .works .card-body {
          background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 50%, #ffcc80 100%);
          background-size: 200% 200%;
          animation: dynamicWorksBg 5s ease infinite;
          position: relative;
        }

        @keyframes dynamicWorksBg {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .workflow-nodes {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .node-circle {
          width: 40px;
          height: 40px;
          background: #f7b85c;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 10px rgba(247, 184, 92, 0.4);
          transition: all 0.3s ease;
          opacity: 0.6;
          transform: scale(0.9);
        }

        .node-circle.active {
          opacity: 1;
          transform: scale(1.15);
          box-shadow: 0 6px 15px rgba(230, 156, 46, 0.7);
          background: #e69c2e;
        }

        .node-connector {
          width: 18px;
          height: 2px;
          background: #f7b85c;
          opacity: 0.5;
          transition: opacity 0.3s ease;
        }

        .node-connector.active {
          opacity: 1;
          background: #e69c2e;
        }


        /* =========================
            Get Started
        ========================= */

        .get-started {
          display: flex;

          justify-content: center;

          margin-bottom: 40px;
          flex-shrink: 0;
          z-index: 5;
        }

        .start-btn {
          border: none;

          background: #286993;

          color: white;

          font-size: 17px;

          font-weight: 700;

          padding: 14px 45px;

          border-radius: 30px;

          cursor: pointer;

          box-shadow:
            0 6px 20px rgba(40, 105, 147, 0.35);
          transition: all 0.3s ease;
        }

        .start-btn:hover {
          background: #1f587d;
          transform: scale(1.03);
        }


        /* =========================
            Dark Mode
        ========================= */

        .container.dark {
          background: linear-gradient(135deg, #050d14, #0b1721, #101f2b, #07121a, #09151e);
          background-size: 500% 500%;
          animation: globalMeshFlow 18s ease infinite;
          color: white;
        }

        .container.dark .paw-pattern-bg {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512' width='55' height='55' fill='rgba(255, 255, 255, 0.035)'%3E%3Cg transform='rotate(28 256 256)'%3E%3Cpath d='M256 210c-30.9 0-56 25.1-56 56s25.1 56 56 56 56-25.1 56-56-25.1-56-56-56zm-84-28c14.9 0 27-12.1 27-27s-12.1-27-27-27-27 12.1-27 27 12.1 27 27 27zm168 0c14.9 0 27-12.1 27-27s-12.1-27-27-27-27 12.1-27 27 12.1 27 27 27zM108 300c16.6 0 30-13.4 30-30s-13.4-30-30-30-30 13.4-30 30 13.4 30 30 30zm296 0c16.6 0 30-13.4 30-30s-13.4-30-30-30-30 13.4-30 30 13.4 30 30 30 z'/%3E%3C/g%3E%3C/svg%3E");
        }

        .container.dark::before {
          background: rgba(85, 169, 215, 0.08);
        }

        .container.dark::after {
          background: rgba(74, 184, 130, 0.07);
        }

        .container.dark .navbar {
          background: rgba(30, 48, 61, 0.85);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .container.dark .logo-text {
          color: white;
        }

        .container.dark .nav-link {
          color: #e2e8f0;
        }

        .container.dark .nav-link:hover {
          color: #55a9d7;
        }

        .container.dark .theme-btn {
          background: rgba(255, 255, 255, 0.1);
          color: #f7b85c;
        }

        .container.dark .hero {
          background: linear-gradient(
            90deg,
            rgba(27, 48, 61, 0.9) 0%,
            rgba(27, 48, 61, 0.6) 45%,
            rgba(38, 51, 58, 0.7) 100%
          );
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .container.dark .hero h1 {
          color: white;
        }

        .container.dark .hero p {
          color: #cbd5e1;
        }

        .container.dark .search-box {
          background: rgba(30, 48, 61, 0.9);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .container.dark .search-box input {
          color: white;
        }

        .container.dark .search-box input::placeholder {
          color: #94a3b8;
        }

        .container.dark .card {
          background: rgba(30, 48, 61, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }

        .container.dark .card:hover {
          box-shadow: 0 14px 35px rgba(0, 0, 0, 0.5);
        }

        .container.dark .pets .card-body {
          background: rgba(85, 169, 215, 0.15);
        }

        .container.dark .shelter .card-body {
          background: radial-gradient(circle, rgba(74, 184, 130, 0.25) 0%, rgba(30, 48, 61, 0.8) 100%);
        }

        .container.dark .radar-box {
          background: rgba(30, 48, 61, 0.9);
          border-color: rgba(74, 184, 130, 0.4);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
        }

        .container.dark .radar-pin {
          color: #4ab882;
        }

        .container.dark .radar-status {
          background: rgba(30, 48, 61, 0.9);
          color: #6ee7b7;
        }

        .container.dark .works .card-body {
          background: linear-gradient(135deg, rgba(247, 184, 92, 0.2) 0%, rgba(30, 48, 61, 0.8) 100%);
        }


        /* =========================
            Responsive
        ========================= */

        @media (max-width: 768px) {

          .navbar {
            padding: 0 20px;
          }

          .nav-links {
            gap: 10px;
          }

          .nav-link {
            display: none;
          }

          .hero {
            height: 390px;
          }

          .hero-content {
            width: 100%;

            padding: 30px 20px;
          }

          .hero h1 {
            font-size: 32px;
          }

          .hero-image {
            width: 100%;

            opacity: 0.25;
            mask-image: none;
            -webkit-mask-image: none;
          }

          .search-box {
            width: 90%;
          }

          .cards {
            flex-direction: column;

            align-items: center;

            margin: 20px 0;
            padding: 0 20px;
          }

          .card {
            width: 100%;
            max-width: 320px;
            height: 190px;
          }

          .get-started {
            margin-bottom: 30px;
          }
        }

      `}</style>


      {/* =========================
          Main Container
      ========================= */}

      <div className={`container ${darkMode ? 'dark' : ''}`}>

        {/* Background Full-Page Soft, Right-Rotated & Minimalist Cute Paw Pattern Overlay */}
        <div className="paw-pattern-bg"></div>


        {/* =========================
            Navbar
        ========================= */}

        <nav className="navbar">

          {/* Logo */}
          <div className="logo">

            <div className="logo-icon">
              <Dog size={24} />
            </div>

            <div className="logo-text">
              Pet
              <br />
              Connect
            </div>

          </div>


          {/* Navigation Links */}

          <div className="nav-links">

            <button
              className="nav-link"
              onClick={() => setCurrentPage('about')}
            >
              About
            </button>


            <button
              className="nav-link"
              onClick={() => setCurrentPage('shelters')}
            >
              Shelters
            </button>


            <button
              className="nav-link"
              onClick={() => setCurrentPage('donate')}
            >
              Donate
            </button>


            {/* Dark Mode */}

            <button
              className="theme-btn"
              onClick={toggleDarkMode}
              title="Toggle Theme"
            >
              {darkMode ? (
                <Sun size={18} />
              ) : (
                <Moon size={18} />
              )}
            </button>


            {/* Login / Sign Up */}

            <button
              className="login-btn"
              onClick={handleLogin}
            >
              Sign Up / Login
            </button>

          </div>

        </nav>


        {/* =========================
            Hero Section
        ========================= */}

        <section className="hero">


          {/* Hero Image (Human with pet) */}

          <img
            className="hero-image"
            src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=80"
            alt="Person with pet"
          />


          {/* Hero Content */}

          <div className="hero-content">

            <h1>
              Adopt a Friend,
              <br />
              Change a Life
            </h1>


            <p>
              Find your perfect match:
            </p>


            {/* Search Box - Centered */}

            <form
              className="search-box"
              onSubmit={handleSearch}
            >

              <input
                type="text"
                placeholder="Find your perfect match: type, breed, location"
                value={searchQuery}
                onChange={(e) =>
                  setSearchQuery(e.target.value)
                }
              />


              <button
                type="submit"
                className="search-btn"
              >
                <Search size={18} />
              </button>

            </form>

          </div>

        </section>


        {/* =========================
            Cards (Enlarged)
        ========================= */}

        <section className="cards">


          {/* Meet Our Pets */}

          <div
            className="card pets"
            onClick={() =>
              setCurrentPage('pets')
            }
          >

            <div className="card-title">
              Meet Our Pets
            </div>


            <div className="card-body">

              <div className="pet-emojis">
                {petEmojiList[emojiIndex].map((emoji, idx) => (
                  <span key={idx}>{emoji}</span>
                ))}
              </div>

            </div>

          </div>


          {/* Find Shelters */}

          <div
            className="card shelter"
            onClick={() =>
              setCurrentPage('shelters')
            }
          >

            <div className="card-title">
              Find Shelters
            </div>


            <div className="card-body">
              <div className="radar-container">
                <div className="radar-ripple"></div>
                <div className="radar-ripple"></div>
                <div className="radar-box">
                  <MapPin size={28} strokeWidth={2.2} className="radar-pin" />
                </div>
              </div>
              <div className="radar-status">
                Scanning: {shelterCities[cityIndex]}
              </div>
            </div>

          </div>


          {/* How It Works */}

          <div
            className="card works"
            onClick={() =>
              setCurrentPage('how-it-works')
            }
          >

            <div className="card-title">
              How it Works
            </div>


            <div className="card-body">
              <div className="workflow-nodes">
                <div className={`node-circle ${activeStep === 0 ? 'active' : ''}`}>
                  <Search size={18} strokeWidth={2.5} />
                </div>
                <div className={`node-connector ${activeStep >= 1 ? 'active' : ''}`}></div>
                <div className={`node-circle ${activeStep === 1 ? 'active' : ''}`}>
                  <Sparkles size={18} strokeWidth={2.5} />
                </div>
                <div className={`node-connector ${activeStep >= 2 ? 'active' : ''}`}></div>
                <div className={`node-circle ${activeStep === 2 ? 'active' : ''}`}>
                  <HeartHandshake size={18} strokeWidth={2.5} />
                </div>
              </div>
            </div>

          </div>

        </section>


        {/* =========================
            Get Started
        ========================= */}

        <div className="get-started">

          <button
            className="start-btn"
            onClick={handleGetStarted}
          >
            GET STARTED
          </button>

        </div>


      </div>

    </>
  );
}