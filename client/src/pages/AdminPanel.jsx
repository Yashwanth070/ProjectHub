import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import { formatDate, getInitials, statusLabels } from '../utils/helpers';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  HiOutlineUsers,
  HiOutlineFolder,
  HiOutlineStar,
  HiOutlineSearch,
  HiOutlineTrash,
  HiOutlineChartBar
} from 'react-icons/hi';

const AdminPanel = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, statsRes] = await Promise.all([
        API.get('/users'),
        API.get('/users/admin/stats')
      ]);
      setUsers(usersRes.data.data);
      setStats(statsRes.data.data);
    } catch (error) {
      console.error('Admin fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateRole = async (userId, newRole) => {
    try {
      await API.patch(`/users/${userId}/role`, { role: newRole });
      toast.success('Role updated');
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
    } catch (error) {
      toast.error('Failed to update role');
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await API.delete(`/users/${userId}`);
      toast.success('User deleted');
      setUsers(prev => prev.filter(u => u._id !== userId));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !roleFilter || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (loading) return <div className="loader-container"><div className="loader"></div></div>;

  const getRoleCount = (role) => {
    const found = stats?.usersByRole?.find(r => r._id === role);
    return found?.count || 0;
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Panel</h1>
          <p className="page-subtitle">Manage users, roles, and system overview</p>
        </div>
      </div>

      {/* Stats */}
      <motion.div
        className="grid grid-4"
        style={{ marginBottom: '32px' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="stat-card">
          <div className="stat-icon teal"><HiOutlineUsers /></div>
          <div className="stat-content">
            <div className="stat-value">{stats?.totalUsers || 0}</div>
            <div className="stat-label">Total Users</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon gold"><HiOutlineFolder /></div>
          <div className="stat-content">
            <div className="stat-value">{stats?.totalProjects || 0}</div>
            <div className="stat-label">Total Projects</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple"><HiOutlineStar /></div>
          <div className="stat-content">
            <div className="stat-value">{stats?.totalReviews || 0}</div>
            <div className="stat-label">Total Reviews</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue"><HiOutlineChartBar /></div>
          <div className="stat-content">
            <div className="stat-value">{getRoleCount('reviewer')}</div>
            <div className="stat-label">Reviewers</div>
          </div>
        </div>
      </motion.div>

      {/* User Management */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <h3>User Management</h3>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div className="search-bar" style={{ minWidth: '220px' }}>
              <HiOutlineSearch className="search-bar-icon" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="filter-select"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="">All Roles</option>
              <option value="student">Students</option>
              <option value="reviewer">Reviewers</option>
              <option value="admin">Admins</option>
            </select>
          </div>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Department</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(u => (
                <tr key={u._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div className="user-avatar" style={{ width: '28px', height: '28px', fontSize: '0.65rem' }}>
                        {getInitials(u.name)}
                      </div>
                      <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{u.name}</span>
                    </div>
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <select
                      className="filter-select"
                      value={u.role}
                      onChange={(e) => updateRole(u._id, e.target.value)}
                      disabled={u._id === user?.id}
                      style={{ padding: '4px 24px 4px 8px', fontSize: '0.78rem' }}
                    >
                      <option value="student">Student</option>
                      <option value="reviewer">Reviewer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td>{u.department || '—'}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{formatDate(u.createdAt)}</td>
                  <td>
                    {u._id !== user?.id && (
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => deleteUser(u._id)}
                        style={{ color: 'var(--status-rejected)' }}
                      >
                        <HiOutlineTrash />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="empty-state" style={{ padding: '40px' }}>
            <p className="empty-state-title">No users found</p>
            <p className="empty-state-desc">Try adjusting your search or filters</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AdminPanel;
