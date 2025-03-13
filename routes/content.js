import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fileStorage from '../fileStorage.js';
import contentService from '../lib/contentService.js';

// ES 모듈에서 __dirname 사용하기
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// 메모리 내 콘텐츠 저장소 (MongoDB가 없는 경우 사용)
const inMemoryContent = new Map();

// 데이터 디렉토리 확인 및 생성
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// 인증 미들웨어
const authMiddleware = (req, res, next) => {
  try {
    const token = req.header('x-auth-token');
    
    if (!token) {
      return res.status(401).json({ message: '인증 토큰이 없습니다.' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
  }
};

// 관리자 권한 확인 미들웨어
const adminMiddleware = (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: '관리자 권한이 필요합니다.' });
  }
  next();
};

// 콘텐츠 타입 목록
const contentTypes = [
  'greeting',
  'schedule',
  'recommendations',
  'faculty',
  'alumni',
  'gallery'
];

// 콘텐츠 로드 함수
const loadContent = (type) => {
  try {
    const filePath = path.join(dataDir, `${type}.json`);
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
    return null;
  } catch (error) {
    console.error(`${type} 콘텐츠 로드 오류:`, error);
    return null;
  }
};

// 콘텐츠 저장 함수
const saveContent = (type, data) => {
  try {
    const filePath = path.join(dataDir, `${type}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`${type} 콘텐츠를 파일에 저장했습니다.`);
    return true;
  } catch (error) {
    console.error(`${type} 콘텐츠 저장 오류:`, error);
    return false;
  }
};

// 초기 콘텐츠 로드
contentTypes.forEach(type => {
  const content = loadContent(type);
  if (content) {
    inMemoryContent.set(type, content);
    console.log(`${type} 콘텐츠를 파일에서 로드했습니다.`);
  }
});

// @route   GET /api/content/types
// @desc    사용 가능한 콘텐츠 타입 목록 조회
// @access  Public
router.get('/types', (req, res) => {
  res.json(contentService.getContentTypes());
});

// @route   GET /api/content/:type
// @desc    특정 타입의 콘텐츠 조회
// @access  Public
router.get('/:type', (req, res) => {
  try {
    const { type } = req.params;
    
    if (!contentService.getContentTypes().includes(type)) {
      return res.status(400).json({ message: '유효하지 않은 콘텐츠 타입입니다.' });
    }
    
    // contentService를 사용하여 콘텐츠 조회
    const content = contentService.getContent(type);
    
    // 콘텐츠가 없으면 빈 객체 반환
    res.json(content || {});
  } catch (error) {
    console.error('콘텐츠 조회 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// @route   POST /api/content/:type
// @desc    특정 타입의 콘텐츠 저장 (관리자 전용)
// @access  Private/Admin
router.post('/:type', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const { type } = req.params;
    const contentData = req.body;
    
    if (!contentService.getContentTypes().includes(type)) {
      return res.status(400).json({ message: '유효하지 않은 콘텐츠 타입입니다.' });
    }
    
    // 콘텐츠 데이터 검증
    if (!contentService.validateContent(type, contentData)) {
      return res.status(400).json({ message: '유효하지 않은 콘텐츠 데이터입니다.' });
    }
    
    // contentService를 사용하여 콘텐츠 저장
    const saved = contentService.saveContent(type, contentData);
    
    if (!saved) {
      return res.status(500).json({ message: '콘텐츠 저장 중 오류가 발생했습니다.' });
    }
    
    // 백업 생성
    contentService.createBackup(type);
    
    res.json({ message: `${type} 콘텐츠가 저장되었습니다.`, data: contentData });
  } catch (error) {
    console.error('콘텐츠 저장 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// @route   POST /api/content/:type/image
// @desc    특정 타입의 콘텐츠에 이미지 업로드 (관리자 전용)
// @access  Private/Admin
router.post('/:type/image', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const { type } = req.params;
    const { image, filename } = req.body;
    
    if (!contentService.getContentTypes().includes(type)) {
      return res.status(400).json({ message: '유효하지 않은 콘텐츠 타입입니다.' });
    }
    
    if (!image || !filename) {
      return res.status(400).json({ message: '이미지와 파일명이 필요합니다.' });
    }
    
    // 이미지 디렉토리 확인 및 생성
    const imagesDir = path.join(dataDir, 'images', type);
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }
    
    // Base64 이미지 저장
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const imagePath = path.join(imagesDir, filename);
    
    fs.writeFileSync(imagePath, buffer);
    
    // 이미지 URL 생성
    const imageUrl = `/api/content/images/${type}/${filename}`;
    
    res.json({ message: '이미지가 업로드되었습니다.', imageUrl });
  } catch (error) {
    console.error('이미지 업로드 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// @route   GET /api/content/images/:type/:filename
// @desc    이미지 파일 조회
// @access  Public
router.get('/images/:type/:filename', (req, res) => {
  try {
    const { type, filename } = req.params;
    const imagePath = path.join(dataDir, 'images', type, filename);
    
    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({ message: '이미지를 찾을 수 없습니다.' });
    }
    
    res.sendFile(imagePath);
  } catch (error) {
    console.error('이미지 조회 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// @route   GET /api/content/backup/:type
// @desc    특정 타입의 콘텐츠 백업 생성 (관리자 전용)
// @access  Private/Admin
router.get('/backup/:type', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const { type } = req.params;
    
    if (!contentService.getContentTypes().includes(type)) {
      return res.status(400).json({ message: '유효하지 않은 콘텐츠 타입입니다.' });
    }
    
    const success = contentService.createBackup(type);
    
    if (success) {
      res.json({ message: `${type} 콘텐츠 백업이 생성되었습니다.` });
    } else {
      res.status(500).json({ message: '백업 생성 중 오류가 발생했습니다.' });
    }
  } catch (error) {
    console.error('백업 생성 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// @route   GET /api/content/backup/all
// @desc    모든 콘텐츠 백업 생성 (관리자 전용)
// @access  Private/Admin
router.get('/backup/all', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const success = contentService.createAllBackups();
    
    if (success) {
      res.json({ message: '모든 콘텐츠 백업이 생성되었습니다.' });
    } else {
      res.status(500).json({ message: '일부 백업 생성 중 오류가 발생했습니다.' });
    }
  } catch (error) {
    console.error('백업 생성 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

export default router; 