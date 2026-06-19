// src/components/common/Navbar.jsx
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={{
      background: 'var(--bg-primary)',
      borderBottom: '1px solid var(--border)',
      padding: '1rem 0',
    }}>
      <div className="container flex" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" style={{ fontWeight: 600, fontSize: '1.1rem', textDecoration: 'none', color: 'var(--text-primary)' }}>
          Placement Portal
        </Link>

        <div className="flex gap-2" style={{ alignItems: 'center' }}>
          {/* Conditional rendering based on auth state — the core pattern */}
          {!isAuthenticated && (
            <>
              <Link to="/jobs" className="btn btn-secondary btn-sm">Browse jobs</Link>
              <Link to="/login" className="btn btn-secondary btn-sm">Log in</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign up</Link>
            </>
          )}

          {isAuthenticated && !isAdmin && (
            <>
              <Link to="/jobs" className="btn btn-secondary btn-sm">Jobs</Link>
              <Link to="/applied-jobs" className="btn btn-secondary btn-sm">My applications</Link>
              <Link to="/profile" className="btn btn-secondary btn-sm">Profile</Link>
              <span className="text-muted" style={{ fontSize: '0.875rem' }}>{user.email}</span>
              <button onClick={handleLogout} className="btn btn-danger btn-sm">Log out</button>
            </>
          )}

          {isAuthenticated && isAdmin && (
            <>
              <Link to="/admin/dashboard" className="btn btn-secondary btn-sm">Dashboard</Link>
              <Link to="/admin/jobs" className="btn btn-secondary btn-sm">Manage jobs</Link>
              <span className="badge badge-purple">Admin</span>
              <button onClick={handleLogout} className="btn btn-danger btn-sm">Log out</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;