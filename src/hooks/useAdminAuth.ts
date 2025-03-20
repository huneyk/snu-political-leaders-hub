import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * A custom hook to handle admin authentication
 */
export const useAdminAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const auth = localStorage.getItem('adminAuth');
      const storedToken = localStorage.getItem('adminToken');
      
      if (auth === 'true' && storedToken) {
        setIsAuthenticated(true);
        setToken(storedToken);
      } else {
        setIsAuthenticated(false);
        setToken(null);
        
        // admin 페이지에서 로그인 페이지가 아닌 경우에만 리디렉션
        if (window.location.pathname.startsWith('/admin') && 
            window.location.pathname !== '/admin/login') {
          navigate('/admin/login');
        }
      }
      
      setIsLoading(false);
    };
    
    checkAuth();
  }, [navigate]);

  // 토큰 설정 함수
  const setAuthToken = (newToken: string) => {
    localStorage.setItem('adminToken', newToken);
    setToken(newToken);
  };

  // 로그인 함수
  const login = (newToken: string) => {
    localStorage.setItem('adminAuth', 'true');
    setAuthToken(newToken);
    setIsAuthenticated(true);
  };

  // 로그아웃 함수
  const logout = () => {
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('adminToken');
    setToken(null);
    setIsAuthenticated(false);
    navigate('/admin/login');
  };

  return { isAuthenticated, isLoading, token, login, logout };
};
