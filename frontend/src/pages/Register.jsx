import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineUser, HiOutlineEye, HiOutlineEyeOff, HiOutlineAcademicCap } from 'react-icons/hi';
import { FaGoogle, FaGithub } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    department: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password, confirmPassword, role, department } = formData;

    if (!name || !email || !password) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await register({ name, email, password, role, department });
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <Link to="/" style={{ textDecoration: 'none' }}>
        <div className="auth-logo">
          <div className="auth-logo-icon" style={{ background: 'transparent' }}>
            <img src="/logo.png" alt="ProjectHub Logo" />
          </div>
          <span className="auth-logo-text"></span>
        </div>
      </Link>

      <h1 className="auth-title">Create Account</h1>
      <p className="auth-subtitle">Join the project submission portal</p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="reg-name">Full Name</label>
          <div style={{ position: 'relative' }}>
            <HiOutlineUser style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '1.1rem' }} />
            <input
              id="reg-name"
              type="text"
              name="name"
              className="form-input"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              style={{ paddingLeft: '42px' }}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="reg-email">Email Address</label>
          <div style={{ position: 'relative' }}>
            <HiOutlineMail style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '1.1rem' }} />
            <input
              id="reg-email"
              type="email"
              name="email"
              className="form-input"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              style={{ paddingLeft: '42px' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-role">Role</label>
            <select
              id="reg-role"
              name="role"
              className="form-select"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="student">Student</option>
              <option value="reviewer">Reviewer</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-dept">Department</label>
            <div style={{ position: 'relative' }}>
              <HiOutlineAcademicCap style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '1.1rem' }} />
              <input
                id="reg-dept"
                type="text"
                name="department"
                className="form-input"
                placeholder="CS, ECE..."
                value={formData.department}
                onChange={handleChange}
                style={{ paddingLeft: '42px' }}
              />
            </div>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="reg-password">Password</label>
          <div style={{ position: 'relative' }}>
            <HiOutlineLockClosed style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '1.1rem' }} />
            <input
              id="reg-password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              className="form-input"
              placeholder="Min. 6 characters"
              value={formData.password}
              onChange={handleChange}
              style={{ paddingLeft: '42px', paddingRight: '42px' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.1rem' }}
            >
              {showPassword ? <HiOutlineEyeOff /> : <HiOutlineEye />}
            </button>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="reg-confirm">Confirm Password</label>
          <div style={{ position: 'relative' }}>
            <HiOutlineLockClosed style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '1.1rem' }} />
            <input
              id="reg-confirm"
              type="password"
              name="confirmPassword"
              className="form-input"
              placeholder="Repeat password"
              value={formData.confirmPassword}
              onChange={handleChange}
              style={{ paddingLeft: '42px' }}
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '8px' }} disabled={loading}>
          {loading ? <span className="loader loader-sm" /> : 'Create Account'}
        </button>
      </form>

      <div className="auth-divider">or continue with</div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <button className="btn btn-oauth" onClick={() => window.location.href = `${API_URL}/auth/google`}>
          <FaGoogle /> Google
        </button>
        <button className="btn btn-oauth" onClick={() => window.location.href = `${API_URL}/auth/github`}>
          <FaGithub /> GitHub
        </button>
      </div>

      <p className="auth-footer">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </div>
  );
};

export default Register;
