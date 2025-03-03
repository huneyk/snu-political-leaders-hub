import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

interface Benefit {
  title: string;
  content: string;
}

const CourseBenefitsManage = () => {
  const [sectionTitle, setSectionTitle] = useState('');
  const [benefits, setBenefits] = useState<Benefit[]>([
    { title: '', content: '' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    // 로컬 스토리지에서 기존 데이터 로드
    const savedTitle = localStorage.getItem('course-benefits-title');
    const savedBenefits = localStorage.getItem('course-benefits');
    
    if (savedTitle) setSectionTitle(savedTitle);
    if (savedBenefits) {
      try {
        const parsedBenefits = JSON.parse(savedBenefits);
        // 이전 형식(string[])에서 새 형식(Benefit[])으로 변환
        if (Array.isArray(parsedBenefits)) {
          if (typeof parsedBenefits[0] === 'string') {
            // 이전 형식: string[]
            setBenefits(parsedBenefits.map(content => ({ title: '', content })));
          } else {
            // 새 형식: Benefit[]
            setBenefits(parsedBenefits);
          }
        }
      } catch (error) {
        console.error('Failed to parse benefits:', error);
      }
    }
  }, []);
  
  const handleBenefitChange = (index: number, field: keyof Benefit, value: string) => {
    const newBenefits = [...benefits];
    newBenefits[index] = { ...newBenefits[index], [field]: value };
    setBenefits(newBenefits);
  };
  
  const addBenefit = () => {
    setBenefits([...benefits, { title: '', content: '' }]);
  };
  
  const removeBenefit = (index: number) => {
    if (benefits.length <= 1) return;
    const newBenefits = benefits.filter((_, i) => i !== index);
    setBenefits(newBenefits);
  };
  
  const handleSave = () => {
    setIsLoading(true);
    
    // 빈 항목 필터링 - 제목이 있는 항목만 저장
    const filteredBenefits = benefits.filter(
      benefit => benefit.title.trim() !== ''
    );
    
    // 로컬 스토리지에 저장
    localStorage.setItem('course-benefits-title', sectionTitle);
    localStorage.setItem('course-benefits', JSON.stringify(filteredBenefits));
    
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
        <CardTitle className="text-2xl font-bold text-mainBlue">과정의 특전 관리</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium">섹션 제목</label>
          <Input
            id="title"
            value={sectionTitle}
            onChange={(e) => setSectionTitle(e.target.value)}
            placeholder="과정 특전 섹션의 제목을 입력하세요"
          />
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">특전 항목</label>
            <p className="text-xs text-gray-500">각 항목은 '특전 제목 - 특전 내용'이 한 세트로 구성됩니다</p>
          </div>
          
          {benefits.map((benefit, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-md bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">특전 {index + 1}</h3>
                <Button 
                  type="button" 
                  variant="destructive" 
                  size="sm"
                  onClick={() => removeBenefit(index)}
                  disabled={benefits.length <= 1}
                >
                  삭제
                </Button>
              </div>
              
              <div className="mb-3">
                <label className="text-sm font-medium mb-1 block">특전 제목 <span className="text-red-500">*</span></label>
                <Input
                  value={benefit.title}
                  onChange={(e) => handleBenefitChange(index, 'title', e.target.value)}
                  placeholder={`특전 ${index + 1} 제목`}
                  className="mb-2"
                  required
                />
                {benefit.title.trim() === '' && (
                  <p className="text-xs text-red-500 mt-1">특전 제목은 필수 입력 항목입니다.</p>
                )}
              </div>
              
              <div className="mb-2">
                <label className="text-sm font-medium mb-1 block">특전 내용</label>
                <Textarea
                  value={benefit.content}
                  onChange={(e) => handleBenefitChange(index, 'content', e.target.value)}
                  placeholder={`특전 ${index + 1} 내용`}
                  className="min-h-[100px]"
                />
              </div>
            </div>
          ))}
          
          <Button 
            type="button" 
            variant="outline" 
            onClick={addBenefit} 
            className="w-full flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            새 특전 추가
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
