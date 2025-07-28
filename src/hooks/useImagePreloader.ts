import { useState, useEffect, useCallback, useRef } from 'react';

interface PreloadedImage {
  src: string;
  loaded: boolean;
  error: boolean;
  loadTime: number;
  priority: number;
}

interface PreloadOptions {
  priority?: number; // 1-10 (10이 가장 높음)
  timeout?: number; // 타임아웃 (ms)
  crossOrigin?: string;
  referrerPolicy?: string;
}

interface UseImagePreloaderReturn {
  preloadImage: (src: string, options?: PreloadOptions) => Promise<void>;
  preloadImages: (srcs: string[], options?: PreloadOptions) => Promise<void[]>;
  getPreloadedImage: (src: string) => PreloadedImage | null;
  preloadedImages: Map<string, PreloadedImage>;
  isPreloading: boolean;
  clearCache: () => void;
}

// 전역 이미지 캐시
const globalImageCache = new Map<string, PreloadedImage>();
const preloadQueue: Array<{ src: string; options: PreloadOptions; resolve: () => void; reject: (error: Error) => void }> = [];
let isProcessingQueue = false;
const maxConcurrentLoads = 3; // 동시 로딩 개수 제한
let currentLoads = 0;

/**
 * 이미지 프리로딩 및 우선순위 로딩을 위한 Hook
 */
export const useImagePreloader = (): UseImagePreloaderReturn => {
  const [preloadedImages, setPreloadedImages] = useState<Map<string, PreloadedImage>>(
    new Map(globalImageCache)
  );
  const [isPreloading, setIsPreloading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // 이미지 로드 함수
  const loadImage = useCallback((src: string, options: PreloadOptions = {}): Promise<void> => {
    return new Promise((resolve, reject) => {
      // 이미 로드된 이미지인지 확인
      const cached = globalImageCache.get(src);
      if (cached?.loaded) {
        resolve();
        return;
      }

      const img = new Image();
      const startTime = Date.now();

      // 옵션 적용
      if (options.crossOrigin) {
        img.crossOrigin = options.crossOrigin;
      }
      if (options.referrerPolicy) {
        img.referrerPolicy = options.referrerPolicy;
      }

      // 타임아웃 설정
      const timeout = options.timeout || 30000; // 기본 30초
      const timeoutId = setTimeout(() => {
        const error = new Error(`Image load timeout: ${src}`);
        reject(error);
        updateImageCache(src, { loaded: false, error: true, loadTime: Date.now() - startTime });
      }, timeout);

      img.onload = () => {
        clearTimeout(timeoutId);
        const loadTime = Date.now() - startTime;
        updateImageCache(src, { loaded: true, error: false, loadTime });
        console.log(`✅ 이미지 프리로드 완료: ${src} (${loadTime}ms)`);
        resolve();
      };

      img.onerror = () => {
        clearTimeout(timeoutId);
        const loadTime = Date.now() - startTime;
        const error = new Error(`Failed to load image: ${src}`);
        updateImageCache(src, { loaded: false, error: true, loadTime });
        console.error(`❌ 이미지 프리로드 실패: ${src} (${loadTime}ms)`);
        reject(error);
      };

      // 캐시에 로딩 중 상태 추가
      updateImageCache(src, { 
        loaded: false, 
        error: false, 
        loadTime: 0,
        priority: options.priority || 5 
      });

      img.src = src;
    });
  }, []);

  // 이미지 캐시 업데이트
  const updateImageCache = useCallback((src: string, updates: Partial<PreloadedImage>) => {
    const existing = globalImageCache.get(src) || { 
      src, 
      loaded: false, 
      error: false, 
      loadTime: 0, 
      priority: 5 
    };
    
    const updated = { ...existing, ...updates };
    globalImageCache.set(src, updated);
    
    setPreloadedImages(new Map(globalImageCache));
  }, []);

  // 큐 처리
  const processQueue = useCallback(async () => {
    if (isProcessingQueue || preloadQueue.length === 0 || currentLoads >= maxConcurrentLoads) {
      return;
    }

    isProcessingQueue = true;

    // 우선순위별로 정렬
    preloadQueue.sort((a, b) => (b.options.priority || 5) - (a.options.priority || 5));

    while (preloadQueue.length > 0 && currentLoads < maxConcurrentLoads) {
      const item = preloadQueue.shift();
      if (!item) break;

      currentLoads++;
      
      try {
        await loadImage(item.src, item.options);
        item.resolve();
      } catch (error) {
        item.reject(error as Error);
      } finally {
        currentLoads--;
      }
    }

    isProcessingQueue = false;

    // 큐에 남은 항목이 있으면 재귀 호출
    if (preloadQueue.length > 0) {
      setTimeout(processQueue, 10);
    }
  }, [loadImage]);

  // 단일 이미지 프리로드
  const preloadImage = useCallback(async (src: string, options: PreloadOptions = {}): Promise<void> => {
    // 이미 로드된 경우 스킵
    const cached = globalImageCache.get(src);
    if (cached?.loaded) {
      return Promise.resolve();
    }

    setIsPreloading(true);

    return new Promise((resolve, reject) => {
      preloadQueue.push({ src, options, resolve, reject });
      processQueue().finally(() => {
        setIsPreloading(preloadQueue.length > 0 || currentLoads > 0);
      });
    });
  }, [processQueue]);

  // 다중 이미지 프리로드
  const preloadImages = useCallback(async (srcs: string[], options: PreloadOptions = {}): Promise<void[]> => {
    setIsPreloading(true);
    
    const promises = srcs.map(src => preloadImage(src, options));
    
    try {
      return await Promise.allSettled(promises).then(results => 
        results.map(result => {
          if (result.status === 'fulfilled') {
            return result.value;
          } else {
            console.warn('이미지 프리로드 실패:', result.reason);
            return undefined;
          }
        }).filter(Boolean) as void[]
      );
    } finally {
      setIsPreloading(false);
    }
  }, [preloadImage]);

  // 프리로드된 이미지 조회
  const getPreloadedImage = useCallback((src: string): PreloadedImage | null => {
    return globalImageCache.get(src) || null;
  }, []);

  // 캐시 클리어
  const clearCache = useCallback(() => {
    globalImageCache.clear();
    setPreloadedImages(new Map());
    
    // 진행 중인 요청 중단
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // 큐 클리어
    preloadQueue.length = 0;
    currentLoads = 0;
    
    console.log('🧹 이미지 캐시 클리어됨');
  }, []);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    abortControllerRef.current = new AbortController();
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    preloadImage,
    preloadImages,
    getPreloadedImage,
    preloadedImages,
    isPreloading,
    clearCache,
  };
};

/**
 * 중요한 이미지들을 자동으로 프리로드하는 Hook
 */
export const useImagePreloadStrategy = () => {
  const { preloadImages } = useImagePreloader();

  // 페이지별 중요 이미지 프리로드 전략
  const preloadCriticalImages = useCallback(async (route: string) => {
    const strategies: Record<string, string[]> = {
      '/': [
        '/logo.png',
        '/hero-bg.jpg',
        // 메인 페이지 중요 이미지들
      ],
      '/gallery': [
        // 갤러리 썸네일들 (최신 몇 개)
      ],
      '/professors': [
        // 교수진 프로필 이미지들
      ],
    };

    const imagesToPreload = strategies[route] || [];
    
    if (imagesToPreload.length > 0) {
      console.log(`🚀 ${route} 페이지 중요 이미지 프리로드 시작: ${imagesToPreload.length}개`);
      
      try {
        await preloadImages(imagesToPreload, { priority: 8 });
        console.log(`✅ ${route} 페이지 중요 이미지 프리로드 완료`);
      } catch (error) {
        console.warn(`⚠️ ${route} 페이지 이미지 프리로드 일부 실패:`, error);
      }
    }
  }, [preloadImages]);

  // 다음 페이지 이미지 예측 프리로드
  const preloadNextPageImages = useCallback(async (currentRoute: string) => {
    // 사용자 행동 패턴 기반 다음 페이지 예측
    const nextPagePredictions: Record<string, string[]> = {
      '/': ['/intro/objectives', '/intro/professors', '/gallery'],
      '/intro/objectives': ['/intro/benefits', '/intro/professors'],
      '/intro/professors': ['/intro/recommendations', '/gallery'],
      '/gallery': ['/gallery/term/:id'], // 특정 기수 갤러리
    };

    const nextPages = nextPagePredictions[currentRoute] || [];
    
    for (const nextPage of nextPages) {
      // 낮은 우선순위로 다음 페이지 이미지 프리로드
      await preloadCriticalImages(nextPage);
    }
  }, [preloadCriticalImages]);

  return {
    preloadCriticalImages,
    preloadNextPageImages,
  };
}; 