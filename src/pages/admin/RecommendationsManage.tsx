import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';

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

    // In a real application, you would upload this file to a server
    // For this demo, we'll use a local URL
    const imageUrl = URL.createObjectURL(file);
    handleRecommendationChange(index, 'photoUrl', imageUrl);
  };
  
  return (
    <Card className="w-full">
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
              <Button 
                type="button" 
                variant="destructive" 
                onClick={() => removeRecommendation(index)}
                disabled={recommendations.length <= 1}
                size="sm"
              >
                삭제
              </Button>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor={`recommendation-title-${index}`} className="text-sm font-medium">추천의 글 제목</Label>
              <Input
                id={`recommendation-title-${index}`}
                value={recommendation.title}
                onChange={(e) => handleRecommendationChange(index, 'title', e.target.value)}
                placeholder="추천의 글 제목을 입력하세요"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor={`recommendation-text-${index}`} className="text-sm font-medium">추천 내용</Label>
              <Textarea
                id={`recommendation-text-${index}`}
                value={recommendation.text}
                onChange={(e) => handleRecommendationChange(index, 'text', e.target.value)}
                placeholder="추천 내용을 입력하세요"
                rows={4}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`recommendation-author-${index}`} className="text-sm font-medium">추천인</Label>
                <Input
                  id={`recommendation-author-${index}`}
                  value={recommendation.author}
                  onChange={(e) => handleRecommendationChange(index, 'author', e.target.value)}
                  placeholder="추천인 이름"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`recommendation-position-${index}`} className="text-sm font-medium">직위/소속</Label>
                <Input
                  id={`recommendation-position-${index}`}
                  value={recommendation.position}
                  onChange={(e) => handleRecommendationChange(index, 'position', e.target.value)}
                  placeholder="직위/소속"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`photo-${index}`} className="text-sm font-medium">추천인 사진</Label>
              <div className="flex items-center gap-4">
                <div className="flex-1 max-w-xs">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      추천인 사진
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(index, e)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-mainBlue focus:border-mainBlue"
                    />
                    
                    {recommendation.photoUrl && (
                      <div className="mt-2">
                        <div className="w-24 h-24 rounded-full overflow-hidden shadow-md bg-mainBlue">
                          <img 
                            src={recommendation.photoUrl} 
                            alt={recommendation.author || `추천인 ${index + 1}`}
                            className="w-full h-full object-cover" 
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {recommendation.photoUrl && (
                  <Input
                    value={recommendation.photoUrl}
                    onChange={(e) => handleRecommendationChange(index, 'photoUrl', e.target.value)}
                    placeholder="이미지 URL (직접 입력 가능)"
                    className="mt-2"
                  />
                )}
              </div>
            </div>
          </div>
        ))}
        
        <Button type="button" variant="outline" onClick={addRecommendation} className="w-full">
          추천의 글 추가
        </Button>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave} disabled={isLoading} className="ml-auto">
          {isLoading ? '저장 중...' : '저장하기'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RecommendationsManage;
