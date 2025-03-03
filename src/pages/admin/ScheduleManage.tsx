import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Schedule {
  id: string;
  term: string; // 기수 (예: "제1기", "제2기")
  category: string; // 구분 (학사 일정, 특별 활동)
  subcategory: string; // 하위 구분 (해외 연수, 현장 탐방, 친교 활동)
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
}

const ScheduleManage = () => {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [formData, setFormData] = useState({
    term: '제1기',
    category: '학사 일정',
    subcategory: '',
    title: '',
    date: '',
    time: '',
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
      console.log('ScheduleManage - localStorage data:', storedSchedules);
      
      if (storedSchedules) {
        try {
          const parsedSchedules = JSON.parse(storedSchedules);
          console.log('ScheduleManage - Parsed schedules:', parsedSchedules);
          setSchedules(parsedSchedules);
        } catch (error) {
          console.error('Error parsing schedules from localStorage:', error);
          setSchedules([]);
        }
      } else {
        // 샘플 데이터
        const sampleSchedules = [
          {
            id: '1',
            term: '제1기',
            category: '학사 일정',
            subcategory: '',
            title: '오리엔테이션',
            date: '2023-03-15',
            time: '10:00',
            location: '서울대학교 국제회의실',
            description: '과정 소개 및 오리엔테이션',
          },
          {
            id: '2',
            term: '제1기',
            category: '학사 일정',
            subcategory: '',
            title: '특강: 정치 리더십',
            date: '2023-03-22',
            time: '14:00',
            location: '서울대학교 법학관 대강당',
            description: '정치 리더십의 현대적 의미와 실천 방안',
          },
          {
            id: '3',
            term: '제1기',
            category: '특별 활동',
            subcategory: '현장 탐방',
            title: '국회 방문',
            date: '2023-04-05',
            time: '09:00',
            location: '국회의사당',
            description: '국회 견학 및 의원 간담회',
          },
          {
            id: '4',
            term: '제2기',
            category: '학사 일정',
            subcategory: '',
            title: '개강식',
            date: '2023-09-01',
            time: '10:00',
            location: '서울대학교 행정대학원',
            description: '제2기 개강식 및 환영회',
          },
          {
            id: '5',
            term: '제2기',
            category: '특별 활동',
            subcategory: '해외 연수',
            title: '미국 워싱턴 방문',
            date: '2023-10-15',
            time: '08:00',
            location: '워싱턴 D.C.',
            description: '미국 정치 시스템 연구 및 기관 방문',
          },
        ];
        localStorage.setItem('schedules', JSON.stringify(sampleSchedules));
        console.log('ScheduleManage - Setting sample data to localStorage');
        setSchedules(sampleSchedules);
      }
    };
    
    loadSchedules();
  }, []);

  // 기수 목록 가져오기
  const terms = Array.from(new Set(schedules.map(schedule => schedule.term)));
  
  // 현재 선택된 기수의 일정만 필터링
  const filteredByTerm = activeTab === 'all' 
    ? schedules 
    : schedules.filter(schedule => schedule.term === activeTab);

  // 검색어로 필터링
  const filteredSchedules = filteredByTerm.filter(
    (schedule) =>
      schedule.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.subcategory.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddClick = () => {
    setFormData({
      term: '제1기',
      category: '학사 일정',
      subcategory: '',
      title: '',
      date: '',
      time: '',
      location: '',
      description: '',
    });
    setIsAddDialogOpen(true);
  };

  const handleEditClick = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setFormData({
      term: schedule.term,
      category: schedule.category,
      subcategory: schedule.subcategory,
      title: schedule.title,
      date: schedule.date,
      time: schedule.time,
      location: schedule.location,
      description: schedule.description,
    });
    setIsEditDialogOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
      // 학사 일정을 선택하면 하위 구분 초기화
      ...(name === 'category' && value === '학사 일정' ? { subcategory: '' } : {}),
    });
  };

  const handleAddSchedule = () => {
    const newSchedule = {
      id: Date.now().toString(),
      ...formData,
    };
    
    const updatedSchedules = [...schedules, newSchedule];
    localStorage.setItem('schedules', JSON.stringify(updatedSchedules));
    console.log('ScheduleManage - Added new schedule, updated localStorage:', updatedSchedules);
    setSchedules(updatedSchedules);
    setIsAddDialogOpen(false);
    
    toast({
      title: "일정 추가",
      description: "새로운 일정이 성공적으로 추가되었습니다.",
    });
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

  const handleSaveAllSchedules = () => {
    localStorage.setItem('schedules', JSON.stringify(schedules));
    console.log('ScheduleManage - Saved all schedules to localStorage:', schedules);
    
    toast({
      title: "일정 저장",
      description: "모든 일정이 성공적으로 저장되었습니다.",
    });
  };

  const formatDate = (dateString: string) => {
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
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl font-bold text-mainBlue">일정 관리</CardTitle>
              <div className="flex gap-4">
                <Button onClick={handleAddClick}>새 일정 추가</Button>
                <Button onClick={handleSaveAllSchedules} variant="outline">모든 일정 저장</Button>
                <Button onClick={() => navigate('/admin')}>관리자 홈으로</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-6 flex flex-col md:flex-row gap-4 justify-between">
              <Input
                type="text"
                placeholder="제목, 장소, 설명으로 검색"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
              
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
                <TabsList>
                  <TabsTrigger value="all">전체</TabsTrigger>
                  {terms.map(term => (
                    <TabsTrigger key={term} value={term}>{term}</TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>기수</TableHead>
                    <TableHead>구분</TableHead>
                    <TableHead>하위 구분</TableHead>
                    <TableHead>제목</TableHead>
                    <TableHead>날짜</TableHead>
                    <TableHead>시간</TableHead>
                    <TableHead>장소</TableHead>
                    <TableHead>설명</TableHead>
                    <TableHead>관리</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSchedules.length > 0 ? (
                    filteredSchedules.map((schedule) => (
                      <TableRow key={schedule.id}>
                        <TableCell>{schedule.term}</TableCell>
                        <TableCell>{schedule.category}</TableCell>
                        <TableCell>{schedule.subcategory}</TableCell>
                        <TableCell className="font-medium">{schedule.title}</TableCell>
                        <TableCell>{formatDate(schedule.date)}</TableCell>
                        <TableCell>{schedule.time}</TableCell>
                        <TableCell>{schedule.location}</TableCell>
                        <TableCell className="max-w-xs truncate">{schedule.description}</TableCell>
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
                      <TableCell colSpan={9} className="text-center py-4">
                        일정이 없거나 검색 결과가 없습니다.
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
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>새 일정 추가</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="term">기수</Label>
                <Select
                  value={formData.term}
                  onValueChange={(value) => handleSelectChange('term', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="기수 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="제1기">제1기</SelectItem>
                    <SelectItem value="제2기">제2기</SelectItem>
                    <SelectItem value="제3기">제3기</SelectItem>
                    <SelectItem value="제4기">제4기</SelectItem>
                    <SelectItem value="제5기">제5기</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">구분</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleSelectChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="구분 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="학사 일정">학사 일정</SelectItem>
                    <SelectItem value="특별 활동">특별 활동</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {formData.category === '특별 활동' && (
                <div className="space-y-2">
                  <Label htmlFor="subcategory">하위 구분</Label>
                  <Select
                    value={formData.subcategory}
                    onValueChange={(value) => handleSelectChange('subcategory', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="하위 구분 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="해외 연수">해외 연수</SelectItem>
                      <SelectItem value="현장 탐방">현장 탐방</SelectItem>
                      <SelectItem value="친교 활동">친교 활동</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="title">제목</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="일정 제목을 입력하세요"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">날짜</Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">시간</Label>
                  <Input
                    id="time"
                    name="time"
                    type="time"
                    value={formData.time}
                    onChange={handleInputChange}
                  />
                </div>
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
                <Input
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="일정에 대한 설명을 입력하세요"
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
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>일정 수정</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-term">기수</Label>
                <Select
                  value={formData.term}
                  onValueChange={(value) => handleSelectChange('term', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="기수 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="제1기">제1기</SelectItem>
                    <SelectItem value="제2기">제2기</SelectItem>
                    <SelectItem value="제3기">제3기</SelectItem>
                    <SelectItem value="제4기">제4기</SelectItem>
                    <SelectItem value="제5기">제5기</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-category">구분</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleSelectChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="구분 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="학사 일정">학사 일정</SelectItem>
                    <SelectItem value="특별 활동">특별 활동</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {formData.category === '특별 활동' && (
                <div className="space-y-2">
                  <Label htmlFor="edit-subcategory">하위 구분</Label>
                  <Select
                    value={formData.subcategory}
                    onValueChange={(value) => handleSelectChange('subcategory', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="하위 구분 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="해외 연수">해외 연수</SelectItem>
                      <SelectItem value="현장 탐방">현장 탐방</SelectItem>
                      <SelectItem value="친교 활동">친교 활동</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="edit-title">제목</Label>
                <Input
                  id="edit-title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-date">날짜</Label>
                  <Input
                    id="edit-date"
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-time">시간</Label>
                  <Input
                    id="edit-time"
                    name="time"
                    type="time"
                    value={formData.time}
                    onChange={handleInputChange}
                  />
                </div>
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
                <Input
                  id="edit-description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
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
