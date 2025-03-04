import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';

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

const ScheduleManage: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('academic');
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedTerm, setSelectedTerm] = useState('2025-1');
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  
  // 새 일정 상태
  const [newSchedule, setNewSchedule] = useState<Schedule>({
    id: '',
    term: '2025-1',
    category: 'academic',
    title: '',
    date: '',
    time: '',
    location: '',
    description: ''
  });

  // 일정 불러오기
  useEffect(() => {
    loadSchedules();
  }, [activeTab]);

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
      category: activeTab, // 현재 활성 탭에 따라 카테고리 설정
    };

    const updatedSchedules = [...schedules, scheduleToAdd];
    saveSchedules(updatedSchedules);
    
    // 폼 초기화
    setNewSchedule({
      id: '',
      term: selectedTerm,
      category: activeTab,
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
    const updatedSchedules = schedules.filter(schedule => schedule.id !== id);
    saveSchedules(updatedSchedules);
    
    if (selectedSchedule?.id === id) {
      setSelectedSchedule(null);
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

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">일정 관리</h1>
      
      <Tabs defaultValue="academic" onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="academic">학사 일정</TabsTrigger>
          <TabsTrigger value="special">특별활동</TabsTrigger>
        </TabsList>
        
        <div className="mb-6">
          <Select value={selectedTerm} onValueChange={setSelectedTerm}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="학기 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2025-1">2025년 1학기</SelectItem>
              <SelectItem value="2025-2">2025년 2학기</SelectItem>
              <SelectItem value="2026-1">2026년 1학기</SelectItem>
              <SelectItem value="2026-2">2026년 2학기</SelectItem>
            </SelectContent>
          </Select>
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
                      <Label htmlFor="time">시간</Label>
                      <Input 
                        id="time" 
                        type="time"
                        value={newSchedule.time}
                        onChange={(e) => setNewSchedule({...newSchedule, time: e.target.value})}
                      />
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
                      <Input 
                        id="description" 
                        value={newSchedule.description}
                        onChange={(e) => setNewSchedule({...newSchedule, description: e.target.value})}
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
                        <Label htmlFor="edit-time">시간</Label>
                        <Input 
                          id="edit-time" 
                          type="time"
                          value={selectedSchedule.time}
                          onChange={(e) => setSelectedSchedule({...selectedSchedule, time: e.target.value})}
                        />
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
                        <Input 
                          id="edit-description" 
                          value={selectedSchedule.description}
                          onChange={(e) => setSelectedSchedule({...selectedSchedule, description: e.target.value})}
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
                            <p className="text-gray-700">{schedule.description}</p>
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
                      <Label htmlFor="special-time">시간</Label>
                      <Input 
                        id="special-time" 
                        type="time"
                        value={newSchedule.time}
                        onChange={(e) => setNewSchedule({...newSchedule, time: e.target.value})}
                      />
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
                      <Input 
                        id="special-description" 
                        value={newSchedule.description}
                        onChange={(e) => setNewSchedule({...newSchedule, description: e.target.value})}
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
                        <Label htmlFor="edit-special-time">시간</Label>
                        <Input 
                          id="edit-special-time" 
                          type="time"
                          value={selectedSchedule.time}
                          onChange={(e) => setSelectedSchedule({...selectedSchedule, time: e.target.value})}
                        />
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
                        <Input 
                          id="edit-special-description" 
                          value={selectedSchedule.description}
                          onChange={(e) => setSelectedSchedule({...selectedSchedule, description: e.target.value})}
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
                            <p className="text-gray-700">{schedule.description}</p>
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
    </div>
  );
};

export default ScheduleManage;
