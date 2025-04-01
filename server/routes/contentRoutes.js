const express = require('express');
const router = express.Router();
const { isAdmin } = require('../middleware/authMiddleware');
const Content = require('../models/Content');
const mongoose = require('mongoose');

// 기본 콘텐츠 라우트
router.get('/', (req, res) => {
  res.json({ message: '콘텐츠 API 엔드포인트' });
});

// 특정 타입의 콘텐츠 가져오기
router.get('/:type', async (req, res) => {
  try {
    const { type } = req.params;
    
    // 유효한 콘텐츠 타입인지 확인
    const validTypes = ['recommendations', 'objectives', 'benefits', 'professors', 'schedules', 'lecturers'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ message: '유효하지 않은 콘텐츠 타입입니다.' });
    }
    
    // 로깅 추가
    console.log(`요청된 콘텐츠 타입: ${type}`);
    
    try {
      // MongoDB에서 데이터 가져오기
      const contents = await Content.find({ type }).sort({ createdAt: -1 });
      
      // 데이터가 없는 경우 처리
      if (!contents || contents.length === 0) {
        console.log(`${type} 타입의 콘텐츠 데이터가 없습니다.`);
        return res.status(404).json({ message: `${type} 데이터를 찾을 수 없습니다.` });
      }
      
      console.log(`${type} 콘텐츠 조회 성공: ${contents.length}개 항목 발견`);
      
      // 응답
      res.json(contents);
    } catch (dbError) {
      // MongoDB 연결 또는 쿼리 오류 처리
      console.error(`${type} 콘텐츠 MongoDB 조회 실패:`, dbError);
      res.status(500).json({ 
        message: '데이터베이스에서 콘텐츠를 가져오는 중 오류가 발생했습니다.',
        error: dbError.message
      });
    }
  } catch (error) {
    console.error(`${req.params.type} 콘텐츠 조회 실패:`, error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 콘텐츠 추가 (관리자 전용)
router.post('/:type', /* isAdmin 제거 - 테스트용 */ async (req, res) => {
  try {
    const { type } = req.params;
    const { title, content, imageUrl, signText, category, term } = req.body;
    
    // 유효한 콘텐츠 타입인지 확인
    const validTypes = ['greeting', 'recommendations', 'objectives', 'benefits', 'professors', 'schedules', 'lecturers'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ message: '유효하지 않은 콘텐츠 타입입니다.' });
    }
    
    // 필수 필드 검증
    if (!title || !content) {
      return res.status(400).json({ message: '제목과 내용은 필수 항목입니다.' });
    }
    
    // 새 콘텐츠 생성
    const newContent = new Content({
      type,
      title,
      content,
      imageUrl,
      signText,
      category,
      term
    });
    
    // 저장 및 응답
    const savedContent = await newContent.save();
    res.status(201).json(savedContent);
  } catch (error) {
    console.error(`${req.params.type} 콘텐츠 생성 실패:`, error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

module.exports = router; 