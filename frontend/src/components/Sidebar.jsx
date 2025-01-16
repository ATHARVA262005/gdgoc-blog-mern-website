import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Bookmark, TrendingUp, Clock, User, Library, LogIn, LayoutDashboard, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const LogoUrl = '/svg/gdgoclogo.svg';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Public navigation items - visible to all users
  const publicNavItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: TrendingUp, label: 'Trending', path: '/trending' },
    { icon: Library, label: 'Treasure', path: '/treasure' },
    { icon: Clock, label: 'Recent', path: '/recent' },
  ];

  // Items only visible when logged in
  const privateNavItems = user ? [
    { icon: Bookmark, label: 'Bookmarks', path: '/bookmarks' },
    ...(user?.isAdmin ? [{
      icon: LayoutDashboard,
      label: 'Dashboard',
      path: '/admin/dashboard'
    }] : [])
  ] : [];

  const navItems = [...publicNavItems, ...privateNavItems];

  return (
    <div className="w-64 h-screen bg-white border-r fixed left-0 top-0">
      <div className="p-4 flex flex-col h-full">
        <img src={LogoUrl} alt="Logo" className="h-12 w-auto mb-6" />
        
        {/* Main Navigation */}
        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                location.pathname === item.path
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-gray-700 hover:bg-blue-50'
              }`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Authentication Links */}
        <div className="mt-auto pt-6 border-t">
          {!user ? (
            <>
              <Link
                to="/login"
                className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-gray-700 hover:bg-blue-50"
              >
                <LogIn size={20} />
                <span>Login</span>
              </Link>
              <Link
                to="/signup"
                className="flex items-center gap-3 px-4 py-3 mt-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                <User size={20} />
                <span>Sign Up</span>
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/profile"
                className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-gray-700 hover:bg-blue-50"
              >
                <User size={20} />
                <span>Profile</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 px-4 py-3 mt-2 rounded-lg transition-colors text-red-600 hover:bg-red-50"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
