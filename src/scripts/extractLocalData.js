import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ES Modules에서 __dirname 사용하기
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 출력 디렉토리 경로 설정
const EXPORT_DIR = path.join(__dirname, '../../localStorageExport');

// 디렉토리가 없으면 생성
if (!fs.existsSync(EXPORT_DIR)) {
  fs.mkdirSync(EXPORT_DIR, { recursive: true });
  console.log(`${EXPORT_DIR} 디렉토리를 생성했습니다.`);
}

// 샘플 데이터: 실제로는 클라이언트에서 추출한 데이터를 사용해야 합니다
const sampleData = {
  greeting: {
    title: '환영합니다',
    content: '서울대학교 정치리더십과정(PLP)에 오신 것을 환영합니다.',
    author: '홍길동',
    position: '과정 책임교수',
    imageUrl: '/images/dean.jpg',
    isActive: true
  },
  recommendations: [
    {
      name: '김철수',
      position: '전 국회의원',
      content: '이 과정은 정치 리더십을 배우는 데 큰 도움이 되었습니다.',
      imageUrl: '/images/recommender1.jpg',
      order: 1,
      isActive: true
    },
    {
      name: '이영희',
      position: '지방자치단체장',
      content: '정치 활동에 필요한 이론과 실무를 배울 수 있었습니다.',
      imageUrl: '/images/recommender2.jpg',
      order: 2,
      isActive: true
    }
  ],
  objectives: [
    {
      title: '미래 정치 리더 양성',
      description: '미래 정치 발전을 이끌어갈 유능한 리더를 양성합니다.',
      iconType: 'leader',
      order: 1,
      isActive: true
    },
    {
      title: '정치 전문성 강화',
      description: '정치 현장에서 필요한 실무 역량과 전문성을 강화합니다.',
      iconType: 'expertise',
      order: 2,
      isActive: true
    },
    {
      title: '정치 네트워크 구축',
      description: '다양한 분야의 전문가들과 네트워크를 구축할 수 있습니다.',
      iconType: 'network',
      order: 3,
      isActive: true
    }
  ],
  benefits: [
    {
      title: '최고의 교수진',
      description: '서울대학교의 우수한 교수진과 현장 전문가들로부터 배울 수 있습니다.',
      iconType: 'professor',
      order: 1,
      isActive: true
    },
    {
      title: '실무 중심 교육',
      description: '이론과 실무를 균형 있게 배울 수 있는 커리큘럼을 제공합니다.',
      iconType: 'practice',
      order: 2,
      isActive: true
    },
    {
      title: '동문 네트워크',
      description: '다양한 분야의 전문가들로 구성된 동문 네트워크에 참여할 수 있습니다.',
      iconType: 'network',
      order: 3,
      isActive: true
    }
  ],
  professors: [
    {
      name: '강대한',
      title: '교수',
      department: '정치외교학부',
      specialization: '정치 이론',
      imageUrl: '/images/professor1.jpg',
      bio: '정치 이론 분야의 권위자로, 다수의 저서와 논문을 발표했습니다.',
      email: 'professor1@snu.ac.kr',
      order: 1,
      isActive: true
    },
    {
      name: '박민주',
      title: '교수',
      department: '행정대학원',
      specialization: '공공 정책',
      imageUrl: '/images/professor2.jpg',
      bio: '공공 정책 분야에서 다년간의 연구 경험을 가지고 있습니다.',
      email: 'professor2@snu.ac.kr',
      order: 2,
      isActive: true
    }
  ],
  schedules: [
    {
      title: '1학기 일정',
      date: new Date('2024-03-01'),
      term: '제25기',
      year: 2024,
      sessions: [
        {
          title: '오리엔테이션',
          description: '과정 소개 및 참가자 소개',
          lecturerName: '관리자',
          lecturerPosition: '과정 책임자',
          startTime: '10:00',
          endTime: '12:00',
          location: '서울대학교 행정대학원 57-1동 세미나실'
        },
        {
          title: '정치 리더십의 이해',
          description: '정치 리더십의 기본 개념과 원리',
          lecturerName: '강대한',
          lecturerPosition: '정치외교학부 교수',
          startTime: '13:00',
          endTime: '15:00',
          location: '서울대학교 행정대학원 57-1동 세미나실'
        }
      ],
      isActive: true
    }
  ],
  lecturers: [
    {
      name: '이정치',
      title: '대표',
      organization: '정치연구소',
      position: '소장',
      specialization: '선거 전략',
      imageUrl: '/images/lecturer1.jpg',
      bio: '다수의 선거를 성공적으로 이끈 선거 전략 전문가입니다.',
      lectures: [
        {
          title: '효과적인 선거 전략',
          description: '효과적인 선거 전략 수립 및 실행 방법',
          term: '제25기',
          year: 2024
        }
      ],
      order: 1,
      isActive: true
    },
    {
      name: '김행정',
      title: '전 장관',
      organization: '행정안전부',
      position: '정책 고문',
      specialization: '행정 개혁',
      imageUrl: '/images/lecturer2.jpg',
      bio: '다년간의 공직 경험을 바탕으로 행정 개혁을 연구하고 있습니다.',
      lectures: [
        {
          title: '행정 개혁과 정치 리더십',
          description: '행정 개혁을 위한 정치 리더십의 역할',
          term: '제25기',
          year: 2024
        }
      ],
      order: 2,
      isActive: true
    }
  ]
};

// 데이터를 JSON 파일로 저장하는 함수
function saveToJsonFile(data, filename) {
  const filePath = path.join(EXPORT_DIR, `${filename}.json`);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`${filename} 데이터가 ${filePath}에 저장되었습니다.`);
    return true;
  } catch (error) {
    console.error(`${filename} 데이터 저장 실패:`, error);
    return false;
  }
}

// 샘플 데이터를 각각 별도의 파일로 저장
function extractAndSaveData() {
  console.log('로컬 데이터 추출 및 저장을 시작합니다...');
  
  // 각 데이터 저장
  Object.entries(sampleData).forEach(([key, value]) => {
    saveToJsonFile(value, key);
  });
  
  console.log('데이터 추출 및 저장이 완료되었습니다.');
}

// 실행
extractAndSaveData(); 