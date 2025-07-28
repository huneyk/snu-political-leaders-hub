import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { useAdminAuth } from '@/hooks/useAdminAuth';

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
    console.log('API 엔드포인트:', `/api/auth/login`);
    
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
      
      // 응답 텍스트 먼저 받기
      const responseText = await response.text();
      console.log('응답 텍스트:', responseText);
      
      // JSON 파싱 시도
      let responseData;
      try {
        responseData = JSON.parse(responseText);
        console.log('파싱된 응답 데이터:', responseData);
      } catch (parseError) {
        console.error('JSON 파싱 오류:', parseError);
        console.error('응답 텍스트:', responseText);
        throw new Error('서버에서 잘못된 응답을 받았습니다.');
      }
      
      if (response.status === 200 && responseData.token) {
        console.log('로그인 성공');
        
        // 서버에서 받은 실제 토큰 사용
        const token = responseData.token;
        const user = responseData.user;
        
        if (!token) {
          throw new Error('서버에서 토큰을 받지 못했습니다.');
        }
        
        // 관리자 권한 확인
        if (!user.isAdmin && user.role !== 'admin') {
          toast({
            title: "로그인 실패",
            description: "관리자 권한이 없습니다.",
            variant: "destructive",
          });
          return;
        }
        
        // 로컬 스토리지에 저장
        localStorage.setItem('adminToken', token);
        localStorage.setItem('adminAuth', 'true');
        localStorage.setItem('adminUser', JSON.stringify(user));
        
        // 로그인 처리
        login(token);
        
        toast({
          title: "로그인 성공",
          description: responseData.message || "관리자 대시보드로 이동합니다.",
        });
        
        navigate('/admin');
        return;
      }
      
      // 로그인 실패 처리
      console.log('로그인 실패: 상태 코드', response.status);
      
      const errorMessage = responseData?.message || "로그인에 실패했습니다.";
      
      toast({
        title: "로그인 실패",
        description: errorMessage,
        variant: "destructive",
      });
    } catch (error: any) {
      console.error('로그인 오류:', error);
      
      let errorMessage = "서버 연결에 실패했습니다.";
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage = "네트워크 연결을 확인해주세요.";
      }
      
      toast({
        title: "로그인 실패",
        description: errorMessage,
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
                placeholder="admin@snu-plp.ac.kr"
                autoComplete="username"
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
                autoComplete="current-password"
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
