// src/context/AuthContext.jsx
import { createContext, useState, useEffect, useCallback } from 'react';

// createContext() creates the context object.
// Components call useContext(AuthContext) to read from it.
export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // user: null when logged out, { id, email, role } when logged in
  const [user, setUser] = useState(null);

  // loading: true while we're checking localStorage on first render.
  // Without this, the app briefly shows the "not logged in" state
  // before reading the stored user — causing a flash of wrong content.
  const [loading, setLoading] = useState(true);

  // On mount: restore auth state from localStorage.
  // This handles page refreshes — the user stays logged in.
  useEffect(() => {
    try {
      const storedUser  = localStorage.getItem('user');
      const storedToken = localStorage.getItem('token');

      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      // If localStorage data is corrupted, clear it
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    } finally {
      // Always mark loading as done, whether we found a user or not
      setLoading(false);
    }
  }, []);

  // login: called after a successful /api/auth/login or /register response
  // userData = { id, email, role }
  // token    = the JWT string
  const login = useCallback((userData, token) => {
    // Persist to localStorage so auth survives page refresh
    localStorage.setItem('user',  JSON.stringify(userData));
    localStorage.setItem('token', token);
    setUser(userData);
  }, []);

  // logout: clears everything
  const logout = useCallback(() => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  }, []);

  // Convenience computed values — components use these directly
  const isAuthenticated = !!user;              // true/false
  const isAdmin         = user?.role === 'admin';
  const isStudent       = user?.role === 'student';

  // value is the object every consuming component receives
  const value = {
    user,
    loading,
    isAuthenticated,
    isAdmin,
    isStudent,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};