// src/components/common/AdminRoute.jsx
import { Navigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import Spinner from './Spinner';

// AdminRoute: wraps pages that require admin role.
// A logged-in student who tries to access /admin/dashboard
// gets redirected to /dashboard instead.
const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) return <Spinner />;

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  return children;
};

export default AdminRoute;