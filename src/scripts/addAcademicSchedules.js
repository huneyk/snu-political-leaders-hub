import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Schedule from '../models/Schedule.js';

dotenv.config();

// MongoDB 연결
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/snu-plp');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

// 기존 테스트 학사 일정 삭제
const deleteExistingAcademicSchedules = async () => {
  try {
    const result = await Schedule.deleteMany({ category: 'academic' });
    console.log(`${result.deletedCount} 기존 학사 일정이 삭제되었습니다.`);
  } catch (error) {
    console.error('기존 학사 일정 삭제 중 오류 발생:', error);
    throw error;
  }
};

// 테스트 학사 일정 데이터
const academicSchedulesData = [
  {
    term: '제25기',
    year: '2024',
    category: 'academic',
    title: '입학식',
    date: new Date('2024-03-05'),
    time: '14:00',
    location: '서울대학교 행정대학원 소천홀',
    description: '제25기 정치지도자과정 입학식이 진행됩니다.',
    isActive: true
  },
  {
    term: '제25기',
    year: '2024',
    category: 'academic',
    title: '오리엔테이션',
    date: new Date('2024-03-08'),
    time: '16:00',
    location: '서울대학교 행정대학원 301호',
    description: '새롭게 입학한 학생들을 위한 과정 소개 및 친목 도모의 시간',
    isActive: true
  },
  {
    term: '제25기',
    year: '2024',
    category: 'academic',
    title: '1학기 중간고사',
    date: new Date('2024-04-25'),
    time: '18:30',
    location: '서울대학교 행정대학원 301호',
    description: '1학기 중간 평가가 실시됩니다.',
    isActive: true
  },
  {
    term: '제25기',
    year: '2024',
    category: 'academic',
    title: '1학기 기말고사',
    date: new Date('2024-06-20'),
    time: '18:30',
    location: '서울대학교 행정대학원 301호',
    description: '1학기 기말 평가가 실시됩니다.',
    isActive: true
  },
  {
    term: '제25기',
    year: '2024',
    category: 'academic',
    title: '2학기 개강',
    date: new Date('2024-09-05'),
    time: '18:30',
    location: '서울대학교 행정대학원 301호',
    description: '2학기 과정이 시작됩니다.',
    isActive: true
  },
  {
    term: '제25기',
    year: '2024',
    category: 'academic',
    title: '2학기 중간고사',
    date: new Date('2024-10-24'),
    time: '18:30',
    location: '서울대학교 행정대학원 301호',
    description: '2학기 중간 평가가 실시됩니다.',
    isActive: true
  },
  {
    term: '제25기',
    year: '2024',
    category: 'academic',
    title: '2학기 기말고사',
    date: new Date('2024-12-12'),
    time: '18:30',
    location: '서울대학교 행정대학원 301호',
    description: '2학기 기말 평가가 실시됩니다.',
    isActive: true
  },
  {
    term: '제25기',
    year: '2024',
    category: 'academic',
    title: '수료식',
    date: new Date('2024-12-20'),
    time: '14:00',
    location: '서울대학교 행정대학원 소천홀',
    description: '제25기 정치지도자과정 수료식이 진행됩니다.',
    isActive: true
  }
];

// 학사 일정 추가 함수
const addAcademicSchedules = async () => {
  try {
    const result = await Schedule.insertMany(academicSchedulesData);
    console.log(`${result.length} 학사 일정이 추가되었습니다.`);
  } catch (error) {
    console.error('학사 일정 추가 중 오류 발생:', error);
    throw error;
  }
};

// 메인 함수
const main = async () => {
  let connection;
  
  try {
    connection = await connectDB();
    
    // 기존 학사 일정 삭제
    await deleteExistingAcademicSchedules();
    
    // 새 학사 일정 추가
    await addAcademicSchedules();
    
    console.log('학사 일정 데이터 마이그레이션이 완료되었습니다.');
  } catch (error) {
    console.error('마이그레이션 중 오류 발생:', error);
  } finally {
    if (connection) {
      await mongoose.disconnect();
      console.log('MongoDB 연결이 종료되었습니다.');
    }
    process.exit(0);
  }
};

// 스크립트 실행
main(); 