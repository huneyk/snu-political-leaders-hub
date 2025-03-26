import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import axios from 'axios';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:5001/api';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAdminAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    console.log('로그인 시도:', { username });
    console.log('API 엔드포인트:', `${API_BASE_URL}/auth/admin/login`);

    try {
      // API를 통한 실제 로그인 처리
      const requestData = {
        username: username,
        password: password
      };
      
      console.log('요청 데이터:', requestData);
      
      const response = await axios.post(`${API_BASE_URL}/auth/admin/login`, requestData);
      
      console.log('로그인 응답:', response.data);
      
      if (response.data && response.data.token) {
        // 토큰과 인증 상태를 localStorage에 저장
        localStorage.setItem('adminToken', response.data.token);
        localStorage.setItem('adminAuth', 'true');
        
        // useAdminAuth의 login 함수 호출
        login(response.data.token);
        
        toast({
          title: "로그인 성공",
          description: "관리자 대시보드로 이동합니다.",
        });
        navigate('/admin');
      } else {
        console.error('토큰 없음:', response.data);
        toast({
          title: "로그인 실패",
          description: "인증 토큰을 받지 못했습니다.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('로그인 오류:', error);
      console.error('오류 응답:', error.response?.data);
      toast({
        title: "로그인 실패",
        description: error.response?.data?.message || "아이디 또는 비밀번호가 잘못되었습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle className="text-2xl">관리자 로그인</CardTitle>
          <CardDescription>SNU Political Leaders Program</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">아이디</label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">비밀번호</label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full bg-mainBlue hover:bg-blue-900" disabled={isLoading}>
              {isLoading ? '로그인 중...' : '로그인'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default AdminLogin;
