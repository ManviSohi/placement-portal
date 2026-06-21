// src/pages/Profile.jsx
import { useState, useEffect } from 'react';
import api from '../api/axios';
import Spinner from '../components/common/Spinner';

const PROFICIENCY_LEVELS = ['beginner', 'intermediate', 'advanced', 'expert'];

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Separate form state from fetched data.
  // Why? `profile` represents the server's truth.
  // `formData` represents what the user is currently editing.
  // They diverge the moment the user types — keeping them separate
  // avoids mutating server data directly before save succeeds.
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  const [newSkill, setNewSkill] = useState('');
  const [newProficiency, setNewProficiency] = useState('intermediate');
  const [skillError, setSkillError] = useState('');

  // Fetch profile + skills once on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/students/profile');
        const { profile: fetchedProfile, skills: fetchedSkills } = response.data.data;
        setProfile(fetchedProfile);
        setSkills(fetchedSkills || []);
        // Seed the editable form with the fetched values
        setFormData({
          fullName: fetchedProfile.full_name || '',
          university: fetchedProfile.university || '',
          degree: fetchedProfile.degree || '',
          graduationYear: fetchedProfile.graduation_year || '',
          bio: fetchedProfile.bio || '',
          resumeUrl: fetchedProfile.resume_url || '',
          phone: fetchedProfile.phone || '',
          linkedinUrl: fetchedProfile.linkedin_url || '',
        });
      } catch (err) {
        setError('Failed to load your profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setSaveSuccess(false); // Hide the "saved" banner once the user edits again
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveError('');
    setSaveSuccess(false);
    try {
      // Convert graduationYear to a number, or omit if empty
      // (sending "" would fail the backend's isInt validator)
      const payload = {
        ...formData,
        graduationYear: formData.graduationYear ? Number(formData.graduationYear) : undefined,
      };
      const response = await api.put('/students/profile', payload);
      setProfile(response.data.data.profile);
      setSaveSuccess(true);
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    setSkillError('');
    if (!newSkill.trim()) return;

    try {
      const response = await api.post('/students/skills', {
        skillName: newSkill.trim(),
        proficiency: newProficiency,
      });
      // Add the new skill to the local list immediately —
      // no need to re-fetch the whole list for one new item
      setSkills((prev) => [...prev, response.data.data.skill]);
      setNewSkill('');
    } catch (err) {
      setSkillError(err.response?.data?.message || 'Failed to add skill.');
    }
  };

  const handleDeleteSkill = async (skillId) => {
    try {
      await api.delete(`/students/skills/${skillId}`);
      // Remove from local state — filter out the deleted skill by id
      setSkills((prev) => prev.filter((s) => s.id !== skillId));
    } catch (err) {
      setSkillError('Failed to delete skill.');
    }
  };

  if (loading) return <Spinner fullPage />;
  if (error) return (
    <div className="page-content"><div className="container">
      <div className="alert alert-error">{error}</div>
    </div></div>
  );

  return (
    <div className="page-content">
      <div className="container" style={{ maxWidth: '700px' }}>
        <h1 className="mb-3">My profile</h1>

        {/* ─── Profile form ─── */}
        <div className="card mb-3">
          {saveSuccess && <div className="alert alert-success">Profile saved successfully.</div>}
          {saveError && <div className="alert alert-error">{saveError}</div>}

          <form onSubmit={handleSaveProfile}>
            <div className="form-group">
              <label className="form-label">Full name</label>
              <input className="form-input" name="fullName" value={formData.fullName} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">University</label>
              <input className="form-input" name="university" value={formData.university} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Degree</label>
              <input className="form-input" name="degree" value={formData.degree} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Graduation year</label>
              <input
                className="form-input" name="graduationYear" type="number"
                value={formData.graduationYear} onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Bio</label>
              <textarea
                className="form-input" name="bio" rows={4}
                value={formData.bio} onChange={handleChange} maxLength={1000}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Resume URL</label>
              <input
                className="form-input" name="resumeUrl" type="url"
                value={formData.resumeUrl} onChange={handleChange}
                placeholder="https://drive.google.com/..."
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-input" name="phone" value={formData.phone} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">LinkedIn URL</label>
              <input
                className="form-input" name="linkedinUrl" type="url"
                value={formData.linkedinUrl} onChange={handleChange}
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save profile'}
            </button>
          </form>
        </div>

        {/* ─── Skills section ─── */}
        <div className="card">
          <h2 className="mb-2">Skills</h2>
          {skillError && <div className="alert alert-error">{skillError}</div>}

          <div className="flex gap-2" style={{ flexWrap: 'wrap', marginBottom: '1rem' }}>
            {skills.length === 0 && <p className="text-muted">No skills added yet.</p>}
            {skills.map((skill) => (
              <span key={skill.id} className="badge badge-gray" style={{ gap: '0.5rem' }}>
                {skill.skill_name} ({skill.proficiency})
                <button
                  onClick={() => handleDeleteSkill(skill.id)}
                  style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--danger)', fontWeight: 700 }}
                  aria-label={`Remove ${skill.skill_name}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          <form onSubmit={handleAddSkill} className="flex gap-2">
            <input
              className="form-input"
              placeholder="e.g. React"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              style={{ flex: 2 }}
            />
            <select
              className="form-input"
              value={newProficiency}
              onChange={(e) => setNewProficiency(e.target.value)}
              style={{ flex: 1 }}
            >
              {PROFICIENCY_LEVELS.map((level) => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
            <button type="submit" className="btn btn-primary">Add</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;