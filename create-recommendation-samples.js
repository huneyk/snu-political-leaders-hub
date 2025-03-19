// MongoDB 연결 및 샘플 추천 데이터 생성 스크립트
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// 환경 변수 로드
dotenv.config();

// MongoDB 연결 문자열
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/plp_database';

// Recommendation 모델 스키마 정의 (src/models/Recommendations.js와 동일해야 함)
const recommendationSchema = new mongoose.Schema({
  sectionTitle: {
    type: String,
    default: '추천의 글',
    trim: true
  },
  title: {
    type: String,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  position: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String
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
const Recommendation = mongoose.model('Recommendation', recommendationSchema);

// 샘플 데이터 배열
const sampleRecommendations = [
  {
    sectionTitle: '추천의 글',
    title: '미래 정치 지도자의 요람',
    name: '김영삼',
    position: '前 대한민국 대통령',
    content: '서울대학교 정치지도자과정은 우리나라의 미래를 이끌어갈 정치 지도자를 양성하는 중요한 과정입니다. 이 과정을 통해 청년 정치인들이 국가와 사회를 위한 봉사정신과 함께 올바른 정치관을 가질 수 있기를 바랍니다.',
    imageUrl: '',
    order: 0,
    isActive: true
  },
  {
    sectionTitle: '추천의 글',
    title: '정치 발전의 초석',
    name: '박근혜',
    position: '前 대한민국 대통령',
    content: '정치는 국민을 위한 봉사입니다. 서울대학교 정치지도자과정이 우리나라 정치 발전의 초석이 되어 국민과 함께하는 정치인을 양성하는 데 큰 역할을 하기를 기대합니다. 이 과정을 통해 많은 정치인들이 국가와 국민을 위한 참된 봉사자가 되길 바랍니다.',
    imageUrl: '',
    order: 1,
    isActive: true
  },
  {
    sectionTitle: '추천의 글',
    title: '미래를 향한 비전',
    name: '문재인',
    position: '前 대한민국 대통령',
    content: '서울대학교 정치지도자과정은 한국 정치의 미래를 이끌어갈 인재들에게 필요한 지식과 경험을 제공합니다. 이 과정을 통해 우리 사회가 더 나은 방향으로 나아가는 데 기여할 인재들이 많이 배출되기를 진심으로 바랍니다. 정치는 국민의 삶을 개선하는 수단이며, 이를 위해 끊임없이 공부하고 소통하는 정치인이 필요합니다.',
    imageUrl: '',
    order: 2,
    isActive: true
  },
  {
    sectionTitle: '추천의 글',
    title: '정치 혁신의 기회',
    name: '윤석열',
    position: '대한민국 대통령',
    content: '정치는 국민의 신뢰 위에 서 있어야 합니다. 서울대학교 정치지도자과정이 국민에게 신뢰받는 정치인을 양성하는 데 중요한 역할을 하길 바랍니다. 투명하고 공정한 사회를 만들기 위해 우수한 인재들이 이 과정을 통해 성장하기를 기대합니다.',
    imageUrl: '',
    order: 3,
    isActive: true
  },
  {
    sectionTitle: '추천의 글',
    title: '정치 교육의 중요성',
    name: '이해찬',
    position: '前 국무총리',
    content: '정치인에게 가장 중요한 것은 국민의 마음을 이해하는 능력입니다. 서울대학교 정치지도자과정은 이론과 실무를 겸비한 교육을 통해 국민과 소통할 수 있는 정치인을 양성하고 있습니다. 많은 예비 정치인들이 이 과정을 통해 올바른 정치관을 확립하길 바랍니다.',
    imageUrl: '',
    order: 4,
    isActive: true
  },
  {
    sectionTitle: '추천의 글',
    title: '민주주의의 발전',
    name: '황교안',
    position: '前 국무총리',
    content: '대한민국의 민주주의 발전을 위해 우수한 정치 인재 양성은 필수적입니다. 서울대학교 정치지도자과정은 미래 정치 지도자들에게 필요한 역량과 지식을 체계적으로 제공하고 있습니다. 이 과정을 통해 대한민국 정치의 수준이 한 단계 더 도약하기를 기대합니다.',
    imageUrl: '',
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
    await Recommendation.deleteMany({});
    console.log('기존 추천 데이터가 삭제되었습니다.');
    
    // 샘플 데이터 삽입
    const insertedData = await Recommendation.insertMany(sampleRecommendations);
    console.log(`${insertedData.length}개의 샘플 추천 데이터가 성공적으로 삽입되었습니다.`);
    
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
