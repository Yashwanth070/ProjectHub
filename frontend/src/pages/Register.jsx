import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaGithub } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
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
    <div className="mockup-card">
      <div className="mockup-icon-wrapper">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3v4"></path>
          <path d="M12 7l-4 14"></path>
          <path d="M12 7l4 14"></path>
          <path d="M9 13h6"></path>
          <path d="M12 3a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"></path>
        </svg>
      </div>

      <h1 className="mockup-title">Create Account</h1>
      <p className="mockup-subtitle">Join the project submission portal</p>

      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        <div className="mockup-form-group">
          <div className="mockup-label">FULL NAME</div>
          <input
            id="reg-name"
            type="text"
            name="name"
            className="mockup-input"
            placeholder="John Doe"
            value={formData.name}
            onChange={handleChange}
          />
        </div>

        <div className="mockup-form-group">
          <div className="mockup-label">EMAIL ADDRESS</div>
          <input
            id="reg-email"
            type="email"
            name="email"
            className="mockup-input"
            placeholder="name@company.com"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="mockup-form-group">
            <div className="mockup-label">ROLE</div>
            <select
              id="reg-role"
              name="role"
              className="mockup-input"
              value={formData.role}
              onChange={handleChange}
              style={{ appearance: 'none', backgroundPosition: 'right 16px center' }}
            >
              <option value="student">Student</option>
              <option value="reviewer">Reviewer</option>
            </select>
          </div>

          <div className="mockup-form-group">
            <div className="mockup-label">DEPARTMENT</div>
            <input
              id="reg-dept"
              type="text"
              name="department"
              className="mockup-input"
              placeholder="CS, ECE..."
              value={formData.department}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="mockup-form-group">
          <div className="mockup-label">PASSWORD</div>
          <input
            id="reg-password"
            type="password"
            name="password"
            className="mockup-input"
            placeholder="Min. 6 characters"
            value={formData.password}
            onChange={handleChange}
          />
        </div>

        <div className="mockup-form-group">
          <div className="mockup-label">CONFIRM PASSWORD</div>
          <input
            id="reg-confirm"
            type="password"
            name="confirmPassword"
            className="mockup-input"
            placeholder="Repeat password"
            value={formData.confirmPassword}
            onChange={handleChange}
          />
        </div>

        <button type="submit" className="mockup-btn-black" disabled={loading}>
          {loading ? <span className="loader loader-sm" style={{ margin: 'auto', borderColor: 'transparent', borderTopColor: '#fff' }} /> : 'Create Account'}
        </button>
      </form>

      <div className="mockup-divider">or continue with</div>

      <div className="mockup-oauth-grid">
        <a href={`${API_URL}/auth/google`} className="mockup-oauth-btn">
          <FcGoogle /> Google
        </a>
        <a href={`${API_URL}/auth/github`} className="mockup-oauth-btn">
          <FaGithub style={{ color: '#181717' }} /> GitHub
        </a>
      </div>

      <div className="mockup-footer-text">
        Already have an account? <Link to="/login">Sign in</Link>
      </div>
    </div>
  );
};

export default Register;
