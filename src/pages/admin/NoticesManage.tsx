import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import AdminLayout from '@/components/admin/AdminLayout';

interface Notice {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  isImportant: boolean;
}

const NoticesManage = () => {
  const navigate = useNavigate();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    author: '',
    isImportant: false,
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
            title: '2023년 과정 입학 안내',
            content: '2023년 정치지도자 과정 입학 신청이 시작되었습니다. 신청 마감일은 2023년 2월 28일입니다.',
            author: '관리자',
            createdAt: new Date(2023, 0, 15).toISOString(),
            isImportant: true,
          },
          {
            id: '2',
            title: '시설 이용 안내',
            content: '강의실 및 세미나실 이용 시간은 오전 9시부터 오후 6시까지입니다.',
            author: '시설 관리자',
            createdAt: new Date(2023, 1, 10).toISOString(),
            isImportant: false,
          },
          {
            id: '3',
            title: '특별 강연 안내',
            content: '3월 15일 오후 2시부터 국제 정치 관련 특별 강연이 진행됩니다. 많은 참여 바랍니다.',
            author: '교육 담당자',
            createdAt: new Date(2023, 2, 5).toISOString(),
            isImportant: true,
          },
        ];
        localStorage.setItem('notices', JSON.stringify(sampleNotices));
        setNotices(sampleNotices);
      }
    };
    
    loadNotices();
  }, []);

  const filteredNotices = notices.filter(
    (notice) =>
      notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notice.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notice.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddClick = () => {
    setFormData({
      title: '',
      content: '',
      author: '관리자',
      isImportant: false,
    });
    setIsAddDialogOpen(true);
  };

  const handleEditClick = (notice: Notice) => {
    setSelectedNotice(notice);
    setFormData({
      title: notice.title,
      content: notice.content,
      author: notice.author,
      isImportant: notice.isImportant,
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

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      isImportant: e.target.checked,
    });
  };

  const handleAddNotice = () => {
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
      createdAt: new Date().toISOString(),
    };
    
    const updatedNotices = [...notices, newNotice];
    localStorage.setItem('notices', JSON.stringify(updatedNotices));
    setNotices(updatedNotices);
    setIsAddDialogOpen(false);
    
    toast({
      title: "공지사항 추가",
      description: "새로운 공지사항이 성공적으로 추가되었습니다.",
    });
  };

  const handleSaveChanges = () => {
    if (!selectedNotice) return;
    
    if (!formData.title || !formData.content) {
      toast({
        title: "입력 오류",
        description: "제목과 내용은 필수 입력 항목입니다.",
        variant: "destructive",
      });
      return;
    }
    
    const updatedNotices = notices.map((notice) =>
      notice.id === selectedNotice.id
        ? { ...notice, ...formData }
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
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <AdminLayout>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-semibold">공지사항 관리</CardTitle>
            <div className="flex gap-4">
              <Button onClick={handleAddClick}>새 공지사항 추가</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Input
              type="text"
              placeholder="제목, 내용 또는 작성자로 검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">중요</TableHead>
                  <TableHead>제목</TableHead>
                  <TableHead>작성자</TableHead>
                  <TableHead>작성일</TableHead>
                  <TableHead>관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredNotices.length > 0 ? (
                  filteredNotices.map((notice) => (
                    <TableRow key={notice.id}>
                      <TableCell>
                        {notice.isImportant ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            중요
                          </span>
                        ) : null}
                      </TableCell>
                      <TableCell className="font-medium">{notice.title}</TableCell>
                      <TableCell>{notice.author}</TableCell>
                      <TableCell>{formatDate(notice.createdAt)}</TableCell>
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
                    <TableCell colSpan={5} className="text-center py-4">
                      공지사항이 없거나 검색 결과가 없습니다.
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>새 공지사항 추가</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">제목</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="공지사항 제목을 입력하세요"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">내용</Label>
              <Textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="공지사항 내용을 입력하세요"
                rows={5}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="author">작성자</Label>
              <Input
                id="author"
                name="author"
                value={formData.author}
                onChange={handleInputChange}
                placeholder="작성자를 입력하세요"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isImportant"
                name="isImportant"
                checked={formData.isImportant}
                onChange={handleCheckboxChange}
                className="rounded border-gray-300 text-mainBlue focus:ring-mainBlue h-4 w-4"
              />
              <Label htmlFor="isImportant" className="text-sm cursor-pointer">중요 공지사항으로 표시</Label>
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>공지사항 수정</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">제목</Label>
              <Input
                id="edit-title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-content">내용</Label>
              <Textarea
                id="edit-content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                rows={5}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-author">작성자</Label>
              <Input
                id="edit-author"
                name="author"
                value={formData.author}
                onChange={handleInputChange}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-isImportant"
                name="isImportant"
                checked={formData.isImportant}
                onChange={handleCheckboxChange}
                className="rounded border-gray-300 text-mainBlue focus:ring-mainBlue h-4 w-4"
              />
              <Label htmlFor="edit-isImportant" className="text-sm cursor-pointer">중요 공지사항으로 표시</Label>
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
    </AdminLayout>
  );
};

export default NoticesManage;
