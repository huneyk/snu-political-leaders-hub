import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
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
    description: '2024년 봄학기 입학식 현장',
    imageUrl: 'https://via.placeholder.com/600x400?text=입학식',
    date: '2024-03-02',
    term: '3',
  },
  {
    id: '2',
    title: '특별 강연',
    description: '국제 정치 특별 강연 세미나',
    imageUrl: 'https://via.placeholder.com/600x400?text=특별강연',
    date: '2024-04-15',
    term: '3',
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

// 이미지 최적화를 위한 Lazy Image 컴포넌트
const LazyImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
  onError?: () => void;
  placeholder?: string;
  shouldLoad?: boolean; // 조건부 로딩을 위한 prop 추가
}> = ({ src, alt, className = '', onError, placeholder, shouldLoad = true }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasStartedLoading, setHasStartedLoading] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Intersection Observer를 사용한 Lazy Loading
  useEffect(() => {
    const currentImg = imgRef.current;
    
    if (currentImg && shouldLoad) {
      // Base64 이미지 여부에 따라 다른 설정 적용
      const isBase64 = src.startsWith('data:image');
      
      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            console.log(`🎯 이미지 뷰포트 진입: ${isBase64 ? 'Base64' : 'URL'} 이미지`);
            setIsInView(true);
            observerRef.current?.unobserve(currentImg);
          }
        },
        { 
          threshold: isBase64 ? 0.05 : 0.1, // Base64 이미지는 더 빨리 로드
          rootMargin: isBase64 ? '100px' : '50px' // Base64 이미지는 더 일찍 준비
        }
      );
      
      observerRef.current.observe(currentImg);
    }

    return () => {
      if (observerRef.current && currentImg) {
        observerRef.current.unobserve(currentImg);
      }
    };
  }, [shouldLoad, src]);

  // shouldLoad가 변경되면 로딩 상태 초기화
  useEffect(() => {
    if (!shouldLoad) {
      setIsLoaded(false);
      setIsError(false);
      setIsInView(false);
      setHasStartedLoading(false);
    }
  }, [shouldLoad]);

  const handleLoad = () => {
    const isBase64 = src.startsWith('data:image');
    console.log(`✅ 이미지 로드 성공: ${isBase64 ? 'Base64' : 'URL'} 이미지`);
    setIsLoaded(true);
  };

  const handleError = () => {
    const isBase64 = src.startsWith('data:image');
    console.error(`❌ 이미지 로드 실패: ${isBase64 ? 'Base64' : 'URL'} 이미지`);
    if (isBase64) {
      console.error(`🔍 Base64 이미지 크기: ${(src.length / 1024).toFixed(1)}KB`);
    }
    setIsError(true);
    onError?.();
  };

  // WebP 지원 확인 및 최적화된 이미지 URL 생성
  const getOptimizedImageUrl = (originalUrl: string) => {
    if (originalUrl.includes('placeholder.com')) {
      return originalUrl;
    }
    
    // Base64 이미지 크기 체크 및 최적화
    if (originalUrl.startsWith('data:image')) {
      const base64Size = originalUrl.length;
      console.log(`📊 Base64 이미지 크기: ${(base64Size / 1024).toFixed(1)}KB`);
      
      // 300KB 이상의 Base64 이미지는 압축 처리
      if (base64Size > 300000) {
        console.warn(`⚠️ 큰 Base64 이미지 감지: ${(base64Size / 1024).toFixed(1)}KB`);
        // 큰 Base64 이미지는 그대로 반환하지만 로딩 방식 조정
        return originalUrl;
      }
    }
    
    // 실제 이미지 서비스에서는 WebP 변환이나 압축 파라미터를 추가할 수 있음
    // 예: Cloudinary, ImageKit 등
    return originalUrl;
  };

  // 실제 이미지 로드 여부 결정
  const shouldActuallyLoad = shouldLoad && isInView;

  // 로딩 상태 추적
  useEffect(() => {
    if (shouldActuallyLoad && !hasStartedLoading) {
      setHasStartedLoading(true);
    }
  }, [shouldActuallyLoad, hasStartedLoading]);

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${className}`}>
      {/* 스켈레톤 로딩 - shouldLoad가 false이면 회색 배경만 표시 */}
      {(!shouldLoad || (!isLoaded && !isError && shouldLoad)) && (
        <div className={`w-full h-full absolute inset-0 ${
          shouldLoad ? 'bg-gray-200 animate-pulse' : 'bg-gray-100'
        }`}>
          {!shouldLoad && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-gray-400 text-sm">이미지 대기 중...</div>
            </div>
          )}
        </div>
      )}
      
      {/* 에러 상태 */}
      {isError && shouldLoad && (
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
      {shouldActuallyLoad && !isError && (
        <img
          src={getOptimizedImageUrl(src)}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
          // Base64 이미지에 대한 추가 최적화
          style={{
            imageRendering: src.startsWith('data:image') ? 'high-quality' : 'auto',
            backfaceVisibility: 'hidden',
            transform: 'translateZ(0)'
          } as React.CSSProperties}
        />
      )}
    </div>
  );
};

// 갤러리 카드 컴포넌트
const GalleryCard: React.FC<{
  item: GalleryItem;
  onClick: () => void;
  shouldLoadImage?: boolean; // 이미지 로딩 제어를 위한 prop 추가
}> = ({ item, onClick, shouldLoadImage = true }) => {
  const [imageError, setImageError] = useState(false);

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
          onError={() => setImageError(true)}
          shouldLoad={shouldLoadImage}
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
        <p className="text-gray-600 mb-2 text-sm overflow-hidden" style={{
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical'
        }}>{item.description}</p>
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

// 로딩 모달 컴포넌트
const LoadingModal: React.FC<{
  isOpen: boolean;
  loadingTerm: string;
  onClose: () => void;
}> = ({ isOpen, loadingTerm, onClose }) => {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('이미지 데이터 준비 중...');

  useEffect(() => {
    if (isOpen) {
      // 로딩 시작 시 초기화
      setProgress(0);
      setLoadingText('이미지 데이터 준비 중...');
      
      // 로딩 애니메이션
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 85) {
            setLoadingText('이미지 로딩 중...');
            return Math.min(prev + Math.random() * 5, 95); // 95%에서 멈춤
          }
          return prev + Math.random() * 12;
        });
      }, 150);

      return () => clearInterval(interval);
    }
  }, [isOpen]);

  // 로딩 완료 시 (모달이 닫히기 직전) 100% 표시
  useEffect(() => {
    if (!isOpen && progress > 0) {
      setProgress(100);
      setLoadingText('로딩 완료! ✅');
      
      // 잠시 후 초기화
      setTimeout(() => {
        setProgress(0);
        setLoadingText('이미지 데이터 준비 중...');
      }, 200);
    }
  }, [isOpen, progress]);

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-md [&>button]:hidden">
        <div className="flex flex-col items-center justify-center p-6 space-y-6">
          {/* 로딩 아이콘 */}
          <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-200 border-t-mainBlue rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold text-mainBlue">{loadingTerm}</span>
            </div>
          </div>

          {/* 로딩 텍스트 */}
          <div className="text-center space-y-2">
            <h3 className="text-xl font-semibold">제 {loadingTerm}기 갤러리 로딩 중</h3>
            <p className="text-gray-600">{loadingText}</p>
          </div>

          {/* 진행률 바 */}
          <div className="w-full space-y-2">
            <Progress value={progress} className="w-full h-2" />
            <div className="flex justify-between text-sm text-gray-500">
              <span>진행률</span>
              <span>{Math.round(progress)}%</span>
            </div>
          </div>

          {/* 로딩 팁 */}
          <div className="text-center text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
            💡 고화질 이미지를 로딩하고 있습니다. 잠시만 기다려주세요.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const Gallery = () => {
  const [galleryMetadata, setGalleryMetadata] = useState<GalleryItem[]>([]); // 메타데이터만 저장
  const [galleryImages, setGalleryImages] = useState<{[key: string]: GalleryItem[]}>({}); // 기수별 이미지 데이터
  const [allGalleryData, setAllGalleryData] = useState<any[]>([]); // 전체 데이터 캐시
  const [loading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
  const [selectedTerm, setSelectedTerm] = useState<string>('');
  const [loadingTerms, setLoadingTerms] = useState<Set<string>>(new Set()); // 로딩중인 기수들

  // 페이지 상단으로 스크롤하는 함수
  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []);

  useEffect(() => {
    console.log('Gallery useEffect 실행');
    scrollToTop();
    loadGalleryMetadata(); // 메타데이터만 먼저 로드
  }, [scrollToTop]);

  // 메타데이터만 먼저 로드
  const loadGalleryMetadata = async () => {
    setIsLoading(true);
    try {
      console.log('📋 갤러리 메타데이터만 먼저 로드 시도');
      
      // 백엔드에서 메타데이터만 가져오기 (이미지 URL 제외)
      const response = await fetch('/api/gallery?meta_only=true');
      const data = await response.json();
      
      if (Array.isArray(data) && data.length > 0) {
        console.log('✅ 메타데이터 로드 성공:', data.length, '개 항목');
        
        const formattedData = data.map(item => ({
          id: item._id,
          _id: item._id,
          title: item.title,
          description: item.description,
          imageUrl: '', // 메타데이터에는 이미지 URL 없음
          date: new Date(item.date).toISOString(),
          term: item.term
        }));
        
        // 날짜 기준 내림차순 정렬 (최신순)
        const sortedItems = formattedData.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        setGalleryMetadata(sortedItems);
        setError(null);
        
        // 기본 선택 기수를 최신 기수로 설정
        const latestTerm = Math.max(...sortedItems.map(item => Number(item.term))).toString();
        setSelectedTerm(latestTerm);
        
        console.log(`🎯 기본 선택 기수: ${latestTerm}기 설정`);
        
        // 최신 기수의 이미지 데이터 바로 로드
        await loadGalleryImagesByTerm(latestTerm);
        
      } else {
        console.warn('⚠️ 메타데이터가 비어있습니다. 로컬 데이터를 사용합니다.');
        loadFromLocalStorage();
      }
    } catch (err) {
      console.error('❌ 메타데이터 로드 중 오류:', err);
      loadFromLocalStorage();
    } finally {
      setIsLoading(false);
    }
  };

  // 전체 데이터를 한 번만 가져와서 캐시하는 함수
  const loadAllGalleryData = async () => {
    if (allGalleryData.length > 0) {
      console.log(`🔄 전체 갤러리 데이터는 이미 캐시됨 (${allGalleryData.length}개)`);
      return allGalleryData;
    }

    console.log(`📡 전체 갤러리 데이터 로드 중...`);
    const response = await fetch('/api/gallery');
    const data = await response.json();
    
    if (Array.isArray(data) && data.length > 0) {
      setAllGalleryData(data);
      console.log(`✅ 전체 갤러리 데이터 캐시 완료: ${data.length}개`);
      return data;
    }
    
    return [];
  };

  // 특정 기수의 이미지 데이터만 로드 (캐시 활용)
  const loadGalleryImagesByTerm = async (term: string) => {
    // 이미 해당 기수가 로드된 경우 스킵
    if (galleryImages[term]) {
      console.log(`🔄 ${term}기 이미지는 이미 로드됨 (${galleryImages[term].length}개)`);
      return;
    }

    console.log(`🖼️ ${term}기 이미지 데이터 로드 시작`);
    setLoadingTerms(prev => new Set([...prev, term]));

    try {
      // 🎯 캐시된 전체 데이터 사용 (없으면 로드)
      const allData = await loadAllGalleryData();
      
      if (Array.isArray(allData) && allData.length > 0) {
        // 🔥 요청한 기수만 필터링
        const filteredData = allData.filter(item => {
          const itemTerm = String(item.term);
          const targetTerm = String(term);
          return itemTerm === targetTerm;
        });
        
        console.log(`🎯 ${term}기 필터링 결과: 캐시된 ${allData.length}개 중 ${filteredData.length}개`);
        
        const formattedData = filteredData.map(item => ({
          id: item._id,
          _id: item._id,
          title: item.title,
          description: item.description,
          imageUrl: item.imageUrl || 'https://via.placeholder.com/600x400?text=Image+Unavailable',
          date: new Date(item.date).toISOString(),
          term: item.term
        }));
        
        // 날짜순 정렬 (최신순)
        const sortedData = formattedData.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        // 해당 기수의 데이터만 저장
        setGalleryImages(prev => ({
          ...prev,
          [term]: sortedData
        }));
        
        console.log(`✅ ${term}기 이미지 로드 완료: ${sortedData.length}개`);
        
        // 로딩 완료 후 잠시 대기
        await new Promise(resolve => setTimeout(resolve, 800));
        
      } else {
        console.log(`⚠️ ${term}기에 해당하는 이미지가 없습니다`);
        // 빈 배열로 설정하여 "로드됨" 상태로 만듦
        setGalleryImages(prev => ({
          ...prev,
          [term]: []
        }));
      }
      
    } catch (err) {
      console.error(`❌ ${term}기 이미지 로드 실패:`, err);
      // 에러 시에도 잠시 대기
      await new Promise(resolve => setTimeout(resolve, 500));
    } finally {
      // 해당 기수의 로딩 상태 해제
      setLoadingTerms(prev => {
        const newSet = new Set(prev);
        newSet.delete(term);
        return newSet;
      });
    }
  };
  
  // 로컬 스토리지에서 데이터 로드 (폴백용)
  const loadFromLocalStorage = () => {
    try {
      const savedData = localStorage.getItem('gallery-data');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        console.log('🔄 로컬 스토리지에서 갤러리 데이터 로드:', parsedData.length, '개 항목');
        
        // 메타데이터와 이미지 데이터 분리
        const metadataOnly = parsedData.map((item: GalleryItem) => ({
          ...item,
          imageUrl: ''
        }));
        setGalleryMetadata(metadataOnly);
        
        // 최신 기수를 기본 선택으로 설정
        const latestTerm = Math.max(...parsedData.map((item: GalleryItem) => Number(item.term))).toString();
        setSelectedTerm(latestTerm);
        console.log(`📌 기본 선택 기수: ${latestTerm}기 (로컬 스토리지)`);
        
        setError(null);
      } else {
        console.warn('⚠️ 로컬 스토리지에 데이터가 없습니다. 하드코딩된 데이터를 사용합니다.');
        
        // 하드코딩된 데이터도 메타데이터만 먼저 설정
        const metadataOnly = GALLERY_ITEMS.map(item => ({
          ...item,
          imageUrl: ''
        }));
        setGalleryMetadata(metadataOnly);
        setSelectedTerm('3'); // 기본값
        console.log('📌 기본 선택 기수: 3기 (하드코딩된 데이터)');
      }
    } catch (err) {
      console.error('❌ 로컬 스토리지에서 갤러리 데이터 로드 중 오류:', err);
      
      // 에러 시에도 하드코딩된 메타데이터 사용
      const metadataOnly = GALLERY_ITEMS.map(item => ({
        ...item,
        imageUrl: ''
      }));
      setGalleryMetadata(metadataOnly);
      setSelectedTerm('3'); // 기본값
      console.log('📌 기본 선택 기수: 3기 (에러 시 기본값)');
      setError('갤러리 데이터를 불러올 수 없습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  // 메타데이터 기반 기수 목록
  const sortedTerms = useMemo(() => {
    const terms = [...new Set(galleryMetadata.map(item => item.term))];
    return terms.sort((a, b) => Number(b) - Number(a));
  }, [galleryMetadata]);

  // 현재 선택된 기수의 데이터 (메타데이터 + 이미지 데이터 조합)
  const filteredItems = useMemo(() => {
    console.log(`🔍 filteredItems 계산 중 - 선택된 기수: ${selectedTerm}`);
    console.log(`📊 galleryImages 상태:`, Object.keys(galleryImages).map(key => `${key}기: ${galleryImages[key]?.length || 0}개`));
    
    if (selectedTerm === 'all') {
      // 전체 보기: 모든 기수의 데이터 조합
      const allItems: GalleryItem[] = [];
      Object.values(galleryImages).forEach(termItems => {
        allItems.push(...termItems);
      });
      const result = allItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      console.log(`📋 전체 보기 결과: ${result.length}개 항목`);
      return result;
    }
    
    // 특정 기수: 해당 기수의 이미지 데이터 반환 (없으면 메타데이터만)
    const termImages = galleryImages[selectedTerm];
    if (termImages && termImages.length > 0) {
      // 🔍 추가 안전장치: 이미지 데이터에서도 한번 더 필터링
      const doubleFiltered = termImages.filter(item => 
        item.term === selectedTerm || item.term === String(selectedTerm)
      );
      console.log(`✅ ${selectedTerm}기 이미지 데이터 반환: ${doubleFiltered.length}개 (원본: ${termImages.length}개)`);
      return doubleFiltered;
    }
    
    // 이미지가 아직 로드되지 않은 경우 메타데이터만 반환
    const metadataFiltered = galleryMetadata.filter(item => 
      item.term === selectedTerm || item.term === String(selectedTerm)
    );
    console.log(`📋 ${selectedTerm}기 메타데이터만 반환: ${metadataFiltered.length}개`);
    return metadataFiltered;
  }, [selectedTerm, galleryMetadata, galleryImages]);

  // 기수 변경 시 이미지 로드 트리거
  useEffect(() => {
    if (selectedTerm && selectedTerm !== 'all') {
      console.log(`🔄 기수 변경: ${selectedTerm}기 선택됨`);
      loadGalleryImagesByTerm(selectedTerm);
    } else if (selectedTerm === 'all') {
      console.log('🔄 전체 보기 선택됨');
      // 전체 보기 시 모든 기수의 이미지 로드
      sortedTerms.forEach(term => {
        loadGalleryImagesByTerm(term);
      });
    }
  }, [selectedTerm, sortedTerms]);

  const handleTermChange = (term: string) => {
    setSelectedTerm(term);
    // 부드러운 전환을 위해 약간의 지연
    setTimeout(() => {
      window.scrollTo({ top: 600, behavior: 'smooth' });
    }, 100);
  };

  // 로딩 모달 표시 여부와 현재 로딩 중인 기수
  const isLoadingModalOpen = loadingTerms.size > 0;
  const currentLoadingTerm = Array.from(loadingTerms)[0] || '';

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

  if (error && galleryMetadata.length === 0) {
    return (
      <div className="gallery-page">
        <Header />
        <section className="pt-24 pb-16">
          <div className="container mx-auto py-8">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">오류!</strong>
              <span className="block sm:inline"> {error}</span>
              <Button 
                onClick={loadGalleryMetadata} 
                className="mt-2 bg-red-600 hover:bg-red-700 text-white"
              >
                다시 시도
              </Button>
            </div>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  if (galleryMetadata.length === 0 && !loading) {
    return (
      <div className="gallery-page">
        <Header />
        <section className="pt-24 pb-16">
          <div className="container mx-auto py-8">
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold mb-4">갤러리 항목이 없습니다</h2>
              <p className="text-gray-600 mb-4">
                아직 갤러리에 등록된 항목이 없습니다. 관리자 페이지에서 항목을 추가해주세요.
              </p>
              <Button onClick={loadGalleryMetadata} className="bg-mainBlue hover:bg-blue-700 text-white">
                새로고침
              </Button>
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
          <h1 className="text-3xl md:text-4xl font-bold mb-4">갤러리</h1>
          <p className="text-lg opacity-90">정치지도자 과정의 다양한 활동들을 만나보세요</p>
        </div>
      </section>
      
      <main className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            
            {/* 기수 선택 필터 */}
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold">기수별 보기:</h2>
                <Select value={selectedTerm} onValueChange={handleTermChange}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="기수를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체 보기</SelectItem>
                    {sortedTerms.map((term) => (
                      <SelectItem key={term} value={term}>
                        제 {term}기
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="text-sm text-gray-600">
                총 {filteredItems.length}개의 이미지
              </div>
            </div>

            {/* 현재 선택된 기수 표시 */}
            {selectedTerm !== 'all' && (
              <div className="mb-6">
                <div className="flex items-center">
                  <div className="flex items-center bg-mainBlue text-white px-6 py-3 rounded-r-full">
                    <span className="text-2xl font-bold">{selectedTerm}</span>
                    <span className="text-lg ml-1">기</span>
                  </div>
                  <div className="h-0.5 bg-mainBlue/30 flex-grow ml-4"></div>
                </div>
              </div>
            )}

            {/* 갤러리 그리드 */}
            {filteredItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(() => {
                  // 🔍 렌더링 전 최종 검증
                  console.log(`🎨 갤러리 렌더링 시작 - 선택된 기수: ${selectedTerm}, 항목 수: ${filteredItems.length}`);
                  const termDistribution = {};
                  filteredItems.forEach(item => {
                    const term = item.term;
                    termDistribution[term] = (termDistribution[term] || 0) + 1;
                  });
                  console.log(`🎯 렌더링 항목 기수 분포:`, termDistribution);
                  
                  return filteredItems.map((item) => {
                    // 이미지 로딩 조건: filteredItems는 이미 선택된 기수에 맞는 항목들이므로 
                    // 현재 표시되는 모든 항목의 이미지를 로드
                    const shouldLoadImage = true;
                    
                    return (
                      <GalleryCard
                        key={item.id || item._id}
                        item={item}
                        onClick={() => setSelectedImage(item)}
                        shouldLoadImage={shouldLoadImage}
                      />
                    );
                  });
                })()}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="text-gray-400 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4">
                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
                    <circle cx="9" cy="9" r="2"></circle>
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  {selectedTerm === 'all' ? '갤러리가 비어있습니다' : `제 ${selectedTerm}기 갤러리가 비어있습니다`}
                </h3>
                <p className="text-gray-600">
                  {selectedTerm === 'all' 
                    ? '아직 등록된 이미지가 없습니다.' 
                    : '해당 기수에 등록된 이미지가 없습니다. 다른 기수를 선택해보세요.'
                  }
                </p>
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
                  <p className="text-gray-700 mb-3 text-lg">{selectedImage.description}</p>
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

      {/* 기수 로딩 모달 */}
      <LoadingModal
        isOpen={isLoadingModalOpen}
        loadingTerm={currentLoadingTerm}
        onClose={() => {}}
      />
    </div>
  );
};

export default Gallery;
