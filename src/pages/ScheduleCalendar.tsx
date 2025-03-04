import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { format, isAfter, parseISO, compareAsc } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useNavigate } from 'react-router-dom';
import ScrollReveal from '@/components/ScrollReveal';

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

// 기본 학사 일정 데이터 (localStorage에 데이터가 없을 경우 사용)
const DEFAULT_ACADEMIC_SCHEDULES: Schedule[] = [];

// 기본 특별활동 데이터 (localStorage에 데이터가 없을 경우 사용)
const DEFAULT_SPECIAL_ACTIVITIES: Schedule[] = [];

const ScheduleCalendar: React.FC = () => {
  const [selectedTerm, setSelectedTerm] = useState('1');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [academicSchedules, setAcademicSchedules] = useState<Schedule[]>(DEFAULT_ACADEMIC_SCHEDULES);
  const [specialActivities, setSpecialActivities] = useState<Schedule[]>(DEFAULT_SPECIAL_ACTIVITIES);
  const [activeTab, setActiveTab] = useState('calendar');
  const navigate = useNavigate();
  
  // 컴포넌트 마운트 시 localStorage에서 학사 일정과 특별활동 일정 로드
  useEffect(() => {
    // 기본 데이터 삭제
    removeDefaultData();
    
    loadAcademicSchedules();
    loadSpecialActivities();
  }, []);
  
  // 기본 데이터 삭제 함수
  const removeDefaultData = () => {
    try {
      // 기본 학사 일정 데이터 삭제
      const defaultAcademicTitles = [
        '입학식', '오리엔테이션', '1학기 중간고사', '1학기 기말고사', 
        '2학기 개강', '2학기 중간고사', '2학기 기말고사', '수료식'
      ];
      
      const savedAcademicSchedules = localStorage.getItem('academicSchedules');
      if (savedAcademicSchedules) {
        const parsedSchedules = JSON.parse(savedAcademicSchedules);
        const filteredSchedules = parsedSchedules.filter(
          (schedule: Schedule) => !defaultAcademicTitles.includes(schedule.title)
        );
        
        // 변경된 일정 저장
        if (parsedSchedules.length !== filteredSchedules.length) {
          localStorage.setItem('academicSchedules', JSON.stringify(filteredSchedules));
          console.log('기본 학사 일정이 삭제되었습니다.');
        }
      }
      
      // 기본 특별활동 데이터 삭제
      const defaultSpecialTitles = [
        '국회 방문', '청와대 방문', '미국 의회 방문', '유럽 의회 방문', '동문 네트워킹 행사'
      ];
      
      const savedSpecialActivities = localStorage.getItem('specialActivities');
      if (savedSpecialActivities) {
        const parsedActivities = JSON.parse(savedSpecialActivities);
        const filteredActivities = parsedActivities.filter(
          (activity: Schedule) => !defaultSpecialTitles.includes(activity.title)
        );
        
        // 변경된 일정 저장
        if (parsedActivities.length !== filteredActivities.length) {
          localStorage.setItem('specialActivities', JSON.stringify(filteredActivities));
          console.log('기본 특별활동 일정이 삭제되었습니다.');
        }
      }
    } catch (error) {
      console.error('기본 데이터 삭제 중 오류 발생:', error);
    }
  };
  
  // 학사 일정 로드 함수
  const loadAcademicSchedules = () => {
    try {
      const savedSchedules = localStorage.getItem('academicSchedules');
      
      if (savedSchedules) {
        const parsedSchedules = JSON.parse(savedSchedules);
        setAcademicSchedules(parsedSchedules);
        console.log('학사 일정 로드됨:', parsedSchedules);
      } else {
        // 저장된 일정이 없는 경우 기본 데이터 사용
        setAcademicSchedules(DEFAULT_ACADEMIC_SCHEDULES);
        console.log('저장된 학사 일정이 없습니다. 기본 데이터를 사용합니다.');
        
        // 기본 데이터를 localStorage에 저장
        localStorage.setItem('academicSchedules', JSON.stringify(DEFAULT_ACADEMIC_SCHEDULES));
      }
    } catch (error) {
      console.error('학사 일정 로드 중 오류 발생:', error);
      setAcademicSchedules(DEFAULT_ACADEMIC_SCHEDULES);
    }
  };
  
  // 특별활동 일정 로드 함수
  const loadSpecialActivities = () => {
    try {
      const savedActivities = localStorage.getItem('specialActivities');
      
      if (savedActivities) {
        const parsedActivities = JSON.parse(savedActivities);
        setSpecialActivities(parsedActivities);
        console.log('특별활동 일정 로드됨:', parsedActivities);
      } else {
        // 저장된 일정이 없는 경우 기본 데이터 사용
        setSpecialActivities(DEFAULT_SPECIAL_ACTIVITIES);
        console.log('저장된 특별활동 일정이 없습니다. 기본 데이터를 사용합니다.');
        
        // 기본 데이터를 localStorage에 저장
        localStorage.setItem('specialActivities', JSON.stringify(DEFAULT_SPECIAL_ACTIVITIES));
      }
    } catch (error) {
      console.error('특별활동 일정 로드 중 오류 발생:', error);
      setSpecialActivities(DEFAULT_SPECIAL_ACTIVITIES);
    }
  };
  
  // 선택된 학기에 해당하는 모든 일정 (학사 + 특별활동) 필터링
  const allSchedules = [...academicSchedules, ...specialActivities].filter(
    schedule => schedule.term === selectedTerm
  );
  
  // 선택된 날짜에 해당하는 일정 필터링
  const selectedDateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
  const daySchedules = allSchedules.filter(
    schedule => schedule.date === selectedDateStr
  );
  
  // 캘린더에 표시할 일정이 있는 날짜 배열
  const scheduleDates = allSchedules.map(schedule => new Date(schedule.date));
  
  // 오늘 날짜 이후의 일정만 필터링하고 날짜순으로 정렬
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const upcomingSchedules = allSchedules
    .filter(schedule => isAfter(parseISO(schedule.date), today) || schedule.date === format(today, 'yyyy-MM-dd'))
    .sort((a, b) => compareAsc(parseISO(a.date), parseISO(b.date)));
  
  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric', 
      weekday: 'long' 
    };
    return new Date(dateString).toLocaleDateString('ko-KR', options);
  };
  
  // 활동 유형에 따른 한글 이름 반환
  const getCategoryName = (category: string) => {
    switch (category) {
      case 'academic': return '학사 일정';
      case 'field': return '현장 탐방';
      case 'overseas': return '해외 연수';
      case 'social': return '친교 활동';
      default: return '기타 활동';
    }
  };

  const handleTabChange = (value: string) => {
    if (value === 'activities') {
      navigate('/schedule/activities');
    }
  };

  return (
    <>
      <Header />
      <main className="pt-24 pb-16">
        <ScrollReveal>
          <section className="py-16 bg-mainBlue text-white">
            <div className="main-container">
              <h1 className="text-3xl md:text-4xl font-bold mb-4 reveal">전체 일정</h1>
              <p className="text-white/80 max-w-3xl reveal reveal-delay-100">
                서울대학교 정치지도자과정의 학사 일정과 특별활동을 확인하세요.
              </p>
            </div>
          </section>
        </ScrollReveal>

        <div className="main-container py-12">
          <Tabs defaultValue="calendar" className="mb-6" onValueChange={handleTabChange}>
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="calendar">전체 일정</TabsTrigger>
              <TabsTrigger value="activities">특별 활동</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div className="mb-4 md:mb-0">
              <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="기수 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">제 1 기</SelectItem>
                  <SelectItem value="2">제 2 기</SelectItem>
                  <SelectItem value="3">제 3 기</SelectItem>
                  <SelectItem value="4">제 4 기</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>일정 달력</CardTitle>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    locale={ko}
                    className="rounded-md border"
                    modifiers={{
                      hasSchedule: scheduleDates
                    }}
                    modifiersStyles={{
                      hasSchedule: {
                        fontWeight: 'bold',
                        backgroundColor: '#e6f7ff',
                        color: '#0066cc',
                        borderRadius: '50%'
                      }
                    }}
                  />
                </CardContent>
              </Card>
            </div>
            
            <div className="md:col-span-2">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>
                    {selectedDate ? format(selectedDate, 'yyyy년 MM월 dd일 (EEEE)', { locale: ko }) : '날짜를 선택하세요'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {daySchedules.length > 0 ? (
                    <div className="space-y-4">
                      {daySchedules.map(schedule => (
                        <div key={schedule.id} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-medium">{schedule.title}</h3>
                            <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800">
                              {getCategoryName(schedule.category)}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            <div>
                              <p className="font-medium">시간</p>
                              <p>{schedule.time}</p>
                            </div>
                            <div>
                              <p className="font-medium">장소</p>
                              <p>{schedule.location}</p>
                            </div>
                            <div className="md:col-span-2">
                              <p className="font-medium">설명</p>
                              <p>{schedule.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center py-8 text-gray-500">선택한 날짜에 일정이 없습니다.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
          
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>다가오는 일정</CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingSchedules.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingSchedules.map(schedule => (
                      <div key={schedule.id} className="p-4 border rounded-lg">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <h3 className="text-lg font-medium">{schedule.title}</h3>
                            <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800">
                              {getCategoryName(schedule.category)}
                            </span>
                          </div>
                          <p className="font-medium text-gray-600">{formatDate(schedule.date)}</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                          <div>
                            <p className="font-medium">시간</p>
                            <p>{schedule.time}</p>
                          </div>
                          <div>
                            <p className="font-medium">장소</p>
                            <p>{schedule.location}</p>
                          </div>
                          <div className="md:col-span-1">
                            <p className="font-medium">설명</p>
                            <p>{schedule.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-8 text-gray-500">다가오는 일정이 없습니다.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default ScheduleCalendar; 