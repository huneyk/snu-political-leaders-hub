
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface Schedule {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
}

const ScheduleManage = () => {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    location: '',
    description: '',
  });

  // Admin 인증 체크
  useEffect(() => {
    const checkAuth = () => {
      const auth = localStorage.getItem('adminAuth');
      if (auth !== 'true') {
        navigate('/admin/login');
      }
    };
    
    checkAuth();
  }, [navigate]);

  // 일정 데이터 로드
  useEffect(() => {
    const loadSchedules = () => {
      const storedSchedules = localStorage.getItem('schedules');
      if (storedSchedules) {
        setSchedules(JSON.parse(storedSchedules));
      } else {
        // 샘플 데이터
        const sampleSchedules = [
          {
            id: '1',
            title: '개강식',
            date: '2024-03-02',
            location: '서울대학교 행정대학원 57-1동 113호',
            description: '서울대학교 정치지도자 과정 제23기 개강식',
          },
          {
            id: '2',
            title: '특별 강연',
            date: '2024-03-15',
            location: '서울대학교 행정대학원 57-1동 113호',
            description: '정치와 민주주의의 미래: 21세기 정치 리더십의 방향',
          },
          {
            id: '3',
            title: '워크숍',
            date: '2024-04-10',
            location: '제주도 연수원',
            description: '지방자치와 지역 발전 전략 워크숍',
          },
        ];
        localStorage.setItem('schedules', JSON.stringify(sampleSchedules));
        setSchedules(sampleSchedules);
      }
    };
    
    loadSchedules();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleAddSchedule = () => {
    // 필수 필드 확인
    if (!formData.title || !formData.date) {
      toast({
        title: "입력 오류",
        description: "제목과 날짜는 필수 입력 항목입니다.",
        variant: "destructive",
      });
      return;
    }

    const newSchedule = {
      id: Date.now().toString(),
      ...formData,
    };

    const updatedSchedules = [...schedules, newSchedule];
    localStorage.setItem('schedules', JSON.stringify(updatedSchedules));
    setSchedules(updatedSchedules);
    setIsAddDialogOpen(false);
    
    // 폼 데이터 초기화
    setFormData({
      title: '',
      date: '',
      location: '',
      description: '',
    });
    
    toast({
      title: "일정 추가",
      description: "새 일정이 성공적으로 추가되었습니다.",
    });
  };

  const handleEditClick = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setFormData({
      title: schedule.title,
      date: schedule.date,
      location: schedule.location,
      description: schedule.description,
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveChanges = () => {
    if (!selectedSchedule) return;
    
    const updatedSchedules = schedules.map((schedule) =>
      schedule.id === selectedSchedule.id
        ? { ...schedule, ...formData }
        : schedule
    );
    
    localStorage.setItem('schedules', JSON.stringify(updatedSchedules));
    setSchedules(updatedSchedules);
    setIsEditDialogOpen(false);
    
    toast({
      title: "일정 수정",
      description: "일정이 성공적으로 수정되었습니다.",
    });
  };

  const handleDeleteSchedule = (id: string) => {
    if (window.confirm('정말로 이 일정을 삭제하시겠습니까?')) {
      const updatedSchedules = schedules.filter(schedule => schedule.id !== id);
      localStorage.setItem('schedules', JSON.stringify(updatedSchedules));
      setSchedules(updatedSchedules);
      
      toast({
        title: "일정 삭제",
        description: "일정이 성공적으로 삭제되었습니다.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <>
      <Header />
      <div className="container mx-auto py-20 px-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-2xl font-bold text-mainBlue">일정 관리</CardTitle>
            <div className="flex space-x-2">
              <Button onClick={() => navigate('/admin')}>관리자 홈으로</Button>
              <Button onClick={() => {
                setFormData({
                  title: '',
                  date: '',
                  location: '',
                  description: '',
                });
                setIsAddDialogOpen(true);
              }}>
                일정 추가
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>제목</TableHead>
                    <TableHead>날짜</TableHead>
                    <TableHead>장소</TableHead>
                    <TableHead>관리</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedules.length > 0 ? (
                    schedules.map((schedule) => (
                      <TableRow key={schedule.id}>
                        <TableCell className="font-medium">{schedule.title}</TableCell>
                        <TableCell>{formatDate(schedule.date)}</TableCell>
                        <TableCell>{schedule.location}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditClick(schedule)}
                            >
                              수정
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteSchedule(schedule.id)}
                            >
                              삭제
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4">
                        등록된 일정이 없습니다.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* 일정 추가 다이얼로그 */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>새 일정 추가</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">제목 *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="일정 제목을 입력하세요"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">날짜 *</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">장소</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="장소를 입력하세요"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">설명</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="일정에 대한 설명을 입력하세요"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">취소</Button>
              </DialogClose>
              <Button onClick={handleAddSchedule}>추가</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 일정 수정 다이얼로그 */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>일정 수정</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">제목 *</Label>
                <Input
                  id="edit-title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-date">날짜 *</Label>
                <Input
                  id="edit-date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-location">장소</Label>
                <Input
                  id="edit-location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">설명</Label>
                <Textarea
                  id="edit-description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">취소</Button>
              </DialogClose>
              <Button onClick={handleSaveChanges}>저장</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <Footer />
    </>
  );
};

export default ScheduleManage;
