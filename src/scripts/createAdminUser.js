/**
 * 관리자 계정 생성 스크립트
 * 
 * 이 스크립트는 MongoDB에 관리자 계정이 없을 경우 새로운 관리자 계정을 생성하고,
 * 이미 있는 경우 비밀번호를 리셋합니다.
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

// 환경 변수 설정
dotenv.config();

// MongoDB 연결 URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/snu-plp-hub';

// 관리자 기본 정보
const defaultAdmin = {
  email: 'admin@snu-plp.ac.kr',
  password: 'admin123!',
  name: '관리자',
  role: 'admin'
};

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

// 관리자 계정 생성 또는 업데이트 함수
async function createAdminUser() {
  try {
    // 기존 관리자 확인
    const existingAdmin = await User.findOne({ role: 'admin' });
    
    if (existingAdmin) {
      console.log('관리자 계정이 이미 존재합니다:');
      console.log(`- 이메일: ${existingAdmin.email}`);
      console.log(`- 이름: ${existingAdmin.name}`);
      
      // 관리자 비밀번호 리셋
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(defaultAdmin.password, salt);
      
      existingAdmin.password = hashedPassword;
      await existingAdmin.save();
      
      console.log('관리자 계정 비밀번호가 리셋되었습니다:');
      console.log(`- 비밀번호: ${defaultAdmin.password}`);
      console.log('이 비밀번호 정보를 안전한 곳에 보관해주세요.');
      
      return;
    }
    
    // 관리자 계정 생성
    const adminUser = new User(defaultAdmin);
    await adminUser.save();
    
    console.log('관리자 계정 생성 완료:');
    console.log(`- 이메일: ${defaultAdmin.email}`);
    console.log(`- 비밀번호: ${defaultAdmin.password}`);
    console.log(`- 이름: ${defaultAdmin.name}`);
    console.log('이 계정 정보를 안전한 곳에 보관해주세요.');
  } catch (error) {
    console.error('관리자 계정 생성/업데이트 실패:', error);
  }
}

// 메인 함수
async function main() {
  try {
    const connected = await connectDB();
    if (!connected) {
      process.exit(1);
    }
    
    console.log('관리자 계정 생성/업데이트를 시작합니다...');
    await createAdminUser();
    
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