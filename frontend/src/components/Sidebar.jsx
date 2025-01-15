import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Bookmark, TrendingUp, Clock, User, Library, LogIn, LayoutDashboard } from 'lucide-react';
const LogoUrl = '/svg/gdgoclogo.svg';

const Sidebar = () => {
  const location = useLocation();
  
  // This should come from your auth context/state management
  const user = {
    isAdmin: true, // Replace with actual user role check
    isAuthenticated: false // Replace with actual auth check
  };

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: TrendingUp, label: 'Trending', path: '/trending' },
    { icon: Library, label: 'Treasure', path: '/treasure' },
    { icon: Clock, label: 'Recent', path: '/recent' },
    { icon: Bookmark, label: 'Bookmarks', path: '/bookmarks' },
    { icon: User, label: 'Profile', path: '/profile' },
    // Add dashboard only for admin users
    ...(user.isAdmin ? [{
      icon: LayoutDashboard,
      label: 'Dashboard',
      path: '/admin/dashboard'
    }] : [])
  ];

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
          {!user.isAuthenticated ? (
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
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
