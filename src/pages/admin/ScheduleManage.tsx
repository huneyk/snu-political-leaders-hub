
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// 간단한 관리자 인증 확인 훅
const useAdminAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const auth = localStorage.getItem('adminAuth');
      if (auth !== 'true') {
        navigate('/admin/login');
        return;
      }
      setIsAuthenticated(true);
      setIsLoading(false);
    };
    
    checkAuth();
  }, [navigate]);

  return { isAuthenticated, isLoading };
};

// 일정 데이터 타입 정의
interface Schedule {
  id: number;
  title: string;
  dateStart: Date;
  dateEnd?: Date;
  time: string;
  location: string;
  description: string;
  type: 'lecture' | 'event' | 'meeting';
}

// 가상의 일정 데이터
const initialSchedules: Schedule[] = [
  {
    id: 1,
    title: '프로그래밍 기초 강의',
    dateStart: new Date(2023, 9, 15),
    time: '14:00 - 16:00',
    location: '메인 캠퍼스 301호',
    description: '프로그래밍 기초 개념 강의',
    type: 'lecture'
  },
  {
    id: 2,
    title: '데이터 분석 워크샵',
    dateStart: new Date(2023, 9, 20),
    dateEnd: new Date(2023, 9, 21),
    time: '10:00 - 17:00',
    location: '메인 캠퍼스 대강당',
    description: '데이터 분석 기법 워크샵',
    type: 'event'
  },
  {
    id: 3,
    title: '교수회의',
    dateStart: new Date(2023, 9, 25),
    time: '13:30 - 15:00',
    location: '회의실 A',
    description: '학기 계획 논의',
    type: 'meeting'
  }
];

// 일정 유형에 따른 배지 색상
const typeColors = {
  lecture: 'bg-blue-100 text-blue-800',
  event: 'bg-green-100 text-green-800',
  meeting: 'bg-purple-100 text-purple-800'
};

// 한글 일정 유형
const typeLabels = {
  lecture: '강의',
  event: '행사',
  meeting: '회의'
};

const ScheduleManage = () => {
  const { isAuthenticated, isLoading } = useAdminAuth();
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  
  // 새 일정 상태
  const [newSchedule, setNewSchedule] = useState<Partial<Schedule>>({
    title: '',
    dateStart: new Date(),
    time: '',
    location: '',
    description: '',
    type: 'lecture'
  });
  
  // 검색 필터
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'lecture' | 'event' | 'meeting'>('all');
  
  useEffect(() => {
    // 실제 구현에서는 API 호출을 통해 일정 데이터를 가져옵니다.
    // 현재는 로컬 스토리지에서 가져옵니다.
    const savedSchedules = localStorage.getItem('admin-schedules');
    if (savedSchedules) {
      try {
        // 날짜를 Date 객체로 변환
        const parsedSchedules = JSON.parse(savedSchedules, (key, value) => {
          if (key === 'dateStart' || key === 'dateEnd') {
            return value ? new Date(value) : null;
          }
          return value;
        });
        setSchedules(parsedSchedules);
      } catch (error) {
        console.error('Failed to parse schedules:', error);
        setSchedules(initialSchedules);
      }
    } else {
      setSchedules(initialSchedules);
    }
  }, []);
  
  // 일정 저장
  const saveSchedules = (updatedSchedules: Schedule[]) => {
    localStorage.setItem('admin-schedules', JSON.stringify(updatedSchedules));
    setSchedules(updatedSchedules);
  };
  
  // 새 일정 추가
  const handleAddSchedule = () => {
    if (!newSchedule.title || !newSchedule.dateStart || !newSchedule.time || !newSchedule.location) {
      toast({
        title: "입력 오류",
        description: "제목, 날짜, 시간, 장소는 필수 입력 항목입니다.",
        variant: "destructive"
      });
      return;
    }

    const highestId = schedules.length > 0 ? Math.max(...schedules.map(s => s.id)) : 0;
    const scheduleToAdd = {
      ...newSchedule,
      id: highestId + 1
    } as Schedule;
    
    const updatedSchedules = [...schedules, scheduleToAdd];
    saveSchedules(updatedSchedules);
    
    setNewSchedule({
      title: '',
      dateStart: new Date(),
      time: '',
      location: '',
      description: '',
      type: 'lecture'
    });
    
    setIsDialogOpen(false);
    
    toast({
      title: "일정 추가",
      description: "새 일정이 성공적으로 추가되었습니다.",
    });
  };
  
  // 일정 삭제
  const handleDeleteSchedule = () => {
    if (!selectedSchedule) return;
    
    const updatedSchedules = schedules.filter(s => s.id !== selectedSchedule.id);
    saveSchedules(updatedSchedules);
    
    setIsDeleteDialogOpen(false);
    setSelectedSchedule(null);
    
    toast({
      title: "일정 삭제",
      description: "일정이 성공적으로 삭제되었습니다.",
    });
  };
  
  // 필터링된 일정
  const filteredSchedules = schedules.filter(schedule => {
    const matchesSearch = 
      schedule.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      schedule.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || schedule.type === filterType;
    
    return matchesSearch && matchesType;
  });
  
  // 날짜 형식 포맷
  const formatScheduleDate = (schedule: Schedule) => {
    const startDate = format(schedule.dateStart, 'yyyy-MM-dd');
    if (schedule.dateEnd) {
      const endDate = format(schedule.dateEnd, 'yyyy-MM-dd');
      return `${startDate} ~ ${endDate}`;
    }
    return startDate;
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>로딩 중...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <Header />
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-mainBlue">일정 관리</h1>
          <Button onClick={() => {
            navigate('/admin');
          }}>관리자 대시보드로 돌아가기</Button>
        </div>
        
        <Card className="mb-8">
          <CardHeader className="pb-3">
            <CardTitle>일정 검색 및 필터</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <Input 
                placeholder="제목, 장소, 설명으로 검색" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="md:max-w-sm"
              />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="p-2 border rounded"
              >
                <option value="all">모든 유형</option>
                <option value="lecture">강의</option>
                <option value="event">행사</option>
                <option value="meeting">회의</option>
              </select>
              <Button variant="outline" onClick={() => {
                setSearchTerm('');
                setFilterType('all');
              }}>초기화</Button>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-end mb-6">
          <Button onClick={() => setIsDialogOpen(true)}>새 일정 추가</Button>
        </div>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>일정 목록</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>제목</TableHead>
                    <TableHead>날짜</TableHead>
                    <TableHead>시간</TableHead>
                    <TableHead>장소</TableHead>
                    <TableHead>유형</TableHead>
                    <TableHead>관리</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSchedules.length > 0 ? (
                    filteredSchedules.map((schedule) => (
                      <TableRow key={schedule.id}>
                        <TableCell className="font-medium">{schedule.title}</TableCell>
                        <TableCell>{formatScheduleDate(schedule)}</TableCell>
                        <TableCell>{schedule.time}</TableCell>
                        <TableCell>{schedule.location}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${typeColors[schedule.type]}`}>
                            {typeLabels[schedule.type]}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setSelectedSchedule(schedule);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            삭제
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        일정이 없거나 검색 결과가 없습니다.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
        
        {/* 새 일정 추가 다이얼로그 */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>새 일정 추가</DialogTitle>
              <DialogDescription>
                새로운 일정의 상세 정보를 입력하세요.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="title" className="text-right text-sm font-medium">
                  제목
                </label>
                <Input
                  id="title"
                  value={newSchedule.title}
                  onChange={(e) => setNewSchedule({...newSchedule, title: e.target.value})}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm font-medium">
                  시작 날짜
                </label>
                <div className="col-span-3">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newSchedule.dateStart ? (
                          format(newSchedule.dateStart, 'yyyy-MM-dd')
                        ) : (
                          <span>날짜 선택</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={newSchedule.dateStart}
                        onSelect={(date) => date && setNewSchedule({...newSchedule, dateStart: date})}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="time" className="text-right text-sm font-medium">
                  시간
                </label>
                <Input
                  id="time"
                  placeholder="예: 14:00 - 16:00"
                  value={newSchedule.time}
                  onChange={(e) => setNewSchedule({...newSchedule, time: e.target.value})}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="location" className="text-right text-sm font-medium">
                  장소
                </label>
                <Input
                  id="location"
                  value={newSchedule.location}
                  onChange={(e) => setNewSchedule({...newSchedule, location: e.target.value})}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="type" className="text-right text-sm font-medium">
                  유형
                </label>
                <select
                  id="type"
                  value={newSchedule.type}
                  onChange={(e) => setNewSchedule({...newSchedule, type: e.target.value as any})}
                  className="col-span-3 p-2 border rounded"
                >
                  <option value="lecture">강의</option>
                  <option value="event">행사</option>
                  <option value="meeting">회의</option>
                </select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="description" className="text-right text-sm font-medium">
                  설명
                </label>
                <textarea
                  id="description"
                  value={newSchedule.description}
                  onChange={(e) => setNewSchedule({...newSchedule, description: e.target.value})}
                  className="col-span-3 p-2 border rounded min-h-[100px]"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                취소
              </Button>
              <Button onClick={handleAddSchedule}>
                추가
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* 일정 삭제 확인 다이얼로그 */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>일정 삭제 확인</DialogTitle>
              <DialogDescription>
                {selectedSchedule && `"${selectedSchedule.title}" 일정을 정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                취소
              </Button>
              <Button variant="destructive" onClick={handleDeleteSchedule}>
                삭제
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <Footer />
    </>
  );
};

export default ScheduleManage;
