import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface ImageSize {
  url: string;
  width: number;
  size: number;
}

interface OptimizedImageData {
  originalName: string;
  baseName: string;
  formats: {
    webp: boolean;
    fallback: boolean;
  };
  sizes: {
    thumbnail?: ImageSize;
    small?: ImageSize;
    medium?: ImageSize;
    large?: ImageSize;
    original?: ImageSize;
  };
  srcset: string;
  defaultSize: string;
}

interface OptimizedImageProps {
  src: string | OptimizedImageData;
  alt: string;
  className?: string;
  
  // 이미지 크기 및 반응형 설정
  sizes?: string; // CSS sizes 속성
  priority?: boolean; // 우선순위 로딩 (LCP 이미지용)
  quality?: number; // 이미지 품질 (1-100)
  
  // 지연 로딩 설정
  lazy?: boolean;
  threshold?: number; // Intersection Observer threshold
  rootMargin?: string; // Intersection Observer rootMargin
  
  // 프로그레시브 로딩
  placeholder?: 'blur' | 'empty' | 'skeleton';
  blurDataURL?: string;
  
  // 이벤트 핸들러
  onLoad?: () => void;
  onError?: () => void;
  onLoadStart?: () => void;
  
  // 컨테이너 설정
  fill?: boolean; // 부모 요소 꽉 채우기
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  objectPosition?: string;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  sizes = '100vw',
  priority = false,
  quality = 85,
  lazy = true,
  threshold = 0.1,
  rootMargin = '50px',
  placeholder = 'skeleton',
  blurDataURL,
  onLoad,
  onError,
  onLoadStart,
  fill = false,
  objectFit = 'cover',
  objectPosition = 'center',
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isInView, setIsInView] = useState(!lazy || priority);
  const [isLoading, setIsLoading] = useState(false);
  
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const placeholderRef = useRef<HTMLDivElement>(null);

  // 이미지 데이터 파싱
  const getImageData = useCallback(() => {
    if (typeof src === 'string') {
      return {
        mainSrc: src,
        srcSet: '',
        isOptimized: false
      };
    } else {
      const mainSize = src.sizes[src.defaultSize] || src.sizes.medium || src.sizes.large || src.sizes.original;
      return {
        mainSrc: mainSize?.url || '',
        srcSet: src.srcset,
        isOptimized: true,
        optimizedData: src
      };
    }
  }, [src]);

  const { mainSrc, srcSet, isOptimized, optimizedData } = getImageData();

  // Intersection Observer 설정
  useEffect(() => {
    if (!lazy || priority || isInView) return;

    const currentImg = imgRef.current || placeholderRef.current;
    
    if (currentImg) {
      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observerRef.current?.unobserve(currentImg);
          }
        },
        { threshold, rootMargin }
      );
      
      observerRef.current.observe(currentImg);
    }

    return () => {
      if (observerRef.current && currentImg) {
        observerRef.current.unobserve(currentImg);
      }
    };
  }, [lazy, priority, threshold, rootMargin, isInView]);

  // 이미지 로드 핸들러
  const handleLoadStart = useCallback(() => {
    setIsLoading(true);
    onLoadStart?.();
  }, [onLoadStart]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    setIsLoading(false);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setIsError(true);
    setIsLoading(false);
    onError?.();
  }, [onError]);

  // 이미지 preload (우선순위 이미지용)
  useEffect(() => {
    if (priority && mainSrc) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = mainSrc;
      if (srcSet) {
        link.setAttribute('imagesrcset', srcSet);
        link.setAttribute('imagesizes', sizes);
      }
      document.head.appendChild(link);
      
      return () => {
        document.head.removeChild(link);
      };
    }
  }, [priority, mainSrc, srcSet, sizes]);

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
  if (!mainSrc) {
    return (
      <div className={cn('relative overflow-hidden bg-gray-100', className)} style={getContainerStyles()}>
        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="48" 
            height="48" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
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
    <div className={cn('relative overflow-hidden', className)} style={getContainerStyles()}>
      {/* Placeholder */}
      {!isLoaded && (
        <div 
          ref={placeholderRef}
          className="absolute inset-0 z-10"
        >
          {placeholder === 'skeleton' && (
            <div className="w-full h-full bg-gray-200 animate-pulse" />
          )}
          
          {placeholder === 'blur' && blurDataURL && (
            <img
              src={blurDataURL}
              alt=""
              className="w-full h-full object-cover filter blur-sm scale-110"
              style={getImageStyles()}
            />
          )}
          
          {placeholder === 'empty' && (
            <div className="w-full h-full bg-gray-100" />
          )}
          
          {/* 로딩 인디케이터 */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75">
              <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
            </div>
          )}
        </div>
      )}
      
      {/* 에러 상태 */}
      {isError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 text-gray-500 z-20">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="48" 
            height="48" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="mb-2"
          >
            <path d="m21 21-4.35-4.35"/>
            <path d="M16 8a6 6 0 1 0-12 0c0 1-1 1-1 1s1 0 1 1v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-8s0-1 1-1 1 0 1-1a6 6 0 0 0-2-4.65"/>
          </svg>
          <p className="text-center text-sm">이미지를 불러올 수 없습니다</p>
          {isOptimized && optimizedData && (
            <p className="text-center text-xs text-gray-400 mt-1">
              {optimizedData.originalName}
            </p>
          )}
        </div>
      )}
      
      {/* 실제 이미지 */}
      {isInView && !isError && (
        <img
          ref={imgRef}
          src={mainSrc}
          srcSet={srcSet || undefined}
          sizes={srcSet ? sizes : undefined}
          alt={alt}
          className={cn(
            'transition-all duration-300 ease-in-out',
            isLoaded ? 'opacity-100' : 'opacity-0',
            fill ? 'absolute inset-0' : 'w-full h-full'
          )}
          style={getImageStyles()}
          onLoadStart={handleLoadStart}
          onLoad={handleLoad}
          onError={handleError}
          loading={lazy && !priority ? 'lazy' : 'eager'}
          decoding="async"
        />
      )}

      {/* 개발 모드에서 이미지 정보 표시 */}
      {process.env.NODE_ENV === 'development' && isOptimized && optimizedData && isLoaded && (
        <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white text-xs p-1 rounded opacity-0 hover:opacity-100 transition-opacity z-30">
          <div>Original: {optimizedData.originalName}</div>
          <div>Optimized: {Object.keys(optimizedData.sizes).length} sizes</div>
          <div>Format: WebP</div>
        </div>
      )}
    </div>
  );
};

export default OptimizedImage; 