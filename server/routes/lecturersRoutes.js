const express = require('express');
const router = express.Router();
const Lecturer = require('../models/Lecturer');
const { isAdmin } = require('../middleware/authMiddleware');

// 모든 강사 정보 가져오기 (공개)
router.get('/', async (req, res) => {
  try {
    console.log('강사 정보 조회 요청 수신');
    
    // MongoDB에서 강사 데이터 가져오기
    const lecturers = await Lecturer.find({ isActive: true }).sort({ order: 1, name: 1 });
    
    // 데이터가 없는 경우 처리
    if (!lecturers || lecturers.length === 0) {
      console.log('강사 데이터가 없습니다.');
      return res.json([]); // 빈 배열 반환
    }
    
    console.log(`강사 정보 조회 성공: ${lecturers.length}개 항목 발견`);
    res.json(lecturers);
  } catch (error) {
    console.error('강사 정보 조회 실패:', error);
    res.status(500).json({ message: '강사 정보를 가져오는 중 오류가 발생했습니다.', error: error.message });
  }
});

// ID로 강사 조회 (공개)
router.get('/:id', async (req, res) => {
  try {
    const lecturer = await Lecturer.findById(req.params.id);
    
    if (!lecturer) {
      return res.status(404).json({ message: '요청한 강사를 찾을 수 없습니다.' });
    }
    
    res.json(lecturer);
  } catch (error) {
    console.error('강사 조회 실패:', error);
    res.status(500).json({ message: '강사를 가져오는 중 오류가 발생했습니다.' });
  }
});

// 강사 정보 추가 (관리자 전용)
router.post('/', isAdmin, async (req, res) => {
  try {
    const { name, biography, imageUrl, term, category, order } = req.body;
    
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
      updatedAt: Date.now()
    });
    
    const savedLecturer = await newLecturer.save();
    res.status(201).json(savedLecturer);
  } catch (error) {
    console.error('강사 정보 생성 실패:', error);
    res.status(500).json({ message: '강사 정보를 생성하는 중 오류가 발생했습니다.' });
  }
});

// 강사 정보 업데이트 (관리자 전용)
router.put('/:id', isAdmin, async (req, res) => {
  try {
    const updatedLecturer = await Lecturer.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        updatedAt: Date.now()
      },
      { new: true }
    );
    
    if (!updatedLecturer) {
      return res.status(404).json({ message: '수정할 강사를 찾을 수 없습니다.' });
    }
    
    res.json(updatedLecturer);
  } catch (error) {
    console.error('강사 정보 업데이트 실패:', error);
    res.status(500).json({ message: '강사 정보를 업데이트하는 중 오류가 발생했습니다.' });
  }
});

// 강사 정보 삭제 (관리자 전용)
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    const deletedLecturer = await Lecturer.findByIdAndDelete(req.params.id);
    
    if (!deletedLecturer) {
      return res.status(404).json({ message: '삭제할 강사를 찾을 수 없습니다.' });
    }
    
    res.json({ message: '강사가 성공적으로 삭제되었습니다.', deletedLecturer });
  } catch (error) {
    console.error('강사 정보 삭제 실패:', error);
    res.status(500).json({ message: '강사 정보를 삭제하는 중 오류가 발생했습니다.' });
  }
});

module.exports = router; 