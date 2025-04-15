import { useEffect, useState, useMemo } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog';
import './Gallery.css'; // Import CSS file for gallery styles
import { apiService } from '@/lib/apiService';

// 갤러리 아이템 인터페이스
interface GalleryItem {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  imageUrl: string;
  date: string;
  term: string;
}

// 하드코딩된 갤러리 데이터 (API가 실패할 경우의 폴백으로 사용)
const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: '1',
    title: '입학식',
    description: '2023년 봄학기 입학식 현장',
    imageUrl: 'https://via.placeholder.com/600x400?text=입학식',
    date: '2023-03-02',
    term: '1',
  },
  {
    id: '2',
    title: '특별 강연',
    description: '국제 정치 특별 강연 세미나',
    imageUrl: 'https://via.placeholder.com/600x400?text=특별강연',
    date: '2023-04-15',
    term: '1',
  },
  {
    id: '3',
    title: '워크샵',
    description: '리더십 개발 워크샵',
    imageUrl: 'https://via.placeholder.com/600x400?text=워크샵',
    date: '2023-05-10',
    term: '2',
  },
  {
    id: '4',
    title: '졸업식',
    description: '2023년 1기 졸업식',
    imageUrl: 'https://via.placeholder.com/600x400?text=졸업식',
    date: '2023-08-20',
    term: '1',
  },
  {
    id: '5',
    title: '해외 연수',
    description: '미국 워싱턴 DC 방문',
    imageUrl: 'https://via.placeholder.com/600x400?text=해외연수',
    date: '2023-06-15',
    term: '2',
  },
  {
    id: '6',
    title: '특강',
    description: '정치 리더십 특강',
    imageUrl: 'https://via.placeholder.com/600x400?text=특강',
    date: '2023-07-05',
    term: '2',
  }
];

const Gallery = () => {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [loading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugMode, setDebugMode] = useState(false);
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);

  useEffect(() => {
    // URL에서 debug 파라미터 확인
    const urlParams = new URLSearchParams(window.location.search);
    const debug = urlParams.get('debug');
    setDebugMode(debug === 'true');

    console.log('Gallery useEffect 실행');
    window.scrollTo(0, 0);
    
    // 갤러리 데이터 로드
    loadGalleryData();
    
    // 디버깅을 위한 전역 객체 설정
    (window as any).galleryDebug = {
      items: galleryItems,
      component: 'Gallery',
      reload: loadGalleryData
    };
  }, []);
  
  const loadGalleryData = async () => {
    setIsLoading(true);
    try {
      // MongoDB API를 통해 갤러리 데이터 가져오기
      const data = await apiService.getGallery();
      
      if (Array.isArray(data) && data.length > 0) {
        console.log('갤러리 데이터 로드 성공:', data.length, '개 항목');
        
        // MongoDB에서 가져온 데이터를 필요한 형식으로 변환
        const formattedData = data.map(item => ({
          id: item._id,
          _id: item._id,
          title: item.title,
          description: item.description,
          imageUrl: item.imageUrl,
          date: new Date(item.date).toISOString(),
          term: item.term
        }));
        
        // 날짜 기준 내림차순 정렬 (최신순)
        const sortedItems = formattedData.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        // 로컬 스토리지 저장 시 할당량 초과 방지
        try {
          // 메타데이터만 저장하여 용량 절약 (이미지 데이터 제외)
          const storageData = sortedItems.map(item => ({
            id: item.id,
            _id: item._id,
            title: item.title,
            description: item.description,
            // 이미지 URL만 저장하고 Base64 데이터는 저장하지 않음
            imageUrl: item.imageUrl && item.imageUrl.startsWith('data:') 
              ? '[BASE64_IMAGE]' // 플레이스홀더로 대체
              : item.imageUrl,
            date: item.date,
            term: item.term
          }));
          
          // 저장할 데이터가 너무 크면 최근 항목 20개만 저장
          const limitedData = storageData.length > 20 
            ? storageData.slice(0, 20) 
            : storageData;
            
          localStorage.setItem('gallery-data', JSON.stringify(limitedData));
          console.log(`로컬 스토리지에 ${limitedData.length}개 항목 캐싱 (용량 최적화)`);
        } catch (storageError) {
          console.warn('로컬 스토리지 캐싱 실패 (할당량 초과):', storageError);
          // 에러는 무시하고 계속 진행 - 로컬 스토리지 캐싱은 선택적 기능
        }
        
        console.log('날짜순 정렬 완료 (최신순)');
        setGalleryItems(sortedItems);
        setError(null);
      } else {
        console.warn('갤러리 데이터가 비어있거나 배열이 아닙니다.');
        // 로컬 스토리지에서 데이터 로드 시도
        loadFromLocalStorage();
      }
    } catch (err) {
      console.error('갤러리 데이터 로드 중 오류:', err);
      // 로컬 스토리지에서 데이터 로드 시도
      loadFromLocalStorage();
    } finally {
      setIsLoading(false);
    }
  };
  
  // 로컬 스토리지에서 데이터 로드
  const loadFromLocalStorage = () => {
    try {
      const savedData = localStorage.getItem('gallery-data');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        console.log('로컬 스토리지에서 갤러리 데이터 로드 성공:', parsedData.length, '개 항목');
        setGalleryItems(parsedData);
        setError(null);
      } else {
        console.warn('로컬 스토리지에 갤러리 데이터가 없습니다.');
        setGalleryItems(GALLERY_ITEMS);
        setError('갤러리 데이터를 불러올 수 없습니다.');
      }
    } catch (err) {
      console.error('로컬 스토리지에서 갤러리 데이터 로드 중 오류:', err);
      setGalleryItems(GALLERY_ITEMS);
      setError('갤러리 데이터를 불러올 수 없습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  // 디버그 기능: 갤러리 데이터 확인
  const checkGalleryData = () => {
    console.log('현재 갤러리 데이터:', galleryItems);
  };

  // 디버그 기능: 갤러리 데이터 새로고침
  const refreshGalleryData = () => {
    loadGalleryData();
  };

  // 전역 디버그 함수 등록
  useEffect(() => {
    if (debugMode) {
      (window as any).checkGalleryData = checkGalleryData;
      (window as any).refreshGalleryData = refreshGalleryData;
    }

    return () => {
      if ((window as any).checkGalleryData) {
        delete (window as any).checkGalleryData;
      }
      if ((window as any).refreshGalleryData) {
        delete (window as any).refreshGalleryData;
      }
    };
  }, [debugMode]);

  // 기수별로 그룹화
  const groupedByTerm = useMemo(() => {
    const grouped: Record<string, GalleryItem[]> = {};
    
    galleryItems.forEach(item => {
      if (!grouped[item.term]) {
        grouped[item.term] = [];
      }
      grouped[item.term].push(item);
    });
    
    // 각 기수 내에서 날짜순으로 정렬 (최신순)
    Object.keys(grouped).forEach(term => {
      grouped[term].sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
    });
    
    return grouped;
  }, [galleryItems]);

  // 기수 내림차순으로 정렬된 기수 목록
  const sortedTerms = useMemo(() => {
    return Object.keys(groupedByTerm).sort((a, b) => Number(b) - Number(a));
  }, [groupedByTerm]);

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    // mm/dd/yyyy 형식으로 표시
    return new Intl.DateTimeFormat('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    }).format(date);
  };
  
  console.log('Gallery 렌더링 반환');
    
  if (loading) {
    return (
      <div className="gallery-page">
        <Header />
        <section className="pt-24 pb-16">
          <div className="container mx-auto py-8 flex justify-center items-center min-h-[50vh]">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mainBlue mb-4"></div>
              <p className="text-lg">갤러리 로딩 중...</p>
            </div>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="gallery-page">
        <Header />
        <section className="pt-24 pb-16">
          <div className="container mx-auto py-8">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">오류!</strong>
              <span className="block sm:inline"> {error}</span>
            </div>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  if (galleryItems.length === 0) {
    return (
      <div className="gallery-page">
        <Header />
        <section className="pt-24 pb-16">
          <div className="container mx-auto py-8">
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold mb-4">갤러리 항목이 없습니다</h2>
              <p className="text-gray-600">
                아직 갤러리에 등록된 항목이 없습니다. 관리자 페이지에서 항목을 추가해주세요.
              </p>
              {debugMode && (
                <div className="mt-4 p-4 border border-gray-300 rounded-md inline-block">
                  <h3 className="font-bold mb-2">디버그 메뉴</h3>
                  <div className="flex gap-2 justify-center">
                    <Button onClick={checkGalleryData} variant="outline" size="sm">
                      데이터 확인
                    </Button>
                    <Button onClick={refreshGalleryData} variant="outline" size="sm">
                      새로고침
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="gallery-page">
      <Header />
      
      {/* 상단 배너/띠 - 다른 페이지와 일관된 스타일 */}
      <section className="pt-28 pb-16 bg-mainBlue text-white">
        <div className="main-container">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">갤러리</h1>

        </div>
      </section>
      
      <main className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {debugMode && (
              <div className="mb-6 p-4 border border-gray-300 rounded-md">
                <h3 className="font-bold mb-2">디버그 메뉴</h3>
                <div className="flex gap-2">
                  <Button onClick={checkGalleryData} variant="outline" size="sm">
                    데이터 확인
                  </Button>
                  <Button onClick={refreshGalleryData} variant="outline" size="sm">
                    새로고침
                  </Button>
                </div>
              </div>
            )}

            {sortedTerms.map(term => (
              <div key={term} className="mb-12">
                <div className="flex items-center mb-6">
                  <div className="flex items-center bg-mainBlue text-white px-4 py-2 rounded-r-full">
                    <span className="text-2xl font-bold">{term}</span>
                    <span className="text-lg ml-1">기</span>
                  </div>
                  <div className="h-0.5 bg-mainBlue/30 flex-grow ml-4"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {groupedByTerm[term].map((item) => (
                    <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow border-0 shadow-sm">
                      <div 
                        className="relative aspect-video bg-gray-100 cursor-pointer"
                        onClick={() => setSelectedImage(item)}
                      >
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.error(`이미지 로드 실패: ${item.imageUrl}`);
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            
                            // 부모 요소에 에러 UI 추가
                            const parent = target.parentElement;
                            if (parent) {
                              const errorDiv = document.createElement('div');
                              errorDiv.className = 'absolute inset-0 flex flex-col items-center justify-center bg-gray-100 p-4';
                              errorDiv.innerHTML = `
                                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" class="text-gray-400 mb-2">
                                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
                                  <circle cx="9" cy="9" r="2"></circle>
                                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
                                </svg>
                                <p class="text-center text-gray-500">이미지를 불러올 수 없습니다</p>
                              `;
                              parent.appendChild(errorDiv);
                            }
                          }}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
                          <div className="bg-white p-2 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700">
                              <circle cx="11" cy="11" r="8"></circle>
                              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                          </div>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-xl font-bold">{item.title}</h3>
                          <Badge variant="outline" className="ml-2">
                            {item.term}기
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-2">{item.description}</p>
                        <p className="text-sm text-gray-500">
                          {formatDate(item.date)}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />

      {/* 이미지 라이트박스 */}
      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="max-w-5xl p-0 overflow-hidden bg-transparent border-none">
          <div className="relative bg-white rounded-lg overflow-hidden">
            <DialogClose className="absolute right-4 top-4 z-10 bg-white rounded-full p-1 opacity-70 hover:opacity-100">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </DialogClose>
            
            {selectedImage && (
              <div className="flex flex-col">
                <div className="relative" style={{ maxHeight: '80vh' }}>
                  <img 
                    src={selectedImage.imageUrl} 
                    alt={selectedImage.title}
                    className="w-full object-contain max-h-[80vh]"
                    style={{ maxWidth: '1080px', margin: '0 auto' }}
                  />
                </div>
                <div className="bg-white p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold">{selectedImage.title}</h3>
                    <Badge variant="outline">
                      {selectedImage.term}기
                    </Badge>
                  </div>
                  <p className="text-gray-700 mb-2">{selectedImage.description}</p>
                  <p className="text-sm text-gray-500">
                    {formatDate(selectedImage.date)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Gallery;
