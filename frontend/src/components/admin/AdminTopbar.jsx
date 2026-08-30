import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon, Bell, ChevronDown } from 'lucide-react';

/*
|==============================================================================
| ADMIN TOPBAR   (issue #34)
|==============================================================================
|
| The bar across the top: a greeting, the theme toggle, and the signed-in
| admin's name.
|
| Presentational only - it receives the user object and draws it. The page
| above is the one that fetched that user from GET /auth/me.
|
| PROPS
|   title           heading text
|   currentUser     the row from /auth/me, or null while it is loading
|   darkMode        current theme
|   onToggleTheme   called when the sun/moon button is pressed
*/
export default function AdminTopbar({ title, currentUser, darkMode, onToggleTheme }) {
  const navigate = useNavigate();

  return (
    <header className="dash-navbar">
      <div className="dash-welcome">
        <h1>{title}</h1>
        {/*
          ?. is optional chaining. currentUser is null until the request comes
          back, and reading .name off null would crash the page.
        */}
        <p>Welcome back, {currentUser?.name || '...'}</p>
      </div>

      <div className="dash-nav-right">
        <button className="icon-badge-btn" onClick={onToggleTheme} title="Toggle Theme">
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button className="icon-badge-btn">
          <Bell size={18} />
          <span className="badge-dot"></span>
        </button>

        <div className="admin-profile-pill" onClick={() => navigate('/profile/admin')}>
          {/* There is no avatar column in the users table yet, so this image
              stays a placeholder - but the alt text uses the real name. */}
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
            alt={currentUser?.name || 'Admin'}
            className="admin-avatar"
          />
          <div className="admin-info">
            <div className="admin-name">{currentUser?.name || 'Loading...'}</div>
            <div className="admin-role">
              {currentUser?.role === 'platform_admin' ? 'Global Admin' : currentUser?.role}
            </div>
          </div>
          <ChevronDown size={14} color="#64748b" />
        </div>
      </div>
    </header>
  );
}
