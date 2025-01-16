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

// Protected Route Components
const RequireAuth = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect to onboarding if not completed
  if (!user.onboarded && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" state={{ from: location }} replace />;
  }

  return children;
};

const AdminRoute = ({ children }) => {
  // Replace with your actual auth logic
  const user = {
    isAdmin: true // This should come from your auth context/state
  };

  if (!user.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Wrapper component to handle sidebar visibility
const AppLayout = () => {
  const { user } = useAuth();
  const location = useLocation();
  const isAuthPage = [
    '/login', 
    '/signup', 
    '/forgot-password', 
    '/verify-email', 
    '/reset-password',
    '/onboarding'
  ].includes(location.pathname);

  // Show sidebar on all pages except auth pages
  const showSidebar = !isAuthPage;

  return (
    <div className="flex">
      {showSidebar && <Sidebar />}
      <main className={`flex-1 ${showSidebar ? 'ml-64' : ''}`}>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
          <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
          <Route path="/verify-email" element={<VerifyEmail />} />

          {/* Public Content Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/trending" element={<TrendingBlogs />} />
          <Route path="/treasure" element={<TreasureBlogs />} />
          <Route path="/recent" element={<RecentBlogs />} />
          <Route path="/blog/:id" element={<SingleBlog />} />

          {/* Protected Routes - require login */}
          <Route path="/bookmarks" element={<RequireAuth><BookmarkBlogs /></RequireAuth>} />
          <Route path="/profile" element={<RequireAuth><UserProfile /></RequireAuth>} />
          <Route path="/onboarding" element={<RequireAuth><Onboarding /></RequireAuth>} />
          <Route path="/admin/*" element={<RequireAuth><AdminRoute>...</AdminRoute></RequireAuth>} />
          
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