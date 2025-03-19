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
    // 가장 최근 입학 정보 가져오기
    const admissionInfo = await Admission.findOne().sort({ updatedAt: -1 });
    
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
 * @route   POST /api/admission
 * @desc    입학 정보 저장 또는 업데이트
 * @access  Private
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, term, year, startMonth, endMonth, capacity, sections } = req.body;
    
    // 필수 필드 유효성 검사
    if (!title || !term || !year || !startMonth || !endMonth || !capacity || !sections) {
      return res.status(400).json({ message: '모든 필수 필드를 입력하세요.' });
    }
    
    // 기존 정보 찾기
    let admissionInfo = await Admission.findOne().sort({ updatedAt: -1 });
    
    if (admissionInfo) {
      // 기존 정보 업데이트
      admissionInfo.title = title;
      admissionInfo.term = term;
      admissionInfo.year = year;
      admissionInfo.startMonth = startMonth;
      admissionInfo.endMonth = endMonth;
      admissionInfo.capacity = capacity;
      admissionInfo.sections = sections;
      
      await admissionInfo.save();
      res.json(admissionInfo);
    } else {
      // 새로운 정보 생성
      const newAdmissionInfo = new Admission({
        title,
        term,
        year,
        startMonth,
        endMonth,
        capacity,
        sections
      });
      
      const savedInfo = await newAdmissionInfo.save();
      res.status(201).json(savedInfo);
    }
  } catch (error) {
    console.error('입학 정보 저장 실패:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

export default router; 