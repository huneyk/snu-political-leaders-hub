import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { format, isAfter, compareAsc } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useNavigate } from 'react-router-dom';
import ScrollReveal from '@/components/ScrollReveal';
import { apiService } from '@/lib/apiService';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Download, Calendar as CalendarIcon, Clock, MapPin, FileText, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';

// 일정 인터페이스 정의
interface Schedule {
  _id: string;
  term: string; // MongoDB에서는 문자열로 반환됨
  year: string;
  category: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  isActive: boolean;
}

const ScheduleCalendar: React.FC = () => {
  const [selectedTerm, setSelectedTerm] = useState<string>("1");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [activeTab, setActiveTab] = useState('calendar');
  const [availableTerms, setAvailableTerms] = useState<string[]>(["1"]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [downloadedSchedules, setDownloadedSchedules] = useState<Schedule[]>([]);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const navigate = useNavigate();
  
  // MongoDB에서 일정 데이터 로드
  useEffect(() => {
    fetchSchedules();
  }, []);
  
  // MongoDB API를 통해 일정 데이터 가져오기
  const fetchSchedules = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('일정 데이터 가져오기 시작...');
      
      // MongoDB에서 데이터 가져오기 시도
      console.log('MongoDB에서 데이터 가져오기 시도...');
      const data = await apiService.getSchedulesAll();
      
      if (data && Array.isArray(data) && data.length > 0) {
        console.log(`일정 데이터 로드 완료: ${data.length}개 일정`);
        
        // 유효한 데이터인지 확인
        const isValidData = data.every(item => 
          item && typeof item === 'object' && 
          item._id && item.title && item.date && item.category
        );
        
        if (isValidData) {
          console.log('데이터 유효성 검사 통과');
          setSchedules(data);
          
          // 데이터 캐싱 (로컬 스토리지 저장)
          try {
            localStorage.setItem('schedules-data', JSON.stringify(data));
            localStorage.setItem('schedules-data-saveTime', Date.now().toString());
            console.log('일정 데이터 로컬스토리지에 백업 완료');
          } catch (storageError) {
            console.warn('로컬스토리지 백업 실패:', storageError);
          }
          
          // 사용 가능한 학기 목록 추출
          loadAvailableTerms(data);
          setError(null);
          
          // 백업 데이터가 24시간 이상 지난 경우 경고
          const now = new Date();
          const saveTime = new Date(parseInt(localStorage.getItem('schedules-data-saveTime') || '0'));
          const hoursDiff = (now.getTime() - saveTime.getTime()) / (1000 * 60 * 60);
          if (hoursDiff > 24) {
            toast({
              title: "오래된 데이터",
              description: `현재 표시되는 데이터는 ${Math.floor(hoursDiff)}시간 전의 데이터입니다.`,
              variant: "default"
            });
          }
          
          return;
        } else {
          console.error('API에서 유효하지 않은 데이터 형식 반환:', data);
          throw new Error('Invalid data format from API');
        }
      } else {
        console.error('API 응답이 비어있거나 배열이 아닙니다');
        throw new Error('Empty or invalid response from API');
      }
    } catch (err) {
      console.error('일정 데이터 로드 중 오류 발생:', err);
      
      // 에러 메시지 표시
      toast({
        title: "데이터 로드 오류",
        description: "서버에서 일정 데이터를 가져오는 중 문제가 발생했습니다. 로컬 데이터를 사용합니다.",
        variant: "destructive"
      });
      
      // 로컬 스토리지에서 백업 데이터 복원 시도
      try {
        const savedData = localStorage.getItem('schedules-data');
        const timestamp = localStorage.getItem('schedules-data-saveTime');
        
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          console.log(`로컬 스토리지에서 일정 데이터 복원: ${parsedData.length}개`);
          
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
          
          setSchedules(parsedData);
          loadAvailableTerms(parsedData);
          setError(null);
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
  
  // 로컬 스토리지에서 데이터 로드
  const loadFromLocalStorage = () => {
    try {
      const savedData = localStorage.getItem('schedules-data');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        console.log("로컬 스토리지에서 가져온 일정 데이터:", parsedData);
        setSchedules(parsedData);
        // 사용 가능한 학기 목록 추출
        loadAvailableTerms(parsedData);
        setError(null);
      } else {
        setError('일정 데이터를 찾을 수 없습니다.');
      }
    } catch (err) {
      console.error('로컬 스토리지에서 일정 데이터를 불러오는 중 오류가 발생했습니다:', err);
      setError('일정 데이터를 불러올 수 없습니다. 잠시 후 다시 시도해주세요.');
    }
  };
  
  // 사용 가능한 학기 목록 로드
  const loadAvailableTerms = (scheduleData: Schedule[]) => {
    try {
      // 중복 없는 학기 집합 생성
      const termsSet = new Set<string>();
      
      // 모든 일정에서 학기 정보 추출
      scheduleData.forEach((schedule) => {
        if (schedule.term) {
          termsSet.add(schedule.term);
        }
      });
      
      // 학기가 없으면 기본값 사용
      if (termsSet.size === 0) {
        setAvailableTerms(["1"]);
        setSelectedTerm("1");
        return;
      }
      
      // 학기를 내림차순으로 정렬 (최신 학기가 먼저 오도록)
      // 숫자 값으로 변환해서 정렬한 후, 다시 문자열로 반환
      const sortedTerms = Array.from(termsSet)
        .sort((a, b) => Number(b) - Number(a));
        
      setAvailableTerms(sortedTerms);
      
      // 가장 최근 학기를 기본값으로 설정
      setSelectedTerm(sortedTerms[0]);
      
      console.log('사용 가능한 학기:', sortedTerms);
    } catch (error) {
      console.error('학기 목록 로드 중 오류 발생:', error);
      setAvailableTerms(["1"]);
      setSelectedTerm("1");
    }
  };
  
  // 선택된 학기에 해당하는 일정 필터링
  const termSchedules = schedules.filter(
    schedule => Number(schedule.term) === Number(selectedTerm)
  );
  
  // 선택된 날짜에 해당하는 일정 필터링
  const selectedDateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
  const daySchedules = termSchedules.filter(schedule => {
    try {
      const scheduleDate = new Date(schedule.date);
      return format(scheduleDate, 'yyyy-MM-dd') === selectedDateStr;
    } catch (error) {
      return false;
    }
  });
  
  // 일정이 있는 날짜 목록 (캘린더 표시용)
  const scheduleDates = termSchedules.map(schedule => {
    try {
      return new Date(schedule.date);
    } catch (error) {
      return new Date(); // 기본값으로 오늘 날짜 반환
    }
  });
  
  // 오늘 날짜 이후의 일정만 필터링하고 날짜순으로 정렬
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const upcomingSchedules = termSchedules
    .filter(schedule => {
      try {
        const scheduleDate = new Date(schedule.date);
        return isAfter(scheduleDate, today) || format(scheduleDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
      } catch (error) {
        return false;
      }
    })
    .sort((a, b) => {
      try {
        return compareAsc(new Date(a.date), new Date(b.date));
      } catch (error) {
        return 0;
      }
    });
  
  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    try {
      const options: Intl.DateTimeFormatOptions = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        weekday: 'long' 
      };
      return new Date(dateString).toLocaleDateString('ko-KR', options);
    } catch (error) {
      return dateString;
    }
  };
  
  // 카테고리 이름 번역 함수
  const getCategoryName = (category: string) => {
    switch (category) {
      case 'academic': return '학사 일정';
      case 'special': return '특별 활동';
      case 'overseas': return '해외 연수';
      case 'social': return '친교 활동';
      default: return '기타 활동';
    }
  };
  
  // 탭 변경 처리
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    if (value === 'activities') {
      navigate('/schedule/activities');
    }
  };
  
  // 전체 일정 다운로드 함수
  const downloadAllSchedules = async () => {
    if (!selectedTerm) {
      toast({
        title: "오류",
        description: "기수를 먼저 선택해주세요.",
        variant: "destructive"
      });
      return;
    }

    setIsDownloading(true);
    try {
      console.log(`${selectedTerm}기 전체 일정 다운로드 시작`);
      
      // 현재 페이지에 로드된 모든 일정에서 선택된 기수 필터링
      const termSchedules = schedules.filter(schedule => {
        // term 필드가 문자열이거나 숫자일 수 있으므로 여러 방식으로 비교
        const scheduleTermStr = schedule.term?.toString();
        const selectedTermStr = selectedTerm.toString();
        const scheduleTermNum = parseInt(schedule.term?.toString() || '0');
        const selectedTermNum = parseInt(selectedTerm);
        
        return scheduleTermStr === selectedTermStr || 
               scheduleTermNum === selectedTermNum ||
               String(schedule.term) === selectedTerm ||
               Number(schedule.term) === selectedTermNum;
      });
      
      console.log(`페이지에 로드된 전체 일정: ${schedules.length}개`);
      console.log(`${selectedTerm}기로 필터링된 일정: ${termSchedules.length}개`);
      
      // 데이터 유효성 검사 및 배열 변환
      let validSchedules: Schedule[] = [];
      
      if (termSchedules && Array.isArray(termSchedules)) {
        validSchedules = termSchedules;
      }
      
      console.log('변환된 유효한 일정 데이터:', validSchedules);
      console.log('유효한 일정 개수:', validSchedules.length);
      
      if (validSchedules && validSchedules.length > 0) {
        setDownloadedSchedules(validSchedules);
        setIsDialogOpen(true);
        
        toast({
          title: "다운로드 완료",
          description: `${selectedTerm}기 일정 ${validSchedules.length}개를 불러왔습니다.`,
          variant: "default"
        });
      } else {
        toast({
          title: "일정 없음",
          description: `${selectedTerm}기에 등록된 일정이 없습니다. 페이지에 로드된 모든 일정: ${schedules.length}개`,
          variant: "default"
        });
      }
    } catch (error) {
      console.error('전체 일정 다운로드 실패:', error);
      toast({
        title: "다운로드 실패",
        description: "일정을 불러오는 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsDownloading(false);
    }
  };
  
  // Excel 파일 다운로드 함수
  const downloadExcel = () => {
    if (!Array.isArray(downloadedSchedules) || downloadedSchedules.length === 0) {
      toast({
        title: "데이터 없음",
        description: "다운로드할 일정이 없습니다.",
        variant: "destructive"
      });
      return;
    }

    try {
      // 데이터를 날짜와 시간 순으로 정렬
      const sortedSchedules = [...downloadedSchedules].sort((a, b) => {
        // 먼저 날짜로 정렬
        const dateCompare = compareAsc(new Date(a.date), new Date(b.date));
        if (dateCompare !== 0) {
          return dateCompare;
        }
        
        // 날짜가 같으면 시간으로 정렬
        const timeA = a.time || '00:00';
        const timeB = b.time || '00:00';
        
        // 시간 문자열을 24시간 형식으로 변환하여 비교
        const parseTime = (timeStr: string) => {
          // "오후 2:00", "14:00", "2:00 PM" 등 다양한 형식 처리
          const cleanTime = timeStr.trim();
          
          if (cleanTime.includes('오후') || cleanTime.includes('PM')) {
            const time = cleanTime.replace(/오후|PM/g, '').trim();
            const [hour, minute] = time.split(':').map(Number);
            return (hour === 12 ? 12 : hour + 12) * 60 + (minute || 0);
          } else if (cleanTime.includes('오전') || cleanTime.includes('AM')) {
            const time = cleanTime.replace(/오전|AM/g, '').trim();
            const [hour, minute] = time.split(':').map(Number);
            return (hour === 12 ? 0 : hour) * 60 + (minute || 0);
          } else {
            // 24시간 형식 또는 기본 형식
            const [hour, minute] = cleanTime.split(':').map(Number);
            return (hour || 0) * 60 + (minute || 0);
          }
        };
        
        return parseTime(timeA) - parseTime(timeB);
      });

      // Excel 데이터 형식으로 변환
      const excelData = sortedSchedules.map((schedule, index) => ({
        '순번': index + 1,
        '날짜': formatDate(schedule.date),
        '시간': schedule.time || '-',
        '제목': schedule.title,
        '카테고리': getCategoryName(schedule.category),
        '장소': schedule.location || '-',
        '내용': schedule.description || '-'
      }));

      // 워크북 생성
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(excelData);

      // 컬럼 너비 설정
      const columnWidths = [
        { wch: 8 },   // 순번
        { wch: 15 },  // 날짜
        { wch: 12 },  // 시간
        { wch: 30 },  // 제목
        { wch: 12 },  // 카테고리
        { wch: 20 },  // 장소
        { wch: 40 }   // 내용
      ];
      worksheet['!cols'] = columnWidths;

      // 워크시트를 워크북에 추가
      XLSX.utils.book_append_sheet(workbook, worksheet, `제${selectedTerm}기 일정`);

      // 파일명 생성
      const fileName = `서울대PLP_제${selectedTerm}기_전체일정_${new Date().toISOString().split('T')[0]}.xlsx`;

      // 파일 다운로드
      XLSX.writeFile(workbook, fileName);

      toast({
        title: "Excel 다운로드 완료",
        description: `${fileName} 파일이 다운로드되었습니다.`,
        variant: "default"
      });
    } catch (error) {
      console.error('Excel 다운로드 실패:', error);
      toast({
        title: "Excel 다운로드 실패",
        description: "파일 생성 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <>
      <Header />
      <main className="pt-24 pb-16">
        <ScrollReveal>
          <section className="py-16 bg-mainBlue text-white">
            <div className="main-container">
              <h1 className="text-3xl md:text-4xl font-bold mb-4 reveal">전체 일정</h1>

            </div>
          </section>
        </ScrollReveal>

        <div className="main-container py-12">
          <Tabs defaultValue="calendar" className="mb-6" onValueChange={handleTabChange}>
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="calendar">전체 일정</TabsTrigger>
              <TabsTrigger value="activities">특별 활동</TabsTrigger>
            </TabsList>
          </Tabs>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-24">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">
              <p>{error}</p>
            </div>
          ) : (
            <>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <div className="mb-4 md:mb-0">
                  <Select value={selectedTerm} onValueChange={(value) => setSelectedTerm(value)}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="기수 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTerms.map((term) => (
                        <SelectItem key={term} value={term}>
                          제 {term} 기
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                  <Card>
                    <CardHeader>
                      <CardTitle>일정 달력</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        locale={ko}
                        className="rounded-md border"
                        modifiers={{
                          hasSchedule: scheduleDates
                        }}
                        modifiersStyles={{
                          hasSchedule: {
                            fontWeight: 'bold',
                            backgroundColor: '#e6f7ff',
                            color: '#0066cc',
                            borderRadius: '50%'
                          }
                        }}
                      />
                    </CardContent>
                  </Card>
                </div>
                
                <div className="md:col-span-2">
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle>
                        {selectedDate ? format(selectedDate, 'yyyy년 MM월 dd일 (EEEE)', { locale: ko }) : '날짜를 선택하세요'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {daySchedules.length > 0 ? (
                        <div className="space-y-4">
                          {daySchedules.map(schedule => (
                            <div key={schedule._id} className="p-4 border rounded-lg hover:shadow-md transition-shadow bg-white">
                              <div className="flex items-center justify-between mb-3">
                                <h3 className="text-lg font-semibold text-blue-800">{schedule.title}</h3>
                                <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800">
                                  {getCategoryName(schedule.category)}
                                </span>
                              </div>
                              <div className="grid grid-cols-1 gap-3">
                                <div className="flex flex-col space-y-2">
                                  {schedule.time && (
                                    <div className="flex items-center text-gray-700">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                      <p className="text-sm md:text-base"><span className="font-medium">시간:</span> {schedule.time}</p>
                                    </div>
                                  )}
                                  {schedule.location && (
                                    <div className="flex items-center text-gray-700">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                      </svg>
                                      <p className="text-sm md:text-base"><span className="font-medium">장소:</span> {schedule.location}</p>
                                    </div>
                                  )}
                                </div>
                                {schedule.description && (
                                  <div className="mt-2 border-t pt-3">
                                    <div className="flex items-start">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                      </svg>
                                      <div>
                                        <p className="font-medium text-sm md:text-base mb-1 text-gray-700">내용:</p>
                                        <p className="whitespace-pre-line text-gray-700 text-sm md:text-base bg-gray-50 p-2 rounded">{schedule.description}</p>
                                      </div>
                                    </div>
                                  </div>
                                )}
                                {!schedule.time && !schedule.location && !schedule.description && (
                                  <div className="mt-2 py-2"></div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center py-8 text-gray-500">선택한 날짜에 일정이 없습니다.</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
              
              <div className="mt-8">
                <Card>
                  <CardHeader>
                    <CardTitle>다가오는 일정</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {upcomingSchedules.length > 0 ? (
                      <div className="space-y-4">
                        {upcomingSchedules.map(schedule => (
                          <div key={schedule._id} className="p-4 border rounded-lg hover:shadow-md transition-shadow bg-white">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3">
                              <div className="flex items-center space-x-2">
                                <h3 className="text-lg font-semibold text-blue-800">{schedule.title}</h3>
                                <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800">
                                  {getCategoryName(schedule.category)}
                                </span>
                              </div>
                              <p className="font-medium text-gray-600 mt-1 md:mt-0">{formatDate(schedule.date)}</p>
                            </div>
                            <div className="grid grid-cols-1 gap-3">
                              <div className="flex flex-col space-y-2">
                                {schedule.time && (
                                  <div className="flex items-center text-gray-700">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-sm md:text-base"><span className="font-medium">시간:</span> {schedule.time}</p>
                                  </div>
                                )}
                                {schedule.location && (
                                  <div className="flex items-center text-gray-700">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <p className="text-sm md:text-base"><span className="font-medium">장소:</span> {schedule.location}</p>
                                  </div>
                                )}
                              </div>
                              {schedule.description && (
                                <div className="mt-2 border-t pt-3">
                                  <div className="flex items-start">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <div>
                                      <p className="font-medium text-sm md:text-base mb-1 text-gray-700">내용:</p>
                                      <p className="whitespace-pre-line text-gray-700 text-sm md:text-base bg-gray-50 p-2 rounded">{schedule.description}</p>
                                    </div>
                                  </div>
                                </div>
                              )}
                              {!schedule.time && !schedule.location && !schedule.description && (
                                <div className="mt-2 py-2"></div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center py-8 text-gray-500">다가오는 일정이 없습니다.</p>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              {/* 전체 일정 다운로드 버튼 */}
              <div className="mt-8 text-center">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      onClick={downloadAllSchedules}
                      disabled={isDownloading || !selectedTerm}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 text-lg font-medium"
                    >
                      {isDownloading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                          다운로드 중...
                        </>
                      ) : (
                        <>
                          <Download className="mr-2 h-5 w-5" />
                          제 {selectedTerm}기 전체 일정 보기
                        </>
                      )}
                    </Button>
                  </DialogTrigger>
                  
                  <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-bold text-blue-800">
                        제 {selectedTerm}기 전체 일정 ({downloadedSchedules.length}개)
                      </DialogTitle>
                      <DialogDescription>
                        선택한 기수의 모든 일정을 표로 정리한 내용입니다.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="mt-4">
                      {downloadedSchedules.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse border border-gray-300">
                            <thead>
                              <tr className="bg-blue-50">
                                <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-blue-800">날짜</th>
                                <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-blue-800">시간</th>
                                <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-blue-800">제목</th>
                                <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-blue-800">카테고리</th>
                                <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-blue-800">장소</th>
                                <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-blue-800">내용</th>
                              </tr>
                            </thead>
                            <tbody>
                              {Array.isArray(downloadedSchedules) ? downloadedSchedules
                                .sort((a, b) => {
                                  // 먼저 날짜로 정렬
                                  const dateCompare = compareAsc(new Date(a.date), new Date(b.date));
                                  if (dateCompare !== 0) {
                                    return dateCompare;
                                  }
                                  
                                  // 날짜가 같으면 시간으로 정렬
                                  const timeA = a.time || '00:00';
                                  const timeB = b.time || '00:00';
                                  
                                  // 시간 문자열을 24시간 형식으로 변환하여 비교
                                  const parseTime = (timeStr: string) => {
                                    // "오후 2:00", "14:00", "2:00 PM" 등 다양한 형식 처리
                                    const cleanTime = timeStr.trim();
                                    
                                    if (cleanTime.includes('오후') || cleanTime.includes('PM')) {
                                      const time = cleanTime.replace(/오후|PM/g, '').trim();
                                      const [hour, minute] = time.split(':').map(Number);
                                      return (hour === 12 ? 12 : hour + 12) * 60 + (minute || 0);
                                    } else if (cleanTime.includes('오전') || cleanTime.includes('AM')) {
                                      const time = cleanTime.replace(/오전|AM/g, '').trim();
                                      const [hour, minute] = time.split(':').map(Number);
                                      return (hour === 12 ? 0 : hour) * 60 + (minute || 0);
                                    } else {
                                      // 24시간 형식 또는 기본 형식
                                      const [hour, minute] = cleanTime.split(':').map(Number);
                                      return (hour || 0) * 60 + (minute || 0);
                                    }
                                  };
                                  
                                  return parseTime(timeA) - parseTime(timeB);
                                })
                                .map((schedule, index) => (
                                <tr key={schedule._id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                  <td className="border border-gray-300 px-4 py-3 whitespace-nowrap">
                                    <div className="flex items-center">
                                      <CalendarIcon className="h-4 w-4 mr-2 text-blue-500" />
                                      {formatDate(schedule.date)}
                                    </div>
                                  </td>
                                  <td className="border border-gray-300 px-4 py-3 whitespace-nowrap">
                                    {schedule.time ? (
                                      <div className="flex items-center">
                                        <Clock className="h-4 w-4 mr-2 text-blue-500" />
                                        {schedule.time}
                                      </div>
                                    ) : (
                                      <span className="text-gray-400">-</span>
                                    )}
                                  </td>
                                  <td className="border border-gray-300 px-4 py-3 font-medium">
                                    {schedule.title}
                                  </td>
                                  <td className="border border-gray-300 px-4 py-3">
                                    <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                      {getCategoryName(schedule.category)}
                                    </span>
                                  </td>
                                  <td className="border border-gray-300 px-4 py-3">
                                    {schedule.location ? (
                                      <div className="flex items-center">
                                        <MapPin className="h-4 w-4 mr-2 text-blue-500" />
                                        {schedule.location}
                                      </div>
                                    ) : (
                                      <span className="text-gray-400">-</span>
                                    )}
                                  </td>
                                  <td className="border border-gray-300 px-4 py-3 max-w-xs">
                                    {schedule.description ? (
                                      <div className="flex items-start">
                                        <FileText className="h-4 w-4 mr-2 text-blue-500 mt-0.5 flex-shrink-0" />
                                        <div className="whitespace-pre-line text-sm break-words">
                                          {schedule.description.length > 100 
                                            ? `${schedule.description.substring(0, 100)}...` 
                                            : schedule.description
                                          }
                                        </div>
                                      </div>
                                    ) : (
                                      <span className="text-gray-400">-</span>
                                    )}
                                  </td>
                                </tr>
                              )) : []}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-center py-8 text-gray-500">다운로드된 일정이 없습니다.</p>
                      )}
                    </div>
                    
                    {/* Excel 다운로드 버튼 */}
                    {downloadedSchedules.length > 0 && (
                      <div className="mt-6 pt-4 border-t border-gray-200 text-center">
                        <Button 
                          onClick={downloadExcel}
                          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 text-base font-medium"
                        >
                          <FileSpreadsheet className="mr-2 h-5 w-5" />
                          Excel로 다운로드 하기
                        </Button>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default ScheduleCalendar; 