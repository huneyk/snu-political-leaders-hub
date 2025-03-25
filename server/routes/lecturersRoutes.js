const express = require('express');
const router = express.Router();
const Content = require('../models/Content');
const { isAdmin } = require('../middleware/authMiddleware');

// 모든 강사 정보 가져오기 (공개)
router.get('/', async (req, res) => {
  try {
    console.log('강사 정보 조회 요청 수신');
    
    // MongoDB에서 강사 데이터 가져오기
    const lecturers = await Content.find({ type: 'lecturers' }).sort({ createdAt: -1 });
    
    // 데이터가 없는 경우 처리
    if (!lecturers || lecturers.length === 0) {
      console.log('강사 데이터가 없습니다.');
      return res.json([]); // 빈 배열 반환
    }
    
    console.log(`강사 정보 조회 성공: ${lecturers.length}개 항목 발견`);
    res.json(lecturers);
  } catch (error) {
    console.error('강사 정보 조회 실패:', error);
    res.status(500).json({ message: '강사 정보를 가져오는 중 오류가 발생했습니다.', error: error.message });
  }
});

// 강사 정보 추가 (관리자 전용)
router.post('/', isAdmin, async (req, res) => {
  try {
    const { title, content, imageUrl } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ message: '제목과 내용은 필수 항목입니다.' });
    }
    
    const newLecturer = new Content({
      type: 'lecturers',
      title,
      content,
      imageUrl: imageUrl || '',
      ...req.body // 추가 필드
    });
    
    const savedLecturer = await newLecturer.save();
    res.status(201).json(savedLecturer);
  } catch (error) {
    console.error('강사 정보 생성 실패:', error);
    res.status(500).json({ message: '강사 정보를 생성하는 중 오류가 발생했습니다.' });
  }
});

module.exports = router; 