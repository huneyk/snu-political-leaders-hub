
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
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

interface Notice {
  id: number;
  title: string;
  content: string;
  date: string;
  author: string;
  isImportant: boolean;
  viewCount: number;
}

// 가상의 공지사항 데이터
const initialNotices: Notice[] = [
  {
    id: 1,
    title: '2023학년도 가을학기 수강신청 안내',
    content: '2023학년도 가을학기 수강신청은 8월 15일부터 20일까지 진행됩니다. 학사정보시스템을 통해 신청해주세요.',
    date: '2023-07-25',
    author: '교학처',
    isImportant: true,
    viewCount: 356
  },
  {
    id: 2,
    title: '도서관 운영시간 변경 안내',
    content: '2023년 8월 1일부터 도서관 운영시간이 변경됩니다. 평일 09:00-21:00, 주말 10:00-17:00로 운영됩니다.',
    date: '2023-07-28',
    author: '도서관',
    isImportant: false,
    viewCount: 210
  },
  {
    id: 3,
    title: '장학금 신청 마감일 연장 안내',
    content: '2023학년도 2학기 장학금 신청 마감일이 8월 5일로 연장되었습니다. 기한 내 신청 바랍니다.',
    date: '2023-07-30',
    author: '학생지원처',
    isImportant: true,
    viewCount: 428
  },
  {
    id: 4,
    title: '학생회 주관 캠퍼스 봉사활동 참가자 모집',
    content: '다음 달 5일 개최되는 캠퍼스 환경정화 봉사활동에 참여할 학생들을 모집합니다. 관심 있는 학생들은 학생회 사무실로 문의해주세요.',
    date: '2023-08-01',
    author: '학생회',
    isImportant: false,
    viewCount: 157
  },
  {
    id: 5,
    title: '2023학년도 가을학기 기숙사 신청 안내',
    content: '2023학년도 가을학기 기숙사 신청을 8월 10일부터 15일까지 받습니다. 신청서는 학교 홈페이지에서 다운로드 가능합니다.',
    date: '2023-08-02',
    author: '기숙사관리실',
    isImportant: true,
    viewCount: 384
  }
];

const NoticesManage = () => {
  const { isAuthenticated, isLoading } = useAdminAuth();
  const navigate = useNavigate();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterImportant, setFilterImportant] = useState<'all' | 'important' | 'normal'>('all');
  
  // 새 공지사항 또는 편집할 공지사항 상태
  const [editingNotice, setEditingNotice] = useState<Partial<Notice>>({
    title: '',
    content: '',
    date: new Date().toISOString().split('T')[0],
    author: '',
    isImportant: false,
    viewCount: 0
  });
  
  useEffect(() => {
    // 실제 구현에서는 API 호출을 통해 공지사항 데이터를 가져옵니다.
    const savedNotices = localStorage.getItem('admin-notices');
    if (savedNotices) {
      try {
        setNotices(JSON.parse(savedNotices));
      } catch (error) {
        console.error('Failed to parse notices:', error);
        setNotices(initialNotices);
      }
    } else {
      setNotices(initialNotices);
    }
  }, []);
  
  // 공지사항 저장
  const saveNotices = (updatedNotices: Notice[]) => {
    localStorage.setItem('admin-notices', JSON.stringify(updatedNotices));
    setNotices(updatedNotices);
  };
  
  // 공지사항 삭제
  const handleDeleteNotice = () => {
    if (!selectedNotice) return;
    
    const updatedNotices = notices.filter(notice => notice.id !== selectedNotice.id);
    saveNotices(updatedNotices);
    
    setIsDeleteDialogOpen(false);
    setSelectedNotice(null);
    
    toast({
      title: "공지사항 삭제",
      description: "공지사항이 성공적으로 삭제되었습니다.",
    });
  };
  
  // 공지사항 편집 다이얼로그 열기
  const handleEditClick = (notice: Notice) => {
    setEditingNotice({ ...notice });
    setIsEditDialogOpen(true);
  };
  
  // 공지사항 추가 다이얼로그 열기
  const handleAddClick = () => {
    setEditingNotice({
      title: '',
      content: '',
      date: new Date().toISOString().split('T')[0],
      author: '',
      isImportant: false,
      viewCount: 0
    });
    setIsAddDialogOpen(true);
  };
  
  // 공지사항 저장 (추가 또는 편집)
  const handleSaveNotice = (isEdit: boolean) => {
    if (!editingNotice.title || !editingNotice.content || !editingNotice.author) {
      toast({
        title: "입력 오류",
        description: "제목, 내용, 작성자는 필수 입력 항목입니다.",
        variant: "destructive"
      });
      return;
    }
    
    if (isEdit && editingNotice.id) {
      // 기존 공지사항 편집
      const updatedNotices = notices.map(notice => 
        notice.id === editingNotice.id ? { ...editingNotice as Notice } : notice
      );
      saveNotices(updatedNotices);
      setIsEditDialogOpen(false);
      
      toast({
        title: "공지사항 수정",
        description: "공지사항이 성공적으로 수정되었습니다.",
      });
    } else {
      // 새 공지사항 추가
      const highestId = notices.length > 0 ? Math.max(...notices.map(notice => notice.id)) : 0;
      const newNotice = {
        ...editingNotice,
        id: highestId + 1,
        viewCount: 0
      } as Notice;
      
      const updatedNotices = [...notices, newNotice];
      saveNotices(updatedNotices);
      setIsAddDialogOpen(false);
      
      toast({
        title: "공지사항 추가",
        description: "새 공지사항이 성공적으로 추가되었습니다.",
      });
    }
  };
  
  // 중요 공지사항 토글
  const toggleImportant = (id: number) => {
    const updatedNotices = notices.map(notice => 
      notice.id === id ? { ...notice, isImportant: !notice.isImportant } : notice
    );
    saveNotices(updatedNotices);
    
    toast({
      title: "중요 상태 변경",
      description: "공지사항의 중요 상태가 변경되었습니다.",
    });
  };
  
  // 필터링된 공지사항
  const filteredNotices = notices.filter(notice => {
    const matchesSearch = 
      notice.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      notice.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notice.author.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesImportant = 
      filterImportant === 'all' || 
      (filterImportant === 'important' && notice.isImportant) || 
      (filterImportant === 'normal' && !notice.isImportant);
    
    return matchesSearch && matchesImportant;
  });
  
  // 날짜순으로 정렬 (최신순)
  const sortedNotices = [...filteredNotices].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
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
          <h1 className="text-3xl font-bold text-mainBlue">공지사항 관리</h1>
          <Button onClick={() => {
            navigate('/admin');
          }}>관리자 대시보드로 돌아가기</Button>
        </div>
        
        <Card className="mb-8">
          <CardHeader className="pb-3">
            <CardTitle>공지사항 검색 및 필터</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <Input 
                placeholder="제목, 내용 또는 작성자로 검색" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="md:max-w-sm"
              />
              <select
                value={filterImportant}
                onChange={(e) => setFilterImportant(e.target.value as any)}
                className="p-2 border rounded"
              >
                <option value="all">모든 공지사항</option>
                <option value="important">중요 공지사항</option>
                <option value="normal">일반 공지사항</option>
              </select>
              <Button variant="outline" onClick={() => {
                setSearchTerm('');
                setFilterImportant('all');
              }}>초기화</Button>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-end mb-6">
          <Button onClick={handleAddClick}>새 공지사항 작성</Button>
        </div>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>공지사항 목록</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>제목</TableHead>
                    <TableHead>작성자</TableHead>
                    <TableHead>등록일</TableHead>
                    <TableHead>조회수</TableHead>
                    <TableHead>중요</TableHead>
                    <TableHead>관리</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedNotices.length > 0 ? (
                    sortedNotices.map((notice) => (
                      <TableRow key={notice.id}>
                        <TableCell className="font-medium">
                          {notice.isImportant && (
                            <span className="inline-block px-2 py-1 mr-2 text-xs font-semibold text-red-700 bg-red-100 rounded-full">
                              중요
                            </span>
                          )}
                          {notice.title}
                        </TableCell>
                        <TableCell>{notice.author}</TableCell>
                        <TableCell>{notice.date}</TableCell>
                        <TableCell>{notice.viewCount}</TableCell>
                        <TableCell>
                          <Button
                            variant={notice.isImportant ? "default" : "outline"}
                            size="sm"
                            onClick={() => toggleImportant(notice.id)}
                          >
                            {notice.isImportant ? '해제' : '지정'}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
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
                              onClick={() => {
                                setSelectedNotice(notice);
                                setIsDeleteDialogOpen(true);
                              }}
                            >
                              삭제
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        공지사항이 없거나 검색 결과가 없습니다.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
        
        {/* 공지사항 삭제 확인 다이얼로그 */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>공지사항 삭제 확인</DialogTitle>
              <DialogDescription>
                {selectedNotice && `"${selectedNotice.title}" 공지사항을 정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                취소
              </Button>
              <Button variant="destructive" onClick={handleDeleteNotice}>
                삭제
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* 공지사항 편집 다이얼로그 */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>공지사항 편집</DialogTitle>
              <DialogDescription>
                공지사항의 내용을 수정하세요.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="edit-title" className="text-right text-sm font-medium">
                  제목
                </label>
                <Input
                  id="edit-title"
                  value={editingNotice.title || ''}
                  onChange={(e) => setEditingNotice({...editingNotice, title: e.target.value})}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="edit-author" className="text-right text-sm font-medium">
                  작성자
                </label>
                <Input
                  id="edit-author"
                  value={editingNotice.author || ''}
                  onChange={(e) => setEditingNotice({...editingNotice, author: e.target.value})}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="edit-date" className="text-right text-sm font-medium">
                  등록일
                </label>
                <Input
                  id="edit-date"
                  type="date"
                  value={editingNotice.date || ''}
                  onChange={(e) => setEditingNotice({...editingNotice, date: e.target.value})}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="edit-important" className="text-right text-sm font-medium">
                  중요 공지
                </label>
                <div className="col-span-3 flex items-center">
                  <input
                    id="edit-important"
                    type="checkbox"
                    checked={editingNotice.isImportant || false}
                    onChange={(e) => setEditingNotice({...editingNotice, isImportant: e.target.checked})}
                    className="mr-2 h-4 w-4"
                  />
                  <label htmlFor="edit-important" className="text-sm">중요 공지사항으로 지정</label>
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-start gap-4">
                <label htmlFor="edit-content" className="text-right text-sm font-medium pt-2">
                  내용
                </label>
                <textarea
                  id="edit-content"
                  value={editingNotice.content || ''}
                  onChange={(e) => setEditingNotice({...editingNotice, content: e.target.value})}
                  className="col-span-3 p-2 border rounded min-h-[200px]"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                취소
              </Button>
              <Button onClick={() => handleSaveNotice(true)}>
                저장
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* 새 공지사항 작성 다이얼로그 */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>새 공지사항 작성</DialogTitle>
              <DialogDescription>
                새로운 공지사항을 작성하세요.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="add-title" className="text-right text-sm font-medium">
                  제목
                </label>
                <Input
                  id="add-title"
                  value={editingNotice.title || ''}
                  onChange={(e) => setEditingNotice({...editingNotice, title: e.target.value})}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="add-author" className="text-right text-sm font-medium">
                  작성자
                </label>
                <Input
                  id="add-author"
                  value={editingNotice.author || ''}
                  onChange={(e) => setEditingNotice({...editingNotice, author: e.target.value})}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="add-date" className="text-right text-sm font-medium">
                  등록일
                </label>
                <Input
                  id="add-date"
                  type="date"
                  value={editingNotice.date || ''}
                  onChange={(e) => setEditingNotice({...editingNotice, date: e.target.value})}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="add-important" className="text-right text-sm font-medium">
                  중요 공지
                </label>
                <div className="col-span-3 flex items-center">
                  <input
                    id="add-important"
                    type="checkbox"
                    checked={editingNotice.isImportant || false}
                    onChange={(e) => setEditingNotice({...editingNotice, isImportant: e.target.checked})}
                    className="mr-2 h-4 w-4"
                  />
                  <label htmlFor="add-important" className="text-sm">중요 공지사항으로 지정</label>
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-start gap-4">
                <label htmlFor="add-content" className="text-right text-sm font-medium pt-2">
                  내용
                </label>
                <textarea
                  id="add-content"
                  value={editingNotice.content || ''}
                  onChange={(e) => setEditingNotice({...editingNotice, content: e.target.value})}
                  className="col-span-3 p-2 border rounded min-h-[200px]"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                취소
              </Button>
              <Button onClick={() => handleSaveNotice(false)}>
                등록
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <Footer />
    </>
  );
};

export default NoticesManage;
