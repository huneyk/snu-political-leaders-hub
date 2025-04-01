import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import ProfessorSection from '../models/Professors.js';

const router = express.Router();

/**
 * @route   GET /api/professors
 * @desc    교수진 정보 가져오기
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    console.log('교수진 정보 조회 요청 수신 (professorsRoutes)');
    const professorSections = await ProfessorSection.find({ isActive: true }).sort({ order: 1 });
    console.log(`조회된 활성화된 교수진 정보: ${professorSections.length}개 섹션`);
    res.json(professorSections);
  } catch (error) {
    console.error('교수진 정보 조회 실패:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

/**
 * @route   GET /api/professors/all
 * @desc    모든 교수진 정보 가져오기 (관리자용)
 * @access  Public (테스트를 위해 인증 미들웨어 제거)
 */
router.get('/all', /* authenticateToken, */ async (req, res) => {
  try {
    console.log('모든 교수진 정보 조회 요청 수신 (professorsRoutes)');
    const professorSections = await ProfessorSection.find().sort({ order: 1 });
    console.log(`조회된 모든 교수진 정보: ${professorSections.length}개 섹션`);
    res.json(professorSections);
  } catch (error) {
    console.error('교수진 정보 조회 실패:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

/**
 * @route   POST /api/professors
 * @desc    교수진 섹션 추가
 * @access  Public (테스트를 위해 인증 미들웨어 제거)
 */
router.post('/', /* authenticateToken, */ async (req, res) => {
  try {
    const { sectionTitle, professors, order, isActive } = req.body;
    
    console.log('교수진 섹션 생성 요청 수신 (professorsRoutes):', { sectionTitle });
    
    if (!sectionTitle || !professors || !Array.isArray(professors) || professors.length === 0) {
      return res.status(400).json({ message: '섹션 제목과 최소 한 명 이상의 교수진 정보가 필요합니다.' });
    }
    
    // 각 교수 정보 유효성 검사
    for (const professor of professors) {
      if (!professor.name || !professor.position) {
        return res.status(400).json({ message: '모든 교수에 대해 이름과 직위 정보가 필요합니다.' });
      }
    }
    
    const newProfessorSection = new ProfessorSection({
      sectionTitle,
      professors,
      order: order || 0,
      isActive: isActive !== undefined ? isActive : true
    });
    
    const savedProfessorSection = await newProfessorSection.save();
    console.log('교수진 섹션 생성 성공 (professorsRoutes):', savedProfessorSection._id);
    res.status(201).json(savedProfessorSection);
  } catch (error) {
    console.error('교수진 섹션 생성 실패 (professorsRoutes):', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

/**
 * @route   PUT /api/professors/:id
 * @desc    교수진 섹션 수정
 * @access  Public (테스트를 위해 인증 미들웨어 제거)
 */
router.put('/:id', /* authenticateToken, */ async (req, res) => {
  try {
    const { sectionTitle, professors, order, isActive } = req.body;
    
    console.log('교수진 섹션 수정 요청 수신 (professorsRoutes):', { id: req.params.id, sectionTitle });
    
    if (!sectionTitle || !professors || !Array.isArray(professors) || professors.length === 0) {
      return res.status(400).json({ message: '섹션 제목과 최소 한 명 이상의 교수진 정보가 필요합니다.' });
    }
    
    // 각 교수 정보 유효성 검사
    for (const professor of professors) {
      if (!professor.name || !professor.position) {
        return res.status(400).json({ message: '모든 교수에 대해 이름과 직위 정보가 필요합니다.' });
      }
    }
    
    const updatedProfessorSection = await ProfessorSection.findByIdAndUpdate(
      req.params.id,
      {
        sectionTitle,
        professors,
        order: order || 0,
        isActive: isActive !== undefined ? isActive : true,
        updatedAt: new Date()
      },
      { new: true }
    );
    
    if (!updatedProfessorSection) {
      return res.status(404).json({ message: '교수진 섹션을 찾을 수 없습니다.' });
    }
    
    console.log('교수진 섹션 수정 성공 (professorsRoutes):', updatedProfessorSection._id);
    res.json(updatedProfessorSection);
  } catch (error) {
    console.error('교수진 섹션 수정 실패 (professorsRoutes):', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

/**
 * @route   DELETE /api/professors/:id
 * @desc    교수진 섹션 삭제
 * @access  Public (테스트를 위해 인증 미들웨어 제거)
 */
router.delete('/:id', /* authenticateToken, */ async (req, res) => {
  try {
    console.log('교수진 섹션 삭제 요청 수신 (professorsRoutes):', req.params.id);
    
    const deletedProfessorSection = await ProfessorSection.findByIdAndDelete(req.params.id);
    
    if (!deletedProfessorSection) {
      return res.status(404).json({ message: '교수진 섹션을 찾을 수 없습니다.' });
    }
    
    console.log('교수진 섹션 삭제 성공 (professorsRoutes)');
    res.json({ message: '교수진 섹션이 삭제되었습니다.' });
  } catch (error) {
    console.error('교수진 섹션 삭제 실패 (professorsRoutes):', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

export default router; 