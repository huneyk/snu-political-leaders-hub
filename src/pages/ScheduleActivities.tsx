import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useNavigate } from 'react-router-dom';

// 일정 인터페이스 정의
interface Schedule {
  id: string;
  term: string;
  category: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
}

// 기본 특별활동 데이터 (localStorage에 데이터가 없을 경우 사용)
const DEFAULT_SPECIAL_ACTIVITIES: Schedule[] = [
  {
    id: '1',
    term: '2025-1',
    category: 'field',
    title: '국회 방문',
    date: '2025-03-15',
    time: '14:00',
    location: '대한민국 국회',
    description: '국회 본회의장 및 상임위원회 견학'
  },
  {
    id: '2',
    term: '2025-1',
    category: 'field',
    title: '청와대 방문',
    date: '2025-04-10',
    time: '10:00',
    location: '청와대',
    description: '청와대 본관 및 영빈관 견학'
  },
  {
    id: '3',
    term: '2025-1',
    category: 'overseas',
    title: '미국 의회 방문',
    date: '2025-05-20',
    time: '09:00',
    location: '미국 워싱턴 D.C.',
    description: '미국 의회 및 정부기관 방문 연수'
  },
  {
    id: '4',
    term: '2025-2',
    category: 'overseas',
    title: '유럽 의회 방문',
    date: '2025-10-15',
    time: '10:00',
    location: '벨기에 브뤼셀',
    description: '유럽 의회 및 유럽 연합 기관 방문 연수'
  },
  {
    id: '5',
    term: '2025-2',
    category: 'social',
    title: '동문 네트워킹 행사',
    date: '2025-11-20',
    time: '18:00',
    location: '서울대학교 호암교수회관',
    description: '정치지도자과정 동문 및 재학생 네트워킹 만찬'
  }
];

const ScheduleActivities: React.FC = () => {
  const [selectedTerm, setSelectedTerm] = useState('2025-1');
  const [activeTab, setActiveTab] = useState('all');
  const [specialActivities, setSpecialActivities] = useState<Schedule[]>(DEFAULT_SPECIAL_ACTIVITIES);
  const navigate = useNavigate();
  
  // 컴포넌트 마운트 시 localStorage에서 특별활동 일정 로드
  useEffect(() => {
    loadSpecialActivities();
  }, []);
  
  // 특별활동 일정 로드 함수
  const loadSpecialActivities = () => {
    try {
      const savedActivities = localStorage.getItem('specialActivities');
      
      if (savedActivities) {
        const parsedActivities = JSON.parse(savedActivities);
        setSpecialActivities(parsedActivities);
        console.log('특별활동 일정 로드됨:', parsedActivities);
      } else {
        // 저장된 일정이 없는 경우 기본 데이터 사용
        setSpecialActivities(DEFAULT_SPECIAL_ACTIVITIES);
        console.log('저장된 특별활동 일정이 없습니다. 기본 데이터를 사용합니다.');
        
        // 기본 데이터를 localStorage에 저장
        localStorage.setItem('specialActivities', JSON.stringify(DEFAULT_SPECIAL_ACTIVITIES));
      }
    } catch (error) {
      console.error('특별활동 일정 로드 중 오류 발생:', error);
      setSpecialActivities(DEFAULT_SPECIAL_ACTIVITIES);
    }
  };
  
  // 선택된 학기에 해당하는 특별활동 필터링
  const termActivities = specialActivities.filter(
    activity => activity.term === selectedTerm
  );
  
  // 선택된 탭에 따라 활동 유형별로 필터링
  const filteredActivities = activeTab === 'all'
    ? termActivities
    : termActivities.filter(activity => activity.category === activeTab);
  
  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric', 
      weekday: 'long' 
    };
    return new Date(dateString).toLocaleDateString('ko-KR', options);
  };
  
  // 활동 유형에 따른 한글 이름 반환
  const getCategoryName = (category: string) => {
    switch (category) {
      case 'field': return '현장 탐방';
      case 'overseas': return '해외 연수';
      case 'social': return '친교 활동';
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
      
      {/* 배너(띠) 개선 - 그라데이션 효과 추가 */}
      <div className="w-full bg-gradient-to-r from-blue-700 to-blue-500 py-8 mb-6 shadow-md">
        <div className="container mx-auto px-6">
          <h1 className="text-3xl font-bold text-white">특별활동 일정</h1>
          <p className="text-blue-100 mt-2">서울대학교 정치 지도자 과정의 다양한 특별활동을 확인하세요.</p>
        </div>
      </div>
      
      <div className="container mx-auto px-6 pb-12 min-h-screen">
        <Tabs defaultValue="activities" className="mb-6" onValueChange={handleScheduleTabChange}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="calendar">학사 일정</TabsTrigger>
            <TabsTrigger value="activities">특별 활동</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div className="mb-4 md:mb-0">
            <Select value={selectedTerm} onValueChange={setSelectedTerm}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="학기 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2025-1">2025년 1학기</SelectItem>
                <SelectItem value="2025-2">2025년 2학기</SelectItem>
                <SelectItem value="2026-1">2026년 1학기</SelectItem>
                <SelectItem value="2026-2">2026년 2학기</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* 네비게이션 바 개선 */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-3">
            <nav className="flex flex-wrap gap-4">
              <a href="/intro/objectives" className="text-gray-600 hover:text-blue-600 transition-colors duration-200">과정 소개</a>
              <span className="text-gray-300">|</span>
              <a href="/admission/rules" className="text-gray-600 hover:text-blue-600 transition-colors duration-200">입학 안내</a>
              <span className="text-gray-300">|</span>
              <a href="/schedule/calendar" className="text-gray-600 hover:text-blue-600 transition-colors duration-200">학사 일정</a>
              <span className="text-gray-300">|</span>
              <a href="/schedule/activities" className="text-blue-600 font-medium">특별 활동</a>
              <span className="text-gray-300">|</span>
              <a href="/community" className="text-gray-600 hover:text-blue-600 transition-colors duration-200">커뮤니티</a>
            </nav>
          </div>
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
                filteredActivities.map(activity => (
                  <Card key={activity.id} className="h-full">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl">{activity.title}</CardTitle>
                        <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800">
                          {getCategoryName(activity.category)}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <p className="font-medium">{formatDate(activity.date)}</p>
                          <p className="text-gray-500">{activity.time}</p>
                        </div>
                        <div>
                          <p className="font-medium">장소</p>
                          <p>{activity.location}</p>
                        </div>
                        <div>
                          <p className="font-medium">설명</p>
                          <p className="text-gray-700">{activity.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500">선택한 학기에 등록된 특별활동이 없습니다.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </>
  );
};

export default ScheduleActivities; 