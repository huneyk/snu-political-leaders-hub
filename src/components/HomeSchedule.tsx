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

// 기본 학사 일정 데이터 (빈 배열로 변경)
const DEFAULT_ACADEMIC_SCHEDULES: Schedule[] = [];

// 기본 특별활동 데이터 (빈 배열로 변경)
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
    console.log('HomeSchedule 컴포넌트 마운트');
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
      // 데이터가 로드된 후에만 주기적 갱신 시작
      intervalId = setInterval(() => {
        if (isMountedRef.current) {
          console.log('일정 데이터 주기적 갱신 중...');
          loadSchedules();
        }
      }, 10000); // 10초마다 갱신
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
      console.log('localStorage 변경 감지:', event.key);
      loadSchedules();
    }
  };

  // 초기 데이터 로드 함수
  const loadInitialData = async () => {
    if (!isMountedRef.current) return;
    
    console.log('초기 데이터 로드 시작');
    setLoading(true);
    
    try {
      // 기본 데이터 삭제
      await removeDefaultData();
      
      // 학사 일정 로드
      const academicData = await loadAcademicSchedules();
      
      // 특별활동 로드
      const specialData = await loadSpecialActivities();
      
      if (!isMountedRef.current) return;
      
      // 일정 업데이트
      await updateUpcomingEvents();
      
      // 데이터 로드 완료 표시
      dataLoadedRef.current = true;
      
      if (!isMountedRef.current) return;
      setLoading(false);
      
      console.log('초기 데이터 로드 완료');
    } catch (error) {
      console.error('초기 데이터 로드 오류:', error);
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  // 모든 일정 데이터 로드
  const loadSchedules = async () => {
    if (!isMountedRef.current) return;
    
    try {
      console.log('일정 데이터 로드 시작...');
      
      // 학사 일정 로드
      await loadAcademicSchedules();
      
      // 특별활동 로드
      await loadSpecialActivities();
      
      if (!isMountedRef.current) return;
      
      // 일정 업데이트
      await updateUpcomingEvents();
      
      console.log('일정 데이터 로드 및 업데이트 완료');
    } catch (error) {
      console.error('일정 로드 중 오류 발생:', error);
    }
  };

  // 기본 데이터 삭제 함수
  const removeDefaultData = async () => {
    return new Promise<void>((resolve) => {
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
        
        resolve();
      } catch (error) {
        console.error('기본 데이터 삭제 중 오류 발생:', error);
        resolve();
      }
    });
  };

  // 학사 일정 로드
  const loadAcademicSchedules = async () => {
    return new Promise<Schedule[]>((resolve) => {
      if (!isMountedRef.current) {
        resolve([]);
        return;
      }
      
      try {
        console.log('학사 일정 로드 중...');
        const savedSchedules = localStorage.getItem('academicSchedules');
        
        if (savedSchedules) {
          try {
            const parsedSchedules = JSON.parse(savedSchedules);
            console.log('학사 일정 데이터 로드:', parsedSchedules.length);
            
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
          console.log('저장된 학사 일정 없음, 빈 배열 사용');
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
        console.log('특별활동 일정 로드 중...');
        const savedActivities = localStorage.getItem('specialActivities');
        
        if (savedActivities) {
          try {
            const parsedActivities = JSON.parse(savedActivities);
            console.log('특별활동 데이터 로드:', parsedActivities.length);
            
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
          console.log('저장된 특별활동 일정 없음, 빈 배열 사용');
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
  const updateUpcomingEvents = async () => {
    return new Promise<void>((resolve) => {
      if (!isMountedRef.current) {
        resolve();
        return;
      }
      
      try {
        console.log('일정 업데이트 시작');
        console.log('현재 학사 일정:', academicSchedules.length);
        console.log('현재 특별활동:', specialActivities.length);
        
    const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // 모든 일정을 합치기
        const allEvents = [...academicSchedules, ...specialActivities];
        console.log('총 일정 수:', allEvents.length);
        
        if (allEvents.length === 0) {
          console.log('일정이 없습니다.');
          if (isMountedRef.current) {
            setUpcomingEvents([]);
          }
          resolve();
          return;
        }
        
        // 유효한 날짜를 가진 일정만 필터링
        const validEvents = allEvents.filter(event => {
          if (!event || !event.date || typeof event.date !== 'string') {
            console.warn('유효하지 않은 일정 또는 날짜 형식:', event);
            return false;
          }
          
          try {
            // 날짜 형식 검증
            const eventDate = parseISO(event.date);
            if (isNaN(eventDate.getTime())) {
              console.warn('유효하지 않은 날짜:', event.date);
              return false;
            }
            
            // 오늘 날짜 이후의 일정만 필터링
            const isToday = eventDate.toDateString() === today.toDateString();
            const isFuture = isAfter(eventDate, today);
            
            return isFuture || isToday;
          } catch (error) {
            console.error('날짜 파싱 오류:', error, event);
            return false;
          }
        });
        
        console.log('유효한 일정 수:', validEvents.length);
        
        // 날짜순으로 정렬
        const sortedEvents = validEvents.sort((a, b) => {
          try {
            return compareAsc(parseISO(a.date), parseISO(b.date));
          } catch (error) {
            console.error('날짜 비교 오류:', error);
            return 0;
          }
        });
        
        // 최대 5개의 일정만 표시
        const limitedEvents = sortedEvents.slice(0, 5);
        console.log('표시할 일정 5건:', limitedEvents);
        
        if (isMountedRef.current) {
          setUpcomingEvents(limitedEvents);
        }
        
        resolve();
      } catch (error) {
        console.error('일정 업데이트 중 오류 발생:', error);
        if (isMountedRef.current) {
          setUpcomingEvents([]);
        }
        resolve();
      }
    });
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, 'yyyy년 M월 d일 (EEEE)', { locale: ko });
    } catch (error) {
      console.error('날짜 포맷팅 오류:', error);
      return dateString;
    }
  };

  // 카테고리 이름 가져오기
  const getCategoryName = (category: string) => {
    const categories: Record<string, string> = {
      'academic': '학사 일정',
      'field': '현장 탐방',
      'overseas': '해외 연수',
      'social': '친교 활동'
    };
    
    return categories[category] || '기타 활동';
  };

  return (
    <section className="py-16 bg-white" id="schedule">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">전체 일정</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            정치지도자과정의 주요 일정을 확인하세요
          </p>
        </div>

        <div className="max-w-4xl mx-auto mb-10">
          <h3 className="text-xl font-bold text-gray-800 mb-6">다가오는 일정</h3>
          
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          ) : upcomingEvents.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-lg shadow-md">
              <p className="text-gray-500">현재 표시할 일정이 없습니다.</p>
              <p className="text-sm text-gray-400 mt-2">관리자 페이지에서 일정을 추가해 주세요.</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="divide-y divide-gray-100">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div className="mb-2 md:mb-0">
                        <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800 mr-2">
                          {getCategoryName(event.category)}
                        </span>
                        <span className="text-gray-500 text-sm">{event.term}</span>
          </div>
                      <div className="text-sm text-gray-500">
                      {formatDate(event.date)}
                        {event.time && ` ${event.time}`}
                      </div>
                    </div>
                    <h4 className="font-medium text-lg mt-1">{event.title}</h4>
                    {event.location && (
                      <div className="text-sm text-gray-600 mt-1">
                        <span className="font-medium">장소:</span> {event.location}
                      </div>
                    )}
                    {event.description && (
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">{event.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
            )}
        </div>

        <div className="text-center">
              <Link 
                to="/schedule/calendar" 
            className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition-colors duration-300"
              >
            자세히 보기
              </Link>
        </div>
      </div>
    </section>
  );
};

export default HomeSchedule;