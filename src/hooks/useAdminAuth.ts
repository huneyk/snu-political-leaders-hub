import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * A custom hook to handle admin authentication
 */
export const useAdminAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const auth = localStorage.getItem('adminAuth');
      
      if (auth === 'true') {
        setIsAuthenticated(true);
      } else {
        // Only navigate if we're on an admin page that's not the login page
        if (window.location.pathname.startsWith('/admin') && 
            window.location.pathname !== '/admin/login') {
          navigate('/admin/login');
        }
      }
      
      setIsLoading(false);
    };
    
    checkAuth();
  }, [navigate]);

  return { isAuthenticated, isLoading };
};
