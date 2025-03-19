import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import Recommendation from '../models/Recommendations.js';
import Objective from '../models/Objectives.js';
import Benefit from '../models/Benefits.js';
import ProfessorSection from '../models/Professors.js';
import Schedule from '../models/Schedule.js';
import Lecturer from '../models/Lecturers.js';

const router = express.Router();

// ======================== Recommendations Routes ========================
/**
 * @route   GET /api/content/recommendations
 * @desc    모든 추천사 가져오기
 * @access  Public
 */
router.get('/recommendations', async (req, res) => {
  try {
    const recommendations = await Recommendation.find({ isActive: true }).sort({ order: 1 });
    res.json(recommendations);
  } catch (error) {
    console.error('추천사 조회 실패:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

/**
 * @route   GET /api/content/recommendations/all
 * @desc    모든 추천사 가져오기 (관리자용)
 * @access  Private
 */
router.get('/recommendations/all', authenticateToken, async (req, res) => {
  try {
    const recommendations = await Recommendation.find().sort({ order: 1 });
    res.json(recommendations);
  } catch (error) {
    console.error('추천사 조회 실패:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

/**
 * @route   POST /api/content/recommendations
 * @desc    추천사 추가
 * @access  Private
 */
router.post('/recommendations', authenticateToken, async (req, res) => {
  try {
    const { sectionTitle, title, name, position, content, imageUrl, order, isActive } = req.body;
    
    if (!name || !position || !content) {
      return res.status(400).json({ message: '이름, 직위, 내용은 필수 항목입니다.' });
    }
    
    const newRecommendation = new Recommendation({
      sectionTitle: sectionTitle || '추천의 글',
      title: title || '',
      name,
      position,
      content,
      imageUrl: imageUrl || '',
      order: order || 0,
      isActive: isActive !== undefined ? isActive : true
    });
    
    const savedRecommendation = await newRecommendation.save();
    res.status(201).json(savedRecommendation);
  } catch (error) {
    console.error('추천사 생성 실패:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

/**
 * @route   PUT /api/content/recommendations/:id
 * @desc    추천사 수정
 * @access  Private
 */
router.put('/recommendations/:id', authenticateToken, async (req, res) => {
  try {
    const { sectionTitle, title, name, position, content, imageUrl, order, isActive } = req.body;
    
    if (!name || !position || !content) {
      return res.status(400).json({ message: '이름, 직위, 내용은 필수 항목입니다.' });
    }
    
    const updatedRecommendation = await Recommendation.findByIdAndUpdate(
      req.params.id,
      {
        sectionTitle: sectionTitle || '추천의 글',
        title: title || '',
        name,
        position, 
        content,
        imageUrl: imageUrl || '',
        order: order || 0,
        isActive: isActive !== undefined ? isActive : true
      },
      { new: true }
    );
    
    if (!updatedRecommendation) {
      return res.status(404).json({ message: '추천사를 찾을 수 없습니다.' });
    }
    
    res.json(updatedRecommendation);
  } catch (error) {
    console.error('추천사 수정 실패:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

/**
 * @route   DELETE /api/content/recommendations/:id
 * @desc    추천사 삭제
 * @access  Private
 */
router.delete('/recommendations/:id', authenticateToken, async (req, res) => {
  try {
    const deletedRecommendation = await Recommendation.findByIdAndDelete(req.params.id);
    
    if (!deletedRecommendation) {
      return res.status(404).json({ message: '추천사를 찾을 수 없습니다.' });
    }
    
    res.json({ message: '추천사가 삭제되었습니다.' });
  } catch (error) {
    console.error('추천사 삭제 실패:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// ======================== Objectives Routes ========================
/**
 * @route   GET /api/content/objectives
 * @desc    목표 정보 가져오기
 * @access  Public
 */
router.get('/objectives', async (req, res) => {
  try {
    const objectives = await Objective.find({ isActive: true }).sort({ order: 1 });
    res.json(objectives);
  } catch (error) {
    console.error('목표 정보 조회 실패:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

/**
 * @route   GET /api/content/objectives/all
 * @desc    모든 목표 정보 가져오기 (관리자용)
 * @access  Private
 */
router.get('/objectives/all', authenticateToken, async (req, res) => {
  try {
    const objectives = await Objective.find().sort({ order: 1 });
    res.json(objectives);
  } catch (error) {
    console.error('목표 정보 조회 실패:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

/**
 * @route   POST /api/content/objectives
 * @desc    목표 정보 추가
 * @access  Private
 */
router.post('/objectives', authenticateToken, async (req, res) => {
  try {
    const { sectionTitle, title, description, iconType, iconImage, order, isActive } = req.body;
    
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
    res.status(201).json(savedObjective);
  } catch (error) {
    console.error('목표 정보 생성 실패:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

/**
 * @route   PUT /api/content/objectives/:id
 * @desc    목표 정보 수정
 * @access  Private
 */
router.put('/objectives/:id', authenticateToken, async (req, res) => {
  try {
    const { sectionTitle, title, description, iconType, iconImage, order, isActive } = req.body;
    
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
        isActive: isActive !== undefined ? isActive : true
      },
      { new: true }
    );
    
    if (!updatedObjective) {
      return res.status(404).json({ message: '목표 정보를 찾을 수 없습니다.' });
    }
    
    res.json(updatedObjective);
  } catch (error) {
    console.error('목표 정보 수정 실패:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

/**
 * @route   DELETE /api/content/objectives/:id
 * @desc    목표 정보 삭제
 * @access  Private
 */
router.delete('/objectives/:id', authenticateToken, async (req, res) => {
  try {
    const deletedObjective = await Objective.findByIdAndDelete(req.params.id);
    
    if (!deletedObjective) {
      return res.status(404).json({ message: '목표 정보를 찾을 수 없습니다.' });
    }
    
    res.json({ message: '목표 정보가 삭제되었습니다.' });
  } catch (error) {
    console.error('목표 정보 삭제 실패:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// ======================== Benefits Routes ========================
// Benefits 라우트도 Objectives와 유사한 형태로 구현
router.get('/benefits', async (req, res) => {
  try {
    const benefits = await Benefit.find({ isActive: true }).sort({ order: 1 });
    res.json(benefits);
  } catch (error) {
    console.error('혜택 정보 조회 실패:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

router.get('/benefits/all', authenticateToken, async (req, res) => {
  try {
    const benefits = await Benefit.find().sort({ order: 1 });
    res.json(benefits);
  } catch (error) {
    console.error('혜택 정보 조회 실패:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

router.post('/benefits', authenticateToken, async (req, res) => {
  try {
    const { title, description, iconType, order, isActive } = req.body;
    
    if (!title || !description) {
      return res.status(400).json({ message: '제목과 설명은 필수 항목입니다.' });
    }
    
    const newBenefit = new Benefit({
      title,
      description,
      iconType: iconType || 'default',
      order: order || 0,
      isActive: isActive !== undefined ? isActive : true
    });
    
    const savedBenefit = await newBenefit.save();
    res.status(201).json(savedBenefit);
  } catch (error) {
    console.error('혜택 정보 생성 실패:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

router.put('/benefits/:id', authenticateToken, async (req, res) => {
  try {
    const { title, description, iconType, order, isActive } = req.body;
    
    if (!title || !description) {
      return res.status(400).json({ message: '제목과 설명은 필수 항목입니다.' });
    }
    
    const updatedBenefit = await Benefit.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        iconType: iconType || 'default',
        order: order || 0,
        isActive: isActive !== undefined ? isActive : true
      },
      { new: true }
    );
    
    if (!updatedBenefit) {
      return res.status(404).json({ message: '혜택 정보를 찾을 수 없습니다.' });
    }
    
    res.json(updatedBenefit);
  } catch (error) {
    console.error('혜택 정보 수정 실패:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

router.delete('/benefits/:id', authenticateToken, async (req, res) => {
  try {
    const deletedBenefit = await Benefit.findByIdAndDelete(req.params.id);
    
    if (!deletedBenefit) {
      return res.status(404).json({ message: '혜택 정보를 찾을 수 없습니다.' });
    }
    
    res.json({ message: '혜택 정보가 삭제되었습니다.' });
  } catch (error) {
    console.error('혜택 정보 삭제 실패:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// ======================== Professors Routes ========================
router.get('/professors', async (req, res) => {
  try {
    const professorSections = await ProfessorSection.find({ isActive: true }).sort({ order: 1 });
    res.json(professorSections);
  } catch (error) {
    console.error('교수진 정보 조회 실패:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

router.get('/professors/all', authenticateToken, async (req, res) => {
  try {
    const professorSections = await ProfessorSection.find().sort({ order: 1 });
    res.json(professorSections);
  } catch (error) {
    console.error('교수진 정보 조회 실패:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

router.post('/professors', authenticateToken, async (req, res) => {
  try {
    const { sectionTitle, professors, order, isActive } = req.body;
    
    if (!sectionTitle || !professors || !Array.isArray(professors) || professors.length === 0) {
      return res.status(400).json({ message: '섹션 제목과 최소 1명 이상의 교수 정보가 필요합니다.' });
    }
    
    // 교수 정보 유효성 검사
    for (const professor of professors) {
      if (!professor.name || !professor.position || !professor.organization) {
        return res.status(400).json({ message: '모든 교수 정보에는 이름, 직위, 소속이 필요합니다.' });
      }
    }
    
    const newProfessorSection = new ProfessorSection({
      sectionTitle,
      professors,
      order: order || 0,
      isActive: isActive !== undefined ? isActive : true
    });
    
    const savedProfessorSection = await newProfessorSection.save();
    res.status(201).json(savedProfessorSection);
  } catch (error) {
    console.error('교수진 정보 생성 실패:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

router.put('/professors/:id', authenticateToken, async (req, res) => {
  try {
    const { sectionTitle, professors, order, isActive } = req.body;
    
    if (!sectionTitle || !professors || !Array.isArray(professors) || professors.length === 0) {
      return res.status(400).json({ message: '섹션 제목과 최소 1명 이상의 교수 정보가 필요합니다.' });
    }
    
    // 교수 정보 유효성 검사
    for (const professor of professors) {
      if (!professor.name || !professor.position || !professor.organization) {
        return res.status(400).json({ message: '모든 교수 정보에는 이름, 직위, 소속이 필요합니다.' });
      }
    }
    
    const updatedProfessorSection = await ProfessorSection.findByIdAndUpdate(
      req.params.id,
      {
        sectionTitle,
        professors,
        order: order || 0,
        isActive: isActive !== undefined ? isActive : true
      },
      { new: true }
    );
    
    if (!updatedProfessorSection) {
      return res.status(404).json({ message: '교수진 섹션을 찾을 수 없습니다.' });
    }
    
    res.json(updatedProfessorSection);
  } catch (error) {
    console.error('교수진 정보 수정 실패:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

router.delete('/professors/:id', authenticateToken, async (req, res) => {
  try {
    const deletedProfessorSection = await ProfessorSection.findByIdAndDelete(req.params.id);
    
    if (!deletedProfessorSection) {
      return res.status(404).json({ message: '교수진 섹션을 찾을 수 없습니다.' });
    }
    
    res.json({ message: '교수진 섹션이 삭제되었습니다.' });
  } catch (error) {
    console.error('교수진 정보 삭제 실패:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// ======================== Schedule Routes ========================
router.get('/schedules', async (req, res) => {
  try {
    const schedules = await Schedule.find({ isActive: true }).sort({ date: -1 });
    res.json(schedules);
  } catch (error) {
    console.error('일정 정보 조회 실패:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

router.get('/schedules/all', authenticateToken, async (req, res) => {
  try {
    const schedules = await Schedule.find().sort({ date: -1 });
    res.json(schedules);
  } catch (error) {
    console.error('일정 정보 조회 실패:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

router.post('/schedules', authenticateToken, async (req, res) => {
  try {
    const { title, date, term, year, sessions, isActive } = req.body;
    
    if (!title || !date || !term || !year) {
      return res.status(400).json({ message: '제목, 날짜, 기수, 년도는 필수 항목입니다.' });
    }
    
    const newSchedule = new Schedule({
      title,
      date: new Date(date),
      term,
      year,
      sessions: sessions || [],
      isActive: isActive !== undefined ? isActive : true
    });
    
    const savedSchedule = await newSchedule.save();
    res.status(201).json(savedSchedule);
  } catch (error) {
    console.error('일정 정보 생성 실패:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

router.put('/schedules/:id', authenticateToken, async (req, res) => {
  try {
    const { title, date, term, year, sessions, isActive } = req.body;
    
    if (!title || !date || !term || !year) {
      return res.status(400).json({ message: '제목, 날짜, 기수, 년도는 필수 항목입니다.' });
    }
    
    const updatedSchedule = await Schedule.findByIdAndUpdate(
      req.params.id,
      {
        title,
        date: new Date(date),
        term,
        year,
        sessions: sessions || [],
        isActive: isActive !== undefined ? isActive : true
      },
      { new: true }
    );
    
    if (!updatedSchedule) {
      return res.status(404).json({ message: '일정 정보를 찾을 수 없습니다.' });
    }
    
    res.json(updatedSchedule);
  } catch (error) {
    console.error('일정 정보 수정 실패:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

router.delete('/schedules/:id', authenticateToken, async (req, res) => {
  try {
    const deletedSchedule = await Schedule.findByIdAndDelete(req.params.id);
    
    if (!deletedSchedule) {
      return res.status(404).json({ message: '일정 정보를 찾을 수 없습니다.' });
    }
    
    res.json({ message: '일정 정보가 삭제되었습니다.' });
  } catch (error) {
    console.error('일정 정보 삭제 실패:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// ======================== Lecturers Routes ========================
router.get('/lecturers', async (req, res) => {
  try {
    const lecturers = await Lecturer.find({ isActive: true }).sort({ order: 1 });
    res.json(lecturers);
  } catch (error) {
    console.error('강사진 정보 조회 실패:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

router.get('/lecturers/all', authenticateToken, async (req, res) => {
  try {
    const lecturers = await Lecturer.find().sort({ order: 1 });
    res.json(lecturers);
  } catch (error) {
    console.error('강사진 정보 조회 실패:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

router.post('/lecturers', authenticateToken, async (req, res) => {
  try {
    const { name, biography, imageUrl, term, category, order, isActive } = req.body;
    
    if (!name || !term || !category) {
      return res.status(400).json({ message: '이름, 기수, 카테고리는 필수 항목입니다.' });
    }
    
    const newLecturer = new Lecturer({
      name,
      biography: biography || '',
      imageUrl: imageUrl || '',
      term,
      category,
      order: order || 0,
      isActive: isActive !== undefined ? isActive : true
    });
    
    const savedLecturer = await newLecturer.save();
    res.status(201).json(savedLecturer);
  } catch (error) {
    console.error('강사진 정보 생성 실패:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

router.put('/lecturers/:id', authenticateToken, async (req, res) => {
  try {
    const { name, biography, imageUrl, term, category, order, isActive } = req.body;
    
    if (!name || !term || !category) {
      return res.status(400).json({ message: '이름, 기수, 카테고리는 필수 항목입니다.' });
    }
    
    const updatedLecturer = await Lecturer.findByIdAndUpdate(
      req.params.id,
      {
        name,
        biography: biography || '',
        imageUrl: imageUrl || '',
        term,
        category,
        order: order || 0,
        isActive: isActive !== undefined ? isActive : true
      },
      { new: true }
    );
    
    if (!updatedLecturer) {
      return res.status(404).json({ message: '강사진 정보를 찾을 수 없습니다.' });
    }
    
    res.json(updatedLecturer);
  } catch (error) {
    console.error('강사진 정보 수정 실패:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

router.delete('/lecturers/:id', authenticateToken, async (req, res) => {
  try {
    const deletedLecturer = await Lecturer.findByIdAndDelete(req.params.id);
    
    if (!deletedLecturer) {
      return res.status(404).json({ message: '강사진 정보를 찾을 수 없습니다.' });
    }
    
    res.json({ message: '강사진 정보가 삭제되었습니다.' });
  } catch (error) {
    console.error('강사진 정보 삭제 실패:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

export default router; 