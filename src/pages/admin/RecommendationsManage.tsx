
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

const RecommendationsManage = () => {
  const [title, setTitle] = useState('');
  const [recommendations, setRecommendations] = useState<{text: string, author: string, position: string}[]>([
    {text: '', author: '', position: ''}
  ]);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    // 로컬 스토리지에서 기존 데이터 로드
    const savedTitle = localStorage.getItem('recommendations-title');
    const savedRecommendations = localStorage.getItem('recommendations');
    
    if (savedTitle) setTitle(savedTitle);
    if (savedRecommendations) {
      try {
        const parsedRecommendations = JSON.parse(savedRecommendations);
        setRecommendations(parsedRecommendations);
      } catch (error) {
        console.error('Failed to parse recommendations:', error);
      }
    }
  }, []);
  
  const handleRecommendationChange = (index: number, field: 'text' | 'author' | 'position', value: string) => {
    const newRecommendations = [...recommendations];
    newRecommendations[index][field] = value;
    setRecommendations(newRecommendations);
  };
  
  const addRecommendation = () => {
    setRecommendations([...recommendations, {text: '', author: '', position: ''}]);
  };
  
  const removeRecommendation = (index: number) => {
    if (recommendations.length <= 1) return;
    const newRecommendations = recommendations.filter((_, i) => i !== index);
    setRecommendations(newRecommendations);
  };
  
  const handleSave = () => {
    setIsLoading(true);
    
    // 실제 구현에서는 API 호출을 통해 서버에 저장해야 합니다.
    localStorage.setItem('recommendations-title', title);
    localStorage.setItem('recommendations', JSON.stringify(
      recommendations.filter(rec => rec.text.trim() !== '' || rec.author.trim() !== '')
    ));
    
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "저장 완료",
        description: "추천의 글이 성공적으로 저장되었습니다.",
      });
    }, 500);
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
            value={title}
            onChange={(e) => setTitle(e.target.value)}
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
              <label className="text-sm font-medium">추천 내용</label>
              <Textarea
                value={recommendation.text}
                onChange={(e) => handleRecommendationChange(index, 'text', e.target.value)}
                placeholder="추천 내용을 입력하세요"
                rows={4}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">추천인</label>
                <Input
                  value={recommendation.author}
                  onChange={(e) => handleRecommendationChange(index, 'author', e.target.value)}
                  placeholder="추천인 이름"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">직위/소속</label>
                <Input
                  value={recommendation.position}
                  onChange={(e) => handleRecommendationChange(index, 'position', e.target.value)}
                  placeholder="직위/소속"
                />
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
