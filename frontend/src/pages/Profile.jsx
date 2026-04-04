import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import { getInitials, formatDate } from '../utils/helpers';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  HiOutlineUser,
  HiOutlineMail,
  HiOutlineAcademicCap,
  HiOutlineCalendar,
  HiOutlinePencil
} from 'react-icons/hi';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    bio: ''
  });
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await API.get(`/users/${user?.id}`);
      setProfileData(data.data);
      setFormData({
        name: data.data.name || '',
        department: data.data.department || '',
        bio: data.data.bio || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.put('/users/profile', formData);
      updateUser({ ...user, ...data.data });
      setProfileData(prev => ({ ...prev, ...data.data }));
      setEditing(false);
      toast.success('Profile updated!');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Profile</h1>
          <p className="page-subtitle">Manage your account settings</p>
        </div>
        {!editing && (
          <button className="btn btn-outline" onClick={() => setEditing(true)}>
            <HiOutlinePencil /> Edit Profile
          </button>
        )}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Profile Card */}
        <div className="profile-header">
          <div className="user-avatar user-avatar-lg">
            {getInitials(user?.name)}
          </div>
          <div className="profile-info">
            <h2 className="profile-name">{user?.name}</h2>
            <p className="profile-email">{user?.email}</p>
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px', alignItems: 'center' }}>
              <span className={`badge badge-role badge-${user?.role}`}>{user?.role}</span>
              {profileData?.department && (
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <HiOutlineAcademicCap /> {profileData.department}
                </span>
              )}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ display: 'flex', gap: '24px' }}>
              {profileData?.projectCount !== undefined && (
                <div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)' }}>{profileData.projectCount}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Projects</div>
                </div>
              )}
              {profileData?.reviewCount !== undefined && (
                <div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)' }}>{profileData.reviewCount}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Reviews</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bio */}
        {profileData?.bio && !editing && (
          <div className="card" style={{ marginBottom: '24px' }}>
            <h3 style={{ marginBottom: '12px' }}>About</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.7' }}>
              {profileData.bio}
            </p>
          </div>
        )}

        {/* Account Info */}
        {!editing && (
          <div className="card" style={{ marginBottom: '24px' }}>
            <h3 style={{ marginBottom: '16px' }}>Account Information</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <HiOutlineUser style={{ color: 'var(--accent-gold)', fontSize: '1.1rem' }} />
                <div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Full Name</div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{user?.name}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <HiOutlineMail style={{ color: 'var(--accent-gold)', fontSize: '1.1rem' }} />
                <div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Email</div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{user?.email}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <HiOutlineCalendar style={{ color: 'var(--accent-gold)', fontSize: '1.1rem' }} />
                <div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Member Since</div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{formatDate(user?.createdAt)}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Form */}
        {editing && (
          <form onSubmit={handleSubmit}>
            <div className="card" style={{ marginBottom: '24px' }}>
              <h3 style={{ marginBottom: '20px' }}>Edit Profile</h3>

              <div className="form-group">
                <label className="form-label" htmlFor="edit-name">Full Name</label>
                <input
                  id="edit-name"
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="edit-dept">Department</label>
                <input
                  id="edit-dept"
                  type="text"
                  className="form-input"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="edit-bio">Bio</label>
                <textarea
                  id="edit-bio"
                  className="form-textarea"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setEditing(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? <span className="loader loader-sm" /> : 'Save Changes'}
                </button>
              </div>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default Profile;
