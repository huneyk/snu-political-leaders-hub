import express from 'express';
import Gallery from '../models/Gallery.js';
import { isAdmin } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /api/gallery
 * @desc    모든 갤러리 아이템 가져오기
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const galleries = await Gallery.find().sort({ date: -1 });
    res.json(galleries);
  } catch (error) {
    console.error('갤러리 항목 조회 오류:', error);
    res.status(500).json({ message: '갤러리 항목을 불러오는 중 오류가 발생했습니다.' });
  }
});

/**
 * @route   GET /api/gallery/:id
 * @desc    특정 갤러리 아이템 가져오기
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);
    if (!gallery) {
      return res.status(404).json({ message: '갤러리 항목을 찾을 수 없습니다.' });
    }
    res.json(gallery);
  } catch (error) {
    console.error('갤러리 항목 조회 오류:', error);
    res.status(500).json({ message: '갤러리 항목을 불러오는 중 오류가 발생했습니다.' });
  }
});

/**
 * @route   POST /api/gallery
 * @desc    새 갤러리 아이템 추가
 * @access  Private/Admin
 */
router.post('/', isAdmin, async (req, res) => {
  try {
    const newGallery = new Gallery(req.body);
    await newGallery.save();
    res.status(201).json(newGallery);
  } catch (error) {
    console.error('갤러리 항목 생성 오류:', error);
    res.status(500).json({ message: '갤러리 항목 생성 중 오류가 발생했습니다.' });
  }
});

/**
 * @route   PUT /api/gallery/:id
 * @desc    갤러리 아이템 업데이트
 * @access  Private/Admin
 */
router.put('/:id', isAdmin, async (req, res) => {
  try {
    const gallery = await Gallery.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!gallery) {
      return res.status(404).json({ message: '갤러리 항목을 찾을 수 없습니다.' });
    }
    
    res.json(gallery);
  } catch (error) {
    console.error('갤러리 항목 업데이트 오류:', error);
    res.status(500).json({ message: '갤러리 항목 업데이트 중 오류가 발생했습니다.' });
  }
});

/**
 * @route   DELETE /api/gallery/:id
 * @desc    갤러리 아이템 삭제
 * @access  Private/Admin
 */
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    const gallery = await Gallery.findByIdAndDelete(req.params.id);
    
    if (!gallery) {
      return res.status(404).json({ message: '갤러리 항목을 찾을 수 없습니다.' });
    }
    
    res.json({ message: '갤러리 항목이 성공적으로 삭제되었습니다.' });
  } catch (error) {
    console.error('갤러리 항목 삭제 오류:', error);
    res.status(500).json({ message: '갤러리 항목 삭제 중 오류가 발생했습니다.' });
  }
});

export default router; 