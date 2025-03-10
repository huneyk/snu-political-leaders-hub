const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// 환경 변수 로드
dotenv.config();

const app = express();

// MongoDB 연결 상태 초기화
app.locals.mongoConnected = false;

// 미들웨어
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// API 라우트 설정
app.use('/api/content', require('./routes/content'));
app.use('/api/auth', require('./routes/auth'));

// 프론트엔드 정적 파일 제공 (빌드 후)
app.use(express.static(path.join(__dirname, 'build')));

// 모든 요청을 React 앱으로 라우팅
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// 데이터베이스 연결
const connectDB = async () => {
  try {
    // MongoDB URI가 설정되어 있는지 확인
    if (!process.env.MONGODB_URI) {
      console.log('MongoDB URI가 설정되지 않았습니다. 파일 시스템 저장소를 사용합니다.');
      return;
    }
    
    // MongoDB 연결 시도
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // 서버 선택 타임아웃
      socketTimeoutMS: 45000, // 소켓 타임아웃
    };
    
    await mongoose.connect(process.env.MONGODB_URI, options);
    console.log('MongoDB connected successfully');
    app.locals.mongoConnected = true;
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    console.log('MongoDB 연결 실패. 파일 시스템 저장소를 사용합니다.');
    app.locals.mongoConnected = false;
  }
};

connectDB();

// 서버 시작
const PORT = process.env.PORT || 5001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
}); 