import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

import { fetchMe } from '../api/auth';
import { getToken } from '../api/client';

/*
|------------------------------------------------------------------------------
| ROUTE GUARD
|------------------------------------------------------------------------------
|
| Wraps a page so that only a logged-in user (optionally of a specific role)
| can see it. Without this, typing /dashboard/admin in the address bar would
| show the admin screen to anybody.
|
| IMPORTANT - WHAT THIS IS AND IS NOT:
|
| This guard is a CONVENIENCE, not a security control. Everything here runs in
| the user's own browser, where it can be edited or bypassed with dev tools.
|
| The REAL protection is on the server: the auth:sanctum and admin middleware
| in routes/api.php. Even if somebody forced this component to render the admin
| dashboard, every request it makes would still come back 401 or 403, and no
| shelter data would ever load.
|
| Rule to remember: the browser decides what to SHOW; the database and its
| middleware decide what you may actually READ or CHANGE.
*/
export default function RequireAuth({ children, role }) {
  /*
  | 'checking' | 'allowed' | 'unauthenticated' | 'wrong-role'
  |
  | The initial value is computed by a FUNCTION passed to useState. React runs
  | it only on the first render, so we can decide "no token at all" right here
  | instead of setting state from inside the effect - which would render once,
  | then immediately render again.
  */
  const [state, setState] = useState(() =>
    getToken() ? 'checking' : 'unauthenticated'
  );

  useEffect(() => {
    // Nothing to verify if there was never a token.
    if (!getToken()) return;

    let cancelled = false;

    // Verify the token against the DATABASE rather than trusting the copy of
    // the user cached in localStorage. The token may have been deleted by a
    // logout elsewhere, or the user's role may have been changed by an admin.
    fetchMe()
      .then((user) => {
        if (cancelled) return;

        if (role && user.role !== role) {
          setState('wrong-role');
        } else {
          setState('allowed');
        }
      })
      .catch(() => {
        // 401 also clears the stored session inside apiFetch().
        if (!cancelled) setState('unauthenticated');
      });

    // Cleanup guards against setting state after the component unmounts,
    // which happens if the user navigates away mid-request.
    return () => {
      cancelled = true;
    };
  }, [role]);

  if (state === 'checking') {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        fontFamily: 'Arial, Helvetica, sans-serif',
        color: '#64748b',
      }}>
        Checking your session...
      </div>
    );
  }

  if (state === 'unauthenticated') {
    // `replace` swaps the history entry instead of adding one, so the browser
    // Back button does not bounce the user into a redirect loop.
    return <Navigate to="/login" replace />;
  }

  if (state === 'wrong-role') {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        fontFamily: 'Arial, Helvetica, sans-serif',
        color: '#102c45',
        textAlign: 'center',
        padding: '20px',
      }}>
        <h2>Not allowed</h2>
        <p style={{ color: '#64748b', fontSize: '14px' }}>
          This page requires the <strong>{role}</strong> role.
        </p>
      </div>
    );
  }

  return children;
}
