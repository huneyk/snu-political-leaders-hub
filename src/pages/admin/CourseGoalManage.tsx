import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';

interface GoalItem {
  title: string;
  content: string;
  imageUrl: string;
}

const CourseGoalManage = () => {
  const [sectionTitle, setSectionTitle] = useState('');
  const [goals, setGoals] = useState<GoalItem[]>([
    { title: '', content: '', imageUrl: '' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    // 로컬 스토리지에서 기존 데이터 로드
    const savedTitle = localStorage.getItem('course-goal-title');
    const savedGoals = localStorage.getItem('course-goals');
    
    if (savedTitle) setSectionTitle(savedTitle);
    if (savedGoals) {
      try {
        const parsedGoals = JSON.parse(savedGoals);
        // Handle existing data format (string array) and convert to new format
        if (Array.isArray(parsedGoals) && typeof parsedGoals[0] === 'string') {
          setGoals(parsedGoals.map(goal => ({ 
            title: '', 
            content: goal, 
            imageUrl: '' 
          })));
        } else {
          setGoals(parsedGoals);
        }
      } catch (error) {
        console.error('Failed to parse goals:', error);
      }
    }
  }, []);
  
  const handleGoalChange = (index: number, field: keyof GoalItem, value: string) => {
    const newGoals = [...goals];
    newGoals[index][field] = value;
    setGoals(newGoals);
  };
  
  const addGoal = () => {
    setGoals([...goals, { title: '', content: '', imageUrl: '' }]);
  };
  
  const removeGoal = (index: number) => {
    if (goals.length <= 1) return;
    const newGoals = goals.filter((_, i) => i !== index);
    setGoals(newGoals);
  };
  
  const handleSave = () => {
    setIsLoading(true);
    
    // 실제 구현에서는 API 호출을 통해 서버에 저장해야 합니다.
    localStorage.setItem('course-goal-title', sectionTitle);
    localStorage.setItem('course-goals', JSON.stringify(
      goals.filter(goal => goal.title.trim() !== '' || goal.content.trim() !== '')
    ));
    
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "저장 완료",
        description: "과정의 목표가 성공적으로 저장되었습니다.",
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
    handleGoalChange(index, 'imageUrl', imageUrl);
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>과정의 목표 관리</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium">섹션 제목</label>
          <Input
            id="title"
            value={sectionTitle}
            onChange={(e) => setSectionTitle(e.target.value)}
            placeholder="과정 목표 섹션의 제목을 입력하세요"
          />
        </div>
        
        <div className="space-y-6">
          <label className="text-sm font-medium">목표 항목</label>
          {goals.map((goal, index) => (
            <div key={index} className="border p-4 rounded-md space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">목표 #{index + 1}</h3>
                <Button 
                  type="button" 
                  variant="destructive" 
                  onClick={() => removeGoal(index)}
                  disabled={goals.length <= 1}
                  size="sm"
                >
                  삭제
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`goal-image-${index}`} className="text-sm font-medium">목표 아이콘</Label>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    목표 아이콘
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(index, e)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-mainBlue focus:border-mainBlue"
                  />
                  <p className="mt-1 text-sm text-gray-500">아이콘으로 사용할 정사각형 이미지를 업로드해주세요.</p>
                  
                  {goal.imageUrl && (
                    <div className="mt-2">
                      <div className="w-16 h-16 rounded-full overflow-hidden shadow-md bg-mainBlue">
                        <img 
                          src={goal.imageUrl} 
                          alt={goal.title || `목표 ${index + 1}`}
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`goal-title-${index}`} className="text-sm font-medium">목표 제목</Label>
                <Input
                  id={`goal-title-${index}`}
                  value={goal.title}
                  onChange={(e) => handleGoalChange(index, 'title', e.target.value)}
                  placeholder="목표 제목을 입력하세요"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`goal-content-${index}`} className="text-sm font-medium">목표 내용</Label>
                <Textarea
                  id={`goal-content-${index}`}
                  value={goal.content}
                  onChange={(e) => handleGoalChange(index, 'content', e.target.value)}
                  placeholder="목표 내용을 입력하세요"
                  rows={3}
                />
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addGoal} className="w-full">
            목표 추가
          </Button>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave} disabled={isLoading} className="ml-auto">
          {isLoading ? '저장 중...' : '저장하기'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CourseGoalManage;
