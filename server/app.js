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
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  
  // OPTIONS 요청에 즉시 응답
  if (req.method === 'OPTIONS') {
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

// 라우트 설정
app.use('/api/users', usersRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/footer', footerRoutes);
app.use('/api/admission', admissionRoutes);

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
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB Atlas에 연결되었습니다.');
  })
  .catch((error) => {
    console.error('MongoDB 연결 실패:', error);
  });

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