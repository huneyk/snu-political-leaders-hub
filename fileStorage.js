import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ES 모듈에서 __dirname 사용하기
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 데이터 디렉토리 설정 (Render 환경에서는 /tmp 디렉토리 사용)
const DATA_DIR = process.env.NODE_ENV === 'production' 
  ? path.join('/tmp', 'data') 
  : path.join(__dirname, 'data');

// 메모리 캐시 추가 (Render 환경에서 파일 시스템 데이터 손실 방지)
const memoryCache = new Map();

// 데이터 디렉토리 확인 및 생성
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  console.log(`데이터 디렉토리 생성됨: ${DATA_DIR}`);
} else {
  console.log(`데이터 디렉토리 확인됨: ${DATA_DIR}`);
}

/**
 * 특정 타입의 데이터를 파일에 저장
 * @param {string} type - 데이터 타입
 * @param {object} data - 저장할 데이터
 * @returns {boolean} - 저장 성공 여부
 */
const saveData = (type, data) => {
  try {
    // 메모리 캐시에 저장
    memoryCache.set(type, data);
    
    const filePath = path.join(DATA_DIR, `${type}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`데이터 저장됨: ${type}`);
    
    // Render 환경에서는 로그 추가
    if (process.env.NODE_ENV === 'production') {
      console.log(`Render 환경 데이터 저장 경로: ${filePath}`);
      console.log(`Render 환경 데이터 저장 내용: ${JSON.stringify(data).substring(0, 100)}...`);
    }
    
    return true;
  } catch (error) {
    console.error(`데이터 저장 오류 (${type}):`, error);
    return false;
  }
};

/**
 * 특정 타입의 데이터를 파일에서 로드
 * @param {string} type - 데이터 타입
 * @param {object} defaultData - 파일이 없을 경우 반환할 기본 데이터
 * @returns {object} - 로드된 데이터 또는 기본 데이터
 */
const loadData = (type, defaultData = {}) => {
  try {
    // 먼저 메모리 캐시에서 확인
    if (memoryCache.has(type)) {
      console.log(`메모리 캐시에서 데이터 로드됨: ${type}`);
      return memoryCache.get(type);
    }
    
    const filePath = path.join(DATA_DIR, `${type}.json`);
    
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      console.log(`파일에서 데이터 로드됨: ${type}`);
      
      // 로드된 데이터를 메모리 캐시에 저장
      const parsedData = JSON.parse(data);
      memoryCache.set(type, parsedData);
      
      return parsedData;
    } else {
      console.log(`데이터 파일 없음, 기본값 반환: ${type}`);
      return defaultData;
    }
  } catch (error) {
    console.error(`데이터 로드 오류 (${type}):`, error);
    return defaultData;
  }
};

/**
 * 특정 타입의 데이터를 파일에서 삭제
 * @param {string} type - 데이터 타입
 * @returns {boolean} - 삭제 성공 여부
 */
const deleteData = (type) => {
  try {
    // 메모리 캐시에서 삭제
    memoryCache.delete(type);
    
    const filePath = path.join(DATA_DIR, `${type}.json`);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`데이터 삭제됨: ${type}`);
      return true;
    } else {
      console.log(`삭제할 데이터 파일 없음: ${type}`);
      return false;
    }
  } catch (error) {
    console.error(`데이터 삭제 오류 (${type}):`, error);
    return false;
  }
};

/**
 * 모든 데이터 파일 로드
 * @returns {object} - 모든 데이터를 포함하는 객체
 */
const loadAllData = () => {
  try {
    const result = {};
    
    // 먼저 메모리 캐시의 모든 데이터 가져오기
    for (const [key, value] of memoryCache.entries()) {
      result[key] = value;
    }
    
    // 파일 시스템에서 추가 데이터 로드
    if (fs.existsSync(DATA_DIR)) {
      const files = fs.readdirSync(DATA_DIR);
      
      files.forEach(file => {
        if (file.endsWith('.json')) {
          const type = file.replace('.json', '');
          // 메모리 캐시에 없는 데이터만 로드
          if (!result[type]) {
            result[type] = loadData(type);
          }
        }
      });
      
      console.log(`모든 데이터 로드됨: ${Object.keys(result).length}개 항목`);
    } else {
      console.log('데이터 디렉토리가 없습니다.');
    }
    
    return result;
  } catch (error) {
    console.error('모든 데이터 로드 오류:', error);
    return {};
  }
};

/**
 * 데이터 디렉토리 경로 반환
 * @returns {string} - 데이터 디렉토리 경로
 */
const getDataDir = () => DATA_DIR;

/**
 * 메모리 캐시 내용 확인 (디버깅용)
 * @returns {object} - 메모리 캐시 내용
 */
const getMemoryCacheStatus = () => {
  const result = {};
  for (const [key, value] of memoryCache.entries()) {
    result[key] = {
      hasData: !!value,
      size: JSON.stringify(value).length,
      summary: typeof value === 'object' ? Object.keys(value).join(', ') : typeof value
    };
  }
  return result;
};

export default {
  saveData,
  loadData,
  deleteData,
  loadAllData,
  getDataDir,
  getMemoryCacheStatus
}; 