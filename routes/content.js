const express = require('express');
const router = express.Router();
const Content = require('../models/Content');
const auth = require('../middleware/auth');
const fileStorage = require('../fileStorage');
const fs = require('fs');
const path = require('path');

// 메모리 내 콘텐츠 저장소 (MongoDB가 없는 경우 사용)
const inMemoryContent = new Map();

// 데이터 디렉토리 확인 (Render 환경에서는 /tmp 디렉토리 사용)
const DATA_DIR = process.env.NODE_ENV === 'production' 
  ? path.join('/tmp', 'data') 
  : path.join(__dirname, '..', 'data');

console.log('데이터 디렉토리 경로:', DATA_DIR);
if (!fs.existsSync(DATA_DIR)) {
  console.log('데이터 디렉토리가 없어 생성합니다.');
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// 파일에서 초기 데이터 로드
try {
  const allData = fileStorage.loadAllData();
  console.log('로드된 모든 데이터:', allData);
  Object.keys(allData).forEach(type => {
    inMemoryContent.set(type, allData[type]);
  });
  console.log('Initial content loaded from file storage');
  console.log('현재 메모리에 있는 콘텐츠:', Array.from(inMemoryContent.entries()).map(([type, content]) => ({
    type,
    dataKeys: content.data ? Object.keys(content.data) : []
  })));
} catch (error) {
  console.error('Error loading initial content from file storage:', error);
}

// 모든 콘텐츠 가져오기
router.get('/', async (req, res) => {
  try {
    // MongoDB 연결 확인
    if (req.app.locals.mongoConnected) {
      const contents = await Content.find();
      return res.json(contents);
    }
    
    // 파일 시스템 저장소 사용
    const contents = Array.from(inMemoryContent.values());
    return res.json(contents);
  } catch (err) {
    console.error('Error getting all content:', err);
    res.status(500).json({ message: err.message });
  }
});

// 특정 타입의 콘텐츠 가져오기
router.get('/:type', async (req, res) => {
  try {
    console.log(`콘텐츠 타입 '${req.params.type}' 요청됨`);
    
    // MongoDB 연결 확인
    if (req.app.locals.mongoConnected) {
      const content = await Content.findOne({ type: req.params.type });
      if (!content) {
        return res.json({ type: req.params.type, data: {} });
      }
      return res.json(content);
    }
    
    // 파일 시스템 저장소 사용
    console.log(`메모리에서 '${req.params.type}' 콘텐츠 찾는 중...`);
    console.log('현재 메모리에 있는 콘텐츠 키:', Array.from(inMemoryContent.keys()));
    
    let content;
    if (inMemoryContent.has(req.params.type)) {
      content = inMemoryContent.get(req.params.type);
      console.log(`메모리에서 '${req.params.type}' 콘텐츠를 찾았습니다:`, content);
    } else {
      console.log(`메모리에서 '${req.params.type}' 콘텐츠를 찾지 못했습니다. 파일에서 로드합니다.`);
      content = fileStorage.loadData(req.params.type, { type: req.params.type, data: {} });
      console.log(`파일에서 로드된 '${req.params.type}' 콘텐츠:`, content);
      
      // 메모리에 없었지만 파일에서 로드된 경우 메모리에 캐시
      if (content.type === req.params.type) {
        inMemoryContent.set(req.params.type, content);
        console.log(`'${req.params.type}' 콘텐츠를 메모리에 캐시했습니다.`);
      }
    }
    
    return res.json(content);
  } catch (err) {
    console.error(`Error getting content type ${req.params.type}:`, err);
    res.status(500).json({ message: err.message });
  }
});

// 콘텐츠 생성 또는 업데이트 (인증 필요)
router.post('/:type', auth, async (req, res) => {
  try {
    console.log(`콘텐츠 타입 '${req.params.type}' 저장 요청됨`);
    console.log('요청 본문:', req.body);
    console.log('사용자 정보:', req.user);
    
    // 관리자만 콘텐츠 수정 가능
    if (req.user && req.user.role !== 'admin') {
      console.log('권한 없음: 관리자가 아닙니다.');
      return res.status(403).json({ message: '권한이 없습니다.' });
    }

    // MongoDB 연결 확인
    if (req.app.locals.mongoConnected) {
      let content = await Content.findOne({ type: req.params.type });
      
      if (content) {
        // 기존 콘텐츠 업데이트
        content.data = req.body;
        await content.save();
        console.log(`MongoDB: '${req.params.type}' 콘텐츠가 업데이트되었습니다.`);
      } else {
        // 새 콘텐츠 생성
        content = new Content({
          type: req.params.type,
          data: req.body
        });
        await content.save();
        console.log(`MongoDB: '${req.params.type}' 콘텐츠가 생성되었습니다.`);
      }
      
      return res.json(content);
    }
    
    // 파일 시스템 저장소 사용
    const content = {
      type: req.params.type,
      data: req.body,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // 메모리에 저장
    inMemoryContent.set(req.params.type, content);
    console.log(`메모리에 '${req.params.type}' 콘텐츠가 저장되었습니다.`);
    
    // 파일에 저장
    const saveResult = fileStorage.saveData(req.params.type, content);
    console.log(`파일 저장 결과: ${saveResult ? '성공' : '실패'}`);
    
    // 저장 확인
    const filePath = path.join(DATA_DIR, `${req.params.type}.json`);
    console.log(`파일 경로: ${filePath}`);
    console.log(`파일 존재 여부: ${fs.existsSync(filePath)}`);
    
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      console.log(`파일 내용: ${fileContent}`);
    }
    
    console.log(`Content type ${req.params.type} saved to file storage`);
    return res.json(content);
  } catch (err) {
    console.error(`Error saving content type ${req.params.type}:`, err);
    res.status(500).json({ message: err.message });
  }
});

// 콘텐츠 삭제 (인증 필요)
router.delete('/:type', auth, async (req, res) => {
  try {
    // 관리자만 콘텐츠 삭제 가능
    if (req.user && req.user.role !== 'admin') {
      return res.status(403).json({ message: '권한이 없습니다.' });
    }

    // MongoDB 연결 확인
    if (req.app.locals.mongoConnected) {
      const content = await Content.findOneAndDelete({ type: req.params.type });
      
      if (!content) {
        return res.status(404).json({ message: '콘텐츠를 찾을 수 없습니다.' });
      }
      
      return res.json({ message: '콘텐츠가 삭제되었습니다.' });
    }
    
    // 파일 시스템 저장소 사용
    if (!inMemoryContent.has(req.params.type)) {
      return res.status(404).json({ message: '콘텐츠를 찾을 수 없습니다.' });
    }
    
    // 메모리와 파일에서 삭제
    inMemoryContent.delete(req.params.type);
    fileStorage.deleteData(req.params.type);
    
    console.log(`Content type ${req.params.type} deleted from file storage`);
    return res.json({ message: '콘텐츠가 삭제되었습니다.' });
  } catch (err) {
    console.error(`Error deleting content type ${req.params.type}:`, err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 