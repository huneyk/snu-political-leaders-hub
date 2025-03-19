/**
 * 테스트용 갤러리 데이터 추가 스크립트
 * 
 * MongoDB에 테스트용 갤러리 데이터를 추가합니다.
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Gallery from '../models/Gallery.js';

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

// 테스트용 갤러리 데이터
const testGalleryData = [
  {
    title: '입학식',
    description: '2023년 봄학기 입학식 현장',
    imageUrl: 'https://via.placeholder.com/600x400?text=입학식',
    date: new Date('03/02/2023'),
    term: '1'
  },
  {
    title: '특별 강연',
    description: '국제 정치 특별 강연 세미나',
    imageUrl: 'https://via.placeholder.com/600x400?text=특별강연',
    date: new Date('04/15/2023'),
    term: '1'
  },
  {
    title: '워크샵',
    description: '리더십 개발 워크샵',
    imageUrl: 'https://via.placeholder.com/600x400?text=워크샵',
    date: new Date('05/10/2023'),
    term: '2'
  },
  {
    title: '졸업식',
    description: '2023년 1기 졸업식',
    imageUrl: 'https://via.placeholder.com/600x400?text=졸업식',
    date: new Date('08/20/2023'),
    term: '1'
  },
  {
    title: '해외 연수',
    description: '미국 워싱턴 DC 방문',
    imageUrl: 'https://via.placeholder.com/600x400?text=해외연수',
    date: new Date('06/15/2023'),
    term: '2'
  },
  {
    title: '특강',
    description: '정치 리더십 특강',
    imageUrl: 'https://via.placeholder.com/600x400?text=특강',
    date: new Date('07/05/2023'),
    term: '2'
  },
  {
    title: '세미나',
    description: '정치와 경제 세미나',
    imageUrl: 'https://via.placeholder.com/600x400?text=세미나',
    date: new Date('09/10/2023'),
    term: '3'
  },
  {
    title: '멘토링 세션',
    description: '선배와의 멘토링 프로그램',
    imageUrl: 'https://via.placeholder.com/600x400?text=멘토링',
    date: new Date('10/20/2023'),
    term: '3'
  },
  {
    title: '신년 회의',
    description: '새해 첫 회의 및 계획 수립',
    imageUrl: 'https://via.placeholder.com/600x400?text=신년회의',
    date: new Date('01/15/2024'),
    term: '4'
  },
  {
    title: '봄학기 개강',
    description: '2024년 봄학기 개강식',
    imageUrl: 'https://via.placeholder.com/600x400?text=개강식',
    date: new Date('03/05/2024'),
    term: '4'
  },
  {
    title: '현장 학습',
    description: '국회 방문 및 현장 학습',
    imageUrl: 'https://via.placeholder.com/600x400?text=현장학습',
    date: new Date('04/25/2024'),
    term: '4'
  },
  {
    title: '초청 특강',
    description: '초청 연사와 함께하는 특별 강연',
    imageUrl: 'https://via.placeholder.com/600x400?text=초청특강',
    date: new Date('02/10/2024'),
    term: '4'
  }
];

// 갤러리 데이터 추가 함수
async function addGalleryData() {
  try {
    // 기존 데이터 삭제
    await Gallery.deleteMany({});
    console.log('기존 갤러리 데이터가 삭제되었습니다.');
    
    // 새 데이터 추가
    const result = await Gallery.insertMany(testGalleryData);
    console.log(`${result.length}개의 갤러리 항목이 추가되었습니다.`);
  } catch (error) {
    console.error('갤러리 데이터 추가 실패:', error);
  }
}

// 메인 함수
async function main() {
  try {
    const connected = await connectDB();
    if (!connected) {
      process.exit(1);
    }
    
    console.log('갤러리 테스트 데이터 추가를 시작합니다...');
    await addGalleryData();
    
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