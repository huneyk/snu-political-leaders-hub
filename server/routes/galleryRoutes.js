const express = require('express');
const Gallery = require('../models/Gallery');
const { isAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// 갤러리 항목 가져오기 (공개) - 기수별 필터링 지원
router.get('/', async (req, res) => {
  try {
    const { term, meta_only } = req.query;
    
    // 메타데이터만 요청하는 경우 (이미지 URL 제외)
    if (meta_only === 'true') {
      const galleries = await Gallery.find().select('title description date term createdAt updatedAt').sort({ date: -1 });
      console.log(`메타데이터만 조회: ${galleries.length}개 항목`);
      res.json(galleries);
      return;
    }
    
    let query = {};
    
    // 특정 기수만 요청하는 경우
    if (term) {
      // 관대한 필터링: 다양한 타입과 패턴 고려
      query.$or = [
        { term: term },                    // 원래 값
        { term: String(term) },            // 문자열 변환
        { term: Number(term) },            // 숫자 변환
        { term: { $regex: term, $options: 'i' } }  // 정규식 매칭 (대소문자 무시)
      ];
      console.log(`🎯 기수별 조회: ${term}기 (관대한 검색)`);
    }
    
    const galleries = await Gallery.find(query).sort({ date: -1 });
    
    // 응답 데이터 로깅 (디버깅용)
    if (term) {
      const termCounts = {};
      galleries.forEach(item => {
        const itemTerm = item.term;
        termCounts[itemTerm] = (termCounts[itemTerm] || 0) + 1;
      });
      console.log(`📊 ${term}기 조회 결과: 총 ${galleries.length}개 항목`);
      console.log(`📈 기수별 분포:`, termCounts);
    } else {
      console.log(`📋 전체 조회 완료: ${galleries.length}개 항목`);
    }
    
    res.json(galleries);
  } catch (error) {
    console.error('갤러리 항목 조회 오류:', error);
    res.status(500).json({ message: '갤러리 항목을 불러오는 중 오류가 발생했습니다.' });
  }
});

// 갤러리 항목 생성 (관리자 전용)
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

// 갤러리 항목 수정 (관리자 전용)
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

// 갤러리 항목 삭제 (관리자 전용)
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