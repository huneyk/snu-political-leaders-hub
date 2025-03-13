import fileStorage from '../fileStorage.js';

/**
 * 콘텐츠 타입 인터페이스
 * @typedef {Object} ContentType
 * @property {string} id - 콘텐츠 타입 ID
 * @property {string} name - 콘텐츠 타입 이름
 * @property {string} description - 콘텐츠 타입 설명
 */

/**
 * 인사말 콘텐츠 인터페이스
 * @typedef {Object} GreetingContent
 * @property {string} title - 인사말 제목
 * @property {string} content - 인사말 내용
 * @property {string} imageUrl - 인사말 이미지 URL
 */

/**
 * 일정 콘텐츠 인터페이스
 * @typedef {Object} ScheduleContent
 * @property {Array<Object>} events - 일정 이벤트 배열
 */

/**
 * 추천 콘텐츠 인터페이스
 * @typedef {Object} RecommendationsContent
 * @property {Array<Object>} items - 추천 항목 배열
 */

/**
 * 교수진 콘텐츠 인터페이스
 * @typedef {Object} FacultyContent
 * @property {Array<Object>} members - 교수진 멤버 배열
 */

/**
 * 동문 콘텐츠 인터페이스
 * @typedef {Object} AlumniContent
 * @property {Array<Object>} members - 동문 멤버 배열
 */

/**
 * 갤러리 콘텐츠 인터페이스
 * @typedef {Object} GalleryContent
 * @property {Array<Object>} images - 갤러리 이미지 배열
 */

// 콘텐츠 타입 목록
const contentTypes = [
  'greeting',
  'schedule',
  'recommendations',
  'faculty',
  'alumni',
  'gallery'
];

// 백업 키 접미사
const BACKUP_SUFFIXES = ['_backup1', '_backup2'];

/**
 * 여러 키에 데이터 저장
 * @param {string} baseKey - 기본 키
 * @param {object} data - 저장할 데이터
 * @returns {boolean} - 저장 성공 여부
 */
const saveToMultipleKeys = (baseKey, data) => {
  try {
    // 기본 키에 저장
    const mainSaved = fileStorage.saveData(baseKey, data);
    
    // 백업 키에 저장
    const backupResults = BACKUP_SUFFIXES.map(suffix => {
      return fileStorage.saveData(`${baseKey}${suffix}`, data);
    });
    
    // 모든 저장 작업이 성공했는지 확인
    const allSaved = mainSaved && backupResults.every(result => result === true);
    
    if (!allSaved) {
      console.warn(`일부 저장소에 ${baseKey} 데이터 저장 실패`);
    }
    
    return mainSaved; // 최소한 메인 저장소에 저장되었는지 반환
  } catch (error) {
    console.error(`여러 키에 데이터 저장 오류 (${baseKey}):`, error);
    return false;
  }
};

/**
 * 여러 키에서 데이터 로드
 * @param {string} baseKey - 기본 키
 * @param {object} defaultData - 기본 데이터
 * @returns {object} - 로드된 데이터
 */
const loadFromMultipleKeys = (baseKey, defaultData = {}) => {
  try {
    // 기본 키에서 로드 시도
    let data = fileStorage.loadData(baseKey, null);
    
    // 기본 키에서 데이터를 찾지 못한 경우 백업 키에서 로드 시도
    if (data === null) {
      for (const suffix of BACKUP_SUFFIXES) {
        const backupKey = `${baseKey}${suffix}`;
        const backupData = fileStorage.loadData(backupKey, null);
        
        if (backupData !== null) {
          console.log(`백업 키 ${backupKey}에서 데이터 복구됨`);
          data = backupData;
          
          // 복구된 데이터를 기본 키에 다시 저장
          fileStorage.saveData(baseKey, data);
          break;
        }
      }
    }
    
    // 모든 키에서 데이터를 찾지 못한 경우 기본 데이터 반환
    return data !== null ? data : defaultData;
  } catch (error) {
    console.error(`여러 키에서 데이터 로드 오류 (${baseKey}):`, error);
    return defaultData;
  }
};

/**
 * 콘텐츠 서비스 객체
 */
const contentService = {
  /**
   * 사용 가능한 콘텐츠 타입 목록 반환
   * @returns {Array<string>} - 콘텐츠 타입 목록
   */
  getContentTypes: () => contentTypes,
  
  /**
   * 특정 타입의 콘텐츠 로드
   * @param {string} type - 콘텐츠 타입
   * @returns {object} - 로드된 콘텐츠
   */
  getContent: (type) => {
    if (!contentTypes.includes(type)) {
      console.error(`유효하지 않은 콘텐츠 타입: ${type}`);
      return {};
    }
    
    // 타입별 기본 데이터 구조 정의
    const defaultData = {};
    
    return loadFromMultipleKeys(type, defaultData);
  },
  
  /**
   * 특정 타입의 콘텐츠 저장
   * @param {string} type - 콘텐츠 타입
   * @param {object} data - 저장할 콘텐츠 데이터
   * @returns {boolean} - 저장 성공 여부
   */
  saveContent: (type, data) => {
    if (!contentTypes.includes(type)) {
      console.error(`유효하지 않은 콘텐츠 타입: ${type}`);
      return false;
    }
    
    return saveToMultipleKeys(type, data);
  },
  
  /**
   * 모든 콘텐츠 로드
   * @returns {object} - 모든 콘텐츠를 포함하는 객체
   */
  getAllContent: () => {
    const result = {};
    
    contentTypes.forEach(type => {
      result[type] = contentService.getContent(type);
    });
    
    return result;
  },
  
  /**
   * 콘텐츠 데이터 검증
   * @param {string} type - 콘텐츠 타입
   * @param {object} data - 검증할 데이터
   * @returns {boolean} - 검증 결과
   */
  validateContent: (type, data) => {
    // 기본적인 검증 로직 (향후 확장 가능)
    if (!data || typeof data !== 'object') {
      return false;
    }
    
    // 타입별 검증 로직
    switch (type) {
      case 'greeting':
        return data.title && data.content;
      case 'schedule':
        return Array.isArray(data.events);
      case 'recommendations':
        return Array.isArray(data.items);
      case 'faculty':
        return Array.isArray(data.members);
      case 'alumni':
        return Array.isArray(data.members);
      case 'gallery':
        return Array.isArray(data.images);
      default:
        return true;
    }
  },
  
  /**
   * 콘텐츠 백업 생성
   * @param {string} type - 콘텐츠 타입
   * @returns {boolean} - 백업 성공 여부
   */
  createBackup: (type) => {
    if (!contentTypes.includes(type)) {
      console.error(`유효하지 않은 콘텐츠 타입: ${type}`);
      return false;
    }
    
    const data = contentService.getContent(type);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupKey = `${type}_backup_${timestamp}`;
    
    return fileStorage.saveData(backupKey, data);
  },
  
  /**
   * 모든 콘텐츠 백업 생성
   * @returns {boolean} - 백업 성공 여부
   */
  createAllBackups: () => {
    let allSuccess = true;
    
    contentTypes.forEach(type => {
      const success = contentService.createBackup(type);
      if (!success) {
        allSuccess = false;
      }
    });
    
    return allSuccess;
  }
};

export default contentService; 