// src/pages/JobDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import useAuth from '../hooks/useAuth';
import Spinner from '../components/common/Spinner';
import { formatSalary, formatDate, capitalize, isDeadlinePassed } from '../utils/formatters';

const JobDetail = () => {
  // useParams reads the :id from the URL — matches the route "/jobs/:id"
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isStudent } = useAuth();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [coverLetter, setCoverLetter] = useState('');
  const [applying, setApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  const [applyError, setApplyError] = useState('');

  // Fetch job details whenever the URL :id changes
  useEffect(() => {
    const fetchJob = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/jobs/${id}`);
        setJob(response.data.data.job);
      } catch (err) {
        setError(
          err.response?.status === 404
            ? 'This job posting could not be found.'
            : 'Failed to load job details.'
        );
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  const handleApply = async (e) => {
    e.preventDefault();

    // If not logged in, send them to login — but remember this page
    // so they land back here after authenticating.
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/jobs/${id}` } } });
      return;
    }

    setApplying(true);
    setApplyError('');
    try {
      await api.post('/applications', { jobId: id, coverLetter });
      setApplySuccess(true);
    } catch (err) {
      setApplyError(err.response?.data?.message || 'Failed to submit application.');
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <Spinner fullPage />;

  if (error) {
    return (
      <div className="page-content">
        <div className="container">
          <div className="alert alert-error">{error}</div>
        </div>
      </div>
    );
  }

  const deadlinePassed = isDeadlinePassed(job.deadline);
  const jobClosed = job.status !== 'open' || deadlinePassed;

  return (
    <div className="page-content">
      <div className="container" style={{ maxWidth: '800px' }}>
        <div className="card">
          <div className="flex" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1>{job.title}</h1>
              <p className="text-muted mt-1">{job.company} · {job.location || 'Location not specified'}</p>
            </div>
            <span className="badge badge-blue">{capitalize(job.type.replace('-', ' '))}</span>
          </div>

          <div className="flex gap-2 mt-2">
            <span className="badge badge-green">{formatSalary(job.salary_min, job.salary_max)}</span>
            {job.deadline && (
              <span className={`badge ${deadlinePassed ? 'badge-red' : 'badge-yellow'}`}>
                {deadlinePassed ? 'Deadline passed' : `Apply by ${formatDate(job.deadline)}`}
              </span>
            )}
          </div>

          <h3 className="mt-3 mb-1">Job description</h3>
          {/* whiteSpace: 'pre-wrap' preserves line breaks the admin typed in the textarea */}
          <p style={{ whiteSpace: 'pre-wrap' }}>{job.description}</p>
        </div>

        {/* Apply section — only meaningful for students */}
        <div className="card mt-3">
          {applySuccess ? (
            <div className="alert alert-success">
              Your application has been submitted successfully! You can track its status on the{' '}
              <a href="/applied-jobs">Applied Jobs</a> page.
            </div>
          ) : jobClosed ? (
            <div className="alert alert-error">
              This job is no longer accepting applications.
            </div>
          ) : isAuthenticated && !isStudent ? (
            // Admin viewing a job — applying doesn't make sense for them
            <p className="text-muted">Admins cannot apply to jobs.</p>
          ) : (
            <form onSubmit={handleApply}>
              <h3 className="mb-2">Apply for this position</h3>
              {applyError && <div className="alert alert-error">{applyError}</div>}

              <div className="form-group">
                <label className="form-label" htmlFor="coverLetter">
                  Cover letter <span className="text-muted">(optional)</span>
                </label>
                <textarea
                  id="coverLetter"
                  className="form-input"
                  rows={5}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Tell the recruiter why you're a great fit..."
                  maxLength={2000}
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={applying}>
                {applying ? 'Submitting...' : isAuthenticated ? 'Submit application' : 'Log in to apply'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobDetail;