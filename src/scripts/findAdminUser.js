/**
 * 관리자 계정 조회 스크립트
 * 
 * 이 스크립트는 데이터베이스에서 관리자 계정 정보를 조회합니다.
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

// 환경 변수 설정
dotenv.config();

// MongoDB 연결 URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/snu-plp-hub';

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

// 관리자 계정 조회 함수
async function findAdminUser() {
  try {
    // User 컬렉션 가져오기
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    
    // 모든 사용자 조회
    const users = await usersCollection.find({}).toArray();
    
    console.log('전체 사용자 수:', users.length);
    
    // 각 사용자 정보 표시
    users.forEach((user, index) => {
      console.log(`\n사용자 #${index + 1}:`);
      console.log('- _id:', user._id);
      console.log('- 이메일:', user.email);
      console.log('- 이름:', user.name);
      console.log('- 역할:', user.role);
      console.log('- 활성화 상태:', user.isActive);
    });
    
    // 관리자 계정 찾기
    const adminUsers = users.filter(user => user.role === 'admin');
    
    console.log(`\n관리자 계정 수: ${adminUsers.length}`);
    
    if (adminUsers.length > 0) {
      console.log('\n관리자 계정 목록:');
      adminUsers.forEach((admin, index) => {
        console.log(`\n관리자 #${index + 1}:`);
        console.log('- _id:', admin._id);
        console.log('- 이메일:', admin.email);
        console.log('- 이름:', admin.name);
      });
    } else {
      console.log('관리자 계정이 없습니다.');
    }
  } catch (error) {
    console.error('관리자 계정 조회 실패:', error);
  }
}

// 메인 함수
async function main() {
  try {
    const connected = await connectDB();
    if (!connected) {
      process.exit(1);
    }
    
    console.log('관리자 계정 조회를 시작합니다...');
    await findAdminUser();
    
    // 연결 종료
    await mongoose.connection.close();
    console.log('\nMongoDB 연결이 종료되었습니다.');
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