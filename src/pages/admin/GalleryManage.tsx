
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

interface GalleryItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  date: string;
}

const GalleryManage = () => {
  const navigate = useNavigate();
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
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

  // 갤러리 데이터 로드
  useEffect(() => {
    const loadGalleryItems = () => {
      const storedItems = localStorage.getItem('galleryItems');
      if (storedItems) {
        setGalleryItems(JSON.parse(storedItems));
      } else {
        // 샘플 데이터
        const sampleItems = [
          {
            id: '1',
            title: '입학식',
            description: '2023년 봄학기 입학식 현장',
            imageUrl: 'https://placehold.co/600x400?text=입학식',
            date: new Date(2023, 2, 2).toISOString(),
          },
          {
            id: '2',
            title: '특별 강연',
            description: '국제 정치 특별 강연 세미나',
            imageUrl: 'https://placehold.co/600x400?text=특별강연',
            date: new Date(2023, 3, 15).toISOString(),
          },
          {
            id: '3',
            title: '워크샵',
            description: '리더십 개발 워크샵',
            imageUrl: 'https://placehold.co/600x400?text=워크샵',
            date: new Date(2023, 4, 10).toISOString(),
          },
        ];
        localStorage.setItem('galleryItems', JSON.stringify(sampleItems));
        setGalleryItems(sampleItems);
      }
    };
    
    loadGalleryItems();
  }, []);

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
    });
    setIsAddDialogOpen(true);
  };

  const handleEditClick = (item: GalleryItem) => {
    setSelectedItem(item);
    setFormData({
      title: item.title,
      description: item.description,
      imageUrl: item.imageUrl,
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

  const handleAddItem = () => {
    const newItem = {
      id: Date.now().toString(),
      ...formData,
      date: new Date().toISOString(),
    };
    
    const updatedItems = [...galleryItems, newItem];
    localStorage.setItem('galleryItems', JSON.stringify(updatedItems));
    setGalleryItems(updatedItems);
    setIsAddDialogOpen(false);
    
    toast({
      title: "갤러리 항목 추가",
      description: "새로운 갤러리 항목이 성공적으로 추가되었습니다.",
    });
  };

  const handleSaveChanges = () => {
    if (!selectedItem) return;
    
    const updatedItems = galleryItems.map((item) =>
      item.id === selectedItem.id
        ? { ...item, ...formData }
        : item
    );
    
    localStorage.setItem('galleryItems', JSON.stringify(updatedItems));
    setGalleryItems(updatedItems);
    setIsEditDialogOpen(false);
    
    toast({
      title: "갤러리 항목 수정",
      description: "갤러리 항목이 성공적으로 수정되었습니다.",
    });
  };

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
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <Input
                type="text"
                placeholder="제목 또는 설명으로 검색"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {filteredItems.map((item) => (
                <div key={item.id} className="border rounded-md overflow-hidden shadow-sm">
                  <div className="aspect-w-16 aspect-h-9 w-full">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="object-cover w-full h-40"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{formatDate(item.date)}</p>
                    <p className="text-sm mt-2">{item.description}</p>
                    <div className="flex mt-4 space-x-2">
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
                        onClick={() => handleDeleteItem(item.id)}
                      >
                        삭제
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredItems.length === 0 && (
                <div className="col-span-full text-center py-8">
                  갤러리 항목이 없거나 검색 결과가 없습니다.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 갤러리 항목 추가 다이얼로그 */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>새 갤러리 항목 추가</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">제목</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="갤러리 항목 제목을 입력하세요"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="imageUrl">이미지 URL</Label>
                <Input
                  id="imageUrl"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  placeholder="이미지 URL을 입력하세요"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">설명</Label>
                <Input
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="갤러리 항목에 대한 설명을 입력하세요"
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">취소</Button>
              </DialogClose>
              <Button onClick={handleAddItem}>추가</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 갤러리 항목 수정 다이얼로그 */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>갤러리 항목 수정</DialogTitle>
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
                <Label htmlFor="edit-imageUrl">이미지 URL</Label>
                <Input
                  id="edit-imageUrl"
                  name="imageUrl"
                  value={formData.imageUrl}
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

export default GalleryManage;
