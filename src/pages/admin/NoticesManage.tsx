
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface Notice {
  id: string;
  title: string;
  content: string;
  date: string;
  important: boolean;
}

const NoticesManage = () => {
  const navigate = useNavigate();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    important: false,
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

  // 공지사항 데이터 로드
  useEffect(() => {
    const loadNotices = () => {
      const storedNotices = localStorage.getItem('notices');
      if (storedNotices) {
        setNotices(JSON.parse(storedNotices));
      } else {
        // 샘플 데이터
        const sampleNotices = [
          {
            id: '1',
            title: '제23기 정치지도자 과정 모집 안내',
            content: '서울대학교 정치지도자 과정 제23기 모집을 시작합니다. 자세한 내용은 아래를 참고하세요.\n\n- 모집기간: 2024년 1월 15일 ~ 2월 15일\n- 교육기간: 2024년 3월 ~ 6월 (총 16주)\n- 모집인원: 30명 내외\n- 지원자격: 정치인, 고위공무원, 언론인, 기업인 등',
            date: '2024-01-15',
            important: true,
          },
          {
            id: '2',
            title: '2024년도 학사일정 안내',
            content: '2024년도 정치지도자 과정의 학사일정을 안내해 드립니다.\n\n1. 입학식: 2024년 3월 2일\n2. 1학기: 2024년 3월 2일 ~ 4월 30일\n3. 중간평가: 2024년 5월 1일 ~ 5월 7일\n4. 2학기: 2024년 5월 8일 ~ 6월 20일\n5. 졸업식: 2024년 6월 30일',
            date: '2024-01-20',
            important: false,
          },
          {
            id: '3',
            title: '특별 강연 안내',
            content: '정치와 민주주의의 미래: 21세기 정치 리더십의 방향이라는 주제로 특별 강연이 진행됩니다.\n\n- 일시: 2024년 3월 15일 오후 2시\n- 장소: 서울대학교 행정대학원 57-1동 113호\n- 강사: 홍길동 교수 (서울대학교 정치외교학부)',
            date: '2024-02-28',
            important: true,
          },
        ];
        localStorage.setItem('notices', JSON.stringify(sampleNotices));
        setNotices(sampleNotices);
      }
    };
    
    loadNotices();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData({
      ...formData,
      important: checked,
    });
  };

  const handleAddNotice = () => {
    // 필수 필드 확인
    if (!formData.title || !formData.content) {
      toast({
        title: "입력 오류",
        description: "제목과 내용은 필수 입력 항목입니다.",
        variant: "destructive",
      });
      return;
    }

    const newNotice = {
      id: Date.now().toString(),
      ...formData,
      date: new Date().toISOString().split('T')[0],
    };

    const updatedNotices = [...notices, newNotice];
    localStorage.setItem('notices', JSON.stringify(updatedNotices));
    setNotices(updatedNotices);
    setIsAddDialogOpen(false);
    
    // 폼 데이터 초기화
    setFormData({
      title: '',
      content: '',
      important: false,
    });
    
    toast({
      title: "공지사항 추가",
      description: "새 공지사항이 성공적으로 추가되었습니다.",
    });
  };

  const handleViewClick = (notice: Notice) => {
    setSelectedNotice(notice);
    setIsViewDialogOpen(true);
  };

  const handleEditClick = (notice: Notice) => {
    setSelectedNotice(notice);
    setFormData({
      title: notice.title,
      content: notice.content,
      important: notice.important,
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveChanges = () => {
    if (!selectedNotice) return;
    
    const updatedNotices = notices.map((notice) =>
      notice.id === selectedNotice.id
        ? { 
            ...notice, 
            ...formData,
          }
        : notice
    );
    
    localStorage.setItem('notices', JSON.stringify(updatedNotices));
    setNotices(updatedNotices);
    setIsEditDialogOpen(false);
    
    toast({
      title: "공지사항 수정",
      description: "공지사항이 성공적으로 수정되었습니다.",
    });
  };

  const handleDeleteNotice = (id: string) => {
    if (window.confirm('정말로 이 공지사항을 삭제하시겠습니까?')) {
      const updatedNotices = notices.filter(notice => notice.id !== id);
      localStorage.setItem('notices', JSON.stringify(updatedNotices));
      setNotices(updatedNotices);
      
      toast({
        title: "공지사항 삭제",
        description: "공지사항이 성공적으로 삭제되었습니다.",
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
            <CardTitle className="text-2xl font-bold text-mainBlue">공지사항 관리</CardTitle>
            <div className="flex space-x-2">
              <Button onClick={() => navigate('/admin')}>관리자 홈으로</Button>
              <Button onClick={() => {
                setFormData({
                  title: '',
                  content: '',
                  important: false,
                });
                setIsAddDialogOpen(true);
              }}>
                공지사항 추가
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>중요</TableHead>
                    <TableHead>제목</TableHead>
                    <TableHead>날짜</TableHead>
                    <TableHead>관리</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notices.length > 0 ? (
                    notices.map((notice) => (
                      <TableRow key={notice.id}>
                        <TableCell>
                          {notice.important && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              중요
                            </span>
                          )}
                        </TableCell>
                        <TableCell 
                          className="font-medium cursor-pointer hover:text-mainBlue"
                          onClick={() => handleViewClick(notice)}
                        >
                          {notice.title}
                        </TableCell>
                        <TableCell>{formatDate(notice.date)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditClick(notice)}
                            >
                              수정
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteNotice(notice.id)}
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
                        등록된 공지사항이 없습니다.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* 공지사항 추가 다이얼로그 */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>새 공지사항 추가</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">제목 *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="공지사항 제목을 입력하세요"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="important"
                  checked={formData.important}
                  onCheckedChange={handleSwitchChange}
                />
                <Label htmlFor="important">중요 공지사항으로 표시</Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">내용 *</Label>
                <Textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  placeholder="공지사항 내용을 입력하세요"
                  rows={10}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">취소</Button>
              </DialogClose>
              <Button onClick={handleAddNotice}>추가</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 공지사항 수정 다이얼로그 */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>공지사항 수정</DialogTitle>
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
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-important"
                  checked={formData.important}
                  onCheckedChange={handleSwitchChange}
                />
                <Label htmlFor="edit-important">중요 공지사항으로 표시</Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-content">내용 *</Label>
                <Textarea
                  id="edit-content"
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  rows={10}
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

        {/* 공지사항 상세보기 다이얼로그 */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="text-xl">
                {selectedNotice?.title}
                {selectedNotice?.important && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    중요
                  </span>
                )}
              </DialogTitle>
              <p className="text-sm text-gray-500 mt-1">
                {selectedNotice && formatDate(selectedNotice.date)}
              </p>
            </DialogHeader>
            <div className="py-4">
              <div className="prose max-w-none">
                {selectedNotice?.content.split('\n').map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button>닫기</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <Footer />
    </>
  );
};

export default NoticesManage;
