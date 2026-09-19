
/*
|------------------------------------------------------------------------------
| API CLIENT - one place that knows how to talk to Laravel
|------------------------------------------------------------------------------
*/

const API = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api").replace(
  /\/$/,
  ""
);

const TOKEN_KEY = "petconnect_token";
const USER_KEY = "petconnect_user";

/*
|--------------------------------------------------------------------------
| TOKEN / SESSION
|--------------------------------------------------------------------------
*/

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setSession(token, user = null) {
  if (!token) {
    console.error("No token received from login.");
    return;
  }

  localStorage.setItem(TOKEN_KEY, token);

  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

export function getCachedUser() {
  const raw = localStorage.getItem(USER_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);

  /*
  | Optional cleanup for older versions of the app.
  | This prevents an old token from being accidentally reused.
  */
  localStorage.removeItem("token");
  localStorage.removeItem("authToken");
  localStorage.removeItem("access_token");
}

/*
|--------------------------------------------------------------------------
| API FETCH
|--------------------------------------------------------------------------
*/

export async function apiFetch(path, options = {}) {
  const token = getToken();

  const headers = {
    Accept: "application/json",
    ...options.headers,
  };

  /*
  | Only send JSON Content-Type when there is a request body.
  */
  if (options.body) {
    headers["Content-Type"] = "application/json";
  }

  /*
  | Laravel Sanctum authentication.
  */
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;

  try {
    response = await fetch(`${API}${path}`, {
      ...options,
      headers,
    });
  } catch (networkError) {
    const error = new Error(
      `Cannot reach the server at ${API}. Make sure Laravel is running with "php artisan serve".`
    );

    error.status = 0;
    error.originalError = networkError;

    throw error;
  }

  let data;

  try {
    data = await response.json();
  } catch {
    data = {
      message: "The server returned an invalid JSON response.",
    };
  }

  /*
  |--------------------------------------------------------------------------
  | ERROR HANDLING
  |--------------------------------------------------------------------------
  */

  if (!response.ok) {
    /*
    | 401 = no valid authentication token.
    */
    if (response.status === 401) {
      clearSession();
    }

    /*
    | Laravel validation errors:
    |
    | {
    |   "message": "The given data was invalid.",
    |   "errors": {
    |      "email": ["The email field is required."]
    |   }
    | }
    */
    const flattenedErrors = data.errors
      ? Object.values(data.errors)
          .flat()
          .join("\n")
      : null;

    const error = new Error(
      flattenedErrors ||
        data.message ||
        `Request failed with status ${response.status}.`
    );

    error.status = response.status;
    error.errors = data.errors || null;
    error.data = data;

    throw error;
  }

  return data;
}

/*
|--------------------------------------------------------------------------
| LOGIN
|--------------------------------------------------------------------------
|
| Use this function from the login page instead of manually using fetch().
*/

export async function login(email, password) {
  /*
  | Remove old/broken sessions before creating a new one.
  */
  clearSession();

  try {
    const data = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
      }),
    });

    /*
    | Laravel should return something similar to:
    |
    | {
    |   token: "...",
    |   user: {...}
    | }
    |
    | Some versions may use access_token instead of token.
    */
    const token =
      data.token ||
      data.access_token ||
      data.accessToken;

    const user =
      data.user ||
      data.data ||
      null;

    if (!token) {
      const error = new Error(
        "Login succeeded, but Laravel did not return an authentication token."
      );

      error.status = 500;
      error.data = data;

      throw error;
    }

    setSession(token, user);

    return data;
  } catch (error) {
    /*
    | Do not silently hide Laravel's 422 validation message.
    */
    console.error("Login error:", error);
    throw error;
  }
}

/*
|--------------------------------------------------------------------------
| LOGOUT
|--------------------------------------------------------------------------
*/

export async function logout() {
  const token = getToken();

  try {
    /*
    | Only call Laravel logout if a token exists.
    */
    if (token) {
      await apiFetch("/auth/logout", {
        method: "POST",
      });
    }
  } catch (error) {
    /*
    | Even if Laravel logout fails, remove the local session.
    */
    console.warn("Logout request failed:", error);
  } finally {
    clearSession();
  }
}

/*
|--------------------------------------------------------------------------
| CURRENT USER
|--------------------------------------------------------------------------
*/

export async function getCurrentUser() {
  return apiFetch("/auth/me");
}

/*
|--------------------------------------------------------------------------
| API URL
|--------------------------------------------------------------------------
*/

export function getApiUrl() {
  return API;
}
