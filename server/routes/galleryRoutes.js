const express = require('express');
const Gallery = require('../models/Gallery');
const GalleryThumbnail = require('../models/GalleryThumbnail');
const Admission = require('../models/Admission');
const Schedule = require('../models/Schedule');
const Graduate = require('../models/Graduate');
const { isAdmin } = require('../middleware/authMiddleware');
const galleryThumbnailService = require('../services/galleryThumbnailService');

const router = express.Router();

// ===== 우선순위 라우트 (동적 라우트보다 먼저 정의) =====

// 썸네일 라우트 - 최우선 순위로 배치
router.get('/thumbnails', async (req, res) => {
  try {
    console.log('🎯 [PRIORITY ROUTE] /thumbnails 요청 감지됨', {
      originalUrl: req.originalUrl,
      path: req.path,
      params: req.params,
      query: req.query
    });
    
    // 확실한 경로 확인
    if (!req.originalUrl.includes('/thumbnails')) {
      console.log('❌ thumbnails 라우트 경로 불일치');
      return res.status(404).json({ message: 'Invalid thumbnails route' });
    }
    
    console.log('🖼️ 갤러리 썸네일 목록 조회 시작');
    const thumbnails = await galleryThumbnailService.getAllThumbnails();
    
    console.log(`✅ 썸네일 조회 완료: ${thumbnails.length}개`);
    res.json(thumbnails);
    
  } catch (error) {
    console.error('❌ [PRIORITY ROUTE] 썸네일 조회 실패:', error);
    res.status(500).json({ 
      message: '썸네일 목록을 불러오는 중 오류가 발생했습니다.',
      error: error.message 
    });
  }
});

// valid-terms 라우트 - 우선순위 배치
router.get('/valid-terms', async (req, res) => {
  try {
    console.log('🎯 [PRIORITY ROUTE] /valid-terms 요청 감지됨', {
      originalUrl: req.originalUrl,
      path: req.path,
      params: req.params,
      query: req.query
    });
    
    if (!req.originalUrl.includes('/valid-terms')) {
      console.log('❌ valid-terms 라우트 경로 불일치');
      return res.status(404).json({ message: 'Invalid valid-terms route' });
    }
    
    const validTerms = await getValidTerms();
    res.json({
      terms: validTerms,
      count: validTerms.length
    });
  } catch (error) {
    console.error('❌ [PRIORITY ROUTE] 유효한 기수 조회 실패:', error);
    res.status(500).json({ message: '기수 정보를 불러오는 중 오류가 발생했습니다.' });
  }
});

// 헬스체크 엔드포인트 - 데이터베이스 연결 및 갤러리 데이터 상태 확인 - 강화된 라우트 가드
router.get('/health', async (req, res) => {
  try {
    // 강화된 라우트 가드: URL 경로 직접 확인
    if (req.path !== '/health' && req.originalUrl !== '/api/gallery/health') {
      console.log('⚠️ health 라우트 경로 불일치:', {
        path: req.path,
        originalUrl: req.originalUrl,
        params: req.params
      });
      return res.status(404).json({ message: 'Invalid health endpoint' });
    }
    
    // 추가 파라미터 체크
    if (req.params && Object.keys(req.params).length > 0) {
      console.log('⚠️ health 라우트에서 의도하지 않은 params 감지됨:', req.params);
      return res.status(404).json({ message: 'Endpoint not found' });
    }
    
    console.log('🏥 갤러리 헬스체크 요청 받음 (경로 확인됨):', req.originalUrl);
    
    // 데이터베이스 연결 테스트
    const totalCount = await Gallery.countDocuments();
    
    // 기수별 분포 확인
    const termDistribution = await Gallery.aggregate([
      { $group: { _id: '$term', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    // 각 기수별 샘플 데이터 확인
    const term1Sample = await Gallery.findOne({ term: 1 });
    const term2Sample = await Gallery.findOne({ term: 2 });
    
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        totalGalleryItems: totalCount,
        termDistribution: termDistribution,
        samples: {
          term1: term1Sample ? { 
            id: term1Sample._id, 
            title: term1Sample.title, 
            term: term1Sample.term 
          } : null,
          term2: term2Sample ? { 
            id: term2Sample._id, 
            title: term2Sample.title, 
            term: term2Sample.term 
          } : null
        }
      }
    };
    
    console.log('✅ 갤러리 헬스체크 성공:', healthData);
    res.json(healthData);
    
  } catch (error) {
    console.error('❌ 갤러리 헬스체크 실패:', error);
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
      database: {
        connected: false
      }
    });
  }
});

// 썸네일 관련 API 엔드포인트들



// 모든 기수의 썸네일 생성/업데이트 (관리자 전용)
router.post('/thumbnails/generate', isAdmin, async (req, res) => {
  try {
    console.log('🖼️ 전체 썸네일 생성 요청 (관리자)');
    
    const results = await galleryThumbnailService.generateAllThumbnails();
    
    console.log(`✅ 전체 썸네일 생성 완료: ${results.length}개`);
    res.json({
      message: `${results.length}개 기수의 썸네일이 생성/업데이트되었습니다.`,
      thumbnails: results
    });
    
  } catch (error) {
    console.error('❌ 전체 썸네일 생성 실패:', error);
    res.status(500).json({ 
      message: '썸네일 생성 중 오류가 발생했습니다.',
      error: error.message 
    });
  }
});

// 특정 기수의 썸네일 생성/업데이트 (관리자 전용)
router.post('/thumbnails/generate/:term', isAdmin, async (req, res) => {
  try {
    const { term } = req.params;
    const termNumber = Number(term);
    
    if (isNaN(termNumber)) {
      return res.status(400).json({ message: '유효하지 않은 기수 형식입니다.' });
    }
    
    console.log(`🖼️ 제${termNumber}기 썸네일 생성 요청 (관리자)`);
    
    const result = await galleryThumbnailService.generateThumbnailForTerm(termNumber);
    
    if (result) {
      console.log(`✅ 제${termNumber}기 썸네일 생성 완료`);
      res.json({
        message: `제${termNumber}기 썸네일이 생성/업데이트되었습니다.`,
        thumbnail: result
      });
    } else {
      res.status(404).json({
        message: `제${termNumber}기에 이미지가 있는 갤러리 아이템이 없습니다.`
      });
    }
    
  } catch (error) {
    console.error(`❌ 제${req.params.term}기 썸네일 생성 실패:`, error);
    res.status(500).json({ 
      message: '썸네일 생성 중 오류가 발생했습니다.',
      error: error.message 
    });
  }
});

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



// 갤러리 항목 가져오기 (공개) - 기수별 필터링 지원
router.get('/', async (req, res) => {
  try {
    // 🚨 CRITICAL: 특정 경로들이 여기로 잘못 라우팅되는 것을 방지
    const blockedPaths = ['thumbnails', 'valid-terms', 'health'];
    if (blockedPaths.some(path => req.originalUrl.includes(`/${path}`))) {
      console.log('🚫 BLOCKED: 동적 라우트에서 특수 경로 차단됨:', req.originalUrl);
      return res.status(404).json({ 
        message: '잘못된 경로입니다.',
        originalUrl: req.originalUrl,
        redirectedTo: 'general gallery route'
      });
    }
    
    const { term, meta_only } = req.query;
    
    console.log(`🔍 갤러리 API 요청 - term: ${term}, meta_only: ${meta_only}, 요청 시각: ${new Date().toISOString()}`);
    
    // 특정 기수 요청 시 유효성 검증
    if (term) {
      const validTerms = await getValidTerms();
      const requestedTerm = String(term);
      
      console.log(`📋 기수 유효성 검증 - 요청된 기수: ${requestedTerm}, 유효한 기수들: [${validTerms.join(', ')}]`);
      
      if (!validTerms.includes(requestedTerm)) {
        console.log(`❌ 존재하지 않는 기수 요청: ${requestedTerm}기`);
        console.log(`✅ 유효한 기수들: ${validTerms.join(', ')}`);
        return res.status(404).json({ 
          message: `제${requestedTerm}기는 존재하지 않는 기수입니다.`,
          validTerms: validTerms,
          requestedTerm: requestedTerm
        });
      }
      console.log(`✅ 기수 유효성 검증 통과: ${requestedTerm}기`);
    }
    
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
      
      // 실제 응답 데이터의 기수 분포 확인
      const responseTermCounts = {};
      galleries.forEach(item => {
        const itemTerm = item.term;
        responseTermCounts[itemTerm] = (responseTermCounts[itemTerm] || 0) + 1;
      });
      console.log(`📈 응답 데이터의 기수별 분포:`, responseTermCounts);
      
      // 첫 3개 항목의 상세 정보
      if (galleries.length > 0) {
        console.log(`📋 응답 데이터 샘플 (처음 3개):`);
        galleries.slice(0, 3).forEach((item, index) => {
          console.log(`  ${index + 1}. ${item.title} (기수: ${item.term})`);
        });
      }
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
    
    // 새 기수 생성 허용: 유효성 검증을 제거하여 새로운 term도 생성 가능하도록 함
    
    const galleryItem = new Gallery(req.body);
    const savedItem = await galleryItem.save();
    console.log(`✅ 갤러리 항목 생성: ${savedItem.term}기 - ${savedItem.title}`);
    
    // 새 갤러리 아이템 추가 시 썸네일 자동 업데이트
    try {
      await galleryThumbnailService.updateThumbnailOnNewItem(savedItem);
    } catch (thumbnailError) {
      console.warn('⚠️ 썸네일 업데이트 실패 (갤러리 아이템은 생성됨):', thumbnailError);
    }
    
    res.status(201).json(savedItem);
  } catch (error) {
    console.error('갤러리 항목 생성 오류:', error);
    res.status(500).json({ message: '갤러리 항목을 생성하는 중 오류가 발생했습니다.' });
  }
});

// 갤러리 항목 수정 (관리자 전용)
router.put('/:id', isAdmin, async (req, res) => {
  try {
    // 🚨 CRITICAL: 특수 경로 차단
    const blockedPaths = ['thumbnails', 'valid-terms', 'health'];
    if (blockedPaths.includes(req.params.id)) {
      console.log('🚫 PUT BLOCKED: 특수 경로가 동적 라우트로 라우팅됨:', req.params.id);
      return res.status(404).json({ 
        message: '잘못된 경로입니다.',
        blockedPath: req.params.id,
        route: 'PUT /:id'
      });
    }
    
    // MongoDB ObjectId 형식 검증 (24자리 16진수)
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    if (!objectIdRegex.test(req.params.id)) {
      console.log('⚠️ PUT 라우트: 유효하지 않은 ObjectId 형식:', req.params.id);
      return res.status(400).json({ 
        message: '유효하지 않은 ID 형식입니다.',
        providedId: req.params.id 
      });
    }
    
    // 새 기수로 수정 허용: term 유효성 검사 제거
    
    const updatedItem = await Gallery.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedItem) {
      return res.status(404).json({ message: '해당 갤러리 항목을 찾을 수 없습니다.' });
    }
    
    console.log(`✅ 갤러리 항목 수정: ${updatedItem.term}기 - ${updatedItem.title}`);
    
    // 갤러리 아이템 수정 시 썸네일 업데이트
    try {
      await galleryThumbnailService.updateThumbnailOnNewItem(updatedItem);
    } catch (thumbnailError) {
      console.warn('⚠️ 썸네일 업데이트 실패 (갤러리 아이템은 수정됨):', thumbnailError);
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
    // 🚨 CRITICAL: 특수 경로 차단
    const blockedPaths = ['thumbnails', 'valid-terms', 'health'];
    if (blockedPaths.includes(req.params.id)) {
      console.log('🚫 DELETE BLOCKED: 특수 경로가 동적 라우트로 라우팅됨:', req.params.id);
      return res.status(404).json({ 
        message: '잘못된 경로입니다.',
        blockedPath: req.params.id,
        route: 'DELETE /:id'
      });
    }
    
    // MongoDB ObjectId 형식 검증 (24자리 16진수)
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    if (!objectIdRegex.test(req.params.id)) {
      console.log('⚠️ DELETE 라우트: 유효하지 않은 ObjectId 형식:', req.params.id);
      return res.status(400).json({ 
        message: '유효하지 않은 ID 형식입니다.',
        providedId: req.params.id 
      });
    }
    
    const deletedItem = await Gallery.findByIdAndDelete(req.params.id);
    
    if (!deletedItem) {
      return res.status(404).json({ message: '해당 갤러리 항목을 찾을 수 없습니다.' });
    }
    
    console.log(`🗑️ 갤러리 항목 삭제: ${deletedItem.term}기 - ${deletedItem.title}`);
    
    // 갤러리 아이템 삭제 시 해당 기수의 썸네일 재생성
    try {
      if (deletedItem.term) {
        await galleryThumbnailService.generateThumbnailForTerm(deletedItem.term);
      }
    } catch (thumbnailError) {
      console.warn('⚠️ 썸네일 재생성 실패 (갤러리 아이템은 삭제됨):', thumbnailError);
    }
    res.json({ message: '갤러리 항목이 성공적으로 삭제되었습니다.' });
  } catch (error) {
    console.error('갤러리 항목 삭제 오류:', error);
    res.status(500).json({ message: '갤러리 항목을 삭제하는 중 오류가 발생했습니다.' });
  }
});

// Catch-all 라우트: 정의되지 않은 갤러리 엔드포인트 차단
router.get('/*', (req, res) => {
  console.log('⚠️ 정의되지 않은 갤러리 엔드포인트 요청:', req.path);
  console.log('📋 요청 params:', req.params);
  console.log('📋 요청 query:', req.query);
  
  res.status(404).json({ 
    message: '갤러리 엔드포인트를 찾을 수 없습니다.',
    path: req.path,
    availableEndpoints: [
      '/api/gallery',
      '/api/gallery/health', 
      '/api/gallery/thumbnails',
      '/api/gallery/valid-terms'
    ]
  });
});

module.exports = router; 