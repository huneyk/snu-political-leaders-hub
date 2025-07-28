import React, { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { 
  generateBlurDataURL, 
  createBlurDataURLFromImage,
  getProgressiveLoadingOrder,
  calculateOptimalQuality 
} from '@/utils/imageUtils';

interface ProgressiveImageSize {
  url: string;
  width: number;
  size: number;
}

interface ProgressiveImageData {
  sizes: {
    [key: string]: ProgressiveImageSize;
  };
  srcset: string;
  defaultSize: string;
}

interface ProgressiveImageProps {
  src: string | ProgressiveImageData;
  alt: string;
  className?: string;
  
  // 프로그레시브 로딩 설정
  enableProgressive?: boolean;
  progressiveSteps?: number; // 몇 단계로 나눌지
  transitionDuration?: number; // 전환 시간 (ms)
  
  // 블러 placeholder 설정
  placeholder?: 'blur' | 'skeleton' | 'color';
  placeholderColor?: string;
  blurDataURL?: string;
  
  // 품질 및 최적화 설정
  quality?: number;
  priority?: boolean;
  
  // 컨테이너 설정
  fill?: boolean;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  objectPosition?: string;
  
  // 이벤트 핸들러
  onLoad?: () => void;
  onError?: () => void;
  onProgressUpdate?: (step: number, totalSteps: number) => void;
}

const ProgressiveImage: React.FC<ProgressiveImageProps> = ({
  src,
  alt,
  className = '',
  enableProgressive = true,
  progressiveSteps = 3,
  transitionDuration = 300,
  placeholder = 'blur',
  placeholderColor = '#f0f0f0',
  blurDataURL,
  quality,
  priority = false,
  fill = false,
  objectFit = 'cover',
  objectPosition = 'center',
  onLoad,
  onError,
  onProgressUpdate,
}) => {
  const [currentImageUrl, setCurrentImageUrl] = useState<string>('');
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [isFullyLoaded, setIsFullyLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [generatedBlurDataURL, setGeneratedBlurDataURL] = useState<string>('');
  
  const containerRef = useRef<HTMLDivElement>(null);
  const loadingQueueRef = useRef<string[]>([]);
  const currentLoadRef = useRef<HTMLImageElement | null>(null);

  // 이미지 데이터 파싱
  const getImageData = useCallback(() => {
    if (typeof src === 'string') {
      return {
        imagesToLoad: [src],
        isOptimized: false,
        finalImage: src
      };
    } else {
      const availableSizes = Object.keys(src.sizes);
      const progressiveOrder = getProgressiveLoadingOrder(availableSizes);
      
      if (!enableProgressive || progressiveOrder.length <= 1) {
        const finalSize = src.sizes[src.defaultSize] || src.sizes.medium || src.sizes.large;
        return {
          imagesToLoad: [finalSize?.url || ''],
          isOptimized: true,
          finalImage: finalSize?.url || ''
        };
      }
      
      // 프로그레시브 로딩을 위한 이미지 순서 결정
      const step = Math.max(1, Math.floor(progressiveOrder.length / progressiveSteps));
      const selectedSizes = [];
      
      for (let i = 0; i < progressiveOrder.length; i += step) {
        selectedSizes.push(progressiveOrder[i]);
      }
      
      // 마지막에 최고 품질 이미지 추가
      if (!selectedSizes.includes(progressiveOrder[progressiveOrder.length - 1])) {
        selectedSizes.push(progressiveOrder[progressiveOrder.length - 1]);
      }
      
      return {
        imagesToLoad: selectedSizes.map(sizeName => src.sizes[sizeName]?.url || '').filter(Boolean),
        isOptimized: true,
        finalImage: src.sizes[src.defaultSize]?.url || ''
      };
    }
  }, [src, enableProgressive, progressiveSteps]);

  const { imagesToLoad, isOptimized, finalImage } = getImageData();

  // 블러 placeholder 생성
  useEffect(() => {
    if (placeholder === 'blur' && !blurDataURL && imagesToLoad.length > 0) {
      const firstImage = imagesToLoad[0];
      if (firstImage) {
        createBlurDataURLFromImage(firstImage)
          .then(setGeneratedBlurDataURL)
          .catch(() => {
            setGeneratedBlurDataURL(generateBlurDataURL());
          });
      } else {
        setGeneratedBlurDataURL(generateBlurDataURL());
      }
    }
  }, [placeholder, blurDataURL, imagesToLoad]);

  // 이미지 로드 함수
  const loadImage = useCallback((imageUrl: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      // 이미 로드된 이미지면 스킵
      if (loadedImages.has(imageUrl)) {
        resolve();
        return;
      }

      const img = new Image();
      currentLoadRef.current = img;

      img.onload = () => {
        setLoadedImages(prev => new Set([...prev, imageUrl]));
        setCurrentImageUrl(imageUrl);
        resolve();
      };

      img.onerror = () => {
        reject(new Error(`Failed to load image: ${imageUrl}`));
      };

      // 품질 최적화된 URL 생성
      if (quality) {
        const url = new URL(imageUrl, window.location.origin);
        url.searchParams.set('quality', quality.toString());
        img.src = url.toString();
      } else {
        img.src = imageUrl;
      }
    });
  }, [loadedImages, quality]);

  // 프로그레시브 로딩 프로세스
  const startProgressiveLoading = useCallback(async () => {
    if (imagesToLoad.length === 0) return;

    loadingQueueRef.current = [...imagesToLoad];
    
    for (let i = 0; i < imagesToLoad.length; i++) {
      const imageUrl = imagesToLoad[i];
      
      try {
        await loadImage(imageUrl);
        setCurrentStep(i + 1);
        onProgressUpdate?.(i + 1, imagesToLoad.length);
        
        // 마지막 이미지면 완전 로드 완료
        if (i === imagesToLoad.length - 1) {
          setIsFullyLoaded(true);
          onLoad?.();
        }
        
        // 우선순위가 높은 경우 첫 번째 이미지만 로드하고 종료
        if (priority && i === 0) {
          break;
        }
        
      } catch (error) {
        console.error('이미지 로드 실패:', error);
        
        // 첫 번째 이미지 로드 실패 시 에러 처리
        if (i === 0) {
          setIsError(true);
          onError?.();
          return;
        }
      }
    }
  }, [imagesToLoad, loadImage, onLoad, onError, onProgressUpdate, priority]);

  // 초기 로딩 시작
  useEffect(() => {
    if (imagesToLoad.length > 0) {
      startProgressiveLoading();
    }
    
    return () => {
      // 컴포넌트 언마운트 시 진행 중인 로드 중단
      if (currentLoadRef.current) {
        currentLoadRef.current.src = '';
      }
    };
  }, [startProgressiveLoading, imagesToLoad]);

  // 스타일 계산
  const getContainerStyles = () => {
    if (fill) {
      return {
        position: 'absolute' as const,
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
      };
    }
    return {};
  };

  const getImageStyles = () => {
    return {
      objectFit: objectFit,
      objectPosition: objectPosition,
      ...(fill ? { width: '100%', height: '100%' } : {}),
    };
  };

  // 빈 src 처리
  if (imagesToLoad.length === 0) {
    return (
      <div className={cn('relative overflow-hidden bg-gray-100', className)} style={getContainerStyles()}>
        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
            <circle cx="9" cy="9" r="2"></circle>
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
          </svg>
          <span className="text-xs mt-2">이미지 없음</span>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={cn('relative overflow-hidden', className)} style={getContainerStyles()}>
      {/* Placeholder */}
      {!currentImageUrl && !isError && (
        <div className="absolute inset-0 z-10">
          {placeholder === 'blur' && (
            <img
              src={blurDataURL || generatedBlurDataURL}
              alt=""
              className="w-full h-full object-cover filter blur-sm scale-110"
              style={getImageStyles()}
            />
          )}
          
          {placeholder === 'skeleton' && (
            <div className="w-full h-full bg-gray-200 animate-pulse" />
          )}
          
          {placeholder === 'color' && (
            <div 
              className="w-full h-full" 
              style={{ backgroundColor: placeholderColor }}
            />
          )}
        </div>
      )}

      {/* 프로그레시브 로딩 인디케이터 */}
      {enableProgressive && currentStep > 0 && !isFullyLoaded && (
        <div className="absolute top-2 right-2 z-30">
          <div className="bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
            {currentStep}/{imagesToLoad.length}
          </div>
        </div>
      )}

      {/* 에러 상태 */}
      {isError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 text-gray-500 z-20">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <path d="m21 21-4.35-4.35"/>
            <path d="M16 8a6 6 0 1 0-12 0c0 1-1 1-1 1s1 0 1 1v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-8s0-1 1-1 1 0 1-1a6 6 0 0 0-2-4.65"/>
          </svg>
          <p className="text-center text-sm mt-2">이미지를 불러올 수 없습니다</p>
        </div>
      )}

      {/* 메인 이미지 */}
      {currentImageUrl && !isError && (
        <img
          src={currentImageUrl}
          alt={alt}
          className={cn(
            'w-full h-full transition-all ease-in-out',
            isFullyLoaded ? 'opacity-100' : 'opacity-90',
            fill ? 'absolute inset-0' : ''
          )}
          style={{
            ...getImageStyles(),
            transitionDuration: `${transitionDuration}ms`,
          }}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
        />
      )}

      {/* 개발 모드 정보 */}
      {process.env.NODE_ENV === 'development' && isOptimized && currentImageUrl && (
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white text-xs p-1 rounded opacity-0 hover:opacity-100 transition-opacity z-30">
          <div>Progressive: {enableProgressive ? 'ON' : 'OFF'}</div>
          <div>Step: {currentStep}/{imagesToLoad.length}</div>
          <div>Current: {currentImageUrl.split('/').pop()}</div>
        </div>
      )}
    </div>
  );
};

export default ProgressiveImage; 