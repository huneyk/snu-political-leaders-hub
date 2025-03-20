const express = require('express');
const Gallery = require('../models/Gallery');
const { isAdmin } = require('../middleware/authMiddleware');

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
router.post('/', isAdmin, async (req, res) => {
  try {
    const galleryItem = new Gallery(req.body);
    const savedItem = await galleryItem.save();
    res.status(201).json(savedItem);
  } catch (error) {
    console.error('갤러리 항목 생성 오류:', error);
    res.status(500).json({ message: '갤러리 항목을 생성하는 중 오류가 발생했습니다.' });
  }
});

/**
 * @route   PUT /api/gallery/:id
 * @desc    갤러리 아이템 수정
 * @access  Private
 */
router.put('/:id', isAdmin, async (req, res) => {
  try {
    const updatedItem = await Gallery.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedItem) {
      return res.status(404).json({ message: '해당 갤러리 항목을 찾을 수 없습니다.' });
    }
    
    res.json(updatedItem);
  } catch (error) {
    console.error('갤러리 항목 수정 오류:', error);
    res.status(500).json({ message: '갤러리 항목을 수정하는 중 오류가 발생했습니다.' });
  }
});

/**
 * @route   DELETE /api/gallery/:id
 * @desc    갤러리 아이템 삭제
 * @access  Private
 */
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    const deletedItem = await Gallery.findByIdAndDelete(req.params.id);
    
    if (!deletedItem) {
      return res.status(404).json({ message: '해당 갤러리 항목을 찾을 수 없습니다.' });
    }
    
    res.json({ message: '갤러리 항목이 성공적으로 삭제되었습니다.' });
  } catch (error) {
    console.error('갤러리 항목 삭제 오류:', error);
    res.status(500).json({ message: '갤러리 항목을 삭제하는 중 오류가 발생했습니다.' });
  }
});

module.exports = router; 