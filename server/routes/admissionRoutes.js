const express = require('express');
const { isAdmin } = require('../middleware/authMiddleware');
const router = express.Router();
const Admission = require('../models/Admission');

// 입학 정보 가져오기 (공개)
router.get('/', async (req, res) => {
  try {
    console.log('입학 정보 조회 요청 수신');
    
    // MongoDB에서 입학 정보 가져오기 (활성화된 최신 데이터)
    const admission = await Admission.findOne({ isActive: true }).sort({ createdAt: -1 });
    
    // 데이터가 없는 경우 처리
    if (!admission) {
      console.log('입학 정보 데이터가 없습니다.');
      return res.json({
        title: '입학 정보를 준비 중입니다.',
        term: 1,
        year: new Date().getFullYear().toString(),
        isActive: false
      });
    }
    
    console.log('입학 정보 조회 성공');
    res.json(admission);
  } catch (error) {
    console.error('입학 정보 조회 실패:', error);
    res.status(500).json({ message: '입학 정보를 가져오는 중 오류가 발생했습니다.', error: error.message });
  }
});

// 모든 입학 정보 가져오기 (관리자용)
router.get('/all', isAdmin, async (req, res) => {
  try {
    const admissions = await Admission.find().sort({ createdAt: -1 });
    res.json(admissions);
  } catch (error) {
    console.error('모든 입학 정보 조회 실패:', error);
    res.status(500).json({ message: '입학 정보를 가져오는 중 오류가 발생했습니다.' });
  }
});

// 입학 정보 추가 (관리자 전용)
router.post('/', isAdmin, async (req, res) => {
  try {
    const newAdmission = new Admission({
      ...req.body,
      updatedAt: Date.now()
    });
    
    const savedAdmission = await newAdmission.save();
    res.status(201).json(savedAdmission);
  } catch (error) {
    console.error('입학 정보 생성 실패:', error);
    res.status(500).json({ message: '입학 정보를 생성하는 중 오류가 발생했습니다.' });
  }
});

// 입학 정보 업데이트 (관리자 전용)
router.put('/:id', isAdmin, async (req, res) => {
  try {
    const updatedAdmission = await Admission.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        updatedAt: Date.now()
      },
      { new: true }
    );
    
    if (!updatedAdmission) {
      return res.status(404).json({ message: '수정할 입학 정보를 찾을 수 없습니다.' });
    }
    
    res.json(updatedAdmission);
  } catch (error) {
    console.error('입학 정보 업데이트 실패:', error);
    res.status(500).json({ message: '입학 정보를 업데이트하는 중 오류가 발생했습니다.' });
  }
});

// 기본 입학 정보 업데이트 (관리자 전용) - 기존 PUT 엔드포인트와의 호환성 유지
router.put('/', isAdmin, async (req, res) => {
  try {
    // 현재 활성화된 입학 정보 찾기
    const currentAdmission = await Admission.findOne({ isActive: true });
    
    if (currentAdmission) {
      // 기존 데이터 업데이트
      const updatedAdmission = await Admission.findByIdAndUpdate(
        currentAdmission._id,
        {
          ...req.body,
          updatedAt: Date.now()
        },
        { new: true }
      );
      
      res.json(updatedAdmission);
    } else {
      // 데이터가 없으면 새로 생성
      const newAdmission = new Admission({
        ...req.body,
        isActive: true
      });
      
      const savedAdmission = await newAdmission.save();
      res.status(201).json(savedAdmission);
    }
  } catch (error) {
    console.error('입학 정보 업데이트 실패:', error);
    res.status(500).json({ message: '입학 정보를 업데이트하는 중 오류가 발생했습니다.' });
  }
});

module.exports = router; 