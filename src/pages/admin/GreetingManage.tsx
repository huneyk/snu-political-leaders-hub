import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AdminNavTabs from '@/components/admin/AdminNavTabs';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { contentService, GreetingContent } from '@/lib/contentService';

const GreetingManage = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [signText, setSignText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAdminAuth();
  
  useEffect(() => {
    // Load content from service
    const greetingData = contentService.getGreetingContent();
    setTitle(greetingData.title);
    setContent(greetingData.content);
    setSignText(greetingData.signText);
  }, []);
  
  const handleSave = () => {
    setIsLoading(true);
    
    // Save content using the service
    const greetingData: GreetingContent = {
      title,
      content,
      signText
    };
    
    contentService.saveGreetingContent(greetingData);
    
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "저장 완료",
        description: "인사말이 성공적으로 저장되었습니다.",
      });
    }, 500);
  };
  
  const handlePreview = () => {
    // Save content and navigate to greeting page
    const greetingData: GreetingContent = {
      title,
      content,
      signText
    };
    
    contentService.saveGreetingContent(greetingData);
    navigate('/intro/greeting');
  };
  
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>로딩 중...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <>
      <Header />
      <div className="container mx-auto py-8 px-4 pt-24">
        <h1 className="text-3xl font-bold text-mainBlue mb-6">관리자 대시보드</h1>
        
        <AdminNavTabs activeTab="content" />
        
        <Card className="w-full">
          <CardHeader>
            <CardTitle>인사말 관리</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">제목</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="인사말 제목을 입력하세요"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">내용</Label>
              <p className="text-sm text-gray-500">문단 구분은 빈 줄(엔터 두 번)로 합니다. 문단 사이에는 자동으로 간격이 추가됩니다.</p>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="인사말 내용을 입력하세요"
                rows={15}
                className="font-sans"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sign">서명</Label>
              <Input
                id="sign"
                value={signText}
                onChange={(e) => setSignText(e.target.value)}
                placeholder="서명을 입력하세요 (예: 정치지도자과정 주임교수 홍길동)"
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button onClick={handlePreview} variant="outline">
              미리보기
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? '저장 중...' : '저장하기'}
            </Button>
          </CardFooter>
        </Card>
      </div>
      <Footer />
    </>
  );
};

export default GreetingManage;
