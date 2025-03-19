import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admission from '../models/Admission.js';

// .env 파일에서 환경 변수 로드
dotenv.config();

// MongoDB 연결
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB에 연결되었습니다.'))
.catch(err => {
  console.error('MongoDB 연결 오류:', err);
  process.exit(1);
});

// 테스트 입학 정보 데이터
const testAdmissionData = {
  title: "서울대학교 정치리더십과정",
  term: 25,
  year: "2024",
  startMonth: "3",
  endMonth: "12",
  capacity: "30",
  // 지원 자격 내용
  qualificationContent: "아래에 해당하는 인사 중 본 과정 운영위원회의 심사를 거쳐 선발합니다.",
  // 지원자격 모집대상 (복수 항목)
  targets: [
    { text: "국회의원, 전직 국회의원" },
    { text: "정부 고위 공직자(차관급 이상)" },
    { text: "정당 소속 정치인 및 지방자치단체장 경험자" },
    { text: "법조계, 공직, 군, 경찰, 기업, 언론, NGO 등 각 분야 리더" },
    { text: "대학교수 및 연구기관 연구원, 석/박사 학위 소지자" },
    { text: "기타 위의 각 항에 준하는 자격을 갖춘 자" }
  ],
  // 지원방법 내용
  applicationMethodContent: "아래 서류를 구비하여 우편 또는 이메일로 제출하시기 바랍니다.",
  // 지원서류 (복수 항목)
  requiredDocuments: [
    { name: "지원서", description: "소정양식 1부" },
    { name: "자기소개서", description: "1부" },
    { name: "재직증명서 또는 경력증명서", description: "1부" },
    { name: "최종 학력 증명서", description: "1부" },
    { name: "추천서", description: "1부 (선택사항)" }
  ],
  // 접수방법
  applicationProcessContent: "이메일, 우편 또는 방문 접수 가능합니다.",
  // 접수처
  applicationAddress: "▪️ 이메일: plp@snu.ac.kr\n▪️ 우편: (08826) 서울특별시 관악구 관악로 1 서울대학교 행정대학원 정치리더십과정 담당자 앞\n▪️ 방문접수: 서울대학교 행정대학원 행정실",
  // 전형일정
  scheduleContent: "▪️ 지원서 접수: 2024년 1월 10일 ~ 2024년 2월 15일\n▪️ 서류 심사: 2024년 2월 16일 ~ 2024년 2월 23일\n▪️ 합격자 발표: 2024년 2월 25일\n▪️ 등록 기간: 2024년 2월 26일 ~ 2024년 3월 5일\n▪️ 입학식: 2024년 3월 7일",
  // 교육 장소
  educationLocation: "서울대학교 행정대학원 강의실",
  // 수업 일정
  classSchedule: "매주 목요일 19:00 ~ 21:30\n특강 및 워크숍 진행 (월 1회 토요일)",
  // 교육비
  tuitionFee: "1,000만원",
  // 기타 추가 항목 (복수 항목)
  additionalItems: [
    { text: "국내연수: 연 1~2회" },
    { text: "해외연수: 연 1회" },
    { text: "정치 리더십 포럼: 분기별 개최" },
    { text: "동문 네트워킹 행사: 연 2회" }
  ],
  isActive: true
};

// 기존 데이터 삭제 후 테스트 데이터 추가
const addTestData = async () => {
  try {
    // 기존 Admission 데이터 삭제
    await Admission.deleteMany({});
    console.log('기존 입학 정보 데이터가 삭제되었습니다.');

    // 새 테스트 데이터 추가
    const newAdmission = new Admission(testAdmissionData);
    await newAdmission.save();
    
    console.log('입학 정보 테스트 데이터가 성공적으로 추가되었습니다.');
    process.exit(0);
  } catch (error) {
    console.error('테스트 데이터 추가 중 오류가 발생했습니다:', error);
    process.exit(1);
  }
};

// 스크립트 실행
addTestData(); 