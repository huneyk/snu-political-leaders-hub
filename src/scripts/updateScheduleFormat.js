/**
 * MongoDB Schedule 컬렉션 포맷 업데이트 스크립트
 * 
 * 이 스크립트는 기존 Schedule 컬렉션의 문서들을 관리자 페이지 입력 형식에 맞게 업데이트합니다.
 * - sessions 필드 제거
 * - 날짜 형식 유지 (MongoDB 내부에서는 Date 객체로 저장)
 * - 시간 형식 유지 (String 형식)
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

async function updateScheduleFormat() {
  try {
    // 스케줄 컬렉션 가져오기
    const Schedule = mongoose.connection.collection('schedules');
    
    // 모든 스케줄 문서 가져오기
    const schedules = await Schedule.find({}).toArray();
    console.log(`총 ${schedules.length}개의 스케줄 문서가 있습니다.`);
    
    let updatedCount = 0;
    
    // 각 문서 업데이트
    for (const schedule of schedules) {
      // 업데이트 내용:
      // 1. sessions 필드 제거
      // 2. 필요한 필드가 없으면 추가
      
      // $unset으로 sessions 필드 제거
      const updateResult = await Schedule.updateOne(
        { _id: schedule._id },
        { 
          $unset: { sessions: "" },
          $setOnInsert: { 
            // 필요한 필드가 없는 경우 기본값 설정
            time: schedule.time || '',
            location: schedule.location || '',
            description: schedule.description || '',
            isActive: schedule.isActive !== undefined ? schedule.isActive : true
          }
        },
        { upsert: true }
      );
      
      if (updateResult.modifiedCount > 0 || updateResult.upsertedCount > 0) {
        updatedCount++;
      }
    }
    
    console.log(`${updatedCount}개의 스케줄 문서가 업데이트되었습니다.`);
    return true;
  } catch (error) {
    console.error('스케줄 포맷 업데이트 실패:', error);
    return false;
  }
}

async function main() {
  try {
    const connected = await connectDB();
    if (!connected) {
      process.exit(1);
    }
    
    console.log('스케줄 컬렉션 포맷 업데이트를 시작합니다...');
    const updated = await updateScheduleFormat();
    
    if (updated) {
      console.log('스케줄 컬렉션 포맷 업데이트가 완료되었습니다.');
    } else {
      console.error('스케줄 컬렉션 포맷 업데이트 중 오류가 발생했습니다.');
    }
    
    // 연결 종료
    await mongoose.connection.close();
    process.exit(updated ? 0 : 1);
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