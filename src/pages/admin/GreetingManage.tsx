import React, { useState, useEffect } from 'react';
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
import axios from 'axios';
import AdminLayout from '@/components/admin/AdminLayout';

// API 기본 URL 설정
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:5001/api';

// 인사말 인터페이스 정의
interface Greeting {
  title: string;    // 제목
  content: string;  // 본문
  author: string;   // 성명
  position: string; // 직위
}

const GreetingManage = () => {
  // 인사말 필드별 상태 관리
  const [greetingData, setGreetingData] = useState<Greeting>({
    title: '',
    content: '',
    author: '',
    position: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, token } = useAdminAuth();
  
  // Admin 인증 체크
  useEffect(() => {
    // 컴포넌트 마운트 시 한 번만 실행
    loadGreeting();
  }, []); // 빈 의존성 배열

  // MongoDB에서 인사말 로드
  const loadGreeting = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_BASE_URL}/greeting`);
      
      if (response.data) {
        // MongoDB에서 가져온 데이터로 상태 업데이트
        setGreetingData({
          title: response.data.title || '',
          content: response.data.content || '',
          author: response.data.author || '',
          position: response.data.position || ''
        });
      }
    } catch (error) {
      console.error('인사말 로드 실패:', error);
      toast({
        title: "인사말 로드 실패",
        description: "인사말을 불러오는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
      
      // API 로드 실패 시 localStorage에서 데이터 로드 시도 (fallback)
      const savedGreeting = localStorage.getItem('greeting-data');
      if (savedGreeting) {
        try {
          const parsedData = JSON.parse(savedGreeting);
          setGreetingData(parsedData);
        } catch (e) {
          console.error('저장된 인사말 데이터 파싱 실패:', e);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 입력 필드 변경 처리 함수
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: keyof Greeting
  ) => {
    setGreetingData({
      ...greetingData,
      [field]: e.target.value
    });
  };

  // 인사말 저장 함수
  const handleSaveGreeting = async () => {
    if (!token) {
      toast({
        title: "인증 오류",
        description: "관리자 인증이 필요합니다. 다시 로그인해주세요.",
        variant: "destructive",
      });
      navigate('/admin/login');
      return;
    }
    
    // 필수 필드 검증
    if (!greetingData.title.trim() || !greetingData.content.trim()) {
      toast({
        title: "입력 오류",
        description: "제목과 본문은 필수 입력 항목입니다.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      await axios.post(`${API_BASE_URL}/greeting`, greetingData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      // localStorage에도 백업으로 저장
      localStorage.setItem('greeting-data', JSON.stringify(greetingData));
      
      toast({
        title: "인사말 저장 성공",
        description: "인사말이 성공적으로 저장되었습니다.",
      });
    } catch (error) {
      console.error('인사말 저장 실패:', error);
      toast({
        title: "인사말 저장 실패",
        description: "인사말을 저장하는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
      
      // 실패해도 localStorage에는 저장
      localStorage.setItem('greeting-data', JSON.stringify(greetingData));
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>로딩 중...</p>
      </div>
    );
  }

  return (
    <AdminLayout>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>인사말 관리</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="greeting-title" className="text-base font-medium">제목</Label>
            <Input
              id="greeting-title"
              value={greetingData.title}
              onChange={(e) => handleInputChange(e, 'title')}
              placeholder="인사말 제목을 입력하세요"
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="greeting-content" className="text-base font-medium">본문</Label>
            <Textarea
              id="greeting-content"
              value={greetingData.content}
              onChange={(e) => handleInputChange(e, 'content')}
              rows={6}
              placeholder="인사말 본문을 입력하세요"
              className="w-full"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="greeting-author" className="text-base font-medium">성명</Label>
              <Input
                id="greeting-author"
                value={greetingData.author}
                onChange={(e) => handleInputChange(e, 'author')}
                placeholder="성명을 입력하세요"
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="greeting-position" className="text-base font-medium">직위</Label>
              <Input
                id="greeting-position"
                value={greetingData.position}
                onChange={(e) => handleInputChange(e, 'position')}
                placeholder="직위를 입력하세요"
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button 
            onClick={handleSaveGreeting} 
            disabled={isLoading || isSaving}
            className="bg-mainBlue hover:bg-blue-900"
          >
            {isSaving ? '저장 중...' : '저장하기'}
          </Button>
        </CardFooter>
      </Card>
    </AdminLayout>
  );
};

export default GreetingManage;
