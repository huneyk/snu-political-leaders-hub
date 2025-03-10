const fs = require('fs');
const path = require('path');

// 데이터 저장 디렉토리 (Render 환경에서는 /tmp 디렉토리 사용)
const DATA_DIR = process.env.NODE_ENV === 'production' 
  ? path.join('/tmp', 'data') 
  : path.join(__dirname, 'data');

console.log('fileStorage: 데이터 디렉토리 경로:', DATA_DIR);

// 데이터 디렉토리가 없으면 생성
if (!fs.existsSync(DATA_DIR)) {
  console.log('fileStorage: 데이터 디렉토리가 없어 생성합니다.');
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    console.log('fileStorage: 데이터 디렉토리 생성 성공');
  } catch (error) {
    console.error('fileStorage: 데이터 디렉토리 생성 실패:', error);
  }
}

// 파일 경로 생성 함수
const getFilePath = (type) => {
  const filePath = path.join(DATA_DIR, `${type}.json`);
  console.log(`fileStorage: '${type}' 파일 경로:`, filePath);
  return filePath;
};

// 데이터 저장 함수
const saveData = (type, data) => {
  try {
    console.log(`fileStorage: '${type}' 데이터 저장 시작`);
    console.log('fileStorage: 저장할 데이터:', data);
    
    const filePath = getFilePath(type);
    
    // 디렉토리 존재 확인
    const dirPath = path.dirname(filePath);
    if (!fs.existsSync(dirPath)) {
      console.log(`fileStorage: 디렉토리 '${dirPath}'가 없어 생성합니다.`);
      fs.mkdirSync(dirPath, { recursive: true });
    }
    
    // 데이터를 문자열로 변환
    const jsonData = JSON.stringify(data, null, 2);
    console.log(`fileStorage: 저장할 JSON 데이터:`, jsonData);
    
    // 파일에 쓰기
    fs.writeFileSync(filePath, jsonData, 'utf8');
    
    // 파일 쓰기 확인
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      console.log(`fileStorage: 파일 '${filePath}' 저장 성공 (크기: ${stats.size} 바이트)`);
    } else {
      console.log(`fileStorage: 파일 '${filePath}'이 생성되지 않았습니다.`);
    }
    
    console.log(`fileStorage: Data saved to ${filePath}`);
    return true;
  } catch (error) {
    console.error(`fileStorage: Error saving data to file (${type}):`, error);
    return false;
  }
};

// 데이터 로드 함수
const loadData = (type, defaultData = {}) => {
  try {
    console.log(`fileStorage: '${type}' 데이터 로드 시작`);
    
    const filePath = getFilePath(type);
    console.log(`fileStorage: 파일 존재 여부: ${fs.existsSync(filePath)}`);
    
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      console.log(`fileStorage: 로드된 데이터 (${type}):`, data);
      
      const parsedData = JSON.parse(data);
      console.log(`fileStorage: 파싱된 데이터 (${type}):`, parsedData);
      
      return parsedData;
    }
    
    console.log(`fileStorage: '${type}' 파일이 없어 기본값 반환:`, defaultData);
    return defaultData;
  } catch (error) {
    console.error(`fileStorage: Error loading data from file (${type}):`, error);
    return defaultData;
  }
};

// 모든 데이터 타입 로드 함수
const loadAllData = () => {
  try {
    console.log('fileStorage: 모든 데이터 로드 시작');
    
    // 디렉토리 존재 확인
    if (!fs.existsSync(DATA_DIR)) {
      console.log(`fileStorage: 데이터 디렉토리 '${DATA_DIR}'가 없습니다.`);
      return {};
    }
    
    const files = fs.readdirSync(DATA_DIR);
    console.log(`fileStorage: 데이터 디렉토리 내 파일 목록:`, files);
    
    const data = {};
    
    files.forEach(file => {
      if (file.endsWith('.json')) {
        const type = file.replace('.json', '');
        console.log(`fileStorage: '${type}' 데이터 로드 중...`);
        data[type] = loadData(type);
      }
    });
    
    console.log('fileStorage: 모든 데이터 로드 완료:', data);
    return data;
  } catch (error) {
    console.error('fileStorage: Error loading all data:', error);
    return {};
  }
};

// 데이터 삭제 함수
const deleteData = (type) => {
  try {
    console.log(`fileStorage: '${type}' 데이터 삭제 시작`);
    
    const filePath = getFilePath(type);
    console.log(`fileStorage: 파일 존재 여부: ${fs.existsSync(filePath)}`);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`fileStorage: Data deleted from ${filePath}`);
      return true;
    }
    
    console.log(`fileStorage: '${type}' 파일이 없어 삭제할 수 없습니다.`);
    return false;
  } catch (error) {
    console.error(`fileStorage: Error deleting data from file (${type}):`, error);
    return false;
  }
};

module.exports = {
  saveData,
  loadData,
  loadAllData,
  deleteData
}; 