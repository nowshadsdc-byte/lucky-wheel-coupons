import { store } from "./store";

/**
 * Placeholder admin auth. Swap this for a real call to your backend
 * (`POST /api/admin/login` returning a JWT) without changing callers.
 *
 * Default credentials (CHANGE THESE):
 *   email:    admin@sdc.local
 *   password: admin123
 */
export const ADMIN_EMAIL = "admin@sdc.local";
const ADMIN_PASSWORD = "admin123";

export function adminLogin(email: string, password: string) {
  if (email.trim().toLowerCase() !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    throw new Error("Invalid email or password.");
  }
  const session = { email: ADMIN_EMAIL, loggedInAt: new Date().toISOString() };
  store.setAdminSession(session);
  return session;
}

export function adminLogout() {
  store.setAdminSession(null);
}

export function getAdminSession() {
  return store.getAdminSession();
}

export function isAdminAuthenticated() {
  return !!store.getAdminSession();
}
