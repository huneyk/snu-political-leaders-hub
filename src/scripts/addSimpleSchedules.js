/**
 * MongoDB Schedule 컬렉션에 간소화된 테스트 데이터 추가 스크립트
 * 
 * 이 스크립트는 관리자 페이지 입력 형식에 맞는 일정 데이터를 MongoDB에 추가합니다.
 * - sessions 필드 없음
 * - 날짜는 'mm/dd/yyyy' 형식으로 입력된 것처럼 Date 객체로 저장
 * - 시간은 30분 단위 드롭다운 메뉴에서 선택된 형식
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// 환경 변수 설정
dotenv.config();

// ES Modules에서 __dirname 사용하기
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MongoDB 연결 URI 가져오기
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/plp_database';

// 스케줄 컬렉션 스키마
const scheduleSchema = new mongoose.Schema({
  term: { type: String, required: true },
  year: { type: String, required: true },
  category: { type: String, required: true, enum: ['academic', 'field', 'overseas', 'social', 'other'] },
  title: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String },
  location: { type: String },
  description: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// 스케줄 모델
const Schedule = mongoose.model('Schedule', scheduleSchema);

// 테스트 데이터
const testSchedules = [
  {
    term: '제25기',
    year: '2024',
    category: 'academic',
    title: '입학식',
    date: new Date('03/15/2024'),  // mm/dd/yyyy 형식
    time: '14:00',
    location: '서울대학교 행정대학원 컨벤션홀',
    description: '제25기 정치지도자과정 입학식',
    isActive: true
  },
  {
    term: '제25기',
    year: '2024',
    category: 'academic',
    title: '1학기 개강',
    date: new Date('03/22/2024'),
    time: '10:00',
    location: '서울대학교 행정대학원 203호',
    description: '제25기 1학기 개강',
    isActive: true
  },
  {
    term: '제25기',
    year: '2024',
    category: 'academic',
    title: '1학기 중간고사',
    date: new Date('04/20/2024'),
    time: '09:00',
    location: '서울대학교 행정대학원',
    description: '1학기 중간고사 실시',
    isActive: true
  },
  {
    term: '제25기',
    year: '2024',
    category: 'academic',
    title: '1학기 기말고사',
    date: new Date('06/15/2024'),
    time: '09:00',
    location: '서울대학교 행정대학원',
    description: '1학기 기말고사 실시',
    isActive: true
  },
  {
    term: '제24기',
    year: '2023',
    category: 'academic',
    title: '졸업식',
    date: new Date('12/20/2023'),
    time: '15:00',
    location: '서울대학교 행정대학원 컨벤션홀',
    description: '제24기 졸업식',
    isActive: true
  },
  {
    term: '제25기',
    year: '2024',
    category: 'field',
    title: '국회 방문',
    date: new Date('04/15/2024'),
    time: '13:00',
    location: '대한민국 국회의사당',
    description: '국회 본회의장 및 상임위원회 견학',
    isActive: true
  },
  {
    term: '제25기',
    year: '2024',
    category: 'overseas',
    title: '미국 의회 방문',
    date: new Date('05/10/2024'),
    time: '09:00',
    location: '미국 워싱턴 D.C.',
    description: '미국 의회 방문 및 정치 시스템 연수',
    isActive: true
  },
  {
    term: '제25기',
    year: '2024',
    category: 'social',
    title: '동문 네트워킹 행사',
    date: new Date('06/30/2024'),
    time: '18:00',
    location: '서울대학교 호암교수회관',
    description: '정치지도자과정 동문 및 재학생 네트워킹 만찬',
    isActive: true
  }
];

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB 연결 성공');
    return true;
  } catch (error) {
    console.error('MongoDB 연결 실패:', error);
    return false;
  }
}

async function addSimpleSchedules() {
  try {
    // 기존 데이터 삭제
    await Schedule.deleteMany({});
    console.log('기존 스케줄 데이터가 모두 삭제되었습니다.');
    
    // 새 테스트 데이터 추가
    const inserted = await Schedule.insertMany(testSchedules);
    console.log(`${inserted.length}개의 테스트 스케줄이 추가되었습니다.`);
    
    return true;
  } catch (error) {
    console.error('테스트 데이터 추가 실패:', error);
    return false;
  }
}

async function main() {
  try {
    const connected = await connectDB();
    if (!connected) {
      process.exit(1);
    }
    
    console.log('간소화된 테스트 일정 데이터 추가를 시작합니다...');
    const added = await addSimpleSchedules();
    
    if (added) {
      console.log('테스트 일정 데이터 추가가 완료되었습니다.');
    } else {
      console.error('테스트 일정 데이터 추가 중 오류가 발생했습니다.');
    }
    
    // 연결 종료
    await mongoose.connection.close();
    process.exit(added ? 0 : 1);
  } catch (error) {
    console.error('스크립트 실행 중 오류 발생:', error);
    try {
      await mongoose.connection.close();
    } catch (closeError) {
      console.error('연결 종료 실패:', closeError);
    }
    process.exit(1);
  }
}

// 스크립트 실행
main(); 