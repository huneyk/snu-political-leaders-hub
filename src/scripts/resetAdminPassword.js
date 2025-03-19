/**
 * 관리자 비밀번호 재설정 스크립트
 * 
 * 이 스크립트는 기존 관리자 계정의 비밀번호를 재설정합니다.
 * 비밀번호 해시는 자동으로 처리됩니다.
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

// 환경 변수 설정
dotenv.config();

// MongoDB 연결 URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/snu-plp-hub';

// 새 비밀번호
const NEW_PASSWORD = 'admin123!';

// MongoDB에 연결
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB에 연결되었습니다.');
    return true;
  } catch (error) {
    console.error('MongoDB 연결 실패:', error);
    return false;
  }
};

// 관리자 비밀번호 재설정 함수
async function resetAdminPassword() {
  try {
    // 역할이 'admin'인 사용자 찾기
    const admin = await User.findOne({ role: 'admin' });
    
    if (!admin) {
      console.error('관리자 계정을 찾을 수 없습니다.');
      return;
    }
    
    console.log('관리자 계정을 찾았습니다:');
    console.log(`- 이메일: ${admin.email}`);
    console.log(`- 이름: ${admin.name}`);
    
    // 비밀번호 직접 설정
    admin.password = NEW_PASSWORD;
    
    // 저장 (비밀번호 해싱이 자동으로 이루어짐)
    await admin.save();
    
    console.log('관리자 비밀번호가 성공적으로 재설정되었습니다.');
    console.log(`- 새 비밀번호: ${NEW_PASSWORD}`);
    console.log('이 비밀번호 정보를 안전한 곳에 보관해주세요.');
  } catch (error) {
    console.error('관리자 비밀번호 재설정 실패:', error);
  }
}

// 메인 함수
async function main() {
  try {
    const connected = await connectDB();
    if (!connected) {
      process.exit(1);
    }
    
    console.log('관리자 비밀번호 재설정을 시작합니다...');
    await resetAdminPassword();
    
    // 연결 종료
    await mongoose.connection.close();
    console.log('MongoDB 연결이 종료되었습니다.');
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
}

// 스크립트 실행
main(); 