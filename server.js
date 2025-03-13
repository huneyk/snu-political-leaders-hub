import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import fs from 'fs';
import contentService from './lib/contentService.js';
import fileStorage from './fileStorage.js';

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

// 콘텐츠 서비스 초기화
console.log('콘텐츠 서비스 초기화 중...');
const allContent = contentService.getAllContent();
console.log(`콘텐츠 서비스 초기화 완료: ${Object.keys(allContent).length}개 타입 로드됨`);

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
    staticDir: staticDir,
    contentTypes: contentService.getContentTypes(),
    environment: process.env.NODE_ENV || 'development',
    dataDir: fileStorage.getDataDir()
  });
});

// 디버깅 엔드포인트 추가
app.get('/api/debug/storage', (req, res) => {
  try {
    // 메모리 캐시 상태 확인
    const cacheStatus = fileStorage.getMemoryCacheStatus();
    
    // 데이터 디렉토리 확인
    const dataDir = fileStorage.getDataDir();
    let files = [];
    
    if (fs.existsSync(dataDir)) {
      files = fs.readdirSync(dataDir)
        .filter(file => file.endsWith('.json'))
        .map(file => {
          const filePath = path.join(dataDir, file);
          const stats = fs.statSync(filePath);
          return {
            name: file,
            size: stats.size,
            modified: stats.mtime
          };
        });
    }
    
    // 콘텐츠 서비스 상태 확인
    const contentStatus = {};
    contentService.getContentTypes().forEach(type => {
      const content = contentService.getContent(type);
      contentStatus[type] = {
        hasData: !!content && Object.keys(content).length > 0,
        size: content ? JSON.stringify(content).length : 0,
        summary: content ? Object.keys(content).join(', ') : 'empty'
      };
    });
    
    res.json({
      timestamp: new Date(),
      environment: process.env.NODE_ENV || 'development',
      dataDirectory: dataDir,
      files: files,
      memoryCache: cacheStatus,
      contentService: contentStatus
    });
  } catch (error) {
    console.error('디버깅 정보 조회 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

// 데이터 초기화 엔드포인트 (개발 환경에서만 사용)
app.post('/api/debug/init-sample-data', (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production' && !process.env.ALLOW_SAMPLE_DATA) {
      return res.status(403).json({ message: '프로덕션 환경에서는 샘플 데이터 초기화가 비활성화되어 있습니다.' });
    }
    
    // 샘플 데이터 생성
    const sampleData = {
      greeting: {
        title: '서울대학교 정치지도자과정에 오신 것을 환영합니다',
        content: '서울대학교 정치지도자과정은 미래 정치 지도자를 양성하는 프로그램입니다.',
        imageUrl: '/images/greeting.jpg'
      },
      schedule: {
        events: [
          { id: 1, title: '입학식', date: '2023-03-02', location: '서울대학교 행정대학원' },
          { id: 2, title: '특강: 리더십의 이해', date: '2023-03-15', location: '서울대학교 행정대학원' },
          { id: 3, title: '졸업식', date: '2023-06-30', location: '서울대학교 행정대학원' }
        ]
      },
      faculty: {
        members: [
          { id: 1, name: '홍길동 교수', position: '학과장', specialty: '정치학', imageUrl: '/images/faculty/hong.jpg' },
          { id: 2, name: '김철수 교수', position: '교수', specialty: '행정학', imageUrl: '/images/faculty/kim.jpg' }
        ]
      },
      alumni: {
        members: [
          { id: 1, name: '이영희', year: '2020', position: '국회의원', imageUrl: '/images/alumni/lee.jpg' },
          { id: 2, name: '박민수', year: '2019', position: '시장', imageUrl: '/images/alumni/park.jpg' }
        ]
      },
      gallery: {
        images: [
          { id: 1, title: '입학식 사진', url: '/images/gallery/entrance.jpg', date: '2023-03-02' },
          { id: 2, title: '특강 사진', url: '/images/gallery/lecture.jpg', date: '2023-03-15' }
        ]
      },
      recommendations: {
        items: [
          { id: 1, title: '정치학 개론', author: '홍길동', description: '정치학의 기초를 다루는 책입니다.' },
          { id: 2, title: '리더십의 이해', author: '김철수', description: '리더십에 대한 이해를 돕는 책입니다.' }
        ]
      }
    };
    
    // 샘플 데이터 저장
    let success = true;
    for (const [type, data] of Object.entries(sampleData)) {
      const saved = contentService.saveContent(type, data);
      if (!saved) {
        success = false;
      }
    }
    
    if (success) {
      res.json({ message: '샘플 데이터가 성공적으로 초기화되었습니다.', data: sampleData });
    } else {
      res.status(500).json({ message: '일부 샘플 데이터 저장 중 오류가 발생했습니다.' });
    }
  } catch (error) {
    console.error('샘플 데이터 초기화 오류:', error);
    res.status(500).json({ error: error.message });
  }
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