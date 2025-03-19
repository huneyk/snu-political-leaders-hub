/**
 * MongoDB Atlas 일정 데이터 샘플 등록 스크립트
 * 
 * 이 스크립트는 MongoDB Atlas 연결이 필요합니다.
 * Node.js 환경에서 실행하세요: node db-seed-schedules.js
 */

import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

// 환경 변수 로드
dotenv.config();

// MongoDB Atlas 연결 URL (환경 변수에서 가져오거나 기본값 사용)
// .env 파일에 MONGODB_URI 또는 MONGO_URI 사용 확인
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb+srv://<username>:<password>@<cluster-url>/plp_database?retryWrites=true&w=majority';
const DB_NAME = process.env.DB_NAME || 'plp_database';

// 샘플 학사일정 데이터
const sampleAcademicSchedules = [
  {
    term: 1,
    year: '2023',
    category: 'academic',
    title: '1학기 개강',
    date: new Date('2023-03-02'),
    time: '09:00',
    location: '서울대학교 사회과학대학',
    description: '서울대학교 정치리더십과정 1학기 개강식입니다.',
    isActive: true
  },
  {
    term: 1,
    year: '2023',
    category: 'academic',
    title: '중간고사',
    date: new Date('2023-04-20'),
    time: '14:00',
    location: '서울대학교 16동 학생회관',
    description: '1학기 중간고사 일정입니다.\n모든 과목 시험이 이날 진행됩니다.',
    isActive: true
  },
  {
    term: 1,
    year: '2023',
    category: 'academic',
    title: '기말고사',
    date: new Date('2023-06-15'),
    time: '14:00',
    location: '서울대학교 16동 학생회관',
    description: '1학기 기말고사 일정입니다.\n모든 과목 시험이 이날 진행됩니다.',
    isActive: true
  },
  {
    term: 2,
    year: '2023',
    category: 'academic',
    title: '2학기 개강',
    date: new Date('2023-09-01'),
    time: '09:00',
    location: '서울대학교 사회과학대학',
    description: '서울대학교 정치리더십과정 2학기 개강식입니다.',
    isActive: true
  },
  {
    term: 2,
    year: '2023',
    category: 'academic',
    title: '2학기 중간고사',
    date: new Date('2023-10-20'),
    time: '14:00',
    location: '서울대학교 16동 학생회관',
    description: '2학기 중간고사 일정입니다.\n모든 과목 시험이 이날 진행됩니다.',
    isActive: true
  },
  {
    term: 2,
    year: '2023',
    category: 'academic',
    title: '2학기 기말고사',
    date: new Date('2023-12-15'),
    time: '14:00',
    location: '서울대학교 16동 학생회관',
    description: '2학기 기말고사 일정입니다.\n모든 과목 시험이 이날 진행됩니다.',
    isActive: true
  },
  {
    term: 1,
    year: '2024',
    category: 'academic',
    title: '2024년 1학기 개강',
    date: new Date('2024-03-04'),
    time: '09:00',
    location: '서울대학교 사회과학대학',
    description: '서울대학교 정치리더십과정 2024년 1학기 개강식입니다.',
    isActive: true
  }
];

// 샘플 특별활동 데이터
const sampleSpecialActivities = [
  {
    term: 1,
    year: '2023',
    category: 'special',
    title: '국회 방문',
    date: new Date('2023-03-15'),
    time: '13:00',
    location: '국회의사당',
    description: '국회 견학 및 의원과의 만남 프로그램입니다.',
    isActive: true
  },
  {
    term: 1,
    year: '2023',
    category: 'special',
    title: '특강: 정치와 리더십',
    date: new Date('2023-04-10'),
    time: '15:00',
    location: '서울대학교 인문대학 3동 207호',
    description: '정치 리더십에 관한 특별 강연입니다.\n초청 연사: 홍길동 전 국회의원',
    isActive: true
  },
  {
    term: 2,
    year: '2023',
    category: 'special',
    title: '외교부 방문',
    date: new Date('2023-09-20'),
    time: '14:00',
    location: '외교부 청사',
    description: '외교부 견학 및 현직 외교관과의 대화 시간입니다.',
    isActive: true
  },
  {
    term: 2,
    year: '2023',
    category: 'special',
    title: '리더십 워크샵',
    date: new Date('2023-11-05'),
    time: '10:00',
    location: '서울대학교 호암교수회관',
    description: '정치 리더십 역량 강화를 위한 전일 워크샵입니다.\n전문 강사진의 지도로 리더십 역량을 개발하는 시간을 가집니다.',
    isActive: true
  },
  {
    term: 1,
    year: '2024',
    category: 'special',
    title: '2024 정치 포럼',
    date: new Date('2024-04-15'),
    time: '13:00',
    location: '서울대학교 아시아연구소',
    description: '2024년 정치 환경과 리더십에 관한 포럼입니다.\n각계 전문가들의 발표와 토론이 진행됩니다.',
    isActive: true
  }
];

// MongoDB 연결 및 데이터 추가 함수
async function seedDatabase() {
  let client;

  try {
    console.log('MongoDB Atlas에 연결 중...');
    client = new MongoClient(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // 5초 타임아웃
      maxPoolSize: 10 // 연결 풀 크기
    });
    await client.connect();
    console.log('MongoDB Atlas 연결 성공!');

    const db = client.db(DB_NAME);
    const schedulesCollection = db.collection('schedules');

    // 기존 일정 데이터 삭제
    console.log('기존 일정 데이터 삭제 중...');
    await schedulesCollection.deleteMany({});
    console.log('기존 일정 데이터 삭제 완료');

    // 학사일정 데이터 추가
    console.log('학사일정 데이터 추가 중...');
    const academicResult = await schedulesCollection.insertMany(sampleAcademicSchedules);
    console.log(`${academicResult.insertedCount}개의 학사일정 데이터 추가 완료`);

    // 특별활동 데이터 추가
    console.log('특별활동 데이터 추가 중...');
    const specialResult = await schedulesCollection.insertMany(sampleSpecialActivities);
    console.log(`${specialResult.insertedCount}개의 특별활동 데이터 추가 완료`);

    console.log('MongoDB Atlas 샘플 데이터 등록 완료!');
  } catch (error) {
    console.error('데이터베이스 작업 중 오류 발생:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('MongoDB Atlas 연결 종료');
    }
  }
}

// 스크립트 실행
seedDatabase().catch(console.error); 