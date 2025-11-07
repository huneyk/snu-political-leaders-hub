/**
 * Gallery 이미지 URL 헬퍼 함수
 */

const API_BASE_URL = import.meta.env.MODE === 'production' 
  ? 'https://snu-plp-hub-server.onrender.com/api' 
  : 'http://localhost:5001/api';

/**
 * GridFS 파일 ID를 이미지 URL로 변환
 * @param imageId GridFS 파일 ID 또는 Base64 이미지 데이터
 * @returns 이미지 URL
 */
export function getGalleryImageUrl(imageId: string | null | undefined): string {
  if (!imageId) {
    // 기본 placeholder 이미지
    return '/placeholder.svg';
  }
  
  // Base64 이미지인지 확인 (마이그레이션 이전 데이터 호환)
  if (imageId.startsWith('data:image/')) {
    return imageId;
  }
  
  // GridFS 파일 ID를 API 엔드포인트로 변환
  return `${API_BASE_URL}/gallery/image/${imageId}`;
}

/**
 * Footer 파일 다운로드 URL 생성
 * @param fileType 파일 타입 ('wordFile', 'hwpFile', 'pdfFile')
 * @returns 다운로드 URL
 */
export function getFooterFileUrl(fileType: 'wordFile' | 'hwpFile' | 'pdfFile'): string {
  return `${API_BASE_URL}/footer/download/${fileType}`;
}
