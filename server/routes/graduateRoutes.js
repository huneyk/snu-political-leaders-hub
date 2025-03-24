const express = require('express');
const router = express.Router();
const Graduate = require('../models/Graduate');
const { isAdmin } = require('../middleware/authMiddleware');

// 모든 수료자 정보 가져오기 (공개 접근 가능)
router.get('/', async (req, res) => {
  try {
    // 기수별로 정렬
    const graduates = await Graduate.find().sort({ term: 1, name: 1 });
    res.json(graduates);
  } catch (error) {
    console.error('수료자 목록 조회 중 오류 발생:', error);
    res.status(500).json({ message: '수료자 목록을 불러오는 중 오류가 발생했습니다.' });
  }
});

// 기수별 수료자 정보 가져오기 (공개 접근 가능)
router.get('/term/:term', async (req, res) => {
  try {
    const { term } = req.params;
    const graduates = await Graduate.find({ term: Number(term) }).sort({ name: 1 });
    res.json(graduates);
  } catch (error) {
    console.error(`${req.params.term}기 수료자 목록 조회 중 오류 발생:`, error);
    res.status(500).json({ message: '수료자 목록을 불러오는 중 오류가 발생했습니다.' });
  }
});

// 새 수료자 정보 추가 (관리자만 접근 가능)
router.post('/', isAdmin, async (req, res) => {
  try {
    const newGraduate = new Graduate(req.body);
    const savedGraduate = await newGraduate.save();
    res.status(201).json(savedGraduate);
  } catch (error) {
    console.error('수료자 정보 추가 중 오류 발생:', error);
    res.status(400).json({ message: '수료자 정보 추가에 실패했습니다.', error: error.message });
  }
});

// 수료자 정보 수정 (관리자만 접근 가능)
router.put('/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updatedGraduate = await Graduate.findByIdAndUpdate(
      id, 
      req.body, 
      { new: true, runValidators: true }
    );
    
    if (!updatedGraduate) {
      return res.status(404).json({ message: '해당 ID의 수료자 정보를 찾을 수 없습니다.' });
    }
    
    res.json(updatedGraduate);
  } catch (error) {
    console.error('수료자 정보 수정 중 오류 발생:', error);
    res.status(400).json({ message: '수료자 정보 수정에 실패했습니다.', error: error.message });
  }
});

// 수료자 정보 삭제 (관리자만 접근 가능)
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedGraduate = await Graduate.findByIdAndDelete(id);
    
    if (!deletedGraduate) {
      return res.status(404).json({ message: '해당 ID의 수료자 정보를 찾을 수 없습니다.' });
    }
    
    res.json({ message: '수료자 정보가 성공적으로 삭제되었습니다.', id });
  } catch (error) {
    console.error('수료자 정보 삭제 중 오류 발생:', error);
    res.status(500).json({ message: '수료자 정보 삭제에 실패했습니다.' });
  }
});

// 여러 수료자 정보 일괄 추가 (관리자만 접근 가능)
router.post('/batch', isAdmin, async (req, res) => {
  try {
    if (!Array.isArray(req.body)) {
      return res.status(400).json({ message: '배열 형태의 데이터가 필요합니다.' });
    }
    
    const graduates = await Graduate.insertMany(req.body);
    res.status(201).json(graduates);
  } catch (error) {
    console.error('수료자 정보 일괄 추가 중 오류 발생:', error);
    res.status(400).json({ message: '수료자 정보 일괄 추가에 실패했습니다.', error: error.message });
  }
});

module.exports = router; 