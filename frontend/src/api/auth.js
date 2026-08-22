/*
|------------------------------------------------------------------------------
| AUTH API  -  login, who-am-I, edit my own row, logout
|------------------------------------------------------------------------------
*/

import { apiFetch, setSession, clearSession } from './client';

/**
 * LOGIN  ->  POST /api/auth/login
 *
 * On the server this is:
 *   1. SELECT * FROM users WHERE email = ? LIMIT 1
 *   2. bcrypt-compare the submitted password against the stored hash
 *   3. INSERT INTO personal_access_tokens ...  and return the plain token
 */
export async function login(email, password) {
  const data = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  // Save the token immediately - every later request depends on it.
  setSession(data.token, data.user);

  return data.user;
}

/**
 * WHO AM I  ->  GET /api/auth/me
 *
 * Always prefer this over the cached copy in localStorage when the page loads.
 * The cache can be stale; the users table cannot.
 */
export async function fetchMe() {
  const data = await apiFetch('/auth/me');
  return data.user;
}

/**
 * UPDATE MY PROFILE  ->  PUT /api/auth/profile
 * Runs: UPDATE users SET ... WHERE id = <the token's owner>;
 *
 * Note the id is NOT sent from the browser. The server takes it from the
 * token, so nobody can edit somebody else's row by changing a number in the
 * request body.
 */
export async function updateProfile(profile) {
  const data = await apiFetch('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(profile),
  });

  return data.user;
}

/**
 * CHANGE PASSWORD  ->  PUT /api/auth/password
 *
 * On the server:
 *   1. bcrypt-compare `current_password` against the stored hash
 *   2. reject it if the new password equals the old one
 *   3. UPDATE users SET password = <new hash>, password_changed_at = NOW()
 *   4. DELETE every OTHER token row for this user, so any other device
 *      that was signed in is kicked out
 *
 * Our own token survives step 4, so the user stays logged in here.
 */
export async function changePassword({ currentPassword, newPassword, confirmPassword }) {
  return apiFetch('/auth/password', {
    method: 'PUT',
    body: JSON.stringify({
      current_password: currentPassword,
      password: newPassword,
      // Laravel's `confirmed` rule looks for this exact field name.
      password_confirmation: confirmPassword,
    }),
  });
}

/**
 * LOGOUT  ->  POST /api/auth/logout
 * Deletes the token row server-side, then clears the browser copy.
 */
export async function logout() {
  try {
    await apiFetch('/auth/logout', { method: 'POST' });
  } catch {
    // Even if the server call fails (offline, token already gone), we still
    // clear the local session - the user asked to be logged out.
  } finally {
    clearSession();
  }
}
