import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AdminNavTabs from '@/components/admin/AdminNavTabs';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useNavigate } from 'react-router-dom';
import AdminHomeButton from '@/components/admin/AdminHomeButton';
import { LoadingModal } from '@/components/admin/LoadingModal';
import axios from 'axios';
import AdminLayout from '@/components/admin/AdminLayout';
import { apiService } from '@/lib/apiService';

// apiService에서 사용하는 동일한 기본 URL 사용
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://snu-plp-hub-server.onrender.com/api'
  : 'http://localhost:5001/api';

interface Recommendation {
  _id?: string;
  sectionTitle?: string; // 섹션 제목 필드 추가
  title?: string;        // 추천의 글 제목 필드 추가
  name: string;          // MongoDB 스키마에서는 'name'
  content: string;       // MongoDB 스키마에서는 'content'
  position: string;
  imageUrl: string;      // MongoDB 스키마에서는 'imageUrl'
  order?: number;
  isActive?: boolean;
}

// 프론트엔드 형식을 MongoDB 형식으로 변환
const convertToDbFormat = (rec: any, sectionTitle: string): Recommendation => {
  return {
    _id: rec._id || undefined,
    sectionTitle: sectionTitle,
    title: rec.title || '',
    name: rec.author || rec.name || '',
    content: rec.text || rec.content || '',
    position: rec.position || '',
    imageUrl: rec.photoUrl || rec.imageUrl || '',
    order: rec.order || 0,
    isActive: rec.isActive !== undefined ? rec.isActive : true
  };
};

// MongoDB 형식을 프론트엔드 형식으로 변환
const convertToFrontendFormat = (rec: Recommendation) => {
  return {
    _id: rec._id,
    title: rec.title || '',  // MongoDB에서 title 필드 추가
    text: rec.content,
    author: rec.name,
    position: rec.position,
    photoUrl: rec.imageUrl,
    order: rec.order,
    isActive: rec.isActive
  };
};

const RecommendationsManage = () => {
  const [sectionTitle, setSectionTitle] = useState('추천의 글');
  const [recommendations, setRecommendations] = useState<any[]>([
    {_id: '', title: '', text: '', author: '', position: '', photoUrl: ''}
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, token } = useAdminAuth();
  const navigate = useNavigate();
  
  // 컴포넌트 마운트 시 한 번만 실행
  useEffect(() => {
    if (isAuthenticated && token) {
      loadRecommendations();
    } else if (!isLoading && !isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, token]);
  
  // MongoDB에서 추천의 글 로드
  const loadRecommendations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // apiService 사용 (더 좋은 방법)
      const data = await apiService.getRecommendations();
      
      if (data && Array.isArray(data)) {
        // MongoDB 형식을 프론트엔드 형식으로 변환
        const frontendData = data.map(convertToFrontendFormat);
        
        // 데이터가 있는 경우 설정
        if (frontendData.length > 0) {
          setRecommendations(frontendData);
          
          // 첫 번째 항목에서 섹션 제목 가져오기
          if (data[0] && data[0].sectionTitle) {
            setSectionTitle(data[0].sectionTitle);
          }
        } else {
          // 데이터가 없는 경우 기본 빈 항목 하나 설정
          setRecommendations([{_id: '', title: '', text: '', author: '', position: '', photoUrl: ''}]);
        }
        
        // 성공 메시지 표시
        toast({
          title: "데이터 로드 성공",
          description: "추천의 글 데이터를 성공적으로 불러왔습니다.",
        });
      }
    } catch (error) {
      console.error('추천의 글 로드 실패:', error);
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
      
      toast({
        title: "추천의 글 로드 실패",
        description: "추천의 글을 불러오는 중 오류가 발생했습니다. 대체 데이터를 로드합니다.",
        variant: "destructive",
      });
      
      // API 로드 실패 시 localStorage에서 데이터 로드 시도 (fallback)
      loadFromLocalStorage();
    } finally {
      setIsLoading(false);
    }
  };
  
  // localStorage에서 데이터 로드 (fallback)
  const loadFromLocalStorage = () => {
    const savedTitle = localStorage.getItem('recommendations-title');
    const savedRecommendations = localStorage.getItem('recommendations');
    
    if (savedTitle) {
      setSectionTitle(savedTitle);
    }
    
    if (savedRecommendations) {
      try {
        const parsedRecommendations = JSON.parse(savedRecommendations);
        // Handle existing data without title or photoUrl
        const updatedRecommendations = parsedRecommendations.map((rec: any) => ({
          _id: rec._id || '',
          title: rec.title || '',
          text: rec.text || '',
          author: rec.author || '',
          position: rec.position || '',
          photoUrl: rec.photoUrl || ''
        }));
        setRecommendations(updatedRecommendations);
        
        toast({
          title: "로컬 데이터 로드 성공",
          description: "localStorage에서 추천의 글 데이터를 불러왔습니다.",
        });
      } catch (error) {
        console.error('Failed to parse recommendations from localStorage:', error);
        toast({
          title: "데이터 파싱 오류",
          description: "저장된 추천의 글을 처리하는 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      }
    } else {
      // localStorage에도 데이터가 없는 경우 기본 빈 항목 하나 설정
      setRecommendations([{_id: '', title: '', text: '', author: '', position: '', photoUrl: ''}]);
    }
  };
  
  const handleRecommendationChange = (
    index: number, 
    field: string, 
    value: string
  ) => {
    const newRecommendations = [...recommendations];
    newRecommendations[index] = {
      ...newRecommendations[index],
      [field]: value
    };
    setRecommendations(newRecommendations);
  };
  
  const addRecommendation = () => {
    setRecommendations([...recommendations, {_id: '', title: '', text: '', author: '', position: '', photoUrl: ''}]);
  };
  
  const removeRecommendation = (index: number) => {
    if (recommendations.length <= 1) return;
    const newRecommendations = recommendations.filter((_, i) => i !== index);
    setRecommendations(newRecommendations);
  };
  
  // MongoDB에 추천의 글 저장
  const handleSave = async () => {
    // 유효성 검사 (유지)
    const invalidRecommendations = recommendations.filter(rec => 
      !rec.author?.trim() || !rec.text?.trim() || !rec.position?.trim()
    );
    
    if (invalidRecommendations.length > 0) {
      toast({
        title: "입력 오류",
        description: "모든 추천의 글에 작성자, 내용, 직위/소속을 입력해야 합니다.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSaving(true);
    console.log('저장 시도 중... 토큰 인증 우회 (테스트용)');
    
    try {
      // MongoDB에 저장할 추천 목록 필터링 (빈 항목 제외)
      const validRecommendations = recommendations.filter(rec => 
        rec.author?.trim() && rec.text?.trim() && rec.position?.trim()
      );
      
      // 1. 기존 데이터 불러오기
      const existingRecommendations = await apiService.getRecommendations();
      
      // 2. 기존 데이터 삭제 (토큰 전달)
      if (existingRecommendations && Array.isArray(existingRecommendations)) {
        for (const rec of existingRecommendations) {
          if (rec._id) {
            await apiService.deleteRecommendation(rec._id, token || undefined);
          }
        }
      }
      
      // 3. 새 데이터 저장 (토큰 전달)
      const savedItems = [];
      for (let i = 0; i < validRecommendations.length; i++) {
        const rec = validRecommendations[i];
        
        // 프론트엔드 형식을 MongoDB 형식으로 변환
        const dbItem = convertToDbFormat({
          _id: rec._id || undefined,
          author: rec.author,
          title: rec.title,
          text: rec.text,
          position: rec.position,
          photoUrl: rec.photoUrl,
          order: i
        }, sectionTitle);
        
        const savedItem = await apiService.createRecommendation(dbItem, token || undefined);
        savedItems.push(savedItem);
      }
      
      // localStorage에도 백업으로 저장
      localStorage.setItem('recommendations-title', sectionTitle);
      localStorage.setItem('recommendations', JSON.stringify(validRecommendations));
      
      toast({
        title: "저장 완료",
        description: `${savedItems.length}개의 추천의 글이 성공적으로 저장되었습니다.`,
      });
      
      // 저장 후 새로운 데이터로 업데이트
      loadRecommendations();
    } catch (error) {
      console.error('추천의 글 저장 실패:', error);
      toast({
        title: "저장 실패",
        description: "추천의 글을 MongoDB에 저장하는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
      
      // 실패해도 localStorage에는 저장
      const validRecommendations = recommendations.filter(rec => 
        rec.author?.trim() && rec.text?.trim() && rec.position?.trim()
      );
      localStorage.setItem('recommendations-title', sectionTitle);
      localStorage.setItem('recommendations', JSON.stringify(validRecommendations));
      
      toast({
        title: "로컬 저장 완료",
        description: "추천의 글이 로컬 스토리지에 백업되었습니다.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // 이미지 파일 업로드 처리
  const handleFileUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // 파일 크기 제한 (5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast({
        title: "파일 크기 초과",
        description: "이미지 크기는 5MB 이하여야 합니다.",
        variant: "destructive",
      });
      return;
    }

    // 이미지 파일 타입 확인
    if (!file.type.startsWith('image/')) {
      toast({
        title: "잘못된 파일 형식",
        description: "이미지 파일만 업로드할 수 있습니다.",
        variant: "destructive",
      });
      return;
    }

    // 이미지 리사이징 및 Base64 변환
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // 리사이징을 위한 캔버스 생성
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // 이미지 크기 조정 (최대 크기: 800x800)
        const maxWidth = 800;
        const maxHeight = 800;
        
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // 이미지 그리기
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          
          // 압축 및 Base64 변환 (JPEG 포맷, 품질 0.85)
          const base64String = canvas.toDataURL('image/jpeg', 0.85);
          
          // Base64 이미지 문자열을 photoUrl로 저장
          handleRecommendationChange(index, 'photoUrl', base64String);
          
          toast({
            title: "이미지 업로드 성공",
            description: "이미지가 성공적으로 업로드되었습니다.",
          });
        }
      };
      
      img.onerror = () => {
        toast({
          title: "이미지 처리 오류",
          description: "이미지를 처리할 수 없습니다.",
          variant: "destructive",
        });
      };
      
      // 이미지 소스 설정
      img.src = event.target?.result as string;
    };
    
    reader.onerror = () => {
      toast({
        title: "이미지 처리 오류",
        description: "이미지 파일을 읽는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    };
    
    reader.readAsDataURL(file);
  };
  
  if (isLoading) {
    return (
      <AdminLayout>
        <LoadingModal isOpen={true} message="추천의 글 데이터를 불러오는 중입니다..." />
      </AdminLayout>
    );
  }

  if (!isAuthenticated && !isLoading) {
    navigate('/admin/login');
    return null;
  }
  
  return (
    <AdminLayout>
      <LoadingModal isOpen={isSaving} message="데이터를 저장하는 중입니다..." />
      <Card className="w-full">
        <CardHeader>
          <CardTitle>추천의 글 관리</CardTitle>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-md text-sm mt-2">
              {error}
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">섹션 제목</label>
            <Input
              id="title"
              value={sectionTitle}
              onChange={(e) => setSectionTitle(e.target.value)}
              placeholder="추천의 글 섹션의 제목을 입력하세요"
            />
          </div>
          
          {recommendations.map((recommendation, index) => (
            <div key={index} className="border p-4 rounded-md space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">추천의 글 #{index + 1}</h3>
                {recommendations.length > 1 && (
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => removeRecommendation(index)}
                  >
                    삭제
                  </Button>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`title-${index}`}>제목</Label>
                <Input
                  id={`title-${index}`}
                  value={recommendation.title || ''}
                  onChange={(e) => handleRecommendationChange(index, 'title', e.target.value)}
                  placeholder="추천의 글 제목 (선택사항)"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`text-${index}`}>추천의 글</Label>
                <Textarea
                  id={`text-${index}`}
                  value={recommendation.text || ''}
                  onChange={(e) => handleRecommendationChange(index, 'text', e.target.value)}
                  placeholder="추천의 글 내용을 입력하세요"
                  rows={5}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`author-${index}`}>작성자</Label>
                <Input
                  id={`author-${index}`}
                  value={recommendation.author || ''}
                  onChange={(e) => handleRecommendationChange(index, 'author', e.target.value)}
                  placeholder="추천인 이름을 입력하세요"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`position-${index}`}>직위/소속</Label>
                <Input
                  id={`position-${index}`}
                  value={recommendation.position || ''}
                  onChange={(e) => handleRecommendationChange(index, 'position', e.target.value)}
                  placeholder="추천인의 직위나 소속을 입력하세요"
                />
              </div>
              
              <div className="space-y-2">
                <Label>사진</Label>
                <div className="flex items-center gap-4">
                  {recommendation.photoUrl && (
                    <div className="relative w-24 h-24 border rounded-md overflow-hidden">
                      <img 
                        src={recommendation.photoUrl} 
                        alt={`${recommendation.author || '추천인'} 사진`} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error('이미지 로드 실패:', recommendation.photoUrl);
                          // 이미지 로드 실패 시 기본 스타일 적용
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <button 
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                        onClick={() => handleRecommendationChange(index, 'photoUrl', '')}
                        type="button"
                      >
                        ×
                      </button>
                    </div>
                  )}
                  
                  <div>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(index, e)}
                      className="max-w-xs"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      권장 크기: 800x800 픽셀 이하, 최대 5MB
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          <Button 
            variant="outline" 
            onClick={addRecommendation}
            className="w-full"
          >
            추천의 글 추가
          </Button>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={loadRecommendations} 
            disabled={isLoading || isSaving}
          >
            새로고침
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isLoading || isSaving}
            className="bg-mainBlue hover:bg-blue-900"
          >
            {isSaving ? '저장 중...' : 'MongoDB에 저장하기'}
          </Button>
        </CardFooter>
      </Card>
    </AdminLayout>
  );
};

export default RecommendationsManage;
