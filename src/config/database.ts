/**
 * MongoDB Atlas 연결 설정
 * 
 * 이 파일은 MongoDB Atlas 연결에 필요한 설정을 제공합니다.
 * 실제 배포 환경에서는 환경 변수를 통해 이 값들을 설정하는 것이 안전합니다.
 */

// MongoDB Atlas 연결 정보
export const DB_CONFIG = {
  // MongoDB Atlas 연결 URL (환경 변수에서 가져오거나 기본값 사용)
  // .env 파일에 MONGODB_URI 또는 MONGO_URI 사용 확인
  MONGODB_URI: process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb+srv://<username>:<password>@<cluster-url>/plp_database?retryWrites=true&w=majority',
  
  // 데이터베이스 이름
  DATABASE_NAME: 'plp_database',
  
  // 컬렉션 이름
  COLLECTIONS: {
    SCHEDULES: 'schedules',
    PROFESSORS: 'professors',
    GREETING: 'greeting',
    RECOMMENDATIONS: 'recommendations',
    OBJECTIVES: 'objectives',
    BENEFITS: 'benefits',
    LECTURERS: 'lecturers',
    GALLERY: 'gallery',
    NOTICES: 'notices',
    ADMISSION: 'admission',
    FOOTER: 'footer'
  }
};

// MongoDB 연결 상태 확인을 위한 타임아웃 설정 (밀리초)
export const CONNECTION_TIMEOUT = 5000; // 5초

// 재시도 설정
export const RETRY_OPTIONS = {
  MAX_ATTEMPTS: 3,
  DELAY_MS: 1000, // 1초
}; 