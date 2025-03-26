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
      console.log('응답 헤더:', Object.fromEntries([...response.headers.entries()]));
      
      // 빈 응답이라도 상태 코드가 200이면 성공으로 간주
      if (response.status === 200) {
        console.log('로그인 성공 (상태 코드 200)');
        
        // 응답 데이터 파싱 시도
        let responseData;
        const contentType = response.headers.get('content-type');
        console.log('Content-Type:', contentType);
        
        // 응답에 내용이 있는 경우 파싱 시도
        try {
          const text = await response.text();
          console.log('응답 텍스트:', text ? text : '(빈 응답)');
          
          if (text && text.trim()) {
            responseData = JSON.parse(text);
          } else {
            // 빈 응답이면 기본 응답 객체 생성
            responseData = { success: true };
          }
        } catch (e) {
          console.error('응답 처리 오류:', e);
          responseData = { success: true }; // 파싱 오류가 있어도 200 응답은 성공으로 처리
        }
        
        console.log('로그인 응답 (파싱 후):', responseData);
        
        // 헤더에서 토큰을 찾거나 임시 토큰 생성
        const authHeader = response.headers.get('authorization') || '';
        const tokenFromHeader = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : '';
        
        // 사용할 토큰: 응답 본문의 토큰 > 헤더의 토큰 > 생성된 임시 토큰
        const token = responseData.token || tokenFromHeader || `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        console.log('사용할 토큰:', token);
        
        // 토큰과 인증 상태를 localStorage에 저장
        localStorage.setItem('adminToken', token);
        localStorage.setItem('adminAuth', 'true');
        
        // useAdminAuth의 login 함수 호출
        login(token);
        
        toast({
          title: "로그인 성공",
          description: "관리자 대시보드로 이동합니다.",
        });
        navigate('/admin');
        return; // 여기서 함수 종료
      }
      
      // 상태 코드가 200이 아닌 경우 기존 처리 로직 수행
      // 응답 데이터 파싱
      let responseData;
      const contentType = response.headers.get('content-type');
      console.log('Content-Type:', contentType);
      
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        const text = await response.text();
        console.log('응답 텍스트:', text.substring(0, 500)); // 처음 500자만 출력
        try {
          responseData = JSON.parse(text);
        } catch (e) {
          console.error('JSON 파싱 오류:', e);
          responseData = { error: 'Invalid JSON response', text: text.substring(0, 100) };
        }
      }
      
      console.log('로그인 응답:', responseData);
      
      if (responseData && responseData.token) {
        // 토큰과 인증 상태를 localStorage에 저장
        localStorage.setItem('adminToken', responseData.token);
        localStorage.setItem('adminAuth', 'true');
        
        // useAdminAuth의 login 함수 호출
        login(responseData.token);
        
        toast({
          title: "로그인 성공",
          description: "관리자 대시보드로 이동합니다.",
        });
        navigate('/admin');
      } else {
        console.error('토큰 없음:', responseData);
        toast({
          title: "로그인 실패",
          description: "인증 토큰을 받지 못했습니다.",
          variant: "destructive",
        });
      }
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
