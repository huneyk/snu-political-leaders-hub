import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useNavigate } from 'react-router-dom';
import ScrollReveal from '@/components/ScrollReveal';
import { apiService } from '@/lib/apiService';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

// 일정 인터페이스 정의
interface Schedule {
  _id: string;
  term: number; // 숫자 타입으로 변경
  year?: string;
  category: string;
  title: string;
  date: string; // API에서는 string으로 전달됨
  time?: string;
  location?: string;
  description?: string;
  isActive: boolean;
  sessions?: Array<{
    time?: string;
    title: string;
    location?: string;
    description?: string;
  }>;
}

const ScheduleActivities: React.FC = () => {
  const [selectedTerm, setSelectedTerm] = useState<number | null>(null); // 숫자 타입으로 변경
  const [activeTab, setActiveTab] = useState('all');
  const [specialActivities, setSpecialActivities] = useState<Schedule[]>([]);
  const [availableTerms, setAvailableTerms] = useState<number[]>([]); // 숫자 타입으로 변경
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  // MongoDB에서 특별활동 일정 데이터 가져오기
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setIsLoading(true);
        const data = await apiService.getSchedules();
        
        if (data && Array.isArray(data)) {
          // 특별활동 일정만 필터링 (category 필드가 academic이 아닌 일정)
          const activities = data.filter(schedule => 
            schedule.category && 
            schedule.category !== 'academic' && 
            schedule.isActive
          );
          
          console.log('Filtered activities:', activities);
          setSpecialActivities(activities);
          
          // 사용 가능한 기수 목록 추출
          const terms = new Set<number>();
          activities.forEach(activity => {
            if (activity.term) {
              terms.add(activity.term);
            }
          });
          
          const sortedTerms = Array.from(terms).sort((a, b) => b - a); // 내림차순 정렬
          
          console.log('Available terms:', sortedTerms);
          setAvailableTerms(sortedTerms);
          
          // 가장 최근 기수를 기본값으로 설정
          if (sortedTerms.length > 0) {
            setSelectedTerm(sortedTerms[0]);
          }
        }
        
        setError(null);
      } catch (err) {
        console.error('특별활동 정보를 불러오는 중 오류가 발생했습니다:', err);
        setError('일정 데이터를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSchedules();
  }, []);
  
  // 선택된 기수의 활동만 필터링
  const termActivities = selectedTerm !== null 
    ? specialActivities.filter(activity => activity.term === selectedTerm)
    : specialActivities;
  
  // 선택된 탭에 따라 활동 유형별로 필터링
  const filteredActivities = activeTab === 'all'
    ? termActivities
    : termActivities.filter(activity => activity.category === activeTab);
  
  console.log('Selected term:', selectedTerm);
  console.log('Filtered activities for display:', filteredActivities);
  
  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'yyyy년 M월 d일 EEEE', { locale: ko });
    } catch (error) {
      console.error('날짜 형식 변환 오류:', error);
      return dateString;
    }
  };
  
  // 활동 유형에 따른 한글 이름 반환
  const getCategoryName = (category: string) => {
    switch (category) {
      case 'field': return '현장 탐방';
      case 'overseas': return '해외 연수';
      case 'social': return '친교 활동';
      case 'special': return '특별 활동';
      default: return '기타 활동';
    }
  };

  const handleScheduleTabChange = (value: string) => {
    if (value === 'calendar') {
      navigate('/schedule/calendar');
    }
  };

  return (
    <>
      <Header />
      <main className="pt-24 pb-16">
        <ScrollReveal>
          <section className="py-16 bg-mainBlue text-white">
            <div className="main-container">
              <h1 className="text-3xl md:text-4xl font-bold mb-4 reveal">특별활동 일정</h1>
              <p className="text-white/80 max-w-3xl reveal reveal-delay-100">
                서울대학교 정치지도자과정의 다양한 특별활동을 확인하세요.
              </p>
            </div>
          </section>
        </ScrollReveal>

        {isLoading ? (
          <div className="main-container py-12">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mainBlue"></div>
            </div>
          </div>
        ) : error ? (
          <div className="main-container py-12">
            <div className="text-center text-red-500 py-12">
              <p>{error}</p>
            </div>
          </div>
        ) : (
          <div className="main-container py-12">
            <Tabs defaultValue="activities" className="mb-6" onValueChange={handleScheduleTabChange}>
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="calendar">학사 일정</TabsTrigger>
                <TabsTrigger value="activities">특별 활동</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <div className="mb-4 md:mb-0">
                {availableTerms.length > 0 ? (
                  <Select 
                    value={selectedTerm?.toString()} 
                    onValueChange={(value) => setSelectedTerm(parseInt(value, 10))}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="기수 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTerms.map((term) => (
                        <SelectItem key={term} value={term.toString()}>
                          {term}기
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-gray-500">등록된 기수 정보가 없습니다.</p>
                )}
              </div>
            </div>
            
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="all">전체 활동</TabsTrigger>
                <TabsTrigger value="field">현장 탐방</TabsTrigger>
                <TabsTrigger value="overseas">해외 연수</TabsTrigger>
                <TabsTrigger value="social">친교 활동</TabsTrigger>
                <TabsTrigger value="special">특별 활동</TabsTrigger>
              </TabsList>
              
              <TabsContent value={activeTab}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredActivities.length > 0 ? (
                    filteredActivities.map((activity) => (
                      <Card key={activity._id} className="h-full">
                        <CardHeader className="bg-mainBlue/5 border-b">
                          <div className="flex justify-between items-center">
                            <span className="px-3 py-1 bg-mainBlue text-white text-xs rounded-full">
                              {getCategoryName(activity.category)}
                            </span>
                          </div>
                          <CardTitle className="mt-3 text-xl">{activity.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                          <dl className="space-y-4">
                            <div>
                              <dt className="text-sm font-medium text-gray-500">일시</dt>
                              <dd className="text-base">
                                {formatDate(activity.date)}
                                {activity.time && ` ${activity.time}`}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-sm font-medium text-gray-500">장소</dt>
                              <dd className="text-base">{activity.location || '미정'}</dd>
                            </div>
                            {activity.description && (
                              <div>
                                <dt className="text-sm font-medium text-gray-500">세부 내용</dt>
                                <dd className="text-base whitespace-pre-line">{activity.description}</dd>
                              </div>
                            )}
                            {activity.sessions && activity.sessions.length > 0 && (
                              <div>
                                <dt className="text-sm font-medium text-gray-500">세부 일정</dt>
                                <dd className="mt-2 space-y-3">
                                  {activity.sessions.map((session, index) => (
                                    <div key={index} className="border-l-2 border-mainBlue pl-3">
                                      <p className="font-medium">{session.title}</p>
                                      {session.time && <p className="text-sm text-gray-600">시간: {session.time}</p>}
                                      {session.location && <p className="text-sm text-gray-600">장소: {session.location}</p>}
                                      {session.description && <p className="text-sm text-gray-600 mt-1">{session.description}</p>}
                                    </div>
                                  ))}
                                </dd>
                              </div>
                            )}
                          </dl>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-12">
                      <p className="text-gray-500">등록된 특별활동 일정이 없습니다.</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
};

export default ScheduleActivities; 