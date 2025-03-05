import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { isAfter, parseISO, compareAsc, format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface Schedule {
  id: string;
  term: string;
  category: string; // 구분 (학사 일정, 현장 탐방, 해외 연수, 친교 활동)
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  createdAt?: number; // 생성 시간 추가
}

// 빈 배열로 초기화
const DEFAULT_ACADEMIC_SCHEDULES: Schedule[] = [];
const DEFAULT_SPECIAL_ACTIVITIES: Schedule[] = [];

const HomeSchedule = () => {
  const [academicSchedules, setAcademicSchedules] = useState<Schedule[]>(DEFAULT_ACADEMIC_SCHEDULES);
  const [specialActivities, setSpecialActivities] = useState<Schedule[]>(DEFAULT_SPECIAL_ACTIVITIES);
  const [upcomingEvents, setUpcomingEvents] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 데이터 로드 완료 여부를 추적하는 ref
  const dataLoadedRef = useRef<boolean>(false);
  // 컴포넌트 마운트 여부를 추적하는 ref
  const isMountedRef = useRef<boolean>(true);

  // 일정 데이터 로드 및 업데이트
  useEffect(() => {
    isMountedRef.current = true;
    dataLoadedRef.current = false;
    
    // 초기 데이터 로드
    loadInitialData();
    
    // localStorage 변경 감지
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      isMountedRef.current = false;
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // 데이터 로드 후 주기적 업데이트를 위한 별도 useEffect
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    
    if (dataLoadedRef.current && isMountedRef.current) {
      // 데이터가 로드된 후에만 주기적 갱신 시작 (60초마다)
      intervalId = setInterval(() => {
        if (isMountedRef.current) {
          loadSchedules();
        }
      }, 60000); // 60초마다 갱신으로 변경
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [dataLoadedRef.current]);

  // localStorage 변경 이벤트 핸들러
  const handleStorageChange = (event: StorageEvent) => {
    if (!isMountedRef.current) return;
    
    if (event.key === 'academicSchedules' || event.key === 'specialActivities') {
      loadSchedules();
    }
  };

  // 초기 데이터 로드 함수
  const loadInitialData = async () => {
    if (!isMountedRef.current) return;
    
    setLoading(true);
    
    try {
      // 학사 일정과 특별활동 동시에 로드
      const [academicData, specialData] = await Promise.all([
        loadAcademicSchedules(),
        loadSpecialActivities()
      ]);
      
      // 다가오는 일정 업데이트
      if (isMountedRef.current) {
        await updateUpcomingEvents(academicData, specialData);
      }
      
      // 데이터 로드 완료 표시
      dataLoadedRef.current = true;
      
      if (isMountedRef.current) {
        setLoading(false);
      }
    } catch (error) {
      console.error('일정 로드 중 오류 발생:', error);
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  // 일정 데이터 로드 함수
  const loadSchedules = async () => {
    if (!isMountedRef.current) return;
    
    try {
      // 학사 일정과 특별활동 동시에 로드
      const [academicData, specialData] = await Promise.all([
        loadAcademicSchedules(),
        loadSpecialActivities()
      ]);
      
      // 다가오는 일정 업데이트
      if (isMountedRef.current) {
        await updateUpcomingEvents(academicData, specialData);
      }
    } catch (error) {
      console.error('일정 로드 중 오류 발생:', error);
    }
  };

  // 학사 일정 로드
  const loadAcademicSchedules = async () => {
    return new Promise<Schedule[]>((resolve) => {
      if (!isMountedRef.current) {
        resolve([]);
        return;
      }
      
      try {
        const savedSchedules = localStorage.getItem('academicSchedules');
        
        if (savedSchedules) {
          try {
            const parsedSchedules = JSON.parse(savedSchedules);
            
            if (isMountedRef.current) {
              setAcademicSchedules(parsedSchedules);
            }
            
            resolve(parsedSchedules);
          } catch (parseError) {
            console.error('학사 일정 파싱 오류:', parseError);
            if (isMountedRef.current) {
              setAcademicSchedules([]);
            }
            resolve([]);
          }
        } else {
          if (isMountedRef.current) {
            setAcademicSchedules([]);
          }
          resolve([]);
        }
      } catch (error) {
        console.error('학사 일정 로드 중 오류:', error);
        if (isMountedRef.current) {
          setAcademicSchedules([]);
        }
        resolve([]);
      }
    });
  };
  
  // 특별활동 일정 로드
  const loadSpecialActivities = async () => {
    return new Promise<Schedule[]>((resolve) => {
      if (!isMountedRef.current) {
        resolve([]);
        return;
      }
      
      try {
        const savedActivities = localStorage.getItem('specialActivities');
        
        if (savedActivities) {
          try {
            const parsedActivities = JSON.parse(savedActivities);
            
            if (isMountedRef.current) {
              setSpecialActivities(parsedActivities);
            }
            
            resolve(parsedActivities);
          } catch (parseError) {
            console.error('특별활동 일정 파싱 오류:', parseError);
            if (isMountedRef.current) {
              setSpecialActivities([]);
            }
            resolve([]);
          }
        } else {
          if (isMountedRef.current) {
            setSpecialActivities([]);
          }
          resolve([]);
        }
      } catch (error) {
        console.error('특별활동 일정 로드 중 오류:', error);
        if (isMountedRef.current) {
          setSpecialActivities([]);
        }
        resolve([]);
      }
    });
  };

  // 다가오는 일정 업데이트 (오늘 날짜 이후의 일정 5건)
  const updateUpcomingEvents = async (academicData?: Schedule[], specialData?: Schedule[]) => {
    return new Promise<void>((resolve) => {
      if (!isMountedRef.current) {
        resolve();
        return;
      }
      
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // 모든 일정을 합치기 (인자로 받은 데이터가 있으면 사용, 없으면 state 사용)
        let allEvents = [...(academicData || academicSchedules), ...(specialData || specialActivities)];
        
        // 오늘 이후의 일정만 필터링
        const futureEvents = allEvents.filter(event => {
          try {
            const eventDate = parseISO(event.date);
            return isAfter(eventDate, today) || eventDate.getTime() === today.getTime();
          } catch (error) {
            return false;
          }
        });
        
        // 날짜순으로 정렬
        const sortedEvents = futureEvents.sort((a, b) => {
          try {
            return compareAsc(parseISO(a.date), parseISO(b.date));
          } catch (error) {
            return 0;
          }
        });
        
        // 최대 5개까지만 표시
        const upcomingEvents = sortedEvents.slice(0, 5);
        
        if (isMountedRef.current) {
          setUpcomingEvents(upcomingEvents);
        }
        
        resolve();
      } catch (error) {
        console.error('다가오는 일정 업데이트 중 오류:', error);
        if (isMountedRef.current) {
          setUpcomingEvents([]);
        }
        resolve();
      }
    });
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'yyyy년 MM월 dd일 (eee)', { locale: ko });
    } catch (error) {
      console.error('날짜 포맷팅 오류:', error);
      return dateString;
    }
  };
  
  // 카테고리 이름 변환 함수
  const getCategoryName = (category: string) => {
    switch (category) {
      case 'academic': return '학사 일정';
      case 'field': return '현장 탐방';
      case 'overseas': return '해외 연수';
      case 'social': return '친교 활동';
      default: return '기타 활동';
    }
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-mainBlue mb-4" style={{ wordBreak: 'keep-all' }}>학사 일정</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto" style={{ wordBreak: 'keep-all' }}>
            정치지도자과정의 주요 일정을 확인하세요
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mainBlue"></div>
            </div>
          ) : upcomingEvents.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-700 mb-2" style={{ wordBreak: 'keep-all' }}>예정된 일정이 없습니다</h3>
              <p className="text-gray-500" style={{ wordBreak: 'keep-all' }}>현재 등록된 일정이 없습니다.</p>
            </div>
            ) : (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4" style={{ wordBreak: 'keep-all' }}>다가오는 일정</h3>
                <div className="space-y-6">
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className="flex flex-col md:flex-row gap-4 border-b border-gray-100 pb-4">
                      <div className="md:w-1/4 flex-shrink-0">
                        <div className="bg-mainBlue/10 text-mainBlue rounded-lg p-3 text-center">
                          <div className="text-sm font-medium">{formatDate(event.date)}</div>
                          {event.time && <div className="text-xs mt-1">{event.time}</div>}
                </div>
                    </div>
                      <div className="md:w-3/4">
                        <h4 className="font-bold text-gray-900" style={{ wordBreak: 'keep-all' }}>{event.title}</h4>
                        <div className="flex flex-wrap gap-2 mt-2 text-sm">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs" style={{ wordBreak: 'keep-all' }}>
                            {getCategoryName(event.category)}
                          </span>
                          {event.location && (
                            <span className="text-gray-600 flex items-center text-xs" style={{ wordBreak: 'keep-all' }}>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              {event.location}
                            </span>
                  )}
                </div>
                        {event.description && (
                          <p className="text-gray-600 mt-2 text-sm line-clamp-2" style={{ wordBreak: 'keep-all' }}>{event.description}</p>
                        )}
          </div>
                    </div>
                  ))}
                  </div>
              </div>
            </div>
            )}
        </div>

        <div className="text-center mt-6">
              <Link 
                to="/schedule/calendar" 
                className="inline-block px-4 py-2 bg-mainBlue/70 text-white font-medium rounded hover:bg-blue-900/70 transition-colors duration-300 text-sm"
              >
                자세한 내용 보기 {'>'}
              </Link>
        </div>
      </div>
    </section>
  );
};

export default HomeSchedule;