// MongoDB 연결 및 샘플 목표(Objectives) 데이터 생성 스크립트
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// 환경 변수 로드
dotenv.config();

// MongoDB 연결 문자열
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/plp_database';

// Base64 아이콘 이미지 (간단한 SVG 파일을 Base64로 인코딩)
const leaderIcon = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMwMDY2Y2MiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMjAgMjFWMTlDMjAgMTUuMTMgMTYuNDEgMTIgMTIgMTJNMTIgMTJDNy41OCAxMiA0IDE1LjEzIDQgMTlWMjFNMTIgMTJDOS43OSAxMiA4IDEwLjIxIDggOFY2QzggMy43OSA5Ljc5IDIgMTIgMlMxNiAzLjc5IDE2IDZWOEMxNiAxMC4yMSAxNC4yMSAxMiAxMiAxMloiPjwvcGF0aD48L3N2Zz4=";

const expertiseIcon = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMwMDY2Y2MiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMiAzSzhWMjFIMlpNMTYgOEgyMlYyMUgxNlpNOSA4SDEzQzEzLjU1IDggMTQgOC40NSAxNCA5VjEyQzE0IDEyLjU1IDEzLjU1IDEzIDEzIDEzSDlWOFoiPjwvcGF0aD48L3N2Zz4=";

const networkIcon = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMwMDY2Y2MiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMTcgMjFWMTloMS41QTIuNSAyLjUgMCAwIDAgMjEgMTYuNVYxMmEyIDIgMCAwIDEgMi0yaDEiPjwvcGF0aD48cGF0aCBkPSJNMSAyMmgxVjNhMiAyIDAgMCAxIDItMmgxMy41YTIgMiAwIDAgMSAyIDJ2Ij48L3BhdGg+PHBhdGggZD0iTTEgMTRoNSIgc3Ryb2tlLXdpZHRoPSIyIj48L3BhdGg+PHBhdGggZD0iTTUgOEgxIj48L3BhdGg+PHBhdGggZD0iTTUgMTYuNUEyLjUgMi41IDAgMCAwIDcuNSAxOUgxMyI+PC9wYXRoPjxjaXJjbGUgY3g9IjE3IiBjeT0iNiIgcj0iMiI+PC9jaXJjbGU+PGNpcmNsZSBjeD0iMTciIGN5PSIxMCIgcj0iMiI+PC9jaXJjbGU+PGNpcmNsZSBjeD0iMTciIGN5PSIxNCIgcj0iMiI+PC9jaXJjbGU+PGNpcmNsZSBjeD0iMTciIGN5PSIyMiIgcj0iMiI+PC9jaXJjbGU+PC9zdmc+";

const globalIcon = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMwMDY2Y2MiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCI+PC9jaXJjbGU+PHBhdGggZD0iTTIgMTJoMjAiPjwvcGF0aD48cGF0aCBkPSJNMTIgMnYyMCI+PC9wYXRoPjxwYXRoIGQ9Ik0xMiA3QTIwIDIwIDAgMCAwIDEyIDE3QTIwIDIwIDAgMCAwIDEyIDciPjwvcGF0aD48L3N2Zz4=";

const defaultIcon = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMwMDY2Y2MiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMTMgMmwtMTAgMTJoOWwtMSA4IDEwLTEyaC05bDEtOHoiPjwvcGF0aD48L3N2Zz4=";

// 아이콘 타입에 따른 Base64 이미지 반환 함수
const getIconForType = (iconType) => {
  switch (iconType) {
    case 'leader':
      return leaderIcon;
    case 'expertise':
      return expertiseIcon;
    case 'network':
      return networkIcon;
    case 'global':
      return globalIcon;
    default:
      return defaultIcon;
  }
};

// Objective 모델 스키마 정의 (기존 스키마 확장)
const objectiveSchema = new mongoose.Schema({
  sectionTitle: {
    type: String,
    default: '과정의 목표',
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  iconType: {
    type: String,
    default: 'default'
  },
  iconImage: {
    type: String // Base64 또는 URL 문자열
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// 모델 생성
const Objective = mongoose.model('Objective', objectiveSchema);

// 샘플 데이터 배열
const sampleObjectives = [
  {
    sectionTitle: '과정의 목표',
    title: '정치 지도자 역량 강화',
    description: '정치 현장에서 필요한 다양한 지식과 실무 역량을 체계적으로 습득하여 미래 정치 지도자로서의 기본 역량을 강화합니다. 정책 분석, 대중 연설, 정치적 의사결정 등의 핵심 역량을 집중적으로 개발합니다.',
    iconType: 'leader',
    iconImage: leaderIcon,
    order: 0,
    isActive: true
  },
  {
    sectionTitle: '과정의 목표',
    title: '전문 지식 습득',
    description: '정치, 경제, 사회, 법률, 국제 관계 등 다양한 분야의 전문 지식을 습득하고 통합적 시각을 갖춥니다. 정치인으로서 갖추어야 할 다양한 분야의 전문 지식을 서울대학교의 우수한 교수진을 통해 배웁니다.',
    iconType: 'expertise',
    iconImage: expertiseIcon,
    order: 1,
    isActive: true
  },
  {
    sectionTitle: '과정의 목표',
    title: '정치 현장 경험',
    description: '정치 현장에서의 실제 경험을 통해 이론과 실무를 결합할 수 있는 기회를 제공합니다. 국회, 정부 기관 방문, 현직 정치인 멘토링, 지역구 현장 방문 등 다양한 현장 경험을 통해 실제 정치 현장에 대한 이해를 높입니다.',
    iconType: 'network',
    iconImage: networkIcon,
    order: 2,
    isActive: true
  },
  {
    sectionTitle: '과정의 목표',
    title: '네트워크 형성',
    description: '정치, 경제, 사회 각 분야의 전문가 및 동료 학습자와의 네트워크를 형성합니다. 동기 및 선후배 수강생들과의 인적 네트워크를 형성하여 미래 정치 활동의 기반을 다질 수 있습니다.',
    iconType: 'network',
    iconImage: networkIcon,
    order: 3,
    isActive: true
  },
  {
    sectionTitle: '과정의 목표',
    title: '글로벌 시각 함양',
    description: '글로벌 시대에 요구되는 국제적 감각과 시각을 갖춘 정치 지도자로 성장합니다. 해외 연수 및 글로벌 이슈에 대한 교육을 통해 국제적 시각을 갖춘 정치인으로 성장할 수 있습니다.',
    iconType: 'global',
    iconImage: globalIcon,
    order: 4,
    isActive: true
  },
  {
    sectionTitle: '과정의 목표',
    title: '리더십 개발',
    description: '갈등 조정, 협상력, 의사결정 능력 등 정치 지도자에게 필요한 리더십 역량을 개발합니다. 다양한 워크숍과 사례 연구를 통해 실질적인 리더십 역량을 함양합니다.',
    iconType: 'leader',
    iconImage: leaderIcon,
    order: 5,
    isActive: true
  }
];

// MongoDB에 연결하고 샘플 데이터 삽입
const insertSampleData = async () => {
  try {
    // MongoDB 연결
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('MongoDB에 연결되었습니다.');
    
    // 기존 데이터 삭제 (선택 사항)
    await Objective.deleteMany({});
    console.log('기존 목표 데이터가 삭제되었습니다.');
    
    // 샘플 데이터 삽입
    const insertedData = await Objective.insertMany(sampleObjectives);
    console.log(`${insertedData.length}개의 샘플 목표 데이터가 성공적으로 삽입되었습니다.`);
    
    // 연결 종료
    await mongoose.connection.close();
    console.log('MongoDB 연결이 종료되었습니다.');
    
    process.exit(0);
  } catch (error) {
    console.error('샘플 데이터 삽입 중 오류 발생:', error);
    process.exit(1);
  }
};

// 스크립트 실행
insertSampleData();
