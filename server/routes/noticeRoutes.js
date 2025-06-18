const express = require('express');
const router = express.Router();
const Notice = require('../models/Notice');

// 모든 공지사항 가져오기 (공개)
router.get('/', async (req, res) => {
  try {
    console.log('공지사항 조회 요청 수신');
    
    // MongoDB에서 공지사항 가져오기
    const notices = await Notice.find().sort({ createdAt: -1 });
    
    // 데이터가 없는 경우 처리
    if (!notices || notices.length === 0) {
      console.log('공지사항 데이터가 없습니다.');
      return res.status(404).json({ message: '공지사항 데이터를 찾을 수 없습니다.' });
    }
    
    console.log(`공지사항 조회 성공: ${notices.length}개 항목 발견`);
    res.json(notices);
  } catch (error) {
    console.error('공지사항 조회 실패:', error);
    res.status(500).json({ message: '공지사항을 가져오는 중 오류가 발생했습니다.', error: error.message });
  }
});

// 특정 공지사항 가져오기
router.get('/:id', async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    
    if (!notice) {
      return res.status(404).json({ message: '해당 공지사항을 찾을 수 없습니다.' });
    }
    
    res.json(notice);
  } catch (error) {
    console.error(`공지사항 ID ${req.params.id} 조회 실패:`, error);
    res.status(500).json({ message: '공지사항을 가져오는 중 오류가 발생했습니다.' });
  }
});

// 공지사항 생성
router.post('/', async (req, res) => {
  try {
    console.log('=== 공지사항 생성 요청 ===');
    console.log('전체 요청 데이터:', JSON.stringify(req.body, null, 2));
    console.log('첨부파일 데이터 타입:', typeof req.body.attachments);
    console.log('첨부파일 데이터:', req.body.attachments);
    
    const { title, content, author, isImportant, attachments } = req.body;
    
    const notice = new Notice({
      title,
      content,
      author,
      isImportant: isImportant || false,
      attachments: attachments || []
    });

    console.log('저장할 공지사항 객체:', JSON.stringify(notice, null, 2));
    
    const savedNotice = await notice.save();
    console.log('저장된 공지사항:', JSON.stringify(savedNotice, null, 2));
    
    res.status(201).json(savedNotice);
  } catch (error) {
    console.error('공지사항 생성 오류:', error);
    res.status(500).json({ message: '공지사항 생성 실패', error: error.message });
  }
});

// 공지사항 수정
router.put('/:id', async (req, res) => {
  try {
    console.log('=== 공지사항 수정 요청 ===');
    console.log('수정할 ID:', req.params.id);
    console.log('전체 요청 데이터:', JSON.stringify(req.body, null, 2));
    console.log('첨부파일 데이터 타입:', typeof req.body.attachments);
    console.log('첨부파일 데이터:', req.body.attachments);
    
    const { title, content, author, isImportant, attachments } = req.body;
    
    const updateData = {
      title,
      content,
      author,
      isImportant: isImportant || false,
      attachments: attachments || []
    };
    
    console.log('업데이트할 데이터:', JSON.stringify(updateData, null, 2));
    
    const notice = await Notice.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!notice) {
      return res.status(404).json({ message: '공지사항을 찾을 수 없습니다' });
    }

    console.log('수정된 공지사항:', JSON.stringify(notice, null, 2));
    res.json(notice);
  } catch (error) {
    console.error('공지사항 수정 오류:', error);
    res.status(500).json({ message: '공지사항 수정 실패', error: error.message });
  }
});

// 공지사항 삭제 (인증 제거됨)
router.delete('/:id', async (req, res) => {
  try {
    const deletedNotice = await Notice.findByIdAndDelete(req.params.id);
    
    if (!deletedNotice) {
      return res.status(404).json({ message: '해당 공지사항을 찾을 수 없습니다.' });
    }
    
    console.log('공지사항 삭제 성공:', req.params.id);
    res.json({ message: '공지사항이 성공적으로 삭제되었습니다.' });
  } catch (error) {
    console.error(`공지사항 ID ${req.params.id} 삭제 실패:`, error);
    res.status(500).json({ message: '공지사항을 삭제하는 중 오류가 발생했습니다.' });
  }
});

module.exports = router; 