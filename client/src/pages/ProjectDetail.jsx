import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import { formatDate, statusLabels, categoryLabels, getInitials, formatFileSize } from '../utils/helpers';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  HiOutlineArrowLeft,
  HiOutlineStar,
  HiOutlineLink,
  HiOutlineExternalLink,
  HiOutlineDownload,
  HiOutlineUsers,
  HiOutlineTag,
  HiOutlineCalendar,
  HiOutlineFolder,
  HiOutlineDocumentText,
  HiOutlineTrash,
  HiOutlinePencil
} from 'react-icons/hi';

const ProjectDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState({
    rating: 7,
    feedback: '',
    criteria: { innovation: 5, execution: 5, presentation: 5, documentation: 5 }
  });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [statusToUpdate, setStatusToUpdate] = useState('');

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      const { data } = await API.get(`/projects/${id}`);
      setProject(data.data);
      setStatusToUpdate(data.data.status);
    } catch (error) {
      toast.error('Project not found');
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewData.feedback.trim()) {
      toast.error('Please provide feedback');
      return;
    }

    setSubmittingReview(true);
    try {
      await API.post(`/reviews/${id}`, reviewData);
      toast.success('Review submitted!');
      setShowReviewForm(false);
      fetchProject();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleStatusUpdate = async () => {
    try {
      await API.patch(`/projects/${id}/status`, { status: statusToUpdate });
      toast.success('Status updated!');
      fetchProject();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await API.delete(`/projects/${id}`);
      toast.success('Project deleted');
      navigate('/projects');
    } catch (error) {
      toast.error('Failed to delete project');
    }
  };

  if (loading) return <div className="loader-container"><div className="loader"></div></div>;
  if (!project) return null;

  const isOwner = project.submittedBy?._id === user?.id;
  const canReview = (user?.role === 'reviewer' || user?.role === 'admin') && !isOwner;
  const hasReviewed = project.reviews?.some(r => r.reviewer?._id === user?.id);
  const canManageStatus = user?.role === 'reviewer' || user?.role === 'admin';

  const statuses = ['submitted', 'under_review', 'revision_required', 'approved', 'rejected'];

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Back button */}
      <button className="btn btn-ghost" onClick={() => navigate(-1)} style={{ marginBottom: '20px' }}>
        <HiOutlineArrowLeft /> Back
      </button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="detail-header">
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <span className={`badge badge-${project.status}`}>{statusLabels[project.status]}</span>
              <span className="tag">{categoryLabels[project.category]}</span>
            </div>
            <h1 className="page-title">{project.title}</h1>
            {project.abstract && (
              <p style={{ color: 'var(--text-secondary)', marginTop: '8px', fontSize: '0.95rem', lineHeight: '1.6' }}>
                {project.abstract}
              </p>
            )}
            <div className="detail-meta">
              <div className="detail-meta-item">
                <div className="user-avatar" style={{ width: '24px', height: '24px', fontSize: '0.6rem' }}>
                  {getInitials(project.submittedBy?.name)}
                </div>
                {project.submittedBy?.name}
              </div>
              <div className="detail-meta-item">
                <HiOutlineCalendar /> {formatDate(project.createdAt)}
              </div>
              {project.averageRating > 0 && (
                <div className="detail-meta-item" style={{ color: 'var(--accent-gold)' }}>
                  <HiOutlineStar /> {project.averageRating}/10 ({project.reviewCount} review{project.reviewCount !== 1 ? 's' : ''})
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
            {(isOwner || user?.role === 'admin') && (
              <button className="btn btn-danger btn-sm" onClick={handleDelete}>
                <HiOutlineTrash /> Delete
              </button>
            )}
          </div>
        </div>

        {/* Status management */}
        {canManageStatus && (
          <div className="card" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Update Status:</span>
            <select
              className="filter-select"
              value={statusToUpdate}
              onChange={(e) => setStatusToUpdate(e.target.value)}
            >
              {statuses.map(s => (
                <option key={s} value={s}>{statusLabels[s]}</option>
              ))}
            </select>
            <button
              className="btn btn-primary btn-sm"
              onClick={handleStatusUpdate}
              disabled={statusToUpdate === project.status}
            >
              Update
            </button>
          </div>
        )}

        {/* Description */}
        <div className="detail-section">
          <h3 className="detail-section-title">
            <HiOutlineDocumentText style={{ color: 'var(--accent-gold)' }} />
            Description
          </h3>
          <div className="detail-body" style={{ whiteSpace: 'pre-wrap' }}>
            {project.description}
          </div>
        </div>

        {/* Team Members */}
        {project.team?.length > 0 && (
          <div className="detail-section">
            <h3 className="detail-section-title">
              <HiOutlineUsers style={{ color: 'var(--accent-gold)' }} />
              Team Members
            </h3>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {project.team.map((member, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                  <div className="user-avatar" style={{ width: '24px', height: '24px', fontSize: '0.6rem' }}>
                    {getInitials(member)}
                  </div>
                  {member}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {project.tags?.length > 0 && (
          <div className="detail-section">
            <h3 className="detail-section-title">
              <HiOutlineTag style={{ color: 'var(--accent-gold)' }} />
              Tags
            </h3>
            <div className="project-card-tags">
              {project.tags.map((tag, i) => (
                <span key={i} className="tag">{tag}</span>
              ))}
            </div>
          </div>
        )}

        {/* Links */}
        {(project.githubUrl || project.liveUrl) && (
          <div className="detail-section">
            <h3 className="detail-section-title">
              <HiOutlineLink style={{ color: 'var(--accent-gold)' }} />
              Links
            </h3>
            <div className="detail-links">
              {project.githubUrl && (
                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="detail-link-btn">
                  <HiOutlineExternalLink /> GitHub
                </a>
              )}
              {project.liveUrl && (
                <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="detail-link-btn">
                  <HiOutlineExternalLink /> Live Demo
                </a>
              )}
            </div>
          </div>
        )}

        {/* Files */}
        {project.files?.length > 0 && (
          <div className="detail-section">
            <h3 className="detail-section-title">
              <HiOutlineFolder style={{ color: 'var(--accent-gold)' }} />
              Files ({project.files.length})
            </h3>
            <div className="file-list">
              {project.files.map((file, i) => (
                <div key={i} className="file-item">
                  <HiOutlineDocumentText style={{ color: 'var(--accent-gold)', flexShrink: 0 }} />
                  <span className="file-item-name">{file.originalName}</span>
                  <span className="file-item-size">{formatFileSize(file.size)}</span>
                  <a
                    href={`/uploads/${file.filename}`}
                    download={file.originalName}
                    className="btn btn-ghost btn-sm"
                    style={{ padding: '4px', fontSize: '1rem' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <HiOutlineDownload />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        <div className="detail-section">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 className="detail-section-title" style={{ marginBottom: 0 }}>
              <HiOutlineStar style={{ color: 'var(--accent-gold)' }} />
              Reviews ({project.reviews?.length || 0})
            </h3>
            {canReview && !hasReviewed && (
              <button className="btn btn-primary btn-sm" onClick={() => setShowReviewForm(!showReviewForm)}>
                <HiOutlinePencil /> Write Review
              </button>
            )}
          </div>

          {/* Review Form */}
          {showReviewForm && (
            <motion.form
              className="card"
              style={{ marginBottom: '20px', border: '1px solid var(--accent-gold-border)' }}
              onSubmit={handleReviewSubmit}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
            >
              <h4 style={{ marginBottom: '16px' }}>Submit Your Review</h4>

              <div className="form-group">
                <label className="form-label">Overall Rating</label>
                <div className="rating-input">
                  <input
                    type="range"
                    className="rating-slider"
                    min="1"
                    max="10"
                    value={reviewData.rating}
                    onChange={(e) => setReviewData({ ...reviewData, rating: parseInt(e.target.value) })}
                  />
                  <span className="rating-number">{reviewData.rating}</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                {Object.entries(reviewData.criteria).map(([key, value]) => (
                  <div key={key} className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ textTransform: 'capitalize' }}>{key}</label>
                    <div className="rating-input">
                      <input
                        type="range"
                        className="rating-slider"
                        min="1"
                        max="10"
                        value={value}
                        onChange={(e) => setReviewData({
                          ...reviewData,
                          criteria: { ...reviewData.criteria, [key]: parseInt(e.target.value) }
                        })}
                      />
                      <span className="rating-number">{value}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="form-group">
                <label className="form-label">Feedback *</label>
                <textarea
                  className="form-textarea"
                  placeholder="Provide detailed feedback about this project..."
                  value={reviewData.feedback}
                  onChange={(e) => setReviewData({ ...reviewData, feedback: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowReviewForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submittingReview}>
                  {submittingReview ? <span className="loader loader-sm" /> : 'Submit Review'}
                </button>
              </div>
            </motion.form>
          )}

          {/* Review List */}
          {project.reviews?.length > 0 ? (
            project.reviews.map(review => (
              <div key={review._id} className="review-card">
                <div className="review-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="user-avatar" style={{ width: '32px', height: '32px', fontSize: '0.75rem' }}>
                      {getInitials(review.reviewer?.name)}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-primary)' }}>
                        {review.reviewer?.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {formatDate(review.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div className="review-rating">
                    <span className="review-rating-value">{review.rating}</span>
                    <span className="review-rating-max">/10</span>
                  </div>
                </div>

                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>
                  {review.feedback}
                </p>

                {review.criteria && (
                  <div className="review-criteria">
                    {Object.entries(review.criteria).map(([key, value]) => (
                      <div key={key} className="criteria-item">
                        <span className="criteria-label">{key}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div className="criteria-bar">
                            <div className="criteria-bar-fill" style={{ width: `${(value / 10) * 100}%` }} />
                          </div>
                          <span className="criteria-value">{value}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
              No reviews yet
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ProjectDetail;
