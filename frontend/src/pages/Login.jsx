import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaGoogle, FaGithub } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await login(formData.email, formData.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
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

      <h1 className="mockup-title">Welcome Back</h1>
      <p className="mockup-subtitle">Enter your credentials to access your workspace.</p>

      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        <div className="mockup-form-group">
          <div className="mockup-label">EMAIL ADDRESS</div>
          <input
            id="email"
            type="email"
            name="email"
            className="mockup-input"
            placeholder="name@company.com"
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
          />
        </div>

        <div className="mockup-form-group">
          <div className="mockup-label">
            <span>PASSWORD</span>
            <Link to="#" style={{ color: '#171717', textTransform: 'none', fontWeight: 500, letterSpacing: 'normal', textDecoration: 'none' }}>Forgot?</Link>
          </div>
          <input
            id="password"
            type="password"
            name="password"
            className="mockup-input"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            autoComplete="current-password"
          />
        </div>

        <button type="submit" className="mockup-btn-black" disabled={loading}>
          {loading ? <span className="loader loader-sm" style={{ margin: 'auto', borderColor: 'transparent', borderTopColor: '#fff' }} /> : 'Sign In'}
        </button>
      </form>

      <div className="mockup-divider">or continue with</div>

      <div className="mockup-oauth-grid">
        <a href={`${API_URL}/auth/google`} className="mockup-oauth-btn">
          <FaGoogle style={{ color: '#DB4437' }} /> Google
        </a>
        <a href={`${API_URL}/auth/github`} className="mockup-oauth-btn">
          <FaGithub style={{ color: '#181717' }} /> GitHub
        </a>
      </div>

      <div className="mockup-footer-text">
        Don't have an account? <Link to="/register">Get started</Link>
      </div>
    </div>
  );
};

export default Login;
