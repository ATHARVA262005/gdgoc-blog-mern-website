import React from 'react'
import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Sidebar from './components/Sidebar'
import BookmarkBlogs from './pages/BookmarkBlogs'
import TrendingBlogs from './pages/TrendingBlogs'
import RecentBlogs from './pages/RecentBlogs'
import TreasureBlogs from './pages/TreasureBlogs'
import UserProfile from './pages/UserProfile'
import SingleBlog from './pages/SingleBlog'
import Login from './pages/Authentication/Login'
import Signup from './pages/Authentication/Signup'
import ForgotPassword from './pages/Authentication/ForgotPassword';
import VerifyEmail from './pages/Authentication/VerifyEmail';
import ResetPassword from './pages/Authentication/ResetPassword';
import Onboarding from './pages/Authentication/Onboarding';
import Dashboard from './pages/Admin/Dashboard';
import NewBlog from './pages/Admin/NewBlog';
import EditBlog from './pages/Admin/EditBlog';
import ErrorPage from './pages/ErrorPage'
import { AuthProvider, useAuth } from './contexts/AuthContext';
import PublicRoute from './components/PublicRoute';
import AdminLogin from './pages/Admin/AdminLogin';
import AdminSignup from './pages/Admin/AdminSignup';

// Protected Route Components
const RequireAuth = ({ children }) => {
  const { user, isAdmin } = useAuth();
  const location = useLocation();

  // Allow access if user is logged in OR is admin
  if (!user && !isAdmin) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Only check onboarding for regular users, not admins
  if (user && !user.onboarded && !isAdmin && 
      location.pathname !== '/onboarding' && 
      location.pathname !== '/profile') {
    return <Navigate to="/onboarding" state={{ from: location }} replace />;
  }

  return children;
};

const AdminRoute = ({ children }) => {
  const { isAdmin } = useAuth();
  const location = useLocation();

  if (!isAdmin) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
};

// Wrapper component to handle sidebar visibility
const AppLayout = () => {
  const { user, isAdmin } = useAuth();
  const location = useLocation();
  
  const isAuthPage = [
    '/login', 
    '/signup', 
    '/forgot-password', 
    '/verify-email', 
    '/reset-password',
    '/onboarding',
    '/admin/login',
    '/admin/signup'
  ].includes(location.pathname);

  // Show sidebar on all pages except auth pages
  const showSidebar = !isAuthPage;
  

  return (
    <div className="flex">
      {showSidebar && <Sidebar />}
      <main className={`flex-1 ${showSidebar ? 'ml-64' : ''}`}>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path="/signup" element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          } />
          <Route path="/forgot-password" element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          } />
          <Route path="/reset-password" element={
            <PublicRoute>
              <ResetPassword />
            </PublicRoute>
          } />

          {/* Special Routes */}
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/onboarding" element={<RequireAuth><Onboarding /></RequireAuth>} />
          
          {/* Public Routes - No login required */}
          <Route path="/" element={<Home />} />
          <Route path="/trending" element={<TrendingBlogs />} />
          <Route path="/treasure" element={<TreasureBlogs />} />
          <Route path="/recent" element={<RecentBlogs />} />
          <Route path="/blog/:id" element={<SingleBlog />} />
          
          {/* Protected Routes - require login */}
          <Route path="/bookmarks" element={<RequireAuth><BookmarkBlogs /></RequireAuth>} />
          <Route path="/profile" element={<RequireAuth><UserProfile /></RequireAuth>} />
          <Route path="/profile/:userId" element={<UserProfile />} />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={
            <PublicRoute>
              <AdminLogin />
            </PublicRoute>
          } />
          <Route path="/admin/signup" element={
            <PublicRoute>
              <AdminSignup />
            </PublicRoute>
          } />
          
          {/* Protected Admin Routes */}
          <Route path="/admin/*" element={
            <AdminRoute>
              <Routes>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="new-blog" element={<NewBlog />} />
                <Route path="edit-blog/:id" element={<EditBlog />} />
              </Routes>
            </AdminRoute>
          } />

          {/* Protected User Routes - accessible by both users and admins */}
          <Route path="/bookmarks" element={<RequireAuth><BookmarkBlogs /></RequireAuth>} />
          <Route path="/profile" element={<RequireAuth><UserProfile /></RequireAuth>} />

          <Route path="*" element={<ErrorPage />} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </Router>
  );
}

export default App;