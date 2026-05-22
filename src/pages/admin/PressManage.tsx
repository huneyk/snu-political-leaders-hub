import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import AdminLayout from '@/components/admin/AdminLayout';
import { LoadingModal } from '@/components/admin/LoadingModal';
import { apiService } from '@/lib/apiService';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import axios from 'axios';

const API_BASE_URL = 'https://snu-plp-hub-server.onrender.com/api';

interface AttachmentFile {
  id: string;
  name: string;
  originalName: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: string;
}

interface PressItem {
  _id?: string;
  id?: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  isImportant: boolean;
  attachments?: AttachmentFile[];
}

const PressManage: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useAdminAuth();
  const [pressItems, setPressItems] = useState<PressItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<PressItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedAttachments, setUploadedAttachments] = useState<AttachmentFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    author: '',
    isImportant: false,
  });

  const SUPPORTED_FILE_TYPES = {
    'image/jpeg': '.jpg,.jpeg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'image/svg+xml': '.svg',
    'application/pdf': '.pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
    'application/vnd.ms-excel': '.xls',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
    'application/vnd.ms-powerpoint': '.ppt',
    'text/plain': '.txt',
    'text/csv': '.csv',
    'application/zip': '.zip',
    'application/x-rar-compressed': '.rar'
  };

  const MAX_FILE_SIZE = 10 * 1024 * 1024;
  const MAX_FILES = 5;

  useEffect(() => {
    const checkAuth = () => {
      const localToken = localStorage.getItem('adminToken');
      const adminAuth = localStorage.getItem('adminAuth');

      console.log('인증 체크:', { localToken, adminAuth });

      if (!localToken && adminAuth !== 'true') {
        console.log('인증 실패: 로그인 페이지로 이동');
        navigate('/admin/login');
      } else {
        console.log('인증 성공: 언론보도 관리 페이지 접근 허용');
      }
    };

    checkAuth();
    loadPress();
  }, []);

  const loadPress = async () => {
    try {
      setIsLoading(true);
      console.log('언론보도 데이터 로드 시작');
      const data = await apiService.getPress();
      console.log('API 응답:', data);

      if (data && Array.isArray(data)) {
        setPressItems(data);
        console.log('언론보도 데이터 로드 완료:', data.length, '개 항목');
      } else {
        console.log('API에서 받은 데이터가 비어 있거나 형식이 올바르지 않습니다.');
        setPressItems([]);
      }
    } catch (error) {
      console.error('언론보도 로드 실패:', error);
      toast({
        title: '언론보도 로드 실패',
        description: '언론보도를 불러오는 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
      setPressItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredItems = pressItems.filter(
    (item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (selectedFiles.length + files.length > MAX_FILES) {
      toast({
        title: '파일 수 제한 초과',
        description: `최대 ${MAX_FILES}개의 파일만 업로드할 수 있습니다.`,
        variant: 'destructive',
      });
      return;
    }

    const validFiles: File[] = [];
    const invalidFiles: string[] = [];

    files.forEach(file => {
      if (file.size > MAX_FILE_SIZE) {
        invalidFiles.push(`${file.name} (파일 크기가 10MB를 초과합니다)`);
        return;
      }

      if (!Object.keys(SUPPORTED_FILE_TYPES).includes(file.type)) {
        invalidFiles.push(`${file.name} (지원되지 않는 파일 형식입니다)`);
        return;
      }

      if (selectedFiles.some(existing => existing.name === file.name)) {
        invalidFiles.push(`${file.name} (이미 선택된 파일입니다)`);
        return;
      }

      validFiles.push(file);
    });

    if (invalidFiles.length > 0) {
      toast({
        title: '파일 선택 오류',
        description: invalidFiles.join(', '),
        variant: 'destructive',
      });
    }

    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async (files: File[]): Promise<AttachmentFile[]> => {
    if (files.length === 0) return [];

    setIsUploading(true);
    const uploadedFiles: AttachmentFile[] = [];

    try {
      for (const file of files) {
        const base64 = await convertFileToBase64(file);

        const attachment: AttachmentFile = {
          id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          originalName: file.name,
          size: file.size,
          type: file.type,
          url: base64,
          uploadedAt: new Date().toISOString()
        };

        uploadedFiles.push(attachment);
      }

      toast({
        title: '파일 업로드 성공',
        description: `${files.length}개의 파일이 업로드되었습니다.`,
      });

      return uploadedFiles;
    } catch (error) {
      console.error('파일 업로드 실패:', error);
      toast({
        title: '파일 업로드 실패',
        description: '파일 업로드 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
      return [];
    } finally {
      setIsUploading(false);
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = (error) => {
        reject(error);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAttachment = (attachmentId: string) => {
    setUploadedAttachments(prev => prev.filter(att => att.id !== attachmentId));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleAddClick = () => {
    setFormData({
      title: '',
      content: '',
      author: '',
      isImportant: false,
    });
    setSelectedFiles([]);
    setUploadedAttachments([]);
    setIsAddDialogOpen(true);
  };

  const handleEditClick = (item: PressItem) => {
    setSelectedItem(item);
    setFormData({
      title: item.title,
      content: item.content,
      author: item.author,
      isImportant: item.isImportant,
    });
    setSelectedFiles([]);
    setUploadedAttachments(item.attachments || []);
    setIsEditDialogOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleAddPress = async () => {
    if (!formData.title || !formData.content || !formData.author) {
      toast({
        title: '입력 오류',
        description: '제목, 내용, 작성자는 필수 항목입니다.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      let attachments: AttachmentFile[] = [...uploadedAttachments];

      if (selectedFiles.length > 0) {
        const newAttachments = await uploadFiles(selectedFiles);
        attachments = [...attachments, ...newAttachments];
      }

      const pressData = {
        ...formData,
        attachments,
      };

      console.log('=== 클라이언트: 언론보도 추가 데이터 ===');
      console.log('formData:', formData);
      console.log('attachments 개수:', attachments.length);

      let success = false;

      try {
        console.log('📤 apiService.addPress 호출 시작');
        const response = await apiService.addPress(pressData, token);
        console.log('✅ 서버 응답:', response);
        success = true;
      } catch (apiError) {
        console.log('apiService 실패, 직접 axios 요청 시도');

        try {
          await axios.post(`${API_BASE_URL}/press`, pressData, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });
          success = true;
        } catch (axiosError) {
          console.error('직접 axios 요청도 실패:', axiosError);
        }
      }

      if (success) {
        toast({
          title: '언론보도 추가 성공',
          description: `새 언론보도가 성공적으로 추가되었습니다.${attachments.length > 0 ? ` (첨부파일 ${attachments.length}개 포함)` : ''}`,
        });

        await loadPress();
        setIsAddDialogOpen(false);

        setFormData({
          title: '',
          content: '',
          author: '',
          isImportant: false,
        });
        setSelectedFiles([]);
        setUploadedAttachments([]);
      } else {
        throw new Error('모든 추가 시도가 실패했습니다');
      }
    } catch (error) {
      console.error('언론보도 추가 실패:', error);
      toast({
        title: '언론보도 추가 실패',
        description: '언론보도를 추가하는 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!selectedItem) return;

    if (!formData.title || !formData.content || !formData.author) {
      toast({
        title: '입력 오류',
        description: '제목, 내용, 작성자는 필수 항목입니다.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      let attachments: AttachmentFile[] = [...uploadedAttachments];
      if (selectedFiles.length > 0) {
        const newAttachments = await uploadFiles(selectedFiles);
        attachments = [...attachments, ...newAttachments];
      }

      const pressData = {
        ...formData,
        attachments,
      };

      const itemId = selectedItem._id || selectedItem.id;
      let success = false;

      try {
        console.log('apiService.updatePress 호출 시작');
        await apiService.updatePress(itemId, pressData, token);
        success = true;
      } catch (apiError) {
        console.log('apiService 실패, 직접 axios 요청 시도');

        try {
          await axios.put(`${API_BASE_URL}/press/${itemId}`, pressData, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });
          success = true;
        } catch (axiosError) {
          console.error('직접 axios 요청도 실패:', axiosError);
        }
      }

      if (success) {
        toast({
          title: '언론보도 수정 성공',
          description: '언론보도가 성공적으로 수정되었습니다.',
        });

        await loadPress();
        setIsEditDialogOpen(false);
        setSelectedItem(null);
      } else {
        throw new Error('모든 수정 시도가 실패했습니다');
      }
    } catch (error: any) {
      console.error('언론보도 수정 실패:', error);
      toast({
        title: '언론보도 수정 실패',
        description: `언론보도를 수정하는 중 오류가 발생했습니다: ${error.message || '알 수 없는 오류'}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePress = async (id: string) => {
    if (!id) {
      toast({
        title: '삭제 오류',
        description: '유효하지 않은 언론보도입니다.',
        variant: 'destructive',
      });
      return;
    }

    if (!confirm('정말로 이 언론보도를 삭제하시겠습니까?')) {
      return;
    }

    setIsLoading(true);
    try {
      let success = false;

      try {
        await apiService.deletePress(id, token);
        success = true;
      } catch (apiError) {
        console.log('apiService 실패, 직접 axios 요청 시도');

        try {
          await axios.delete(`${API_BASE_URL}/press/${id}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          success = true;
        } catch (axiosError) {
          console.error('직접 axios 요청도 실패:', axiosError);
        }
      }

      if (success) {
        toast({
          title: '언론보도 삭제 성공',
          description: '언론보도가 성공적으로 삭제되었습니다.',
        });

        await loadPress();
      } else {
        throw new Error('모든 삭제 시도가 실패했습니다');
      }
    } catch (error: any) {
      console.error('언론보도 삭제 실패:', error);
      toast({
        title: '언론보도 삭제 실패',
        description: `언론보도를 삭제하는 중 오류가 발생했습니다: ${error.message || '알 수 없는 오류'}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
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

  const addPressDialog = () => {
    return (
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>새 언론보도 추가</DialogTitle>
            <p className="text-sm text-gray-500">
              새로운 언론보도를 작성하여 추가합니다.
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
                placeholder="언론보도 제목을 입력하세요"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">내용</Label>
              <Textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="언론보도 내용을 입력하세요"
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
              <Label htmlFor="isImportant">중요 보도로 표시</Label>
            </div>

            <div className="space-y-2 mt-4">
              <Label>첨부파일</Label>
              <div className="border border-dashed border-gray-300 rounded-lg p-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept={Object.values(SUPPORTED_FILE_TYPES).join(',')}
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading || selectedFiles.length + uploadedAttachments.length >= MAX_FILES}
                  className="w-full"
                >
                  {isUploading ? '업로드 중...' : '파일 선택'}
                </Button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  지원 형식: 이미지, PDF, Word, Excel, PowerPoint, 텍스트, 압축파일 (최대 {MAX_FILES}개, 각 10MB 이하)
                </p>
              </div>

              {selectedFiles.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">선택된 파일</Label>
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded border">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{file.name}</span>
                        <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSelectedFile(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ✕
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {uploadedAttachments.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">첨부파일</Label>
                  {uploadedAttachments.map((attachment) => (
                    <div key={attachment.id} className="flex items-center justify-between p-2 bg-green-50 rounded border">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{attachment.originalName}</span>
                        <span className="text-xs text-gray-500">({formatFileSize(attachment.size)})</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAttachment(attachment.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ✕
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">취소</Button>
            </DialogClose>
            <Button onClick={handleAddPress} disabled={isLoading || isUploading}>
              {isLoading ? '추가 중...' : '추가'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  const editPressDialog = () => {
    return (
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>언론보도 수정</DialogTitle>
            <p className="text-sm text-gray-500">
              선택한 언론보도의 내용을 수정합니다.
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
              <Label htmlFor="editIsImportant">중요 보도로 표시</Label>
            </div>

            <div className="space-y-2 mt-4">
              <Label>첨부파일</Label>
              <div className="border border-dashed border-gray-300 rounded-lg p-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept={Object.values(SUPPORTED_FILE_TYPES).join(',')}
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading || selectedFiles.length + uploadedAttachments.length >= MAX_FILES}
                  className="w-full"
                >
                  {isUploading ? '업로드 중...' : '파일 선택'}
                </Button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  지원 형식: 이미지, PDF, Word, Excel, PowerPoint, 텍스트, 압축파일 (최대 {MAX_FILES}개, 각 10MB 이하)
                </p>
              </div>

              {selectedFiles.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">선택된 파일</Label>
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded border">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{file.name}</span>
                        <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSelectedFile(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ✕
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {uploadedAttachments.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">첨부파일</Label>
                  {uploadedAttachments.map((attachment) => (
                    <div key={attachment.id} className="flex items-center justify-between p-2 bg-green-50 rounded border">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{attachment.originalName}</span>
                        <span className="text-xs text-gray-500">({formatFileSize(attachment.size)})</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAttachment(attachment.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ✕
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">취소</Button>
            </DialogClose>
            <Button onClick={handleSaveChanges} disabled={isLoading || isUploading}>
              {isLoading ? '저장 중...' : '저장'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <AdminLayout>
      <LoadingModal isOpen={isLoading} message="언론보도 데이터를 불러오는 중입니다..." />
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-semibold">언론보도 관리</CardTitle>
            <div className="flex gap-4">
              <Button onClick={handleAddClick}>새 언론보도 추가</Button>
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
                  <TableHead>첨부파일</TableHead>
                  <TableHead>관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
                    <TableRow key={item._id || item.id}>
                      <TableCell>
                        {item.isImportant ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            중요
                          </span>
                        ) : null}
                      </TableCell>
                      <TableCell className="font-medium">{item.title}</TableCell>
                      <TableCell>{item.author}</TableCell>
                      <TableCell>{formatDate(item.createdAt)}</TableCell>
                      <TableCell>
                        {item.attachments && item.attachments.length > 0 ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                            📎 {item.attachments.length}개
                          </span>
                        ) : (
                          <span className="text-gray-400">없음</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditClick(item)}
                          >
                            수정
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeletePress(item._id || item.id || '')}
                          >
                            삭제
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      언론보도가 없거나 검색 결과가 없습니다.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {addPressDialog()}
      {editPressDialog()}
    </AdminLayout>
  );
};

export default PressManage;
