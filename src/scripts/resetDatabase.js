/**
 * MongoDB 데이터베이스 초기화 스크립트
 * 
 * 이 스크립트는 기존 컬렉션을 삭제하고 새로운 스키마로 다시 생성합니다.
 * 주의: 모든 데이터가 삭제됩니다.
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Schedule from '../models/Schedule.js';
import Lecturer from '../models/Lecturers.js';
import Professor from '../models/Professors.js';
import User from '../models/User.js';

// 환경 변수 로드
dotenv.config();

// MongoDB 연결 URI 가져오기
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/plp_database';

// 데이터베이스 연결
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB 연결 성공');
    return true;
  } catch (error) {
    console.error('MongoDB 연결 실패:', error);
    return false;
  }
};

// 컬렉션 초기화 함수
const resetCollections = async () => {
  try {
    // 1. Schedule 컬렉션 초기화
    await Schedule.collection.drop();
    console.log('Schedule 컬렉션 초기화 완료');

    // 2. Lecturer 컬렉션 초기화
    await Lecturer.collection.drop();
    console.log('Lecturer 컬렉션 초기화 완료');

    // 3. Professor 컬렉션 초기화
    await Professor.collection.drop();
    console.log('Professor 컬렉션 초기화 완료');

    console.log('모든 컬렉션 초기화 완료');
    
    // admin 계정은 보존해야 하므로 삭제하지 않음
    console.log('User 컬렉션은 보존됨 (admin 계정 유지)');

    return true;
  } catch (error) {
    if (error.code === 26) {
      console.log('일부 컬렉션이 존재하지 않습니다. 계속 진행합니다.');
      return true;
    }
    console.error('컬렉션 초기화 실패:', error);
    return false;
  }
};

// 메인 함수
const main = async () => {
  try {
    // 데이터베이스 연결
    const connected = await connectDB();
    if (!connected) {
      process.exit(1);
    }

    // 확인 메시지
    console.log('경고: 이 작업은 Schedule, Lecturer, Professor 컬렉션의 모든 데이터를 삭제합니다.');
    console.log('계속 진행하려면 5초 내에 Ctrl+C를 누르지 마세요.');
    
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // 컬렉션 초기화
    const resetSuccessful = await resetCollections();
    if (!resetSuccessful) {
      process.exit(1);
    }

    console.log('데이터베이스 초기화가 완료되었습니다.');
    console.log('이제 다음 단계로 새 데이터를 마이그레이션할 수 있습니다.');
    
    // 연결 종료
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('스크립트 실행 중 오류 발생:', error);
    try {
      await mongoose.connection.close();
    } catch (closeError) {
      console.error('연결 종료 실패:', closeError);
    }
    process.exit(1);
  }
};

// 스크립트 실행
main(); 