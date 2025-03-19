import express from 'express';
import Gallery from '../models/Gallery.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /api/gallery
 * @desc    모든 갤러리 아이템 가져오기
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    // 날짜 내림차순 정렬
    const galleryItems = await Gallery.find().sort({ date: -1 });
    res.json(galleryItems);
  } catch (error) {
    console.error('갤러리 아이템 조회 실패:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

/**
 * @route   GET /api/gallery/:id
 * @desc    특정 갤러리 아이템 가져오기
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const galleryItem = await Gallery.findById(req.params.id);
    if (!galleryItem) {
      return res.status(404).json({ message: '갤러리 아이템을 찾을 수 없습니다.' });
    }
    res.json(galleryItem);
  } catch (error) {
    console.error('갤러리 아이템 조회 실패:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

/**
 * @route   POST /api/gallery
 * @desc    새 갤러리 아이템 추가
 * @access  Private
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, description, imageUrl, date, term } = req.body;
    
    // 필수 필드 유효성 검사
    if (!title || !description || !imageUrl || !date || !term) {
      return res.status(400).json({ message: '모든 필수 필드를 입력하세요.' });
    }
    
    const newGalleryItem = new Gallery({
      title,
      description,
      imageUrl,
      date,
      term
    });
    
    const savedItem = await newGalleryItem.save();
    res.status(201).json(savedItem);
  } catch (error) {
    console.error('갤러리 아이템 생성 실패:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

/**
 * @route   PUT /api/gallery/:id
 * @desc    갤러리 아이템 수정
 * @access  Private
 */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { title, description, imageUrl, date, term } = req.body;
    
    // 필수 필드 유효성 검사
    if (!title || !description || !imageUrl || !date || !term) {
      return res.status(400).json({ message: '모든 필수 필드를 입력하세요.' });
    }
    
    const updatedItem = await Gallery.findByIdAndUpdate(
      req.params.id, 
      { title, description, imageUrl, date, term }, 
      { new: true }
    );
    
    if (!updatedItem) {
      return res.status(404).json({ message: '갤러리 아이템을 찾을 수 없습니다.' });
    }
    
    res.json(updatedItem);
  } catch (error) {
    console.error('갤러리 아이템 수정 실패:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

/**
 * @route   DELETE /api/gallery/:id
 * @desc    갤러리 아이템 삭제
 * @access  Private
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const deletedItem = await Gallery.findByIdAndDelete(req.params.id);
    
    if (!deletedItem) {
      return res.status(404).json({ message: '갤러리 아이템을 찾을 수 없습니다.' });
    }
    
    res.json({ message: '갤러리 아이템이 삭제되었습니다.' });
  } catch (error) {
    console.error('갤러리 아이템 삭제 실패:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

export default router; 