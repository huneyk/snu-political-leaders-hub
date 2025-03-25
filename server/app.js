const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// 환경 변수 로드
dotenv.config();

// Express 앱 생성
const app = express();

// CORS 설정 옵션
const corsOptions = {
  origin: [
    'http://localhost:8080',
    'http://localhost:3000',
    'https://snu-political-leaders-hub.onrender.com',
    'https://snu-political-leaders-hub-1.onrender.com'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  credentials: true
};

// CORS 설정 - 반드시 다른 미들웨어보다 먼저 적용
app.use(cors(corsOptions));

// 미들웨어 설정
app.use(express.json({ limit: '50mb' })); // 이미지 Base64 처리를 위해 용량 제한 증가
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

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
const greetingRoutes = require('./routes/greetingRoutes');

// API 라우트 설정
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
app.use('/api/greeting', greetingRoutes);

// API 상태 확인 엔드포인트
app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', message: '서버가 정상 실행 중입니다. ' + new Date() });
});

// 렌더 환경에서는 항상 프로덕션 모드로 강제 설정
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

// 정적 파일 경로 설정
const clientRoot = path.resolve(__dirname, '..');
const distPath = path.join(clientRoot, 'dist');
const backupPath = path.join(clientRoot, 'build');

// 존재하는 정적 파일 경로 선택
let staticPath;
if (require('fs').existsSync(distPath)) {
  staticPath = distPath;
  console.log('dist 폴더 사용:', staticPath);
} else if (require('fs').existsSync(backupPath)) {
  staticPath = backupPath;
  console.log('build 폴더 사용:', staticPath);
} else {
  console.error('❌ 정적 파일 폴더가 존재하지 않습니다!');
  // 임시 디렉토리 생성
  staticPath = path.join(__dirname, 'public');
  if (!require('fs').existsSync(staticPath)) {
    require('fs').mkdirSync(staticPath, { recursive: true });
  }
}

// 정적 파일 제공
console.log(`정적 파일 경로 설정: ${staticPath}`);
app.use(express.static(staticPath));

// 디렉토리 구조 출력 (디버깅 용도)
function listDir(dir, level = 0) {
  if (level > 2) return; // 최대 2레벨까지만 출력
  
  try {
    const files = require('fs').readdirSync(dir);
    console.log(`${'  '.repeat(level)}📂 ${dir}:`);
    
    files.forEach(file => {
      const fullPath = path.join(dir, file);
      try {
        const stat = require('fs').statSync(fullPath);
        if (stat.isDirectory()) {
          listDir(fullPath, level + 1);
        } else {
          console.log(`${'  '.repeat(level + 1)}📄 ${file} (${stat.size} bytes)`);
        }
      } catch (err) {
        console.log(`${'  '.repeat(level + 1)}❌ ${file} - 오류: ${err.message}`);
      }
    });
  } catch (err) {
    console.error(`❌ 디렉토리 읽기 오류 (${dir}):`, err.message);
  }
}

// 디렉토리 구조 출력 (프로덕션 환경에서만)
if (process.env.NODE_ENV === 'production') {
  console.log('\n📂 프로젝트 구조:');
  listDir(clientRoot);
}

// 모든 요청에 대해 index.html 제공 (API 제외)
app.get('*', (req, res, next) => {
  // API 요청은 제외
  if (req.path.startsWith('/api/')) {
    return next();
  }

  // 디버깅 로그
  console.log(`클라이언트 라우팅 처리: ${req.method} ${req.path}`);
  
  // index.html 경로
  const indexPath = path.join(staticPath, 'index.html');
  
  // index.html 파일 확인
  if (require('fs').existsSync(indexPath)) {
    return res.sendFile(indexPath);
  } else {
    // index.html 파일이 없는 경우 응급 HTML 생성
    console.error(`⚠️ index.html 파일을 찾을 수 없습니다: ${indexPath}`);
    
    const emergencyHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>서울대학교 정치리더십과정</title>
        <meta http-equiv="refresh" content="3;url=/">
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 20px; text-align: center; }
          h1 { color: #333; }
          a { color: #0066cc; text-decoration: none; }
          a:hover { text-decoration: underline; }
        </style>
      </head>
      <body>
        <h1>서울대학교 정치리더십과정</h1>
        <p>페이지를 찾을 수 없습니다. 3초 후 메인 페이지로 이동합니다.</p>
        <p><a href="/">메인 페이지로 바로 이동</a></p>
        <p>환경: ${process.env.NODE_ENV}, 경로: ${req.path}</p>
      </body>
      </html>
    `;
    
    return res.status(200).send(emergencyHtml);
  }
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

// 서버 실행 시 로그
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`\n----------- 서버 시작 -----------`);
  console.log(`🚀 서버가 포트 ${PORT}에서 시작되었습니다.`);
  console.log(`🔧 환경: ${process.env.NODE_ENV || 'development'}`);
  
  // 정적 파일 경로 확인
  const indexPath = path.join(staticPath, 'index.html');
  try {
    if (require('fs').existsSync(indexPath)) {
      console.log(`✅ index.html 파일 확인됨: ${indexPath}`);
      // 파일 크기 확인
      const stats = require('fs').statSync(indexPath);
      console.log(`📄 index.html 크기: ${stats.size} bytes`);
    } else {
      console.log(`❌ index.html 파일 없음: ${indexPath}`);
      // 디렉토리 내용 출력
      try {
        const files = require('fs').readdirSync(staticPath);
        console.log(`📂 ${staticPath} 디렉토리 파일 목록:`, files);
      } catch (err) {
        console.error(`📂 ${staticPath} 디렉토리 읽기 실패:`, err.message);
      }
    }
  } catch (err) {
    console.error(`❌ 파일 시스템 접근 오류:`, err.message);
  }
  
  console.log(`-------------------------------\n`);
  
  // 서버 상태 주기적 로깅 (개발 환경에서는 비활성화)
  if (process.env.NODE_ENV === 'production') {
    setInterval(() => {
      console.log(`서버가 포트 ${PORT}에서 정상 실행 중입니다. ${new Date()}`);
    }, 300000); // 5분마다 로그 출력
  }
});

// 에러 처리
app.use((err, req, res, next) => {
  console.error('서버 오류:', err);
  
  // API 요청인 경우 JSON 응답
  if (req.path.startsWith('/api/')) {
    return res.status(500).json({ message: '서버 오류가 발생했습니다.', error: err.message });
  }
  
  // 웹 페이지 요청인 경우 HTML 응답
  const errorHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>서버 오류 - 서울대학교 정치리더십과정</title>
      <meta http-equiv="refresh" content="5;url=/">
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 20px; text-align: center; }
        h1 { color: #d32f2f; }
        pre { background: #f5f5f5; padding: 10px; border-radius: 4px; text-align: left; overflow: auto; }
        a { color: #0066cc; text-decoration: none; }
        a:hover { text-decoration: underline; }
      </style>
    </head>
    <body>
      <h1>서버 오류</h1>
      <p>서버에서 오류가 발생했습니다. 5초 후 메인 페이지로 이동합니다.</p>
      <p><a href="/">메인 페이지로 바로 이동</a></p>
      <pre>${err.stack || err.message}</pre>
    </body>
    </html>
  `;
  
  res.status(500).send(errorHtml);
});

// 404 처리 - API 요청에만 적용
app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    console.log(`404 API 요청: ${req.method} ${req.url}`);
    return res.status(404).json({ message: '요청한 API 리소스를 찾을 수 없습니다.' });
  }
  
  // API가 아닌 경우는 이미 처리되었어야 함
  console.log(`예상치 못한 404 요청: ${req.method} ${req.url}`);
  res.redirect('/');
});

module.exports = app; 