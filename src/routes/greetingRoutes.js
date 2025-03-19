import express from 'express';
import Greeting from '../models/Greeting.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /api/greeting
 * @desc    인사말 정보 가져오기
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    // 활성화된 최신 인사말 가져오기
    const greeting = await Greeting.findOne({ isActive: true }).sort({ updatedAt: -1 });
    
    if (!greeting) {
      return res.status(404).json({ message: '인사말 정보를 찾을 수 없습니다.' });
    }
    
    res.json(greeting);
  } catch (error) {
    console.error('인사말 정보 조회 실패:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
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
 * @access  Private
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
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
    res.status(201).json(savedGreeting);
  } catch (error) {
    console.error('인사말 저장 실패:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

/**
 * @route   PUT /api/greeting/:id
 * @desc    인사말 수정
 * @access  Private
 */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
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
    
    res.json(updatedGreeting);
  } catch (error) {
    console.error('인사말 수정 실패:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

/**
 * @route   DELETE /api/greeting/:id
 * @desc    인사말 삭제
 * @access  Private
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