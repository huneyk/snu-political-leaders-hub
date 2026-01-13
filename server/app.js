const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');

// 환경 변수 로드
dotenv.config();

// ============================================
// CWE 보안 정책 적용
// ============================================

// CWE-798: 환경변수 필수 검증 (프로덕션 환경)
if (process.env.NODE_ENV === 'production') {
  const requiredEnvVars = ['JWT_SECRET', 'MONGODB_URI'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ [CWE-798] 필수 환경변수가 설정되지 않았습니다:', missingVars.join(', '));
    process.exit(1);
  }
  
  // JWT_SECRET이 기본값인지 확인
  if (process.env.JWT_SECRET === 'snu_plp_hub_default_secret_key_2024') {
    console.error('❌ [CWE-798] JWT_SECRET이 기본값입니다. 프로덕션 환경에서는 안전한 시크릿 키를 설정해주세요.');
    process.exit(1);
  }
}

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

// ============================================
// CWE-16: 보안 헤더 설정 (Helmet)
// ============================================
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "blob:", "https:"],
      connectSrc: ["'self'", "https://snu-plp-hub-server.onrender.com", "https://plpsnu.ne.kr"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null
    }
  },
  crossOriginEmbedderPolicy: false, // 이미지 로딩을 위해 비활성화
  crossOriginResourcePolicy: { policy: "cross-origin" }, // CORS 지원
  hsts: {
    maxAge: 31536000, // 1년
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));

// X-Powered-By 헤더 커스터마이징
app.use((req, res, next) => {
  res.removeHeader('X-Powered-By');
  next();
});

// ============================================
// CWE-89: NoSQL Injection 방지
// ============================================
app.use(mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    console.warn(`🚨 [CWE-89] NoSQL Injection 시도 감지 - Key: ${key}, IP: ${req.ip}`);
  }
}));

// ============================================
// CWE-235: HTTP Parameter Pollution 방지
// ============================================
app.use(hpp({
  whitelist: ['term', 'limit', 'page'] // 허용할 중복 파라미터
}));

// ============================================
// CWE-307: Rate Limiting (전역)
// ============================================
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 1000, // 15분당 최대 1000개 요청
  message: {
    success: false,
    message: '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.',
    retryAfter: '15분'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    console.warn(`🚨 [CWE-307] Rate limit 초과 - IP: ${req.ip}, Path: ${req.path}`);
    res.status(options.statusCode).json(options.message);
  }
});

app.use('/api/', globalLimiter);

app.use(express.json({ limit: '50mb' })); // 이미지 Base64 처리를 위해 용량 제한 증가
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

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

// ============================================
// CWE-209: 전역 에러 핸들링 미들웨어 (민감정보 노출 방지)
// ============================================
app.use((err, req, res, next) => {
  // 에러 로깅 (내부용)
  const errorId = `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  console.error(`[${errorId}] 서버 오류:`, {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString()
  });
  
  if (res.headersSent) {
    return next(err);
  }
  
  // 클라이언트 응답 (민감정보 제외)
  const statusCode = err.statusCode || err.status || 500;
  
  // 알려진 에러 유형별 안전한 메시지 반환
  let safeMessage = '서버 내부 오류가 발생했습니다.';
  
  if (err.name === 'ValidationError') {
    safeMessage = '입력값 검증에 실패했습니다.';
  } else if (err.name === 'CastError') {
    safeMessage = '잘못된 데이터 형식입니다.';
  } else if (err.name === 'MongoServerError' && err.code === 11000) {
    safeMessage = '중복된 데이터가 존재합니다.';
  } else if (err.name === 'JsonWebTokenError') {
    safeMessage = '인증 토큰이 유효하지 않습니다.';
  } else if (err.name === 'TokenExpiredError') {
    safeMessage = '인증 토큰이 만료되었습니다.';
  } else if (err.type === 'entity.too.large') {
    safeMessage = '요청 데이터가 너무 큽니다.';
  }
  
  res.status(statusCode).json({
    success: false,
    message: safeMessage,
    errorId: errorId // 고객 지원 시 참조용
  });
});

// SPA support disabled for API-only server
// Removed catch-all route to prevent API conflicts

// 서버 시작
const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
}); 