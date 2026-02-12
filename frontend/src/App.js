import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import Complaints from './pages/Complaints';
import NewComplaint from './pages/NewComplaint';
import ComplaintDetail from './pages/ComplaintDetail';
import MapView from './pages/MapView';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import HelpPage from './pages/HelpPage';
import NotFound from './pages/NotFound';
import './styles/globals.css';

// Redirect from / to dashboard or admin based on role
function IndexRedirect() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'department_officer';
  return <Navigate to={isAdmin ? '/admin' : '/dashboard'} replace />;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

// Wrapper component to handle auth state
function AuthWrapper({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return children;
}

// Protected route component
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Public route component - redirect to dashboard or admin based on role
function PublicRoute({ children }) {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated && user) {
    const isAdmin = user.role === 'admin' || user.role === 'department_officer';
    return <Navigate to={isAdmin ? '/admin' : '/dashboard'} replace />;
  }

  return children;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider queryClient={queryClient}>
          <AuthWrapper>
            <Routes>
              {/* Public routes */}
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                }
              />

              {/* Protected routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<IndexRedirect />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="admin" element={<AdminDashboard />} />
                <Route path="complaints" element={<Complaints />} />
                <Route path="complaints/new" element={<NewComplaint />} />
                <Route path="complaints/:id" element={<ComplaintDetail />} />
                <Route path="map" element={<MapView />} />
                <Route path="profile" element={<Profile />} />
                <Route path="help" element={<HelpPage />} />
              </Route>

              {/* 404 route */}
              <Route path="*" element={<NotFound />} />
            </Routes>

            <Toaster
              position="top-center"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'hsl(var(--background))',
                  color: 'hsl(var(--foreground))',
                  border: '1px solid hsl(var(--border))',
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                },
              }}
            />
          </AuthWrapper>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
