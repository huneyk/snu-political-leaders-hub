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
    'https://snu-political-leaders-hub-1.onrender.com',
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

// 업로드 디렉토리 설정
const uploadDir = path.join(__dirname, 'uploads');
// 업로드 디렉토리가 없으면 생성
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('업로드 디렉토리 생성됨:', uploadDir);
}
// 업로드된 파일의 정적 접근 경로 설정
app.use('/uploads', express.static(uploadDir));
console.log('정적 파일 경로 설정됨:', '/uploads ->', uploadDir);

// 정적 파일 제공
app.use(express.static(path.join(__dirname, '..', 'build')));

// 라우트 불러오기
const usersRoutes = require('./routes/usersRoutes');
const contentRoutes = require('./routes/contentRoutes');
const authRoutes = require('./routes/authRoutes');
const galleryRoutes = require('./routes/galleryRoutes');
const noticeRoutes = require('./routes/noticeRoutes');
const graduateRoutes = require('./routes/graduateRoutes');
const footerRoutes = require('./routes/footerRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

// 라우트 설정
app.use('/api/users', usersRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/graduates', graduateRoutes);
app.use('/api/footer', footerRoutes);
app.use('/api/upload', uploadRoutes);

// 기본 경로
app.get('/api', (req, res) => {
  res.json({ message: 'API 서버가 실행 중입니다.' });
});

// MongoDB 연결
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB Atlas에 연결되었습니다.');
    
    // DB 연결 성공 시 컬렉션 확인
    mongoose.connection.db.listCollections().toArray((err, collections) => {
      if (err) {
        console.error('컬렉션 목록 조회 실패:', err);
      } else {
        console.log('사용 가능한 컬렉션:', collections.map(c => c.name).join(', '));
      }
    });
  })
  .catch((error) => {
    console.error('MongoDB 연결 실패:', error);
  });

// 클라이언트 앱 제공 (SPA 지원)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'build', 'index.html'));
});

// 서버 시작
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
}); 