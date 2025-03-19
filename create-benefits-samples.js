// MongoDB 연결 및 샘플 특전(Benefits) 데이터 생성 스크립트
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// 환경 변수 로드
dotenv.config();

// MongoDB 연결 문자열
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/plp_database';

// Benefit 모델 스키마 정의
const benefitSchema = new mongoose.Schema({
  sectionTitle: {
    type: String,
    default: '과정 특전',
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
const Benefit = mongoose.model('Benefit', benefitSchema);

// 샘플 데이터 배열
const sampleBenefits = [
  {
    sectionTitle: '과정 특전',
    title: '서울대학교 총장 명의 수료증',
    description: '과정 이수 후 서울대학교 총장 명의의 수료증을 발급받을 수 있습니다. 이 수료증은 서울대학교 정치지도자과정의 모든 교육과정을 성공적으로 완료했음을 공식적으로 인증합니다.',
    order: 0,
    isActive: true
  },
  {
    sectionTitle: '과정 특전',
    title: '서울대학교 총동창회 준회원 자격',
    description: '과정 수료 후 서울대학교 총동창회 준회원 자격이 부여됩니다. 이를 통해 서울대학교 동문 네트워크에 참여하고 다양한 활동과 행사에 참여할 수 있는 기회를 얻을 수 있습니다.',
    order: 1,
    isActive: true
  },
  {
    sectionTitle: '과정 특전',
    title: '서울대학교 시설 이용 권한',
    description: '수료 후에도 서울대학교의 주요 시설(도서관, 체육관, 박물관 등)을 이용할 수 있는 권한이 제공됩니다. 이를 통해 지속적인 학습과 연구 활동을 지원받을 수 있습니다.',
    order: 2,
    isActive: true
  },
  {
    sectionTitle: '과정 특전',
    title: '정치인 멘토링 프로그램',
    description: '현직 국회의원 및 유력 정치인들과의 멘토링 프로그램에 참여할 수 있습니다. 실제 정치 현장의 경험과 조언을 통해 정치 활동의 실질적인 지식과 통찰력을 얻을 수 있습니다.',
    order: 3,
    isActive: true
  },
  {
    sectionTitle: '과정 특전',
    title: '해외 연수 기회',
    description: '매년 선발을 통해 해외 유수 정치기관 및 교육기관 연수 프로그램에 참여할 수 있는 기회가 제공됩니다. 글로벌 시각을 넓히고 국제적 네트워크를 형성할 수 있습니다.',
    order: 4,
    isActive: true
  },
  {
    sectionTitle: '과정 특전',
    title: '동문 네트워크 활동',
    description: '과정 수료 후에도 정기적인 동문 모임, 세미나, 포럼 등 다양한 네트워킹 활동에 참여할 수 있습니다. 다양한 분야의 전문가들과 지속적인 교류를 통해 전문성을 강화하고 협력 관계를 구축할 수 있습니다.',
    order: 5,
    isActive: true
  },
  {
    sectionTitle: '과정 특전',
    title: '정책 연구 프로젝트 참여',
    description: '서울대학교 정치외교학부 및 관련 연구소의 정책 연구 프로젝트에 참여할 수 있는 기회가 제공됩니다. 실질적인 정책 개발 경험을 통해 정책 입안 능력을 향상시킬 수 있습니다.',
    order: 6,
    isActive: true
  },
  {
    sectionTitle: '과정 특전',
    title: '맞춤형 리더십 코칭',
    description: '개인별 특성과 필요에 맞는 맞춤형 리더십 코칭 프로그램을 이용할 수 있습니다. 전문 코치들의 지도를 통해 개인적인 리더십 스타일을 개발하고 강화할 수 있습니다.',
    order: 7,
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
    await Benefit.deleteMany({});
    console.log('기존 혜택 데이터가 삭제되었습니다.');
    
    // 샘플 데이터 삽입
    const insertedData = await Benefit.insertMany(sampleBenefits);
    console.log(`${insertedData.length}개의 샘플 혜택 데이터가 성공적으로 삽입되었습니다.`);
    
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
