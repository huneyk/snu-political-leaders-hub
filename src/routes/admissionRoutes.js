import express from 'express';
import Admission from '../models/Admission.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Middleware to ensure term is stored as a number
const processTermField = (req, res, next) => {
  if (req.body && req.body.term !== undefined) {
    // If term is a string, convert it to a number
    if (typeof req.body.term === 'string') {
      // Remove any non-numeric characters and convert to integer
      const numericTerm = req.body.term.replace(/\D/g, '');
      req.body.term = parseInt(numericTerm, 10);
      console.log('Converted term to number:', req.body.term);
    }
  }
  next();
};

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
// 임시로 인증 미들웨어 비활성화 (테스트용)
router.post('/', /* authenticateToken, */ processTermField, async (req, res) => {
  try {
    // 임시 테스트용 인증 우회
    console.log('POST 요청 받음 - 인증 미들웨어 비활성화(테스트용)');
    
    const { 
      title, 
      term, 
      year, 
      startMonth, 
      endMonth, 
      capacity, 
      sections,
      tuitionFee,
      qualificationContent,
      targets,
      applicationMethodContent,
      requiredDocuments,
      applicationProcessContent,
      applicationAddress,
      scheduleContent,
      educationLocation,
      classSchedule,
      additionalItems,
      isActive = true
    } = req.body;
    
    console.log('Received admission data:', req.body);
    
    // 필수 필드 유효성 검사
    if (!title || term === undefined || !year || !startMonth || !endMonth || !capacity) {
      return res.status(400).json({ 
        message: '모든 필수 필드를 입력하세요.', 
        missingFields: {
          title: !title,
          term: term === undefined,
          year: !year, 
          startMonth: !startMonth,
          endMonth: !endMonth,
          capacity: !capacity
        }
      });
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
      qualificationContent,
      targets: targets || [],
      applicationMethodContent,
      requiredDocuments: requiredDocuments || [],
      applicationProcessContent,
      applicationAddress,
      scheduleContent,
      educationLocation,
      classSchedule,
      tuitionFee,
      additionalItems: additionalItems || [],
      isActive
    });
    
    // 저장
    const savedAdmissionInfo = await newAdmissionInfo.save();
    console.log('Saved admission info:', savedAdmissionInfo);
    
    res.status(201).json(savedAdmissionInfo);
  } catch (error) {
    console.error('입학 정보 생성 실패:', error);
    
    // MongoDB 유효성 검사 에러 처리
    if (error.name === 'ValidationError') {
      const validationErrors = {};
      
      for (const field in error.errors) {
        validationErrors[field] = error.errors[field].message;
      }
      
      return res.status(400).json({ 
        message: '입력 데이터가 유효하지 않습니다.',
        errors: validationErrors
      });
    }
    
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

/**
 * @route   PUT /api/admission
 * @desc    입학 정보 업데이트
 * @access  Private
 */
// 임시로 인증 미들웨어 비활성화 (테스트용)
router.put('/', /* authenticateToken, */ processTermField, async (req, res) => {
  try {
    // 임시 테스트용 인증 우회
    console.log('PUT 요청 받음 - 인증 미들웨어 비활성화(테스트용)');
    
    const { _id, isActive, ...updateData } = req.body;
    
    console.log('Updating admission with ID:', _id, 'Data:', req.body);
    console.log('endYear value:', req.body.endYear);
    
    if (!_id) {
      return res.status(400).json({ message: 'ID가 필요합니다.' });
    }
    
    // 기존에 active인 정보를 모두 비활성화 (새 정보가 active인 경우)
    if (isActive) {
      await Admission.updateMany({ _id: { $ne: _id } }, { isActive: false });
    }
    
    // 업데이트
    const updatedAdmissionInfo = await Admission.findByIdAndUpdate(
      _id,
      { ...updateData, isActive },
      { new: true, runValidators: true }
    );
    
    if (!updatedAdmissionInfo) {
      return res.status(404).json({ message: '입학 정보를 찾을 수 없습니다.' });
    }
    
    console.log('Updated admission info:', updatedAdmissionInfo);
    console.log('Final endYear value:', updatedAdmissionInfo.endYear);
    res.json(updatedAdmissionInfo);
  } catch (error) {
    console.error('입학 정보 업데이트 실패:', error);
    
    // MongoDB 유효성 검사 에러 처리
    if (error.name === 'ValidationError') {
      const validationErrors = {};
      
      for (const field in error.errors) {
        validationErrors[field] = error.errors[field].message;
      }
      
      return res.status(400).json({ 
        message: '입력 데이터가 유효하지 않습니다.',
        errors: validationErrors
      });
    }
    
    // 몽고DB ID 형식 오류
    if (error.name === 'CastError' && error.kind === 'ObjectId') {
      return res.status(400).json({ message: '유효하지 않은 ID 형식입니다.' });
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
    const { id } = req.params;
    
    // 해당 ID의 입학 정보 삭제
    const deletedInfo = await Admission.findByIdAndDelete(id);
    
    if (!deletedInfo) {
      return res.status(404).json({ message: '입학 정보를 찾을 수 없습니다.' });
    }
    
    res.json({ message: '입학 정보가 삭제되었습니다.', id });
  } catch (error) {
    console.error('입학 정보 삭제 실패:', error);
    
    // 몽고DB ID 형식 오류
    if (error.name === 'CastError' && error.kind === 'ObjectId') {
      return res.status(400).json({ message: '유효하지 않은 ID 형식입니다.' });
    }
    
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

export default router; 