const express = require('express');
const router = express.Router();
const Schedule = require('../models/Schedule');
const { isAdmin } = require('../middleware/authMiddleware');

// 모든 일정 정보 가져오기 (관리자용 - /all 엔드포인트)
router.get('/all', async (req, res) => {
  try {
    console.log('모든 일정 정보 조회 요청 수신 (/all)');
    
    // MongoDB에서 모든 일정 데이터 가져오기 (isActive 필터 없이)
    const schedules = await Schedule.find({}).sort({ date: 1 });
    
    // 데이터가 없는 경우 처리
    if (!schedules || schedules.length === 0) {
      console.log('일정 데이터가 없습니다.');
      return res.json([]); // 빈 배열 반환
    }
    
    console.log(`모든 일정 정보 조회 성공: ${schedules.length}개 항목 발견`);
    res.json(schedules);
  } catch (error) {
    console.error('모든 일정 정보 조회 실패:', error);
    res.status(500).json({ message: '일정을 가져오는 중 오류가 발생했습니다.', error: error.message });
  }
});

// 기수별 일정 조회 (공개) - /:id 라우트보다 먼저 정의
router.get('/term/:termNumber', async (req, res) => {
  try {
    const termNumber = req.params.termNumber;
    console.log(`기수별 일정 조회 요청: ${termNumber}기`);
    
    // MongoDB에서 해당 기수의 일정 데이터 가져오기
    // term 필드가 숫자 또는 문자열일 수 있으므로 둘 다 검색
    const schedules = await Schedule.find({ 
      $or: [
        { term: termNumber },        // 문자열로 저장된 경우
        { term: parseInt(termNumber) } // 숫자로 저장된 경우
      ],
      isActive: true 
    }).sort({ date: 1 });
    
    console.log(`${termNumber}기 일정 조회 성공: ${schedules.length}개 항목 발견`);
    
    // 디버깅을 위해 첫 번째 일정의 term 필드 타입 확인
    if (schedules.length > 0) {
      console.log(`첫 번째 일정의 term 필드:`, schedules[0].term, `(타입: ${typeof schedules[0].term})`);
    }
    
    res.json(schedules);
  } catch (error) {
    console.error('기수별 일정 조회 실패:', error);
    res.status(500).json({ message: '기수별 일정을 가져오는 중 오류가 발생했습니다.', error: error.message });
  }
});

// ID로 일정 조회 (공개)
router.get('/:id', async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id);
    
    if (!schedule) {
      return res.status(404).json({ message: '요청한 일정을 찾을 수 없습니다.' });
    }
    
    res.json(schedule);
  } catch (error) {
    console.error('일정 조회 실패:', error);
    res.status(500).json({ message: '일정을 가져오는 중 오류가 발생했습니다.' });
  }
});

// 모든 일정 정보 가져오기 (공개)
router.get('/', async (req, res) => {
  try {
    console.log('일정 정보 조회 요청 수신');
    
    // 카테고리 필터링 (선택적)
    const filter = { isActive: true };
    if (req.query.category) {
      filter.category = req.query.category;
    }
    
    // MongoDB에서 일정 데이터 가져오기
    const schedules = await Schedule.find(filter).sort({ date: 1 });
    
    // 데이터가 없는 경우 처리
    if (!schedules || schedules.length === 0) {
      console.log('일정 데이터가 없습니다.');
      return res.json([]); // 빈 배열 반환
    }
    
    console.log(`일정 정보 조회 성공: ${schedules.length}개 항목 발견`);
    res.json(schedules);
  } catch (error) {
    console.error('일정 정보 조회 실패:', error);
    res.status(500).json({ message: '일정 정보를 가져오는 중 오류가 발생했습니다.', error: error.message });
  }
});

// 일정 정보 추가 (관리자 전용)
router.post('/', isAdmin, async (req, res) => {
  try {
    const { title, category, term, year, date, time, location, description } = req.body;
    
    if (!title || !date) {
      return res.status(400).json({ message: '제목과 날짜는 필수 항목입니다.' });
    }
    
    const newSchedule = new Schedule({
      title,
      category: category || 'academic',
      term: term || 1,
      year: year || new Date().getFullYear().toString(),
      date,
      time,
      location,
      description,
      updatedAt: Date.now()
    });
    
    const savedSchedule = await newSchedule.save();
    res.status(201).json(savedSchedule);
  } catch (error) {
    console.error('일정 정보 생성 실패:', error);
    res.status(500).json({ message: '일정 정보를 생성하는 중 오류가 발생했습니다.' });
  }
});

// 일정 정보 업데이트 (관리자 전용)
router.put('/:id', isAdmin, async (req, res) => {
  try {
    const updatedSchedule = await Schedule.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        updatedAt: Date.now()
      },
      { new: true }
    );
    
    if (!updatedSchedule) {
      return res.status(404).json({ message: '수정할 일정을 찾을 수 없습니다.' });
    }
    
    res.json(updatedSchedule);
  } catch (error) {
    console.error('일정 정보 업데이트 실패:', error);
    res.status(500).json({ message: '일정 정보를 업데이트하는 중 오류가 발생했습니다.' });
  }
});

// 일정 정보 삭제 (관리자 전용)
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    const deletedSchedule = await Schedule.findByIdAndDelete(req.params.id);
    
    if (!deletedSchedule) {
      return res.status(404).json({ message: '삭제할 일정을 찾을 수 없습니다.' });
    }
    
    res.json({ message: '일정이 성공적으로 삭제되었습니다.', deletedSchedule });
  } catch (error) {
    console.error('일정 정보 삭제 실패:', error);
    res.status(500).json({ message: '일정 정보를 삭제하는 중 오류가 발생했습니다.' });
  }
});

module.exports = router; 