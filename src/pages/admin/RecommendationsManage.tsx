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

interface Recommendation {
  title: string;
  text: string;
  author: string;
  position: string;
  photoUrl: string;
}

const RecommendationsManage = () => {
  const [sectionTitle, setSectionTitle] = useState('');
  const [recommendations, setRecommendations] = useState<Recommendation[]>([
    {title: '', text: '', author: '', position: '', photoUrl: ''}
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, isLoading: authLoading } = useAdminAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // 로컬 스토리지에서 기존 데이터 로드
    const savedTitle = localStorage.getItem('recommendations-title');
    const savedRecommendations = localStorage.getItem('recommendations');
    
    if (savedTitle) setSectionTitle(savedTitle);
    if (savedRecommendations) {
      try {
        const parsedRecommendations = JSON.parse(savedRecommendations);
        // Handle existing data without title or photoUrl
        const updatedRecommendations = parsedRecommendations.map((rec: any) => ({
          title: rec.title || '',
          text: rec.text || '',
          author: rec.author || '',
          position: rec.position || '',
          photoUrl: rec.photoUrl || ''
        }));
        setRecommendations(updatedRecommendations);
      } catch (error) {
        console.error('Failed to parse recommendations:', error);
      }
    }
  }, []);
  
  const handleRecommendationChange = (
    index: number, 
    field: keyof Recommendation, 
    value: string
  ) => {
    const newRecommendations = [...recommendations];
    newRecommendations[index][field] = value;
    setRecommendations(newRecommendations);
  };
  
  const addRecommendation = () => {
    setRecommendations([...recommendations, {title: '', text: '', author: '', position: '', photoUrl: ''}]);
  };
  
  const removeRecommendation = (index: number) => {
    if (recommendations.length <= 1) return;
    const newRecommendations = recommendations.filter((_, i) => i !== index);
    setRecommendations(newRecommendations);
  };
  
  const handleSave = () => {
    setIsLoading(true);
    
    // 실제 구현에서는 API 호출을 통해 서버에 저장해야 합니다.
    localStorage.setItem('recommendations-title', sectionTitle);
    localStorage.setItem('recommendations', JSON.stringify(
      recommendations.filter(rec => rec.title.trim() !== '' || rec.text.trim() !== '' || rec.author.trim() !== '')
    ));
    
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "저장 완료",
        description: "추천의 글이 성공적으로 저장되었습니다.",
      });
    }, 500);
  };

  // Function to handle file upload
  const handleFileUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert the file to Base64 string
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Save the Base64 string as the photo URL
      handleRecommendationChange(index, 'photoUrl', base64String);
    };
    reader.readAsDataURL(file);
  };
  
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>로딩 중...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    navigate('/admin/login');
    return null;
  }
  
  return (
    <>
      <Header />
      <div className="container mx-auto py-8 px-4 pt-24">
        <h1 className="text-3xl font-bold text-mainBlue mb-6">관리자 대시보드</h1>
        
        <AdminNavTabs activeTab="content" />
        <AdminHomeButton />
        
        <Card className="w-full mt-6">
          <CardHeader>
            <CardTitle>추천의 글 관리</CardTitle>
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
                    value={recommendation.title}
                    onChange={(e) => handleRecommendationChange(index, 'title', e.target.value)}
                    placeholder="추천의 글 제목 (선택사항)"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`text-${index}`}>추천의 글</Label>
                  <Textarea
                    id={`text-${index}`}
                    value={recommendation.text}
                    onChange={(e) => handleRecommendationChange(index, 'text', e.target.value)}
                    placeholder="추천의 글 내용을 입력하세요"
                    rows={5}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`author-${index}`}>작성자</Label>
                  <Input
                    id={`author-${index}`}
                    value={recommendation.author}
                    onChange={(e) => handleRecommendationChange(index, 'author', e.target.value)}
                    placeholder="추천인 이름을 입력하세요"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`position-${index}`}>직위/소속</Label>
                  <Input
                    id={`position-${index}`}
                    value={recommendation.position}
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
                          alt={`${recommendation.author} 사진`} 
                          className="w-full h-full object-cover"
                        />
                        <button 
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                          onClick={() => handleRecommendationChange(index, 'photoUrl', '')}
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
                        권장 크기: 300x300 픽셀, 최대 2MB
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
          <CardFooter>
            <Button 
              onClick={handleSave} 
              disabled={isLoading}
              className="ml-auto"
            >
              {isLoading ? '저장 중...' : '저장하기'}
            </Button>
          </CardFooter>
        </Card>
      </div>
      <Footer />
    </>
  );
};

export default RecommendationsManage;
