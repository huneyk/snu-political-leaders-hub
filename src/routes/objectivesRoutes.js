import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import Objective from '../models/Objectives.js';

const router = express.Router();

/**
 * @route   GET /api/objectives
 * @desc    목표 정보 가져오기
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    console.log('목표 정보 조회 요청 수신');
    const objectives = await Objective.find({ isActive: true }).sort({ order: 1 });
    console.log(`조회된 활성화된 목표 정보: ${objectives.length}개`);
    res.json(objectives);
  } catch (error) {
    console.error('목표 정보 조회 실패:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

/**
 * @route   GET /api/objectives/all
 * @desc    모든 목표 정보 가져오기 (관리자용)
 * @access  Private
 */
router.get('/all', /* authenticateToken, */ async (req, res) => {
  try {
    console.log('모든 목표 정보 조회 요청 수신 (관리자용)');
    const objectives = await Objective.find().sort({ order: 1 });
    console.log(`조회된 모든 목표 정보: ${objectives.length}개`);
    res.json(objectives);
  } catch (error) {
    console.error('목표 정보 조회 실패:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

/**
 * @route   GET /api/objectives/:id
 * @desc    특정 목표 정보 가져오기
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const objective = await Objective.findById(req.params.id);
    
    if (!objective) {
      return res.status(404).json({ message: '해당 목표 정보를 찾을 수 없습니다.' });
    }
    
    res.json(objective);
  } catch (error) {
    console.error('목표 정보 조회 실패:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

/**
 * @route   POST /api/objectives
 * @desc    목표 정보 추가
 * @access  Private (테스트를 위해 인증 미들웨어 주석 처리)
 */
router.post('/', /* authenticateToken, */ async (req, res) => {
  try {
    const { sectionTitle, title, description, iconType, iconImage, order, isActive } = req.body;
    
    console.log('목표 정보 생성 요청 수신:', { title });
    
    if (!title || !description) {
      return res.status(400).json({ message: '제목과 설명은 필수 항목입니다.' });
    }
    
    const newObjective = new Objective({
      sectionTitle: sectionTitle || '과정의 목표',
      title,
      description,
      iconType: iconType || 'default',
      iconImage: iconImage || '',
      order: order || 0,
      isActive: isActive !== undefined ? isActive : true
    });
    
    const savedObjective = await newObjective.save();
    console.log('목표 정보 생성 성공:', savedObjective._id);
    res.status(201).json(savedObjective);
  } catch (error) {
    console.error('목표 정보 생성 실패:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

/**
 * @route   PUT /api/objectives/:id
 * @desc    목표 정보 수정
 * @access  Private (테스트를 위해 인증 미들웨어 주석 처리)
 */
router.put('/:id', /* authenticateToken, */ async (req, res) => {
  try {
    const { sectionTitle, title, description, iconType, iconImage, order, isActive } = req.body;
    
    console.log('목표 정보 수정 요청 수신:', { id: req.params.id, title });
    
    if (!title || !description) {
      return res.status(400).json({ message: '제목과 설명은 필수 항목입니다.' });
    }
    
    const updatedObjective = await Objective.findByIdAndUpdate(
      req.params.id,
      {
        sectionTitle: sectionTitle || '과정의 목표',
        title,
        description,
        iconType: iconType || 'default',
        iconImage: iconImage || '',
        order: order || 0,
        isActive: isActive !== undefined ? isActive : true,
        updatedAt: new Date()
      },
      { new: true }
    );
    
    if (!updatedObjective) {
      return res.status(404).json({ message: '목표 정보를 찾을 수 없습니다.' });
    }
    
    console.log('목표 정보 수정 성공:', updatedObjective._id);
    res.json(updatedObjective);
  } catch (error) {
    console.error('목표 정보 수정 실패:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

/**
 * @route   DELETE /api/objectives/:id
 * @desc    목표 정보 삭제
 * @access  Private (테스트를 위해 인증 미들웨어 주석 처리)
 */
router.delete('/:id', /* authenticateToken, */ async (req, res) => {
  try {
    console.log('목표 정보 삭제 요청 수신:', req.params.id);
    
    const deletedObjective = await Objective.findByIdAndDelete(req.params.id);
    
    if (!deletedObjective) {
      return res.status(404).json({ message: '목표 정보를 찾을 수 없습니다.' });
    }
    
    console.log('목표 정보 삭제 성공');
    res.json({ message: '목표 정보가 삭제되었습니다.' });
  } catch (error) {
    console.error('목표 정보 삭제 실패:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

export default router; 