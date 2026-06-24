// src/pages/Landing.jsx
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';


const Landing = () => {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <div className="page-wrapper">
      

      {/* Hero section */}
      <section style={{
        background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
        color: '#fff',
        padding: '5rem 0',
        textAlign: 'center',
      }}>
        <div className="container">
          <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem', lineHeight: 1.2 }}>
            Find your next opportunity
          </h1>
          <p style={{ fontSize: '1.25rem', opacity: 0.9, maxWidth: '600px', margin: '0 auto 2rem' }}>
            Connect with top companies. Apply to internships and jobs. Launch your career.
          </p>
          <div className="flex gap-2" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
            {isAuthenticated ? (
              <Link
                to={isAdmin ? '/admin/dashboard' : '/dashboard'}
                className="btn btn-lg"
                style={{ background: '#fff', color: '#4F46E5', fontWeight: 600 }}
              >
                Go to dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="btn btn-lg"
                  style={{ background: '#fff', color: '#4F46E5', fontWeight: 600 }}
                >
                  Get started free
                </Link>
                <Link
                  to="/jobs"
                  className="btn btn-lg"
                  style={{ background: 'transparent', color: '#fff', border: '2px solid rgba(255,255,255,0.6)' }}
                >
                  Browse jobs
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section style={{ background: 'var(--bg-primary)', padding: '2.5rem 0', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '2rem',
            textAlign: 'center',
          }}>
            {[
              { number: '10,000+', label: 'Students placed' },
              { number: '500+', label: 'Partner companies' },
              { number: '2,000+', label: 'Active job listings' },
              { number: '95%', label: 'Placement rate' },
            ].map(({ number, label }) => (
              <div key={label}>
                <p style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)' }}>{number}</p>
                <p className="text-muted">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: '4rem 0' }}>
        <div className="container">
          <h2 className="text-center mb-3" style={{ fontSize: '2rem', fontWeight: 700 }}>
            How it works
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.5rem',
          }}>
            {[
              { step: '01', title: 'Create your profile', desc: 'Sign up and fill out your academic background, skills, and upload your resume link.' },
              { step: '02', title: 'Browse opportunities', desc: 'Search and filter hundreds of internships and full-time roles from verified companies.' },
              { step: '03', title: 'Apply in one click', desc: 'Submit applications with a cover letter. Track every application in one place.' },
              { step: '04', title: 'Get hired', desc: 'Hear back from companies directly. Accept your offer and start your career.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="card">
                <p style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--primary-light)', lineHeight: 1 }}>{step}</p>
                <h3 style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}>{title}</h3>
                <p className="text-muted" style={{ fontSize: '0.9rem' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA banner */}
      {!isAuthenticated && (
        <section style={{
          background: 'var(--primary-light)',
          padding: '3.5rem 0',
          textAlign: 'center',
        }}>
          <div className="container">
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              Ready to start?
            </h2>
            <p className="text-muted mb-3">Join thousands of students already using the portal.</p>
            <Link to="/register" className="btn btn-primary btn-lg">
              Create your free account
            </Link>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer style={{
        background: 'var(--bg-primary)',
        borderTop: '1px solid var(--border)',
        padding: '1.5rem 0',
        textAlign: 'center',
      }}>
        <p className="text-muted" style={{ fontSize: '0.875rem' }}>
          © {new Date().getFullYear()} Placement Portal. Built with React + Node.js + PostgreSQL.
        </p>
      </footer>
    </div>
  );
};

export default Landing;