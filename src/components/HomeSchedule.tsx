import { useState, useEffect, FC } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { apiService } from '@/lib/apiService';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

// 일정 데이터 인터페이스
interface EventItem {
  _id?: string;
  id: string | number;
  title: string;
  date: string;
  time?: string;
  location?: string;
  description?: string;
  type?: string;
}

// 컴포넌트 속성 정의
interface HomeScheduleProps {
  onStatusChange?: (loaded: boolean, error: string | null) => void;
}

const HomeSchedule: FC<HomeScheduleProps> = ({ onStatusChange }) => {
  const [upcomingEvents, setUpcomingEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSchedulesFromMongoDB();
  }, []);

  // 일정 데이터 로드 함수
  const loadSchedulesFromMongoDB = async () => {
    try {
      console.log('일정 데이터 로드 시작');
      setLoading(true);
      setError(null);
      
      if (onStatusChange) onStatusChange(false, null);
      
      const scheduleData = await apiService.getSchedules();
      console.log('로드된 일정 데이터:', scheduleData);
      
      if (scheduleData && Array.isArray(scheduleData)) {
        const formattedSchedules = scheduleData.map(formatSchedule).filter(Boolean);
        const upcomingEvents = filterUpcomingEvents(formattedSchedules);
        setUpcomingEvents(upcomingEvents);
      } else {
        setUpcomingEvents([]);
      }
      
      setLoading(false);
      if (onStatusChange) onStatusChange(true, null);
      
    } catch (err) {
      console.error('일정 데이터 로드 오류:', err);
      setError(err instanceof Error ? err.message : '일정 데이터를 불러오는 중 오류가 발생했습니다.');
      setUpcomingEvents([]);
      setLoading(false);
      
      if (onStatusChange) onStatusChange(true, err instanceof Error ? err.message : '일정 데이터 로드 오류');
    }
  };

  // 일정 데이터 형식 변환 함수
  const formatSchedule = (schedule: any): EventItem | null => {
    try {
      // 필수 필드 확인
      if (!schedule.title || !schedule.date) {
        console.warn('필수 필드가 없는 일정 항목 무시:', schedule);
        return null;
      }
      
      return {
        _id: schedule._id,
        id: schedule._id || schedule.id || Math.random().toString(36).substring(2, 9),
        title: schedule.title,
        date: schedule.date,
        time: schedule.time || '',
        location: schedule.location || '',
        description: schedule.description || '',
        type: schedule.type || '일반'
      };
    } catch (error) {
      console.error('일정 데이터 형식 변환 오류:', error);
      return null;
    }
  };

  // 다가오는 일정 필터링 함수
  const filterUpcomingEvents = (events: (EventItem | null)[]): EventItem[] => {
    const now = new Date();
    const filteredEvents = events
      .filter((event): event is EventItem => 
        event !== null && new Date(event.date) >= now
      )
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5); // 최대 5개까지만 표시
    
    return filteredEvents;
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'yyyy년 MM월 dd일');
    } catch (e) {
      return '날짜 정보 없음';
    }
  };

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">일정 안내</h2>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <p className="text-red-700">{error}</p>
          </div>
        ) : upcomingEvents.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 mb-8">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="bg-white rounded-lg shadow-sm p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center">
                  <div className="flex-shrink-0 md:mr-6 mb-4 md:mb-0">
                    <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg text-center">
                      <div className="text-xl font-bold">{formatDate(event.date)}</div>
                      {event.time && <div className="text-sm mt-1">{event.time}</div>}
                    </div>
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-2">{event.title}</h3>
                    {event.location && (
                      <p className="text-gray-600 text-sm mb-2">
                        <span className="font-medium">장소:</span> {event.location}
                      </p>
                    )}
                    {event.description && (
                      <p className="text-gray-600 line-clamp-2">{event.description}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-6 text-center mb-8">
            <p className="text-gray-600">현재 예정된 일정이 없습니다.</p>
          </div>
        )}
        
        <div className="text-center">
          <Link to="/schedule/calendar">
            <Button className="bg-mainBlue/70 hover:bg-blue-900/70 transition-colors text-white h-9 text-sm px-4">
              <span>전체 일정 보기</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HomeSchedule;