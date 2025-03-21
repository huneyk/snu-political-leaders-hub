import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/database.js';
import dotenv from 'dotenv';

// 환경 변수 설정
dotenv.config();

// ES Modules에서 __dirname 사용하기
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Express 앱 초기화
const app = express();
const PORT = process.env.PORT || 5001;

// MongoDB 연결
connectDB();

// CORS 설정
const corsOptions = {
  origin: ['http://localhost:8080', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};
app.use(cors(corsOptions));
console.log('CORS enabled with options:', corsOptions);

// 미들웨어 설정
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 요청 로깅 미들웨어
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// 정적 파일 제공 (빌드된 클라이언트)
app.use(express.static(path.join(__dirname, '../dist')));

// API 라우트 설정
import galleryRoutes from './routes/galleryRoutes.js';
import noticeRoutes from './routes/noticeRoutes.js';
import admissionRoutes from './routes/admissionRoutes.js';
import footerRoutes from './routes/footerRoutes.js';
import authRoutes from './routes/authRoutes.js';
import greetingRoutes from './routes/greetingRoutes.js';
import contentRoutes from './routes/contentRoutes.js';

app.use('/api/gallery', galleryRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/admission', admissionRoutes);
app.use('/api/footer', footerRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/greeting', greetingRoutes);
app.use('/api/content', contentRoutes);

// API 상태 확인 엔드포인트
app.get('/api/status', (req, res) => {
  console.log('Status endpoint called');
  res.json({ status: 'ok', message: 'API 서버가 정상적으로 실행 중입니다.' });
});

// 모든 다른 요청은 클라이언트 앱으로 리다이렉트 (SPA 지원)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// 오류 처리 미들웨어
app.use((err, req, res, next) => {
  console.error('서버 오류:', err);
  res.status(500).json({ message: '서버 오류가 발생했습니다.', error: err.message });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
}); 