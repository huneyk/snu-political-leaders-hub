/**
 * MongoDB Schedules 컬렉션 스키마 마이그레이션 스크립트
 * 
 * 이 스크립트는 기존 Schedules 컬렉션의 데이터를 새로운 스키마 형식으로 변환합니다.
 * - date 필드를 String에서 Date로 변환합니다.
 * - 필요한 필드가 없는 문서에 기본값을 추가합니다.
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

async function migrateScheduleSchema() {
  try {
    // 스케줄 컬렉션 가져오기
    const Schedule = mongoose.connection.collection('schedules');
    
    // 모든 스케줄 문서 가져오기
    const schedules = await Schedule.find({}).toArray();
    console.log(`총 ${schedules.length}개의 스케줄 문서가 있습니다.`);
    
    // 각 문서마다 스키마 업데이트 진행
    let updatedCount = 0;
    for (const schedule of schedules) {
      const updates = {};
      
      // 1. date 필드가 존재하고 String 타입이면 Date 객체로 변환
      if (schedule.date && typeof schedule.date === 'string') {
        updates.date = new Date(schedule.date);
      }
      
      // 2. year 필드가 없으면 추가
      if (!schedule.year) {
        const dateObj = updates.date || new Date(schedule.date);
        updates.year = dateObj.getFullYear().toString();
      }
      
      // 3. sessions 필드가 없으면 빈 배열 추가
      if (!schedule.sessions) {
        updates.sessions = [];
      }
      
      // 4. 필드가 없는 경우 기본값 추가
      if (!schedule.time) updates.time = '';
      if (!schedule.location) updates.location = '';
      if (!schedule.description) updates.description = '';
      
      // 변경사항이 있을 경우에만 업데이트
      if (Object.keys(updates).length > 0) {
        await Schedule.updateOne(
          { _id: schedule._id },
          { $set: updates }
        );
        updatedCount++;
      }
    }
    
    console.log(`${updatedCount}개의 스케줄 문서가 업데이트되었습니다.`);
    return true;
  } catch (error) {
    console.error('스케줄 스키마 마이그레이션 실패:', error);
    return false;
  }
}

async function main() {
  try {
    const connected = await connectDB();
    if (!connected) {
      process.exit(1);
    }
    
    console.log('스케줄 컬렉션 스키마 마이그레이션을 시작합니다...');
    const migrated = await migrateScheduleSchema();
    
    if (migrated) {
      console.log('스케줄 컬렉션 스키마 마이그레이션이 완료되었습니다.');
    } else {
      console.error('스케줄 컬렉션 스키마 마이그레이션 중 오류가 발생했습니다.');
    }
    
    // 연결 종료
    await mongoose.connection.close();
    process.exit(migrated ? 0 : 1);
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