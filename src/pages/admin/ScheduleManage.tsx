import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import AdminHomeButton from '@/components/admin/AdminHomeButton';
import { Textarea } from '@/components/ui/textarea';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AdminNavTabs from '@/components/admin/AdminNavTabs';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useNavigate } from 'react-router-dom';

// 일정 인터페이스 정의
interface Schedule {
  id: string;
  term: string;
  category: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
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
  const [selectedTerm, setSelectedTerm] = useState('1');
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  
  // 새 일정 상태
  const [newSchedule, setNewSchedule] = useState<Schedule>({
    id: '',
    term: '1',
    category: 'academic',
    title: '',
    date: '',
    time: '',
    location: '',
    description: ''
  });

  const { isAuthenticated, isLoading: authLoading } = useAdminAuth();
  const navigate = useNavigate();

  // 일정 불러오기
  useEffect(() => {
    // 1학기 중간고사 일정 삭제
    if (activeTab === 'academic') {
      removeMiddleExamEvent();
    }
    
    loadSchedules();
    
    // 탭이 변경될 때 newSchedule의 category 값 업데이트
    setNewSchedule(prev => ({
      ...prev,
      category: activeTab === 'academic' ? 'academic' : 'field'
    }));
  }, [activeTab]);

  // 1학기 중간고사 일정 삭제 함수
  const removeMiddleExamEvent = () => {
    try {
      // 학사 일정에서 삭제
      const savedSchedules = localStorage.getItem('academicSchedules');
      if (savedSchedules) {
        const parsedSchedules = JSON.parse(savedSchedules);
        const filteredSchedules = parsedSchedules.filter(
          (schedule: Schedule) => 
            !(schedule.title === '1학기 중간고사' && 
              schedule.date === '2025-04-20' && 
              schedule.time === '09:00' && 
              schedule.location === '서울대학교 행정대학원' && 
              schedule.description === '1학기 중간고사 실시')
        );
        
        // 변경된 일정 저장
        if (parsedSchedules.length !== filteredSchedules.length) {
          localStorage.setItem('academicSchedules', JSON.stringify(filteredSchedules));
          console.log('1학기 중간고사 일정이 삭제되었습니다.');
        }
      }
    } catch (error) {
      console.error('일정 삭제 중 오류 발생:', error);
    }
  };

  const loadSchedules = () => {
    try {
      // 학사 일정과 특별활동 일정을 구분하여 로드
      const storageKey = activeTab === 'academic' ? 'academicSchedules' : 'specialActivities';
      const savedSchedules = localStorage.getItem(storageKey);
      
      if (savedSchedules) {
        const parsedSchedules = JSON.parse(savedSchedules);
        setSchedules(parsedSchedules);
        console.log(`${storageKey} 로드됨:`, parsedSchedules);
      } else {
        // 저장된 일정이 없는 경우 빈 배열로 초기화
        setSchedules([]);
        console.log(`${storageKey}가 없습니다. 빈 배열로 초기화합니다.`);
      }
    } catch (error) {
      console.error('일정 로드 중 오류 발생:', error);
      setSchedules([]);
    }
  };

  // 일정 저장하기
  const saveSchedules = (updatedSchedules: Schedule[]) => {
    try {
      // 학사 일정과 특별활동 일정을 구분하여 저장
      const storageKey = activeTab === 'academic' ? 'academicSchedules' : 'specialActivities';
      localStorage.setItem(storageKey, JSON.stringify(updatedSchedules));
      
      setSchedules(updatedSchedules);
      
      // localStorage 변경 이벤트 발생시키기
      window.dispatchEvent(new StorageEvent('storage', {
        key: storageKey,
        newValue: JSON.stringify(updatedSchedules),
        storageArea: localStorage
      }));
      
      toast({
        title: "저장 완료",
        description: "일정이 성공적으로 저장되었습니다.",
      });
      console.log(`${storageKey} 저장됨:`, updatedSchedules);
    } catch (error) {
      console.error('일정 저장 중 오류 발생:', error);
      toast({
        title: "저장 실패",
        description: "일정 저장 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  // 일정 추가
  const handleAddSchedule = () => {
    if (!newSchedule.title || !newSchedule.date) {
      toast({
        title: "입력 오류",
        description: "제목과 날짜는 필수 입력 항목입니다.",
        variant: "destructive",
      });
      return;
    }

    const scheduleToAdd = {
      ...newSchedule,
      id: Date.now().toString(),
      // 학사 일정인 경우에만 카테고리를 'academic'으로 설정하고,
      // 특별활동인 경우에는 사용자가 선택한 카테고리 값을 유지
      category: activeTab === 'academic' ? 'academic' : newSchedule.category,
    };

    const updatedSchedules = [...schedules, scheduleToAdd];
    saveSchedules(updatedSchedules);
    
    // 폼 초기화
    setNewSchedule({
      id: '',
      term: selectedTerm,
      category: activeTab === 'academic' ? 'academic' : 'field', // 특별활동의 경우 기본값을 'field'로 설정
      title: '',
      date: '',
      time: '',
      location: '',
      description: ''
    });
  };

  // 일정 수정
  const handleUpdateSchedule = () => {
    if (!selectedSchedule) return;
    
    const updatedSchedules = schedules.map(schedule => 
      schedule.id === selectedSchedule.id ? selectedSchedule : schedule
    );
    
    saveSchedules(updatedSchedules);
    setSelectedSchedule(null);
  };

  // 일정 삭제
  const handleDeleteSchedule = (id: string) => {
    if (window.confirm('정말로 이 일정을 삭제하시겠습니까?')) {
      try {
        // 현재 일정 목록에서 해당 ID를 가진 일정 제외
      const updatedSchedules = schedules.filter(schedule => schedule.id !== id);
        
        // 학사 일정과 특별활동 일정을 구분하여 저장
        const storageKey = activeTab === 'academic' ? 'academicSchedules' : 'specialActivities';
        localStorage.setItem(storageKey, JSON.stringify(updatedSchedules));
        
        // 상태 업데이트
      setSchedules(updatedSchedules);
        
        // 선택된 일정이 삭제된 경우 선택 해제
        if (selectedSchedule?.id === id) {
          setSelectedSchedule(null);
        }
        
        // localStorage 변경 이벤트 발생시키기
        window.dispatchEvent(new StorageEvent('storage', {
          key: storageKey,
          newValue: JSON.stringify(updatedSchedules),
          storageArea: localStorage
        }));
      
      toast({
          title: "삭제 완료",
        description: "일정이 성공적으로 삭제되었습니다.",
        });
        
        console.log(`일정 삭제됨 (ID: ${id}), 남은 일정: ${updatedSchedules.length}개`);
      } catch (error) {
        console.error('일정 삭제 중 오류 발생:', error);
        toast({
          title: "삭제 실패",
          description: "일정 삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      });
      }
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
        
        <AdminNavTabs activeTab="schedule" />
        <AdminHomeButton />
        
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
                  value={selectedTerm}
                  onChange={(e) => setSelectedTerm(e.target.value)}
                  className="w-[180px]"
                  placeholder="학기 입력"
                />
              </div>
              
              <TabsContent value="academic" className="space-y-6">
              <Card>
                <CardHeader>
                    <CardTitle>학사 일정 관리</CardTitle>
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
                          <Button onClick={handleAddSchedule}>일정 추가</Button>
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
                              <Button onClick={handleUpdateSchedule}>수정 저장</Button>
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
                          {filteredSchedules.map(schedule => (
                            <div 
                              key={schedule.id} 
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
                                  >
                                    수정
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDeleteSchedule(schedule.id)}
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
                    <CardTitle>특별활동 일정 관리</CardTitle>
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
                          <Button onClick={handleAddSchedule}>활동 추가</Button>
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
                              key={schedule.id} 
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
                                    onClick={() => handleDeleteSchedule(schedule.id)}
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
    </>
  );
};

export default ScheduleManage;
