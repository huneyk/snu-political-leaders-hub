/**
 * MongoDB Schedule 컬렉션에 테스트 데이터 추가 스크립트
 * 
 * 이 스크립트는 캘린더 뷰 테스트를 위한 일정 데이터를 MongoDB에 추가합니다.
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
  sessions: [{
    time: { type: String },
    title: { type: String, required: true },
    location: { type: String },
    description: { type: String }
  }],
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
    date: new Date('2024-03-15'),
    time: '14:00',
    location: '서울대학교 행정대학원 컨벤션홀',
    description: '제25기 정치지도자과정 입학식',
    sessions: [
      {
        time: '14:00',
        title: '환영사',
        location: '컨벤션홀 메인 무대',
        description: '학장 환영사'
      },
      {
        time: '14:30',
        title: '프로그램 소개',
        location: '컨벤션홀 메인 무대',
        description: '정치지도자과정 커리큘럼 안내'
      },
      {
        time: '15:30',
        title: '교수진 소개',
        location: '컨벤션홀 메인 무대',
        description: '교수진 및 강사진 소개'
      }
    ],
    isActive: true
  },
  {
    term: '제25기',
    year: '2024',
    category: 'academic',
    title: '1학기 개강',
    date: new Date('2024-03-22'),
    time: '10:00',
    location: '서울대학교 행정대학원 203호',
    description: '제25기 1학기 개강',
    sessions: [
      {
        time: '10:00',
        title: '한국 정치의 이해',
        location: '서울대학교 행정대학원 203호',
        description: '정치학 이론과 한국 정치의 이해'
      }
    ],
    isActive: true
  },
  {
    term: '제25기',
    year: '2024',
    category: 'academic',
    title: '1학기 중간고사',
    date: new Date('2024-04-20'),
    time: '09:00',
    location: '서울대학교 행정대학원',
    description: '1학기 중간고사 실시',
    sessions: [
      {
        time: '09:00 - 12:00',
        title: '정치이론 평가',
        location: '행정대학원 203호',
        description: '교재 1-5장 범위 시험'
      }
    ],
    isActive: true
  },
  {
    term: '제25기',
    year: '2024',
    category: 'academic',
    title: '1학기 기말고사',
    date: new Date('2024-06-15'),
    time: '09:00',
    location: '서울대학교 행정대학원',
    description: '1학기 기말고사 실시',
    sessions: [
      {
        time: '09:00',
        title: '정치이론 종합 평가',
        location: '행정대학원 203호',
        description: '교재 전체 범위 시험'
      }
    ],
    isActive: true
  },
  {
    term: '제24기',
    year: '2023',
    category: 'academic',
    title: '졸업식',
    date: new Date('2023-12-20'),
    time: '15:00',
    location: '서울대학교 행정대학원 컨벤션홀',
    description: '제24기 졸업식',
    sessions: [
      {
        time: '15:00',
        title: '졸업 축하 행사',
        location: '컨벤션홀',
        description: '수료증 수여식'
      },
      {
        time: '16:30',
        title: '졸업 리셉션',
        location: '컨벤션홀 로비',
        description: '축하 리셉션'
      }
    ],
    isActive: true
  },
  {
    term: '제25기',
    year: '2024',
    category: 'field',
    title: '국회 방문',
    date: new Date('2024-04-15'),
    time: '13:00',
    location: '대한민국 국회의사당',
    description: '국회 본회의장 및 상임위원회 견학',
    sessions: [
      {
        time: '13:00',
        title: '국회 본회의장 견학',
        location: '국회의사당 본관',
        description: '본회의장 견학 및 국회의장 면담'
      },
      {
        time: '15:00',
        title: '상임위원회 방문',
        location: '국회의사당 상임위원회 회의실',
        description: '정무위원회 및 행정안전위원회 방문'
      }
    ],
    isActive: true
  },
  {
    term: '제25기',
    year: '2024',
    category: 'overseas',
    title: '미국 의회 방문',
    date: new Date('2024-05-10'),
    time: '09:00',
    location: '미국 워싱턴 D.C.',
    description: '미국 의회 방문 및 정치 시스템 연수',
    sessions: [
      {
        time: '09:00',
        title: '미국 의회 견학',
        location: '미국 국회의사당',
        description: '의회 견학 및 정치 시스템 소개'
      },
      {
        time: '14:00',
        title: '싱크탱크 방문',
        location: '워싱턴 D.C. 싱크탱크',
        description: '주요 싱크탱크 방문 및 정책 담당자 미팅'
      }
    ],
    isActive: true
  },
  {
    term: '제25기',
    year: '2024',
    category: 'social',
    title: '동문 네트워킹 행사',
    date: new Date('2024-06-30'),
    time: '18:00',
    location: '서울대학교 호암교수회관',
    description: '정치지도자과정 동문 및 재학생 네트워킹 만찬',
    sessions: [
      {
        time: '18:00',
        title: '동문회장 환영사',
        location: '호암교수회관 컨벤션센터',
        description: '환영사 및 동문회 소개'
      },
      {
        time: '18:30',
        title: '네트워킹 만찬',
        location: '호암교수회관 컨벤션센터',
        description: '재학생 및 동문 간 교류'
      }
    ],
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

async function addTestSchedules() {
  try {
    // 기존 테스트 데이터 스케줄 삭제 (선택적)
    const result = await Schedule.deleteMany({
      $or: [
        { title: '입학식' },
        { title: '1학기 개강' },
        { title: '1학기 중간고사' },
        { title: '1학기 기말고사' },
        { title: '졸업식' },
        { title: '국회 방문' },
        { title: '미국 의회 방문' },
        { title: '동문 네트워킹 행사' }
      ]
    });
    
    console.log(`${result.deletedCount}개의 기존 테스트 스케줄이 삭제되었습니다.`);
    
    // 테스트 데이터 추가
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
    
    console.log('테스트 일정 데이터 추가를 시작합니다...');
    const added = await addTestSchedules();
    
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