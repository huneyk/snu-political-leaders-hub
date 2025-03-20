const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const Footer = require('../models/Footer');

const router = express.Router();

/**
 * @route   GET /api/footer
 * @desc    Footer 정보 가져오기
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    // 가장 최근 Footer 정보 가져오기
    const footerInfo = await Footer.findOne().sort({ updatedAt: -1 });
    
    if (!footerInfo) {
      return res.status(404).json({ message: 'Footer 정보를 찾을 수 없습니다.' });
    }
    
    res.json(footerInfo);
  } catch (error) {
    console.error('Footer 정보 조회 실패:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

/**
 * @route   POST /api/footer
 * @desc    Footer 정보 저장 또는 업데이트
 * @access  Private
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { wordFile, hwpFile, pdfFile, email } = req.body;
    
    // 기존 정보 찾기
    let footerInfo = await Footer.findOne().sort({ updatedAt: -1 });
    
    if (footerInfo) {
      // 기존 정보 업데이트
      if (wordFile !== undefined) footerInfo.wordFile = wordFile;
      if (hwpFile !== undefined) footerInfo.hwpFile = hwpFile;
      if (pdfFile !== undefined) footerInfo.pdfFile = pdfFile;
      if (email !== undefined) footerInfo.email = email;
      
      await footerInfo.save();
      res.json(footerInfo);
    } else {
      // 새로운 정보 생성
      const newFooterInfo = new Footer({
        wordFile: wordFile || '',
        hwpFile: hwpFile || '',
        pdfFile: pdfFile || '',
        email: email || ''
      });
      
      const savedInfo = await newFooterInfo.save();
      res.status(201).json(savedInfo);
    }
  } catch (error) {
    console.error('Footer 정보 저장 실패:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

module.exports = router; 