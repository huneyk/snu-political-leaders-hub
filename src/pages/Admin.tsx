
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Link } from 'react-router-dom';

// 간단한 관리자 인증 확인 훅
const useAdminAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const auth = localStorage.getItem('adminAuth');
      if (auth !== 'true') {
        navigate('/admin/login');
        return;
      }
      setIsAuthenticated(true);
      setIsLoading(false);
    };
    
    checkAuth();
  }, [navigate]);

  return { isAuthenticated, isLoading };
};

const Admin = () => {
  const { isAuthenticated, isLoading } = useAdminAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('content');

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    toast({
      title: "로그아웃",
      description: "관리자 계정에서 로그아웃되었습니다.",
    });
    navigate('/admin/login');
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>로딩 중...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // 인증 확인 중이거나 실패 시 빈 화면 표시
  }

  return (
    <>
      <Header />
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-mainBlue">관리자 대시보드</h1>
          <Button onClick={handleLogout} variant="destructive">로그아웃</Button>
        </div>

        <Tabs defaultValue="content" onValueChange={handleTabChange}>
          <TabsList className="mb-6 w-full overflow-x-auto flex-nowrap">
            <TabsTrigger value="content">콘텐츠 관리</TabsTrigger>
            <TabsTrigger value="users">회원 관리</TabsTrigger>
            <TabsTrigger value="schedule">일정 관리</TabsTrigger>
            <TabsTrigger value="gallery">갤러리 관리</TabsTrigger>
            <TabsTrigger value="notice">공지사항 관리</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>콘텐츠 관리</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500 mb-4">홈페이지의 콘텐츠를 관리합니다.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Link to="/admin/greeting" className="block">
                    <Button 
                      className="h-32 w-full bg-mainBlue hover:bg-blue-900 flex flex-col items-center justify-center gap-2"
                    >
                      <span className="text-lg font-medium">인사말 관리</span>
                      <span className="text-sm opacity-80">인사말 페이지 내용 수정</span>
                    </Button>
                  </Link>
                  <Link to="/admin/recommendations" className="block">
                    <Button 
                      className="h-32 w-full bg-mainBlue hover:bg-blue-900 flex flex-col items-center justify-center gap-2"
                    >
                      <span className="text-lg font-medium">추천의 글 관리</span>
                      <span className="text-sm opacity-80">추천의 글 페이지 내용 수정</span>
                    </Button>
                  </Link>
                  <Link to="/admin/course-goal" className="block">
                    <Button 
                      className="h-32 w-full bg-mainBlue hover:bg-blue-900 flex flex-col items-center justify-center gap-2"
                    >
                      <span className="text-lg font-medium">과정의 목표 관리</span>
                      <span className="text-sm opacity-80">과정 목표 페이지 내용 수정</span>
                    </Button>
                  </Link>
                  <Link to="/admin/course-benefits" className="block">
                    <Button 
                      className="h-32 w-full bg-mainBlue hover:bg-blue-900 flex flex-col items-center justify-center gap-2"
                    >
                      <span className="text-lg font-medium">과정의 특전 관리</span>
                      <span className="text-sm opacity-80">과정 특전 페이지 내용 수정</span>
                    </Button>
                  </Link>
                  <Link to="/admin/professors" className="block">
                    <Button 
                      className="h-32 w-full bg-mainBlue hover:bg-blue-900 flex flex-col items-center justify-center gap-2"
                    >
                      <span className="text-lg font-medium">운영 교수진 관리</span>
                      <span className="text-sm opacity-80">교수진 정보 수정</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>회원 관리</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-gray-500 mb-4">회원 정보를 관리합니다.</p>
                <Link to="/admin/users" className="block">
                  <Button className="w-full h-24 bg-mainBlue hover:bg-blue-900">
                    <span className="text-lg font-medium">회원 목록 보기</span>
                  </Button>
                </Link>
                <div className="mt-4 text-center text-sm text-gray-400">
                  <p>개발 중인 기능입니다.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule">
            <Card>
              <CardHeader>
                <CardTitle>일정 관리</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-gray-500 mb-4">강의 및 행사 일정을 관리합니다.</p>
                <Link to="/admin/schedule" className="block">
                  <Button className="w-full h-24 bg-mainBlue hover:bg-blue-900">
                    <span className="text-lg font-medium">일정 관리하기</span>
                  </Button>
                </Link>
                <div className="mt-4 text-center text-sm text-gray-400">
                  <p>개발 중인 기능입니다.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gallery">
            <Card>
              <CardHeader>
                <CardTitle>갤러리 관리</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-gray-500 mb-4">갤러리 이미지를 관리합니다.</p>
                <Link to="/admin/gallery" className="block">
                  <Button className="w-full h-24 bg-mainBlue hover:bg-blue-900">
                    <span className="text-lg font-medium">갤러리 관리하기</span>
                  </Button>
                </Link>
                <div className="mt-4 text-center text-sm text-gray-400">
                  <p>개발 중인 기능입니다.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notice">
            <Card>
              <CardHeader>
                <CardTitle>공지사항 관리</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-gray-500 mb-4">공지사항을 관리합니다.</p>
                <Link to="/admin/notices" className="block">
                  <Button className="w-full h-24 bg-mainBlue hover:bg-blue-900">
                    <span className="text-lg font-medium">공지사항 관리하기</span>
                  </Button>
                </Link>
                <div className="mt-4 text-center text-sm text-gray-400">
                  <p>개발 중인 기능입니다.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </>
  );
};

export default Admin;
