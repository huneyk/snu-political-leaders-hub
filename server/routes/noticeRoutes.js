const express = require('express');
const router = express.Router();
const Notice = require('../models/Notice');
const { isAdmin } = require('../middleware/authMiddleware');

// 모든 공지사항 가져오기 (공개)
router.get('/', async (req, res) => {
  try {
    const notices = await Notice.find().sort({ createdAt: -1 });
    res.json(notices);
  } catch (error) {
    console.error('공지사항 조회 실패:', error);
    res.status(500).json({ message: '공지사항을 가져오는 중 오류가 발생했습니다.' });
  }
});

// 단일 공지사항 가져오기 (공개)
router.get('/:id', async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    
    if (!notice) {
      return res.status(404).json({ message: '해당 공지사항을 찾을 수 없습니다.' });
    }
    
    res.json(notice);
  } catch (error) {
    console.error('공지사항 조회 실패:', error);
    res.status(500).json({ message: '공지사항을 가져오는 중 오류가 발생했습니다.' });
  }
});

// 공지사항 생성 (관리자 전용)
router.post('/', isAdmin, async (req, res) => {
  try {
    const { title, content, author, isImportant } = req.body;
    
    if (!title || !content || !author) {
      return res.status(400).json({ message: '제목, 내용, 작성자는 필수 항목입니다.' });
    }
    
    const newNotice = new Notice({
      title,
      content,
      author,
      isImportant: isImportant || false
    });
    
    const savedNotice = await newNotice.save();
    res.status(201).json(savedNotice);
  } catch (error) {
    console.error('공지사항 생성 실패:', error);
    res.status(500).json({ message: '공지사항을 생성하는 중 오류가 발생했습니다.' });
  }
});

// 공지사항 수정 (관리자 전용)
router.put('/:id', isAdmin, async (req, res) => {
  try {
    const { title, content, author, isImportant } = req.body;
    
    if (!title || !content || !author) {
      return res.status(400).json({ message: '제목, 내용, 작성자는 필수 항목입니다.' });
    }
    
    const updatedNotice = await Notice.findByIdAndUpdate(
      req.params.id,
      {
        title,
        content,
        author,
        isImportant: isImportant || false
      },
      { new: true, runValidators: true }
    );
    
    if (!updatedNotice) {
      return res.status(404).json({ message: '해당 공지사항을 찾을 수 없습니다.' });
    }
    
    res.json(updatedNotice);
  } catch (error) {
    console.error('공지사항 수정 실패:', error);
    res.status(500).json({ message: '공지사항을 수정하는 중 오류가 발생했습니다.' });
  }
});

// 공지사항 삭제 (관리자 전용)
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    const deletedNotice = await Notice.findByIdAndDelete(req.params.id);
    
    if (!deletedNotice) {
      return res.status(404).json({ message: '해당 공지사항을 찾을 수 없습니다.' });
    }
    
    res.json({ message: '공지사항이 성공적으로 삭제되었습니다.' });
  } catch (error) {
    console.error('공지사항 삭제 실패:', error);
    res.status(500).json({ message: '공지사항을 삭제하는 중 오류가 발생했습니다.' });
  }
});

module.exports = router; 