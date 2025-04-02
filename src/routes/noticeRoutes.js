import express from 'express';
import Notice from '../models/Notice.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /api/notices
 * @desc    모든 공지사항 가져오기
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    // 날짜 내림차순 정렬
    const notices = await Notice.find().sort({ createdAt: -1 });
    res.json(notices);
  } catch (error) {
    console.error('공지사항 조회 실패:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

/**
 * @route   GET /api/notices/:id
 * @desc    특정 공지사항 가져오기
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) {
      return res.status(404).json({ message: '공지사항을 찾을 수 없습니다.' });
    }
    res.json(notice);
  } catch (error) {
    console.error('공지사항 조회 실패:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

/**
 * @route   POST /api/notices
 * @desc    새 공지사항 추가
 * @access  Public - 인증 제거됨
 */
router.post('/', async (req, res) => {
  try {
    const { title, content, author, isImportant } = req.body;
    
    // 필수 필드 유효성 검사
    if (!title || !content || !author) {
      return res.status(400).json({ message: '제목, 내용, 작성자는 필수 항목입니다.' });
    }
    
    const newNotice = new Notice({
      title,
      content,
      author,
      isImportant: isImportant || false
    });
    
    const savedNotice = await newNotice.save();
    res.status(201).json(savedNotice);
  } catch (error) {
    console.error('공지사항 생성 실패:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

/**
 * @route   PUT /api/notices/:id
 * @desc    공지사항 수정
 * @access  Public - 인증 제거됨
 */
router.put('/:id', async (req, res) => {
  try {
    const { title, content, author, isImportant } = req.body;
    
    // 필수 필드 유효성 검사
    if (!title || !content || !author) {
      return res.status(400).json({ message: '제목, 내용, 작성자는 필수 항목입니다.' });
    }
    
    const updatedNotice = await Notice.findByIdAndUpdate(
      req.params.id, 
      { title, content, author, isImportant: isImportant || false }, 
      { new: true }
    );
    
    if (!updatedNotice) {
      return res.status(404).json({ message: '공지사항을 찾을 수 없습니다.' });
    }
    
    res.json(updatedNotice);
  } catch (error) {
    console.error('공지사항 수정 실패:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

/**
 * @route   DELETE /api/notices/:id
 * @desc    공지사항 삭제
 * @access  Public - 인증 제거됨
 */
router.delete('/:id', async (req, res) => {
  try {
    const deletedNotice = await Notice.findByIdAndDelete(req.params.id);
    
    if (!deletedNotice) {
      return res.status(404).json({ message: '공지사항을 찾을 수 없습니다.' });
    }
    
    res.json({ message: '공지사항이 삭제되었습니다.' });
  } catch (error) {
    console.error('공지사항 삭제 실패:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

export default router; 