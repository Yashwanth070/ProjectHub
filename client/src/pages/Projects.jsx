import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import { formatDate, statusLabels, categoryLabels, getInitials } from '../utils/helpers';
import { motion } from 'framer-motion';
import {
  HiOutlineSearch,
  HiOutlinePlusCircle,
  HiOutlineFolder,
  HiOutlineStar,
  HiOutlineViewGrid,
  HiOutlineViewList
} from 'react-icons/hi';

const Projects = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('grid');
  const [filters, setFilters] = useState({ search: '', status: '', category: '' });
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });

  useEffect(() => {
    fetchProjects();
  }, [filters.status, filters.category, pagination.current]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', pagination.current);
      params.append('limit', '12');
      if (filters.search) params.append('search', filters.search);
      if (filters.status) params.append('status', filters.status);
      if (filters.category) params.append('category', filters.category);

      const { data } = await API.get(`/projects?${params.toString()}`);
      setProjects(data.data);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchProjects();
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            {user?.role === 'student' ? 'My Projects' : 'All Projects'}
          </h1>
          <p className="page-subtitle">
            {pagination.total} project{pagination.total !== 1 ? 's' : ''} found
          </p>
        </div>
        {user?.role === 'student' && (
          <button className="btn btn-primary" onClick={() => navigate('/projects/new')}>
            <HiOutlinePlusCircle /> Submit Project
          </button>
        )}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
        <form onSubmit={handleSearch} style={{ flex: 1, minWidth: '200px' }}>
          <div className="search-bar">
            <HiOutlineSearch className="search-bar-icon" />
            <input
              type="text"
              placeholder="Search projects..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
        </form>

        <select
          className="filter-select"
          value={filters.status}
          onChange={(e) => { setFilters({ ...filters, status: e.target.value }); setPagination(p => ({ ...p, current: 1 })); }}
        >
          <option value="">All Status</option>
          {Object.entries(statusLabels).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>

        <select
          className="filter-select"
          value={filters.category}
          onChange={(e) => { setFilters({ ...filters, category: e.target.value }); setPagination(p => ({ ...p, current: 1 })); }}
        >
          <option value="">All Categories</option>
          {Object.entries(categoryLabels).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>

        <div style={{ display: 'flex', gap: '4px' }}>
          <button className={`btn btn-ghost btn-sm ${view === 'grid' ? 'active' : ''}`} onClick={() => setView('grid')} style={view === 'grid' ? { color: 'var(--accent-gold)' } : {}}>
            <HiOutlineViewGrid />
          </button>
          <button className={`btn btn-ghost btn-sm ${view === 'list' ? 'active' : ''}`} onClick={() => setView('list')} style={view === 'list' ? { color: 'var(--accent-gold)' } : {}}>
            <HiOutlineViewList />
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="loader-container"><div className="loader"></div></div>
      ) : projects.length === 0 ? (
        <div className="empty-state">
          <HiOutlineFolder className="empty-state-icon" />
          <h3 className="empty-state-title">No projects found</h3>
          <p className="empty-state-desc">
            {user?.role === 'student'
              ? "You haven't submitted any projects yet. Click Submit Project to get started!"
              : 'No projects match the current filters.'}
          </p>
          {user?.role === 'student' && (
            <button className="btn btn-primary" onClick={() => navigate('/projects/new')}>
              <HiOutlinePlusCircle /> Submit Your First Project
            </button>
          )}
        </div>
      ) : (
        <motion.div
          className={view === 'grid' ? 'grid grid-3' : ''}
          style={view === 'list' ? { display: 'flex', flexDirection: 'column', gap: '12px' } : {}}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {projects.map((project, idx) => (
            <motion.div
              key={project._id}
              className="project-card"
              onClick={() => navigate(`/projects/${project._id}`)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              style={view === 'list' ? { flexDirection: 'row', alignItems: 'center', gap: '20px' } : {}}
            >
              <div className="project-card-header">
                <h3 className="project-card-title">{project.title}</h3>
                <span className={`badge badge-${project.status}`}>
                  {statusLabels[project.status]}
                </span>
              </div>

              {view === 'grid' && (
                <p className="project-card-desc">{project.description}</p>
              )}

              <div className="project-card-tags">
                <span className="tag">{categoryLabels[project.category] || project.category}</span>
                {project.tags?.slice(0, 2).map((tag, i) => (
                  <span key={i} className="tag">{tag}</span>
                ))}
              </div>

              <div className="project-card-footer">
                <div className="project-card-author">
                  <div className="user-avatar">{getInitials(project.submittedBy?.name)}</div>
                  <span>{project.submittedBy?.name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {project.averageRating > 0 && (
                    <div className="project-card-rating">
                      <HiOutlineStar /> {project.averageRating}
                    </div>
                  )}
                  <span className="project-card-date">{formatDate(project.createdAt)}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="pagination">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              className={`pagination-btn ${page === pagination.current ? 'active' : ''}`}
              onClick={() => setPagination(prev => ({ ...prev, current: page }))}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Projects;
