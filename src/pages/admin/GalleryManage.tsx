import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface GalleryItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  date: string;
  term: string;
}

// 기본 샘플 데이터
const DEFAULT_GALLERY_ITEMS: GalleryItem[] = [
  {
    id: '1',
    title: '입학식',
    description: '2023년 봄학기 입학식 현장',
    imageUrl: 'https://placehold.co/600x400?text=입학식',
    date: new Date(2023, 2, 2).toISOString(),
    term: '1',
  },
  {
    id: '2',
    title: '특별 강연',
    description: '국제 정치 특별 강연 세미나',
    imageUrl: 'https://placehold.co/600x400?text=특별강연',
    date: new Date(2023, 3, 15).toISOString(),
    term: '1',
  },
  {
    id: '3',
    title: '워크샵',
    description: '리더십 개발 워크샵',
    imageUrl: 'https://placehold.co/600x400?text=워크샵',
    date: new Date(2023, 4, 10).toISOString(),
    term: '2',
  },
];

const GalleryManage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(DEFAULT_GALLERY_ITEMS);
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
      const auth = localStorage.getItem('adminAuth');
      if (auth !== 'true') {
        navigate('/admin/login');
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
    const loadGalleryItems = () => {
      const storedItems = localStorage.getItem('galleryItems');
      console.log('관리자 페이지 - 로컬 스토리지에서 불러온 데이터:', storedItems);
      
      if (storedItems) {
        try {
          const parsedItems = JSON.parse(storedItems);
          console.log('관리자 페이지 - 파싱된 갤러리 아이템:', parsedItems);
          
          if (parsedItems && Array.isArray(parsedItems) && parsedItems.length > 0) {
            // 날짜 기준 내림차순 정렬 (최신순)
            const sortedItems = parsedItems.sort((a: GalleryItem, b: GalleryItem) => 
              new Date(b.date).getTime() - new Date(a.date).getTime()
            );
            
            setGalleryItems(sortedItems);
          } else {
            console.log('관리자 페이지 - 파싱된 데이터가 비어있거나 배열이 아닙니다. 샘플 데이터를 생성합니다.');
            createSampleData();
          }
        } catch (error) {
          console.error('Failed to parse gallery data:', error);
          createSampleData();
        }
      } else {
        console.log('관리자 페이지 - 저장된 갤러리 데이터가 없습니다. 샘플 데이터를 생성합니다.');
        createSampleData();
      }
    };
    
    loadGalleryItems();
  }, []);

  // 샘플 데이터 생성 함수
  const createSampleData = () => {
    // 샘플 데이터 사용
    console.log('관리자 페이지 - 샘플 데이터 생성:', DEFAULT_GALLERY_ITEMS);
    
    // 로컬 스토리지에 저장 - 이 데이터는 갤러리 페이지에서도 사용됨
    localStorage.setItem('galleryItems', JSON.stringify(DEFAULT_GALLERY_ITEMS));
    
    // 현재 관리자 페이지의 상태 업데이트
    setGalleryItems(DEFAULT_GALLERY_ITEMS);
    
    toast({
      title: "샘플 데이터 생성",
      description: "갤러리 샘플 데이터가 생성되었습니다. 갤러리 페이지에서 확인할 수 있습니다.",
    });
  };

  // 디버깅용 함수: 갤러리 데이터 초기화
  const resetGalleryData = () => {
    localStorage.removeItem('galleryItems');
    console.log('갤러리 데이터가 초기화되었습니다.');
    createSampleData();
    
    toast({
      title: "데이터 초기화",
      description: "갤러리 데이터가 초기화되고 샘플 데이터가 생성되었습니다.",
    });
    
    return '갤러리 데이터가 초기화되고 샘플 데이터가 생성되었습니다.';
  };

  // 디버깅용 함수: 갤러리 데이터 확인
  const checkGalleryData = () => {
    const storedItems = localStorage.getItem('galleryItems');
    console.log('현재 갤러리 데이터:', storedItems);
    
    toast({
      title: "데이터 확인",
      description: `현재 ${storedItems ? JSON.parse(storedItems).length : 0}개의 갤러리 항목이 있습니다.`,
    });
    
    return storedItems;
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
    setIsEditDialogOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // 이미지 리사이징 함수
  const resizeImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      console.log('이미지 리사이징 시작:', file.name, file.type, file.size);
      
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        
        img.onload = () => {
          console.log('원본 이미지 크기:', img.width, 'x', img.height);
          
          // 이미지 리사이징을 위한 캔버스 생성
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            reject(new Error('Canvas context not available'));
            return;
          }
          
          // 너비 1080px로 설정하고 종횡비 유지
          const targetWidth = 1080;
          const scaleFactor = targetWidth / img.width;
          const targetHeight = Math.round(img.height * scaleFactor);
          
          console.log('리사이즈 후 크기:', targetWidth, 'x', targetHeight, '(비율:', scaleFactor, ')');
          
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          
          // 캔버스 초기화 (배경 투명하게)
          ctx.clearRect(0, 0, targetWidth, targetHeight);
          
          // 이미지 그리기 (안티앨리어싱 적용)
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
          
          // 이미지 포맷 결정 (원본이 PNG인 경우 PNG로, 그 외에는 JPEG로)
          const outputFormat = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
          const quality = outputFormat === 'image/png' ? 1.0 : 0.92; // PNG는 무손실, JPEG는 92% 품질
          
          // 리사이즈된 이미지를 base64 문자열로 변환
          const resizedImage = canvas.toDataURL(outputFormat, quality);
          
          console.log('리사이징 완료:', outputFormat, '포맷, 품질:', quality);
          
          // base64 문자열 크기 확인 (디버깅용)
          console.log('리사이즈된 이미지 크기(base64):', Math.round(resizedImage.length / 1024), 'KB');
          
          resolve(resizedImage);
        };
        
        img.onerror = (error) => {
          console.error('이미지 로드 실패:', error);
          reject(new Error('Failed to load image'));
        };
      };
      
      reader.onerror = (error) => {
        console.error('파일 읽기 실패:', error);
        reject(new Error('Failed to read file'));
      };
    });
  };

  // 파일 선택 핸들러
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    try {
      setIsUploading(true);
      console.log('이미지 업로드 시작:', file.name, file.type, file.size);
      
      // 이미지 리사이징
      const resizedImageUrl = await resizeImage(file);
      
      // 미리보기 이미지 설정
      setPreviewImage(resizedImageUrl);
      
      // 폼 데이터 업데이트
      setFormData({
        ...formData,
        imageUrl: resizedImageUrl,
      });
      
      console.log('이미지 업로드 완료');
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      toast({
        title: "이미지 업로드 실패",
        description: "이미지 처리 중 오류가 발생했습니다. 다른 이미지를 시도해보세요.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // 수정용 파일 선택 핸들러
  const handleEditFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    try {
      setIsUploading(true);
      console.log('편집 이미지 업로드 시작:', file.name, file.type, file.size);
      
      // 이미지 리사이징
      const resizedImageUrl = await resizeImage(file);
      
      // 미리보기 이미지 설정
      setEditPreviewImage(resizedImageUrl);
      
      // 폼 데이터 업데이트
      setFormData({
        ...formData,
        imageUrl: resizedImageUrl,
      });
      
      console.log('편집 이미지 업로드 완료');
    } catch (error) {
      console.error('편집 이미지 업로드 실패:', error);
      toast({
        title: "이미지 업로드 실패",
        description: "이미지 처리 중 오류가 발생했습니다. 다른 이미지를 시도해보세요.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddItem = () => {
    if (!formData.title || !formData.imageUrl) {
      toast({
        title: "필수 정보 누락",
        description: "제목과 이미지는 필수 항목입니다.",
        variant: "destructive",
      });
      return;
    }
    
    const newItem: GalleryItem = {
      id: Date.now().toString(),
      title: formData.title,
      description: formData.description,
      imageUrl: formData.imageUrl,
      term: selectedTerm,
      date: new Date(formData.date).toISOString(),
    };
    
    const updatedItems = [...galleryItems, newItem];
    
    // 날짜 기준 내림차순 정렬
    const sortedItems = updatedItems.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    localStorage.setItem('galleryItems', JSON.stringify(sortedItems));
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
  };

  const handleSaveChanges = () => {
    if (!selectedItem) return;
    
    if (!formData.imageUrl) {
      toast({
        title: "이미지 필요",
        description: "갤러리 항목에 이미지를 추가해주세요.",
        variant: "destructive",
      });
      return;
    }
    
    // 날짜 형식 변환 및 기존 기수 정보 유지
    const updatedItem: GalleryItem = {
      ...selectedItem,
      title: formData.title,
      description: formData.description,
      imageUrl: formData.imageUrl,
      date: new Date(formData.date).toISOString(),
      term: selectedTerm,
    };
    
    const updatedItems = galleryItems.map((item) =>
      item.id === selectedItem.id ? updatedItem : item
    );
    
    // 날짜 기준 내림차순 정렬
    const sortedItems = updatedItems.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    localStorage.setItem('galleryItems', JSON.stringify(sortedItems));
    setGalleryItems(sortedItems);
    
    setIsEditDialogOpen(false);
    setEditPreviewImage(null);
    
    toast({
      title: "갤러리 항목 수정",
      description: "갤러리 항목이 성공적으로 수정되었습니다.",
    });
  };

  // 항목 삭제 핸들러
  const handleDeleteItem = (id: string) => {
    if (window.confirm('정말로 이 갤러리 항목을 삭제하시겠습니까?')) {
      const updatedItems = galleryItems.filter(item => item.id !== id);
      localStorage.setItem('galleryItems', JSON.stringify(updatedItems));
      setGalleryItems(updatedItems);
      
      toast({
        title: "갤러리 항목 삭제",
        description: "갤러리 항목이 성공적으로 삭제되었습니다.",
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
    <>
      <Header />
      <div className="container mx-auto py-20 px-4">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl font-bold text-mainBlue">갤러리 관리</CardTitle>
              <div className="flex gap-4">
                <Button onClick={handleAddClick}>새 항목 추가</Button>
                <Button onClick={() => navigate('/admin')}>관리자 홈으로</Button>
              </div>
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
                  <div key={item.id} className="border rounded-md overflow-hidden shadow-sm">
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
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteItem(item.id)}>
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
                    onClick={() => fileInputRef.current?.click()}
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
                    onChange={handleFileSelect}
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
                    onClick={() => editFileInputRef.current?.click()}
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
                    onChange={handleEditFileSelect}
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
      </div>
      <Footer />
    </>
  );
};

export default GalleryManage;
