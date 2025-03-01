
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';

const GreetingManage = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [signText, setSignText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    // 로컬 스토리지에서 기존 데이터 로드
    const savedTitle = localStorage.getItem('greeting-title');
    const savedContent = localStorage.getItem('greeting-content');
    const savedSignText = localStorage.getItem('greeting-sign');
    
    if (savedTitle) setTitle(savedTitle);
    if (savedContent) setContent(savedContent);
    if (savedSignText) setSignText(savedSignText);
    else setSignText('정치지도자과정 주임교수 김상배'); // 기본값 설정
  }, []);
  
  const handleSave = () => {
    setIsLoading(true);
    
    // 로컬 스토리지에 저장
    localStorage.setItem('greeting-title', title);
    localStorage.setItem('greeting-content', content);
    localStorage.setItem('greeting-sign', signText);
    
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "저장 완료",
        description: "인사말이 성공적으로 저장되었습니다.",
      });
    }, 500);
  };
  
  const handlePreview = () => {
    // 내용을 저장하고 인사말 페이지로 이동
    localStorage.setItem('greeting-title', title);
    localStorage.setItem('greeting-content', content);
    localStorage.setItem('greeting-sign', signText);
    
    navigate('/intro/greeting');
  };
  
  return (
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
          <p className="text-sm text-gray-500">문단 구분은 빈 줄(엔터 두 번)로 합니다.</p>
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
  );
};

export default GreetingManage;
