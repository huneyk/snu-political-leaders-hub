import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

// 환경 변수 로드
dotenv.config();

// MongoDB Atlas 연결 URL (환경 변수에서 가져오거나 기본값 사용)
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;
const DB_NAME = process.env.DB_NAME || 'plp_database';

// MongoDB 연결 및 데이터 확인 함수
async function checkDatabase() {
  if (!MONGODB_URI) {
    console.error('MongoDB URI가 설정되지 않았습니다. .env 파일을 확인하세요.');
    return;
  }

  let client;
  try {
    console.log('MongoDB Atlas에 연결 중...');
    console.log('사용 중인 Connection URI 첫 부분:', MONGODB_URI.substring(0, 25) + '...');
    
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('MongoDB Atlas 연결 성공!');

    const db = client.db(DB_NAME);
    const schedulesCollection = db.collection('schedules');

    // 일정 수 확인
    const count = await schedulesCollection.countDocuments();
    console.log(`등록된 전체 일정 개수: ${count}개`);

    // 카테고리별 일정 수 확인
    const academicCount = await schedulesCollection.countDocuments({ category: 'academic' });
    const specialCount = await schedulesCollection.countDocuments({ category: 'special' });
    console.log(`- 학사 일정: ${academicCount}개`);
    console.log(`- 특별 활동: ${specialCount}개`);

    // 최근 일정 2개 샘플 출력
    const recentSchedules = await schedulesCollection.find().sort({ date: -1 }).limit(2).toArray();
    console.log('\n최근 일정 샘플:');
    recentSchedules.forEach(schedule => {
      console.log(`- ${schedule.title} (${new Date(schedule.date).toLocaleDateString()}) - ${schedule.description.substring(0, 30)}...`);
    });

    // 학기별 일정 수 
    console.log('\n학기별 일정 수:');
    for (let term = 1; term <= 5; term++) {
      const termCount = await schedulesCollection.countDocuments({ term });
      if (termCount > 0) {
        console.log(`- ${term}학기: ${termCount}개`);
      }
    }

  } catch (error) {
    console.error('데이터베이스 연결 또는 조회 중 오류 발생:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('\nMongoDB Atlas 연결 종료');
    }
  }
}

// 스크립트 실행
checkDatabase().catch(console.error); 