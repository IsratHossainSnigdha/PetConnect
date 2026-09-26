import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon, Bell, ChevronDown } from 'lucide-react';

import { fetchAdminNotifications } from '../../api/adminNotifications';

/*
|==============================================================================
| ADMIN TOPBAR   (issue #34)
|==============================================================================
|
| The bar across the top: a greeting, the theme toggle, the notification bell,
| and the signed-in admin's name.
|
| Mostly presentational - it receives the user object and draws it. The one
| exception is the bell, which fetches its own list from
| GET /api/admin/notifications, because nothing else on the page needs that
| data and passing it down from the dashboard would be noise.
|
| WHAT THE BELL SHOWS
|   Notifications the DATABASE generated, for every user, newest first. Most
|   are written by triggers - resolving a complaint fires
|   trg_notify_user_on_complaint_resolved, which inserts a row for the person
|   who filed it. No PHP inserts those.
|
| PROPS
|   title           heading text
|   currentUser     the row from /auth/me, or null while it is loading
|   darkMode        current theme
|   onToggleTheme   called when the sun/moon button is pressed
*/
export default function AdminTopbar({ title, currentUser, darkMode, onToggleTheme }) {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Used to tell "did the click land inside the dropdown?" further down.
  const bellRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const data = await fetchAdminNotifications();
        // The component can unmount while the request is in flight. Setting
        // state after that warns in the console, so the flag stops it.
        if (cancelled) return;
        setNotifications(data.notifications || []);
        setUnread(data.unread || 0);
      } catch {
        // A failed bell must not break the dashboard, so this stays quiet and
        // simply shows nothing.
        if (!cancelled) setNotifications([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    // Re-read every 30s so a complaint resolved in another tab shows up here
    // without a page refresh.
    const timer = setInterval(load, 30000);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  // Close the dropdown when the user clicks anywhere else on the page.
  useEffect(() => {
    if (!open) return;

    const onDocClick = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  // "26 Sep, 22:46" - short enough for a narrow dropdown.
  const shortTime = (value) => {
    if (!value) return '';
    const d = new Date(value.replace(' ', 'T'));
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleString(undefined, {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
    });
  };

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

        <div className="bell-wrap" ref={bellRef}>
          <button
            className="icon-badge-btn"
            onClick={() => setOpen((v) => !v)}
            title="Notifications"
          >
            <Bell size={18} />
            {/* The dot is the UNREAD count, so it disappears once everything
                has been read rather than being permanently on. */}
            {unread > 0 && <span className="badge-dot"></span>}
          </button>

          {open && (
            <div className="bell-panel">
              <div className="bell-head">
                <strong>Notifications</strong>
                <span className="bell-count">
                  {unread > 0 ? `${unread} unread` : 'All read'}
                </span>
              </div>

              <div className="bell-list">
                {loading && <div className="bell-empty">Loading...</div>}

                {!loading && notifications.length === 0 && (
                  <div className="bell-empty">Nothing yet.</div>
                )}

                {!loading && notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`bell-item ${n.is_read ? '' : 'unread'}`}
                  >
                    <div className="bell-item-top">
                      <span className="bell-title">{n.title}</span>
                      <span className="bell-time">{shortTime(n.created_at)}</span>
                    </div>
                    <div className="bell-msg">{n.message}</div>
                    <div className="bell-to">To: {n.user_name}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

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
