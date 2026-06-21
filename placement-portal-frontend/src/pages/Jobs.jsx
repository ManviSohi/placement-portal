import {useState,useEffect} from 'react';
import {Link} from 'react-router-dom';
import api from '../api/axios';
import Spinner from '../components/common/Spinner';
import useDebounce from '../hooks/useDebounce';
import {formatSalary,formatDate,capitalize} from '../utils/formatters';

const JOB_TYPES=['full-time','part-time','internship','contract','remote'];

const Jobs=()=>{
  const [jobs,setJobs]=useState([]);
  const [pagination,setPagination]=useState(null);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
   // Raw input state — updates instantly as the user types
  const [searchInput, setSearchInput] = useState('');
  // Debounced version — only updates 500ms after typing stops
  const debouncedSearch = useDebounce(searchInput, 500);

  const [type, setType] = useState('');
  const [location, setLocation] = useState('');
  const [page, setPage] = useState(1);

  useEffect(()=>{
    const fetchJobs= async()=>{
      setLoading(true);
      setError('');
      try{
        const params = new URLSearchParams();
        if (debouncedSearch) params.append('search', debouncedSearch);
        if (type) params.append('type', type);
        if (location) params.append('location', location);
        params.append('page', page);
        params.append('limit', 10);
        
        const response = await api.get(`/jobs?${params.toString()}`);
        setJobs(response.data.data.jobs);
        setPagination(response.data.pagination);
      }
      catch (err) {
        setError('Failed to load jobs. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  },[debouncedSearch,type,location,page]);
   useEffect(() => {
    setPage(1);
  }, [debouncedSearch, type, location]);


  return (
    <div className="page-content">
      <div className="container">
        <h1 className="mb-3">Browse opportunities</h1>

        {/* Filter bar */}
        <div className="card mb-3" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search by title or company..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            style={{ flex: '2', minWidth: '200px' }}
          />
          <select
            className="form-input"
            value={type}
            onChange={(e) => setType(e.target.value)}
            style={{ flex: '1', minWidth: '150px' }}
          >
            <option value="">All types</option>
            {JOB_TYPES.map((t) => (
              <option key={t} value={t}>{capitalize(t.replace('-', ' '))}</option>
            ))}
          </select>
          <input
            type="text"
            className="form-input"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            style={{ flex: '1', minWidth: '150px' }}
          />
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <Spinner />
        ) : jobs.length === 0 ? (
          <div className="card text-center">
            <p className="text-muted">No jobs found matching your filters.</p>
          </div>
        ) : (
          <>
            {/* Job cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {jobs.map((job) => (
                <Link
                  key={job.id}
                  to={`/jobs/${job.id}`}
                  className="card"
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div className="flex" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3>{job.title}</h3>
                      <p className="text-muted">{job.company} · {job.location || 'Location not specified'}</p>
                    </div>
                    <span className="badge badge-blue">{capitalize(job.type.replace('-', ' '))}</span>
                  </div>
                  <p className="mt-2">{formatSalary(job.salary_min, job.salary_max)}</p>
                  {job.deadline && (
                    <p className="text-muted" style={{ fontSize: '0.825rem' }}>
                      Apply by {formatDate(job.deadline)}
                    </p>
                  )}
                </Link>
              ))}
            </div>

            {/* Pagination controls */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex gap-2 mt-3" style={{ justifyContent: 'center', alignItems: 'center' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={!pagination.hasPreviousPage}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </button>
                <span className="text-muted">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={!pagination.hasNextPage}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Jobs;
