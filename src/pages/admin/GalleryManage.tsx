
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
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
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    date: '',
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
            title: '개강식',
            description: '제23기 정치지도자 과정 개강식 현장',
            imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87',
            date: '2024-03-02',
          },
          {
            id: '2',
            title: '특별 강연',
            description: '정치와 민주주의의 미래 특별 강연',
            imageUrl: 'https://images.unsplash.com/photo-1588492069485-d05b56b2831d',
            date: '2024-03-15',
          },
          {
            id: '3',
            title: '워크숍',
            description: '제주도 연수원에서의 워크숍',
            imageUrl: 'https://images.unsplash.com/photo-1495055154266-57bbdeada43e',
            date: '2024-04-10',
          },
        ];
        localStorage.setItem('galleryItems', JSON.stringify(sampleItems));
        setGalleryItems(sampleItems);
      }
    };
    
    loadGalleryItems();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleAddItem = () => {
    // 필수 필드 확인
    if (!formData.title || !formData.imageUrl) {
      toast({
        title: "입력 오류",
        description: "제목과 이미지 URL은 필수 입력 항목입니다.",
        variant: "destructive",
      });
      return;
    }

    const newItem = {
      id: Date.now().toString(),
      ...formData,
      date: formData.date || new Date().toISOString().split('T')[0],
    };

    const updatedItems = [...galleryItems, newItem];
    localStorage.setItem('galleryItems', JSON.stringify(updatedItems));
    setGalleryItems(updatedItems);
    setIsAddDialogOpen(false);
    
    // 폼 데이터 초기화
    setFormData({
      title: '',
      description: '',
      imageUrl: '',
      date: '',
    });
    
    toast({
      title: "갤러리 추가",
      description: "새 갤러리 항목이 성공적으로 추가되었습니다.",
    });
  };

  const handleEditClick = (item: GalleryItem) => {
    setSelectedItem(item);
    setFormData({
      title: item.title,
      description: item.description,
      imageUrl: item.imageUrl,
      date: item.date,
    });
    setIsEditDialogOpen(true);
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
      title: "갤러리 수정",
      description: "갤러리 항목이 성공적으로 수정되었습니다.",
    });
  };

  const handleDeleteItem = (id: string) => {
    if (window.confirm('정말로 이 갤러리 항목을 삭제하시겠습니까?')) {
      const updatedItems = galleryItems.filter(item => item.id !== id);
      localStorage.setItem('galleryItems', JSON.stringify(updatedItems));
      setGalleryItems(updatedItems);
      
      toast({
        title: "갤러리 삭제",
        description: "갤러리 항목이 성공적으로 삭제되었습니다.",
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

  // 이미지 미리보기 컴포넌트
  const ImagePreview = ({ url }: { url: string }) => (
    <div className="w-20 h-20 overflow-hidden rounded-md bg-gray-100 flex items-center justify-center">
      {url ? (
        <img src={url} alt="Preview" className="w-full h-full object-cover" />
      ) : (
        <span className="text-gray-400 text-xs text-center">이미지 없음</span>
      )}
    </div>
  );

  return (
    <>
      <Header />
      <div className="container mx-auto py-20 px-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-2xl font-bold text-mainBlue">갤러리 관리</CardTitle>
            <div className="flex space-x-2">
              <Button onClick={() => navigate('/admin')}>관리자 홈으로</Button>
              <Button onClick={() => {
                setFormData({
                  title: '',
                  description: '',
                  imageUrl: '',
                  date: new Date().toISOString().split('T')[0],
                });
                setIsAddDialogOpen(true);
              }}>
                갤러리 추가
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>이미지</TableHead>
                    <TableHead>제목</TableHead>
                    <TableHead>날짜</TableHead>
                    <TableHead>설명</TableHead>
                    <TableHead>관리</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {galleryItems.length > 0 ? (
                    galleryItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <ImagePreview url={item.imageUrl} />
                        </TableCell>
                        <TableCell className="font-medium">{item.title}</TableCell>
                        <TableCell>{formatDate(item.date)}</TableCell>
                        <TableCell className="max-w-xs truncate">{item.description}</TableCell>
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
                              onClick={() => handleDeleteItem(item.id)}
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
                        등록된 갤러리 항목이 없습니다.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* 갤러리 추가 다이얼로그 */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>새 갤러리 항목 추가</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">제목 *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="갤러리 제목을 입력하세요"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="imageUrl">이미지 URL *</Label>
                <Input
                  id="imageUrl"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  placeholder="이미지 URL을 입력하세요"
                />
                {formData.imageUrl && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 mb-1">미리보기:</p>
                    <ImagePreview url={formData.imageUrl} />
                  </div>
                )}
              </div>
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
                <Label htmlFor="description">설명</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="갤러리 항목에 대한 설명을 입력하세요"
                  rows={3}
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

        {/* 갤러리 수정 다이얼로그 */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>갤러리 항목 수정</DialogTitle>
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
              <div className="space-y-2">
                <Label htmlFor="edit-imageUrl">이미지 URL *</Label>
                <Input
                  id="edit-imageUrl"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                />
                {formData.imageUrl && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 mb-1">미리보기:</p>
                    <ImagePreview url={formData.imageUrl} />
                  </div>
                )}
              </div>
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
                <Label htmlFor="edit-description">설명</Label>
                <Textarea
                  id="edit-description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
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
