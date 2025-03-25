const express = require('express');
const router = express.Router();
const Recommendation = require('../models/Recommendation');
const { isAdmin } = require('../middleware/authMiddleware');

// 추천의 글 목록 가져오기 (공개)
router.get('/', async (req, res) => {
  try {
    console.log('추천의 글 목록 조회 요청 수신');
    
    // 전체 컬렉션 개수 확인
    const count = await Recommendation.countDocuments();
    console.log(`recommendations 컬렉션에 총 ${count}개의 문서가 있습니다.`);
    
    // MongoDB에서 활성화된 추천의 글 가져오기 (order 필드로 정렬)
    const recommendations = await Recommendation.find({ isActive: true })
      .sort({ order: 1 })
      .lean();
    
    console.log(`조회된 활성화된 추천의 글: ${recommendations.length}개`);
    
    // 결과가 없으면 isActive 필드 없이 모든 문서 조회
    if (recommendations.length === 0) {
      console.log('활성화된 추천의 글 데이터가 없습니다. 모든 문서를 조회합니다.');
      const allRecommendations = await Recommendation.find()
        .sort({ order: 1, createdAt: -1 })
        .lean();
      
      console.log(`조회된 모든 추천의 글: ${allRecommendations.length}개`);
      
      if (allRecommendations.length > 0) {
        console.log('추천의 글 목록 조회 성공');
        return res.json(allRecommendations);
      }
    } else {
      console.log('활성화된 추천의 글 목록 조회 성공');
      return res.json(recommendations);
    }
    
    // 데이터가 없는 경우 빈 배열 반환
    console.log('추천의 글 데이터가 없습니다. 빈 배열 반환');
    return res.json([]);
  } catch (error) {
    console.error('추천의 글 목록 조회 실패:', error);
    res.status(500).json({ message: '추천의 글 목록을 가져오는 중 오류가 발생했습니다.', error: error.message });
  }
});

// 단일 추천의 글 가져오기 (ID로 조회)
router.get('/:id', async (req, res) => {
  try {
    const recommendation = await Recommendation.findById(req.params.id);
    
    if (!recommendation) {
      return res.status(404).json({ message: '해당 추천의 글을 찾을 수 없습니다.' });
    }
    
    res.json(recommendation);
  } catch (error) {
    console.error('추천의 글 조회 실패:', error);
    res.status(500).json({ message: '추천의 글을 가져오는 중 오류가 발생했습니다.' });
  }
});

// 새 추천의 글 추가 (관리자 전용)
router.post('/', isAdmin, async (req, res) => {
  try {
    const { title, name, position, content } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ message: '제목과 내용은 필수 항목입니다.' });
    }
    
    // 현재 가장 높은 order 값 조회
    const highestOrder = await Recommendation.findOne().sort('-order');
    const newOrder = highestOrder ? highestOrder.order + 1 : 0;
    
    const recommendation = new Recommendation({
      ...req.body,
      order: req.body.order !== undefined ? req.body.order : newOrder,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    const savedRecommendation = await recommendation.save();
    res.status(201).json(savedRecommendation);
  } catch (error) {
    console.error('추천의 글 추가 실패:', error);
    res.status(500).json({ message: '추천의 글을 추가하는 중 오류가 발생했습니다.' });
  }
});

// 추천의 글 수정 (관리자 전용)
router.put('/:id', isAdmin, async (req, res) => {
  try {
    const updatedRecommendation = await Recommendation.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    
    if (!updatedRecommendation) {
      return res.status(404).json({ message: '해당 추천의 글을 찾을 수 없습니다.' });
    }
    
    res.json(updatedRecommendation);
  } catch (error) {
    console.error('추천의 글 수정 실패:', error);
    res.status(500).json({ message: '추천의 글을 수정하는 중 오류가 발생했습니다.' });
  }
});

// 추천의 글 삭제 (관리자 전용)
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    const deletedRecommendation = await Recommendation.findByIdAndDelete(req.params.id);
    
    if (!deletedRecommendation) {
      return res.status(404).json({ message: '해당 추천의 글을 찾을 수 없습니다.' });
    }
    
    res.json({ message: '추천의 글이 삭제되었습니다.' });
  } catch (error) {
    console.error('추천의 글 삭제 실패:', error);
    res.status(500).json({ message: '추천의 글을 삭제하는 중 오류가 발생했습니다.' });
  }
});

module.exports = router; 