import { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getInitials } from '../utils/helpers';
import {
  HiOutlineHome,
  HiOutlineFolder,
  HiOutlinePlusCircle,
  HiOutlineStar,
  HiOutlineUser,
  HiOutlineLogout,
  HiOutlineMenu,
  HiOutlineX,
  HiOutlineCog,
  HiOutlineSun,
  HiOutlineMoon
} from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Dashboard';
    if (path === '/projects') return 'Projects';
    if (path === '/projects/new') return 'Submit Project';
    if (path.startsWith('/projects/')) return 'Project Details';
    if (path === '/reviews') return 'Reviews';
    if (path === '/profile') return 'Profile';
    if (path === '/admin') return 'Admin Panel';
    return 'Dashboard';
  };

  const studentLinks = [
    { to: '/dashboard', icon: HiOutlineHome, label: 'Dashboard' },
    { to: '/projects', icon: HiOutlineFolder, label: 'My Projects' },
    { to: '/projects/new', icon: HiOutlinePlusCircle, label: 'Submit Project' },
    { to: '/profile', icon: HiOutlineUser, label: 'Profile' },
  ];

  const reviewerLinks = [
    { to: '/dashboard', icon: HiOutlineHome, label: 'Dashboard' },
    { to: '/projects', icon: HiOutlineFolder, label: 'Projects' },
    { to: '/reviews', icon: HiOutlineStar, label: 'My Reviews' },
    { to: '/profile', icon: HiOutlineUser, label: 'Profile' },
  ];

  const adminLinks = [
    { to: '/dashboard', icon: HiOutlineHome, label: 'Dashboard' },
    { to: '/projects', icon: HiOutlineFolder, label: 'All Projects' },
    { to: '/reviews', icon: HiOutlineStar, label: 'Reviews' },
    { to: '/admin', icon: HiOutlineCog, label: 'Admin Panel' },
    { to: '/profile', icon: HiOutlineUser, label: 'Profile' },
  ];

  const getLinks = () => {
    if (user?.role === 'admin') return adminLinks;
    if (user?.role === 'reviewer') return reviewerLinks;
    return studentLinks;
  };

  return (
    <div className="dashboard-layout">
      {/* Mobile overlay */}
      <div
        className={`mobile-overlay ${sidebarOpen ? 'visible' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header" style={{ cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
          <div className="mockup-icon-wrapper" style={{ width: 32, height: 32, marginBottom: 0, borderRadius: 8, fontSize: '1rem', marginRight: 12 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3v4"></path>
              <path d="M12 7l-4 14"></path>
              <path d="M12 7l4 14"></path>
              <path d="M9 13h6"></path>
              <path d="M12 3a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"></path>
            </svg>
          </div>
          <span className="sidebar-logo-text">ProjectHub</span>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-title">Menu</div>
          {getLinks().map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
              end={link.to === '/dashboard'}
            >
              <link.icon className="icon" />
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user" onClick={() => navigate('/profile')}>
            <div className="user-avatar">{getInitials(user?.name)}</div>
            <div className="user-info">
              <div className="user-name">{user?.name}</div>
              <div className="user-role">{user?.role}</div>
            </div>
          </div>
          <button className="btn btn-ghost" onClick={handleLogout} style={{ width: '100%', marginTop: '8px', justifyContent: 'flex-start', gap: '12px' }}>
            <HiOutlineLogout />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        {/* Navbar */}
        <header className="navbar">
          <div className="navbar-left">
            <button className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <HiOutlineX /> : <HiOutlineMenu />}
            </button>
            <div className="navbar-breadcrumb">
              <span>{getPageTitle()}</span>
            </div>
          </div>
          <div className="navbar-right">
            <button className="navbar-icon-btn" onClick={toggleTheme} title="Toggle Theme">
              {theme === 'light' ? <HiOutlineMoon /> : <HiOutlineSun />}
            </button>
            <span className={`badge badge-role badge-${user?.role}`}>
              {user?.role}
            </span>
            <div
              className="user-avatar"
              style={{ cursor: 'pointer' }}
              onClick={() => navigate('/profile')}
            >
              {getInitials(user?.name)}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="page-body">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
