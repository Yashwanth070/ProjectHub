import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import { formatDate, statusLabels, categoryLabels, timeAgo } from '../utils/helpers';
import { motion } from 'framer-motion';
import {
  HiOutlineFolder,
  HiOutlineClipboardCheck,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
  HiOutlineClock,
  HiOutlineStar,
  HiOutlineUsers,
  HiOutlinePlusCircle,
  HiOutlineArrowRight
} from 'react-icons/hi';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [reviewStats, setReviewStats] = useState(null);
  const [adminStats, setAdminStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: projStats } = await API.get('/projects/stats/overview');
      setStats(projStats.data);

      if (user?.role === 'reviewer' || user?.role === 'admin') {
        const { data: revStats } = await API.get('/reviews/stats/overview');
        setReviewStats(revStats.data);
      }

      if (user?.role === 'admin') {
        const { data: admStats } = await API.get('/users/admin/stats');
        setAdminStats(admStats.data);
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loader-container"><div className="loader"></div></div>;
  }

  const CHART_COLORS = ['#d4a853', '#5ea3a3', '#6b8cce', '#9b7ec8', '#c45c5c', '#4a9e7a'];

  const pieData = stats?.categoryCounts?.map((c, i) => ({
    name: categoryLabels[c._id] || c._id,
    value: c.count,
    color: CHART_COLORS[i % CHART_COLORS.length]
  })) || [];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            {user?.role === 'admin' ? 'Admin Dashboard' :
             user?.role === 'reviewer' ? 'Reviewer Dashboard' :
             'My Dashboard'}
          </h1>
          <p className="page-subtitle">
            Welcome back, {user?.name?.split(' ')[0]}! Here's your overview.
          </p>
        </div>
        {user?.role === 'student' && (
          <button className="btn btn-primary" onClick={() => navigate('/projects/new')}>
            <HiOutlinePlusCircle /> Submit Project
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <motion.div
        className="grid grid-4"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <motion.div className="stat-card" variants={itemVariants}>
          <div className="stat-icon gold"><HiOutlineFolder /></div>
          <div className="stat-content">
            <div className="stat-value">{stats?.total || 0}</div>
            <div className="stat-label">Total Projects</div>
          </div>
        </motion.div>

        <motion.div className="stat-card" variants={itemVariants}>
          <div className="stat-icon blue"><HiOutlineClipboardCheck /></div>
          <div className="stat-content">
            <div className="stat-value">{stats?.underReview || 0}</div>
            <div className="stat-label">Under Review</div>
          </div>
        </motion.div>

        <motion.div className="stat-card" variants={itemVariants}>
          <div className="stat-icon green"><HiOutlineCheckCircle /></div>
          <div className="stat-content">
            <div className="stat-value">{stats?.approved || 0}</div>
            <div className="stat-label">Approved</div>
          </div>
        </motion.div>

        {user?.role === 'student' ? (
          <motion.div className="stat-card" variants={itemVariants}>
            <div className="stat-icon red"><HiOutlineExclamationCircle /></div>
            <div className="stat-content">
              <div className="stat-value">{stats?.revisionRequired || 0}</div>
              <div className="stat-label">Needs Revision</div>
            </div>
          </motion.div>
        ) : (
          <motion.div className="stat-card" variants={itemVariants}>
            <div className="stat-icon purple"><HiOutlineStar /></div>
            <div className="stat-content">
              <div className="stat-value">{reviewStats?.totalReviews || 0}</div>
              <div className="stat-label">Total Reviews</div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Admin Extra Stats */}
      {user?.role === 'admin' && adminStats && (
        <motion.div
          className="grid grid-3"
          style={{ marginTop: '20px' }}
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <motion.div className="stat-card" variants={itemVariants}>
            <div className="stat-icon teal"><HiOutlineUsers /></div>
            <div className="stat-content">
              <div className="stat-value">{adminStats.totalUsers}</div>
              <div className="stat-label">Total Users</div>
            </div>
          </motion.div>
          <motion.div className="stat-card" variants={itemVariants}>
            <div className="stat-icon gold"><HiOutlineStar /></div>
            <div className="stat-content">
              <div className="stat-value">{adminStats.totalReviews}</div>
              <div className="stat-label">Total Reviews</div>
            </div>
          </motion.div>
          <motion.div className="stat-card" variants={itemVariants}>
            <div className="stat-icon blue"><HiOutlineFolder /></div>
            <div className="stat-content">
              <div className="stat-value">{adminStats.totalProjects}</div>
              <div className="stat-label">All Projects</div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Charts + Recent Projects */}
      <div style={{ display: 'grid', gridTemplateColumns: pieData.length > 0 ? '1fr 1fr' : '1fr', gap: '24px', marginTop: '32px' }}>
        {/* Pie Chart - Category distribution */}
        {pieData.length > 0 && (
          <motion.div
            className="card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 style={{ marginBottom: '20px' }}>Projects by Category</h3>
            <div style={{ height: '240px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-primary)',
                      fontSize: '0.85rem'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '12px', justifyContent: 'center' }}>
              {pieData.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color }} />
                  {item.name}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Recent Projects */}
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3>Recent Projects</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/projects')}>
              View All <HiOutlineArrowRight />
            </button>
          </div>

          {stats?.recentProjects?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {stats.recentProjects.map((project) => (
                <div
                  key={project._id}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', cursor: 'pointer', transition: 'all 0.2s' }}
                  onClick={() => navigate(`/projects/${project._id}`)}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {project.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {categoryLabels[project.category] || project.category} • {timeAgo(project.createdAt)}
                    </div>
                  </div>
                  <span className={`badge badge-${project.status}`}>{statusLabels[project.status]}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '40px 20px' }}>
              <HiOutlineFolder className="empty-state-icon" />
              <p className="empty-state-title">No projects yet</p>
              <p className="empty-state-desc">
                {user?.role === 'student' ? 'Submit your first project to get started!' : 'No projects have been submitted yet.'}
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Reviewer Recent Reviews */}
      {(user?.role === 'reviewer' || user?.role === 'admin') && reviewStats?.recentReviews?.length > 0 && (
        <motion.div
          className="card"
          style={{ marginTop: '24px' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 style={{ marginBottom: '20px' }}>Recent Reviews</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {reviewStats.recentReviews.map((review) => (
              <div
                key={review._id}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: '500' }}>
                    {review.project?.title || 'Untitled Project'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {timeAgo(review.createdAt)}
                  </div>
                </div>
                <div className="project-card-rating">
                  <HiOutlineStar />
                  {review.rating}/10
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Dashboard;
