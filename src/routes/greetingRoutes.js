import express from 'express';
import Greeting from '../models/Greeting.js';
// authenticateToken은 유지하되 주석 처리하여 참조용으로 남겨둠
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /api/greeting
 * @desc    인사말 정보 가져오기
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    console.log('GET /api/greeting 요청 수신됨');
    
    // 활성화된 최신 인사말 가져오기
    const greeting = await Greeting.findOne({ isActive: true }).sort({ updatedAt: -1 });
    
    if (greeting) {
      console.log('MongoDB에서 인사말 데이터 찾음:', greeting);
      return res.json(greeting);
    }
    
    console.log('MongoDB에서 인사말 데이터를 찾을 수 없음. 기본 데이터 반환');
    
    // 기본 인사말 데이터
    const defaultGreeting = {
      _id: 'default-greeting-id',
      title: '정치리더십과정에 오신 것을 환영합니다',
      content: `서울대학교 정치리더십과정(PLP)은 정치지도자의 자질과 역량 향상을 위해 개설된 교육 프로그램입니다.
      
현대 사회는 복잡한 정치, 경제, 사회적 문제들이 상호 연결되어 있어 이를 효과적으로 다룰 수 있는 리더십이 요구됩니다. 본 과정은 정치인, 고위 공직자, 기업인 등 사회 각계각층의 리더들에게 필요한 전문 지식과 리더십 기술을 제공합니다.
      
서울대학교의 우수한 교수진과 각 분야 전문가들이 참여하여 최신 이론과 실무 사례를 바탕으로 한 교육을 제공합니다. 이론과 실무가 균형 잡힌 커리큘럼을 통해 수강생들은 정치 리더로서의 역량을 크게 향상시킬 수 있습니다.`,
      author: '김홍길',
      position: '정치리더십과정 주임교수',
      imageUrl: '/images/default-greeting.jpg',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    res.json(defaultGreeting);
  } catch (error) {
    console.error('인사말 정보 조회 실패:', error);
    
    // 오류 발생 시에도 기본 데이터 반환
    const defaultGreeting = {
      _id: 'error-greeting-id',
      title: '정치리더십과정에 오신 것을 환영합니다',
      content: `서울대학교 정치리더십과정(PLP)은 정치지도자의 자질과 역량 향상을 위해 개설된 교육 프로그램입니다.
      
현대 사회는 복잡한 정치, 경제, 사회적 문제들이 상호 연결되어 있어 이를 효과적으로 다룰 수 있는 리더십이 요구됩니다. 본 과정은 정치인, 고위 공직자, 기업인 등 사회 각계각층의 리더들에게 필요한 전문 지식과 리더십 기술을 제공합니다.`,
      author: '김홍길',
      position: '정치리더십과정 주임교수',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('오류 발생으로 인해 기본 데이터 반환');
    res.json(defaultGreeting);
  }
});

/**
 * @route   GET /api/greeting/all
 * @desc    모든 인사말 정보 가져오기
 * @access  Private
 */
router.get('/all', authenticateToken, async (req, res) => {
  try {
    const greetings = await Greeting.find().sort({ updatedAt: -1 });
    res.json(greetings);
  } catch (error) {
    console.error('인사말 정보 조회 실패:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

/**
 * @route   POST /api/greeting
 * @desc    인사말 저장
 * @access  Private (인증 미들웨어 제거됨)
 */
router.post('/', /* authenticateToken, */ async (req, res) => {
  try {
    console.log('POST 요청 받음 - 인증 미들웨어 비활성화(테스트용)');
    
    const { title, content, author, position, imageUrl, isActive } = req.body;
    
    // 필수 필드 유효성 검사
    if (!title || !content || !author || !position) {
      return res.status(400).json({ message: '모든 필수 필드를 입력하세요.' });
    }
    
    // 새 인사말 생성
    const newGreeting = new Greeting({
      title,
      content,
      author,
      position,
      imageUrl: imageUrl || '',
      isActive: isActive !== undefined ? isActive : true
    });
    
    const savedGreeting = await newGreeting.save();
    console.log('인사말 저장 성공:', savedGreeting);
    res.status(201).json(savedGreeting);
  } catch (error) {
    console.error('인사말 저장 실패:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

/**
 * @route   PUT /api/greeting
 * @desc    인사말 수정 (ID 기반)
 * @access  Private (인증 미들웨어 제거됨)
 */
router.put('/', /* authenticateToken, */ async (req, res) => {
  try {
    console.log('PUT 요청 받음 - 인증 미들웨어 비활성화(테스트용)');
    
    const { _id, title, content, author, position, imageUrl, isActive } = req.body;
    
    // 필수 필드 유효성 검사
    if (!title || !content || !author || !position) {
      return res.status(400).json({ message: '모든 필수 필드를 입력하세요.' });
    }
    
    // _id가 있는지 확인
    if (!_id) {
      console.log('PUT 요청에 _id가 없음. 새 인사말 생성으로 전환');
      
      // 새 인사말 생성 (POST 로직과 유사)
      const newGreeting = new Greeting({
        title,
        content,
        author,
        position,
        imageUrl: imageUrl || '',
        isActive: isActive !== undefined ? isActive : true
      });
      
      const savedGreeting = await newGreeting.save();
      console.log('새 인사말 생성 성공:', savedGreeting);
      
      return res.status(201).json(savedGreeting);
    }
    
    // 기존 데이터 업데이트
    const updatedGreeting = await Greeting.findByIdAndUpdate(
      _id,
      {
        title,
        content,
        author,
        position,
        imageUrl: imageUrl || '',
        isActive: isActive !== undefined ? isActive : true
      },
      { new: true }
    );
    
    if (!updatedGreeting) {
      console.log('PUT 요청 실패: ID에 해당하는 인사말을 찾을 수 없음');
      return res.status(404).json({ message: '인사말 정보를 찾을 수 없습니다.' });
    }
    
    console.log('인사말 업데이트 성공:', updatedGreeting);
    res.json(updatedGreeting);
  } catch (error) {
    console.error('인사말 수정 실패:', error);
    
    // CastError 처리 (잘못된 ObjectId)
    if (error.name === 'CastError' && error.kind === 'ObjectId') {
      return res.status(400).json({ message: '유효하지 않은 ID 형식입니다.' });
    }
    
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

/**
 * @route   PUT /api/greeting/:id
 * @desc    인사말 수정 (URL 파라미터 기반) - 이전 방식 유지
 * @access  Private (인증 미들웨어 제거됨)
 */
router.put('/:id', /* authenticateToken, */ async (req, res) => {
  try {
    console.log('PUT /:id 요청 받음 - 인증 미들웨어 비활성화(테스트용)');
    
    const { title, content, author, position, imageUrl, isActive } = req.body;
    
    // 필수 필드 유효성 검사
    if (!title || !content || !author || !position) {
      return res.status(400).json({ message: '모든 필수 필드를 입력하세요.' });
    }
    
    const updatedGreeting = await Greeting.findByIdAndUpdate(
      req.params.id,
      {
        title,
        content,
        author,
        position,
        imageUrl: imageUrl || '',
        isActive: isActive !== undefined ? isActive : true
      },
      { new: true }
    );
    
    if (!updatedGreeting) {
      return res.status(404).json({ message: '인사말 정보를 찾을 수 없습니다.' });
    }
    
    console.log('인사말 업데이트 성공(파라미터 ID 방식):', updatedGreeting);
    res.json(updatedGreeting);
  } catch (error) {
    console.error('인사말 수정 실패:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

/**
 * @route   DELETE /api/greeting/:id
 * @desc    인사말 삭제
 * @access  Private (인증 유지)
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const deletedGreeting = await Greeting.findByIdAndDelete(req.params.id);
    
    if (!deletedGreeting) {
      return res.status(404).json({ message: '인사말 정보를 찾을 수 없습니다.' });
    }
    
    res.json({ message: '인사말이 삭제되었습니다.' });
  } catch (error) {
    console.error('인사말 삭제 실패:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

export default router; 