import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Label } from '@/components/ui/label';
import AdminLayout from '@/components/admin/AdminLayout';
import { apiService } from '@/lib/apiService';
import axios from 'axios';

// API 기본 URL 설정
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:5001/api';

// 인사말 인터페이스 정의
interface Greeting {
  _id?: string;
  title: string;    // 제목
  content: string;  // 본문
  author: string;   // 성명
  position: string; // 직위
  imageUrl?: string; // 이미지 URL
  isActive?: boolean; // 활성화 여부
  createdAt?: string; // 생성일
  updatedAt?: string; // 수정일
}

const GreetingManage = () => {
  // 인사말 필드별 상태 관리
  const [greetingData, setGreetingData] = useState<Greeting>({
    title: '정치리더십과정에 오신 것을 환영합니다',
    content: '',
    author: '',
    position: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchGreetingData();
  }, []);

  // MongoDB에서 인사말 로드
  const fetchGreetingData = async () => {
    setIsLoading(true);
    try {
      console.log('인사말 데이터 로드 시작');
      const data = await apiService.getGreeting();
      console.log('인사말 데이터 로드 완료:', data);
      
      if (data) {
        // MongoDB에서 가져온 데이터로 상태 업데이트
        setGreetingData({
          _id: data._id,
          title: data.title || '',
          content: data.content || '',
          author: data.author || '',
          position: data.position || '',
          imageUrl: data.imageUrl || '',
          isActive: data.isActive !== undefined ? data.isActive : true,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        });
      }
      setError(null);
    } catch (error) {
      console.error('인사말 로드 실패:', error);
      setError('인사말을 불러오는 중 오류가 발생했습니다.');
      toast({
        title: "데이터 로드 실패",
        description: "인사말을 불러오는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
      
      // API 로드 실패 시 localStorage에서 데이터 로드 시도 (fallback)
      const savedGreeting = localStorage.getItem('greeting-data');
      if (savedGreeting) {
        try {
          const parsedData = JSON.parse(savedGreeting);
          setGreetingData(prev => ({
            ...prev,
            ...parsedData
          }));
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
  const handleSave = async () => {
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
      // MongoDB API를 통해 데이터 저장
      let response;
      
      // 항상 로컬에 먼저 백업 (실패해도 데이터 보존)
      localStorage.setItem('greeting-data-backup', JSON.stringify(greetingData));
      
      // 토큰 가져오기 (없으면 빈 문자열 사용)
      const token = localStorage.getItem('token') || '';
      console.log('저장 시도 중... 관리자 API로 요청');
      
      // apiService를 사용하여 인사말 저장
      response = await apiService.updateGreeting(greetingData, token);
      
      // 저장 후 최신 데이터로 업데이트
      setGreetingData(response);
      
      toast({
        title: "저장 완료",
        description: "인사말이 성공적으로 저장되었습니다.",
      });
    } catch (err) {
      console.error('인사말 저장 중 오류가 발생했습니다:', err);
      
      let errorMessage = "인사말 저장 중 오류가 발생했습니다.";
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        errorMessage = "인증 오류가 발생했습니다. 로컬에만 저장되었습니다.";
      }
      
      toast({
        title: "서버 저장 실패",
        description: errorMessage,
        variant: "destructive",
      });
      
      // 백업 데이터 사용
      toast({
        title: "로컬 저장됨",
        description: "로컬 브라우저에 임시 저장되었습니다.",
        variant: "default",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mainBlue"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">인사말 관리</CardTitle>
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
              rows={10}
              placeholder="인사말 본문을 입력하세요"
              className="w-full min-h-[200px]"
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
            onClick={handleSave} 
            disabled={isSaving}
            className="bg-mainBlue hover:bg-blue-700"
          >
            {isSaving ? '저장 중...' : '저장하기'}
          </Button>
        </CardFooter>
      </Card>
    </AdminLayout>
  );
};

export default GreetingManage;
