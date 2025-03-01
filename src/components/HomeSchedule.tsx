
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

type Event = {
  id: number;
  title: string;
  date: Date;
  description: string;
};

const HomeSchedule = () => {
  const [currentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<Date[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);

  // Mock data for events
  const events: Event[] = [
    {
      id: 1,
      title: "입학식",
      date: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 2),
      description: "제 15기 정치지도자과정 입학식"
    },
    {
      id: 2,
      title: "특별 강연",
      date: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 5),
      description: "국제 정세와 한국의 정치 리더십"
    },
    {
      id: 3,
      title: "현장 탐방",
      date: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 7),
      description: "국회 방문 및 토론회 참관"
    },
    {
      id: 4,
      title: "토론 세미나",
      date: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 12),
      description: "한국 정치의 발전 방향과 정치 리더십의 역할"
    }
  ];

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

    // Filter upcoming events
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const upcoming = events
      .filter(event => event.date >= today)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 3);
    
    setUpcomingEvents(upcoming);
  }, [currentDate]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const getMonthName = (date: Date) => {
    return new Intl.DateTimeFormat('ko-KR', { month: 'long' }).format(date);
  };

  const hasEvent = (date: Date) => {
    const dateStr = date.toDateString();
    return events.some(event => event.date.toDateString() === dateStr);
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
            
            {upcomingEvents.length > 0 ? (
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
