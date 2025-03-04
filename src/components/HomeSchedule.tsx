import { useState, useEffect } from 'react';
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

  // 일정 데이터 로드 및 업데이트
  useEffect(() => {
    // 기본 데이터 삭제
    removeDefaultData();
    
    loadSchedules();
    
    // localStorage 변경 감지
    window.addEventListener('storage', handleStorageChange);
    
    // 주기적으로 데이터 갱신
    const intervalId = setInterval(loadSchedules, 5000);
    
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('storage', handleStorageChange);
    };
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

  // localStorage 변경 이벤트 핸들러
  const handleStorageChange = (event: StorageEvent) => {
    if (event.key === 'academicSchedules' || event.key === 'specialActivities') {
      loadSchedules();
    }
  };

  // 모든 일정 데이터 로드
  const loadSchedules = () => {
    loadAcademicSchedules();
    loadSpecialActivities();
    setLoading(false);
  };

  // 학사 일정 로드
  const loadAcademicSchedules = () => {
    try {
      const savedSchedules = localStorage.getItem('academicSchedules');
      
      if (savedSchedules) {
        setAcademicSchedules(JSON.parse(savedSchedules));
      } else {
        setAcademicSchedules(DEFAULT_ACADEMIC_SCHEDULES);
        localStorage.setItem('academicSchedules', JSON.stringify(DEFAULT_ACADEMIC_SCHEDULES));
      }
    } catch (error) {
      console.error('학사 일정 로드 중 오류:', error);
      setAcademicSchedules(DEFAULT_ACADEMIC_SCHEDULES);
    } finally {
      updateUpcomingEvents();
    }
  };
  
  // 특별활동 일정 로드
  const loadSpecialActivities = () => {
    try {
      const savedActivities = localStorage.getItem('specialActivities');
      
      if (savedActivities) {
        setSpecialActivities(JSON.parse(savedActivities));
      } else {
        setSpecialActivities(DEFAULT_SPECIAL_ACTIVITIES);
        localStorage.setItem('specialActivities', JSON.stringify(DEFAULT_SPECIAL_ACTIVITIES));
      }
    } catch (error) {
      console.error('특별활동 일정 로드 중 오류:', error);
      setSpecialActivities(DEFAULT_SPECIAL_ACTIVITIES);
    } finally {
      updateUpcomingEvents();
    }
  };

  // 다가오는 일정 업데이트
  const updateUpcomingEvents = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const allSchedules = [...academicSchedules, ...specialActivities];
    
    const upcoming = allSchedules
      .filter(schedule => {
        const scheduleDate = parseISO(schedule.date);
        return isAfter(scheduleDate, today) || 
               format(scheduleDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
      })
      .sort((a, b) => compareAsc(parseISO(a.date), parseISO(b.date)));
    
    setUpcomingEvents(upcoming);
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
    <section className="py-20 bg-gray-50" id="schedule">
      <div className="main-container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-mainBlue mb-4 reveal">전체 일정</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto reveal reveal-delay-100">
            다가오는 일정 안내
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-elegant p-6 md:p-8 reveal reveal-delay-200">
            <h3 className="text-xl font-bold text-mainBlue mb-6">다가오는 일정</h3>
            
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-mainBlue"></div>
              </div>
            ) : upcomingEvents.length > 0 ? (
              <div className="space-y-4">
                {upcomingEvents.map(schedule => (
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
              <p className="text-gray-500 py-8 text-center">다가오는 일정이 없습니다.</p>
            )}

            <div className="mt-8 pt-4 border-t border-gray-100">
              <Link 
                to="/schedule/calendar" 
                className="btn-primary w-full justify-center"
              >
                전체 일정 보기
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeSchedule; 