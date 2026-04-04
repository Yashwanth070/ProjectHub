import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Layouts
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import SubmitProject from './pages/SubmitProject';
import ProjectDetail from './pages/ProjectDetail';
import Reviews from './pages/Reviews';
import Profile from './pages/Profile';
import AdminPanel from './pages/AdminPanel';
import OAuthCallback from './pages/OAuthCallback';

// Protected Route wrapper
const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div className="loader" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" />;

  return children;
};

// Guest Route — redirect if already logged in
const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div className="loader" />
      </div>
    );
  }

  if (user) return <Navigate to="/dashboard" />;

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route element={<GuestRoute><AuthLayout /></GuestRoute>}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* OAuth callback doesn't need layout, just process and redirect */}
      <Route path="/oauth/callback" element={<OAuthCallback />} />

      {/* Dashboard Routes */}
      <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/projects" element={<Projects />} />
        <Route
          path="/projects/new"
          element={
            <ProtectedRoute roles={['student', 'admin']}>
              <SubmitProject />
            </ProtectedRoute>
          }
        />
        <Route path="/projects/:id" element={<ProjectDetail />} />
        <Route
          path="/reviews"
          element={
            <ProtectedRoute roles={['reviewer', 'admin']}>
              <Reviews />
            </ProtectedRoute>
          }
        />
        <Route path="/profile" element={<Profile />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminPanel />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                fontFamily: 'Inter, sans-serif'
              },
              success: {
                iconTheme: { primary: 'var(--status-approved)', secondary: 'var(--bg-card)' }
              },
              error: {
                iconTheme: { primary: 'var(--status-rejected)', secondary: 'var(--bg-card)' }
              }
            }}
          />
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
