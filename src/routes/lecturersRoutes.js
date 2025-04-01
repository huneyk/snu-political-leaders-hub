import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import Lecturer from '../models/Lecturers.js';

const router = express.Router();

/**
 * @route   GET /api/lecturers
 * @desc    활성화된 강사진 정보 가져오기
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    console.log('활성화된 강사진 정보 조회 요청 수신 (lecturersRoutes)');
    const lecturers = await Lecturer.find({ isActive: true }).sort({ order: 1 });
    console.log(`조회된 활성화된 강사진 정보: ${lecturers.length}명`);
    res.json(lecturers);
  } catch (error) {
    console.error('강사진 정보 조회 실패:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

/**
 * @route   GET /api/lecturers/all
 * @desc    모든 강사진 정보 가져오기 (관리자용)
 * @access  Public (테스트를 위해 인증 미들웨어 제거)
 */
router.get('/all', async (req, res) => {
  try {
    console.log('모든 강사진 정보 조회 요청 수신 (lecturersRoutes)');
    const lecturers = await Lecturer.find().sort({ order: 1 });
    console.log(`조회된 모든 강사진 정보: ${lecturers.length}명`);
    res.json(lecturers);
  } catch (error) {
    console.error('강사진 정보 조회 실패:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

/**
 * @route   POST /api/lecturers
 * @desc    강사 추가
 * @access  Public (테스트를 위해 인증 미들웨어 제거)
 */
router.post('/', async (req, res) => {
  try {
    const { name, biography, imageUrl, term, category, order, isActive, title, organization, position, specialization, lectures } = req.body;
    
    console.log('강사 생성 요청 수신 (lecturersRoutes):', { name, term, category });
    
    if (!name) {
      return res.status(400).json({ message: '강사 이름은 필수 항목입니다.' });
    }
    
    const newLecturer = new Lecturer({
      name,
      biography: biography || '',
      imageUrl: imageUrl || '',
      term: term || '1',
      category: category || '특별강사진',
      order: order || 0,
      isActive: isActive !== undefined ? isActive : true,
      title: title || '',
      organization: organization || '',
      position: position || '',
      specialization: specialization || '',
      lectures: lectures || []
    });
    
    const savedLecturer = await newLecturer.save();
    console.log('강사 정보 생성 성공 (lecturersRoutes):', savedLecturer._id);
    res.status(201).json(savedLecturer);
  } catch (error) {
    console.error('강사 정보 생성 실패 (lecturersRoutes):', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

/**
 * @route   PUT /api/lecturers/:id
 * @desc    강사 정보 수정
 * @access  Public (테스트를 위해 인증 미들웨어 제거)
 */
router.put('/:id', async (req, res) => {
  try {
    const { name, biography, imageUrl, term, category, order, isActive, title, organization, position, specialization, lectures } = req.body;
    
    console.log('강사 정보 수정 요청 수신 (lecturersRoutes):', { id: req.params.id, name });
    
    if (!name) {
      return res.status(400).json({ message: '강사 이름은 필수 항목입니다.' });
    }
    
    const updatedLecturer = await Lecturer.findByIdAndUpdate(
      req.params.id,
      {
        name,
        biography: biography || '',
        imageUrl: imageUrl || '',
        term: term || '1',
        category: category || '특별강사진',
        order: order || 0,
        isActive: isActive !== undefined ? isActive : true,
        title: title || '',
        organization: organization || '',
        position: position || '',
        specialization: specialization || '',
        lectures: lectures || [],
        updatedAt: new Date()
      },
      { new: true }
    );
    
    if (!updatedLecturer) {
      return res.status(404).json({ message: '강사 정보를 찾을 수 없습니다.' });
    }
    
    console.log('강사 정보 수정 성공 (lecturersRoutes):', updatedLecturer._id);
    res.json(updatedLecturer);
  } catch (error) {
    console.error('강사 정보 수정 실패 (lecturersRoutes):', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

/**
 * @route   DELETE /api/lecturers/:id
 * @desc    강사 정보 삭제
 * @access  Public (테스트를 위해 인증 미들웨어 제거)
 */
router.delete('/:id', async (req, res) => {
  try {
    console.log('강사 정보 삭제 요청 수신 (lecturersRoutes):', req.params.id);
    
    const deletedLecturer = await Lecturer.findByIdAndDelete(req.params.id);
    
    if (!deletedLecturer) {
      return res.status(404).json({ message: '강사 정보를 찾을 수 없습니다.' });
    }
    
    console.log('강사 정보 삭제 성공 (lecturersRoutes)');
    res.json({ message: '강사 정보가 삭제되었습니다.' });
  } catch (error) {
    console.error('강사 정보 삭제 실패 (lecturersRoutes):', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

export default router; 