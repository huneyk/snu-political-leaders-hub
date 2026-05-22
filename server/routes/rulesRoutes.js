const express = require('express');
const router = express.Router();
const Rules = require('../models/Rules');
const { isAdmin } = require('../middleware/authMiddleware');

// 운영 준칙 조회 (공개) - 활성화된 최신 문서 반환
router.get('/', async (req, res) => {
  try {
    const rules = await Rules.findOne({ isActive: true }).sort({ createdAt: -1 });
    if (!rules) {
      return res.status(404).json({ message: '운영 준칙 정보를 찾을 수 없습니다.' });
    }
    res.json(rules);
  } catch (error) {
    console.error('운영 준칙 조회 실패:', error);
    res.status(500).json({ message: '운영 준칙을 가져오는 중 오류가 발생했습니다.', error: error.message });
  }
});

// 모든 운영 준칙 조회 (관리자용)
router.get('/all', isAdmin, async (req, res) => {
  try {
    const rules = await Rules.find().sort({ createdAt: -1 });
    res.json(rules);
  } catch (error) {
    console.error('모든 운영 준칙 조회 실패:', error);
    res.status(500).json({ message: '운영 준칙을 가져오는 중 오류가 발생했습니다.' });
  }
});

// 운영 준칙 신규 생성 (관리자 전용)
router.post('/', isAdmin, async (req, res) => {
  try {
    const newRules = new Rules({
      ...req.body,
      updatedAt: Date.now()
    });
    const saved = await newRules.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error('운영 준칙 생성 실패:', error);
    res.status(500).json({ message: '운영 준칙을 생성하는 중 오류가 발생했습니다.' });
  }
});

// 활성 운영 준칙 업데이트 (관리자 전용) - id 없이 호출 시 활성 문서 갱신
router.put('/', isAdmin, async (req, res) => {
  try {
    const current = await Rules.findOne({ isActive: true });
    if (current) {
      const updated = await Rules.findByIdAndUpdate(
        current._id,
        { ...req.body, updatedAt: Date.now() },
        { new: true }
      );
      return res.json(updated);
    }
    const created = new Rules({ ...req.body, isActive: true, updatedAt: Date.now() });
    const saved = await created.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error('운영 준칙 업데이트 실패:', error);
    res.status(500).json({ message: '운영 준칙을 업데이트하는 중 오류가 발생했습니다.' });
  }
});

// 특정 운영 준칙 업데이트 (관리자 전용)
router.put('/:id', isAdmin, async (req, res) => {
  try {
    const updated = await Rules.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ message: '수정할 운영 준칙을 찾을 수 없습니다.' });
    }
    res.json(updated);
  } catch (error) {
    console.error('운영 준칙 업데이트 실패:', error);
    res.status(500).json({ message: '운영 준칙을 업데이트하는 중 오류가 발생했습니다.' });
  }
});

// 운영 준칙 삭제 (관리자 전용)
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    const deleted = await Rules.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: '삭제할 운영 준칙을 찾을 수 없습니다.' });
    }
    res.json({ message: '운영 준칙이 삭제되었습니다.', id: req.params.id });
  } catch (error) {
    console.error('운영 준칙 삭제 실패:', error);
    res.status(500).json({ message: '운영 준칙을 삭제하는 중 오류가 발생했습니다.' });
  }
});

module.exports = router;
