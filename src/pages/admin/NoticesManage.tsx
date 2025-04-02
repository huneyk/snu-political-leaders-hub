import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminLayout from '@/components/admin/AdminLayout';
import { apiService } from '@/lib/apiService';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import axios from 'axios';

// API 기본 URL 설정 - 전체 URL 사용
const API_BASE_URL = import.meta.env.MODE === 'production' 
  ? 'https://snu-plp-hub-server.onrender.com/api' 
  : 'http://localhost:5001/api';

interface Notice {
  _id?: string;
  id?: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  isImportant: boolean;
}

const NoticesManage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, token } = useAdminAuth();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    author: '',
    isImportant: false,
  });

  // Admin 인증 체크
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('adminToken');
      const adminAuth = localStorage.getItem('adminAuth');
      
      console.log('인증 체크:', { token, adminAuth });
      
      // token이 있거나 adminAuth가 'true'인 경우 접근 허용
      if (!token && adminAuth !== 'true') {
        console.log('인증 실패: 로그인 페이지로 이동');
        navigate('/admin/login');
      } else {
        console.log('인증 성공: 공지사항 관리 페이지 접근 허용');
      }
    };
    
    checkAuth();
    // 컴포넌트 마운트 시 한 번만 실행
    loadNotices();
  }, []); // 빈 의존성 배열

  // 공지사항 로드
  const loadNotices = async () => {
    try {
      setIsLoading(true);
      console.log('공지사항 데이터 로드 시작');
      const data = await apiService.getNotices();
      console.log('API 응답:', data);
      
      if (data && Array.isArray(data)) {
        setNotices(data);
        console.log('공지사항 데이터 로드 완료:', data.length, '개 항목');
      } else {
        console.log('API에서 받은 데이터가 비어 있거나 형식이 올바르지 않습니다.');
        setNotices([]);
      }
    } catch (error) {
      console.error('공지사항 로드 실패:', error);
      toast({
        title: "공지사항 로드 실패",
        description: "공지사항을 불러오는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
      setNotices([]);
    } finally {
      setIsLoading(false);
    }
  };

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
      author: '',
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
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked,
    });
  };

  const handleAddNotice = async () => {
    if (!formData.title || !formData.content || !formData.author) {
      toast({
        title: "입력 오류",
        description: "제목, 내용, 작성자는 필수 항목입니다.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // 여러 서로 다른 엔드포인트로 시도
      let success = false;
      
      try {
        // 1. 먼저 apiService로 시도
        await apiService.addNotice(formData);
        success = true;
      } catch (apiError) {
        console.log('apiService 실패, 직접 axios 요청 시도');
        
        try {
          // 2. apiService 실패시 직접 axios로 시도
          await axios.post(`${API_BASE_URL}/notices`, formData, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer admin-auth'
            }
          });
          success = true;
        } catch (axiosError) {
          console.error('직접 axios 요청도 실패:', axiosError);
          
          try {
            // 3. 대체 서버 API 엔드포인트로 시도
            console.log('대체 경로로 시도: /api/content/notices');
            await axios.post(`${API_BASE_URL.replace('/api', '/api/content')}/notices`, formData, {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer admin-auth'
              }
            });
            success = true;
          } catch (fallbackError) {
            console.error('모든 API 경로 시도 실패:', fallbackError);
          }
        }
      }
      
      if (success) {
        toast({
          title: "공지사항 추가 성공",
          description: "새 공지사항이 성공적으로 추가되었습니다.",
        });
        
        // 공지사항 목록 새로고침
        await loadNotices();
        setIsAddDialogOpen(false);
        
        // 입력 폼 초기화
        setFormData({
          title: '',
          content: '',
          author: '',
          isImportant: false,
        });
      } else {
        throw new Error('모든 추가 시도가 실패했습니다');
      }
    } catch (error) {
      console.error('공지사항 추가 실패:', error);
      toast({
        title: "공지사항 추가 실패",
        description: "공지사항을 추가하는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!selectedNotice) return;
    
    if (!formData.title || !formData.content || !formData.author) {
      toast({
        title: "입력 오류",
        description: "제목, 내용, 작성자는 필수 항목입니다.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // 공지사항 수정 시도
      const noticeId = selectedNotice._id || selectedNotice.id;
      let success = false;
      
      try {
        // 1. 먼저 apiService로 시도
        await apiService.updateNotice(noticeId, formData);
        success = true;
      } catch (apiError) {
        console.log('apiService 실패, 직접 axios 요청 시도');
        
        try {
          // 2. apiService 실패시 직접 axios로 시도
          await axios.put(`${API_BASE_URL}/notices/${noticeId}`, formData, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer admin-auth'
            }
          });
          success = true;
        } catch (axiosError) {
          console.error('직접 axios 요청도 실패:', axiosError);
          
          try {
            // 3. 대체 서버 API 엔드포인트로 시도
            console.log('대체 경로로 시도: /api/content/notices');
            await axios.put(`${API_BASE_URL.replace('/api', '/api/content')}/notices/${noticeId}`, formData, {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer admin-auth'
              }
            });
            success = true;
          } catch (fallbackError) {
            console.error('모든 API 경로 시도 실패:', fallbackError);
          }
        }
      }
      
      if (success) {
        toast({
          title: "공지사항 수정 성공",
          description: "공지사항이 성공적으로 수정되었습니다.",
        });
        
        // 공지사항 목록 새로고침
        await loadNotices();
        setIsEditDialogOpen(false);
      } else {
        throw new Error('모든 수정 시도가 실패했습니다');
      }
    } catch (error) {
      console.error('공지사항 수정 실패:', error);
      toast({
        title: "공지사항 수정 실패",
        description: "공지사항을 수정하는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteNotice = async (id: string) => {
    if (window.confirm('정말로 이 공지사항을 삭제하시겠습니까?')) {
      setIsLoading(true);
      try {
        // apiService 사용하여 공지사항 삭제
        let success = false;
        
        try {
          // 1. 먼저 apiService로 시도
          await apiService.deleteNotice(id);
          success = true;
        } catch (apiError) {
          console.log('apiService 실패, 직접 axios 요청 시도');
          
          try {
            // 2. apiService 실패시 직접 axios로 시도
            await axios.delete(`${API_BASE_URL}/notices/${id}`, {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer admin-auth'
              }
            });
            success = true;
          } catch (axiosError) {
            console.error('직접 axios 요청도 실패:', axiosError);
            
            try {
              // 3. 대체 서버 API 엔드포인트로 시도
              console.log('대체 경로로 시도: /api/content/notices');
              await axios.delete(`${API_BASE_URL.replace('/api', '/api/content')}/notices/${id}`, {
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': 'Bearer admin-auth'
                }
              });
              success = true;
            } catch (fallbackError) {
              console.error('모든 API 경로 시도 실패:', fallbackError);
            }
          }
        }
        
        if (success) {
          toast({
            title: "공지사항 삭제 성공",
            description: "공지사항이 성공적으로 삭제되었습니다.",
          });
          
          // 공지사항 목록 새로고침
          await loadNotices();
        } else {
          throw new Error('모든 삭제 시도가 실패했습니다');
        }
      } catch (error) {
        console.error('공지사항 삭제 실패:', error);
        toast({
          title: "공지사항 삭제 실패",
          description: "공지사항을 삭제하는 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
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

  const addNoticeDialog = () => {
    return (
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>새 공지사항 추가</DialogTitle>
            <p className="text-sm text-gray-500">
              새로운 공지사항을 작성하여 추가합니다.
            </p>
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
            <div className="flex items-center space-x-2 mt-4">
              <Checkbox 
                id="isImportant" 
                checked={Boolean(formData.isImportant)}
                onCheckedChange={(checked) => {
                  setFormData({ ...formData, isImportant: Boolean(checked) });
                }}
              />
              <Label htmlFor="isImportant">중요 공지로 표시</Label>
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
    );
  };

  const editNoticeDialog = () => {
    return (
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>공지사항 수정</DialogTitle>
            <p className="text-sm text-gray-500">
              선택한 공지사항의 내용을 수정합니다.
            </p>
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
            <div className="flex items-center space-x-2 mt-4">
              <Checkbox 
                id="editIsImportant" 
                checked={Boolean(formData.isImportant)}
                onCheckedChange={(checked) => {
                  setFormData({ ...formData, isImportant: Boolean(checked) });
                }}
              />
              <Label htmlFor="editIsImportant">중요 공지로 표시</Label>
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
    );
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
                    <TableRow key={notice._id || notice.id}>
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
                            onClick={() => handleDeleteNotice(notice._id || notice.id || '')}
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
      
      {addNoticeDialog()}
      {editNoticeDialog()}
    </AdminLayout>
  );
};

export default NoticesManage;
