import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

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

const HomeSchedule = () => {
  const [currentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<Date[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load schedules from localStorage
    const loadSchedules = () => {
      setLoading(true);
      
      try {
        console.log('HomeSchedule - Loading schedules from localStorage');
        const storedSchedules = localStorage.getItem('snu_plp_schedules');
        
        if (storedSchedules) {
          try {
            const parsedSchedules = JSON.parse(storedSchedules);
            
            if (Array.isArray(parsedSchedules)) {
              console.log('HomeSchedule - Successfully loaded schedules:', parsedSchedules.length);
              
              // Filter upcoming events
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              
              const upcoming = parsedSchedules
                .filter(schedule => {
                  const eventDate = new Date(schedule.date);
                  return eventDate >= today;
                })
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .slice(0, 3);
              
              setUpcomingEvents(upcoming);
            } else {
              console.log('HomeSchedule - Invalid data, using empty array');
              setUpcomingEvents([]);
            }
          } catch (error) {
            console.error('Error parsing schedules from localStorage:', error);
            setUpcomingEvents([]);
          }
        } else {
          console.log('HomeSchedule - No data found, using empty array');
          localStorage.setItem('snu_plp_schedules', JSON.stringify([]));
          setUpcomingEvents([]);
        }
      } catch (error) {
        console.error('Unexpected error loading schedules:', error);
        setUpcomingEvents([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadSchedules();
    
    // Set up interval to refresh data
    const intervalId = setInterval(() => {
      loadSchedules();
    }, 5000);
    
    // Add localStorage change listener
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'snu_plp_schedules') {
        loadSchedules();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    // Generate calendar days for the current month
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    const daysInMonth = lastDayOfMonth.getDate();
    const firstDayOfWeek = firstDayOfMonth.getDay(); // 0 for Sunday, 1 for Monday, etc.

    const days: Date[] = [];
    
    // Add previous month's days to complete the first week
    for (let i = 0; i < firstDayOfWeek; i++) {
      const day = new Date(year, month, -firstDayOfWeek + i + 1);
      days.push(day);
    }
    
    // Add days of the current month
    for (let i = 1; i <= daysInMonth; i++) {
      const day = new Date(year, month, i);
      days.push(day);
    }
    
    // Add next month's days to complete the last week
    const remainingDays = 7 - (days.length % 7);
    if (remainingDays < 7) {
      for (let i = 1; i <= remainingDays; i++) {
        const day = new Date(year, month + 1, i);
        days.push(day);
      }
    }
    
    setCalendarDays(days);
  }, [currentDate]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date);
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  const getMonthName = (date: Date) => {
    return new Intl.DateTimeFormat('ko-KR', { month: 'long' }).format(date);
  };

  const hasEvent = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return upcomingEvents.some(event => {
      const eventDate = new Date(event.date).toISOString().split('T')[0];
      return eventDate === dateStr;
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  return (
    <section className="py-20 bg-gray-50" id="schedule">
      <div className="main-container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-mainBlue mb-4 reveal">학사 일정</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto reveal reveal-delay-100">
            {getMonthName(currentDate)} 학사 일정
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-lg shadow-elegant p-6 md:p-8 reveal reveal-delay-200">
            <div className="mb-4 text-center">
              <h3 className="text-xl font-bold text-mainBlue">
                {`${currentDate.getFullYear()}년 ${currentDate.getMonth() + 1}월`}
              </h3>
            </div>
            
            <div className="grid grid-cols-7 gap-1">
              {['일', '월', '화', '수', '목', '금', '토'].map(day => (
                <div key={day} className="text-center font-medium p-2 text-gray-600">
                  {day}
                </div>
              ))}
              
              {calendarDays.map((day, index) => (
                <div 
                  key={index}
                  className={`relative h-20 border border-gray-100 rounded-md p-1 transition-all ${
                    isCurrentMonth(day)
                      ? 'bg-white'
                      : 'bg-gray-50 text-gray-400'
                  } ${
                    isToday(day)
                      ? 'ring-2 ring-mainBlue ring-opacity-50'
                      : ''
                  }`}
                >
                  <div className="text-right text-sm">{day.getDate()}</div>
                  
                  {hasEvent(day) && (
                    <div className="absolute bottom-1 left-0 right-0 flex justify-center">
                      <div className="w-1.5 h-1.5 bg-mainBlue rounded-full"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-elegant p-6 md:p-8 reveal reveal-delay-300">
            <h3 className="text-xl font-bold text-mainBlue mb-6">다가오는 일정</h3>
            
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-mainBlue"></div>
              </div>
            ) : upcomingEvents.length > 0 ? (
              <div className="space-y-6">
                {upcomingEvents.map(event => (
                  <div key={event.id} className="border-l-2 border-mainBlue pl-4 py-1">
                    <div className="text-sm text-gray-500 mb-1">
                      {formatDate(event.date)}
                    </div>
                    <h4 className="font-medium text-mainBlue mb-1">{event.title}</h4>
                    <p className="text-sm text-gray-600">{event.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">다가오는 일정이 없습니다.</p>
            )}

            <div className="mt-8 pt-4 border-t border-gray-100">
              <Link 
                to="/schedule/calendar" 
                className="btn-primary w-full justify-center"
              >
                전체 학사 일정 보기
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeSchedule;
