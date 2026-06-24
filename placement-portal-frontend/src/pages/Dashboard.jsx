// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import useAuth from '../hooks/useAuth';
import Navbar from '../components/common/Navbar';
import Spinner from '../components/common/Spinner';
import { formatDate, getStatusBadgeClass, capitalize } from '../utils/formatters';

const Dashboard = () => {
  const { user } = useAuth();

  const [profile, setProfile]           = useState(null);
  const [applications, setApplications] = useState([]);
  const [recentJobs, setRecentJobs]     = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch all three data sources in parallel
        const [profileRes, appsRes, jobsRes] = await Promise.all([
          api.get('/students/profile'),
          api.get('/applications/my'),
          api.get('/jobs?limit=4'),
        ]);

        setProfile(profileRes.data.data.profile);
        setApplications(appsRes.data.data.applications);
        setRecentJobs(jobsRes.data.data.jobs);
      } catch (err) {
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return <><Navbar /><Spinner fullPage /></>;

  // Compute application stats from local data — no extra API call needed
  const appStats = {
    total:       applications.length,
    pending:     applications.filter((a) => a.application_status === 'pending').length,
    shortlisted: applications.filter((a) => a.application_status === 'shortlisted').length,
    accepted:    applications.filter((a) => a.application_status === 'accepted').length,
  };

  // Profile completeness — encourages students to fill out their profile
  const profileFields = [
    profile?.full_name, profile?.university, profile?.degree,
    profile?.bio, profile?.resume_url, profile?.phone,
  ];
  const filledFields   = profileFields.filter(Boolean).length;
  const profilePct     = Math.round((filledFields / profileFields.length) * 100);

  return (
    <div className="page-wrapper">
  
      <div className="page-content">
        <div className="container">

          {/* Greeting */}
          <div className="mb-3">
            <h1>Welcome back{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}! 👋</h1>
            <p className="text-muted">Here's what's happening with your job search today.</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          {/* Profile completeness banner — only show if incomplete */}
          {profilePct < 100 && (
            <div className="card mb-3" style={{ borderLeft: '4px solid var(--warning)', background: '#FFFBEB' }}>
              <div className="flex" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontWeight: 600 }}>Your profile is {profilePct}% complete</p>
                  <p className="text-muted" style={{ fontSize: '0.875rem' }}>
                    A complete profile helps recruiters find you.
                  </p>
                </div>
                <Link to="/profile" className="btn btn-primary btn-sm">Complete profile</Link>
              </div>
              {/* Progress bar */}
              <div style={{ background: 'var(--border)', borderRadius: '9999px', height: '6px', marginTop: '0.75rem' }}>
                <div style={{
                  background: 'var(--warning)',
                  width: `${profilePct}%`,
                  height: '100%',
                  borderRadius: '9999px',
                  transition: 'width 0.3s ease',
                }} />
              </div>
            </div>
          )}

          {/* Application stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem',
          }}>
            {[
              { label: 'Total applied',  value: appStats.total,       color: 'var(--primary)' },
              { label: 'Pending',        value: appStats.pending,      color: 'var(--warning)' },
              { label: 'Shortlisted',    value: appStats.shortlisted,  color: '#7C3AED' },
              { label: 'Accepted',       value: appStats.accepted,     color: 'var(--secondary)' },
            ].map(({ label, value, color }) => (
              <div key={label} className="card text-center">
                <p style={{ fontSize: '2.5rem', fontWeight: 800, color }}>{value}</p>
                <p className="text-muted" style={{ fontSize: '0.825rem' }}>{label}</p>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

            {/* Recent applications */}
            <div className="card">
              <div className="flex mb-2" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>Recent applications</h3>
                <Link to="/applied-jobs" className="btn btn-secondary btn-sm">View all</Link>
              </div>

              {applications.length === 0 ? (
                <div className="text-center" style={{ padding: '1.5rem 0' }}>
                  <p className="text-muted mb-2">No applications yet.</p>
                  <Link to="/jobs" className="btn btn-primary btn-sm">Browse jobs</Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {applications.slice(0, 4).map((app) => (
                    <div key={app.application_id} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingBottom: '0.75rem',
                      borderBottom: '1px solid var(--border)',
                    }}>
                      <div>
                        <p style={{ fontWeight: 500, fontSize: '0.9rem' }}>{app.title}</p>
                        <p className="text-muted" style={{ fontSize: '0.8rem' }}>
                          {app.company} · {formatDate(app.applied_at)}
                        </p>
                      </div>
                      <span className={getStatusBadgeClass(app.application_status)}>
                        {capitalize(app.application_status)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent job listings */}
            <div className="card">
              <div className="flex mb-2" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>New opportunities</h3>
                <Link to="/jobs" className="btn btn-secondary btn-sm">Browse all</Link>
              </div>

              {recentJobs.length === 0 ? (
                <p className="text-muted">No open jobs right now.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {recentJobs.map((job) => (
                    <Link
                      key={job.id}
                      to={`/jobs/${job.id}`}
                      style={{
                        textDecoration: 'none',
                        color: 'inherit',
                        paddingBottom: '0.75rem',
                        borderBottom: '1px solid var(--border)',
                        display: 'block',
                      }}
                    >
                      <p style={{ fontWeight: 500, fontSize: '0.9rem' }}>{job.title}</p>
                      <p className="text-muted" style={{ fontSize: '0.8rem' }}>
                        {job.company} · {capitalize(job.type.replace('-', ' '))}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;