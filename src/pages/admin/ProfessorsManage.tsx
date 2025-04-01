import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AdminNavTabs from '@/components/admin/AdminNavTabs';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useNavigate } from 'react-router-dom';
import AdminHomeButton from '@/components/admin/AdminHomeButton';
import { apiService } from '@/lib/apiService';
import { Loader } from 'lucide-react';

interface Professor {
  _id?: string;
  name: string;
  position: string;
  organization: string;
  profile: string;
}

interface ProfessorSection {
  _id?: string;
  sectionTitle: string;
  professors: Professor[];
  order?: number;
  isActive?: boolean;
}

const ProfessorsManage = () => {
  const [sections, setSections] = useState<ProfessorSection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const { isAuthenticated, isLoading: authLoading } = useAdminAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const fetchProfessorSections = async () => {
      try {
        setIsFetching(true);
        console.log('MongoDB에서 교수진 데이터 불러오기 시도...');
        
        // 인증 토큰 없이 호출
        const response = await apiService.getProfessorsAll();
        console.log('교수진 데이터 로드 결과:', response);
        
        if (response && Array.isArray(response) && response.length > 0) {
          setSections(response);
          console.log('교수진 데이터 로드 성공');
        } else {
          console.log('MongoDB에 교수진 데이터 없음, 기본 템플릿 사용');
          // 데이터가 없으면 기본 템플릿 생성
          setSections([{
            sectionTitle: '',
            professors: [{ name: '', position: '', organization: '', profile: '' }]
          }]);
        }
      } catch (error) {
        console.error('교수진 데이터를 불러오는 중 오류가 발생했습니다:', error);
        toast({
          title: "데이터 로드 실패",
          description: "교수진 정보를 불러오는데 실패했습니다. 다시 시도해주세요.",
          variant: "destructive"
        });
        
        // 오류 발생 시 기본 템플릿 생성
        setSections([{
          sectionTitle: '',
          professors: [{ name: '', position: '', organization: '', profile: '' }]
        }]);
      } finally {
        setIsFetching(false);
      }
    };
    
    fetchProfessorSections();
  }, [isAuthenticated]);
  
  const handleSectionTitleChange = (sectionIndex: number, value: string) => {
    const newSections = [...sections];
    newSections[sectionIndex].sectionTitle = value;
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
        sectionTitle: '',
        professors: [{ name: '', position: '', organization: '', profile: '' }]
      }
    ]);
  };
  
  const removeSection = (sectionIndex: number) => {
    if (sections.length <= 1) return;
    const newSections = sections.filter((_, i) => i !== sectionIndex);
    setSections(newSections);
  };
  
  const handleSave = async () => {
    setIsLoading(true);
    
    try {
      console.log('교수진 데이터 저장 시작...');
      
      // 빈 항목 필터링
      const filteredSections = sections.map(section => ({
        ...section,
        professors: section.professors.filter(prof => prof.name.trim() !== '')
      })).filter(section => section.sectionTitle.trim() !== '' && section.professors.length > 0);
      
      // 유효성 검사
      if (filteredSections.length === 0) {
        toast({
          title: "저장 실패",
          description: "최소 하나의 섹션과 교수 정보가 필요합니다.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      
      // 모든 섹션을 병렬로 저장 또는 업데이트 (토큰 제거)
      const savePromises = filteredSections.map(async section => {
        if (section._id) {
          // 기존 섹션 업데이트
          console.log(`ID ${section._id}를 가진 교수진 섹션 업데이트`);
          return await apiService.updateProfessorSection(section._id, section);
        } else {
          // 새 섹션 생성
          console.log('새 교수진 섹션 생성');
          return await apiService.createProfessorSection(section);
        }
      });
      
      await Promise.all(savePromises);
      console.log('교수진 데이터 저장 성공');
      
      // 변경된 데이터로 다시 불러오기 (토큰 제거)
      const updatedSections = await apiService.getProfessorsAll();
      setSections(updatedSections);
      
      toast({
        title: "저장 완료",
        description: "운영 교수진 정보가 성공적으로 저장되었습니다.",
      });
    } catch (error) {
      console.error('교수진 정보 저장 중 오류가 발생했습니다:', error);
      toast({
        title: "저장 실패",
        description: "서버 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteSection = async (sectionId: string) => {
    if (!sectionId) return;
    
    if (!window.confirm('이 섹션을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }
    
    try {
      setIsLoading(true);
      console.log(`ID ${sectionId}를 가진 교수진 섹션 삭제 시도`);
      // 토큰 없이 호출
      await apiService.deleteProfessorSection(sectionId);
      
      // 삭제 후 목록에서 제거
      setSections(sections.filter(section => section._id !== sectionId));
      
      toast({
        title: "삭제 완료",
        description: "교수진 섹션이 성공적으로 삭제되었습니다.",
      });
    } catch (error) {
      console.error('교수진 섹션 삭제 중 오류가 발생했습니다:', error);
      toast({
        title: "삭제 실패",
        description: "서버 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
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
      <AdminHomeButton />
      <div className="main-container py-10">
        <AdminNavTabs />
        
        <Card className="my-6">
          <CardHeader>
            <CardTitle>교수진 관리</CardTitle>
          </CardHeader>
          <CardContent>
            {isFetching ? (
              <div className="py-20 flex flex-col items-center justify-center">
                <Loader className="animate-spin mb-4" />
                <p>교수진 정보를 불러오는 중...</p>
              </div>
            ) : sections.length === 0 ? (
              <div className="py-10 text-center">
                <p className="mb-4">등록된 교수진 섹션이 없습니다.</p>
                <Button onClick={addSection}>새 섹션 추가</Button>
              </div>
            ) : (
              <div className="space-y-6">
                {sections.map((section, sectionIndex) => (
                  <div key={sectionIndex} className="border border-gray-200 rounded-lg p-5 space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="font-bold text-lg">섹션 #{sectionIndex + 1}</h2>
                      <div className="flex gap-2">
                        {section._id && (
                          <Button 
                            type="button" 
                            variant="destructive"
                            onClick={() => handleDeleteSection(section._id!)}
                            disabled={isLoading}
                            size="sm"
                          >
                            DB에서 삭제
                          </Button>
                        )}
                        <Button 
                          type="button" 
                          variant="destructive" 
                          onClick={() => removeSection(sectionIndex)}
                          disabled={sections.length <= 1 || isLoading}
                          size="sm"
                        >
                          섹션 삭제
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">섹션 제목</label>
                      <Input
                        value={section.sectionTitle}
                        onChange={(e) => handleSectionTitleChange(sectionIndex, e.target.value)}
                        placeholder="섹션 제목 (예: 운영 교수진, 특별 강의 교수진 등)"
                      />
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
                              disabled={section.professors.length <= 1 || isLoading}
                              size="sm"
                            >
                              삭제
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium">이름</label>
                              <Input
                                value={professor.name}
                                onChange={(e) => handleProfessorChange(sectionIndex, professorIndex, 'name', e.target.value)}
                                placeholder="이름"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <label className="text-sm font-medium">직위</label>
                              <Input
                                value={professor.position}
                                onChange={(e) => handleProfessorChange(sectionIndex, professorIndex, 'position', e.target.value)}
                                placeholder="직위 (예: 교수, 부교수 등)"
                              />
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
                        disabled={isLoading}
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
                  variant="outline" 
                  onClick={addSection} 
                  className="w-full flex items-center justify-center gap-2"
                  disabled={isLoading}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  새 섹션 추가
                </Button>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button 
              onClick={handleSave} 
              disabled={isLoading || sections.length === 0}
            >
              {isLoading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" /> 저장 중...
                </>
              ) : "변경사항 저장"}
            </Button>
          </CardFooter>
        </Card>
      </div>
      <Footer />
    </>
  );
};

export default ProfessorsManage;
