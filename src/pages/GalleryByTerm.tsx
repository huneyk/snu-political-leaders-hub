import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import { apiService } from '@/lib/apiService';
import './Gallery.css';

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

// 이미지 최적화를 위한 Lazy Image 컴포넌트
const LazyImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
  onError?: () => void;
}> = ({ src, alt, className = '', onError }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Intersection Observer를 사용한 Lazy Loading
  useEffect(() => {
    const currentImg = imgRef.current;
    
    if (currentImg) {
      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observerRef.current?.unobserve(currentImg);
          }
        },
        { threshold: 0.1, rootMargin: '50px' }
      );
      
      observerRef.current.observe(currentImg);
    }

    return () => {
      if (observerRef.current && currentImg) {
        observerRef.current.unobserve(currentImg);
      }
    };
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setIsError(true);
    onError?.();
  };

  // 빈 src인 경우 CSS placeholder 표시
  if (!src) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-2">
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
            <circle cx="9" cy="9" r="2"></circle>
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
          </svg>
          <span className="text-xs">이미지 없음</span>
        </div>
      </div>
    );
  }

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${className}`}>
      {/* 스켈레톤 로딩 */}
      {(!isLoaded && !isError) && (
        <div className="w-full h-full absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      
      {/* 에러 상태 */}
      {isError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 p-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 mb-2">
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
            <circle cx="9" cy="9" r="2"></circle>
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
          </svg>
          <p className="text-center text-gray-500 text-sm">이미지를 불러올 수 없습니다</p>
        </div>
      )}
      
      {/* 실제 이미지 */}
      {isInView && !isError && (
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
        />
      )}
    </div>
  );
};

// 갤러리 카드 컴포넌트
const GalleryCard: React.FC<{
  item: GalleryItem;
  onClick: () => void;
}> = ({ item, onClick }) => {
  // "/" 문자를 줄바꿈으로 변환하는 함수
  const formatDescription = (text: string) => {
    return text.replace(/\s*\/\s*/g, '\n');
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border-0 shadow-sm">
      <div 
        className="relative aspect-video bg-gray-100 cursor-pointer group"
        onClick={onClick}
      >
        <LazyImage
          src={item.imageUrl}
          alt={item.title}
          className="w-full h-full"
        />
        
        {/* 호버 오버레이 */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="bg-white p-3 rounded-full shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold truncate">{item.title}</h3>
          <Badge variant="outline" className="ml-2 flex-shrink-0">
            {item.term}기
          </Badge>
        </div>
        <p className="text-gray-600 mb-2 text-sm overflow-hidden whitespace-pre-wrap break-words" style={{
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          wordBreak: 'break-word'
        }}>{formatDescription(item.description)}</p>
        <p className="text-sm text-gray-500">
          {new Intl.DateTimeFormat('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }).format(new Date(item.date))}
        </p>
      </CardContent>
    </Card>
  );
};

const GalleryByTerm = () => {
  const { term } = useParams<{ term: string }>();
  const navigate = useNavigate();
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [displayedItems, setDisplayedItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [imageCache, setImageCache] = useState<Map<string, string>>(new Map());
  
  const ITEMS_PER_PAGE = 12; // 한 번에 표시할 이미지 수 제한

  // "/" 문자를 줄바꿈으로 변환하는 함수
  const formatDescription = (text: string) => {
    return text.replace(/\s*\/\s*/g, '\n');
  };

  useEffect(() => {
    if (!term) {
      navigate('/gallery');
      return;
    }
    
    // 기수 변경 시 이미지 캐시 클리어
    setImageCache(new Map());
    
    loadGalleryByTerm(term);
  }, [term, navigate]);

  const loadGalleryByTerm = async (termNumber: string) => {
    setLoading(true);
    setError(null);
    setCurrentPage(1);
    
    // 이전 데이터 즉시 클리어
    setGalleryItems([]);
    setDisplayedItems([]);
    
    try {
      console.log(`🎯 ${termNumber}기 갤러리 데이터 로드 시작`);
      
      // 헬스체크와 valid-terms API는 서버에서 구현되지 않음 - 직접 갤러리 데이터 로드로 검증
      console.log('📋 갤러리 데이터 직접 로드로 기수 검증 (헬스체크/valid-terms API 미구현)');
      
      // 전체 갤러리 데이터 로드 후 클라이언트에서 필터링 (서버 필터링 미구현)
      console.log(`📋 전체 갤러리 데이터 로드 후 ${termNumber}기 필터링 중...`);
      const allGalleryData = await apiService.getGallery();
      console.log(`📊 전체 갤러리 데이터 개수: ${Array.isArray(allGalleryData) ? allGalleryData.length : 0}`);
      
      // 디버깅: 전체 데이터의 기수 분포 확인
      if (Array.isArray(allGalleryData)) {
        const allTermDistribution = allGalleryData.reduce((acc, item) => {
          const termKey = String(item.term);
          acc[termKey] = (acc[termKey] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        console.log(`🔍 전체 데이터의 기수 분포:`, allTermDistribution);
      }
      
      // 클라이언트에서 기수별 필터링
      const metaData = Array.isArray(allGalleryData) 
        ? allGalleryData.filter(item => String(item.term) === termNumber)
        : [];
      console.log(`🎯 ${termNumber}기 필터링 결과: ${metaData.length}개 항목`);
      
      if (Array.isArray(metaData) && metaData.length > 0) {
        const formattedData = metaData.map(item => ({
          id: item._id,
          _id: item._id,
          title: item.title,
          description: item.description,
          imageUrl: item.imageUrl || '', // 기본 갤러리 API에는 이미지 URL 포함
          date: new Date(item.date).toISOString(),
          term: item.term
        }));
        
        // 디버깅: 필터링된 데이터의 기수 분포 확인
        const termDistribution = formattedData.reduce((acc, item) => {
          const termKey = String(item.term);
          acc[termKey] = (acc[termKey] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        console.log(`🔍 ${termNumber}기 요청 - 필터링된 데이터의 기수 분포:`, termDistribution);
        
        // 날짜순 정렬 (최신순)
        const sortedData = formattedData.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        setGalleryItems(sortedData);
        
        // 첫 페이지 표시 및 해당 이미지들 로드
        const firstPageItems = sortedData.slice(0, ITEMS_PER_PAGE);
        await loadImagesForItems(firstPageItems, termNumber);
        setCurrentPage(1);
        setHasMore(sortedData.length > ITEMS_PER_PAGE);
        
        console.log(`✅ ${termNumber}기 갤러리 메타데이터 로드 완료: ${sortedData.length}개 항목 (첫 페이지: ${firstPageItems.length}개 표시)`);
      } else {
        console.warn(`⚠️ ${termNumber}기에 해당하는 데이터가 없습니다`);
        setError(`제${termNumber}기의 갤러리 데이터가 없습니다.`);
        setGalleryItems([]);
        setDisplayedItems([]);
      }
      
    } catch (err: any) {
      console.error(`❌ ${termNumber}기 갤러리 로드 실패:`, err);
      
      // 환경 정보 로깅
      console.error('🌐 현재 환경:', import.meta.env.MODE);
      console.error('🔗 API URL:', import.meta.env.MODE === 'production' 
        ? 'https://snu-plp-hub-server.onrender.com/api' 
        : 'http://localhost:5001/api');
      
      // Axios 에러 세부 정보
      if (err.isAxiosError) {
        console.error('🔍 GalleryByTerm 페이지 Axios 에러 세부정보:', {
          term: termNumber,
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data,
          headers: err.response?.headers,
          config: {
            url: err.config?.url,
            method: err.config?.method,
            baseURL: err.config?.baseURL,
            timeout: err.config?.timeout
          }
        });
        
        // HTML 응답 감지
        if (typeof err.response?.data === 'string' && err.response.data.includes('<!DOCTYPE html>')) {
          console.error('🚨 GalleryByTerm 페이지: 서버가 HTML 페이지를 반환했습니다 - 라우팅 문제일 가능성');
        }
      }
      
      // 404 에러인 경우 (존재하지 않는 기수)
      if (err?.response?.status === 404) {
        const errorData = err?.response?.data;
        if (errorData?.validTerms) {
          setError(`제${termNumber}기는 존재하지 않는 기수입니다. 유효한 기수: ${errorData.validTerms.join(', ')}`);
        } else {
          setError(`제${termNumber}기에 해당하는 갤러리가 없습니다.`);
        }
      } else if (err?.response?.status === 500) {
        setError(`서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요. (제${termNumber}기)`);
      } else if (err.code === 'NETWORK_ERROR' || err.message.includes('Network Error')) {
        setError(`네트워크 연결에 문제가 있습니다. 인터넷 연결을 확인해주세요. (제${termNumber}기)`);
      } else {
        setError(`갤러리 로드 중 오류가 발생했습니다: ${err.response?.status || err.message} (제${termNumber}기)`);
      }
      
      // 에러 발생 시 반드시 데이터 클리어
      setGalleryItems([]);
      setDisplayedItems([]);
      setImageCache(new Map());
    } finally {
      setLoading(false);
    }
  };

  // 특정 아이템들의 이미지를 로드하는 함수
  const loadImagesForItems = async (items: GalleryItem[], termNumber: string) => {
    if (!term || term !== termNumber) {
      console.warn(`⚠️ 기수 불일치: 현재 기수(${term}) != 요청 기수(${termNumber})`);
      return;
    }
    
    try {
      // 요청된 아이템들이 모두 올바른 기수인지 검증
      const invalidItems = items.filter(item => item.term && String(item.term) !== String(termNumber));
      if (invalidItems.length > 0) {
        console.warn(`⚠️ 잘못된 기수의 아이템 발견:`, invalidItems.map(item => `${item.title} (${item.term}기)`));
        return;
      }
      
      // 캐시되지 않은 아이템들만 필터링
      const uncachedItems = items.filter(item => !imageCache.has(item._id!));
      
      if (uncachedItems.length === 0) {
        // 모든 이미지가 캐시되어 있으면 캐시에서 가져오기
        const itemsWithCachedImages = items.map(item => ({
          ...item,
          imageUrl: imageCache.get(item._id!) || ''
        }));
        setDisplayedItems(prev => {
          const existingIds = new Set(prev.map(p => p._id));
          const newItems = itemsWithCachedImages.filter(item => !existingIds.has(item._id));
          return [...prev, ...newItems];
        });
        return;
      }
      
      console.log(`🖼️ ${termNumber}기 이미지 ${uncachedItems.length}개 로드 중...`);
      
      // 전체 갤러리 데이터를 가져온 후 클라이언트에서 필터링 (서버 필터링 미구현)
      const allGalleryData = await apiService.getGallery();
      
      // 디버깅: 이미지 로드 시 전체 데이터의 기수 분포 확인
      if (Array.isArray(allGalleryData)) {
        const allTermDistribution = allGalleryData.reduce((acc, item) => {
          const termKey = String(item.term);
          acc[termKey] = (acc[termKey] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        console.log(`🔍 이미지 로드 - 전체 데이터의 기수 분포:`, allTermDistribution);
      }
      
      const fullData = Array.isArray(allGalleryData) 
        ? allGalleryData.filter(item => String(item.term) === termNumber)
        : [];
      
      console.log(`📊 전체 데이터에서 ${termNumber}기 필터링: ${fullData.length}개`);
      
      if (Array.isArray(fullData) && fullData.length > 0) {
        // 새로운 이미지 캐시 업데이트 (해당 기수만)
        const newCache = new Map(imageCache);
        fullData.forEach(item => {
          // 기수 비교 시 둘 다 문자열로 변환해서 비교
          if (item._id && item.imageUrl && String(item.term) === String(termNumber)) {
            newCache.set(item._id, item.imageUrl);
          }
        });
        setImageCache(newCache);
        
        // 요청된 아이템들에 이미지 URL 적용
        const itemsWithImages = items.map(item => ({
          ...item,
          imageUrl: newCache.get(item._id!) || ''
        }));
        
        setDisplayedItems(prev => {
          const existingIds = new Set(prev.map(p => p._id));
          const newItems = itemsWithImages.filter(item => !existingIds.has(item._id));
          return [...prev, ...newItems];
        });
        
        console.log(`✅ ${termNumber}기 이미지 로드 완료: ${itemsWithImages.length}개`);
      } else {
        console.warn(`⚠️ ${termNumber}기의 이미지 데이터가 없습니다`);
      }
    } catch (error) {
      console.error('이미지 로드 실패:', error);
      // 에러 시에도 아이템들을 표시 (이미지 없이)
      setDisplayedItems(prev => {
        const existingIds = new Set(prev.map(p => p._id));
        const newItems = items.filter(item => !existingIds.has(item._id));
        return [...prev, ...newItems];
      });
    }
  };

  // 더 많은 이미지 로드
  const loadMore = async () => {
    if (!loadingMore && hasMore && term) {
      setLoadingMore(true);
      
      const nextPage = currentPage + 1;
      const startIndex = (nextPage - 1) * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      const nextPageItems = galleryItems.slice(startIndex, endIndex);
      
      // 다음 페이지 이미지들 로드
      await loadImagesForItems(nextPageItems, term);
      setCurrentPage(nextPage);
      setHasMore(endIndex < galleryItems.length);
      setLoadingMore(false);
      
      console.log(`✅ 페이지 ${nextPage} 로드 완료: ${nextPageItems.length}개 추가`);
    }
  };

  const handleBackToGallery = () => {
    navigate('/gallery');
  };

  if (loading) {
    return (
      <div className="gallery-page">
        <Header />
        <section className="pt-24 pb-16">
          <div className="container mx-auto py-8 flex justify-center items-center min-h-[50vh]">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mainBlue mb-4"></div>
              <p className="text-lg">제 {term}기 갤러리 로딩 중...</p>
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
              <div className="mt-4 flex gap-2">
                <Button 
                  onClick={() => loadGalleryByTerm(term!)} 
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  다시 시도
                </Button>
                <Button 
                  onClick={handleBackToGallery}
                  variant="outline"
                >
                  갤러리 메인으로
                </Button>
              </div>
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
      
      {/* 상단 배너 */}
      <section className="pt-28 pb-16 bg-mainBlue text-white">
        <div className="main-container">
          <div className="flex items-center gap-4 mb-4">
            <Button
              onClick={handleBackToGallery}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10 p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-3xl md:text-4xl font-bold">제 {term}기 갤러리</h1>
          </div>
          <p className="text-lg opacity-90">
            정치지도자 과정 제 {term}기의 다양한 활동들을 만나보세요
          </p>
        </div>
      </section>
      
      <main className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            
            {/* 기수 정보 */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex items-center bg-mainBlue text-white px-6 py-3 rounded-r-full">
                    <span className="text-2xl font-bold">{term}</span>
                    <span className="text-lg ml-1">기</span>
                  </div>
                  <div className="h-0.5 bg-mainBlue/30 flex-grow ml-4"></div>
                </div>
                <div className="text-sm text-gray-600">
                  총 {galleryItems.length}개의 이미지
                </div>
              </div>
            </div>

            {/* 갤러리 그리드 */}
            {displayedItems.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayedItems.map((item) => (
                    <GalleryCard
                      key={item.id || item._id}
                      item={item}
                      onClick={() => setSelectedImage(item)}
                    />
                  ))}
                </div>
                
                {/* 더 보기 버튼 */}
                {hasMore && (
                  <div className="text-center mt-12">
                    <Button
                      onClick={loadMore}
                      disabled={loadingMore}
                      className="bg-mainBlue hover:bg-blue-700 text-white px-8 py-3 rounded-full"
                    >
                      {loadingMore ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          로딩 중...
                        </>
                      ) : (
                        <>
                          더 보기 ({galleryItems.length - displayedItems.length}개 남음)
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <div className="text-gray-400 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4">
                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
                    <circle cx="9" cy="9" r="2"></circle>
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">제 {term}기 갤러리가 비어있습니다</h3>
                <p className="text-gray-600 mb-4">
                  해당 기수에 등록된 이미지가 없습니다.
                </p>
                <Button onClick={handleBackToGallery} className="bg-mainBlue hover:bg-blue-700 text-white">
                  다른 기수 보기
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />

      {/* 이미지 라이트박스 */}
      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="max-w-5xl p-0 overflow-hidden bg-transparent border-none">
          <div className="relative bg-white rounded-lg overflow-hidden">
            <DialogClose className="absolute right-4 top-4 z-10 bg-white rounded-full p-2 opacity-70 hover:opacity-100 shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </DialogClose>
            
            {selectedImage && (
              <div className="flex flex-col">
                <div className="relative bg-gray-100" style={{ maxHeight: '80vh' }}>
                  <img 
                    src={selectedImage.imageUrl} 
                    alt={selectedImage.title}
                    className="w-full object-contain max-h-[80vh]"
                    style={{ maxWidth: '1080px', margin: '0 auto' }}
                  />
                </div>
                <div className="bg-white p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-2xl font-bold">{selectedImage.title}</h3>
                    <Badge variant="outline" className="text-base px-3 py-1">
                      {selectedImage.term}기
                    </Badge>
                  </div>
                  <p className="text-gray-700 mb-3 text-lg whitespace-pre-wrap break-words">{formatDescription(selectedImage.description)}</p>
                  <p className="text-sm text-gray-500">
                    {new Intl.DateTimeFormat('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }).format(new Date(selectedImage.date))}
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

export default GalleryByTerm; 