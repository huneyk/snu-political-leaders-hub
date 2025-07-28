const express = require('express');
const Gallery = require('../models/Gallery');
const Admission = require('../models/Admission');
const Schedule = require('../models/Schedule');
const Graduate = require('../models/Graduate');
const { isAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// 실제 존재하는 기수들을 확인하는 함수
async function getValidTerms() {
  try {
    // 갤러리 컬렉션에서만 실제 존재하는 term들을 수집
    const galleryTerms = await Gallery.distinct('term').then(terms => terms.filter(term => term != null));
    
    // 갤러리에 실제 데이터가 있는 term들만 반환
    const validTerms = [...new Set(galleryTerms.map(String))].sort((a, b) => Number(a) - Number(b));
    
    console.log('🔍 갤러리에 실제 존재하는 기수들:', validTerms);
    return validTerms;
  } catch (error) {
    console.error('기수 조회 중 오류:', error);
    return [];
  }
}

// 실제 존재하는 기수 목록 반환 (새로운 엔드포인트)
router.get('/valid-terms', async (req, res) => {
  try {
    const validTerms = await getValidTerms();
    res.json({
      terms: validTerms,
      count: validTerms.length
    });
  } catch (error) {
    console.error('유효한 기수 조회 오류:', error);
    res.status(500).json({ message: '기수 정보를 불러오는 중 오류가 발생했습니다.' });
  }
});

// 갤러리 항목 가져오기 (공개) - 기수별 필터링 지원
router.get('/', async (req, res) => {
  try {
    const { term, meta_only } = req.query;
    
    // 특정 기수 요청 시 유효성 검증 (일단 주석 처리하여 모든 기수 허용)
    // if (term) {
    //   const validTerms = await getValidTerms();
    //   const requestedTerm = String(term);
    //   
    //   if (!validTerms.includes(requestedTerm)) {
    //     console.log(`❌ 존재하지 않는 기수 요청: ${requestedTerm}기`);
    //     console.log(`✅ 유효한 기수들: ${validTerms.join(', ')}`);
    //     return res.status(404).json({ 
    //       message: `제${requestedTerm}기는 존재하지 않습니다.`,
    //       validTerms: validTerms,
    //       requestedTerm: requestedTerm
    //     });
    //   }
    // }
    
    // 메타데이터만 요청하는 경우 (이미지 URL 제외)
    if (meta_only === 'true') {
      let query = {};
      
      // term 필터링 적용
      if (term) {
        const termNumber = Number(term);
        if (!isNaN(termNumber)) {
          query.term = termNumber;
          console.log(`📋 ${term}기 메타데이터 조회`);
        } else {
          console.log(`❌ 잘못된 기수 형식: ${term}`);
          return res.status(400).json({ message: '유효하지 않은 기수 형식입니다.' });
        }
      }
      
      const galleries = await Gallery.find(query).select('title description date term createdAt updatedAt').sort({ date: -1 });
      console.log(`📋 메타데이터 조회 완료: ${galleries.length}개 항목 (${term ? `${term}기` : '전체'})`);
      res.json(galleries);
      return;
    }
    
    let query = {};
    
    // 특정 기수만 요청하는 경우
    if (term) {
      // MongoDB에서 term이 숫자 타입으로 저장되어 있으므로 숫자로 변환하여 검색
      const termNumber = Number(term);
      if (!isNaN(termNumber)) {
        query.term = termNumber;
        console.log(`🎯 기수별 조회: ${term}기 (숫자로 변환: ${termNumber})`);
      } else {
        console.log(`❌ 잘못된 기수 형식: ${term}`);
        return res.status(400).json({ message: '유효하지 않은 기수 형식입니다.' });
      }
    }
    // 전체 조회 시 모든 갤러리 데이터 반환 (필터링 제거)
    
    const galleries = await Gallery.find(query).sort({ date: -1 });
    
    // 응답 데이터 로깅 (디버깅용)
    if (term) {
      console.log(`📊 ${term}기 조회 결과: 총 ${galleries.length}개 항목`);
    } else {
      const termCounts = {};
      galleries.forEach(item => {
        const itemTerm = item.term;
        termCounts[itemTerm] = (termCounts[itemTerm] || 0) + 1;
      });
      console.log(`📋 전체 조회 완료: ${galleries.length}개 항목`);
      console.log(`📈 기수별 분포:`, termCounts);
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
    const { term } = req.body;
    
    // 생성 시에도 유효한 기수인지 검증
    if (term) {
      const validTerms = await getValidTerms();
      const requestedTerm = String(term);
      
      if (!validTerms.includes(requestedTerm)) {
        return res.status(400).json({ 
          message: `제${requestedTerm}기는 존재하지 않는 기수입니다.`,
          validTerms: validTerms
        });
      }
    }
    
    const galleryItem = new Gallery(req.body);
    const savedItem = await galleryItem.save();
    console.log(`✅ 갤러리 항목 생성: ${savedItem.term}기 - ${savedItem.title}`);
    res.status(201).json(savedItem);
  } catch (error) {
    console.error('갤러리 항목 생성 오류:', error);
    res.status(500).json({ message: '갤러리 항목을 생성하는 중 오류가 발생했습니다.' });
  }
});

// 갤러리 항목 수정 (관리자 전용)
router.put('/:id', isAdmin, async (req, res) => {
  try {
    const { term } = req.body;
    
    // 수정 시에도 유효한 기수인지 검증
    if (term) {
      const validTerms = await getValidTerms();
      const requestedTerm = String(term);
      
      if (!validTerms.includes(requestedTerm)) {
        return res.status(400).json({ 
          message: `제${requestedTerm}기는 존재하지 않는 기수입니다.`,
          validTerms: validTerms
        });
      }
    }
    
    const updatedItem = await Gallery.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedItem) {
      return res.status(404).json({ message: '해당 갤러리 항목을 찾을 수 없습니다.' });
    }
    
    console.log(`✅ 갤러리 항목 수정: ${updatedItem.term}기 - ${updatedItem.title}`);
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
    
    console.log(`🗑️ 갤러리 항목 삭제: ${deletedItem.term}기 - ${deletedItem.title}`);
    res.json({ message: '갤러리 항목이 성공적으로 삭제되었습니다.' });
  } catch (error) {
    console.error('갤러리 항목 삭제 오류:', error);
    res.status(500).json({ message: '갤러리 항목을 삭제하는 중 오류가 발생했습니다.' });
  }
});

module.exports = router; 