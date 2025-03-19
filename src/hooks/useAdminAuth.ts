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
        
        // 인증 체크 로직을 개선하기 위해 주석 처리하거나 제거
        // 이 부분이 모든 admin 페이지에서 login 페이지로 리디렉션하는 원인
        /*
        if (window.location.pathname.startsWith('/admin') && 
            window.location.pathname !== '/admin/login') {
          navigate('/admin/login');
        }
        */
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
