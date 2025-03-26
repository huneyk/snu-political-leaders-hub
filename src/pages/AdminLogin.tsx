import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { useAdminAuth } from '@/hooks/useAdminAuth';

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
    console.log('API 엔드포인트:', `${API_BASE_URL}/auth/login`);
    
    try {
      // API를 통한 실제 로그인 처리
      const requestData = {
        email: username,
        password: password
      };
      
      console.log('요청 데이터:', requestData);
      
      // 프록시 URL 사용 (vite.config.ts에 설정된 프록시 사용)
      const response = await fetch(`/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestData)
      });
      
      console.log('응답 상태:', response.status, response.statusText);
      
      // 간단한 처리: 200 상태 코드면 무조건 로그인 성공으로 처리
      if (response.status === 200) {
        console.log('로그인 성공: 상태 코드 200');
        
        // 임시 토큰 생성
        const tempToken = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // 로컬 스토리지에 저장
        localStorage.setItem('adminToken', tempToken);
        localStorage.setItem('adminAuth', 'true');
        
        // 로그인 처리
        login(tempToken);
        
        toast({
          title: "로그인 성공",
          description: "관리자 대시보드로 이동합니다.",
        });
        
        navigate('/admin');
        return;
      }
      
      // 로그인 실패 처리
      console.log('로그인 실패: 상태 코드', response.status);
      
      let errorMessage = "로그인에 실패했습니다.";
      
      try {
        const errorText = await response.text();
        console.log('오류 응답:', errorText);
        
        if (errorText && errorText.includes('password')) {
          errorMessage = "비밀번호가 일치하지 않습니다.";
        } else if (errorText && errorText.includes('not found')) {
          errorMessage = "계정을 찾을 수 없습니다.";
        }
      } catch (e) {
        console.error('오류 응답 처리 실패:', e);
      }
      
      toast({
        title: "로그인 실패",
        description: errorMessage,
        variant: "destructive",
      });
    } catch (error: any) {
      console.error('로그인 오류:', error);
      
      // fetch API는 네트워크 오류만 catch로 잡힘
      toast({
        title: "로그인 실패",
        description: "서버 연결에 실패했습니다. 네트워크 연결을 확인해주세요.",
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
