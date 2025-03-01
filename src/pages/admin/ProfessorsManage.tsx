
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

interface Professor {
  name: string;
  position: string;
  organization: string;
  profile: string;
}

const ProfessorsManage = () => {
  const [title, setTitle] = useState('');
  const [professors, setProfessors] = useState<Professor[]>([
    { name: '', position: '', organization: '', profile: '' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    // 로컬 스토리지에서 기존 데이터 로드
    const savedTitle = localStorage.getItem('professors-title');
    const savedProfessors = localStorage.getItem('professors');
    
    if (savedTitle) setTitle(savedTitle);
    if (savedProfessors) {
      try {
        const parsedProfessors = JSON.parse(savedProfessors);
        setProfessors(parsedProfessors);
      } catch (error) {
        console.error('Failed to parse professors:', error);
      }
    }
  }, []);
  
  const handleProfessorChange = (index: number, field: keyof Professor, value: string) => {
    const newProfessors = [...professors];
    newProfessors[index][field] = value;
    setProfessors(newProfessors);
  };
  
  const addProfessor = () => {
    setProfessors([...professors, { name: '', position: '', organization: '', profile: '' }]);
  };
  
  const removeProfessor = (index: number) => {
    if (professors.length <= 1) return;
    const newProfessors = professors.filter((_, i) => i !== index);
    setProfessors(newProfessors);
  };
  
  const handleSave = () => {
    setIsLoading(true);
    
    // 실제 구현에서는 API 호출을 통해 서버에 저장해야 합니다.
    localStorage.setItem('professors-title', title);
    localStorage.setItem('professors', JSON.stringify(
      professors.filter(prof => prof.name.trim() !== '')
    ));
    
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "저장 완료",
        description: "운영 교수진 정보가 성공적으로 저장되었습니다.",
      });
    }, 500);
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>운영 교수진 관리</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium">섹션 제목</label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="교수진 섹션의 제목을 입력하세요"
          />
        </div>
        
        {professors.map((professor, index) => (
          <div key={index} className="border p-4 rounded-md space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">교수 #{index + 1}</h3>
              <Button 
                type="button" 
                variant="destructive" 
                onClick={() => removeProfessor(index)}
                disabled={professors.length <= 1}
                size="sm"
              >
                삭제
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">이름</label>
                <Input
                  value={professor.name}
                  onChange={(e) => handleProfessorChange(index, 'name', e.target.value)}
                  placeholder="교수 이름"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">직위</label>
                <Input
                  value={professor.position}
                  onChange={(e) => handleProfessorChange(index, 'position', e.target.value)}
                  placeholder="직위"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">소속</label>
                <Input
                  value={professor.organization}
                  onChange={(e) => handleProfessorChange(index, 'organization', e.target.value)}
                  placeholder="소속"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">프로필 설명</label>
              <Textarea
                value={professor.profile}
                onChange={(e) => handleProfessorChange(index, 'profile', e.target.value)}
                placeholder="교수 프로필 정보"
                rows={3}
              />
            </div>
          </div>
        ))}
        
        <Button type="button" variant="outline" onClick={addProfessor} className="w-full">
          교수 추가
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

export default ProfessorsManage;
