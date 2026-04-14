import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { categoryLabels, formatFileSize } from '../utils/helpers';
import {
  HiOutlineUpload,
  HiOutlineX,
  HiOutlineLink,
  HiOutlineTag,
  HiOutlineUsers,
  HiOutlineDocumentText
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const SubmitProject = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    abstract: '',
    tags: '',
    team: '',
    githubUrl: '',
    liveUrl: ''
  });
  const [files, setFiles] = useState([]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFiles = (newFiles) => {
    const validFiles = Array.from(newFiles).filter(f => f.size <= 10 * 1024 * 1024);
    if (validFiles.length < newFiles.length) {
      toast.error('Some files exceed the 10MB limit');
    }
    setFiles(prev => [...prev, ...validFiles].slice(0, 5));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (files.length === 0) {
      toast.error('Please upload at least one file before submitting');
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('category', formData.category);
      data.append('abstract', formData.abstract);
      data.append('tags', formData.tags);
      data.append('team', formData.team);
      data.append('githubUrl', formData.githubUrl);
      data.append('liveUrl', formData.liveUrl);

      files.forEach(file => {
        data.append('files', file);
      });

      await API.post('/projects', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Project submitted successfully!');
      navigate('/projects');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Submit New Project</h1>
          <p className="page-subtitle">Share your project for review and evaluation</p>
        </div>
      </div>

      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="card" style={{ marginBottom: '24px' }}>
          <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HiOutlineDocumentText style={{ color: 'var(--accent-gold)' }} />
            Project Details
          </h3>

          <div className="form-group">
            <label className="form-label" htmlFor="title">Project Title *</label>
            <input
              id="title"
              type="text"
              name="title"
              className="form-input"
              placeholder="Enter your project title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="abstract">Abstract</label>
            <input
              id="abstract"
              type="text"
              name="abstract"
              className="form-input"
              placeholder="Brief one-line summary of your project"
              value={formData.abstract}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              className="form-textarea"
              placeholder="Describe your project in detail — objectives, methodology, technologies used, results..."
              value={formData.description}
              onChange={handleChange}
              style={{ minHeight: '180px' }}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="category">Category *</label>
            <select
              id="category"
              name="category"
              className="form-select"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">Select a category</option>
              {Object.entries(categoryLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="card" style={{ marginBottom: '24px' }}>
          <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HiOutlineTag style={{ color: 'var(--accent-gold)' }} />
            Tags & Team
          </h3>

          <div className="form-group">
            <label className="form-label" htmlFor="tags">Tags (comma separated)</label>
            <input
              id="tags"
              type="text"
              name="tags"
              className="form-input"
              placeholder="react, node.js, machine-learning"
              value={formData.tags}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="team">
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <HiOutlineUsers style={{ fontSize: '0.9rem' }} />
                Team Members (comma separated)
              </span>
            </label>
            <input
              id="team"
              type="text"
              name="team"
              className="form-input"
              placeholder="Alice, Bob, Charlie"
              value={formData.team}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="card" style={{ marginBottom: '24px' }}>
          <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HiOutlineLink style={{ color: 'var(--accent-gold)' }} />
            Links
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="githubUrl">GitHub Repository</label>
              <input
                id="githubUrl"
                type="url"
                name="githubUrl"
                className="form-input"
                placeholder="https://github.com/..."
                value={formData.githubUrl}
                onChange={handleChange}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="liveUrl">Live Demo URL</label>
              <input
                id="liveUrl"
                type="url"
                name="liveUrl"
                className="form-input"
                placeholder="https://..."
                value={formData.liveUrl}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="card" style={{ marginBottom: '24px' }}>
          <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HiOutlineUpload style={{ color: 'var(--accent-gold)' }} />
            Files *
          </h3>

          <div
            className={`file-upload-zone ${dragOver ? 'drag-over' : ''}`}
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="file-upload-icon"><HiOutlineUpload /></div>
            <p className="file-upload-text">
              Drag & drop files here or <span style={{ color: 'var(--accent-gold)', fontWeight: '500' }}>browse</span>
            </p>
            <p className="file-upload-hint">PDF, DOCX, ZIP, images — Max 10MB per file, up to 5 files</p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            style={{ display: 'none' }}
            onChange={(e) => handleFiles(e.target.files)}
            accept=".pdf,.doc,.docx,.zip,.rar,.jpg,.jpeg,.png,.gif,.pptx,.ppt,.txt"
          />

          {files.length > 0 && (
            <div className="file-list">
              {files.map((file, i) => (
                <div key={i} className="file-item">
                  <HiOutlineDocumentText style={{ color: 'var(--accent-gold)', flexShrink: 0 }} />
                  <span className="file-item-name">{file.name}</span>
                  <span className="file-item-size">{formatFileSize(file.size)}</span>
                  <button type="button" className="file-item-remove" onClick={() => removeFile(i)}>
                    <HiOutlineX />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/projects')}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
            {loading ? <span className="loader loader-sm" /> : 'Submit Project'}
          </button>
        </div>
      </motion.form>
    </div>
  );
};

export default SubmitProject;
