// MongoDB 인사말 초기 데이터 추가 스크립트
const mongoose = require('mongoose');
require('dotenv').config({ path: '../../.env' });

// MongoDB 연결
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://plp_admin:plp_admin123@plp-cluster.mongodb.net/plp_database?retryWrites=true&w=majority')
  .then(() => {
    console.log('✅ MongoDB 데이터베이스에 성공적으로 연결되었습니다.');
    addInitialGreeting();
  })
  .catch(err => {
    console.error('❌ MongoDB 연결 오류:', err);
    process.exit(1);
  });

// Greeting 모델 불러오기
const Greeting = require('../models/Greeting');

// 인사말 초기 데이터 추가 함수
async function addInitialGreeting() {
  try {
    // 기존 인사말 데이터 확인
    const existingGreeting = await Greeting.findOne();
    
    if (existingGreeting) {
      console.log('이미 인사말 데이터가 존재합니다.');
      console.log('기존 데이터:', existingGreeting);
      mongoose.disconnect();
      return;
    }
    
    // 새 인사말 데이터 생성
    const greeting = new Greeting({
      title: '정치리더십과정에 오신 것을 환영합니다',
      content: `서울대학교 정치리더십과정(PLP)은 정치지도자의 자질과 역량 향상을 위해 개설된 교육 프로그램입니다.
      
현대 사회는 복잡한 정치, 경제, 사회적 문제들이 상호 연결되어 있어 이를 효과적으로 다룰 수 있는 리더십이 요구됩니다. 본 과정은 정치인, 고위 공직자, 기업인 등 사회 각계각층의 리더들에게 필요한 전문 지식과 리더십 기술을 제공합니다.
      
서울대학교의 우수한 교수진과 각 분야 전문가들이 참여하여 최신 이론과 실무 사례를 바탕으로 한 교육을 제공합니다. 이론과 실무가 균형 잡힌 커리큘럼을 통해 수강생들은 정치 리더로서의 역량을 크게 향상시킬 수 있습니다.
      
우리는 이 과정이 한국 정치 발전에 기여할 수 있는 훌륭한 정치 리더를 양성하는데 중요한 역할을 할 것으로 기대합니다.`,
      author: '김홍길',
      position: '정치리더십과정 주임교수',
      imageUrl: 'https://example.com/images/greeting.jpg',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // DB에 저장
    await greeting.save();
    console.log('✅ 인사말 초기 데이터가 성공적으로 추가되었습니다.');
    console.log('추가된 데이터:', greeting);
    
    // 연결 종료
    mongoose.disconnect();
    console.log('MongoDB 연결이 종료되었습니다.');
  } catch (error) {
    console.error('❌ 인사말 데이터 추가 오류:', error);
    mongoose.disconnect();
    process.exit(1);
  }
} 