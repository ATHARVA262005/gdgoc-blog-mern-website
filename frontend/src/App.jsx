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

// Protected Route Component
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
  const location = useLocation();
  const isAuthPage = [
    '/login', 
    '/signup', 
    '/forgot-password', 
    '/verify-email', 
    '/reset-password/:token',
    '/onboarding'
  ].includes(location.pathname);

  return (
    <div className="flex">
      {!isAuthPage && <Sidebar />}
      <main className={`flex-1 ${!isAuthPage ? 'ml-64' : ''}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/bookmarks" element={<BookmarkBlogs />} />
          <Route path="/trending" element={<TrendingBlogs />} />
          <Route path="/treasure" element={<TreasureBlogs />} />
          <Route path="/recent" element={<RecentBlogs />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/blog/:id" element={<SingleBlog />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route 
            path="/admin/dashboard" 
            element={
              <AdminRoute>
                <Dashboard />
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/new-blog" 
            element={
              <AdminRoute>
                <NewBlog />
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/edit-blog/:id" 
            element={
              <AdminRoute>
                <EditBlog />
              </AdminRoute>
            } 
          />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;