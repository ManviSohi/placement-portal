// src/hooks/useAuth.js
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

// Custom hook: instead of writing useContext(AuthContext) in every component,
// components just write: const { user, login, logout } = useAuth();
// Also throws a helpful error if used outside the AuthProvider.
const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

export default useAuth;