
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

const CourseBenefitsManage = () => {
  const [title, setTitle] = useState('');
  const [benefits, setBenefits] = useState<string[]>(['', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    // 로컬 스토리지에서 기존 데이터 로드
    const savedTitle = localStorage.getItem('course-benefits-title');
    const savedBenefits = localStorage.getItem('course-benefits');
    
    if (savedTitle) setTitle(savedTitle);
    if (savedBenefits) {
      try {
        const parsedBenefits = JSON.parse(savedBenefits);
        setBenefits(parsedBenefits);
      } catch (error) {
        console.error('Failed to parse benefits:', error);
      }
    }
  }, []);
  
  const handleBenefitChange = (index: number, value: string) => {
    const newBenefits = [...benefits];
    newBenefits[index] = value;
    setBenefits(newBenefits);
  };
  
  const addBenefit = () => {
    setBenefits([...benefits, '']);
  };
  
  const removeBenefit = (index: number) => {
    if (benefits.length <= 1) return;
    const newBenefits = benefits.filter((_, i) => i !== index);
    setBenefits(newBenefits);
  };
  
  const handleSave = () => {
    setIsLoading(true);
    
    // 실제 구현에서는 API 호출을 통해 서버에 저장해야 합니다.
    localStorage.setItem('course-benefits-title', title);
    localStorage.setItem('course-benefits', JSON.stringify(benefits.filter(benefit => benefit.trim() !== '')));
    
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "저장 완료",
        description: "과정의 특전이 성공적으로 저장되었습니다.",
      });
    }, 500);
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>과정의 특전 관리</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium">제목</label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="과정 특전 섹션의 제목을 입력하세요"
          />
        </div>
        
        <div className="space-y-4">
          <label className="text-sm font-medium">특전 항목</label>
          {benefits.map((benefit, index) => (
            <div key={index} className="flex gap-2">
              <Textarea
                value={benefit}
                onChange={(e) => handleBenefitChange(index, e.target.value)}
                placeholder={`특전 ${index + 1}`}
                className="flex-1"
              />
              <Button 
                type="button" 
                variant="destructive" 
                size="icon"
                onClick={() => removeBenefit(index)}
                disabled={benefits.length <= 1}
              >
                X
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addBenefit} className="w-full">
            특전 추가
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

export default CourseBenefitsManage;
