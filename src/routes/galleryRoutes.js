import express from 'express';
import Gallery from '../models/Gallery.js';

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
 * @access  Public - 인증 제거됨
 */
router.post('/', async (req, res) => {
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
 * @route   POST /api/gallery/bulk
 * @desc    여러 갤러리 아이템 일괄 추가
 * @access  Public - 인증 제거됨
 */
router.post('/bulk', async (req, res) => {
  try {
    console.log('일괄 갤러리 항목 추가 요청 수신:', req.body.length, '개 항목');
    
    if (!Array.isArray(req.body)) {
      return res.status(400).json({ message: '요청 본문이 배열 형식이어야 합니다.' });
    }
    
    const galleries = await Gallery.insertMany(req.body);
    console.log('일괄 추가 완료:', galleries.length, '개 항목 추가됨');
    
    res.status(201).json(galleries);
  } catch (error) {
    console.error('일괄 갤러리 항목 생성 오류:', error);
    res.status(500).json({ message: '갤러리 항목 일괄 생성 중 오류가 발생했습니다.' });
  }
});

/**
 * @route   PUT /api/gallery/:id
 * @desc    갤러리 아이템 업데이트
 * @access  Public - 인증 제거됨
 */
router.put('/:id', async (req, res) => {
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
 * @access  Public - 인증 제거됨
 */
router.delete('/:id', async (req, res) => {
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