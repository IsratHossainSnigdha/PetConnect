/*
|------------------------------------------------------------------------------
| API CLIENT  -  one place that knows how to talk to Laravel
|------------------------------------------------------------------------------
|
| HTTP is STATELESS: the server forgets you the instant it answers. So every
| single request has to prove who you are all over again. That proof is the
| API TOKEN issued by POST /api/auth/login.
|
| The full cycle:
|
|   1. login   -> Laravel INSERTs a row into `personal_access_tokens`
|                 and returns the plain token ONCE
|   2. browser -> saves it in localStorage
|   3. every later request sends   Authorization: Bearer <token>
|   4. Laravel -> hashes it, SELECTs the matching token row, loads the user
|   5. logout  -> DELETEs that row, so the token stops working
|
| Step 5 is the part people forget. Clearing localStorage alone would leave a
| perfectly valid token sitting in the database.
|
*/

const API = import.meta.env.VITE_API_URL;

// The localStorage key. Named once here so a typo cannot make the app "forget"
// a token it actually saved.
const TOKEN_KEY = 'petconnect_token';
const USER_KEY = 'petconnect_user';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  // localStorage only stores STRINGS, so objects must be JSON-encoded.
  // This cached copy just avoids a flash of empty UI on page load - the real
  // source of truth is always the users table, re-read via GET /auth/me.
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getCachedUser() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;   // corrupted value - treat it as "not logged in"
  }
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

/**
 * The single function every other API file goes through.
 *
 * It attaches the token, decodes the JSON, and turns any non-2xx response into
 * a thrown Error carrying the status code - so callers can simply use
 * try/catch instead of checking response.ok everywhere.
 */
export async function apiFetch(path, options = {}) {
  const token = getToken();

  const headers = {
    Accept: 'application/json',
    ...options.headers,
  };

  // Only set Content-Type when there is actually a body to describe.
  if (options.body) {
    headers['Content-Type'] = 'application/json';
  }

  // This header is what the auth:sanctum middleware reads.
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;

  try {
    response = await fetch(`${API}${path}`, { ...options, headers });
  } catch {
    // fetch() only rejects on NETWORK failure (server down, DNS, CORS).
    // A 404 or 500 is a successful round trip, so it does NOT land here.
    const error = new Error(
      `Cannot reach the server at ${API}. Is "php artisan serve" running?`
    );
    error.status = 0;
    throw error;
  }

  let data;

  try {
    data = await response.json();
  } catch {
    data = { message: 'The server sent a response that was not JSON.' };
  }

  if (!response.ok) {
    // 401 = the token is missing, expired, or was deleted by logout.
    // Wipe the dead session so the UI can send the user back to login.
    if (response.status === 401) {
      clearSession();
    }

    // Laravel's 422 body looks like:
    //   { message, errors: { email: ["..."], name: ["..."] } }
    // Flatten it into one readable string for simple alerts, while still
    // exposing the per-field object for forms that show inline messages.
    const flattened = data.errors
      ? Object.values(data.errors).flat().join('\n')
      : null;

    const error = new Error(flattened || data.message || 'Request failed.');
    error.status = response.status;
    error.errors = data.errors ?? null;
    throw error;
  }

  return data;
}
