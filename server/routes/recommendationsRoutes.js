const express = require('express');
const router = express.Router();
const Content = require('../models/Content');
const { isAdmin } = require('../middleware/authMiddleware');

// 모든 추천사 가져오기 (공개)
router.get('/', async (req, res) => {
  try {
    console.log('추천사 조회 요청 수신');
    
    // MongoDB에서 추천사 데이터 가져오기
    const recommendations = await Content.find({ type: 'recommendations' }).sort({ createdAt: -1 });
    
    // 데이터가 없는 경우 처리
    if (!recommendations || recommendations.length === 0) {
      console.log('추천사 데이터가 없습니다.');
      return res.json([]); // 빈 배열 반환
    }
    
    console.log(`추천사 조회 성공: ${recommendations.length}개 항목 발견`);
    res.json(recommendations);
  } catch (error) {
    console.error('추천사 조회 실패:', error);
    res.status(500).json({ message: '추천사를 가져오는 중 오류가 발생했습니다.', error: error.message });
  }
});

// 추천사 추가 (관리자 전용)
router.post('/', isAdmin, async (req, res) => {
  try {
    const { title, content, signText } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ message: '제목과 내용은 필수 항목입니다.' });
    }
    
    const newRecommendation = new Content({
      type: 'recommendations',
      title,
      content,
      signText: signText || '',
      ...req.body // 추가 필드
    });
    
    const savedRecommendation = await newRecommendation.save();
    res.status(201).json(savedRecommendation);
  } catch (error) {
    console.error('추천사 생성 실패:', error);
    res.status(500).json({ message: '추천사를 생성하는 중 오류가 발생했습니다.' });
  }
});

module.exports = router; 