// src/pages/AppliedJobs.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Spinner from '../components/common/Spinner';
import { formatDate, formatSalary, getStatusBadgeClass, capitalize } from '../utils/formatters';

const AppliedJobs = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Tracks which application is currently being withdrawn,
  // so we can disable JUST that button (not all of them) during the request
  const [withdrawingId, setWithdrawingId] = useState(null);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await api.get('/applications/my');
        setApplications(response.data.data.applications);
      } catch (err) {
        setError('Failed to load your applications.');
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  const handleWithdraw = async (applicationId) => {
    // window.confirm gives a native browser confirmation dialog —
    // simple and effective for a destructive action like this
    if (!window.confirm('Are you sure you want to withdraw this application?')) return;

    setWithdrawingId(applicationId);
    try {
      await api.delete(`/applications/${applicationId}`);
      // Remove from local list — no need to re-fetch everything
      setApplications((prev) => prev.filter((app) => app.application_id !== applicationId));
    } catch (err) {
      setError('Failed to withdraw application.');
    } finally {
      setWithdrawingId(null);
    }
  };

  if (loading) return <Spinner fullPage />;

  return (
    <div className="page-content">
      <div className="container">
        <h1 className="mb-3">My applications</h1>

        {error && <div className="alert alert-error">{error}</div>}

        {applications.length === 0 ? (
          <div className="card text-center">
            <p className="text-muted mb-2">You haven't applied to any jobs yet.</p>
            <Link to="/jobs" className="btn btn-primary">Browse jobs</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {applications.map((app) => (
              <div key={app.application_id} className="card">
                <div className="flex" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <Link to={`/jobs/${app.job_id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <h3>{app.title}</h3>
                    </Link>
                    <p className="text-muted">{app.company} · {app.location || 'Location not specified'}</p>
                  </div>
                  {/* getStatusBadgeClass maps "pending"/"accepted"/etc. to the right color */}
                  <span className={getStatusBadgeClass(app.application_status)}>
                    {capitalize(app.application_status)}
                  </span>
                </div>

                <p className="mt-1 text-muted" style={{ fontSize: '0.875rem' }}>
                  Applied on {formatDate(app.applied_at)}
                </p>
                <p className="text-muted" style={{ fontSize: '0.875rem' }}>
                  {formatSalary(app.salary_min, app.salary_max)}
                </p>

                {/* Only allow withdrawing while still pending —
                    once an admin has reviewed it, withdrawing would be confusing */}
                {app.application_status === 'pending' && (
                  <button
                    className="btn btn-danger btn-sm mt-2"
                    onClick={() => handleWithdraw(app.application_id)}
                    disabled={withdrawingId === app.application_id}
                  >
                    {withdrawingId === app.application_id ? 'Withdrawing...' : 'Withdraw application'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AppliedJobs;