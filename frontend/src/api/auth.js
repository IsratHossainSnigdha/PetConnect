import {
  apiFetch,
  setSession,
  clearSession,
  getToken,
  getCachedUser,
} from "./client";

// ========================================
// LOGIN
// ========================================
export async function login(email, password) {
  const data = await apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: email.trim(),
      password,
    }),
  });

  if (!data.token) {
    throw new Error("Login succeeded but no authentication token was returned.");
  }

  if (!data.user) {
    throw new Error("Login succeeded but no user information was returned.");
  }

  setSession(data.token, data.user);

  return data.user;
}


// ========================================
// FETCH CURRENT USER
// ========================================
export async function fetchMe() {
  const data = await apiFetch("/auth/me");

  const user = data.user || data;

  if (user) {
    localStorage.setItem("petconnect_user", JSON.stringify(user));
  }

  return user;
}

// Compatibility with components using getCurrentUser
export const getCurrentUser = fetchMe;


// ========================================
// UPDATE PROFILE
// ========================================
export async function updateProfile(profileData) {
  const data = await apiFetch("/auth/profile", {
    method: "PUT",
    body: JSON.stringify(profileData),
  });

  // Update cached user if backend returns the updated user
  const user = data.user || data.data || null;

  if (user) {
    localStorage.setItem("petconnect_user", JSON.stringify(user));
  }

  return data;
}


// ========================================
// CHANGE PASSWORD
// ========================================
export async function changePassword(currentPassword, newPassword) {
  const data = await apiFetch("/auth/password", {
    method: "PUT",
    body: JSON.stringify({
      current_password: currentPassword,
      password: newPassword,
      password_confirmation: newPassword,
    }),
  });

  return data;
}


// ========================================
// LOGOUT
// ========================================
export async function logout() {
  const token = getToken();

  try {
    if (token) {
      await apiFetch("/auth/logout", {
        method: "POST",
      });
    }
  } catch (error) {
    console.warn("Logout request failed:", error);
  } finally {
    clearSession();
  }
}


// ========================================
// HELPER EXPORTS
// ========================================
export {
  getToken,
  clearSession,
  getCachedUser,
};