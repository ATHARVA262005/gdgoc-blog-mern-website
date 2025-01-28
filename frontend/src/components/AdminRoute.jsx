import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAdmin } from '../contexts/AdminContext';

const AdminRoute = ({ children }) => {
  const { isAdmin } = useAuth();
  const { adminToken } = useAdmin();
  const location = useLocation();

  if (!isAdmin || !adminToken) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
};

export default AdminRoute;
