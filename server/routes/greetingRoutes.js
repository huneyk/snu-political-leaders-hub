const express = require('express');
const router = express.Router();
const Greeting = require('../models/Greeting');
const { isAdmin } = require('../middleware/authMiddleware');

// 인사말 정보 가져오기 (공개)
router.get('/', async (req, res) => {
  try {
    console.log('인사말 정보 조회 요청 수신');
    
    // 전체 컬렉션 개수 확인
    const count = await Greeting.countDocuments();
    console.log(`greetings 컬렉션에 총 ${count}개의 문서가 있습니다.`);
    
    // MongoDB에서 활성화된 인사말 데이터 가져오기 (isActive가 true인 문서만)
    const greetings = await Greeting.find({ isActive: true }).lean();
    console.log('조회된 활성화된 인사말:', JSON.stringify(greetings));
    
    // 결과가 없으면 isActive 필드 없이 모든 문서 조회
    if (greetings.length === 0) {
      console.log('활성화된 인사말 데이터가 없습니다. 모든 문서를 조회합니다.');
      const allGreetings = await Greeting.find().lean();
      console.log('조회된 모든 인사말:', JSON.stringify(allGreetings));
      
      if (allGreetings.length > 0) {
        console.log('인사말 정보 조회 성공:', allGreetings[0]);
        return res.json(allGreetings[0]);
      }
    } else {
      console.log('활성화된 인사말 정보 조회 성공:', greetings[0]);
      return res.json(greetings[0]);
    }
    
    // 데이터가 없는 경우 기본 데이터 반환
    console.log('인사말 데이터가 없습니다. 기본 데이터 반환합니다.');
    const defaultGreeting = {
      _id: 'default-greeting-id',
      title: '정치리더십과정에 오신 것을 환영합니다',
      content: `서울대학교 정치리더십과정(PLP)은 정치지도자의 자질과 역량 향상을 위해 개설된 교육 프로그램입니다.
      
현대 사회는 복잡한 정치, 경제, 사회적 문제들이 상호 연결되어 있어 이를 효과적으로 다룰 수 있는 리더십이 요구됩니다. 본 과정은 정치인, 고위 공직자, 기업인 등 사회 각계각층의 리더들에게 필요한 전문 지식과 리더십 기술을 제공합니다.
      
서울대학교의 우수한 교수진과 각 분야 전문가들이 참여하여 최신 이론과 실무 사례를 바탕으로 한 교육을 제공합니다. 이론과 실무가 균형 잡힌 커리큘럼을 통해 수강생들은 정치 리더로서의 역량을 크게 향상시킬 수 있습니다.`,
      author: '김홍길',
      position: '정치리더십과정 주임교수',
      imageUrl: '/images/default-greeting.jpg',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    return res.json(defaultGreeting);
  } catch (error) {
    console.error('인사말 정보 조회 실패:', error);
    res.status(500).json({ message: '인사말 정보를 가져오는 중 오류가 발생했습니다.', error: error.message });
  }
});

// 인사말 정보 추가/업데이트 (관리자 전용)
router.post('/', isAdmin, async (req, res) => {
  try {
    const { title, content } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ message: '제목과 내용은 필수 항목입니다.' });
    }
    
    // 기존 인사말이 있는지 확인
    const existingGreeting = await Greeting.findOne();
    
    if (existingGreeting) {
      // 기존 인사말이 있으면 업데이트
      existingGreeting.title = title;
      existingGreeting.content = content;
      existingGreeting.updatedAt = Date.now();
      
      // 추가 필드가 있다면 업데이트
      Object.keys(req.body).forEach(key => {
        if (!['title', 'content'].includes(key)) {
          existingGreeting[key] = req.body[key];
        }
      });
      
      const updatedGreeting = await existingGreeting.save();
      return res.json(updatedGreeting);
    }
    
    // 새 인사말 생성
    const newGreeting = new Greeting({
      title,
      content,
      ...req.body // 추가 필드
    });
    
    const savedGreeting = await newGreeting.save();
    res.status(201).json(savedGreeting);
  } catch (error) {
    console.error('인사말 정보 생성/업데이트 실패:', error);
    res.status(500).json({ message: '인사말 정보를 처리하는 중 오류가 발생했습니다.' });
  }
});

module.exports = router;
