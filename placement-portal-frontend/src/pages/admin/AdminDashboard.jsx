// src/pages/admin/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import api from '../../api/axios';
import Spinner from '../../components/common/Spinner';

const StatCard = ({ label, value, badgeClass = 'badge-blue' }) => (
  <div className="card">
    <p className="text-muted" style={{ fontSize: '0.825rem' }}>{label}</p>
    <p style={{ fontSize: '2rem', fontWeight: 700 }}>{value}</p>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/stats');
        setStats(response.data.data.stats);
      } catch (err) {
        setError('Failed to load dashboard statistics.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <Spinner fullPage />;
  if (error) return (
    <div className="page-content"><div className="container">
      <div className="alert alert-error">{error}</div>
    </div></div>
  );

  return (
    <div className="page-content">
      <div className="container">
        <h1 className="mb-3">Admin Dashboard</h1>

        {/* Top-level stat grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}>
          <StatCard label="Total students" value={stats.students.total_students} />
          <StatCard label="Open jobs" value={stats.jobs.open_jobs} />
          <StatCard label="Total applications" value={stats.applications.total_applications} />
          <StatCard label="Applications this week" value={stats.applications.this_week} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {/* Application status breakdown */}
          <div className="card">
            <h3 className="mb-2">Applications by status</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                ['Pending', stats.applications.pending, 'badge-yellow'],
                ['Reviewed', stats.applications.reviewed, 'badge-blue'],
                ['Shortlisted', stats.applications.shortlisted, 'badge-purple'],
                ['Accepted', stats.applications.accepted, 'badge-green'],
                ['Rejected', stats.applications.rejected, 'badge-red'],
              ].map(([label, count, badge]) => (
                <div key={label} className="flex" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className={`badge ${badge}`}>{label}</span>
                  <span style={{ fontWeight: 600 }}>{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top jobs by application count */}
          <div className="card">
            <h3 className="mb-2">Top jobs by applications</h3>
            {stats.topJobs.length === 0 ? (
              <p className="text-muted">No applications yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {stats.topJobs.map((job) => (
                  <div key={job.id} className="flex" style={{ justifyContent: 'space-between' }}>
                    <div>
                      <p style={{ fontWeight: 500 }}>{job.title}</p>
                      <p className="text-muted" style={{ fontSize: '0.825rem' }}>{job.company}</p>
                    </div>
                    <span className="badge badge-gray">{job.application_count} applicants</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;