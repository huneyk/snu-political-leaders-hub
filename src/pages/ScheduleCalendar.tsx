import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
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

// 기본 학사 일정 데이터 (localStorage에 데이터가 없을 경우 사용)
const DEFAULT_ACADEMIC_SCHEDULES: Schedule[] = [
  {
    id: '1',
    term: '2025-1',
    category: 'academic',
    title: '입학식',
    date: '2025-03-01',
    time: '10:00',
    location: '서울대학교 행정대학원',
    description: '제1기 정치지도자과정 입학식'
  },
  {
    id: '2',
    term: '2025-1',
    category: 'academic',
    title: '오리엔테이션',
    date: '2025-03-08',
    time: '14:00',
    location: '서울대학교 행정대학원',
    description: '교과과정 및 학사일정 안내'
  },
  {
    id: '3',
    term: '2025-1',
    category: 'academic',
    title: '1학기 중간고사',
    date: '2025-04-20',
    time: '09:00',
    location: '서울대학교 행정대학원',
    description: '1학기 중간고사 실시'
  },
  {
    id: '4',
    term: '2025-1',
    category: 'academic',
    title: '1학기 기말고사',
    date: '2025-06-15',
    time: '09:00',
    location: '서울대학교 행정대학원',
    description: '1학기 기말고사 실시'
  },
  {
    id: '5',
    term: '2025-2',
    category: 'academic',
    title: '2학기 개강',
    date: '2025-09-01',
    time: '10:00',
    location: '서울대학교 행정대학원',
    description: '2학기 개강 및 오리엔테이션'
  },
  {
    id: '6',
    term: '2025-2',
    category: 'academic',
    title: '2학기 중간고사',
    date: '2025-10-20',
    time: '09:00',
    location: '서울대학교 행정대학원',
    description: '2학기 중간고사 실시'
  },
  {
    id: '7',
    term: '2025-2',
    category: 'academic',
    title: '2학기 기말고사',
    date: '2025-12-15',
    time: '09:00',
    location: '서울대학교 행정대학원',
    description: '2학기 기말고사 실시'
  },
  {
    id: '8',
    term: '2025-2',
    category: 'academic',
    title: '수료식',
    date: '2025-12-20',
    time: '14:00',
    location: '서울대학교 행정대학원',
    description: '제1기 정치지도자과정 수료식'
  }
];

const ScheduleCalendar: React.FC = () => {
  const [selectedTerm, setSelectedTerm] = useState('2025-1');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [academicSchedules, setAcademicSchedules] = useState<Schedule[]>(DEFAULT_ACADEMIC_SCHEDULES);
  const [activeTab, setActiveTab] = useState('calendar');
  const navigate = useNavigate();
  
  // 컴포넌트 마운트 시 localStorage에서 학사 일정 로드
  useEffect(() => {
    loadAcademicSchedules();
  }, []);
  
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
  
  // 선택된 학기에 해당하는 학사 일정 필터링
  const termSchedules = academicSchedules.filter(
    schedule => schedule.term === selectedTerm
  );
  
  // 선택된 날짜에 해당하는 일정 필터링
  const selectedDateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
  const daySchedules = termSchedules.filter(
    schedule => schedule.date === selectedDateStr
  );
  
  // 캘린더에 표시할 일정이 있는 날짜 배열
  const scheduleDates = termSchedules.map(schedule => new Date(schedule.date));
  
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

  const handleTabChange = (value: string) => {
    if (value === 'activities') {
      navigate('/schedule/activities');
    }
  };

  return (
    <>
      <Header />
      
      {/* 배너(띠) 추가 - 그라데이션 효과 */}
      <div className="w-full bg-gradient-to-r from-blue-700 to-blue-500 py-8 mb-6 shadow-md">
        <div className="container mx-auto px-6">
          <h1 className="text-3xl font-bold text-white">학사 일정</h1>
          <p className="text-blue-100 mt-2">서울대학교 정치 지도자 과정의 학사 일정을 확인하세요.</p>
        </div>
      </div>
      
      <div className="container mx-auto px-6 pb-12 min-h-screen">
        <Tabs defaultValue="calendar" className="mb-6" onValueChange={handleTabChange}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="calendar">학사 일정</TabsTrigger>
            <TabsTrigger value="activities">특별 활동</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div className="mb-4 md:mb-0">
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
          
          {/* 네비게이션 바 추가 */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-3">
            <nav className="flex flex-wrap gap-4">
              <a href="/intro/objectives" className="text-gray-600 hover:text-blue-600 transition-colors duration-200">과정 소개</a>
              <span className="text-gray-300">|</span>
              <a href="/admission/rules" className="text-gray-600 hover:text-blue-600 transition-colors duration-200">입학 안내</a>
              <span className="text-gray-300">|</span>
              <a href="/schedule/calendar" className="text-blue-600 font-medium">학사 일정</a>
              <span className="text-gray-300">|</span>
              <a href="/schedule/activities" className="text-gray-600 hover:text-blue-600 transition-colors duration-200">특별 활동</a>
              <span className="text-gray-300">|</span>
              <a href="/community" className="text-gray-600 hover:text-blue-600 transition-colors duration-200">커뮤니티</a>
            </nav>
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
                  <div className="space-y-6">
                    {daySchedules.map(schedule => (
                      <div key={schedule.id} className="border-l-4 border-blue-500 pl-4 py-2">
                        <h3 className="text-xl font-bold">{schedule.title}</h3>
                        <p className="text-gray-500">{schedule.time}</p>
                        <p className="font-medium mt-2">{schedule.location}</p>
                        <p className="text-gray-700 mt-1">{schedule.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <p className="text-gray-500">
                      {selectedDate ? '선택한 날짜에 예정된 일정이 없습니다.' : '날짜를 선택하세요.'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>전체 학사 일정</CardTitle>
            </CardHeader>
            <CardContent>
              {termSchedules.length > 0 ? (
                <div className="space-y-4">
                  {termSchedules.map(schedule => (
                    <div 
                      key={schedule.id} 
                      className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => setSelectedDate(new Date(schedule.date))}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                        <div>
                          <h3 className="text-lg font-bold">{schedule.title}</h3>
                          <p className="text-gray-700">{schedule.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatDate(schedule.date)}</p>
                          <p className="text-gray-500">{schedule.time} | {schedule.location}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-500">선택한 학기에 등록된 학사 일정이 없습니다.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ScheduleCalendar; 