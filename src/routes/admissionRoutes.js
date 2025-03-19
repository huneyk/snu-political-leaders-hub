import express from 'express';
import Admission from '../models/Admission.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /api/admission
 * @desc    입학 정보 가져오기
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    // 가장 최근 입학 정보 가져오기 (isActive가 true인 경우만)
    const admissionInfo = await Admission.findOne({ isActive: true }).sort({ updatedAt: -1 });
    
    if (!admissionInfo) {
      return res.status(404).json({ message: '입학 정보를 찾을 수 없습니다.' });
    }
    
    res.json(admissionInfo);
  } catch (error) {
    console.error('입학 정보 조회 실패:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

/**
 * @route   GET /api/admission/all
 * @desc    모든 입학 정보 가져오기 (관리자용)
 * @access  Private
 */
router.get('/all', authenticateToken, async (req, res) => {
  try {
    // 모든 입학 정보 가져오기 (최신순)
    const admissionInfoList = await Admission.find().sort({ updatedAt: -1 });
    
    res.json(admissionInfoList);
  } catch (error) {
    console.error('입학 정보 목록 조회 실패:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

/**
 * @route   POST /api/admission
 * @desc    새 입학 정보 생성
 * @access  Private
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { 
      title, 
      term, 
      year, 
      startMonth, 
      endMonth, 
      capacity, 
      sections,
      isActive = true
    } = req.body;
    
    // 필수 필드 유효성 검사
    if (!title || !term || !year || !startMonth || !endMonth || !capacity || !sections) {
      return res.status(400).json({ message: '모든 필수 필드를 입력하세요.' });
    }
    
    // 기존에 active인 정보를 모두 비활성화
    if (isActive) {
      await Admission.updateMany({}, { isActive: false });
    }
    
    // 새로운 정보 생성
    const newAdmissionInfo = new Admission({
      title,
      term,
      year,
      startMonth,
      endMonth,
      capacity,
      sections,
      isActive
    });
    
    const savedInfo = await newAdmissionInfo.save();
    res.status(201).json(savedInfo);
  } catch (error) {
    console.error('입학 정보 저장 실패:', error);
    
    // 유효성 검증 오류 처리
    if (error.name === 'ValidationError') {
      const validationErrors = Object.keys(error.errors).map(field => ({
        field,
        message: error.errors[field].message
      }));
      
      return res.status(400).json({ 
        message: '유효성 검증 오류가 발생했습니다.',
        errors: validationErrors
      });
    }
    
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

/**
 * @route   PUT /api/admission
 * @desc    기존 입학 정보 업데이트
 * @access  Private
 */
router.put('/', authenticateToken, async (req, res) => {
  try {
    const { 
      _id,
      title, 
      term, 
      year, 
      startMonth, 
      endMonth, 
      capacity, 
      sections,
      isActive = true
    } = req.body;
    
    // ID 확인
    if (!_id) {
      return res.status(400).json({ message: '업데이트할 입학 정보의 ID가 필요합니다.' });
    }
    
    // 필수 필드 유효성 검사
    if (!title || !term || !year || !startMonth || !endMonth || !capacity || !sections) {
      return res.status(400).json({ message: '모든 필수 필드를 입력하세요.' });
    }
    
    // 기존에 active인 정보를 모두 비활성화 (현재 문서 제외)
    if (isActive) {
      await Admission.updateMany({ _id: { $ne: _id } }, { isActive: false });
    }
    
    // 해당 ID의 문서 찾아서 업데이트
    const updatedInfo = await Admission.findByIdAndUpdate(
      _id,
      {
        title,
        term,
        year,
        startMonth,
        endMonth,
        capacity,
        sections,
        isActive
      },
      { new: true, runValidators: true }
    );
    
    if (!updatedInfo) {
      return res.status(404).json({ message: '해당 ID의 입학 정보를 찾을 수 없습니다.' });
    }
    
    res.json(updatedInfo);
  } catch (error) {
    console.error('입학 정보 업데이트 실패:', error);
    
    // 유효성 검증 오류 처리
    if (error.name === 'ValidationError') {
      const validationErrors = Object.keys(error.errors).map(field => ({
        field,
        message: error.errors[field].message
      }));
      
      return res.status(400).json({ 
        message: '유효성 검증 오류가 발생했습니다.',
        errors: validationErrors
      });
    }
    
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

/**
 * @route   DELETE /api/admission/:id
 * @desc    입학 정보 삭제
 * @access  Private
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const deletedInfo = await Admission.findByIdAndDelete(req.params.id);
    
    if (!deletedInfo) {
      return res.status(404).json({ message: '해당 ID의 입학 정보를 찾을 수 없습니다.' });
    }
    
    res.json({ message: '입학 정보가 성공적으로 삭제되었습니다.' });
  } catch (error) {
    console.error('입학 정보 삭제 실패:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

export default router; 