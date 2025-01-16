import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Updated import path

// Named export for the component
export const PublicRoute = ({ children }) => {
    const { user } = useAuth();
    
    // If user is authenticated and tries to access auth pages, redirect to home
    if (user && user.id) {
        return <Navigate to="/" replace />;
    }

    // Allow access to auth pages if user is not authenticated
    return children;
};

// Also add default export
export default PublicRoute;
