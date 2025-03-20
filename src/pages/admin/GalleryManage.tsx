import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import AdminLayout from '@/components/admin/AdminLayout';
import { apiService } from '@/lib/apiService';

interface GalleryItem {
  _id?: string;
  title: string;
  description: string;
  imageUrl: string;
  date: string;
  term: number;
  createdAt?: string;
  updatedAt?: string;
}

// 기본 샘플 데이터
const DEFAULT_GALLERY_ITEMS: GalleryItem[] = [
  {
    _id: '1',
    title: '입학식',
    description: '2023년 봄학기 입학식 현장',
    imageUrl: 'data:image/jpeg;base64,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',
    date: new Date(2023, 2, 2).toISOString(),
    term: 1,
  },
  {
    _id: '2',
    title: '특별 강연',
    description: '국제 정치 특별 강연 세미나',
    imageUrl: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8LCwkMEQ8SEhEPERETFhwXExQaFRERGCEYGh0dHx8fExciJCIeJBweHx7/2wBDAQUFBQcGBw4ICA4eFBEUHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCABkAGQDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD0S7ukt49znnsBVVWkuX3OcL2HSiigDRt1VUAAxVXUbeadCLaXy5AeR3HsaKKAK1vp1xGdzXbFT12g0s1pNM25rxwPRQBRRQA6GxQffZ3x3atio4bZYwMZJooqZNt3A//Z',
    date: new Date(2023, 3, 15).toISOString(),
    term: 1,
  },
  {
    _id: '3',
    title: '워크샵',
    description: '리더십 개발 워크샵',
    imageUrl: 'data:image/jpeg;base64,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',
    date: new Date(2023, 4, 10).toISOString(),
    term: 2,
  },
];

const GalleryManage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [editPreviewImage, setEditPreviewImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState('1');

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
        console.log('인증 성공: 갤러리 관리 페이지 접근 허용');
        
        // 인증 성공 시 초기 기수값 설정
        if (selectedItem && selectedItem.term) {
          setSelectedTerm(selectedItem.term.toString());
        }
      }
    };
    
    checkAuth();
    
    // URL 파라미터에서 디버그 모드 확인
    const urlParams = new URLSearchParams(window.location.search);
    const debug = urlParams.get('debug');
    if (debug === 'true') {
      setDebugMode(true);
      console.log('관리자 페이지 - 디버그 모드 활성화됨');
    }
    
    // 전역 객체에 디버깅 함수 추가
    (window as any).resetGalleryData = resetGalleryData;
    (window as any).checkGalleryData = checkGalleryData;
    (window as any).forceLoadSampleData = () => {
      setGalleryItems(DEFAULT_GALLERY_ITEMS);
      return "샘플 데이터가 강제로 로드되었습니다.";
    };
  }, [navigate]);

  // 갤러리 데이터 로드
  useEffect(() => {
    const loadGalleryItems = async () => {
      try {
        console.log('갤러리 데이터 로드 시작');
        const response = await apiService.getGallery();
        console.log('API 응답:', response);
        
        if (response && Array.isArray(response) && response.length > 0) {
          // 날짜 기준 내림차순 정렬 (최신순)
          const sortedItems = response.sort((a: GalleryItem, b: GalleryItem) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          
          setGalleryItems(sortedItems);
          console.log('갤러리 데이터 로드 완료:', sortedItems.length, '개 항목');
        } else {
          console.log('API에서 받은 데이터가 비어있습니다. 샘플 데이터를 생성합니다.');
          createSampleData();
        }
      } catch (error) {
        console.error('갤러리 데이터 로드 실패:', error);
        toast({
          title: "데이터 로드 실패",
          description: "갤러리 데이터를 불러오는 중 오류가 발생했습니다. 샘플 데이터를 사용합니다.",
          variant: "destructive",
        });
        createSampleData();
      }
    };
    
    loadGalleryItems();
  }, []);

  // 샘플 데이터 생성 함수
  const createSampleData = async () => {
    try {
      console.log('샘플 데이터 생성 시작');
      
      // 서버에 샘플 데이터 저장 시도
      for (const item of DEFAULT_GALLERY_ITEMS) {
        const itemToCreate = {
          ...item,
          _id: undefined // _id는 MongoDB가 자동 생성하도록 제거
        };
        // 관리자 권한으로 API 호출
        await apiService.createGalleryItem(itemToCreate, 'admin-auth');
      }
      
      // 다시 데이터 로드
      const response = await apiService.getGallery();
      setGalleryItems(response);
      
      toast({
        title: "샘플 데이터 생성",
        description: "갤러리 샘플 데이터가 생성되었습니다.",
      });
      
      console.log('샘플 데이터 생성 완료');
    } catch (error) {
      console.error('샘플 데이터 생성 실패:', error);
      // 실패 시 로컬 상태에만 적용
      setGalleryItems(DEFAULT_GALLERY_ITEMS);
      
      toast({
        title: "샘플 데이터 생성 실패",
        description: "서버에 샘플 데이터를 저장하는데 실패했습니다. 로컬에서만 표시됩니다.",
        variant: "destructive",
      });
    }
  };

  // 디버깅용 함수: 갤러리 데이터 초기화
  const resetGalleryData = async () => {
    try {
      // 모든 갤러리 항목 가져오기
      const items = await apiService.getGallery();
      
      // 각 항목 삭제
      for (const item of items) {
        if (item._id) {
          await apiService.deleteGalleryItem(item._id, 'admin-auth');
        }
      }
      
      setGalleryItems([]);
      
      toast({
        title: "데이터 초기화",
        description: "갤러리 데이터가 초기화되었습니다.",
      });
      
      return '갤러리 데이터가 초기화되었습니다.';
    } catch (error) {
      console.error('데이터 초기화 실패:', error);
      
      toast({
        title: "데이터 초기화 실패",
        description: "갤러리 데이터 초기화 중 오류가 발생했습니다.",
        variant: "destructive",
      });
      
      return '갤러리 데이터 초기화 실패';
    }
  };

  // 디버깅용 함수: 갤러리 데이터 확인
  const checkGalleryData = async () => {
    try {
      const items = await apiService.getGallery();
      console.log('현재 갤러리 데이터:', items);
      
      toast({
        title: "데이터 확인",
        description: `현재 ${items ? items.length : 0}개의 갤러리 항목이 있습니다.`,
      });
      
      return JSON.stringify(items);
    } catch (error) {
      console.error('데이터 확인 실패:', error);
      
      toast({
        title: "데이터 확인 실패",
        description: "갤러리 데이터를 확인하는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
      
      return '갤러리 데이터 확인 실패';
    }
  };

  // 검색어로 필터링
  const filteredItems = galleryItems.filter(
    (item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddClick = () => {
    setFormData({
      title: '',
      description: '',
      imageUrl: '',
      date: new Date().toISOString().split('T')[0],
    });
    setPreviewImage(null);
    setIsAddDialogOpen(true);
  };

  const handleEditClick = (item: GalleryItem) => {
    setSelectedItem(item);
    setFormData({
      title: item.title,
      description: item.description,
      imageUrl: item.imageUrl,
      date: item.date ? new Date(item.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    });
    setEditPreviewImage(item.imageUrl);
    
    // 기수 값 설정
    if (item.term) {
      setSelectedTerm(item.term.toString());
    } else {
      setSelectedTerm('1');
    }
    
    setIsEditDialogOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileClick = (isEdit: boolean = false) => {
    if (isEdit && editFileInputRef.current) {
      editFileInputRef.current.click();
    } else if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>, isEdit: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      // 이미지 리사이징 처리
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // 너비가 1200px을 초과하는 경우에만 리사이징
        const maxWidth = 1200;
        if (width > maxWidth) {
          const ratio = maxWidth / width;
          width = maxWidth;
          height = Math.round(height * ratio);
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        // 리사이징된 이미지를 Base64로 변환
        const resizedBase64 = canvas.toDataURL('image/jpeg', 0.7); // 압축률 0.7
        
        if (isEdit) {
          setFormData({
            ...formData,
            imageUrl: resizedBase64
          });
          setEditPreviewImage(resizedBase64);
        } else {
          setFormData({
            ...formData,
            imageUrl: resizedBase64
          });
          setPreviewImage(resizedBase64);
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleAddItem = async () => {
    if (!formData.title || !formData.imageUrl) {
      toast({
        title: "필수 정보 누락",
        description: "제목과 이미지는 필수 항목입니다.",
        variant: "destructive",
      });
      return;
    }
    
    // 숫자로 변환 시 유효성 검사
    const termValue = parseInt(selectedTerm, 10);
    if (isNaN(termValue) || termValue < 1) {
      toast({
        title: "기수 입력 오류",
        description: "기수는 1 이상의 숫자여야 합니다.",
        variant: "destructive",
      });
      return;
    }
    
    const newItem: GalleryItem = {
      title: formData.title,
      description: formData.description,
      imageUrl: formData.imageUrl, // 이미 Base64 형식
      term: termValue, // 문자열에서 숫자로 변환
      date: new Date(formData.date).toISOString(),
    };
    
    try {
      // 서버에 새 항목 추가
      const createdItem = await apiService.createGalleryItem(newItem, 'admin-auth');
      
      // 상태 업데이트
      const updatedItems = [...galleryItems, createdItem];
      
      // 날짜 기준 내림차순 정렬
      const sortedItems = updatedItems.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      
      setGalleryItems(sortedItems);
      
      setIsAddDialogOpen(false);
      setPreviewImage(null);
      setFormData({
        title: '',
        description: '',
        imageUrl: '',
        date: new Date().toISOString().split('T')[0],
      });
      
      toast({
        title: "갤러리 항목 추가",
        description: "새로운 갤러리 항목이 성공적으로 추가되었습니다.",
      });
    } catch (error) {
      console.error('갤러리 항목 추가 실패:', error);
      toast({
        title: "항목 추가 실패",
        description: "새 갤러리 항목을 저장하는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleSaveChanges = async () => {
    if (!selectedItem || !selectedItem._id) return;
    
    if (!formData.imageUrl) {
      toast({
        title: "이미지 필요",
        description: "갤러리 항목에 이미지를 추가해주세요.",
        variant: "destructive",
      });
      return;
    }
    
    // 숫자로 변환 시 유효성 검사
    const termValue = parseInt(selectedTerm, 10);
    if (isNaN(termValue) || termValue < 1) {
      toast({
        title: "기수 입력 오류",
        description: "기수는 1 이상의 숫자여야 합니다.",
        variant: "destructive",
      });
      return;
    }
    
    // 날짜 형식 변환 및 기존 기수 정보 유지
    const updatedItem: GalleryItem = {
      ...selectedItem,
      title: formData.title,
      description: formData.description,
      imageUrl: formData.imageUrl, // 이미 Base64 형식
      date: new Date(formData.date).toISOString(),
      term: termValue, // 문자열에서 숫자로 변환
    };
    
    try {
      // 서버에 항목 업데이트
      await apiService.updateGalleryItem(selectedItem._id, updatedItem, 'admin-auth');
      
      // 상태 업데이트
      const updatedItems = galleryItems.map((item) =>
        item._id === selectedItem._id ? updatedItem : item
      );
      
      // 날짜 기준 내림차순 정렬
      const sortedItems = updatedItems.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      
      setGalleryItems(sortedItems);
      
      setIsEditDialogOpen(false);
      setEditPreviewImage(null);
      
      toast({
        title: "갤러리 항목 수정",
        description: "갤러리 항목이 성공적으로 수정되었습니다.",
      });
    } catch (error) {
      console.error('갤러리 항목 수정 실패:', error);
      toast({
        title: "항목 수정 실패",
        description: "갤러리 항목을 수정하는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  // 항목 삭제 핸들러
  const handleDeleteItem = async (id: string) => {
    if (window.confirm('정말로 이 갤러리 항목을 삭제하시겠습니까?')) {
      try {
        // 서버에서 항목 삭제
        await apiService.deleteGalleryItem(id, 'admin-auth');
        
        // 상태 업데이트
        const updatedItems = galleryItems.filter(item => item._id !== id);
        setGalleryItems(updatedItems);
        
        toast({
          title: "갤러리 항목 삭제",
          description: "갤러리 항목이 성공적으로 삭제되었습니다.",
          variant: "destructive",
        });
      } catch (error) {
        console.error('갤러리 항목 삭제 실패:', error);
        toast({
          title: "항목 삭제 실패",
          description: "갤러리 항목을 삭제하는 중 오류가 발생했습니다.",
          variant: "destructive",
        });
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

  return (
    <AdminLayout>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">갤러리 관리</CardTitle>
          <div className="flex justify-end gap-2">
            <Button onClick={handleAddClick}>새 항목 추가</Button>
          </div>
          {debugMode && (
            <div className="mt-4 flex gap-2">
              <Button 
                variant="destructive" 
                size="sm"
                onClick={resetGalleryData}
              >
                데이터 초기화
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={checkGalleryData}
              >
                데이터 확인
              </Button>
              <Button 
                variant="default" 
                size="sm"
                onClick={createSampleData}
              >
                샘플 데이터 생성
              </Button>
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => {
                  setGalleryItems(DEFAULT_GALLERY_ITEMS);
                  toast({
                    title: "강제 로드",
                    description: "샘플 데이터가 강제로 로드되었습니다.",
                  });
                }}
              >
                강제 샘플 데이터
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="w-full md:w-auto flex-1">
              <Input
                type="text"
                placeholder="제목 또는 설명으로 검색"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <div key={item._id} className="border rounded-md overflow-hidden shadow-sm">
                  <div className="aspect-w-16 aspect-h-9 w-full">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="object-cover w-full h-40"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-lg">{item.title}</h3>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">{formatDate(item.date)}</p>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{item.description}</p>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditClick(item)}>
                        수정
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteItem(item._id)}>
                        삭제
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-10">
                <p className="text-gray-500">검색 결과가 없습니다.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 갤러리 항목 추가 다이얼로그 */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>새 갤러리 항목 추가</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">제목</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="갤러리 항목 제목"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">설명</Label>
              <Input
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="갤러리 항목 설명"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="date">날짜</Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="term">기수</Label>
              <Input
                id="term"
                name="term"
                type="number"
                min="1"
                value={selectedTerm}
                onChange={(e) => {
                  // 숫자만 입력 가능하도록 처리
                  const value = e.target.value;
                  if (value === '' || /^[0-9]+$/.test(value)) {
                    // 빈 값이거나 숫자만 있는 경우
                    setSelectedTerm(value === '' ? '1' : value);
                  }
                }}
                placeholder="기수 입력 (숫자만)"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="image">이미지</Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleFileClick(false)}
                  disabled={isUploading}
                >
                  {isUploading ? '업로드 중...' : '이미지 선택'}
                </Button>
                <Input
                  id="image"
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, false)}
                  disabled={isUploading}
                />
                <span className="text-sm text-gray-500">
                  {isUploading ? '이미지 처리 중...' : '1080px 너비로 자동 리사이징됩니다'}
                </span>
              </div>
              {previewImage && (
                <div className="mt-2 relative">
                  <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-md overflow-hidden">
                    <img
                      src={previewImage}
                      alt="미리보기"
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="absolute top-2 right-2">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setPreviewImage(null);
                        setFormData({
                          ...formData,
                          imageUrl: '',
                        });
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                      className="h-8 w-8 p-0 rounded-full"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 6L6 18M6 6l12 12"/>
                      </svg>
                      <span className="sr-only">이미지 제거</span>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">취소</Button>
            </DialogClose>
            <Button onClick={handleAddItem} disabled={isUploading}>
              추가
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 갤러리 항목 수정 다이얼로그 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>갤러리 항목 수정</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-title">제목</Label>
              <Input
                id="edit-title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="갤러리 항목 제목"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">설명</Label>
              <Input
                id="edit-description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="갤러리 항목 설명"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-date">날짜</Label>
              <Input
                id="edit-date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-term">기수</Label>
              <Input
                id="edit-term"
                name="term"
                type="number"
                min="1"
                value={selectedTerm}
                onChange={(e) => {
                  // 숫자만 입력 가능하도록 처리
                  const value = e.target.value;
                  if (value === '' || /^[0-9]+$/.test(value)) {
                    // 빈 값이거나 숫자만 있는 경우
                    setSelectedTerm(value === '' ? '1' : value);
                  }
                }}
                placeholder="기수 입력 (숫자만)"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-image">이미지</Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleFileClick(true)}
                  disabled={isUploading}
                >
                  {isUploading ? '업로드 중...' : '이미지 선택'}
                </Button>
                <Input
                  id="edit-image"
                  type="file"
                  ref={editFileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, true)}
                  disabled={isUploading}
                />
                <span className="text-sm text-gray-500">
                  {isUploading ? '이미지 처리 중...' : '1080px 너비로 자동 리사이징됩니다'}
                </span>
              </div>
              {editPreviewImage && (
                <div className="mt-2 relative">
                  <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-md overflow-hidden">
                    <img
                      src={editPreviewImage}
                      alt="미리보기"
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="absolute top-2 right-2">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setEditPreviewImage(null);
                        setFormData({
                          ...formData,
                          imageUrl: '',
                        });
                        if (editFileInputRef.current) {
                          editFileInputRef.current.value = '';
                        }
                      }}
                      className="h-8 w-8 p-0 rounded-full"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 6L6 18M6 6l12 12"/>
                      </svg>
                      <span className="sr-only">이미지 제거</span>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">취소</Button>
            </DialogClose>
            <Button onClick={handleSaveChanges} disabled={isUploading}>
              저장
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default GalleryManage;
