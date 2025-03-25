const express = require('express');
const router = express.Router();
const Benefit = require('../models/Benefit');
const { isAdmin } = require('../middleware/authMiddleware');

// 모든 혜택 정보 가져오기 (공개)
router.get('/', async (req, res) => {
  try {
    console.log('혜택 정보 조회 요청 수신');
    
    // MongoDB에서 혜택 데이터 가져오기
    const benefits = await Benefit.find({ isActive: true }).sort({ order: 1 });
    
    // 데이터가 없는 경우 처리
    if (!benefits || benefits.length === 0) {
      console.log('혜택 데이터가 없습니다.');
      return res.json([]); // 빈 배열 반환
    }
    
    console.log(`혜택 정보 조회 성공: ${benefits.length}개 항목 발견`);
    res.json(benefits);
  } catch (error) {
    console.error('혜택 정보 조회 실패:', error);
    res.status(500).json({ message: '혜택 정보를 가져오는 중 오류가 발생했습니다.', error: error.message });
  }
});

// 혜택 정보 추가 (관리자 전용)
router.post('/', isAdmin, async (req, res) => {
  try {
    const { sectionTitle, title, description, iconType } = req.body;
    
    if (!title || !description) {
      return res.status(400).json({ message: '제목과 설명은 필수 항목입니다.' });
    }
    
    const newBenefit = new Benefit({
      sectionTitle,
      title,
      description,
      iconType,
      order: req.body.order || 0,
      isActive: req.body.isActive !== undefined ? req.body.isActive : true,
      ...req.body // 추가 필드
    });
    
    const savedBenefit = await newBenefit.save();
    res.status(201).json(savedBenefit);
  } catch (error) {
    console.error('혜택 정보 생성 실패:', error);
    res.status(500).json({ message: '혜택 정보를 생성하는 중 오류가 발생했습니다.' });
  }
});

module.exports = router; 