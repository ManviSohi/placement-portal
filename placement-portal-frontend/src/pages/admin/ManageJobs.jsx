// src/pages/admin/ManageJobs.jsx
import { useState, useEffect } from 'react';
import api from '../../api/axios';
import Spinner from '../../components/common/Spinner';
import { formatDate, formatSalary, capitalize } from '../../utils/formatters';

const JOB_TYPES = ['full-time', 'part-time', 'internship', 'contract', 'remote'];
const STATUSES  = ['open', 'closed', 'draft'];

const emptyForm = {
  title: '', company: '', description: '', location: '',
  type: 'full-time', status: 'open',
  salaryMin: '', salaryMax: '', deadline: '',
};

const ManageJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // editingId is null when creating a NEW job, or a job's id when editing.
  // This single flag drives whether the form is shown and how it submits.
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Admin views jobs via the public /jobs endpoint won't show drafts/closed —
  // so admins need their own listing. We fetch via /jobs but admins should
  // see ALL statuses. Simplest approach without a new endpoint: fetch open
  // jobs AND let admin filter — but for full control we add status filter.
  const fetchJobs = async () => {
    setLoading(true);
    try {
      // We reuse GET /api/jobs but admins should see everything,
      // not just status=open. Since our public endpoint hardcodes
      // status='open', we fetch jobs admin created via a wider query.
      // (See note below this component for the backend tweak needed.)
      const response = await api.get('/jobs?limit=100');
      setJobs(response.data.data.jobs);
    } catch (err) {
      setError('Failed to load jobs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchJobs(); }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const openCreateForm = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setFormError('');
    setShowForm(true);
  };

  const openEditForm = (job) => {
    setEditingId(job.id);
    setFormData({
      title: job.title,
      company: job.company,
      description: job.description || '',
      location: job.location || '',
      type: job.type,
      status: job.status,
      salaryMin: job.salary_min || '',
      salaryMax: job.salary_max || '',
      // Trim ISO datetime down to YYYY-MM-DD for the date input
      deadline: job.deadline ? job.deadline.slice(0, 10) : '',
    });
    setFormError('');
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');

    // Build payload, converting empty strings to undefined so optional
    // fields don't fail backend validators expecting numbers/dates
    const payload = {
      ...formData,
      salaryMin: formData.salaryMin ? Number(formData.salaryMin) : undefined,
      salaryMax: formData.salaryMax ? Number(formData.salaryMax) : undefined,
      deadline: formData.deadline || undefined,
    };

    try {
      if (editingId) {
        await api.put(`/admin/jobs/${editingId}`, payload);
      } else {
        await api.post('/admin/jobs', payload);
      }
      setShowForm(false);
      fetchJobs(); // Re-fetch the list to show the change
    } catch (err) {
      if (err.response?.data?.errors) {
        setFormError(err.response.data.errors.map((e) => e.message).join(', '));
      } else {
        setFormError(err.response?.data?.message || 'Failed to save job.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm('Delete this job? This will also remove all applications to it.')) return;
    try {
      await api.delete(`/admin/jobs/${jobId}`);
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
    } catch (err) {
      setError('Failed to delete job.');
    }
  };

  if (loading) return <Spinner fullPage />;

  return (
    <div className="page-content">
      <div className="container">
        <div className="flex mb-3" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>Manage jobs</h1>
          <button className="btn btn-primary" onClick={openCreateForm}>+ Create job</button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {/* Create/Edit form — shown conditionally */}
        {showForm && (
          <div className="card mb-3">
            <h3 className="mb-2">{editingId ? 'Edit job' : 'Create new job'}</h3>
            {formError && <div className="alert alert-error">{formError}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input className="form-input" name="title" value={formData.title} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Company</label>
                <input className="form-input" name="company" value={formData.company} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-input" name="description" rows={4} value={formData.description} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Location</label>
                <input className="form-input" name="location" value={formData.location} onChange={handleChange} />
              </div>

              <div className="flex gap-2">
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Type</label>
                  <select className="form-input" name="type" value={formData.type} onChange={handleChange}>
                    {JOB_TYPES.map((t) => <option key={t} value={t}>{capitalize(t.replace('-', ' '))}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Status</label>
                  <select className="form-input" name="status" value={formData.status} onChange={handleChange}>
                    {STATUSES.map((s) => <option key={s} value={s}>{capitalize(s)}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex gap-2">
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Min salary</label>
                  <input className="form-input" type="number" name="salaryMin" value={formData.salaryMin} onChange={handleChange} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Max salary</label>
                  <input className="form-input" type="number" name="salaryMax" value={formData.salaryMax} onChange={handleChange} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Application deadline</label>
                <input className="form-input" type="date" name="deadline" value={formData.deadline} onChange={handleChange} />
              </div>

              <div className="flex gap-2">
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : editingId ? 'Update job' : 'Create job'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Job list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {jobs.map((job) => (
            <div key={job.id} className="card">
              <div className="flex" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3>{job.title}</h3>
                  <p className="text-muted">{job.company} · {job.location}</p>
                  <p className="mt-1">{formatSalary(job.salary_min, job.salary_max)}</p>
                  {job.deadline && <p className="text-muted" style={{ fontSize: '0.825rem' }}>Deadline: {formatDate(job.deadline)}</p>}
                </div>
                <div className="flex gap-2" style={{ alignItems: 'center' }}>
                  <span className={`badge ${job.status === 'open' ? 'badge-green' : job.status === 'closed' ? 'badge-red' : 'badge-gray'}`}>
                    {capitalize(job.status)}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 mt-2">
                <button className="btn btn-secondary btn-sm" onClick={() => openEditForm(job)}>Edit</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(job.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManageJobs;