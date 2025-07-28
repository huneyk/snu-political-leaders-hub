/**
 * 이미지 관련 유틸리티 함수들
 */

/**
 * 블러 placeholder를 위한 작은 base64 이미지 생성
 */
export const generateBlurDataURL = (width: number = 10, height: number = 10): string => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIHZpZXdCb3g9IjAgMCAxMCAxMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjZjNmNGY2Ii8+Cjwvc3ZnPgo=';
  }
  
  canvas.width = width;
  canvas.height = height;
  
  // 그라데이션 생성
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#f0f0f0');
  gradient.addColorStop(1, '#e5e5e5');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  return canvas.toDataURL('image/jpeg', 0.1);
};

/**
 * 이미지로부터 작은 블러 데이터 URL 생성
 */
export const createBlurDataURLFromImage = (imageSrc: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        resolve(generateBlurDataURL());
        return;
      }
      
      // 매우 작은 크기로 설정 (4x4 정도)
      const smallWidth = 4;
      const smallHeight = 4;
      
      canvas.width = smallWidth;
      canvas.height = smallHeight;
      
      // 이미지를 작은 크기로 그리기
      ctx.drawImage(img, 0, 0, smallWidth, smallHeight);
      
      // 매우 낮은 품질의 JPEG로 변환
      const blurDataURL = canvas.toDataURL('image/jpeg', 0.1);
      resolve(blurDataURL);
    };
    
    img.onerror = () => {
      resolve(generateBlurDataURL());
    };
    
    img.src = imageSrc;
  });
};

/**
 * 이미지 URL에서 최적화된 크기 추출
 */
export const extractImageSizes = (optimizedImageData: any): string[] => {
  if (!optimizedImageData?.sizes) return [];
  
  return Object.entries(optimizedImageData.sizes)
    .filter(([_, imageData]: [string, any]) => imageData?.width)
    .map(([sizeName, imageData]: [string, any]) => 
      `${imageData.url} ${imageData.width}w`
    );
};

/**
 * 디바이스별 적절한 이미지 크기 결정
 */
export const getOptimalImageSize = (containerWidth: number, devicePixelRatio: number = 1): string => {
  const targetWidth = containerWidth * devicePixelRatio;
  
  if (targetWidth <= 150) return 'thumbnail';
  if (targetWidth <= 300) return 'small';
  if (targetWidth <= 600) return 'medium';
  if (targetWidth <= 1200) return 'large';
  return 'original';
};

/**
 * 이미지 포맷 지원 확인
 */
export const checkImageFormatSupport = (): {
  webp: boolean;
  avif: boolean;
  heic: boolean;
} => {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  
  return {
    webp: canvas.toDataURL('image/webp').indexOf('image/webp') === 5,
    avif: canvas.toDataURL('image/avif').indexOf('image/avif') === 5,
    heic: canvas.toDataURL('image/heic').indexOf('image/heic') === 5,
  };
};

/**
 * 이미지 압축 품질 계산 (네트워크 상태 기반)
 */
export const calculateOptimalQuality = (): number => {
  // @ts-ignore - navigator.connection은 실험적 API
  const connection = (navigator as any).connection;
  
  if (!connection) return 85; // 기본값
  
  const effectiveType = connection.effectiveType;
  
  switch (effectiveType) {
    case '4g':
      return 90;
    case '3g':
      return 75;
    case '2g':
      return 60;
    case 'slow-2g':
      return 45;
    default:
      return 85;
  }
};

/**
 * 이미지 차원 계산 (aspect ratio 유지)
 */
export const calculateImageDimensions = (
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight?: number
): { width: number; height: number } => {
  const aspectRatio = originalWidth / originalHeight;
  
  let width = Math.min(originalWidth, maxWidth);
  let height = width / aspectRatio;
  
  if (maxHeight && height > maxHeight) {
    height = maxHeight;
    width = height * aspectRatio;
  }
  
  return {
    width: Math.round(width),
    height: Math.round(height)
  };
};

/**
 * 이미지 URL 검증
 */
export const isValidImageURL = (url: string): boolean => {
  try {
    const parsedURL = new URL(url, window.location.origin);
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.svg'];
    
    return imageExtensions.some(ext => 
      parsedURL.pathname.toLowerCase().endsWith(ext)
    ) || url.startsWith('data:image/');
  } catch {
    return false;
  }
};

/**
 * 프로그레시브 이미지 로딩을 위한 이미지 크기 순서
 */
export const getProgressiveLoadingOrder = (availableSizes: string[]): string[] => {
  const sizeOrder = ['thumbnail', 'small', 'medium', 'large', 'original'];
  
  return sizeOrder.filter(size => availableSizes.includes(size));
};

/**
 * 이미지 메타데이터 추출
 */
export const extractImageMetadata = (file: File): Promise<{
  width: number;
  height: number;
  aspectRatio: number;
  fileSize: number;
  format: string;
}> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('파일이 이미지가 아닙니다.'));
      return;
    }
    
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      const metadata = {
        width: img.naturalWidth,
        height: img.naturalHeight,
        aspectRatio: img.naturalWidth / img.naturalHeight,
        fileSize: file.size,
        format: file.type
      };
      
      URL.revokeObjectURL(url);
      resolve(metadata);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('이미지를 로드할 수 없습니다.'));
    };
    
    img.src = url;
  });
};

/**
 * 이미지 리사이즈 (클라이언트 사이드)
 */
export const resizeImage = (
  file: File,
  maxWidth: number,
  maxHeight: number,
  quality: number = 0.8
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    if (!ctx) {
      reject(new Error('Canvas context를 생성할 수 없습니다.'));
      return;
    }
    
    img.onload = () => {
      const { width, height } = calculateImageDimensions(
        img.naturalWidth,
        img.naturalHeight,
        maxWidth,
        maxHeight
      );
      
      canvas.width = width;
      canvas.height = height;
      
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('이미지 리사이즈에 실패했습니다.'));
          }
        },
        'image/jpeg',
        quality
      );
    };
    
    img.onerror = () => {
      reject(new Error('이미지를 로드할 수 없습니다.'));
    };
    
    img.src = URL.createObjectURL(file);
  });
}; 