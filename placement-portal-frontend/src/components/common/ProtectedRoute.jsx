// src/components/common/ProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import Spinner from './Spinner';

// ProtectedRoute: wraps pages that require login.
// If the user is not authenticated, redirect to /login.
// We also pass the attempted URL via state so after login
// we can redirect back to where they were trying to go.
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // While checking localStorage, show a spinner instead of redirecting.
  // Without this, a logged-in user who refreshes sees a flash to /login.
  if (loading) return <Spinner />;

  if (!isAuthenticated) {
    // state={{ from: location }} remembers where the user was going
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;