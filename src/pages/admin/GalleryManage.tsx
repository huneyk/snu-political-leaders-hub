
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

interface GalleryImage {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  date: string;
  category: 'lecture' | 'event' | 'campus';
}

// 가상의 갤러리 이미지 데이터
const initialGalleryImages: GalleryImage[] = [
  {
    id: 1,
    title: '입학식 행사',
    description: '2023학년도 입학식 행사 현장',
    imageUrl: '/placeholder.svg',
    date: '2023-03-02',
    category: 'event'
  },
  {
    id: 2,
    title: '특강 세미나',
    description: '산업 전문가 초청 특강',
    imageUrl: '/placeholder.svg',
    date: '2023-04-15',
    category: 'lecture'
  },
  {
    id: 3,
    title: '캠퍼스 전경',
    description: '봄철 캠퍼스 전경',
    imageUrl: '/placeholder.svg',
    date: '2023-04-20',
    category: 'campus'
  },
  {
    id: 4,
    title: '학술 컨퍼런스',
    description: '국제 학술 컨퍼런스 참가',
    imageUrl: '/placeholder.svg',
    date: '2023-05-10',
    category: 'event'
  },
  {
    id: 5,
    title: '실습 수업',
    description: '실험실 실습 수업 현장',
    imageUrl: '/placeholder.svg',
    date: '2023-05-23',
    category: 'lecture'
  }
];

// 카테고리 라벨
const categoryLabels = {
  lecture: '강의/수업',
  event: '행사',
  campus: '캠퍼스'
};

// 갤러리 이미지 그리드 아이템
const GalleryItem = ({ image, onDelete, onEdit }: { 
  image: GalleryImage, 
  onDelete: (id: number) => void,
  onEdit: (image: GalleryImage) => void
}) => {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="relative h-48 bg-gray-100">
        <img 
          src={image.imageUrl} 
          alt={image.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
          {categoryLabels[image.category]}
        </div>
      </div>
      <div className="p-3">
        <h3 className="font-semibold truncate">{image.title}</h3>
        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{image.description}</p>
        <p className="text-xs text-gray-400 mt-2">{image.date}</p>
        <div className="flex justify-between mt-3">
          <Button size="sm" variant="outline" onClick={() => onEdit(image)}>
            수정
          </Button>
          <Button size="sm" variant="destructive" onClick={() => onDelete(image.id)}>
            삭제
          </Button>
        </div>
      </div>
    </div>
  );
};

const GalleryManage = () => {
  const { isAuthenticated, isLoading } = useAdminAuth();
  const navigate = useNavigate();
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<'all' | 'lecture' | 'event' | 'campus'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // 새 이미지 또는 편집할 이미지 상태
  const [editingImage, setEditingImage] = useState<Partial<GalleryImage>>({
    title: '',
    description: '',
    imageUrl: '/placeholder.svg',
    date: new Date().toISOString().split('T')[0],
    category: 'event'
  });
  
  useEffect(() => {
    // 실제 구현에서는 API 호출을 통해 갤러리 데이터를 가져옵니다.
    const savedImages = localStorage.getItem('admin-gallery');
    if (savedImages) {
      try {
        setImages(JSON.parse(savedImages));
      } catch (error) {
        console.error('Failed to parse gallery images:', error);
        setImages(initialGalleryImages);
      }
    } else {
      setImages(initialGalleryImages);
    }
  }, []);
  
  // 갤러리 이미지 저장
  const saveImages = (updatedImages: GalleryImage[]) => {
    localStorage.setItem('admin-gallery', JSON.stringify(updatedImages));
    setImages(updatedImages);
  };
  
  // 이미지 삭제
  const handleDeleteImage = () => {
    if (!selectedImage) return;
    
    const updatedImages = images.filter(img => img.id !== selectedImage.id);
    saveImages(updatedImages);
    
    setIsDeleteDialogOpen(false);
    setSelectedImage(null);
    
    toast({
      title: "이미지 삭제",
      description: "갤러리 이미지가 성공적으로 삭제되었습니다.",
    });
  };
  
  // 이미지 편집 다이얼로그 열기
  const handleEditClick = (image: GalleryImage) => {
    setEditingImage({ ...image });
    setIsEditDialogOpen(true);
  };
  
  // 이미지 추가 다이얼로그 열기
  const handleAddClick = () => {
    setEditingImage({
      title: '',
      description: '',
      imageUrl: '/placeholder.svg',
      date: new Date().toISOString().split('T')[0],
      category: 'event'
    });
    setIsAddDialogOpen(true);
  };
  
  // 이미지 저장 (추가 또는 편집)
  const handleSaveImage = (isEdit: boolean) => {
    if (!editingImage.title || !editingImage.imageUrl) {
      toast({
        title: "입력 오류",
        description: "제목과 이미지 URL은 필수 입력 항목입니다.",
        variant: "destructive"
      });
      return;
    }
    
    if (isEdit && editingImage.id) {
      // 기존 이미지 편집
      const updatedImages = images.map(img => 
        img.id === editingImage.id ? { ...editingImage as GalleryImage } : img
      );
      saveImages(updatedImages);
      setIsEditDialogOpen(false);
      
      toast({
        title: "이미지 수정",
        description: "갤러리 이미지가 성공적으로 수정되었습니다.",
      });
    } else {
      // 새 이미지 추가
      const highestId = images.length > 0 ? Math.max(...images.map(img => img.id)) : 0;
      const newImage = {
        ...editingImage,
        id: highestId + 1
      } as GalleryImage;
      
      const updatedImages = [...images, newImage];
      saveImages(updatedImages);
      setIsAddDialogOpen(false);
      
      toast({
        title: "이미지 추가",
        description: "새 갤러리 이미지가 성공적으로 추가되었습니다.",
      });
    }
  };
  
  // 필터링된 이미지
  const filteredImages = images.filter(image => {
    const matchesSearch = 
      image.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      image.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || image.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });
  
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
          <h1 className="text-3xl font-bold text-mainBlue">갤러리 관리</h1>
          <Button onClick={() => {
            navigate('/admin');
          }}>관리자 대시보드로 돌아가기</Button>
        </div>
        
        <Card className="mb-8">
          <CardHeader className="pb-3">
            <CardTitle>갤러리 검색 및 필터</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <Input 
                placeholder="제목 또는 설명으로 검색" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="md:max-w-sm"
              />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value as any)}
                className="p-2 border rounded"
              >
                <option value="all">모든 카테고리</option>
                <option value="lecture">강의/수업</option>
                <option value="event">행사</option>
                <option value="campus">캠퍼스</option>
              </select>
              <Button variant="outline" onClick={() => {
                setSearchTerm('');
                setFilterCategory('all');
              }}>초기화</Button>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-end mb-6">
          <Button onClick={handleAddClick}>새 이미지 추가</Button>
        </div>
        
        {filteredImages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredImages.map(image => (
              <GalleryItem 
                key={image.id} 
                image={image} 
                onDelete={(id) => {
                  setSelectedImage(image);
                  setIsDeleteDialogOpen(true);
                }}
                onEdit={handleEditClick}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-6 text-center">
              <p className="text-gray-500">갤러리 이미지가 없거나 검색 결과가 없습니다.</p>
            </CardContent>
          </Card>
        )}
        
        {/* 이미지 삭제 확인 다이얼로그 */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>이미지 삭제 확인</DialogTitle>
              <DialogDescription>
                {selectedImage && `"${selectedImage.title}" 이미지를 정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                취소
              </Button>
              <Button variant="destructive" onClick={handleDeleteImage}>
                삭제
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* 이미지 편집 다이얼로그 */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>갤러리 이미지 편집</DialogTitle>
              <DialogDescription>
                갤러리 이미지 정보를 수정하세요.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="edit-title" className="text-right text-sm font-medium">
                  제목
                </label>
                <Input
                  id="edit-title"
                  value={editingImage.title || ''}
                  onChange={(e) => setEditingImage({...editingImage, title: e.target.value})}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="edit-date" className="text-right text-sm font-medium">
                  날짜
                </label>
                <Input
                  id="edit-date"
                  type="date"
                  value={editingImage.date || ''}
                  onChange={(e) => setEditingImage({...editingImage, date: e.target.value})}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="edit-category" className="text-right text-sm font-medium">
                  카테고리
                </label>
                <select
                  id="edit-category"
                  value={editingImage.category || 'event'}
                  onChange={(e) => setEditingImage({...editingImage, category: e.target.value as any})}
                  className="col-span-3 p-2 border rounded"
                >
                  <option value="lecture">강의/수업</option>
                  <option value="event">행사</option>
                  <option value="campus">캠퍼스</option>
                </select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="edit-image-url" className="text-right text-sm font-medium">
                  이미지 URL
                </label>
                <Input
                  id="edit-image-url"
                  value={editingImage.imageUrl || ''}
                  onChange={(e) => setEditingImage({...editingImage, imageUrl: e.target.value})}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="edit-description" className="text-right text-sm font-medium">
                  설명
                </label>
                <textarea
                  id="edit-description"
                  value={editingImage.description || ''}
                  onChange={(e) => setEditingImage({...editingImage, description: e.target.value})}
                  className="col-span-3 p-2 border rounded min-h-[100px]"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                취소
              </Button>
              <Button onClick={() => handleSaveImage(true)}>
                저장
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* 새 이미지 추가 다이얼로그 */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>새 갤러리 이미지 추가</DialogTitle>
              <DialogDescription>
                새 갤러리 이미지 정보를 입력하세요.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="add-title" className="text-right text-sm font-medium">
                  제목
                </label>
                <Input
                  id="add-title"
                  value={editingImage.title || ''}
                  onChange={(e) => setEditingImage({...editingImage, title: e.target.value})}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="add-date" className="text-right text-sm font-medium">
                  날짜
                </label>
                <Input
                  id="add-date"
                  type="date"
                  value={editingImage.date || ''}
                  onChange={(e) => setEditingImage({...editingImage, date: e.target.value})}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="add-category" className="text-right text-sm font-medium">
                  카테고리
                </label>
                <select
                  id="add-category"
                  value={editingImage.category || 'event'}
                  onChange={(e) => setEditingImage({...editingImage, category: e.target.value as any})}
                  className="col-span-3 p-2 border rounded"
                >
                  <option value="lecture">강의/수업</option>
                  <option value="event">행사</option>
                  <option value="campus">캠퍼스</option>
                </select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="add-image-url" className="text-right text-sm font-medium">
                  이미지 URL
                </label>
                <Input
                  id="add-image-url"
                  value={editingImage.imageUrl || ''}
                  onChange={(e) => setEditingImage({...editingImage, imageUrl: e.target.value})}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="add-description" className="text-right text-sm font-medium">
                  설명
                </label>
                <textarea
                  id="add-description"
                  value={editingImage.description || ''}
                  onChange={(e) => setEditingImage({...editingImage, description: e.target.value})}
                  className="col-span-3 p-2 border rounded min-h-[100px]"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                취소
              </Button>
              <Button onClick={() => handleSaveImage(false)}>
                추가
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
