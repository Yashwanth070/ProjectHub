import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { updateUser } = useAuth(); // Assuming we export a way to manually set user/token

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const userStr = params.get('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr));
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Use an internal function from auth context if needed, or simply reload / let the context pick it up on mount
        // Easiest is to redirect to dashboard and let AuthContext loadUser handle token
        window.location.href = '/dashboard'; 
      } catch (err) {
        toast.error('Authentication failed');
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [location, navigate]);

  return (
    <div className="loader-container" style={{ height: '100vh' }}>
      <div className="loader"></div>
      <p style={{ marginTop: '20px', color: 'var(--text-secondary)' }}>Authenticating...</p>
    </div>
  );
};

export default OAuthCallback;
