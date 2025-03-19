/**
 * MongoDB ProfessorSection 컬렉션에 테스트 데이터 추가 스크립트
 * 
 * 이 스크립트는 교수진 섹션 데이터를 MongoDB에 추가합니다.
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import ProfessorSection from '../models/Professors.js';

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

// 테스트 데이터
const testProfessorSections = [
  {
    sectionTitle: "운영 교수진",
    professors: [
      {
        name: "김상배",
        position: "교수",
        organization: "서울대학교 정치외교학부",
        profile: "서울대학교 정치외교학부 교수로 국제정치학, 글로벌 거버넌스, 과학기술과 국제관계 분야를 연구하고 있습니다. 서울대학교 정치리더십과정 운영위원장을 맡고 있습니다."
      },
      {
        name: "임혜란",
        position: "교수",
        organization: "서울대학교 정치외교학부",
        profile: "서울대학교 정치외교학부 교수로 비교정치경제, 국제정치경제, 동아시아 정치경제 분야를 연구하고 있습니다."
      },
      {
        name: "김의영",
        position: "교수",
        organization: "서울대학교 정치외교학부",
        profile: "서울대학교 정치외교학부 교수로 비교정치, 시민사회, 민주주의와 거버넌스 분야를 연구하고 있습니다."
      },
      {
        name: "안도경",
        position: "교수",
        organization: "서울대학교 정치외교학부",
        profile: "서울대학교 정치외교학부 교수로 정치경제, 제도주의, 공공선택이론 분야를 연구하고 있습니다."
      }
    ],
    order: 1,
    isActive: true
  },
  {
    sectionTitle: "특별 강의 교수진",
    professors: [
      {
        name: "박태균",
        position: "교수",
        organization: "서울대학교 국제대학원",
        profile: "서울대학교 국제대학원 교수로 한국현대사, 한미관계사 분야를 연구하고 있습니다."
      },
      {
        name: "이준웅",
        position: "교수",
        organization: "서울대학교 언론정보학과",
        profile: "서울대학교 언론정보학과 교수로 정치커뮤니케이션, 여론형성과 미디어 효과 분야를 연구하고 있습니다."
      },
      {
        name: "최인철",
        position: "교수",
        organization: "서울대학교 심리학과",
        profile: "서울대학교 심리학과 교수로 판단과 의사결정, 행복과 웰빙 등 사회심리학 분야를 연구하고 있습니다."
      }
    ],
    order: 2,
    isActive: true
  }
];

// 기존 데이터 삭제 후 테스트 데이터 추가
const addTestProfessorsData = async () => {
  try {
    // 기존 ProfessorSection 데이터 삭제
    await ProfessorSection.deleteMany({});
    console.log('기존 교수진 섹션 데이터가 삭제되었습니다.');

    // 새 테스트 데이터 추가
    const inserted = await ProfessorSection.insertMany(testProfessorSections);
    console.log(`${inserted.length}개의 교수진 섹션 데이터가 성공적으로 추가되었습니다.`);
    
    return true;
  } catch (error) {
    console.error('교수진 테스트 데이터 추가 중 오류가 발생했습니다:', error);
    return false;
  }
};

// 메인 함수
async function main() {
  try {
    const connected = await connectDB();
    if (!connected) {
      process.exit(1);
    }
    
    console.log('교수진 테스트 데이터 추가를 시작합니다...');
    const added = await addTestProfessorsData();
    
    if (added) {
      console.log('교수진 테스트 데이터 추가가 완료되었습니다.');
    } else {
      console.error('교수진 테스트 데이터 추가 중 오류가 발생했습니다.');
    }
    
    // 연결 종료
    await mongoose.connection.close();
    process.exit(added ? 0 : 1);
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