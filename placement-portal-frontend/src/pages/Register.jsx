// src/pages/Register.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import useAuth from '../hooks/useAuth';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '', // NOT sent to the backend — frontend-only check
  });
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
    }
  };

  // validateClientSide: catches obvious mistakes BEFORE hitting the API.
  // Why bother if the backend validates too?
  // Because an instant error ("passwords don't match") feels responsive,
  // while waiting 300ms for the server to say the same thing feels sluggish.
  // The backend validation is still the source of truth — this is just UX polish.
  const validateClientSide = () => {
    const newErrors = {};
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');

    if (!validateClientSide()) return; // Stop here if client validation fails

    setLoading(true);
    try {
      // We deliberately do NOT send confirmPassword to the backend —
      // it has no column for it and doesn't need it.
      const { email, password } = formData;
      const response = await api.post('/auth/register', { email, password });
      const { user, token } = response.data.data;

      login(user, token);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      if (error.response?.data?.errors) {
        const fieldErrors = {};
        error.response.data.errors.forEach((err) => {
          fieldErrors[err.field] = err.message;
        });
        setErrors(fieldErrors);
      } else if (error.response?.data?.message) {
        setGeneralError(error.response.data.message);
      } else {
        setGeneralError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper flex-center">
      <div className="card" style={{ maxWidth: '420px', width: '100%' }}>
        <h1 className="text-center mb-2">Create your account</h1>
        <p className="text-muted text-center mb-3">Join thousands of students finding opportunities</p>

        {generalError && <div className="alert alert-error">{generalError}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input
              id="email" name="email" type="email"
              className={`form-input ${errors.email ? 'error' : ''}`}
              value={formData.email} onChange={handleChange}
              placeholder="you@example.com" autoComplete="email"
            />
            {errors.email && <p className="form-error">{errors.email}</p>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password" name="password" type="password"
              className={`form-input ${errors.password ? 'error' : ''}`}
              value={formData.password} onChange={handleChange}
              placeholder="At least 8 characters" autoComplete="new-password"
            />
            {errors.password && <p className="form-error">{errors.password}</p>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">Confirm password</label>
            <input
              id="confirmPassword" name="confirmPassword" type="password"
              className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
              value={formData.confirmPassword} onChange={handleChange}
              placeholder="Re-enter your password" autoComplete="new-password"
            />
            {errors.confirmPassword && <p className="form-error">{errors.confirmPassword}</p>}
          </div>

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="text-center mt-3 text-muted">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;