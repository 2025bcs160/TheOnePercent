import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getUser } from "./services/api";

const AuthContext = createContext(null);
const AUTH_STORAGE_KEY = "propFirmAuth";

function isTokenExpired(token) {
  // JWT tokens have expiration, but for simplicity, assume valid if present
  // In production, decode JWT to check exp
  return !token;
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState({ user: null, token: null });
  const [loading, setLoading] = useState(true);

  const login = async (token) => {
    const nextAuth = { user: null, token };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextAuth));
    setAuth(nextAuth);

    // Fetch user info
    try {
      const user = await getUser();
      setAuth(prev => ({ ...prev, user }));
    } catch (error) {
      console.error("Failed to fetch user:", error);
    }
  };

  const logout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setAuth({ user: null, token: null });
  };

  const setUser = (user) => {
    setAuth(prev => ({ ...prev, user }));
  };

  useEffect(() => {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);

    if (!stored) {
      setLoading(false);
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      if (isTokenExpired(parsed.token)) {
        logout();
      } else {
        setAuth(parsed);
        // Fetch user info if token is valid
        getUser().then(user => {
          setAuth(prev => ({ ...prev, user }));
        }).catch(error => {
          console.error("Failed to fetch user on load:", error);
        });
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
      isAuthenticated: Boolean(auth.token),
      loading,
      login,
      logout,
      setUser,
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
