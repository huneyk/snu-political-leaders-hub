import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import fs from 'fs';

// ES 모듈에서 __dirname 사용하기
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 환경 변수 로드
dotenv.config();

const app = express();

// CORS 설정
app.use(cors());

// JSON 파싱
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// 동적으로 라우트 파일 임포트
const importRoutes = async () => {
  try {
    // auth.js 라우트 임포트
    const authRoutes = await import('./routes/auth.js');
    app.use('/api/auth', authRoutes.default);
    console.log('인증 라우트 로드 완료');

    // content.js 라우트 임포트
    const contentRoutes = await import('./routes/content.js');
    app.use('/api/content', contentRoutes.default);
    console.log('콘텐츠 라우트 로드 완료');
  } catch (error) {
    console.error('라우트 로드 오류:', error);
  }
};

// 라우트 로드 실행
importRoutes();

// 정적 파일 디렉토리 확인 및 설정
let staticDir = 'build';
if (fs.existsSync(path.join(__dirname, 'dist'))) {
  staticDir = 'dist';
}

// 정적 파일 제공
app.use(express.static(path.join(__dirname, staticDir)));

// API 상태 확인
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date(), 
    mongoConnected: mongoose.connection.readyState === 1,
    staticDir: staticDir
  });
});

// 모든 요청을 index.html로 라우팅 (SPA 지원)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, staticDir, 'index.html'));
});

// MongoDB 연결
const connectDB = async () => {
  try {
    if (process.env.MONGO_URI) {
      const conn = await mongoose.connect(process.env.MONGO_URI);
      console.log(`MongoDB 연결 성공: ${conn.connection.host}`);
    } else {
      console.log('MongoDB URI가 제공되지 않았습니다. 연결을 건너뜁니다.');
    }
  } catch (error) {
    console.error(`MongoDB 연결 오류: ${error.message}`);
    // 연결 실패해도 서버는 계속 실행
  }
};

// MongoDB 연결 실행
connectDB();

const PORT = process.env.PORT || 5001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`서버 실행 중: 포트 ${PORT}`);
  console.log(`환경: ${process.env.NODE_ENV}`);
  console.log(`정적 파일 디렉토리: ${staticDir}`);
}); 