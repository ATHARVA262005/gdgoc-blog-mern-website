import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const RequireAuth = ({ children }) => {
  const { user, token } = useAuth();
  const location = useLocation();
  const adminToken = localStorage.getItem('adminToken');

  if (!token && !adminToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user?.onboarded && location.pathname !== '/onboarding' && !adminToken) {
    return <Navigate to="/onboarding" state={{ from: location }} replace />;
  }

  return children;
};
