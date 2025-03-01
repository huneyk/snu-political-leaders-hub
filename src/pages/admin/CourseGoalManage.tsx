
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

const CourseGoalManage = () => {
  const [title, setTitle] = useState('');
  const [goals, setGoals] = useState<string[]>(['', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    // 로컬 스토리지에서 기존 데이터 로드
    const savedTitle = localStorage.getItem('course-goal-title');
    const savedGoals = localStorage.getItem('course-goals');
    
    if (savedTitle) setTitle(savedTitle);
    if (savedGoals) {
      try {
        const parsedGoals = JSON.parse(savedGoals);
        setGoals(parsedGoals);
      } catch (error) {
        console.error('Failed to parse goals:', error);
      }
    }
  }, []);
  
  const handleGoalChange = (index: number, value: string) => {
    const newGoals = [...goals];
    newGoals[index] = value;
    setGoals(newGoals);
  };
  
  const addGoal = () => {
    setGoals([...goals, '']);
  };
  
  const removeGoal = (index: number) => {
    if (goals.length <= 1) return;
    const newGoals = goals.filter((_, i) => i !== index);
    setGoals(newGoals);
  };
  
  const handleSave = () => {
    setIsLoading(true);
    
    // 실제 구현에서는 API 호출을 통해 서버에 저장해야 합니다.
    localStorage.setItem('course-goal-title', title);
    localStorage.setItem('course-goals', JSON.stringify(goals.filter(goal => goal.trim() !== '')));
    
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "저장 완료",
        description: "과정의 목표가 성공적으로 저장되었습니다.",
      });
    }, 500);
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>과정의 목표 관리</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium">제목</label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="과정 목표 섹션의 제목을 입력하세요"
          />
        </div>
        
        <div className="space-y-4">
          <label className="text-sm font-medium">목표 항목</label>
          {goals.map((goal, index) => (
            <div key={index} className="flex gap-2">
              <Textarea
                value={goal}
                onChange={(e) => handleGoalChange(index, e.target.value)}
                placeholder={`목표 ${index + 1}`}
                className="flex-1"
              />
              <Button 
                type="button" 
                variant="destructive" 
                size="icon"
                onClick={() => removeGoal(index)}
                disabled={goals.length <= 1}
              >
                X
              </Button>
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
