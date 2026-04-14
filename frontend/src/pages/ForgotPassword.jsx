import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = enter email, 2 = set new password
  const [email, setEmail] = useState('');
  const [passwords, setPasswords] = useState({ newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      const res = await API.post('/auth/forgot-password', { email });
      if (res.data.success) {
        toast.success('Email verified! Set your new password.');
        setStep(2);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Email not found');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!passwords.newPassword || !passwords.confirmPassword) {
      toast.error('Please fill in both fields');
      return;
    }
    if (passwords.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await API.post('/auth/reset-password', {
        email,
        newPassword: passwords.newPassword
      });
      if (res.data.success) {
        toast.success('Password reset successfully! Please sign in.');
        navigate('/login');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mockup-card">
      <div className="mockup-icon-wrapper">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
      </div>

      {step === 1 ? (
        <>
          <h1 className="mockup-title">Forgot Password</h1>
          <p className="mockup-subtitle">Enter the email address associated with your account.</p>

          <form onSubmit={handleEmailSubmit} style={{ width: '100%' }}>
            <div className="mockup-form-group">
              <div className="mockup-label">EMAIL ADDRESS</div>
              <input
                type="email"
                className="mockup-input"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <button type="submit" className="mockup-btn-black" disabled={loading}>
              {loading ? <span className="loader loader-sm" style={{ margin: 'auto', borderColor: 'transparent', borderTopColor: '#fff' }} /> : 'Verify Email'}
            </button>
          </form>
        </>
      ) : (
        <>
          <h1 className="mockup-title">Reset Password</h1>
          <p className="mockup-subtitle">Create a new password for <strong>{email}</strong></p>

          <form onSubmit={handlePasswordSubmit} style={{ width: '100%' }}>
            <div className="mockup-form-group">
              <div className="mockup-label">NEW PASSWORD</div>
              <input
                type="password"
                className="mockup-input"
                placeholder="Min. 6 characters"
                value={passwords.newPassword}
                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
              />
            </div>

            <div className="mockup-form-group">
              <div className="mockup-label">CONFIRM NEW PASSWORD</div>
              <input
                type="password"
                className="mockup-input"
                placeholder="Repeat new password"
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
              />
            </div>

            <button type="submit" className="mockup-btn-black" disabled={loading}>
              {loading ? <span className="loader loader-sm" style={{ margin: 'auto', borderColor: 'transparent', borderTopColor: '#fff' }} /> : 'Reset Password'}
            </button>
          </form>
        </>
      )}

      <div className="mockup-footer-text">
        Remember your password? <Link to="/login">Sign in</Link>
      </div>
    </div>
  );
};

export default ForgotPassword;
