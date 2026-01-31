const express = require('express');
const router = express.Router();
const Objective = require('../models/Objective');
const { isAdmin } = require('../middleware/authMiddleware');

// 모든 목표 정보 가져오기 (공개)
router.get('/', async (req, res) => {
  try {
    console.log('목표 정보 조회 요청 수신');
    
    // 전체 컬렉션 개수 확인
    const count = await Objective.countDocuments();
    console.log(`objectives 컬렉션에 총 ${count}개의 문서가 있습니다.`);
    
    // MongoDB에서 활성화된 목표 정보 가져오기 (order 필드로 정렬)
    const objectives = await Objective.find({ isActive: true })
      .sort({ order: 1 })
      .lean();
    
    console.log(`조회된 활성화된 목표 정보: ${objectives.length}개`);
    
    // 결과가 없으면 isActive 필드 없이 모든 문서 조회
    if (objectives.length === 0) {
      console.log('활성화된 목표 데이터가 없습니다. 모든 문서를 조회합니다.');
      const allObjectives = await Objective.find()
        .sort({ order: 1, createdAt: -1 })
        .lean();
      
      console.log(`조회된 모든 목표 정보: ${allObjectives.length}개`);
      
      if (allObjectives.length > 0) {
        console.log('목표 정보 목록 조회 성공');
        return res.json(allObjectives);
      }
    } else {
      console.log('활성화된 목표 정보 목록 조회 성공');
      return res.json(objectives);
    }
    
    // 데이터가 없는 경우 빈 배열 반환
    console.log('목표 데이터가 없습니다. 빈 배열 반환');
    return res.json([]);
  } catch (error) {
    console.error('목표 정보 조회 실패:', error);
    res.status(500).json({ message: '목표 정보를 가져오는 중 오류가 발생했습니다.', error: error.message });
  }
});

// 단일 목표 정보 가져오기 (ID로 조회)
router.get('/:id', async (req, res) => {
  try {
    const objective = await Objective.findById(req.params.id);
    
    if (!objective) {
      return res.status(404).json({ message: '해당 목표 정보를 찾을 수 없습니다.' });
    }
    
    res.json(objective);
  } catch (error) {
    console.error('목표 정보 조회 실패:', error);
    res.status(500).json({ message: '목표 정보를 가져오는 중 오류가 발생했습니다.' });
  }
});

// 새 목표 정보 추가 (관리자 전용)
router.post('/', isAdmin, async (req, res) => {
  try {
    const { title, description } = req.body;
    
    if (!title || !description) {
      return res.status(400).json({ message: '제목과 설명은 필수 항목입니다.' });
    }
    
    // 현재 가장 높은 order 값 조회
    const highestOrder = await Objective.findOne().sort('-order');
    const newOrder = highestOrder ? highestOrder.order + 1 : 0;
    
    const objective = new Objective({
      ...req.body,
      order: req.body.order !== undefined ? req.body.order : newOrder,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    const savedObjective = await objective.save();
    res.status(201).json(savedObjective);
  } catch (error) {
    console.error('목표 정보 추가 실패:', error);
    res.status(500).json({ message: '목표 정보를 추가하는 중 오류가 발생했습니다.' });
  }
});

// 목표 정보 수정 (관리자 전용)
router.put('/:id', isAdmin, async (req, res) => {
  try {
    const updatedObjective = await Objective.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    
    if (!updatedObjective) {
      return res.status(404).json({ message: '해당 목표 정보를 찾을 수 없습니다.' });
    }
    
    res.json(updatedObjective);
  } catch (error) {
    console.error('목표 정보 수정 실패:', error);
    res.status(500).json({ message: '목표 정보를 수정하는 중 오류가 발생했습니다.' });
  }
});

// 목표 정보 삭제 (관리자 전용)
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    const deletedObjective = await Objective.findByIdAndDelete(req.params.id);
    
    if (!deletedObjective) {
      return res.status(404).json({ message: '해당 목표 정보를 찾을 수 없습니다.' });
    }
    
    res.json({ message: '목표 정보가 삭제되었습니다.' });
  } catch (error) {
    console.error('목표 정보 삭제 실패:', error);
    res.status(500).json({ message: '목표 정보를 삭제하는 중 오류가 발생했습니다.' });
  }
});

module.exports = router; 