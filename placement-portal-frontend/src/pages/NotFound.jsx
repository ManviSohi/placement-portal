// src/pages/NotFound.jsx
import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="page-content flex-center text-center">
    <div>
      <h1 style={{ fontSize: '5rem', fontWeight: 900, color: 'var(--primary)' }}>404</h1>
      <h2>Page not found</h2>
      <p className="text-muted mt-1 mb-3">The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn btn-primary">Go home</Link>
    </div>
  </div>
);

export default NotFound;