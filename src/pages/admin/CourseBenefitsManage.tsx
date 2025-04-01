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

interface BenefitItem {
  _id?: string;
  sectionTitle: string;
  title: string;
  description: string;
  order: number;
  isActive: boolean;
}

const CourseBenefitsManage = () => {
  const [sectionTitle, setSectionTitle] = useState('과정 특전');
  const [benefits, setBenefits] = useState<BenefitItem[]>([
    { 
      sectionTitle: '과정 특전',
      title: '', 
      description: '', 
      order: 0,
      isActive: true
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<{titles: Record<number, boolean>}>({
    titles: {}
  });
  const { isAuthenticated, isLoading: authLoading, token } = useAdminAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (isAuthenticated && token) {
      loadBenefits();
    }
  }, [isAuthenticated, token]);
  
  const loadBenefits = async () => {
    setIsLoading(true);
    try {
      console.log('MongoDB에서 특전 데이터 로드 시도...');
      
      // API 서비스를 사용하여 benefits 데이터 가져오기
      const response = await apiService.getBenefitsAll(token || '');
      console.log('특전 데이터 로드 결과:', response);
      
      if (response && response.length > 0) {
        // 첫 번째 항목에서 sectionTitle 가져오기
        setSectionTitle(response[0].sectionTitle || '과정 특전');
        
        // Benefits 배열 설정
        setBenefits(response.map((obj: any) => ({
          _id: obj._id,
          sectionTitle: obj.sectionTitle || '과정 특전',
          title: obj.title || '',
          description: obj.description || '',
          order: obj.order || 0,
          isActive: obj.isActive !== undefined ? obj.isActive : true
        })));
        
        console.log('MongoDB에서 특전 데이터 로드 성공');
      } else {
        console.log('MongoDB에 특전 데이터가 없음, 로컬 데이터 사용');
        // MongoDB에 데이터가 없는 경우 로컬 스토리지에서 초기 데이터 로드 시도
        loadFromLocalStorage();
      }
    } catch (error) {
      console.error('특전 데이터 로드 실패:', error);
      toast({
        title: "데이터 로딩 실패",
        description: "특전 데이터를 불러오는데 실패했습니다. 로컬 데이터를 사용합니다.",
        variant: "destructive"
      });
      
      // API 호출 실패 시 로컬 스토리지에서 데이터 로드
      loadFromLocalStorage();
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadFromLocalStorage = () => {
    const savedTitle = localStorage.getItem('course-benefits-title');
    const savedBenefits = localStorage.getItem('course-benefits');
    
    if (savedTitle) setSectionTitle(savedTitle);
    if (savedBenefits) {
      try {
        const parsedBenefits = JSON.parse(savedBenefits);
        if (Array.isArray(parsedBenefits)) {
          if (typeof parsedBenefits[0] === 'string') {
            // Handle old format (array of strings)
            setBenefits(parsedBenefits.map((description, index) => ({
              _id: `local-${index}`,
              sectionTitle: savedTitle || '과정 특전',
              title: '',
              description,
              order: index,
              isActive: true
            })));
          } else {
            // Handle transition format (array of {title, content})
            setBenefits(parsedBenefits.map((item: any, index: number) => ({
              _id: item._id || `local-${index}`,
              sectionTitle: savedTitle || '과정 특전',
              title: item.title || '',
              description: item.content || item.description || '',
              order: item.order || index,
              isActive: item.isActive !== false
            })));
          }
        }
      } catch (error) {
        console.error('로컬 스토리지에서 특전 데이터 파싱 실패:', error);
      }
    }
  };
  
  const handleBenefitChange = (index: number, field: keyof BenefitItem, value: string) => {
    const updatedBenefits = [...benefits];
    updatedBenefits[index] = {
      ...updatedBenefits[index],
      [field]: value
    };
    setBenefits(updatedBenefits);
  };
  
  const addBenefit = () => {
    const newOrder = benefits.length > 0 ? Math.max(...benefits.map(obj => obj.order)) + 1 : 0;
    
    setBenefits([
      ...benefits, 
      { 
        sectionTitle: sectionTitle,
        title: '', 
        description: '', 
        order: newOrder,
        isActive: true
      }
    ]);
  };
  
  const removeBenefit = async (index: number) => {
    if (benefits.length <= 1) return;
    
    const benefitToRemove = benefits[index];
    
    // If the benefit has an ID, it exists in the database and needs to be deleted
    if (benefitToRemove._id && !benefitToRemove._id.startsWith('local-')) {
      try {
        await apiService.deleteBenefit(benefitToRemove._id, token);
        
        toast({
          title: "삭제 완료",
          description: "특전이 성공적으로 삭제되었습니다.",
        });
      } catch (error) {
        console.error('특전 삭제 실패:', error);
        toast({
          title: "삭제 실패",
          description: "서버에서 특전을 삭제하는데 실패했습니다.",
          variant: "destructive"
        });
        return; // 삭제 실패 시 함수 종료
      }
    }
    
    // Update local state
    const newBenefits = benefits.filter((_, i) => i !== index);
    
    // 순서 재정렬
    newBenefits.forEach((obj, idx) => {
      obj.order = idx;
    });
    
    setBenefits(newBenefits);
  };
  
  const handleSave = async () => {
    // 유효성 검사
    const newErrors = {
      titles: {} as Record<number, boolean>
    };
    
    let hasError = false;
    
    benefits.forEach((benefit, index) => {
      if (benefit.title.trim() === '') {
        newErrors.titles[index] = true;
        hasError = true;
      }
    });
    
    setErrors(newErrors);
    
    if (hasError) {
      toast({
        title: "저장 실패",
        description: "모든 필수 항목을 입력해주세요.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      console.log('특전 데이터 저장 시작...');
      
      // 모든 Benefit에 동일한 sectionTitle 적용
      const benefitsToSave = benefits.map(obj => ({
        ...obj,
        sectionTitle: sectionTitle
      }));
      
      // 기존 데이터 ID가 있는 경우 업데이트, 없는 경우 새로 생성
      const savePromises = benefitsToSave.map(async (obj) => {
        if (obj._id && !obj._id.startsWith('local-')) {
          // 기존 항목 업데이트
          console.log(`ID ${obj._id}를 가진 특전 업데이트`);
          return apiService.updateBenefit(obj._id, obj, token);
        } else {
          // 새 항목 생성
          console.log('새 특전 항목 생성');
          return apiService.createBenefit(obj, token);
        }
      });
      
      await Promise.all(savePromises);
      console.log('특전 데이터 저장 성공');
      
      // 로컬 스토리지에도 백업 저장
      localStorage.setItem('course-benefits-title', sectionTitle);
      localStorage.setItem('course-benefits', JSON.stringify(
        benefits.map(obj => ({
          title: obj.title,
          description: obj.description
        }))
      ));
      
      toast({
        title: "저장 완료",
        description: "과정의 특전이 성공적으로 저장되었습니다.",
      });
      
      // 데이터 다시 로드
      loadBenefits();
    } catch (error) {
      console.error('특전 저장 실패:', error);
      toast({
        title: "저장 실패",
        description: "서버에 데이터를 저장하는데 실패했습니다. 로컬에만 저장되었습니다.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
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
      <div className="container mx-auto py-8 px-4 pt-24">
        <h1 className="text-3xl font-bold text-mainBlue mb-6">관리자 대시보드</h1>
        
        <AdminNavTabs activeTab="content" />
        <AdminHomeButton />
        
        <Card className="w-full mt-6">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-mainBlue">과정의 특전 관리</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mainBlue"></div>
              </div>
            ) : (
              <>
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
                          onClick={async () => {
                            // Display a confirmation dialog
                            if (window.confirm('정말로 이 특전을 삭제하시겠습니까?')) {
                              await removeBenefit(index);
                            }
                          }}
                          disabled={benefits.length <= 1}
                        >
                          삭제
                        </Button>
                      </div>
                      
                      <div className="mb-6">
                        <label htmlFor={`benefit-title-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                          특전 제목
                        </label>
                        <Input
                          id={`benefit-title-${index}`}
                          value={benefit.title}
                          onChange={(e) => handleBenefitChange(index, 'title', e.target.value)}
                          placeholder="특전의 제목을 입력하세요"
                          className={`w-full ${errors.titles[index] ? 'border-red-500' : ''}`}
                          required
                        />
                        {errors.titles[index] && (
                          <p className="mt-1 text-sm text-red-500">특전 제목은 필수입니다</p>
                        )}
                      </div>
                      
                      <div className="mb-4">
                        <label htmlFor={`benefit-description-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                          특전 내용
                        </label>
                        <Textarea
                          id={`benefit-description-${index}`}
                          value={benefit.description}
                          onChange={(e) => handleBenefitChange(index, 'description', e.target.value)}
                          placeholder="특전의 내용을 입력하세요"
                          className="w-full"
                          rows={3}
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
              </>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleSave} 
              disabled={isLoading || isSaving} 
              className="ml-auto"
            >
              {isSaving ? '저장 중...' : '저장하기'}
            </Button>
          </CardFooter>
        </Card>
      </div>
      <Footer />
    </>
  );
};

export default CourseBenefitsManage;
