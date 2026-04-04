import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import { formatDate, getInitials, categoryLabels } from '../utils/helpers';
import { motion } from 'framer-motion';
import {
  HiOutlineStar,
  HiOutlineFolder,
  HiOutlineChartBar
} from 'react-icons/hi';

const Reviews = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviewerStats();
  }, []);

  const fetchReviewerStats = async () => {
    try {
      const { data } = await API.get('/reviews/stats/overview');
      setStats(data.data);
    } catch (error) {
      console.error('Error fetching reviewer stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loader-container"><div className="loader"></div></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Reviews</h1>
          <p className="page-subtitle">Track your review activity and feedback</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-3" style={{ marginBottom: '32px' }}>
        <motion.div className="stat-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="stat-icon gold"><HiOutlineStar /></div>
          <div className="stat-content">
            <div className="stat-value">{stats?.totalReviews || 0}</div>
            <div className="stat-label">Total Reviews</div>
          </div>
        </motion.div>

        <motion.div className="stat-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="stat-icon teal"><HiOutlineChartBar /></div>
          <div className="stat-content">
            <div className="stat-value">{stats?.averageRating || 0}</div>
            <div className="stat-label">Avg. Rating Given</div>
          </div>
        </motion.div>

        <motion.div className="stat-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="stat-icon blue"><HiOutlineFolder /></div>
          <div className="stat-content">
            <div className="stat-value">{stats?.recentReviews?.length || 0}</div>
            <div className="stat-label">Recent</div>
          </div>
        </motion.div>
      </div>

      {/* Recent Reviews */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <h3 style={{ marginBottom: '16px' }}>Review History</h3>
        {stats?.recentReviews?.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {stats.recentReviews.map(review => (
              <div
                key={review._id}
                className="card card-hover"
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                onClick={() => navigate(`/projects/${review.project?._id}`)}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '4px' }}>
                    {review.project?.title || 'Untitled'}
                  </div>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <span className="tag">{categoryLabels[review.project?.category] || review.project?.category}</span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{formatDate(review.createdAt)}</span>
                  </div>
                </div>
                <div className="review-rating">
                  <span className="review-rating-value">{review.rating}</span>
                  <span className="review-rating-max">/10</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <HiOutlineStar className="empty-state-icon" />
            <h3 className="empty-state-title">No reviews yet</h3>
            <p className="empty-state-desc">You haven't reviewed any projects yet. Visit the Projects page to start reviewing.</p>
            <button className="btn btn-primary" onClick={() => navigate('/projects')}>
              Browse Projects
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Reviews;
