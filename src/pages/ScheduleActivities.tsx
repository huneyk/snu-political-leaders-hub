import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useNavigate } from 'react-router-dom';
import ScrollReveal from '@/components/ScrollReveal';
import { apiService } from '@/lib/apiService';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { toast } from '@/components/ui/use-toast';

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
    fetchSchedules();
  }, []); // 컴포넌트 마운트 시에만 실행
  
  // 일정 데이터 가져오기 함수
  const fetchSchedules = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('특별활동 일정 데이터 가져오기 시작...');
      
      // MongoDB에서 데이터 가져오기 시도
      console.log('MongoDB에서 데이터 가져오기 시도...');
      const response = await apiService.getSchedulesAll();
      
      if (response && Array.isArray(response) && response.length > 0) {
        console.log(`일정 데이터 로드 완료: ${response.length}개 일정`);
        
        // 유효한 데이터인지 확인
        const isValidData = response.every(item => 
          item && typeof item === 'object' && 
          item._id && item.title && item.date && item.category
        );
        
        if (isValidData) {
          // 특별활동 일정만 필터링 (category 필드가 academic이 아닌 일정)
          const activities = response.filter(schedule => 
            schedule.category && 
            schedule.category !== 'academic' && 
            schedule.isActive
          );
          
          console.log(`특별활동 필터링 완료: ${activities.length}개 특별활동`);
          setSpecialActivities(activities);
          
          // 데이터 캐싱 (로컬 스토리지 저장)
          try {
            localStorage.setItem('special-activities-data', JSON.stringify(activities));
            localStorage.setItem('special-activities-timestamp', Date.now().toString());
            console.log('특별활동 데이터 로컬스토리지에 백업 완료');
          } catch (storageError) {
            console.warn('로컬스토리지 백업 실패:', storageError);
          }
          
          // 사용 가능한 기수 목록 추출
          const terms = new Set<number>();
          activities.forEach(activity => {
            if (activity.term) {
              terms.add(typeof activity.term === 'number' ? activity.term : Number(activity.term));
            }
          });
          
          const sortedTerms = Array.from(terms).sort((a, b) => b - a); // 내림차순 정렬
          
          console.log('사용 가능한 기수:', sortedTerms);
          setAvailableTerms(sortedTerms);
          
          // localStorage에서 마지막으로 선택한 기수 가져오기
          const lastSelectedTerm = localStorage.getItem('lastSelectedTerm');
          
          // 마지막 선택 기수가 존재하고 현재 기수 목록에 포함되어 있으면 해당 기수 선택
          if (lastSelectedTerm && sortedTerms.includes(Number(lastSelectedTerm))) {
            setSelectedTerm(Number(lastSelectedTerm));
            console.log('마지막 선택 기수 복원:', lastSelectedTerm);
          } else if (sortedTerms.length > 0) {
            // 그렇지 않으면 가장 최근 기수 선택
            setSelectedTerm(sortedTerms[0]);
          }
          
          return;
        } else {
          console.error('API에서 유효하지 않은 데이터 형식 반환:', response);
          throw new Error('Invalid data format from API');
        }
      } else {
        console.error('API 응답이 비어있거나 배열이 아닙니다');
        throw new Error('Empty or invalid response from API');
      }
    } catch (err) {
      console.error('특별활동 정보를 불러오는 중 오류가 발생했습니다:', err);
      
      // 에러 메시지 표시
      toast({
        title: "데이터 로드 오류",
        description: "서버에서 특별활동 데이터를 가져오는 중 문제가 발생했습니다. 로컬 데이터를 사용합니다.",
        variant: "destructive"
      });
      
      // 로컬 스토리지에서 백업 데이터 복원 시도
      try {
        const savedData = localStorage.getItem('special-activities-data');
        const timestamp = localStorage.getItem('special-activities-timestamp');
        
        if (savedData) {
          const activities = JSON.parse(savedData);
          console.log(`로컬 스토리지에서 특별활동 데이터 복원: ${activities.length}개`);
          
          if (timestamp) {
            const saveTime = new Date(parseInt(timestamp));
            console.log(`마지막 저장 시간: ${saveTime.toLocaleString()}`);
            
            // 백업 데이터가 24시간 이상 지난 경우 경고
            const now = new Date();
            const hoursDiff = (now.getTime() - saveTime.getTime()) / (1000 * 60 * 60);
            if (hoursDiff > 24) {
              toast({
                title: "오래된 데이터",
                description: `현재 표시되는 데이터는 ${Math.floor(hoursDiff)}시간 전의 데이터입니다.`,
                variant: "default"
              });
            }
          }
          
          setSpecialActivities(activities);
          
          // 사용 가능한 기수 목록 추출
          const terms = new Set<number>();
          activities.forEach((activity: Schedule) => {
            if (activity.term) {
              terms.add(typeof activity.term === 'number' ? activity.term : Number(activity.term));
            }
          });
          
          const sortedTerms = Array.from(terms).sort((a, b) => b - a);
          setAvailableTerms(sortedTerms);
          
          // localStorage에서 마지막으로 선택한 기수 가져오기
          const lastSelectedTerm = localStorage.getItem('lastSelectedTerm');
          
          // 마지막 선택 기수가 존재하고 현재 기수 목록에 포함되어 있으면 해당 기수 선택
          if (lastSelectedTerm && sortedTerms.includes(Number(lastSelectedTerm))) {
            setSelectedTerm(Number(lastSelectedTerm));
            console.log('마지막 선택 기수 복원 (로컬스토리지):', lastSelectedTerm);
          } else if (sortedTerms.length > 0) {
            setSelectedTerm(sortedTerms[0]);
          }
        } else {
          setError('일정 데이터를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        }
      } catch (storageErr) {
        console.error('로컬 스토리지 데이터 복원 실패:', storageErr);
        setError('일정 데이터를 불러올 수 없습니다. 잠시 후 다시 시도해주세요.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // 새로고침 버튼 클릭 핸들러
  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      await fetchSchedules();
      toast({
        title: "데이터 새로고침 완료",
        description: "특별활동 데이터가 최신으로 업데이트되었습니다.",
      });
    } catch (error) {
      console.error('데이터 새로고침 실패:', error);
      toast({
        title: "새로고침 실패",
        description: "데이터를 새로고침하는 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
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
      case 'special': return '친교 활동';
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
                    onValueChange={(value) => {
                      setSelectedTerm(parseInt(value, 10));
                      localStorage.setItem('lastSelectedTerm', value);
                    }}
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
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500"></div>
                    <span>로딩 중...</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>새로고침</span>
                  </>
                )}
              </Button>
            </div>
            
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="all">전체 활동</TabsTrigger>
                <TabsTrigger value="field">현장 탐방</TabsTrigger>
                <TabsTrigger value="overseas">해외 연수</TabsTrigger>
                <TabsTrigger value="social">친교 활동</TabsTrigger>
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