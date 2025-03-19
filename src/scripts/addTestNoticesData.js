/**
 * 테스트용 공지사항 데이터 추가 스크립트
 * 
 * MongoDB에 테스트용 공지사항 데이터를 추가합니다.
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Notice from '../models/Notice.js';

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

// 테스트용 공지사항 데이터
const testNoticesData = [
  {
    title: '2024년 과정 입학 안내',
    content: '2024년 정치지도자 과정 입학 신청이 시작되었습니다. 신청 마감일은 2024년 2월 28일입니다.\n\n자세한 내용은 입학 안내 페이지를 참고해주세요.',
    author: '관리자',
    isImportant: true,
    createdAt: new Date('2024-01-15')
  },
  {
    title: '시설 이용 안내',
    content: '강의실 및 세미나실 이용 시간은 오전 9시부터 오후 6시까지입니다.\n\n주말 이용을 원하시는 경우 사전에 시설 관리자에게 문의 바랍니다.',
    author: '시설 관리자',
    isImportant: false,
    createdAt: new Date('2024-02-10')
  },
  {
    title: '특별 강연 안내',
    content: '3월 15일 오후 2시부터 국제 정치 관련 특별 강연이 진행됩니다. 많은 참여 바랍니다.\n\n강연자: 홍길동 교수 (서울대학교)\n장소: 대강당',
    author: '교육 담당자',
    isImportant: true,
    createdAt: new Date('2024-03-05')
  },
  {
    title: '봄학기 일정 변경 안내',
    content: '4월 중 예정되었던 현장 학습이 학사 일정 변경으로 5월 첫째 주로 연기되었습니다.\n\n자세한 일정은 추후 공지 예정입니다.',
    author: '교육 담당자',
    isImportant: false,
    createdAt: new Date('2024-03-20')
  },
  {
    title: '졸업 프로젝트 발표회 안내',
    content: '2024년 1학기 졸업 프로젝트 발표회가 6월 15일에 진행됩니다.\n\n발표 희망자는 5월 31일까지 신청서를 제출해주세요.',
    author: '관리자',
    isImportant: true,
    createdAt: new Date('2024-04-05')
  },
  {
    title: '도서관 휴관 안내',
    content: '시스템 점검으로 인해 도서관이 4월 10일부터 4월 12일까지 휴관합니다.\n\n불편을 드려 죄송합니다.',
    author: '시설 관리자',
    isImportant: false,
    createdAt: new Date('2024-04-08')
  },
  {
    title: '하계 특강 안내',
    content: '여름방학 기간 동안 진행되는 특강 프로그램 신청이 시작되었습니다.\n\n신청 마감: 6월 30일\n프로그램 기간: 7월 15일 ~ 8월 15일',
    author: '교육 담당자',
    isImportant: false,
    createdAt: new Date('2024-05-15')
  },
  {
    title: '정기 총회 안내',
    content: '2024년 정기 총회가 5월 25일 오후 3시에 대강당에서 개최됩니다.\n\n모든 회원분들의 참석을 부탁드립니다.',
    author: '사무국장',
    isImportant: true,
    createdAt: new Date('2024-05-10')
  }
];

// 공지사항 데이터 추가 함수
async function addNoticesData() {
  try {
    // 기존 데이터 삭제
    await Notice.deleteMany({});
    console.log('기존 공지사항 데이터가 삭제되었습니다.');
    
    // 새 데이터 추가
    const result = await Notice.insertMany(testNoticesData);
    console.log(`${result.length}개의 공지사항 항목이 추가되었습니다.`);
  } catch (error) {
    console.error('공지사항 데이터 추가 실패:', error);
  }
}

// 메인 함수
async function main() {
  try {
    const connected = await connectDB();
    if (!connected) {
      process.exit(1);
    }
    
    console.log('공지사항 테스트 데이터 추가를 시작합니다...');
    await addNoticesData();
    
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