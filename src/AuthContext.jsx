import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);
const AUTH_STORAGE_KEY = "propFirmAuth";

function isTokenExpired(auth) {
  if (!auth?.expiresAt) return true;
  return new Date(auth.expiresAt).getTime() <= Date.now();
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState({ user: null, token: null, expiresAt: null });
  const [loading, setLoading] = useState(true);

  const login = (user) => {
    const token = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    const nextAuth = { user, token, expiresAt };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextAuth));
    setAuth(nextAuth);
  };

  const logout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setAuth({ user: null, token: null, expiresAt: null });
  };

  useEffect(() => {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);

    if (!stored) {
      setLoading(false);
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      if (isTokenExpired(parsed)) {
        logout();
      } else {
        setAuth(parsed);
      }
    } catch (error) {
      logout();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!auth.expiresAt || !auth.token) return;

    const remaining = new Date(auth.expiresAt).getTime() - Date.now();
    if (remaining <= 0) {
      logout();
      return;
    }

    const timeoutId = window.setTimeout(() => {
      logout();
    }, remaining);

    return () => window.clearTimeout(timeoutId);
  }, [auth.expiresAt, auth.token]);

  const value = useMemo(
    () => ({
      user: auth.user,
      token: auth.token,
      expiresAt: auth.expiresAt,
      isAuthenticated: Boolean(auth.user && auth.token && !isTokenExpired(auth)),
      loading,
      login,
      logout,
    }),
    [auth, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
