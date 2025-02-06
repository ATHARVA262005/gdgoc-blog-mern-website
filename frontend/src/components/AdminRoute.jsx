import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAdmin } from '../contexts/AdminContext';

const AdminRoute = ({ children }) => {
  const { isAdmin } = useAuth();
  const { adminToken } = useAdmin();
  const location = useLocation();

  // Add debug logging
  console.log('Admin route check:', { isAdmin, hasToken: !!adminToken });

  if (!isAdmin || !adminToken) {
    console.log('Redirecting to admin login');
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
};

export default AdminRoute;
