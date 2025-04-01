import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import AdminLayout from '@/components/admin/AdminLayout';
import { apiService } from '@/lib/apiService';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AdminNavTabs from '@/components/admin/AdminNavTabs';
import AdminHomeButton from '@/components/admin/AdminHomeButton';

// 일정 인터페이스 정의 (MongoDB 스키마에 맞춤)
interface Schedule {
  _id?: string; // MongoDB ID
  term: number;
  year: string;
  category: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  isActive: boolean;
}

// 30분 단위 시간 옵션 생성
const generateTimeOptions = () => {
  const options = [];
  for (let hour = 0; hour < 24; hour++) {
    const hourStr = hour.toString().padStart(2, '0');
    options.push(`${hourStr}:00`);
    options.push(`${hourStr}:30`);
  }
  return options;
};

const TIME_OPTIONS = generateTimeOptions();

// 줄바꿈을 HTML <br> 태그로 변환하는 함수
const formatDescription = (text: string) => {
  return text.split('\n').map((line, index, array) => (
    <React.Fragment key={index}>
      {line}
      {index < array.length - 1 && <br />}
    </React.Fragment>
  ));
};

const ScheduleManage = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('academic');
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedTerm, setSelectedTerm] = useState<number>(1);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  
  // 새 일정 상태
  const [newSchedule, setNewSchedule] = useState<Schedule>({
    _id: '',
    term: 1,
    year: new Date().getFullYear().toString(),
    category: 'academic',
    title: '',
    date: '',
    time: '',
    location: '',
    description: '',
    isActive: true
  });

  const { isAuthenticated, isLoading: authLoading, token } = useAdminAuth();
  const navigate = useNavigate();

  // 탭 변경 시 일정 로드 및 새 일정 카테고리 업데이트
  useEffect(() => {
    if (isAuthenticated && token) {
      loadSchedules();
      
      // 새 일정 폼 초기화
      setNewSchedule({
        _id: '',
        term: selectedTerm,
        year: new Date().getFullYear().toString(),
        category: activeTab,
        title: '',
        date: '',
        time: '',
        location: '',
        description: '',
        isActive: true
      });
      
      // 선택 초기화
      setSelectedSchedule(null);
    }
  }, [isAuthenticated, token, activeTab]);
  
  // 선택된 학기 변경 시 새 일정 학기 업데이트
  useEffect(() => {
    setNewSchedule(prev => ({
      ...prev,
      term: selectedTerm
    }));
  }, [selectedTerm]);

  // MongoDB에서 일정 데이터 불러오기
  const loadSchedules = async () => {
    try {
      setIsLoading(true);
      console.log('▶️▶️▶️ 일정 데이터 로드 시작 ▶️▶️▶️');
      console.log('현재 탭:', activeTab);
      
      try {
        // API 호출하여 모든 일정 데이터 가져오기 (token은 선택적)
        console.log('MongoDB에서 일정 데이터 가져오기 시도');
        const data = await apiService.getSchedulesAll(token || '');
        
        if (data && Array.isArray(data)) {
          console.log(`전체 일정 ${data.length}개 로드됨`);
          
          // 현재 탭에 맞는 일정만 필터링
          const filteredData = data.filter(schedule => schedule.category === activeTab);
          console.log(`현재 탭(${activeTab})에 해당하는 일정: ${filteredData.length}개`);
          
          // MongoDB 데이터 형식을 컴포넌트에서 사용하는 형식으로 변환
          const formattedData = filteredData.map(schedule => {
            // 날짜 형식 변환 (ISO -> YYYY-MM-DD)
            const dateObj = new Date(schedule.date);
            const formattedDate = dateObj.toISOString().split('T')[0];
            
            return {
              _id: schedule._id,
              term: schedule.term,
              year: schedule.year || new Date().getFullYear().toString(),
              category: schedule.category,
              title: schedule.title,
              date: formattedDate,
              time: schedule.time || '',
              location: schedule.location || '',
              description: schedule.description || '',
              isActive: schedule.isActive !== undefined ? schedule.isActive : true
            };
          });
          
          setSchedules(formattedData);
          console.log('일정 데이터 상태 업데이트 완료');
          
          toast({
            title: "데이터 로드 성공",
            description: `${formattedData.length}개의 일정 데이터를 성공적으로 불러왔습니다.`,
          });
          return;
        } else {
          console.warn('API 응답이 배열이 아님:', data);
          throw new Error('Invalid data format');
        }
      } catch (error) {
        console.error('MongoDB 데이터 로드 실패, 로컬 스토리지로 폴백:', error);
        
        // MongoDB 연결 실패 시 로컬 스토리지에서 불러오기 시도
        console.log('로컬 스토리지에서 데이터 복원 시도');
        const storageKey = activeTab === 'academic' ? 'academicSchedules' : 'specialActivities';
        const savedSchedules = localStorage.getItem(storageKey);
        
        if (savedSchedules) {
          try {
            console.log(`로컬 스토리지 키 '${storageKey}'에서 데이터 찾음`);
            const parsedSchedules = JSON.parse(savedSchedules);
            // term 필드를 문자열에서 숫자로 변환
            const convertedSchedules = parsedSchedules.map((schedule: any) => ({
              ...schedule,
              _id: schedule._id || schedule.id || Date.now().toString(),
              term: typeof schedule.term === 'string' ? parseInt(schedule.term, 10) : schedule.term,
              year: schedule.year || new Date().getFullYear().toString(),
              isActive: schedule.isActive !== undefined ? schedule.isActive : true
            }));
            
            console.log(`로컬 스토리지에서 ${convertedSchedules.length}개의 일정 로드됨`);
            setSchedules(convertedSchedules);
            
            toast({
              title: "로컬 데이터 로드 성공",
              description: "MongoDB에 연결할 수 없어 로컬 데이터를 불러왔습니다.",
            });
            return;
          } catch (parseError) {
            console.error('로컬 스토리지 데이터 파싱 실패:', parseError);
          }
        } else {
          console.log(`로컬 스토리지 키 '${storageKey}'에 데이터 없음`);
        }
      }
      
      // 모든 시도 실패 시 빈 배열로 초기화
      console.log('모든 데이터 소스에서 일정을 찾을 수 없음, 빈 배열 반환');
      setSchedules([]);
      
      toast({
        title: "데이터 없음",
        description: "등록된 일정이 없습니다.",
      });
    } catch (error) {
      console.error('일정 데이터 로드 중 예기치 않은 오류:', error);
      
      toast({
        title: "데이터 로드 실패",
        description: "일정 데이터를 불러오는데 실패했습니다.",
        variant: "destructive"
      });
      
      setSchedules([]);
    } finally {
      setIsLoading(false);
      console.log('▶️▶️▶️ 일정 데이터 로드 완료 ▶️▶️▶️');
    }
  };

  // 일정 추가
  const handleAddSchedule = async () => {
    if (!newSchedule.title || !newSchedule.date) {
      toast({
        title: "입력 오류",
        description: "제목과 날짜는 필수 입력 항목입니다.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSaving(true);
      console.log('▶️▶️▶️ 새 일정 추가 시작 ▶️▶️▶️');
      console.log('일정 데이터:', {
        제목: newSchedule.title,
        날짜: newSchedule.date,
        카테고리: newSchedule.category,
        학기: newSchedule.term
      });

      const scheduleToAdd = {
        ...newSchedule,
        isActive: true,
        // 학사 일정인 경우에만 카테고리를 'academic'으로 설정하고,
        // 특별활동인 경우에는 사용자가 선택한 카테고리 값을 유지
        category: activeTab === 'academic' ? 'academic' : newSchedule.category,
      };

      try {
        // API를 통해 새 일정 저장 (token은 선택적)
        console.log('MongoDB에 새 일정 저장 시도');
        const savedSchedule = await apiService.createSchedule(scheduleToAdd, token || '');
        
        if (savedSchedule && savedSchedule._id) {
          console.log('MongoDB에 일정 저장 성공, ID:', savedSchedule._id);
          
          // 저장된 일정을 목록에 추가
          setSchedules(prev => [...prev, {
            _id: savedSchedule._id,
            ...scheduleToAdd
          }]);
          
          // 폼 초기화
          setNewSchedule({
            _id: '',
            term: selectedTerm,
            year: new Date().getFullYear().toString(),
            category: activeTab === 'academic' ? 'academic' : 'field', // 특별활동의 경우 기본값을 'field'로 설정
            title: '',
            date: '',
            time: '',
            location: '',
            description: '',
            isActive: true
          });
          
          toast({
            title: "저장 완료",
            description: "새 일정이 성공적으로 추가되었습니다.",
          });
          return;
        } else {
          console.error('MongoDB 응답에 _id가 없음:', savedSchedule);
          throw new Error('Invalid response from server');
        }
      } catch (apiError) {
        console.error('MongoDB에 저장 실패, 로컬 스토리지로 폴백:', apiError);
        
        // MongoDB 저장 실패 시 로컬 스토리지에 저장
        const localId = Date.now().toString();
        const localSchedule = {
          ...scheduleToAdd,
          _id: localId
        };
        
        console.log('로컬 스토리지에 일정 저장, 임시 ID:', localId);
        
        // 현재 일정 목록에 추가
        setSchedules(prev => [...prev, localSchedule]);
        
        // 로컬 스토리지에 저장
        const storageKey = activeTab === 'academic' ? 'academicSchedules' : 'specialActivities';
        const currentSchedules = JSON.parse(localStorage.getItem(storageKey) || '[]');
        localStorage.setItem(storageKey, JSON.stringify([...currentSchedules, localSchedule]));
        
        // 폼 초기화
        setNewSchedule({
          _id: '',
          term: selectedTerm,
          year: new Date().getFullYear().toString(),
          category: activeTab === 'academic' ? 'academic' : 'field', // 특별활동의 경우 기본값을 'field'로 설정
          title: '',
          date: '',
          time: '',
          location: '',
          description: '',
          isActive: true
        });
        
        toast({
          title: "로컬에 저장 완료",
          description: "MongoDB에 저장할 수 없어 로컬에 일정을 저장했습니다.",
        });
        return;
      }
    } catch (error) {
      console.error('일정 추가 실패:', error);
      toast({
        title: "저장 실패",
        description: "일정을 추가하는 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
      console.log('▶️▶️▶️ 일정 추가 작업 완료 ▶️▶️▶️');
    }
  };

  // 일정 업데이트
  const handleUpdateSchedule = async () => {
    if (!selectedSchedule || !selectedSchedule._id) {
      toast({
        title: "선택 오류",
        description: "수정할 일정을 선택해주세요.",
        variant: "destructive"
      });
      return;
    }
    
    if (!selectedSchedule.title || !selectedSchedule.date) {
      toast({
        title: "입력 오류",
        description: "제목과 날짜는 필수 입력 항목입니다.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSaving(true);
      console.log(`▶️▶️▶️ 일정 업데이트 시작 (ID: ${selectedSchedule._id}) ▶️▶️▶️`);
      console.log('업데이트 데이터:', {
        제목: selectedSchedule.title,
        날짜: selectedSchedule.date,
        카테고리: selectedSchedule.category,
        학기: selectedSchedule.term
      });
      
      try {
        // API를 통해 일정 업데이트 (token은 선택적)
        console.log('MongoDB에 일정 업데이트 시도');
        await apiService.updateSchedule(selectedSchedule._id, selectedSchedule, token || '');
        
        console.log('MongoDB 일정 업데이트 성공');
        
        // 상태 업데이트
        setSchedules(prev => 
          prev.map(schedule => 
            schedule._id === selectedSchedule._id ? selectedSchedule : schedule
          )
        );
        
        // 선택 초기화
        setSelectedSchedule(null);
        
        toast({
          title: "업데이트 완료",
          description: "일정이 성공적으로 업데이트되었습니다.",
        });
        return;
      } catch (apiError) {
        console.error('MongoDB 업데이트 실패, 로컬 스토리지로 폴백:', apiError);
        
        // MongoDB 업데이트 실패 시 로컬 스토리지에 저장
        console.log('로컬 스토리지에 일정 업데이트');
        
        // 상태 업데이트
        setSchedules(prev => 
          prev.map(schedule => 
            schedule._id === selectedSchedule._id ? selectedSchedule : schedule
          )
        );
        
        // 로컬 스토리지 업데이트
        const storageKey = activeTab === 'academic' ? 'academicSchedules' : 'specialActivities';
        const currentSchedules = JSON.parse(localStorage.getItem(storageKey) || '[]');
        const updatedSchedules = currentSchedules.map((schedule: Schedule) => 
          schedule._id === selectedSchedule._id ? selectedSchedule : schedule
        );
        localStorage.setItem(storageKey, JSON.stringify(updatedSchedules));
        
        // 선택 초기화
        setSelectedSchedule(null);
        
        toast({
          title: "로컬 업데이트 완료",
          description: "MongoDB에 연결할 수 없어 로컬에 일정을 업데이트했습니다.",
        });
        return;
      }
    } catch (error) {
      console.error('일정 업데이트 실패:', error);
      toast({
        title: "업데이트 실패",
        description: "일정을 업데이트하는 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
      console.log('▶️▶️▶️ 일정 업데이트 작업 완료 ▶️▶️▶️');
    }
  };
  
  // 일정 삭제
  const handleDeleteSchedule = async (scheduleId: string) => {
    if (!scheduleId) {
      toast({
        title: "선택 오류",
        description: "삭제할 일정을 선택해주세요.",
        variant: "destructive"
      });
      return;
    }
    
    if (!window.confirm('이 일정을 정말 삭제하시겠습니까?')) {
      return;
    }
    
    try {
      setIsSaving(true);
      console.log(`▶️▶️▶️ 일정 삭제 시작 (ID: ${scheduleId}) ▶️▶️▶️`);
      
      try {
        // API를 통해 일정 삭제 (token은 선택적)
        console.log('MongoDB에서 일정 삭제 시도');
        await apiService.deleteSchedule(scheduleId, token || '');
        
        console.log('MongoDB 일정 삭제 성공');
        
        // 상태 업데이트
        setSchedules(prev => prev.filter(schedule => schedule._id !== scheduleId));
        
        // 선택된 일정이 삭제되는 경우 선택 초기화
        if (selectedSchedule && selectedSchedule._id === scheduleId) {
          setSelectedSchedule(null);
        }
        
        toast({
          title: "삭제 완료",
          description: "일정이 성공적으로 삭제되었습니다.",
        });
        return;
      } catch (apiError) {
        console.error('MongoDB 삭제 실패, 로컬 스토리지로 폴백:', apiError);
        
        // MongoDB 삭제 실패 시 로컬 스토리지에서 삭제
        console.log('로컬 스토리지에서 일정 삭제');
        
        // 상태 업데이트
        setSchedules(prev => prev.filter(schedule => schedule._id !== scheduleId));
        
        // 선택된 일정이 삭제되는 경우 선택 초기화
        if (selectedSchedule && selectedSchedule._id === scheduleId) {
          setSelectedSchedule(null);
        }
        
        // 로컬 스토리지 업데이트
        const storageKey = activeTab === 'academic' ? 'academicSchedules' : 'specialActivities';
        const currentSchedules = JSON.parse(localStorage.getItem(storageKey) || '[]');
        const updatedSchedules = currentSchedules.filter((schedule: Schedule) => schedule._id !== scheduleId);
        localStorage.setItem(storageKey, JSON.stringify(updatedSchedules));
        
        toast({
          title: "로컬 삭제 완료",
          description: "MongoDB에 연결할 수 없어 로컬에서 일정을 삭제했습니다.",
        });
        return;
      }
    } catch (error) {
      console.error('일정 삭제 실패:', error);
      toast({
        title: "삭제 실패",
        description: "일정을 삭제하는 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
      console.log('▶️▶️▶️ 일정 삭제 작업 완료 ▶️▶️▶️');
    }
  };

  // 일정 선택
  const handleSelectSchedule = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
  };

  // 필터링된 일정 목록
  const filteredSchedules = schedules.filter(
    schedule => schedule.term === selectedTerm
  );

  // 로딩 중 표시
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    navigate('/admin/login');
    return null;
  }

  return (
    <AdminLayout>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-mainBlue mb-6">일정 관리</h1>
        
        <Card className="w-full mt-6">
          <CardHeader>
            <CardTitle>일정 관리</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="academic" onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="academic">학사 일정</TabsTrigger>
                <TabsTrigger value="special">특별활동</TabsTrigger>
              </TabsList>
              
              <div className="mb-6">
                <Label htmlFor="term">기수</Label>
                <Input 
                  type="number"
                  id="term"
                  value={selectedTerm}
                  onChange={(e) => setSelectedTerm(Number(e.target.value))}
                  className="w-[180px]"
                  placeholder="학기 입력"
                />
              </div>
              
              <TabsContent value="academic" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex flex-row items-center justify-between">
                      <span>학사 일정 관리</span>
                      {isLoading && (
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary"></div>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-medium mb-4">새 학사 일정 추가</h3>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="title">제목</Label>
                            <Input 
                              id="title" 
                              value={newSchedule.title}
                              onChange={(e) => setNewSchedule({...newSchedule, title: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label htmlFor="date">날짜</Label>
                            <Input 
                              id="date" 
                              type="date"
                              value={newSchedule.date}
                              onChange={(e) => setNewSchedule({...newSchedule, date: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label htmlFor="time">시간 (30분 단위)</Label>
                            <Select 
                              value={newSchedule.time} 
                              onValueChange={(value) => setNewSchedule({...newSchedule, time: value})}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="시간 선택" />
                              </SelectTrigger>
                              <SelectContent>
                                {TIME_OPTIONS.map((time) => (
                                  <SelectItem key={time} value={time}>
                                    {time}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="location">장소</Label>
                            <Input 
                              id="location" 
                              value={newSchedule.location}
                              onChange={(e) => setNewSchedule({...newSchedule, location: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label htmlFor="description">설명</Label>
                            <Textarea 
                              id="description" 
                              value={newSchedule.description}
                              onChange={(e) => setNewSchedule({...newSchedule, description: e.target.value})}
                              placeholder="일정에 대한 상세 설명을 입력하세요"
                              className="min-h-[100px]"
                            />
                          </div>
                          <Button
                            onClick={handleAddSchedule}
                            disabled={isSaving || !newSchedule.title || !newSchedule.date}
                          >
                            {isSaving ? (
                              <div className="flex items-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                                <span>저장 중...</span>
                              </div>
                            ) : (
                              "일정 추가"
                            )}
                          </Button>
                        </div>
                      </div>
                      
                      {selectedSchedule && (
                        <div>
                          <h3 className="text-lg font-medium mb-4">일정 수정</h3>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="edit-title">제목</Label>
                              <Input 
                                id="edit-title" 
                                value={selectedSchedule.title}
                                onChange={(e) => setSelectedSchedule({...selectedSchedule, title: e.target.value})}
                              />
                            </div>
                            <div>
                              <Label htmlFor="edit-date">날짜</Label>
                              <Input 
                                id="edit-date" 
                                type="date"
                                value={selectedSchedule.date}
                                onChange={(e) => setSelectedSchedule({...selectedSchedule, date: e.target.value})}
                              />
                            </div>
                            <div>
                              <Label htmlFor="edit-time">시간 (30분 단위)</Label>
                              <Select 
                                value={selectedSchedule.time} 
                                onValueChange={(value) => setSelectedSchedule({...selectedSchedule, time: value})}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="시간 선택" />
                                </SelectTrigger>
                                <SelectContent>
                                  {TIME_OPTIONS.map((time) => (
                                    <SelectItem key={time} value={time}>
                                      {time}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="edit-location">장소</Label>
                              <Input
                                id="edit-location" 
                                value={selectedSchedule.location}
                                onChange={(e) => setSelectedSchedule({...selectedSchedule, location: e.target.value})}
                              />
                            </div>
                            <div>
                              <Label htmlFor="edit-description">설명</Label>
                              <Textarea 
                                id="edit-description" 
                                value={selectedSchedule.description}
                                onChange={(e) => setSelectedSchedule({...selectedSchedule, description: e.target.value})}
                                placeholder="일정에 대한 상세 설명을 입력하세요"
                                className="min-h-[100px]"
                              />
                            </div>
                            <div className="flex space-x-2">
                              <Button 
                                onClick={handleUpdateSchedule}
                                disabled={isSaving || !selectedSchedule.title || !selectedSchedule.date}
                              >
                                {isSaving ? (
                                  <div className="flex items-center gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                                    <span>저장 중...</span>
                                  </div>
                                ) : (
                                  "수정 저장"
                                )}
                              </Button>
                              <Button variant="outline" onClick={() => setSelectedSchedule(null)}>취소</Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-8">
                      <h3 className="text-lg font-medium mb-4">등록된 학사 일정</h3>
                      {filteredSchedules.length > 0 ? (
                        <div className="space-y-4">
                          {filteredSchedules
                            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                            .map(schedule => (
                              <div 
                                key={schedule._id} 
                                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                              >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                                  <div>
                                    <h4 className="text-lg font-bold">{schedule.title}</h4>
                                    <p className="text-gray-700 whitespace-pre-line">{schedule.description}</p>
                                    <p className="text-gray-500">{schedule.date} {schedule.time} | {schedule.location}</p>
                                  </div>
                                  <div className="flex space-x-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleSelectSchedule(schedule)}
                                      disabled={isSaving}
                                    >
                                      수정
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => handleDeleteSchedule(schedule._id!)}
                                      disabled={isSaving}
                                    >
                                      삭제
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <p className="text-center py-8 text-gray-500">등록된 학사 일정이 없습니다.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="special" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex flex-row items-center justify-between">
                      <span>특별활동 일정 관리</span>
                      {isLoading && (
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary"></div>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-medium mb-4">새 특별활동 추가</h3>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="special-title">제목</Label>
                            <Input
                              id="special-title" 
                              value={newSchedule.title}
                              onChange={(e) => setNewSchedule({...newSchedule, title: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label htmlFor="special-category">활동 유형</Label>
                            <Select 
                              value={newSchedule.category} 
                              onValueChange={(value) => setNewSchedule({...newSchedule, category: value})}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="활동 유형 선택" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="field">현장 탐방</SelectItem>
                                <SelectItem value="overseas">해외 연수</SelectItem>
                                <SelectItem value="social">친교 활동</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="special-date">날짜</Label>
                            <Input
                              id="special-date" 
                              type="date"
                              value={newSchedule.date}
                              onChange={(e) => setNewSchedule({...newSchedule, date: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label htmlFor="special-time">시간 (30분 단위)</Label>
                            <Select 
                              value={newSchedule.time} 
                              onValueChange={(value) => setNewSchedule({...newSchedule, time: value})}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="시간 선택" />
                              </SelectTrigger>
                              <SelectContent>
                                {TIME_OPTIONS.map((time) => (
                                  <SelectItem key={time} value={time}>
                                    {time}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="special-location">장소</Label>
                            <Input
                              id="special-location" 
                              value={newSchedule.location}
                              onChange={(e) => setNewSchedule({...newSchedule, location: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label htmlFor="special-description">설명</Label>
                            <Textarea 
                              id="special-description" 
                              value={newSchedule.description}
                              onChange={(e) => setNewSchedule({...newSchedule, description: e.target.value})}
                              placeholder="특별활동에 대한 상세 설명을 입력하세요"
                              className="min-h-[100px]"
                            />
                          </div>
                          <Button 
                            onClick={handleAddSchedule}
                            disabled={isSaving || !newSchedule.title || !newSchedule.date}
                          >
                            {isSaving ? (
                              <div className="flex items-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                                <span>저장 중...</span>
                              </div>
                            ) : (
                              "활동 추가"
                            )}
                          </Button>
                        </div>
                      </div>
                          
                      {selectedSchedule && (
                        <div>
                          <h3 className="text-lg font-medium mb-4">활동 수정</h3>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="edit-special-title">제목</Label>
                              <Input
                                id="edit-special-title" 
                                value={selectedSchedule.title}
                                onChange={(e) => setSelectedSchedule({...selectedSchedule, title: e.target.value})}
                              />
                            </div>
                            <div>
                              <Label htmlFor="edit-special-category">활동 유형</Label>
                              <Select 
                                value={selectedSchedule.category} 
                                onValueChange={(value) => setSelectedSchedule({...selectedSchedule, category: value})}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="활동 유형 선택" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="field">현장 탐방</SelectItem>
                                  <SelectItem value="overseas">해외 연수</SelectItem>
                                  <SelectItem value="social">친교 활동</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="edit-special-date">날짜</Label>
                              <Input
                                id="edit-special-date" 
                                type="date"
                                value={selectedSchedule.date}
                                onChange={(e) => setSelectedSchedule({...selectedSchedule, date: e.target.value})}
                              />
                            </div>
                            <div>
                              <Label htmlFor="edit-special-time">시간 (30분 단위)</Label>
                              <Select 
                                value={selectedSchedule.time} 
                                onValueChange={(value) => setSelectedSchedule({...selectedSchedule, time: value})}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="시간 선택" />
                                </SelectTrigger>
                                <SelectContent>
                                  {TIME_OPTIONS.map((time) => (
                                    <SelectItem key={time} value={time}>
                                      {time}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="edit-special-location">장소</Label>
                              <Input
                                id="edit-special-location" 
                                value={selectedSchedule.location}
                                onChange={(e) => setSelectedSchedule({...selectedSchedule, location: e.target.value})}
                              />
                            </div>
                            <div>
                              <Label htmlFor="edit-special-description">설명</Label>
                              <Textarea 
                                id="edit-special-description" 
                                value={selectedSchedule.description}
                                onChange={(e) => setSelectedSchedule({...selectedSchedule, description: e.target.value})}
                                placeholder="특별활동에 대한 상세 설명을 입력하세요"
                                className="min-h-[100px]"
                              />
                            </div>
                            <div className="flex space-x-2">
                              <Button onClick={handleUpdateSchedule}>수정 저장</Button>
                              <Button variant="outline" onClick={() => setSelectedSchedule(null)}>취소</Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-8">
                      <h3 className="text-lg font-medium mb-4">등록된 특별활동</h3>
                      {filteredSchedules.length > 0 ? (
                        <div className="space-y-4">
                          {filteredSchedules.map(schedule => (
                            <div 
                              key={schedule._id} 
                              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                                <div>
                                  <h4 className="text-lg font-bold">{schedule.title}</h4>
                                  <p className="text-sm text-blue-600">
                                    {schedule.category === 'field' ? '현장 탐방' : 
                                     schedule.category === 'overseas' ? '해외 연수' : '친교 활동'}
                                  </p>
                                  <p className="text-gray-700 whitespace-pre-line">{schedule.description}</p>
                                  <p className="text-gray-500">{schedule.date} {schedule.time} | {schedule.location}</p>
                                </div>
                                <div className="flex space-x-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleSelectSchedule(schedule)}
                                  >
                                    수정
                                  </Button>
                                  <Button 
                                    variant="destructive" 
                                    size="sm"
                                    onClick={() => handleDeleteSchedule(schedule._id!)}
                                  >
                                    삭제
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center py-8 text-gray-500">등록된 특별활동이 없습니다.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default ScheduleManage;
