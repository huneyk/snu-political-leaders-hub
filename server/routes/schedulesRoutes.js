const express = require('express');
const router = express.Router();
const Content = require('../models/Content');
const { isAdmin } = require('../middleware/authMiddleware');

// 모든 일정 정보 가져오기 (공개)
router.get('/', async (req, res) => {
  try {
    console.log('일정 정보 조회 요청 수신');
    
    // 카테고리 필터링 (선택적)
    const filter = { type: 'schedules' };
    if (req.query.category) {
      filter.category = req.query.category;
    }
    
    // MongoDB에서 일정 데이터 가져오기
    const schedules = await Content.find(filter).sort({ createdAt: -1 });
    
    // 데이터가 없는 경우 처리
    if (!schedules || schedules.length === 0) {
      console.log('일정 데이터가 없습니다.');
      return res.json([]); // 빈 배열 반환
    }
    
    console.log(`일정 정보 조회 성공: ${schedules.length}개 항목 발견`);
    res.json(schedules);
  } catch (error) {
    console.error('일정 정보 조회 실패:', error);
    res.status(500).json({ message: '일정 정보를 가져오는 중 오류가 발생했습니다.', error: error.message });
  }
});

// 일정 정보 추가 (관리자 전용)
router.post('/', isAdmin, async (req, res) => {
  try {
    const { title, content, category, term } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ message: '제목과 내용은 필수 항목입니다.' });
    }
    
    const newSchedule = new Content({
      type: 'schedules',
      title,
      content,
      category: category || 'spring',
      term: term || 1,
      ...req.body // 추가 필드
    });
    
    const savedSchedule = await newSchedule.save();
    res.status(201).json(savedSchedule);
  } catch (error) {
    console.error('일정 정보 생성 실패:', error);
    res.status(500).json({ message: '일정 정보를 생성하는 중 오류가 발생했습니다.' });
  }
});

module.exports = router; 