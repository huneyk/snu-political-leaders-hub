import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import Benefit from '../models/Benefits.js';

const router = express.Router();

/**
 * @route   GET /api/benefits
 * @desc    특전 정보 가져오기
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    console.log('특전 정보 조회 요청 수신');
    const benefits = await Benefit.find({ isActive: true }).sort({ order: 1 });
    console.log(`조회된 활성화된 특전 정보: ${benefits.length}개`);
    res.json(benefits);
  } catch (error) {
    console.error('특전 정보 조회 실패:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

/**
 * @route   GET /api/benefits/all
 * @desc    모든 특전 정보 가져오기 (관리자용)
 * @access  Private
 */
router.get('/all', /* authenticateToken, */ async (req, res) => {
  try {
    console.log('모든 특전 정보 조회 요청 수신 (관리자용)');
    const benefits = await Benefit.find().sort({ order: 1 });
    console.log(`조회된 모든 특전 정보: ${benefits.length}개`);
    res.json(benefits);
  } catch (error) {
    console.error('특전 정보 조회 실패:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

/**
 * @route   GET /api/benefits/:id
 * @desc    특정 특전 정보 가져오기
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const benefit = await Benefit.findById(req.params.id);
    
    if (!benefit) {
      return res.status(404).json({ message: '해당 특전 정보를 찾을 수 없습니다.' });
    }
    
    res.json(benefit);
  } catch (error) {
    console.error('특전 정보 조회 실패:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

/**
 * @route   POST /api/benefits
 * @desc    특전 정보 추가
 * @access  Private (테스트를 위해 인증 미들웨어 주석 처리)
 */
router.post('/', /* authenticateToken, */ async (req, res) => {
  try {
    const { sectionTitle, title, description, order, isActive } = req.body;
    
    console.log('특전 정보 생성 요청 수신:', { title });
    
    if (!title) {
      return res.status(400).json({ message: '제목은 필수 항목입니다.' });
    }
    
    const newBenefit = new Benefit({
      sectionTitle: sectionTitle || '과정 특전',
      title,
      description: description || '',
      order: order || 0,
      isActive: isActive !== undefined ? isActive : true
    });
    
    const savedBenefit = await newBenefit.save();
    console.log('특전 정보 생성 성공:', savedBenefit._id);
    res.status(201).json(savedBenefit);
  } catch (error) {
    console.error('특전 정보 생성 실패:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

/**
 * @route   PUT /api/benefits/:id
 * @desc    특전 정보 수정
 * @access  Private (테스트를 위해 인증 미들웨어 주석 처리)
 */
router.put('/:id', /* authenticateToken, */ async (req, res) => {
  try {
    const { sectionTitle, title, description, order, isActive } = req.body;
    
    console.log('특전 정보 수정 요청 수신:', { id: req.params.id, title });
    
    if (!title) {
      return res.status(400).json({ message: '제목은 필수 항목입니다.' });
    }
    
    const updatedBenefit = await Benefit.findByIdAndUpdate(
      req.params.id,
      {
        sectionTitle: sectionTitle || '과정 특전',
        title,
        description: description || '',
        order: order || 0,
        isActive: isActive !== undefined ? isActive : true,
        updatedAt: new Date()
      },
      { new: true }
    );
    
    if (!updatedBenefit) {
      return res.status(404).json({ message: '특전 정보를 찾을 수 없습니다.' });
    }
    
    console.log('특전 정보 수정 성공:', updatedBenefit._id);
    res.json(updatedBenefit);
  } catch (error) {
    console.error('특전 정보 수정 실패:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

/**
 * @route   DELETE /api/benefits/:id
 * @desc    특전 정보 삭제
 * @access  Private (테스트를 위해 인증 미들웨어 주석 처리)
 */
router.delete('/:id', /* authenticateToken, */ async (req, res) => {
  try {
    console.log('특전 정보 삭제 요청 수신:', req.params.id);
    
    const deletedBenefit = await Benefit.findByIdAndDelete(req.params.id);
    
    if (!deletedBenefit) {
      return res.status(404).json({ message: '특전 정보를 찾을 수 없습니다.' });
    }
    
    console.log('특전 정보 삭제 성공');
    res.json({ message: '특전 정보가 삭제되었습니다.' });
  } catch (error) {
    console.error('특전 정보 삭제 실패:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

export default router; 