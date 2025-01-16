import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const RequireAuth = ({ children }) => {
  const { user, token } = useAuth();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user?.onboarded && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" state={{ from: location }} replace />;
  }

  return children;
};
