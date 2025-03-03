import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface Schedule {
  id: string;
  term: string; // 기수 (예: "제1기", "제2기")
  category: string; // 구분 (학사 일정, 특별 활동)
  subcategory: string; // 하위 구분 (해외 연수, 현장 탐방, 친교 활동)
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
}

const ScheduleCalendar = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // 일정 데이터 로드
    const loadSchedules = () => {
      setLoading(true);
      setError(null);
      
      try {
        // localStorage에 저장된 모든 키 출력
        console.log('ScheduleCalendar - All localStorage keys:', Object.keys(localStorage));
        
        const storedSchedules = localStorage.getItem('schedules');
        console.log('ScheduleCalendar - localStorage data:', storedSchedules);
        
        if (storedSchedules) {
          try {
            const parsedSchedules = JSON.parse(storedSchedules);
            console.log('ScheduleCalendar - Parsed schedules:', parsedSchedules);
            
            if (Array.isArray(parsedSchedules) && parsedSchedules.length > 0) {
              setSchedules(parsedSchedules);
              console.log('ScheduleCalendar - Successfully loaded schedules:', parsedSchedules.length);
            } else {
              // 빈 배열이거나 유효하지 않은 데이터인 경우 샘플 데이터 사용
              console.log('ScheduleCalendar - Empty or invalid data, using sample data');
              const sampleData = getSampleSchedules();
              setSchedules(sampleData);
              
              // 샘플 데이터를 localStorage에 저장
              localStorage.setItem('schedules', JSON.stringify(sampleData));
              console.log('ScheduleCalendar - Saved sample data to localStorage');
            }
          } catch (error) {
            console.error('Error parsing schedules from localStorage:', error);
            setError('일정 데이터를 불러오는 중 오류가 발생했습니다.');
            const sampleData = getSampleSchedules();
            setSchedules(sampleData);
            
            // 샘플 데이터를 localStorage에 저장
            localStorage.setItem('schedules', JSON.stringify(sampleData));
          }
        } else {
          // 샘플 데이터
          const sampleData = getSampleSchedules();
          // 샘플 데이터를 localStorage에 저장
          localStorage.setItem('schedules', JSON.stringify(sampleData));
          console.log('ScheduleCalendar - No data found, setting sample data to localStorage');
          setSchedules(sampleData);
        }
      } catch (error) {
        console.error('Unexpected error loading schedules:', error);
        setError('일정 데이터를 불러오는 중 오류가 발생했습니다.');
        setSchedules([]);
      } finally {
        setLoading(false);
      }
    };
    
    // 페이지 로드 시 데이터 로드
    loadSchedules();
    
    // localStorage 변경 이벤트 리스너 추가
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'schedules') {
        console.log('ScheduleCalendar - localStorage changed, reloading data');
        loadSchedules();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // 샘플 일정 데이터 생성 함수
  const getSampleSchedules = (): Schedule[] => {
    return [
      // 특별 활동만 유지
      {
        id: '6',
        term: '제1기',
        category: '특별 활동',
        subcategory: '현장 탐방',
        title: '국회 방문',
        date: '2023-03-15',
        time: '14:00 - 17:00',
        location: '국회의사당',
        description: '국회 견학 및 의원 간담회',
      },
      {
        id: '7',
        term: '제1기',
        category: '특별 활동',
        subcategory: '현장 탐방',
        title: '청와대 방문',
        date: '2023-04-05',
        time: '10:00 - 12:00',
        location: '청와대',
        description: '청와대 견학 및 정책 브리핑',
      },
      {
        id: '8',
        term: '제1기',
        category: '특별 활동',
        subcategory: '친교 활동',
        title: '체육대회',
        date: '2023-05-12',
        time: '13:00 - 18:00',
        location: '서울대학교 운동장',
        description: '행정대학원 체육대회',
      },
      {
        id: '9',
        term: '제1기',
        category: '특별 활동',
        subcategory: '해외 연수',
        title: '일본 정치 연수',
        date: '2023-07-10',
        time: '종일',
        location: '일본 도쿄',
        description: '일본 국회 및 정부기관 방문 연수',
      },
      {
        id: '10',
        term: '제2기',
        category: '특별 활동',
        subcategory: '친교 활동',
        title: '송년회',
        date: '2023-12-15',
        time: '18:00 - 21:00',
        location: '서울대학교 교수회관',
        description: '2023년 송년회 및 네트워킹',
      }
    ];
  };

  // 기수 목록 가져오기
  const terms = Array.from(new Set(schedules.map(schedule => schedule.term)));
  
  // 현재 선택된 기수의 일정만 필터링
  const filteredSchedules = activeTab === 'all' 
    ? schedules 
    : schedules.filter(schedule => schedule.term === activeTab);

  // 학사 일정과 특별 활동 분리
  const academicSchedules = filteredSchedules.filter(schedule => schedule.category === '학사 일정');
  const specialActivities = filteredSchedules.filter(schedule => schedule.category === '특별 활동');
  
  // 특별 활동 하위 분류
  const overseasActivities = specialActivities.filter(activity => activity.subcategory === '해외 연수');
  const fieldTrips = specialActivities.filter(activity => activity.subcategory === '현장 탐방');
  const socialActivities = specialActivities.filter(activity => activity.subcategory === '친교 활동');

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  // 일정 항목 렌더링 함수
  const renderScheduleItem = (schedule: Schedule) => (
    <div key={schedule.id} className="mb-6 reveal">
      <div className="flex flex-col md:flex-row md:items-start gap-4">
        <div className="md:w-1/4">
          <div className="bg-gray-100 p-4 rounded-lg text-center">
            <p className="text-lg font-medium text-mainBlue">{formatDate(schedule.date)}</p>
            <p className="text-sm text-gray-600">{schedule.time}</p>
          </div>
        </div>
        <div className="md:w-3/4">
          <h3 className="text-xl font-bold text-mainBlue mb-2">{schedule.title}</h3>
          <p className="text-gray-600 mb-2">장소: {schedule.location}</p>
          <p className="text-gray-700">{schedule.description}</p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Header />
      <main className="pt-24 pb-16">
        <ScrollReveal>
          <section className="py-16 bg-mainBlue text-white">
            <div className="main-container">
              <h1 className="text-3xl md:text-4xl font-bold mb-4 reveal">학사 일정</h1>
              <p className="text-white/80 max-w-3xl reveal reveal-delay-100">
                서울대학교 정치지도자과정의 학사 일정 및 특별 활동 정보를 제공합니다.
              </p>
            </div>
          </section>

          <section className="py-16">
            <div className="main-container">
              <div className="max-w-5xl mx-auto">
                {loading ? (
                  <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mainBlue"></div>
                  </div>
                ) : error ? (
                  <div className="text-center py-10">
                    <p className="text-red-500 mb-4">{error}</p>
                    <p>관리자에게 문의하세요.</p>
                  </div>
                ) : (
                  <>
                    <div className="mb-10 reveal reveal-delay-200">
                      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="w-full justify-start mb-8 overflow-x-auto flex-nowrap">
                          <TabsTrigger value="all" className="px-6">전체</TabsTrigger>
                          {terms.map(term => (
                            <TabsTrigger key={term} value={term} className="px-6">{term}</TabsTrigger>
                          ))}
                        </TabsList>
                        
                        <TabsContent value={activeTab} className="mt-6">
                          {/* 학사 일정 섹션 */}
                          <Card className="mb-10 reveal">
                            <CardHeader>
                              <CardTitle className="text-2xl font-bold text-mainBlue">학사 일정</CardTitle>
                            </CardHeader>
                            <CardContent>
                              {academicSchedules.length > 0 ? (
                                <div className="space-y-6">
                                  {academicSchedules.map(renderScheduleItem)}
                                </div>
                              ) : (
                                <p className="text-gray-500 text-center py-8">등록된 학사 일정이 없습니다.</p>
                              )}
                            </CardContent>
                          </Card>

                          {/* 특별 활동 섹션 */}
                          <Card className="reveal reveal-delay-100">
                            <CardHeader>
                              <CardTitle className="text-2xl font-bold text-mainBlue">특별 활동</CardTitle>
                            </CardHeader>
                            <CardContent>
                              {specialActivities.length > 0 ? (
                                <>
                                  {/* 해외 연수 */}
                                  {overseasActivities.length > 0 && (
                                    <div className="mb-10">
                                      <h3 className="text-xl font-semibold mb-4 text-gray-800">해외 연수</h3>
                                      <div className="space-y-6">
                                        {overseasActivities.map(renderScheduleItem)}
                                      </div>
                                    </div>
                                  )}

                                  {/* 현장 탐방 */}
                                  {fieldTrips.length > 0 && (
                                    <div className="mb-10">
                                      <h3 className="text-xl font-semibold mb-4 text-gray-800">현장 탐방</h3>
                                      <div className="space-y-6">
                                        {fieldTrips.map(renderScheduleItem)}
                                      </div>
                                    </div>
                                  )}

                                  {/* 친교 활동 */}
                                  {socialActivities.length > 0 && (
                                    <div>
                                      <h3 className="text-xl font-semibold mb-4 text-gray-800">친교 활동</h3>
                                      <div className="space-y-6">
                                        {socialActivities.map(renderScheduleItem)}
                                      </div>
                                    </div>
                                  )}
                                </>
                              ) : (
                                <p className="text-gray-500 text-center py-8">등록된 특별 활동이 없습니다.</p>
                              )}
                            </CardContent>
                          </Card>
                        </TabsContent>
                      </Tabs>
                    </div>
                  </>
                )}
              </div>
            </div>
          </section>
        </ScrollReveal>
      </main>
      <Footer />
    </>
  );
};

export default ScheduleCalendar; 