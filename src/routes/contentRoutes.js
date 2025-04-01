import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import Recommendation from '../models/Recommendations.js';
import Objective from '../models/Objectives.js';
import Benefit from '../models/Benefits.js';
import ProfessorSection from '../models/Professors.js';
import Schedule from '../models/Schedule.js';
import Lecturer from '../models/Lecturers.js';
import Greeting from '../models/Greeting.js';

const router = express.Router();

// ======================== Greeting Routes ========================
/**
 * @route   GET /api/content/greeting
 * @desc    인사말 정보 가져오기
 * @access  Public
 */
router.get('/greeting', async (req, res) => {
  try {
    console.log('📝 인사말 조회 요청 받음');
    // 활성화된 최신 인사말 가져오기
    const greeting = await Greeting.findOne({ isActive: true }).sort({ updatedAt: -1 });
    
    if (!greeting) {
      return res.status(404).json({ message: '인사말 정보를 찾을 수 없습니다.' });
    }
    
    console.log('✅ 인사말 데이터 조회 성공');
    res.json(greeting);
  } catch (error) {
    console.error('인사말 정보 조회 실패:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

/**
 * @route   GET /api/content/greeting/all
 * @desc    모든 인사말 정보 가져오기
 * @access  Private
 */
router.get('/greeting/all', authenticateToken, async (req, res) => {
  try {
    const greetings = await Greeting.find().sort({ updatedAt: -1 });
    res.json(greetings);
  } catch (error) {
    console.error('인사말 정보 조회 실패:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

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
router.get('/recommendations/all', /* authenticateToken, */ async (req, res) => {
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
router.post('/recommendations', /* authenticateToken, */ async (req, res) => {
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
router.put('/recommendations/:id', /* authenticateToken, */ async (req, res) => {
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
router.delete('/recommendations/:id', /* authenticateToken, */ async (req, res) => {
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
router.post('/objectives', /* authenticateToken, */ async (req, res) => {
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
router.put('/objectives/:id', /* authenticateToken, */ async (req, res) => {
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
router.delete('/objectives/:id', /* authenticateToken, */ async (req, res) => {
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
/**
 * @route   GET /api/content/benefits
 * @desc    모든 특전 정보 가져오기
 * @access  Public
 */
router.get('/benefits', async (req, res) => {
  try {
    const benefits = await Benefit.find({ isActive: true }).sort({ order: 1 });
    res.json(benefits);
  } catch (error) {
    console.error('특전 정보 조회 실패:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

/**
 * @route   GET /api/content/benefits/all
 * @desc    모든 특전 정보 가져오기 (관리자용)
 * @access  Public (테스트를 위해 인증 제거)
 */
router.get('/benefits/all', async (req, res) => {
  try {
    console.log('모든 특전 정보 조회 요청 수신 (contentRoutes)');
    const benefits = await Benefit.find().sort({ order: 1 });
    console.log(`조회된 모든 특전 정보: ${benefits.length}개`);
    res.json(benefits);
  } catch (error) {
    console.error('특전 정보 조회 실패:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

/**
 * @route   POST /api/content/benefits
 * @desc    특전 정보 추가
 * @access  Public (테스트를 위해 인증 제거)
 */
router.post('/benefits', async (req, res) => {
  try {
    const { sectionTitle, title, description, order, isActive } = req.body;
    
    console.log('특전 정보 생성 요청 수신 (contentRoutes):', { title });
    
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
    console.log('특전 정보 생성 성공 (contentRoutes):', savedBenefit._id);
    res.status(201).json(savedBenefit);
  } catch (error) {
    console.error('특전 정보 생성 실패 (contentRoutes):', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

/**
 * @route   PUT /api/content/benefits/:id
 * @desc    특전 정보 수정
 * @access  Public (테스트를 위해 인증 제거)
 */
router.put('/benefits/:id', async (req, res) => {
  try {
    const { sectionTitle, title, description, order, isActive } = req.body;
    
    console.log('특전 정보 수정 요청 수신 (contentRoutes):', { id: req.params.id, title });
    
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
    
    console.log('특전 정보 수정 성공 (contentRoutes):', updatedBenefit._id);
    res.json(updatedBenefit);
  } catch (error) {
    console.error('특전 정보 수정 실패 (contentRoutes):', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

/**
 * @route   DELETE /api/content/benefits/:id
 * @desc    특전 정보 삭제
 * @access  Public (테스트를 위해 인증 제거)
 */
router.delete('/benefits/:id', async (req, res) => {
  try {
    console.log('특전 정보 삭제 요청 수신 (contentRoutes):', req.params.id);
    
    const deletedBenefit = await Benefit.findByIdAndDelete(req.params.id);
    
    if (!deletedBenefit) {
      return res.status(404).json({ message: '특전 정보를 찾을 수 없습니다.' });
    }
    
    console.log('특전 정보 삭제 성공 (contentRoutes)');
    res.json({ message: '특전 정보가 삭제되었습니다.' });
  } catch (error) {
    console.error('특전 정보 삭제 실패 (contentRoutes):', error);
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

/**
 * @route   GET /api/content/professors/all
 * @desc    모든 교수진 정보 가져오기 (관리자용)
 * @access  Public (테스트를 위해 인증 제거)
 */
router.get('/professors/all', async (req, res) => {
  try {
    console.log('모든 교수진 정보 조회 요청 수신 (contentRoutes)');
    const professorSections = await ProfessorSection.find().sort({ order: 1 });
    console.log(`조회된 모든 교수진 정보: ${professorSections.length}개 섹션`);
    res.json(professorSections);
  } catch (error) {
    console.error('교수진 정보 조회 실패:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

/**
 * @route   POST /api/content/professors
 * @desc    교수진 섹션 추가
 * @access  Public (테스트를 위해 인증 제거)
 */
router.post('/professors', async (req, res) => {
  try {
    const { sectionTitle, professors, order, isActive } = req.body;
    
    console.log('교수진 섹션 생성 요청 수신:', { sectionTitle });
    
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
    console.log('교수진 섹션 생성 성공:', savedProfessorSection._id);
    res.status(201).json(savedProfessorSection);
  } catch (error) {
    console.error('교수진 섹션 생성 실패:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

/**
 * @route   PUT /api/content/professors/:id
 * @desc    교수진 섹션 수정
 * @access  Public (테스트를 위해 인증 제거)
 */
router.put('/professors/:id', async (req, res) => {
  try {
    const { sectionTitle, professors, order, isActive } = req.body;
    
    console.log('교수진 섹션 수정 요청 수신:', { id: req.params.id, sectionTitle });
    
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
        isActive: isActive !== undefined ? isActive : true
      },
      { new: true }
    );
    
    if (!updatedProfessorSection) {
      return res.status(404).json({ message: '교수진 섹션을 찾을 수 없습니다.' });
    }
    
    console.log('교수진 섹션 수정 성공:', updatedProfessorSection._id);
    res.json(updatedProfessorSection);
  } catch (error) {
    console.error('교수진 섹션 수정 실패:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

/**
 * @route   DELETE /api/content/professors/:id
 * @desc    교수진 섹션 삭제
 * @access  Public (테스트를 위해 인증 제거)
 */
router.delete('/professors/:id', async (req, res) => {
  try {
    console.log('교수진 섹션 삭제 요청 수신:', req.params.id);
    
    const deletedProfessorSection = await ProfessorSection.findByIdAndDelete(req.params.id);
    
    if (!deletedProfessorSection) {
      return res.status(404).json({ message: '교수진 섹션을 찾을 수 없습니다.' });
    }
    
    console.log('교수진 섹션 삭제 성공');
    res.json({ message: '교수진 섹션이 삭제되었습니다.' });
  } catch (error) {
    console.error('교수진 섹션 삭제 실패:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// ======================== Schedule Routes ========================
/**
 * @route   GET /api/content/schedules
 * @desc    일정 정보 가져오기
 * @access  Public
 */
router.get('/schedules', async (req, res) => {
  try {
    // 카테고리 쿼리 파라미터 확인
    const { category } = req.query;
    
    // 기본 쿼리: 활성화된 일정만 조회
    let query = { isActive: true };
    
    // 카테고리 필터링이 있는 경우 쿼리에 추가
    if (category) {
      query.category = category;
    }
    
    console.log('Schedule query:', query);
    
    // 쿼리 조건에 맞는 일정 조회
    const schedules = await Schedule.find(query).sort({ date: -1 });
    
    console.log(`Found ${schedules.length} schedules`);
    res.json(schedules);
  } catch (error) {
    console.error('일정 정보 조회 실패:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

router.get('/schedules/all', async (req, res) => {
  try {
    const schedules = await Schedule.find().sort({ date: -1 });
    res.json(schedules);
  } catch (error) {
    console.error('일정 정보 조회 실패:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

/**
 * @route   POST /api/content/schedules
 * @desc    새 일정 생성
 * @access  Public (테스트를 위해 인증 미들웨어 제거)
 */
router.post('/schedules', async (req, res) => {
  try {
    const { title, date, term, year, sessions, isActive, category, time, location, description } = req.body;
    
    if (!title || !date || !term || !year) {
      return res.status(400).json({ message: '제목, 날짜, 기수, 년도는 필수 항목입니다.' });
    }
    
    const newSchedule = new Schedule({
      title,
      date: new Date(date),
      term,
      year,
      category: category || 'academic',
      time,
      location,
      description,
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

/**
 * @route   PUT /api/content/schedules/:id
 * @desc    일정 수정
 * @access  Public (테스트를 위해 인증 미들웨어 제거)
 */
router.put('/schedules/:id', async (req, res) => {
  try {
    const { title, date, term, year, sessions, isActive, category, time, location, description } = req.body;
    
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
        category: category || 'academic',
        time,
        location,
        description,
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

/**
 * @route   DELETE /api/content/schedules/:id
 * @desc    일정 삭제
 * @access  Public (테스트를 위해 인증 미들웨어 제거)
 */
router.delete('/schedules/:id', async (req, res) => {
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
    console.log('활성화된 강사진 정보 조회 요청 수신');
    const lecturers = await Lecturer.find({ isActive: true }).sort({ order: 1 });
    console.log(`조회된 활성화된 강사진 정보: ${lecturers.length}명`);
    res.json(lecturers);
  } catch (error) {
    console.error('강사진 정보 조회 실패:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

/**
 * @route   GET /api/content/lecturers/all
 * @desc    모든 강사진 정보 가져오기 (관리자용)
 * @access  Public (테스트를 위해 인증 미들웨어 제거)
 */
router.get('/lecturers/all', async (req, res) => {
  try {
    console.log('모든 강사진 정보 조회 요청 수신 (contentRoutes)');
    const lecturers = await Lecturer.find().sort({ order: 1 });
    console.log(`조회된 모든 강사진 정보: ${lecturers.length}명`);
    res.json(lecturers);
  } catch (error) {
    console.error('강사진 정보 조회 실패:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

/**
 * @route   POST /api/content/lecturers
 * @desc    강사 추가
 * @access  Public (테스트를 위해 인증 미들웨어 제거)
 */
router.post('/lecturers', async (req, res) => {
  try {
    const { name, biography, imageUrl, term, category, order, isActive } = req.body;
    
    console.log('강사 생성 요청 수신 (contentRoutes):', { name, term, category });
    
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
      isActive: isActive !== undefined ? isActive : true
    });
    
    const savedLecturer = await newLecturer.save();
    console.log('강사 정보 생성 성공 (contentRoutes):', savedLecturer._id);
    res.status(201).json(savedLecturer);
  } catch (error) {
    console.error('강사 정보 생성 실패 (contentRoutes):', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

/**
 * @route   PUT /api/content/lecturers/:id
 * @desc    강사 정보 수정
 * @access  Public (테스트를 위해 인증 미들웨어 제거)
 */
router.put('/lecturers/:id', async (req, res) => {
  try {
    const { name, biography, imageUrl, term, category, order, isActive } = req.body;
    
    console.log('강사 정보 수정 요청 수신 (contentRoutes):', { id: req.params.id, name });
    
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
        updatedAt: new Date()
      },
      { new: true }
    );
    
    if (!updatedLecturer) {
      return res.status(404).json({ message: '강사 정보를 찾을 수 없습니다.' });
    }
    
    console.log('강사 정보 수정 성공 (contentRoutes):', updatedLecturer._id);
    res.json(updatedLecturer);
  } catch (error) {
    console.error('강사 정보 수정 실패 (contentRoutes):', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

/**
 * @route   DELETE /api/content/lecturers/:id
 * @desc    강사 정보 삭제
 * @access  Public (테스트를 위해 인증 미들웨어 제거)
 */
router.delete('/lecturers/:id', async (req, res) => {
  try {
    console.log('강사 정보 삭제 요청 수신 (contentRoutes):', req.params.id);
    
    const deletedLecturer = await Lecturer.findByIdAndDelete(req.params.id);
    
    if (!deletedLecturer) {
      return res.status(404).json({ message: '강사 정보를 찾을 수 없습니다.' });
    }
    
    console.log('강사 정보 삭제 성공 (contentRoutes)');
    res.json({ message: '강사 정보가 삭제되었습니다.' });
  } catch (error) {
    console.error('강사 정보 삭제 실패 (contentRoutes):', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

export default router; 