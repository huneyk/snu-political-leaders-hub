import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import AdminHomeButton from '@/components/admin/AdminHomeButton';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AdminNavTabs from '@/components/admin/AdminNavTabs';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useNavigate } from 'react-router-dom';

// API 기본 URL 설정
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:5001/api';

interface ObjectiveItem {
  _id?: string;
  sectionTitle: string;
  title: string;
  description: string;
  iconImage: string;
  iconType: string;
  order: number;
  isActive: boolean;
}

const CourseGoalManage = () => {
  const [sectionTitle, setSectionTitle] = useState('과정의 목표');
  const [objectives, setObjectives] = useState<ObjectiveItem[]>([
    { 
      sectionTitle: '과정의 목표',
      title: '', 
      description: '', 
      iconImage: '',
      iconType: 'default',
      order: 0,
      isActive: true
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { isAuthenticated, isLoading: authLoading, token } = useAdminAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (isAuthenticated && token) {
      loadObjectives();
    }
  }, [isAuthenticated, token]);
  
  const loadObjectives = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/content/objectives/all`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data && response.data.length > 0) {
        // 첫 번째 항목에서 sectionTitle 가져오기
        setSectionTitle(response.data[0].sectionTitle || '과정의 목표');
        
        // Objectives 배열 설정
        setObjectives(response.data.map((obj: any) => ({
          _id: obj._id,
          sectionTitle: obj.sectionTitle || '과정의 목표',
          title: obj.title || '',
          description: obj.description || '',
          iconImage: obj.iconImage || '',
          iconType: obj.iconType || 'default',
          order: obj.order || 0,
          isActive: obj.isActive !== undefined ? obj.isActive : true
        })));
      } else {
        // MongoDB에 데이터가 없는 경우 로컬 스토리지에서 초기 데이터 로드 시도
        loadFromLocalStorage();
      }
    } catch (error) {
      console.error('Failed to load objectives:', error);
      toast({
        title: "데이터 로딩 실패",
        description: "목표 데이터를 불러오는데 실패했습니다. 로컬 데이터를 사용합니다.",
        variant: "destructive"
      });
      
      // API 호출 실패 시 로컬 스토리지에서 데이터 로드
      loadFromLocalStorage();
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadFromLocalStorage = () => {
    // 로컬 스토리지에서 기존 데이터 로드
    const savedTitle = localStorage.getItem('course-goal-title');
    const savedGoals = localStorage.getItem('course-goals');
    
    if (savedTitle) setSectionTitle(savedTitle);
    if (savedGoals) {
      try {
        const parsedGoals = JSON.parse(savedGoals);
        // Handle existing data format (string array) and convert to new format
        if (Array.isArray(parsedGoals)) {
          if (typeof parsedGoals[0] === 'string') {
            // 이전 형식의 데이터 변환
            setObjectives(parsedGoals.map((goal, index) => ({ 
              sectionTitle: savedTitle || '과정의 목표',
              title: '', 
              description: goal, 
              iconImage: '',
              iconType: 'default',
              order: index,
              isActive: true
            })));
          } else {
            // 새 형식과 호환되는 데이터 변환
            setObjectives(parsedGoals.map((goal: any, index: number) => ({ 
              sectionTitle: savedTitle || '과정의 목표',
              title: goal.title || '', 
              description: goal.content || '', 
              iconImage: goal.imageUrl || '',
              iconType: 'default',
              order: index,
              isActive: true
            })));
          }
        }
      } catch (error) {
        console.error('Failed to parse goals:', error);
      }
    }
  };
  
  const handleObjectiveChange = (index: number, field: keyof ObjectiveItem, value: any) => {
    const newObjectives = [...objectives];
    
    // 특정 필드 업데이트
    newObjectives[index] = {
      ...newObjectives[index],
      [field]: value
    };
    
    // sectionTitle 필드인 경우 모든 항목에 동일하게 적용
    if (field === 'sectionTitle') {
      setSectionTitle(value);
      newObjectives.forEach(obj => {
        obj.sectionTitle = value;
      });
    }
    
    setObjectives(newObjectives);
  };
  
  const addObjective = () => {
    const newOrder = objectives.length > 0 ? Math.max(...objectives.map(obj => obj.order)) + 1 : 0;
    
    setObjectives([
      ...objectives, 
      { 
        sectionTitle: sectionTitle,
        title: '', 
        description: '', 
        iconImage: '',
        iconType: 'default',
        order: newOrder,
        isActive: true
      }
    ]);
  };
  
  const removeObjective = (index: number) => {
    if (objectives.length <= 1) return;
    const newObjectives = objectives.filter((_, i) => i !== index);
    
    // 순서 재정렬
    newObjectives.forEach((obj, idx) => {
      obj.order = idx;
    });
    
    setObjectives(newObjectives);
  };
  
  const handleSave = async () => {
    // 유효성 검사
    const validObjectives = objectives.filter(obj => 
      obj.title.trim() !== '' && obj.description.trim() !== ''
    );
    
    if (validObjectives.length === 0) {
      toast({
        title: "저장 실패",
        description: "최소 하나 이상의 목표를 입력해주세요.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      // 모든 Objective에 동일한 sectionTitle 적용
      const objectivesToSave = validObjectives.map(obj => ({
        ...obj,
        sectionTitle: sectionTitle
      }));
      
      // 기존 데이터 ID가 있는 경우 업데이트, 없는 경우 새로 생성
      const savePromises = objectivesToSave.map(async (obj) => {
        if (obj._id) {
          // 기존 항목 업데이트
          return axios.put(`${API_BASE_URL}/content/objectives/${obj._id}`, obj, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
        } else {
          // 새 항목 생성
          return axios.post(`${API_BASE_URL}/content/objectives`, obj, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
        }
      });
      
      await Promise.all(savePromises);
      
      // 로컬 스토리지에도 백업 저장
      localStorage.setItem('course-goal-title', sectionTitle);
      localStorage.setItem('course-goals', JSON.stringify(
        objectives.map(obj => ({
          title: obj.title,
          content: obj.description,
          imageUrl: obj.iconImage
        }))
      ));
      
      toast({
        title: "저장 완료",
        description: "과정의 목표가 성공적으로 저장되었습니다.",
      });
      
      // 데이터 다시 로드
      loadObjectives();
    } catch (error) {
      console.error('Failed to save objectives:', error);
      toast({
        title: "저장 실패",
        description: "서버에 데이터를 저장하는데 실패했습니다. 로컬에만 저장되었습니다.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // 이미지 파일 업로드 처리
  const handleFileUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // 파일 크기 제한 (2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "파일 크기 초과",
        description: "파일 크기는 2MB 이하여야 합니다.",
        variant: "destructive"
      });
      return;
    }
    
    // 이미지 파일 타입 확인
    if (!file.type.startsWith('image/')) {
      toast({
        title: "잘못된 파일 형식",
        description: "이미지 파일만 업로드 가능합니다.",
        variant: "destructive"
      });
      return;
    }

    // 파일을 Base64 문자열로 변환
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Base64 이미지를 iconImage 필드에 저장
      handleObjectiveChange(index, 'iconImage', base64String);
    };
    reader.readAsDataURL(file);
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
            <CardTitle>과정의 목표 관리</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
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
                    placeholder="과정 목표 섹션의 제목을 입력하세요"
                  />
                </div>
                
                <div className="space-y-6">
                  <label className="text-sm font-medium">목표 항목</label>
                  {objectives.map((objective, index) => (
                    <div key={index} className="border p-4 rounded-md space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">목표 #{index + 1}</h3>
                        <Button 
                          type="button" 
                          variant="destructive" 
                          onClick={() => removeObjective(index)}
                          disabled={objectives.length <= 1}
                          size="sm"
                        >
                          삭제
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`objective-image-${index}`} className="text-sm font-medium">목표 아이콘</Label>
                        <div className="mb-4">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(index, e)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-mainBlue focus:border-mainBlue"
                          />
                          <p className="mt-1 text-sm text-gray-500">아이콘으로 사용할 정사각형 이미지를 업로드해주세요.</p>
                          
                          {objective.iconImage && (
                            <div className="mt-2">
                              <div className="w-16 h-16 rounded-full overflow-hidden shadow-md bg-mainBlue">
                                <img 
                                  src={objective.iconImage} 
                                  alt={objective.title || `목표 ${index + 1}`}
                                  className="w-full h-full object-cover" 
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`objective-title-${index}`} className="text-sm font-medium">목표 제목</Label>
                        <Input
                          id={`objective-title-${index}`}
                          value={objective.title}
                          onChange={(e) => handleObjectiveChange(index, 'title', e.target.value)}
                          placeholder="목표 제목을 입력하세요"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`objective-description-${index}`} className="text-sm font-medium">목표 내용</Label>
                        <Textarea
                          id={`objective-description-${index}`}
                          value={objective.description}
                          onChange={(e) => handleObjectiveChange(index, 'description', e.target.value)}
                          placeholder="목표 내용을 입력하세요"
                          rows={3}
                        />
                      </div>
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={addObjective} className="w-full">
                    목표 추가
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

export default CourseGoalManage;
