import React, { useEffect } from 'react'
import { BrowserRouter, Route, Routes, useLocation, Navigate } from 'react-router-dom'
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
import Profile from './pages/Profile'
import { AdminProvider } from './contexts/AdminContext';
import AllPost from './pages/Admin/AllPost';
import AllUsers from './pages/Admin/AllUsers'
import Setting from './pages/Admin/Setting' // Add this import
import AllComment from './pages/Admin/AllComments'
import AllComments from './pages/Admin/AllComments';
import { HelmetProvider } from 'react-helmet-async';
import { generateSitemap } from './utils/getSitemap';

// Protected Route Components
const RequireAuth = ({ children }) => {
  const { user, isAdmin } = useAuth();
  const location = useLocation();

  console.log('RequireAuth - Current user:', user); // Add this
  console.log('RequireAuth - Location:', location.pathname); // Add this
  console.log('RequireAuth - Onboarded status:', user?.onboarded); // Add this

  if (!user && !isAdmin) {
    console.log('RequireAuth - No user/admin, redirecting to login'); // Add this
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user && !user.onboarded && !isAdmin && 
      location.pathname !== '/onboarding' && 
      location.pathname !== '/profile') {
    console.log('RequireAuth - User not onboarded, redirecting to onboarding'); // Add this
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
      <main className={`flex-1 ${showSidebar ? 'ml-0 md:ml-64 mb-8 md:mb-0' : ''}`}>
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
          <Route path="/bookmarks" element={
            <RequireAuth>
              <BookmarkBlogs />
            </RequireAuth>
          } />
          <Route path="/profile" element={
            <RequireAuth>
              <UserProfile />
            </RequireAuth>
          } />
          
          <Route path="/profile/:userId" element={<Profile />} />
          
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
                <Route path="posts" element={<AllPost />} /> {/* Add this line */}
                <Route path="edit-blog/:id" element={<EditBlog />} />
                <Route path="users" element={<AllUsers />} />
                <Route path="settings" element={<Setting />} />
                <Route path='comments' element={<AllComment/>}/>
                <Route path="comments" element={<AllComments />} />
              </Routes>
            </AdminRoute>
          } />


          <Route path="*" element={<ErrorPage />} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AdminProvider>
          <HelmetProvider>
            <AppLayout />
          </HelmetProvider>
        </AdminProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;