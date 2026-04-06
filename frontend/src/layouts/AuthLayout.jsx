import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineShieldCheck, HiOutlineRefresh, HiOutlineCloud } from 'react-icons/hi';
import { useTheme } from '../context/ThemeContext'; // Assuming ThemeContext exists based on standard app structure

const AuthLayout = () => {
  const location = useLocation();
  const isLogin = location.pathname === '/login' || location.pathname === '/';
  const { theme } = useTheme();

  return (
    <div className="mockup-auth-layout" data-theme={theme}>
      {/* Top Navbar */}
      <nav className="mockup-auth-nav">
        <Link to="/" className="mockup-nav-left">
          ProjectHub
        </Link>
        <div className="mockup-nav-right">
          <Link to="#" className="mockup-nav-link">Support</Link>
          <Link to="#" className="mockup-nav-link">Privacy</Link>
          {isLogin ? (
            <Link to="/register" className="mockup-btn-primary">Sign Up</Link>
          ) : (
            <Link to="/login" className="mockup-btn-primary">Sign In</Link>
          )}
        </div>
      </nav>

      {/* Main Content Area (Card) */}
      <div className="mockup-card-container">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
        >
          <Outlet />
        </motion.div>
      </div>

      {/* Bottom Footer Icons */}
      <div className="mockup-bottom-nav">
        <div className="mockup-bottom-item">
          <HiOutlineShieldCheck />
          <span>Secure Access</span>
        </div>
        <div className="mockup-bottom-item">
          <HiOutlineRefresh />
          <span>Real-Time Sync</span>
        </div>
        <div className="mockup-bottom-item">
          <HiOutlineCloud />
          <span>Encrypted</span>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
