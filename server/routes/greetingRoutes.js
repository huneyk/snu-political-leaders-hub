const express = require('express');
const router = express.Router();
const Greeting = require('../models/Greeting');
const { isAdmin } = require('../middleware/authMiddleware');

// 인사말 정보 가져오기 (공개)
router.get('/', async (req, res) => {
  try {
    console.log('인사말 정보 조회 요청 수신');
    
    // MongoDB에서 인사말 데이터 가져오기
    const greeting = await Greeting.findOne().sort({ createdAt: -1 });
    
    // 데이터가 없는 경우 처리
    if (!greeting) {
      console.log('인사말 데이터가 없습니다.');
      return res.json(null); // null 반환
    }
    
    console.log('인사말 정보 조회 성공');
    res.json(greeting);
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
