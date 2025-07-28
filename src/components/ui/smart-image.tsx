import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import OptimizedImage from './optimized-image';
import ProgressiveImage from './progressive-image';
import { useImagePreloader, useImagePreloadStrategy } from '@/hooks/useImagePreloader';
import { 
  calculateOptimalQuality, 
  checkImageFormatSupport,
  getOptimalImageSize,
  isValidImageURL 
} from '@/utils/imageUtils';

interface SmartImageProps {
  src: string | any; // 최적화된 이미지 데이터 또는 단순 URL
  alt: string;
  className?: string;
  
  // 이미지 크기 및 반응형 설정
  width?: number;
  height?: number;
  sizes?: string;
  
  // 로딩 전략
  strategy?: 'auto' | 'progressive' | 'optimized' | 'lazy' | 'eager';
  priority?: boolean; // LCP 이미지인지 여부
  
  // 품질 및 최적화
  quality?: 'auto' | number;
  format?: 'auto' | 'webp' | 'jpeg' | 'png';
  
  // 플레이스홀더 설정
  placeholder?: 'auto' | 'blur' | 'skeleton' | 'color';
  placeholderColor?: string;
  blurDataURL?: string;
  
  // 컨테이너 설정
  fill?: boolean;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  objectPosition?: string;
  
  // 캐싱 전략
  cache?: boolean;
  preload?: boolean;
  
  // 이벤트 핸들러
  onLoad?: () => void;
  onError?: () => void;
  onLoadingStateChange?: (isLoading: boolean) => void;
}

/**
 * 모든 이미지 최적화 기능을 통합한 스마트 이미지 컴포넌트
 */
const SmartImage: React.FC<SmartImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  sizes = '100vw',
  strategy = 'auto',
  priority = false,
  quality = 'auto',
  format = 'auto',
  placeholder = 'auto',
  placeholderColor,
  blurDataURL,
  fill = false,
  objectFit = 'cover',
  objectPosition = 'center',
  cache = true,
  preload = false,
  onLoad,
  onError,
  onLoadingStateChange,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [actualStrategy, setActualStrategy] = useState<string>('optimized');
  const [optimizedQuality, setOptimizedQuality] = useState<number>(85);
  const [supportedFormats, setSupportedFormats] = useState<any>({});
  
  const { preloadImage, getPreloadedImage } = useImagePreloader();
  const { preloadCriticalImages } = useImagePreloadStrategy();

  // 브라우저 지원 기능 확인
  useEffect(() => {
    const formats = checkImageFormatSupport();
    setSupportedFormats(formats);
  }, []);

  // 자동 품질 계산
  useEffect(() => {
    if (quality === 'auto') {
      const autoQuality = calculateOptimalQuality();
      setOptimizedQuality(autoQuality);
    } else if (typeof quality === 'number') {
      setOptimizedQuality(quality);
    }
  }, [quality]);

  // 이미지 URL 정규화
  const normalizedSrc = useMemo(() => {
    if (typeof src === 'string') {
      return isValidImageURL(src) ? src : '';
    }
    return src;
  }, [src]);

  // 최적 로딩 전략 결정
  const determineStrategy = useCallback(() => {
    if (strategy !== 'auto') return strategy;

    // 우선순위 이미지는 eager 로딩
    if (priority) return 'eager';

    // 최적화된 이미지 데이터가 있으면 progressive
    if (typeof normalizedSrc === 'object' && normalizedSrc?.sizes) {
      return 'progressive';
    }

    // 큰 이미지는 progressive, 작은 이미지는 optimized
    if (width && height && width * height > 300000) {
      return 'progressive';
    }

    return 'optimized';
  }, [strategy, priority, normalizedSrc, width, height]);

  // 전략 설정
  useEffect(() => {
    const newStrategy = determineStrategy();
    setActualStrategy(newStrategy);
  }, [determineStrategy]);

  // 플레이스홀더 전략 결정
  const determinePlaceholder = useCallback(() => {
    if (placeholder !== 'auto') return placeholder;

    // 빠른 네트워크에서는 skeleton, 느린 네트워크에서는 blur
    const quality = optimizedQuality;
    if (quality >= 85) return 'skeleton';
    if (quality >= 70) return 'blur';
    return 'skeleton';
  }, [placeholder, optimizedQuality]);

  // 프리로딩 처리
  useEffect(() => {
    if (preload && typeof normalizedSrc === 'string' && cache) {
      preloadImage(normalizedSrc, { priority: priority ? 10 : 5 });
    }
  }, [preload, normalizedSrc, cache, priority, preloadImage]);

  // 로딩 상태 관리
  const handleLoadingStateChange = useCallback((loading: boolean) => {
    setIsLoading(loading);
    onLoadingStateChange?.(loading);
  }, [onLoadingStateChange]);

  const handleLoad = useCallback(() => {
    handleLoadingStateChange(false);
    onLoad?.();
  }, [handleLoadingStateChange, onLoad]);

  const handleError = useCallback(() => {
    handleLoadingStateChange(false);
    onError?.();
  }, [handleLoadingStateChange, onError]);

  // 공통 props
  const commonProps = {
    alt,
    className,
    fill,
    objectFit,
    objectPosition,
    onLoad: handleLoad,
    onError: handleError,
    priority,
  };

  // 빈 src 처리
  if (!normalizedSrc) {
    return (
      <div className={cn('relative overflow-hidden bg-gray-100', className)}>
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

  // 전략별 컴포넌트 렌더링
  switch (actualStrategy) {
    case 'progressive':
      return (
        <ProgressiveImage
          {...commonProps}
          src={normalizedSrc}
          enableProgressive={true}
          progressiveSteps={3}
          placeholder={determinePlaceholder() === 'color' ? 'skeleton' : determinePlaceholder()}
          placeholderColor={placeholderColor}
          blurDataURL={blurDataURL}
          quality={optimizedQuality}
        />
      );

    case 'optimized':
      return (
        <OptimizedImage
          {...commonProps}
          src={normalizedSrc}
          sizes={sizes}
          lazy={!priority}
          threshold={0.1}
          rootMargin="50px"
          placeholder={determinePlaceholder() === 'color' ? 'empty' : determinePlaceholder() as 'blur' | 'skeleton' | 'empty'}
          blurDataURL={blurDataURL}
          quality={optimizedQuality}
        />
      );

    case 'eager':
      return (
        <OptimizedImage
          {...commonProps}
          src={normalizedSrc}
          sizes={sizes}
          lazy={false}
          placeholder={determinePlaceholder() === 'color' ? 'empty' : determinePlaceholder() as 'blur' | 'skeleton' | 'empty'}
          blurDataURL={blurDataURL}
          quality={optimizedQuality}
        />
      );

    case 'lazy':
    default:
      return (
        <OptimizedImage
          {...commonProps}
          src={normalizedSrc}
          sizes={sizes}
          lazy={true}
          threshold={0.3}
          rootMargin="100px"
          placeholder={determinePlaceholder() === 'color' ? 'empty' : determinePlaceholder() as 'blur' | 'skeleton' | 'empty'}
          blurDataURL={blurDataURL}
          quality={optimizedQuality}
        />
      );
  }
};

export default SmartImage;

// 편의를 위한 래퍼 컴포넌트들
export const HeroImage: React.FC<Omit<SmartImageProps, 'strategy' | 'priority'>> = (props) => (
  <SmartImage {...props} strategy="eager" priority={true} placeholder="blur" />
);

export const ThumbnailImage: React.FC<Omit<SmartImageProps, 'strategy' | 'placeholder'>> = (props) => (
  <SmartImage {...props} strategy="lazy" placeholder="skeleton" />
);

export const GalleryImage: React.FC<Omit<SmartImageProps, 'strategy'>> = (props) => (
  <SmartImage {...props} strategy="progressive" />
);

export const ProfileImage: React.FC<Omit<SmartImageProps, 'strategy' | 'objectFit'>> = (props) => (
  <SmartImage {...props} strategy="optimized" objectFit="cover" />
); 