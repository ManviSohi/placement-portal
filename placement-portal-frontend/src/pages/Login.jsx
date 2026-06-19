// src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import api from '../api/axios';
import useAuth from '../hooks/useAuth';

const Login = () => {
  // formData holds both fields in ONE state object.
  // Why one object instead of two separate useState calls?
  // Because as forms grow (Profile page has 8 fields), managing
  // 8 separate useState hooks becomes unwieldy. One object scales better.
  const [formData, setFormData] = useState({ email: '', password: '' });

  // errors holds field-specific validation messages from the backend
  const [errors, setErrors] = useState({});

  // generalError holds non-field errors (e.g. "Invalid email or password")
  const [generalError, setGeneralError] = useState('');

  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // If the user was redirected here by ProtectedRoute, location.state.from
  // tells us where to send them back after a successful login.
  const from = location.state?.from?.pathname || '/dashboard';

  // handleChange: one function handles ALL input fields.
  // e.target.name matches the key in formData (set via the `name` attribute below)
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    // Clear the field-specific error as soon as the user starts typing again
    if (errors[e.target.name]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Stop the browser's default full-page form submission
    setGeneralError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', formData);
      const { user, token } = response.data.data;

      // Update global auth state — this also writes to localStorage
      login(user, token);

      // Redirect: back to where they came from, or dashboard by default.
      // Admins always go to the admin dashboard regardless of `from`.
      if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (error) {
      // error.response is the actual server response (4xx/5xx)
      // error.response is undefined if the network itself failed
      if (error.response?.data?.errors) {
        // Validation errors come as an array — convert to a lookup object
        // [{field: 'email', message: '...'}] → { email: '...' }
        const fieldErrors = {};
        error.response.data.errors.forEach((err) => {
          fieldErrors[err.field] = err.message;
        });
        setErrors(fieldErrors);
      } else if (error.response?.data?.message) {
        // Single message error, e.g. "Invalid email or password"
        setGeneralError(error.response.data.message);
      } else {
        // Network failure, server down, etc.
        setGeneralError('Something went wrong. Please try again.');
      }
    } finally {
      // Always re-enable the form, whether success or failure
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper flex-center">
      <div className="card" style={{ maxWidth: '420px', width: '100%' }}>
        <h1 className="text-center mb-2">Welcome back</h1>
        <p className="text-muted text-center mb-3">Log in to your placement portal account</p>

        {generalError && <div className="alert alert-error">{generalError}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input
              id="email"
              name="email"            // must match the formData key
              type="email"
              className={`form-input ${errors.email ? 'error' : ''}`}
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              autoComplete="email"
            />
            {errors.email && <p className="form-error">{errors.email}</p>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              className={`form-input ${errors.password ? 'error' : ''}`}
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              autoComplete="current-password"
            />
            {errors.password && <p className="form-error">{errors.password}</p>}
          </div>

          {/* disabled={loading} prevents double-submission on slow networks */}
          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        <p className="text-center mt-3 text-muted">
          Don't have an account? <Link to="/register">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;