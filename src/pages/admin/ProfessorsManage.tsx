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

interface ProfessorSection {
  title: string;
  professors: Professor[];
}

const ProfessorsManage = () => {
  const [sections, setSections] = useState<ProfessorSection[]>([
    {
      title: '',
      professors: [{ name: '', position: '', organization: '', profile: '' }]
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    // 로컬 스토리지에서 기존 데이터 로드
    const savedSections = localStorage.getItem('professor-sections');
    
    if (savedSections) {
      try {
        const parsedSections = JSON.parse(savedSections);
        setSections(parsedSections);
      } catch (error) {
        console.error('Failed to parse professor sections:', error);
      }
    } else {
      // 이전 형식의 데이터가 있는지 확인
      const savedTitle = localStorage.getItem('professors-title');
      const savedProfessors = localStorage.getItem('professors');
      
      if (savedTitle && savedProfessors) {
        try {
          const parsedProfessors = JSON.parse(savedProfessors);
          setSections([{
            title: savedTitle,
            professors: parsedProfessors
          }]);
        } catch (error) {
          console.error('Failed to parse professors:', error);
        }
      }
    }
  }, []);
  
  const handleSectionTitleChange = (sectionIndex: number, value: string) => {
    const newSections = [...sections];
    newSections[sectionIndex].title = value;
    setSections(newSections);
  };
  
  const handleProfessorChange = (sectionIndex: number, professorIndex: number, field: keyof Professor, value: string) => {
    const newSections = [...sections];
    newSections[sectionIndex].professors[professorIndex][field] = value;
    setSections(newSections);
  };
  
  const addProfessor = (sectionIndex: number) => {
    const newSections = [...sections];
    newSections[sectionIndex].professors.push({ name: '', position: '', organization: '', profile: '' });
    setSections(newSections);
  };
  
  const removeProfessor = (sectionIndex: number, professorIndex: number) => {
    const newSections = [...sections];
    if (newSections[sectionIndex].professors.length <= 1) return;
    
    newSections[sectionIndex].professors = newSections[sectionIndex].professors.filter(
      (_, i) => i !== professorIndex
    );
    setSections(newSections);
  };
  
  const addSection = () => {
    setSections([
      ...sections,
      {
        title: '',
        professors: [{ name: '', position: '', organization: '', profile: '' }]
      }
    ]);
  };
  
  const removeSection = (sectionIndex: number) => {
    if (sections.length <= 1) return;
    const newSections = sections.filter((_, i) => i !== sectionIndex);
    setSections(newSections);
  };
  
  const handleSave = () => {
    setIsLoading(true);
    
    // 빈 항목 필터링
    const filteredSections = sections.map(section => ({
      ...section,
      professors: section.professors.filter(prof => prof.name.trim() !== '')
    })).filter(section => section.title.trim() !== '' && section.professors.length > 0);
    
    // 로컬 스토리지에 저장
    localStorage.setItem('professor-sections', JSON.stringify(filteredSections));
    
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
        <CardTitle className="text-2xl font-bold text-mainBlue">운영 교수진 관리</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {sections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="border border-gray-200 rounded-lg p-5 space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2 flex-1">
                <label htmlFor={`section-title-${sectionIndex}`} className="text-sm font-medium">
                  섹션 제목 <span className="text-red-500">*</span>
                </label>
                <Input
                  id={`section-title-${sectionIndex}`}
                  value={section.title}
                  onChange={(e) => handleSectionTitleChange(sectionIndex, e.target.value)}
                  placeholder="교수진 섹션의 제목을 입력하세요"
                  required
                />
                {section.title.trim() === '' && (
                  <p className="text-xs text-red-500">섹션 제목은 필수 입력 항목입니다.</p>
                )}
              </div>
              
              {sections.length > 1 && (
                <Button 
                  type="button" 
                  variant="destructive" 
                  onClick={() => removeSection(sectionIndex)}
                  size="sm"
                  className="ml-4 mt-6"
                >
                  섹션 삭제
                </Button>
              )}
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">교수 목록</h3>
                <p className="text-xs text-gray-500">각 항목은 '교수 # - 이름 - 직위'가 한 세트로 구성됩니다</p>
              </div>
              
              {section.professors.map((professor, professorIndex) => (
                <div key={professorIndex} className="border p-4 rounded-md space-y-4 bg-gray-50">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">교수 #{professorIndex + 1}</h3>
                    <Button 
                      type="button" 
                      variant="destructive" 
                      onClick={() => removeProfessor(sectionIndex, professorIndex)}
                      disabled={section.professors.length <= 1}
                      size="sm"
                    >
                      삭제
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">이름 <span className="text-red-500">*</span></label>
                      <Input
                        value={professor.name}
                        onChange={(e) => handleProfessorChange(sectionIndex, professorIndex, 'name', e.target.value)}
                        placeholder="교수 이름"
                        required
                      />
                      {professor.name.trim() === '' && (
                        <p className="text-xs text-red-500">이름은 필수 입력 항목입니다.</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">직위 <span className="text-red-500">*</span></label>
                      <Input
                        value={professor.position}
                        onChange={(e) => handleProfessorChange(sectionIndex, professorIndex, 'position', e.target.value)}
                        placeholder="직위"
                        required
                      />
                      {professor.position.trim() === '' && (
                        <p className="text-xs text-red-500">직위는 필수 입력 항목입니다.</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">소속</label>
                      <Input
                        value={professor.organization}
                        onChange={(e) => handleProfessorChange(sectionIndex, professorIndex, 'organization', e.target.value)}
                        placeholder="소속"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">프로필 설명</label>
                    <Textarea
                      value={professor.profile}
                      onChange={(e) => handleProfessorChange(sectionIndex, professorIndex, 'profile', e.target.value)}
                      placeholder="교수 프로필 정보"
                      rows={3}
                    />
                  </div>
                </div>
              ))}
              
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => addProfessor(sectionIndex)} 
                className="w-full flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                교수 추가
              </Button>
            </div>
          </div>
        ))}
        
        <Button 
          type="button" 
          variant="secondary" 
          onClick={addSection} 
          className="w-full flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          새 섹션 추가
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
