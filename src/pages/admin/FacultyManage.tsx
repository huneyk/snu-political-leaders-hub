import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useNavigate } from 'react-router-dom';

interface Faculty {
  id: string;
  name: string;
  imageUrl: string;
  biography: string;
}

interface FacultyCategory {
  id: string;
  name: string; // 특별강사진 or 서울대 정치외교학부 교수진
  faculty: Faculty[];
}

interface TermFaculty {
  term: string; // 기수
  categories: FacultyCategory[];
}

const FacultyManage = () => {
  const { isAuthenticated, isLoading } = useAdminAuth();
  const navigate = useNavigate();
  const fileInputRefs = useRef<{[key: string]: HTMLInputElement | null}>({});
  
  const [terms, setTerms] = useState<TermFaculty[]>([
    {
      term: '1',
      categories: [
        {
          id: '1',
          name: '특별강사진',
          faculty: [{ id: '1', name: '', imageUrl: '', biography: '' }]
        },
        {
          id: '2',
          name: '서울대 정치외교학부 교수진',
          faculty: [{ id: '1', name: '', imageUrl: '', biography: '' }]
        }
      ]
    }
  ]);
  
  const [activeTermIndex, setActiveTermIndex] = useState(0);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<FacultyCategory | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    // 로컬 스토리지에서 기존 데이터 로드
    const savedFaculty = localStorage.getItem('faculty-data');
    
    if (savedFaculty) {
      try {
        const parsedFaculty = JSON.parse(savedFaculty);
        console.log('로드된 데이터:', parsedFaculty);
        
        // 데이터 구조 확인
        if (Array.isArray(parsedFaculty) && parsedFaculty.length > 0) {
          // 각 기수에 카테고리가 있는지 확인
          const validData = parsedFaculty.map(term => {
            // 카테고리가 없거나 비어있는 경우 기본 카테고리 추가
            if (!term.categories || term.categories.length === 0) {
              return {
                ...term,
                categories: [
                  {
                    id: '1',
                    name: '특별강사진',
                    faculty: [{ id: '1', name: '', imageUrl: '', biography: '' }]
                  },
                  {
                    id: '2',
                    name: '서울대 정치외교학부 교수진',
                    faculty: [{ id: '1', name: '', imageUrl: '', biography: '' }]
                  }
                ]
              };
            }
            
            // 카테고리가 있지만 '서울대 정치외교학부 교수진'이 없는 경우 추가
            const hasSpecial = term.categories.some(cat => cat.name === '특별강사진');
            const hasFaculty = term.categories.some(cat => cat.name === '서울대 정치외교학부 교수진');
            
            const updatedCategories = [...term.categories];
            
            if (!hasSpecial) {
              updatedCategories.push({
                id: '1',
                name: '특별강사진',
                faculty: [{ id: '1', name: '', imageUrl: '', biography: '' }]
              });
            }
            
            if (!hasFaculty) {
              updatedCategories.push({
                id: '2',
                name: '서울대 정치외교학부 교수진',
                faculty: [{ id: '1', name: '', imageUrl: '', biography: '' }]
              });
            }
            
            return {
              ...term,
              categories: updatedCategories
            };
          });
          
          setTerms(validData);
          console.log('유효한 데이터로 변환:', validData);
        } else {
          setTerms([{
            term: '1',
            categories: [
              {
                id: '1',
                name: '특별강사진',
                faculty: [{ id: '1', name: '', imageUrl: '', biography: '' }]
              },
              {
                id: '2',
                name: '서울대 정치외교학부 교수진',
                faculty: [{ id: '1', name: '', imageUrl: '', biography: '' }]
              }
            ]
          }]);
        }
        
        // 카테고리 인덱스 초기화
        setActiveCategoryIndex(0);
        console.log('로컬 스토리지에서 데이터 로드 완료');
      } catch (error) {
        console.error('Failed to parse faculty data:', error);
        // 오류 발생 시 기본 데이터로 초기화
        setTerms([{
          term: '1',
          categories: [
            {
              id: '1',
              name: '특별강사진',
              faculty: [{ id: '1', name: '', imageUrl: '', biography: '' }]
            },
            {
              id: '2',
              name: '서울대 정치외교학부 교수진',
              faculty: [{ id: '1', name: '', imageUrl: '', biography: '' }]
            }
          ]
        }]);
      }
    }
  }, []);
  
  // 현재 선택된 카테고리 업데이트
  useEffect(() => {
    if (terms.length > 0 && terms[activeTermIndex] && terms[activeTermIndex].categories.length > activeCategoryIndex) {
      setSelectedCategory(terms[activeTermIndex].categories[activeCategoryIndex]);
      console.log('선택된 카테고리 업데이트:', terms[activeTermIndex].categories[activeCategoryIndex].name);
    }
  }, [terms, activeTermIndex, activeCategoryIndex]);
  
  // 컴포넌트 마운트 시 selectedCategory 초기화
  useEffect(() => {
    if (terms.length > 0 && terms[0].categories && terms[0].categories.length > 0) {
      setSelectedCategory(terms[0].categories[0]);
      console.log('컴포넌트 마운트 시 selectedCategory 초기화:', terms[0].categories[0].name);
    }
  }, []);
  
  // 새 기수 추가
  const addTerm = () => {
    const lastTerm = terms.length > 0 ? parseInt(terms[terms.length - 1].term) : 0;
    const newTerm = (lastTerm + 1).toString();
    
    const newTermData = {
      term: newTerm,
      categories: [
        {
          id: '1',
          name: '특별강사진',
          faculty: [{ id: '1', name: '', imageUrl: '', biography: '' }]
        },
        {
          id: '2',
          name: '서울대 정치외교학부 교수진',
          faculty: [{ id: '1', name: '', imageUrl: '', biography: '' }]
        }
      ]
    };
    
    setTerms([...terms, newTermData]);
    
    // 새로 추가된 기수로 활성 탭 변경
    setActiveTermIndex(terms.length);
    setActiveCategoryIndex(0);
    setSelectedCategory(newTermData.categories[0]);
  };
  
  // 기수 삭제
  const removeTerm = (termIndex: number) => {
    if (terms.length <= 1) {
      toast({
        title: "삭제 불가",
        description: "최소 하나의 기수는 유지해야 합니다.",
        variant: "destructive"
      });
      return;
    }
    
    const newTerms = terms.filter((_, index) => index !== termIndex);
    setTerms(newTerms);
    
    // 삭제된 기수가 현재 활성 기수인 경우, 활성 기수 변경
    if (termIndex === activeTermIndex) {
      setActiveTermIndex(0);
    } else if (termIndex < activeTermIndex) {
      setActiveTermIndex(activeTermIndex - 1);
    }
  };
  
  // 강사 추가
  const addFaculty = (termIndex: number, categoryIndex: number) => {
    if (!selectedCategory) return;
    
    const newTerms = [...terms];
    const lastId = selectedCategory.faculty.length > 0 
      ? parseInt(selectedCategory.faculty[selectedCategory.faculty.length - 1].id)
      : 0;
    
    const newFaculty = {
      id: (lastId + 1).toString(),
      name: '',
      imageUrl: '',
      biography: ''
    };
    
    newTerms[termIndex].categories[categoryIndex].faculty.push(newFaculty);
    setTerms(newTerms);
    
    // selectedCategory 업데이트
    setSelectedCategory({
      ...selectedCategory,
      faculty: [...selectedCategory.faculty, newFaculty]
    });
  };
  
  // 강사 삭제
  const removeFaculty = (termIndex: number, categoryIndex: number, facultyIndex: number) => {
    if (!selectedCategory) return;
    
    const newTerms = [...terms];
    
    if (selectedCategory.faculty.length <= 1) {
      toast({
        title: "삭제 불가",
        description: "최소 하나의 강사는 유지해야 합니다.",
        variant: "destructive"
      });
      return;
    }
    
    newTerms[termIndex].categories[categoryIndex].faculty = 
      newTerms[termIndex].categories[categoryIndex].faculty.filter((_, index) => index !== facultyIndex);
    
    setTerms(newTerms);
    
    // selectedCategory 업데이트
    setSelectedCategory({
      ...selectedCategory,
      faculty: selectedCategory.faculty.filter((_, index) => index !== facultyIndex)
    });
  };
  
  // 강사 정보 변경
  const handleFacultyChange = (
    termIndex: number,
    categoryIndex: number,
    facultyIndex: number,
    field: keyof Faculty,
    value: string
  ) => {
    if (!selectedCategory) return;
    
    const newTerms = [...terms];
    newTerms[termIndex].categories[categoryIndex].faculty[facultyIndex][field] = value;
    setTerms(newTerms);
    
    // selectedCategory 업데이트
    const updatedFaculty = [...selectedCategory.faculty];
    updatedFaculty[facultyIndex] = {
      ...updatedFaculty[facultyIndex],
      [field]: value
    };
    
    setSelectedCategory({
      ...selectedCategory,
      faculty: updatedFaculty
    });
  };
  
  // 이미지 파일 선택 처리
  const handleImageChange = (
    termIndex: number,
    categoryIndex: number,
    facultyIndex: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!selectedCategory) return;
    
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      
      reader.onloadend = () => {
        const newTerms = [...terms];
        newTerms[termIndex].categories[categoryIndex].faculty[facultyIndex].imageUrl = reader.result as string;
        setTerms(newTerms);
        
        // selectedCategory 업데이트
        const updatedFaculty = [...selectedCategory.faculty];
        updatedFaculty[facultyIndex] = {
          ...updatedFaculty[facultyIndex],
          imageUrl: reader.result as string
        };
        
        setSelectedCategory({
          ...selectedCategory,
          faculty: updatedFaculty
        });
      };
      
      reader.readAsDataURL(file);
    }
  };
  
  // 이미지 버튼 클릭 처리
  const handleImageButtonClick = (termIndex: number, categoryIndex: number, facultyIndex: number) => {
    fileInputRefs.current[`${termIndex}-${categoryIndex}-${facultyIndex}`]?.click();
  };
  
  // 이미지 제거
  const handleRemoveImage = (termIndex: number, categoryIndex: number, facultyIndex: number) => {
    if (!selectedCategory) return;
    
    const newTerms = [...terms];
    newTerms[termIndex].categories[categoryIndex].faculty[facultyIndex].imageUrl = '';
    setTerms(newTerms);
    
    // selectedCategory 업데이트
    const updatedFaculty = [...selectedCategory.faculty];
    updatedFaculty[facultyIndex] = {
      ...updatedFaculty[facultyIndex],
      imageUrl: ''
    };
    
    setSelectedCategory({
      ...selectedCategory,
      faculty: updatedFaculty
    });
  };
  
  // 저장
  const handleSave = () => {
    setIsSaving(true);
    
    // 빈 항목 필터링하되 카테고리는 유지
    const filteredTerms = terms.map(term => {
      // 각 카테고리의 강사 중 이름이 있는 강사만 필터링
      const updatedCategories = term.categories.map(category => {
        // 이름이 있는 강사만 필터링
        const validFaculty = category.faculty.filter(f => f.name && f.name.trim() !== '');
        console.log(`${category.name} 유효한 강사 수:`, validFaculty.length);
        
        // 유효한 강사 목록 출력
        validFaculty.forEach((f, i) => {
          console.log(`- 강사 ${i+1}: ${f.name}`);
        });
        
        return {
          ...category,
          faculty: validFaculty.length > 0 ? validFaculty : [{ id: '1', name: '', imageUrl: '', biography: '' }]
        };
      });
      
      return {
        ...term,
        categories: updatedCategories
      };
    });
    
    console.log('저장할 데이터:', JSON.stringify(filteredTerms, null, 2));
    
    // 로컬 스토리지에 저장
    localStorage.setItem('faculty-data', JSON.stringify(filteredTerms));
    
    // 저장 후 데이터 확인
    setTimeout(() => {
      try {
        const savedData = localStorage.getItem('faculty-data');
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          console.log('저장된 데이터 확인:', parsedData);
          
          // 각 카테고리별 강사 수 확인
          if (Array.isArray(parsedData) && parsedData.length > 0) {
            parsedData.forEach((term, termIndex) => {
              if (term.categories && Array.isArray(term.categories)) {
                term.categories.forEach(category => {
                  if (category.faculty && Array.isArray(category.faculty)) {
                    console.log(`기수 ${termIndex+1} ${category.name} 강사 수:`, category.faculty.length);
                    category.faculty.forEach((f, i) => {
                      console.log(`- 강사 ${i+1}: ${f.name}`);
                    });
                  }
                });
              }
            });
          }
        }
      } catch (error) {
        console.error('저장된 데이터 확인 중 오류:', error);
      }
      
      setIsSaving(false);
      toast({
        title: "저장 완료",
        description: "강사진 정보가 성공적으로 저장되었습니다. 강사진 페이지에서 확인하실 수 있습니다.",
        duration: 5000,
      });
    }, 500);
  };
  
  if (isLoading) {
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
      <main className="pt-24 pb-16">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">강사진 관리</CardTitle>
            <p className="text-gray-500 mt-2">
              기수별로 강사진 정보를 관리합니다. 특별강사진과 서울대 정치외교학부 교수진을 추가할 수 있습니다.
            </p>
          </CardHeader>
          <CardContent>
            <Tabs value={terms[activeTermIndex]?.term || '1'} className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">기수 선택</h3>
                <Button 
                  onClick={addTerm} 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  기수 추가
                </Button>
              </div>
              
              <TabsList className="w-full overflow-x-auto flex-wrap">
                {terms.map((term, index) => (
                  <div key={index} className="flex items-center">
                    <TabsTrigger 
                      value={term.term} 
                      onClick={() => setActiveTermIndex(index)}
                      className="flex-shrink-0"
                    >
                      {index + 1}기
                    </TabsTrigger>
                    {terms.length > 1 && (
                      <Button 
                        onClick={() => removeTerm(index)} 
                        variant="ghost" 
                        size="sm"
                        className="h-6 w-6 p-0 ml-1 text-gray-400 hover:text-red-500"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </Button>
                    )}
                  </div>
                ))}
              </TabsList>
              
              {terms.map((term, termIndex) => (
                <TabsContent key={termIndex} value={term.term} className="space-y-6">
                  {/* 카테고리 선택 */}
                  <div className="space-y-4">
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold mb-2">카테고리 선택</h3>
                      <p className="text-sm text-gray-500 mb-2">
                        아래 버튼을 클릭하여 입력할 강사진 카테고리를 선택하세요.
                      </p>
                      <p className="text-xs text-blue-500 mb-2">
                        현재 선택된 카테고리: {selectedCategory?.name || '없음'} (인덱스: {activeCategoryIndex})
                      </p>
                      <p className="text-xs text-red-500 mb-2">
                        카테고리 수: {term.categories?.length || 0}
                      </p>
                      {term.categories?.map((cat, idx) => (
                        <p key={idx} className="text-xs text-gray-500">
                          카테고리 {idx+1}: {cat.name} (ID: {cat.id})
                        </p>
                      ))}
                    </div>
                    
                    {/* 카테고리 버튼 */}
                    <div className="grid grid-cols-1 gap-4 mb-8">
                      {term.categories && term.categories.length > 0 ? (
                        term.categories.map((category, categoryIndex) => (
                          <button
                            key={categoryIndex}
                            type="button"
                            className={`py-5 px-6 rounded-lg text-center transition-all text-lg border-2 ${
                              activeCategoryIndex === categoryIndex 
                                ? 'bg-mainBlue text-white font-bold shadow-lg border-mainBlue' 
                                : 'bg-white text-gray-700 hover:bg-gray-100 border-gray-200'
                            }`}
                            onClick={() => {
                              console.log('카테고리 버튼 클릭:', categoryIndex, category.name);
                              setActiveCategoryIndex(categoryIndex);
                              setSelectedCategory(category);
                              
                              // 상태 업데이트 확인을 위한 알림
                              toast({
                                title: `${category.name} 선택됨`,
                                description: "이제 이 카테고리의 강사진을 관리할 수 있습니다.",
                                duration: 2000,
                              });
                            }}
                          >
                            {category.name}
                          </button>
                        ))
                      ) : (
                        <div className="col-span-2 text-center py-4 bg-gray-100 rounded-lg">
                          <p className="text-gray-500">카테고리가 없습니다.</p>
                        </div>
                      )}
                    </div>
                    
                    {/* 선택된 카테고리 내용 */}
                    <div className="space-y-6 mt-4">
                      {selectedCategory && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium">{selectedCategory.name} 목록</h3>
                            <Button 
                              onClick={() => addFaculty(termIndex, activeCategoryIndex)} 
                              variant="outline" 
                              size="sm"
                              className="flex items-center gap-1"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                              </svg>
                              강사 추가
                            </Button>
                          </div>
                          
                          {selectedCategory.faculty.map((faculty, facultyIndex) => (
                            <div key={facultyIndex} className="border p-4 rounded-md space-y-4 bg-gray-50">
                              <div className="flex justify-between items-center">
                                <h3 className="font-medium">강사 #{facultyIndex + 1}</h3>
                                <Button 
                                  onClick={() => removeFaculty(termIndex, activeCategoryIndex, facultyIndex)} 
                                  variant="destructive" 
                                  size="sm"
                                  disabled={selectedCategory.faculty.length <= 1}
                                >
                                  삭제
                                </Button>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">성명 <span className="text-red-500">*</span></label>
                                  <Input
                                    value={faculty.name}
                                    onChange={(e) => handleFacultyChange(termIndex, activeCategoryIndex, facultyIndex, 'name', e.target.value)}
                                    placeholder="강사 성명"
                                    required
                                  />
                                  {faculty.name.trim() === '' && (
                                    <p className="text-xs text-red-500">성명은 필수 입력 항목입니다.</p>
                                  )}
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">프로필 이미지</label>
                                  <div className="flex flex-col space-y-2">
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={(e) => handleImageChange(termIndex, activeCategoryIndex, facultyIndex, e)}
                                      ref={(el) => fileInputRefs.current[`${termIndex}-${activeCategoryIndex}-${facultyIndex}`] = el}
                                    />
                                    <div className="flex space-x-2">
                                      <Button 
                                        type="button" 
                                        variant="outline" 
                                        onClick={() => handleImageButtonClick(termIndex, activeCategoryIndex, facultyIndex)}
                                        className="flex-1"
                                      >
                                        {faculty.imageUrl ? '이미지 변경' : '이미지 선택'}
                                      </Button>
                                      {faculty.imageUrl && (
                                        <Button 
                                          type="button" 
                                          variant="destructive" 
                                          onClick={() => handleRemoveImage(termIndex, activeCategoryIndex, facultyIndex)}
                                          size="sm"
                                        >
                                          삭제
                                        </Button>
                                      )}
                                    </div>
                                    {faculty.imageUrl && (
                                      <div className="mt-2 relative w-full h-40 bg-gray-100 rounded-md overflow-hidden">
                                        <img 
                                          src={faculty.imageUrl} 
                                          alt={faculty.name || '강사 이미지'} 
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <label className="text-sm font-medium">약력</label>
                                <Textarea
                                  value={faculty.biography}
                                  onChange={(e) => handleFacultyChange(termIndex, activeCategoryIndex, facultyIndex, 'biography', e.target.value)}
                                  placeholder="강사 약력 정보 (여러 줄로 입력 가능)"
                                  rows={5}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button 
              onClick={handleSave} 
              disabled={isSaving}
              className="bg-mainBlue hover:bg-blue-700 text-white font-medium px-6 py-2"
            >
              {isSaving ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  <span>저장 중...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                    <polyline points="17 21 17 13 7 13 7 21"></polyline>
                    <polyline points="7 3 7 8 15 8"></polyline>
                  </svg>
                  <span>저장하기</span>
                </div>
              )}
            </Button>
          </CardFooter>
        </Card>
      </main>
      <Footer />
    </>
  );
};

export default FacultyManage; 