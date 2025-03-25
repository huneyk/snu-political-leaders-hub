const express = require('express');
const router = express.Router();
const { isAdmin } = require('../middleware/authMiddleware');
const Content = require('../models/Content');
const mongoose = require('mongoose');

// 더미 데이터 생성 (MongoDB 연결 없이도 작동하도록)
const dummyContent = {
  recommendations: [
    { title: '추천사 1', content: '이 과정은 매우 유익했습니다.', author: '홍길동' },
    { title: '추천사 2', content: '정치 리더십에 대한 이해를 높일 수 있었습니다.', author: '김철수' }
  ],
  objectives: [
    { title: '목표 1', content: '정치 리더십 함양' },
    { title: '목표 2', content: '정책 분석 능력 향상' }
  ],
  schedules: [
    { title: '1주차', content: '오리엔테이션', date: '2025-03-01' },
    { title: '2주차', content: '정치 리더십 이론', date: '2025-03-08' }
  ],
  lecturers: [
    { name: '김교수', title: '정치학과 교수', profile: '서울대학교 정치학과' },
    { name: '이교수', title: '행정학과 교수', profile: '서울대학교 행정학과' }
  ]
};

// 기본 콘텐츠 라우트
router.get('/', (req, res) => {
  res.json({ message: '콘텐츠 API 엔드포인트' });
});

// 특정 타입의 콘텐츠 가져오기 - 더미 데이터 사용
router.get('/:type', (req, res) => {
  try {
    const { type } = req.params;
    
    // 유효한 콘텐츠 타입인지 확인
    const validTypes = ['recommendations', 'objectives', 'schedules', 'lecturers'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ message: '유효하지 않은 콘텐츠 타입입니다.' });
    }
    
    // 더미 데이터에서 해당 타입의 콘텐츠 가져오기
    const contents = dummyContent[type] || [];
    
    // 로그 출력
    console.log(`요청된 콘텐츠 타입: ${type}`);
    console.log(`응답 데이터: ${JSON.stringify(contents)}`);
    
    // 응답
    res.json(contents);
  } catch (error) {
    console.error(`${req.params.type} 콘텐츠 조회 실패:`, error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 콘텐츠 추가 (관리자 전용)
router.post('/:type', isAdmin, async (req, res) => {
  try {
    const { type } = req.params;
    const { title, content, imageUrl, signText, category, term } = req.body;
    
    // 유효한 콘텐츠 타입인지 확인
    const validTypes = ['greeting', 'recommendations', 'objectives', 'benefits', 'professors', 'schedules', 'lecturers'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ message: '유효하지 않은 콘텐츠 타입입니다.' });
    }
    
    // 필수 필드 검증
    if (!title || !content) {
      return res.status(400).json({ message: '제목과 내용은 필수 항목입니다.' });
    }
    
    // 새 콘텐츠 생성
    const newContent = new Content({
      type,
      title,
      content,
      imageUrl,
      signText,
      category,
      term
    });
    
    // 저장 및 응답
    const savedContent = await newContent.save();
    res.status(201).json(savedContent);
  } catch (error) {
    console.error(`${req.params.type} 콘텐츠 생성 실패:`, error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

module.exports = router; 