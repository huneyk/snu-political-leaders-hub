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
import { apiService } from '@/lib/apiService';

// 일정 인터페이스 정의
interface Schedule {
  _id: string;
  term: string;
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
  const [selectedTerm, setSelectedTerm] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [activeTab, setActiveTab] = useState('calendar');
  const [availableTerms, setAvailableTerms] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  // MongoDB에서 학사 일정 데이터 로드
  useEffect(() => {
    const fetchSchedules = async () => {
      setIsLoading(true);
      try {
        // academic 카테고리의 일정만 가져오기
        const data = await apiService.getSchedules('academic');
        setSchedules(data);
        
        // 사용 가능한 기수 목록 추출
        loadAvailableTerms(data);
        setIsLoading(false);
      } catch (err) {
        console.error('일정 데이터 로드 중 오류 발생:', err);
        setError('일정 데이터를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        setIsLoading(false);
      }
    };
    
    fetchSchedules();
  }, []);
  
  // 사용 가능한 기수 목록 로드
  const loadAvailableTerms = (scheduleData: Schedule[]) => {
    try {
      const terms = new Set<string>();
      
      // 학사 일정에서 기수 추출
      scheduleData.forEach((schedule) => {
        if (schedule.term) {
          terms.add(schedule.term);
        }
      });
      
      // 기수가 없으면 기본값 사용
      if (terms.size === 0) {
        setAvailableTerms(['25']);
        setSelectedTerm('25');
        return;
      }
      
      // 기수를 숫자로 변환하여 정렬 (내림차순)
      const sortedTerms = Array.from(terms).sort((a, b) => {
        // 기수에서 '제'와 '기' 같은 문자 제거하고 숫자만 추출
        const numA = parseInt(a.replace(/\D/g, ''));
        const numB = parseInt(b.replace(/\D/g, ''));
        return numB - numA; // 내림차순 정렬
      });
      
      setAvailableTerms(sortedTerms);
      
      // 가장 최근 기수(가장 큰 숫자)를 기본값으로 설정
      setSelectedTerm(sortedTerms[0]);
      
      console.log('사용 가능한 기수:', sortedTerms);
    } catch (error) {
      console.error('기수 목록 로드 중 오류 발생:', error);
      setAvailableTerms(['25']);
      setSelectedTerm('25');
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
  
  // 오늘 날짜 이후의 일정만 필터링하고 날짜순으로 정렬
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const upcomingSchedules = termSchedules
    .filter(schedule => {
      try {
        return isAfter(new Date(schedule.date), today) || format(new Date(schedule.date), 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
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

  // 달력에 날짜를 렌더링하는 함수 - 일정이 있는 날짜에 표시를 추가
  const renderCalendarDay = (day: Date) => {
    const dateString = format(day, 'yyyy-MM-dd');
    const hasSchedule = termSchedules.some(schedule => {
      try {
        const scheduleDate = new Date(schedule.date);
        return format(scheduleDate, 'yyyy-MM-dd') === dateString;
      } catch (error) {
        return false;
      }
    });

    const isSelected = selectedDate && format(selectedDate, 'yyyy-MM-dd') === dateString;

    return (
      <div 
        className={`relative p-2 flex items-center justify-center rounded-md text-sm
          ${isSelected ? 'bg-blue-600 text-white' : ''}`}
        onClick={() => setSelectedDate(day)}
      >
        {day.getDate()}
        {hasSchedule && (
          <div className={`absolute bottom-1 w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-blue-600'}`} />
        )}
      </div>
    );
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
                  <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="기수 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTerms.map((term) => (
                        <SelectItem key={term} value={term}>
                          {term}
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
                        onSelect={(date) => {
                          console.log('선택된 날짜 변경:', date ? format(date, 'yyyy-MM-dd') : '없음');
                          setSelectedDate(date);
                        }}
                        locale={ko}
                        className="rounded-md border"
                        components={{
                          Day: (props) => renderCalendarDay(props.date)
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
                            <div key={schedule._id} className="p-4 border rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="text-lg font-medium">{schedule.title}</h3>
                                <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800">
                                  {getCategoryName(schedule.category)}
                                </span>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                {schedule.time && (
                                  <div>
                                    <p className="font-medium">시간</p>
                                    <p>{schedule.time}</p>
                                  </div>
                                )}
                                {schedule.location && (
                                  <div>
                                    <p className="font-medium">장소</p>
                                    <p>{schedule.location}</p>
                                  </div>
                                )}
                                <div className="md:col-span-2">
                                  <p className="whitespace-pre-line">{schedule.description}</p>
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
                          <div key={schedule._id} className="p-4 border rounded-lg">
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
                              {schedule.time && (
                                <div>
                                  <p className="font-medium">시간</p>
                                  <p>{schedule.time}</p>
                                </div>
                              )}
                              {schedule.location && (
                                <div>
                                  <p className="font-medium">장소</p>
                                  <p>{schedule.location}</p>
                                </div>
                              )}
                              <div className="md:col-span-1">
                                <p className="whitespace-pre-line">{schedule.description}</p>
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
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default ScheduleCalendar; 