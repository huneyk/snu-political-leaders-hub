import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { format, isAfter, compareAsc } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useNavigate } from 'react-router-dom';
import ScrollReveal from '@/components/ScrollReveal';
import { apiService } from '@/lib/apiService';

// 일정 인터페이스 정의
interface Schedule {
  _id: string;
  term: string; // MongoDB에서는 문자열로 반환됨
  year: string;
  category: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  isActive: boolean;
}

const ScheduleCalendar: React.FC = () => {
  const [selectedTerm, setSelectedTerm] = useState<string>("1");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [activeTab, setActiveTab] = useState('calendar');
  const [availableTerms, setAvailableTerms] = useState<string[]>(["1"]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  // MongoDB에서 일정 데이터 로드
  useEffect(() => {
    fetchSchedules();
  }, []);
  
  // MongoDB API를 통해 일정 데이터 가져오기
  const fetchSchedules = async () => {
    setIsLoading(true);
    try {
      // 모든 일정 데이터 가져오기 (학사 일정 + 특별활동)
      const data = await apiService.getSchedules();
      if (Array.isArray(data)) {
        console.log("API에서 가져온 일정 데이터:", data); // 데이터 로깅 추가
        setSchedules(data);
        // 사용 가능한 학기 목록 추출
        loadAvailableTerms(data);
        setError(null);
      } else {
        console.error('API 응답이 배열 형태가 아닙니다:', data);
        setError('일정 데이터 형식이 올바르지 않습니다.');
      }
    } catch (err) {
      console.error('일정 데이터 로드 중 오류 발생:', err);
      setError('일정 데이터를 불러오는 중 오류가 발생했습니다.');
      // 오류 발생 시 빈 배열로 설정
      setSchedules([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // 사용 가능한 학기 목록 로드
  const loadAvailableTerms = (scheduleData: Schedule[]) => {
    try {
      // 중복 없는 학기 집합 생성
      const termsSet = new Set<string>();
      
      // 모든 일정에서 학기 정보 추출
      scheduleData.forEach((schedule) => {
        if (schedule.term) {
          termsSet.add(schedule.term);
        }
      });
      
      // 학기가 없으면 기본값 사용
      if (termsSet.size === 0) {
        setAvailableTerms(["1"]);
        setSelectedTerm("1");
        return;
      }
      
      // 학기를 내림차순으로 정렬 (최신 학기가 먼저 오도록)
      // 숫자 값으로 변환해서 정렬한 후, 다시 문자열로 반환
      const sortedTerms = Array.from(termsSet)
        .sort((a, b) => Number(b) - Number(a));
        
      setAvailableTerms(sortedTerms);
      
      // 가장 최근 학기를 기본값으로 설정
      setSelectedTerm(sortedTerms[0]);
      
      console.log('사용 가능한 학기:', sortedTerms);
    } catch (error) {
      console.error('학기 목록 로드 중 오류 발생:', error);
      setAvailableTerms(["1"]);
      setSelectedTerm("1");
    }
  };
  
  // 선택된 학기에 해당하는 일정 필터링
  const termSchedules = schedules.filter(
    schedule => schedule.term === selectedTerm
  );
  
  // 선택된 날짜에 해당하는 일정 필터링
  const selectedDateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
  const daySchedules = termSchedules.filter(schedule => {
    try {
      const scheduleDate = new Date(schedule.date);
      return format(scheduleDate, 'yyyy-MM-dd') === selectedDateStr;
    } catch (error) {
      return false;
    }
  });
  
  // 일정이 있는 날짜 목록 (캘린더 표시용)
  const scheduleDates = termSchedules.map(schedule => {
    try {
      return new Date(schedule.date);
    } catch (error) {
      return new Date(); // 기본값으로 오늘 날짜 반환
    }
  });
  
  // 오늘 날짜 이후의 일정만 필터링하고 날짜순으로 정렬
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const upcomingSchedules = termSchedules
    .filter(schedule => {
      try {
        const scheduleDate = new Date(schedule.date);
        return isAfter(scheduleDate, today) || format(scheduleDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
      } catch (error) {
        return false;
      }
    })
    .sort((a, b) => {
      try {
        return compareAsc(new Date(a.date), new Date(b.date));
      } catch (error) {
        return 0;
      }
    });
  
  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    try {
      const options: Intl.DateTimeFormatOptions = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        weekday: 'long' 
      };
      return new Date(dateString).toLocaleDateString('ko-KR', options);
    } catch (error) {
      return dateString;
    }
  };
  
  // 카테고리 이름 번역 함수
  const getCategoryName = (category: string) => {
    switch (category) {
      case 'academic': return '학사 일정';
      case 'special': return '특별 활동';
      case 'overseas': return '해외 연수';
      case 'social': return '친교 활동';
      default: return '기타 활동';
    }
  };
  
  // 탭 변경 처리
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
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
                서울대학교 정치지도자과정의 기수별 학사 일정과 특별활동을 확인하세요.
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
          
          {isLoading ? (
            <div className="flex justify-center items-center py-24">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">
              <p>{error}</p>
            </div>
          ) : (
            <>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <div className="mb-4 md:mb-0">
                  <Select value={selectedTerm} onValueChange={(value) => setSelectedTerm(value)}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="기수 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTerms.map((term) => (
                        <SelectItem key={term} value={term}>
                          제 {term} 기
                        </SelectItem>
                      ))}
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
                            <div key={schedule._id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                              <div className="flex items-center justify-between mb-3">
                                <h3 className="text-lg font-semibold text-blue-800">{schedule.title}</h3>
                                <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800">
                                  {getCategoryName(schedule.category)}
                                </span>
                              </div>
                              <div className="grid grid-cols-1 gap-3 text-sm">
                                <div className="flex flex-wrap gap-4 mb-2">
                                  {schedule.time && (
                                    <div className="flex items-center text-gray-700">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                      <p><span className="font-medium">시간:</span> {schedule.time}</p>
                                    </div>
                                  )}
                                  {schedule.location && (
                                    <div className="flex items-center text-gray-700">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                      </svg>
                                      <p><span className="font-medium">장소:</span> {schedule.location}</p>
                                    </div>
                                  )}
                                </div>
                                {schedule.description && (
                                  <div className="mt-2 border-t pt-2">
                                    <p className="whitespace-pre-line text-gray-700">{schedule.description}</p>
                                  </div>
                                )}
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
                          <div key={schedule._id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3">
                              <div className="flex items-center space-x-2">
                                <h3 className="text-lg font-semibold text-blue-800">{schedule.title}</h3>
                                <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800">
                                  {getCategoryName(schedule.category)}
                                </span>
                              </div>
                              <p className="font-medium text-gray-600 mt-1 md:mt-0">{formatDate(schedule.date)}</p>
                            </div>
                            <div className="grid grid-cols-1 gap-3 text-sm">
                              <div className="flex flex-wrap gap-4 mb-2">
                                {schedule.time && (
                                  <div className="flex items-center text-gray-700">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p><span className="font-medium">시간:</span> {schedule.time}</p>
                                  </div>
                                )}
                                {schedule.location && (
                                  <div className="flex items-center text-gray-700">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <p><span className="font-medium">장소:</span> {schedule.location}</p>
                                  </div>
                                )}
                              </div>
                              {schedule.description && (
                                <div className="mt-2 border-t pt-2">
                                  <p className="whitespace-pre-line text-gray-700">{schedule.description}</p>
                                </div>
                              )}
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
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default ScheduleCalendar; 