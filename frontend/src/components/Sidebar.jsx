import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Bookmark, 
  TrendingUp, 
  Clock, 
  User, 
  Library, 
  LogIn, 
  LayoutDashboard, 
  LogOut,
  PenTool,
  Users,
  Settings,
  FileText,
  BookOpen,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useAdmin } from '../contexts/AdminContext';

const LogoUrl = new URL('/svg/gdgoclogo.svg', import.meta.url).href;

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, logout, isAuthenticated } = useAuth();
  const { handleLogout } = useAdmin(); // Only need handleLogout from AdminContext

  // Admin specific navigation items
  const adminNavItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: PenTool, label: 'New Blog', path: '/admin/new-blog' },
    { icon: FileText, label: 'All Posts', path: '/admin/posts' },
    { icon: Users, label: 'Users', path: '/admin/users' },
    { icon: MessageSquare, label: 'All Comments', path: '/admin/comments' }, // Add this line
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
  ];

  // Regular user navigation items
  const userNavItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: TrendingUp, label: 'Trending', path: '/trending' },
    { icon: Library, label: 'Treasure', path: '/treasure' },
    { icon: Clock, label: 'Recent', path: '/recent' },
  ];

  // Items only visible when logged in as regular user
  const authenticatedUserItems = [
    { icon: Bookmark, label: 'Bookmarks', path: '/bookmarks' },
    { icon: User, label: 'Profile', path: '/profile' }
  ];

  // Determine which nav items to show based on user role
  const navItems = isAdmin ? adminNavItems : [
    ...userNavItems,
    ...(isAuthenticated ? authenticatedUserItems : [])
  ];

  const handleLogoutClick = async () => {
    try {
      if (isAdmin) {
        await handleLogout(); // Use handleLogout from AdminContext
        logout(); // Use regular logout from AuthContext
        navigate('/admin/login');
      } else {
        await logout();
        navigate('/login');
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 h-screen bg-white border-r fixed left-0 top-0 z-40">
        <div className="p-4 flex flex-col h-full">
          <div className="flex items-center flex-col gap-3 mb-6">
            <img src={LogoUrl} alt="Logo" className="h-8 w-auto" />
            {isAdmin && <span className="text-sm font-semibold text-blue-600">Admin Panel</span>}
          </div>
          
          {/* Main Navigation */}
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                  location.pathname === item.path
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* View Site Link for Admins */}
          {isAdmin && (
            <Link
              to="/"
              className="mt-4 flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg"
            >
              <BookOpen size={20} />
              <span>View Site</span>
            </Link>
          )}

          {/* Authentication Section */}
          <div className="mt-auto pt-6 border-t">
            {!isAuthenticated && !isAdmin ? (
              <>
                <Link
                  to="/login"
                  className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  <LogIn size={20} />
                  <span>Login</span>
                </Link>
              </>
            ) : (
              <button
                onClick={handleLogoutClick}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-lg"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-50">
        <nav className="flex justify-around items-center h-16">
          {(isAdmin ? adminNavItems : userNavItems).slice(0, 4).map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 py-1 ${
                location.pathname === item.path
                  ? 'text-blue-600'
                  : 'text-gray-700'
              }`}
            >
              <item.icon size={20} />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          ))}
          {/* Mobile More Menu Button */}
          {isAdmin ? (
            <button
              onClick={handleLogoutClick}
              className="flex flex-col items-center justify-center flex-1 py-1 text-gray-700"
            >
              <LogOut size={20} />
              <span className="text-xs mt-1">Logout</span>
            </button>
          ) : (
            <Link
              to="/profile"
              className={`flex flex-col items-center justify-center flex-1 py-1 ${
                location.pathname === '/profile'
                  ? 'text-blue-600'
                  : 'text-gray-700'
              }`}
            >
              <User size={20} />
              <span className="text-xs mt-1">Profile</span>
            </Link>
          )}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
