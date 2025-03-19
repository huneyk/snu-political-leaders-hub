import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Lecturer from './src/models/Lecturers.js';

// 환경 변수 로드
dotenv.config();

// MongoDB 연결 설정
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/plp_database';

// 샘플 강사진 데이터
const sampleLecturers = [
  // 1기 특별강사진
  {
    name: '김민석',
    biography: '前 국회의원\n정치평론가\n정치학 박사',
    imageUrl: '',
    term: '1',
    category: '특별강사진',
    order: 0,
    isActive: true
  },
  {
    name: '박영선',
    biography: '前 중소벤처기업부 장관\n前 서울시장 후보\n前 국회의원',
    imageUrl: '',
    term: '1',
    category: '특별강사진',
    order: 1,
    isActive: true
  },
  {
    name: '이재명',
    biography: '前 경기도지사\n前 성남시장\n前 대선후보',
    imageUrl: '',
    term: '1',
    category: '특별강사진',
    order: 2,
    isActive: true
  },
  // 1기 서울대 정치외교학부 교수진
  {
    name: '강원택',
    biography: '서울대학교 정치외교학부 교수\n前 한국정치학회장\n정치심리학 전공',
    imageUrl: '',
    term: '1',
    category: '서울대 정치외교학부 교수진',
    order: 0,
    isActive: true
  },
  {
    name: '임혜란',
    biography: '서울대학교 정치외교학부 교수\n비교정치경제 전공\n한국행정연구소장',
    imageUrl: '',
    term: '1',
    category: '서울대 정치외교학부 교수진',
    order: 1,
    isActive: true
  },
  // 2기 특별강사진
  {
    name: '원희룡',
    biography: '前 국토교통부 장관\n前 제주도지사\n前 국회의원',
    imageUrl: '',
    term: '2',
    category: '특별강사진',
    order: 0,
    isActive: true
  },
  {
    name: '유시민',
    biography: '前 보건복지부 장관\n노무현재단 이사장\n작가',
    imageUrl: '',
    term: '2',
    category: '특별강사진',
    order: 1,
    isActive: true
  },
  // 2기 서울대 정치외교학부 교수진
  {
    name: '박찬욱',
    biography: '서울대학교 정치외교학부 교수\n비교정치학 전공\n前 정치외교학부 학부장',
    imageUrl: '',
    term: '2',
    category: '서울대 정치외교학부 교수진',
    order: 0,
    isActive: true
  }
];

// 샘플 데이터 삽입 함수
async function insertSampleData() {
  try {
    // MongoDB 연결
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB에 연결되었습니다.');
    
    // 기존 강사진 데이터 삭제
    await Lecturer.deleteMany({});
    console.log('기존 강사진 데이터가 삭제되었습니다.');
    
    // 샘플 데이터 삽입
    const result = await Lecturer.insertMany(sampleLecturers);
    console.log(`${result.length}개의 샘플 강사진 데이터가 성공적으로 삽입되었습니다.`);
    
    // 연결 종료
    await mongoose.connection.close();
    console.log('MongoDB 연결이 종료되었습니다.');
  } catch (error) {
    console.error('샘플 데이터 삽입 중 오류가 발생했습니다:', error);
    // 오류 발생 시에도 연결 종료 시도
    try {
      await mongoose.connection.close();
      console.log('MongoDB 연결이 종료되었습니다.');
    } catch (closeError) {
      console.error('MongoDB 연결 종료 중 오류가 발생했습니다:', closeError);
    }
  }
}

// 스크립트 실행
insertSampleData(); 