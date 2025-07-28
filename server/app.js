const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');

// 환경 변수 로드
dotenv.config();

// Express 앱 생성
const app = express();

// 미들웨어 설정
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:8080',
    'https://snu-political-leaders-hub-1.onrender.com',
    'https://snu-plp-hub-server.onrender.com',
    'https://plpsnu.ne.kr',
    'https://www.plpsnu.ne.kr'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' })); // 이미지 Base64 처리를 위해 용량 제한 증가
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 보안 헤더 추가
app.use((req, res, next) => {
  res.header('X-Powered-By', 'SNU-PLP-Server');
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  next();
});

// 요청 로깅 (production에서만)
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
  });
}

// 업로드 디렉토리 설정
const uploadDir = path.join(__dirname, 'uploads');
// 업로드 디렉토리가 없으면 생성
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('업로드 디렉토리 생성됨:', uploadDir);
}
// 업로드된 파일의 정적 접근 경로 설정
app.use('/uploads', express.static(uploadDir));

// 이미지 업로드 디렉토리 설정
const imageUploadDir = path.join(__dirname, 'uploads', 'images');
if (!fs.existsSync(imageUploadDir)) {
  fs.mkdirSync(imageUploadDir, { recursive: true });
  console.log('이미지 업로드 디렉토리 생성됨:', imageUploadDir);
}
// 이미지 파일의 정적 접근 경로 설정
app.use('/uploads/images', express.static(imageUploadDir));
console.log('정적 파일 경로 설정됨:', '/uploads ->', uploadDir);

// 정적 파일 제공 (개발 환경에서만)
// Removed static file serving to prevent API conflicts

// 라우트 불러오기
const usersRoutes = require('./routes/usersRoutes');
const contentRoutes = require('./routes/contentRoutes');
const authRoutes = require('./routes/authRoutes');
const galleryRoutes = require('./routes/galleryRoutes');

// 갤러리 특수 라우트용 모듈들
const Gallery = require('./models/Gallery');
const GalleryThumbnail = require('./models/GalleryThumbnail');
const galleryThumbnailService = require('./services/galleryThumbnailService');
const { isAdmin } = require('./middleware/authMiddleware');
const noticeRoutes = require('./routes/noticeRoutes');
const graduateRoutes = require('./routes/graduateRoutes');
const footerRoutes = require('./routes/footerRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const admissionRoutes = require('./routes/admissionRoutes');
const lecturersRoutes = require('./routes/lecturersRoutes');
const schedulesRoutes = require('./routes/schedulesRoutes');
const objectivesRoutes = require('./routes/objectivesRoutes');
const benefitsRoutes = require('./routes/benefitsRoutes');
const professorsRoutes = require('./routes/professorsRoutes');
const recommendationsRoutes = require('./routes/recommendationsRoutes');
const greetingRoutes = require('./routes/greetingRoutes');
const imageUploadRoutes = require('./routes/imageUploadRoutes');

// ===== 🚨 CRITICAL: 갤러리 특수 라우트 (galleryRoutes 전에 정의) =====

// 헬퍼 함수: 유효한 기수들 조회
async function getValidTerms() {
  try {
    const galleryTerms = await Gallery.distinct('term').then(terms => terms.filter(term => term != null));
    const validTerms = [...new Set(galleryTerms.map(String))].sort((a, b) => Number(a) - Number(b));
    console.log('🔍 [APP.JS] 갤러리에 실제 존재하는 기수들:', validTerms);
    return validTerms;
  } catch (error) {
    console.error('[APP.JS] 기수 조회 중 오류:', error);
    return [];
  }
}

// 🎯 /api/gallery/thumbnails - 최우선 라우트
app.get('/api/gallery/thumbnails', async (req, res) => {
  try {
    console.log('🚀 [APP.JS DIRECT] /api/gallery/thumbnails 요청 받음!');
    console.log('📋 [APP.JS DIRECT] 요청 정보:', {
      method: req.method,
      originalUrl: req.originalUrl,
      path: req.path,
      headers: req.headers['user-agent'] ? req.headers['user-agent'].substring(0, 50) : 'no-agent'
    });
    
    const thumbnails = await galleryThumbnailService.getAllThumbnails();
    console.log(`✅ [APP.JS DIRECT] 썸네일 조회 성공: ${thumbnails.length}개`);
    
    res.json(thumbnails);
  } catch (error) {
    console.error('❌ [APP.JS DIRECT] 썸네일 조회 실패:', error);
    res.status(500).json({ 
      message: '썸네일 목록을 불러오는 중 오류가 발생했습니다.',
      error: error.message,
      source: 'app.js-direct-route'
    });
  }
});

// 🎯 /api/gallery/valid-terms - 우선 라우트
app.get('/api/gallery/valid-terms', async (req, res) => {
  try {
    console.log('🚀 [APP.JS DIRECT] /api/gallery/valid-terms 요청 받음!');
    
    const validTerms = await getValidTerms();
    console.log(`✅ [APP.JS DIRECT] 유효한 기수 조회 성공: ${validTerms.length}개`);
    
    res.json({
      terms: validTerms,
      count: validTerms.length,
      source: 'app.js-direct-route'
    });
  } catch (error) {
    console.error('❌ [APP.JS DIRECT] 유효한 기수 조회 실패:', error);
    res.status(500).json({ 
      message: '기수 정보를 불러오는 중 오류가 발생했습니다.',
      error: error.message,
      source: 'app.js-direct-route'
    });
  }
});

// 🎯 /api/gallery/health - 헬스체크 라우트
app.get('/api/gallery/health', async (req, res) => {
  try {
    console.log('🚀 [APP.JS DIRECT] /api/gallery/health 요청 받음!');
    
    const totalCount = await Gallery.countDocuments();
    const termDistribution = await Gallery.aggregate([
      { $group: { _id: '$term', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    const term1Sample = await Gallery.findOne({ term: 1 });
    const term2Sample = await Gallery.findOne({ term: 2 });
    
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        totalGalleryItems: totalCount,
        termDistribution: termDistribution,
        samples: {
          term1: term1Sample ? { 
            id: term1Sample._id, 
            title: term1Sample.title, 
            term: term1Sample.term 
          } : null,
          term2: term2Sample ? { 
            id: term2Sample._id, 
            title: term2Sample.title, 
            term: term2Sample.term 
          } : null
        }
      },
      source: 'app.js-direct-route'
    };
    
    console.log('✅ [APP.JS DIRECT] 헬스체크 성공');
    res.json(healthData);
  } catch (error) {
    console.error('❌ [APP.JS DIRECT] 헬스체크 실패:', error);
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
      database: { connected: false },
      source: 'app.js-direct-route'
    });
  }
});

// 🎯 /api/gallery/thumbnails/generate - 전체 썸네일 생성 (관리자 전용)
app.post('/api/gallery/thumbnails/generate', isAdmin, async (req, res) => {
  try {
    console.log('🚀 [APP.JS DIRECT] /api/gallery/thumbnails/generate 요청 받음 (관리자)!');
    
    const results = await galleryThumbnailService.generateAllThumbnails();
    console.log(`✅ [APP.JS DIRECT] 전체 썸네일 생성 완료: ${results.length}개`);
    
    res.json({
      message: `${results.length}개 기수의 썸네일이 생성/업데이트되었습니다.`,
      thumbnails: results,
      source: 'app.js-direct-route'
    });
  } catch (error) {
    console.error('❌ [APP.JS DIRECT] 전체 썸네일 생성 실패:', error);
    res.status(500).json({ 
      message: '썸네일 생성 중 오류가 발생했습니다.',
      error: error.message,
      source: 'app.js-direct-route'
    });
  }
});

// 🎯 /api/gallery/thumbnails/generate/:term - 특정 기수 썸네일 생성 (관리자 전용)
app.post('/api/gallery/thumbnails/generate/:term', isAdmin, async (req, res) => {
  try {
    const { term } = req.params;
    const termNumber = Number(term);
    
    console.log(`🚀 [APP.JS DIRECT] /api/gallery/thumbnails/generate/${term} 요청 받음 (관리자)!`);
    
    if (isNaN(termNumber)) {
      return res.status(400).json({ 
        message: '유효하지 않은 기수 형식입니다.',
        source: 'app.js-direct-route'
      });
    }
    
    const result = await galleryThumbnailService.generateThumbnailForTerm(termNumber);
    
    if (result) {
      console.log(`✅ [APP.JS DIRECT] 제${termNumber}기 썸네일 생성 완료`);
      res.json({
        message: `제${termNumber}기 썸네일이 생성/업데이트되었습니다.`,
        thumbnail: result,
        source: 'app.js-direct-route'
      });
    } else {
      res.status(404).json({
        message: `제${termNumber}기에 이미지가 있는 갤러리 아이템이 없습니다.`,
        source: 'app.js-direct-route'
      });
    }
  } catch (error) {
    console.error(`❌ [APP.JS DIRECT] 제${req.params.term}기 썸네일 생성 실패:`, error);
    res.status(500).json({ 
      message: '썸네일 생성 중 오류가 발생했습니다.',
      error: error.message,
      source: 'app.js-direct-route'
    });
  }
});

// ===== 일반 라우트 설정 =====
app.use('/api/users', usersRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/graduates', graduateRoutes);
app.use('/api/footer', footerRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admissions', admissionRoutes);
app.use('/api/lecturers', lecturersRoutes);
app.use('/api/schedules', schedulesRoutes);
app.use('/api/objectives', objectivesRoutes);
app.use('/api/benefits', benefitsRoutes);
app.use('/api/professors', professorsRoutes);
app.use('/api/recommendations', recommendationsRoutes);
app.use('/api/greeting', greetingRoutes);
app.use('/api/images', imageUploadRoutes);

// 기본 경로 및 Health Check
app.get('/api', (req, res) => {
  res.json({ 
    message: 'API 서버가 실행 중입니다.',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Health check 엔드포인트 (Render용)
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// MongoDB 연결 설정 개선
const connectDB = async () => {
  try {
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10, // 최대 연결 풀 크기
      serverSelectionTimeoutMS: 5000, // 서버 선택 타임아웃
      socketTimeoutMS: 45000, // 소켓 타임아웃
      family: 4 // IPv4 사용
    };

    await mongoose.connect(process.env.MONGODB_URI, options);
    console.log('MongoDB Atlas에 연결되었습니다.');
    
    // DB 연결 성공 시 컬렉션 확인
    mongoose.connection.db.listCollections().toArray((err, collections) => {
      if (err) {
        console.error('컬렉션 목록 조회 실패:', err);
      } else {
        console.log('사용 가능한 컬렉션:', collections.map(c => c.name).join(', '));
      }
    });
  } catch (error) {
    console.error('MongoDB 연결 실패:', error);
    process.exit(1);
  }
};

// MongoDB 연결 이벤트 처리
mongoose.connection.on('connected', () => {
  console.log('MongoDB 연결됨');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB 연결 오류:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB 연결 해제됨');
});

// 프로세스 종료 시 MongoDB 연결 정리
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB 연결이 닫혔습니다.');
  process.exit(0);
});

// 연결 시작
connectDB();

// 404 에러 핸들링 (API 경로가 아닌 경우에만)
app.use('/api/*', (req, res) => {
  res.status(404).json({ 
    message: '요청한 API 경로를 찾을 수 없습니다.',
    path: req.originalUrl 
  });
});

// 루트가 아닌 모든 경로에 대해 404 반환 (API 서버이므로)
app.use('*', (req, res) => {
  res.status(404).json({ 
    message: 'API 서버입니다. /api/* 경로만 지원됩니다.',
    path: req.originalUrl 
  });
});

// 전역 에러 핸들링 미들웨어
app.use((err, req, res, next) => {
  console.error('서버 오류:', err);
  
  if (res.headersSent) {
    return next(err);
  }
  
  res.status(500).json({
    message: process.env.NODE_ENV === 'production' 
      ? '서버 내부 오류가 발생했습니다.' 
      : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// SPA support disabled for API-only server
// Removed catch-all route to prevent API conflicts

// 서버 시작
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
}); 