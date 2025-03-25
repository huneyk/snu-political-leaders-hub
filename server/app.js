const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// 환경 변수 로드
dotenv.config();

// Express 앱 생성
const app = express();

// CORS 설정 - 반드시 다른 미들웨어보다 먼저 적용
app.use(function(req, res, next) {
  const allowedOrigins = [
    'http://localhost:8080',
    'http://localhost:3000',
    'https://snu-political-leaders-hub.onrender.com',
    'https://snu-political-leaders-hub-1.onrender.com'
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  } else {
    // 개발 환경에서는 모든 도메인 허용 (프로덕션에서는 제거)
    res.header('Access-Control-Allow-Origin', '*');
  }
  
  // CORS 헤더 설정
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // OPTIONS 요청에 즉시 응답
  if (req.method === 'OPTIONS') {
    console.log('🔄 CORS Preflight 요청 처리:', req.headers.origin);
    return res.status(200).end();
  }
  
  next();
});

// 미들웨어 설정
app.use(express.json({ limit: '50mb' })); // 이미지 Base64 처리를 위해 용량 제한 증가
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 정적 파일 제공
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
} else {
  app.use(express.static(path.join(__dirname, '../build')));
}

// 라우트 불러오기
const usersRoutes = require('./routes/usersRoutes');
const contentRoutes = require('./routes/contentRoutes');
const authRoutes = require('./routes/authRoutes');
const galleryRoutes = require('./routes/galleryRoutes');
const noticeRoutes = require('./routes/noticeRoutes');
const footerRoutes = require('./routes/footerRoutes');
const admissionRoutes = require('./routes/admissionRoutes');
const objectivesRoutes = require('./routes/objectivesRoutes');
const recommendationsRoutes = require('./routes/recommendationsRoutes');
const benefitsRoutes = require('./routes/benefitsRoutes');
const lecturersRoutes = require('./routes/lecturersRoutes');
const schedulesRoutes = require('./routes/schedulesRoutes');

// 라우트 설정
app.use('/api/users', usersRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/footer', footerRoutes);
app.use('/api/admission', admissionRoutes);
app.use('/api/objectives', objectivesRoutes);
app.use('/api/recommendations', recommendationsRoutes);
app.use('/api/benefits', benefitsRoutes);
app.use('/api/lecturers', lecturersRoutes);
app.use('/api/schedules', schedulesRoutes);

// 간단한 상태 확인 라우트
app.get('/', (req, res) => {
  res.send('서버가 실행 중입니다.');
});

// 기본 API 경로
app.get('/api', (req, res) => {
  res.json({ 
    message: 'API 서버가 실행 중입니다.',
    timestamp: new Date(),
    environment: process.env.NODE_ENV,
    status: 'ok'
  });
});

// MongoDB 연결
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
      console.log('✅ MongoDB 데이터베이스에 성공적으로 연결되었습니다.');
      
      // 연결된 데이터베이스 정보 로깅
      const db = mongoose.connection;
      console.log(`📊 연결된 데이터베이스: ${db.name}`);
      console.log(`🔗 연결 상태: ${db.readyState === 1 ? '활성' : '비활성'}`);
    })
    .catch(err => {
      console.error('❌ MongoDB 연결 오류:', err.message);
      
      // 연결 문자열 정보를 마스킹하여 로깅 (보안)
      if (process.env.MONGODB_URI) {
        const sanitizedUri = process.env.MONGODB_URI.replace(
          /mongodb(\+srv)?:\/\/[^:]+:[^@]+@/,
          'mongodb$1://*****:*****@'
        );
        console.error('🔄 연결 시도한 URI:', sanitizedUri);
      }
    });
} else {
  console.error('⚠️ MongoDB URI가 환경 변수에 설정되지 않았습니다.');
  console.error('💡 Render 대시보드에서 MONGODB_URI 환경 변수를 설정해주세요.');
}

// Render에서 실행 시 정적 파일 제공 및 SPA 라우팅 비활성화
if (process.env.NODE_ENV !== 'production') {
  // 정적 파일 제공 (개발 환경에서만)
  app.use(express.static(path.join(__dirname, '../build')));
  
  // 클라이언트 앱 제공 (SPA 지원)
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../build', 'index.html'));
  });
}

// 서버 실행 시 로그
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 시작되었습니다.`);
  console.log(`환경: ${process.env.NODE_ENV}`);
  
  // 서버 상태 주기적 로깅
  setInterval(() => {
    console.log(`서버가 포트 ${PORT}에서 정상 실행 중입니다. ${new Date()}`);
  }, 60000); // 1분마다 로그 출력
});

// 에러 처리
app.use((err, req, res, next) => {
  console.error('서버 오류:', err);
  res.status(500).json({ message: '서버 오류가 발생했습니다.' });
});

// 404 처리
app.use((req, res) => {
  console.log(`404 요청: ${req.method} ${req.url}`);
  res.status(404).json({ message: '요청한 리소스를 찾을 수 없습니다.' });
}); 