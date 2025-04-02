const express = require('express');
const router = express.Router();
const Footer = require('../models/Footer');

/**
 * @route   GET /api/footer
 * @desc    Footer 정보 가져오기
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    console.log('Footer 정보 요청 수신');
    
    // MongoDB에서 footer 정보 가져오기 (가장 최근 문서 사용)
    let footerInfo = await Footer.findOne().sort({ createdAt: -1 });
    
    // 데이터가 없는 경우 기본값 생성
    if (!footerInfo) {
      console.log('기존 Footer 정보가 없어 기본값 반환');
      footerInfo = {
        wordFile: '',
        hwpFile: '',
        pdfFile: '',
        email: 'plp@snu.ac.kr',
        companyName: '서울대학교 정치리더스과정',
        address: '서울시 관악구 관악로 1 서울대학교 사회과학대학',
        contactPhone: '02-880-xxxx',
        contactEmail: 'plp@snu.ac.kr',
        copyrightYear: new Date().getFullYear().toString()
      };
    }
    
    console.log('Footer 정보 조회 성공');
    res.json(footerInfo);
  } catch (error) {
    console.error('Footer 정보 조회 실패:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

/**
 * @route   POST /api/footer
 * @desc    Footer 정보 생성/업데이트
 * @access  Public (인증 제거됨)
 */
router.post('/', async (req, res) => {
  try {
    console.log('Footer 정보 업데이트 요청 수신:', req.body);
    
    // 새 Footer 문서 생성 (기존 문서를 보존하고 새로운 문서 생성)
    const newFooter = new Footer({
      ...req.body,
      updatedAt: new Date()
    });
    
    const savedFooter = await newFooter.save();
    console.log('Footer 정보 저장 성공:', savedFooter._id);
    
    res.json(savedFooter);
  } catch (error) {
    console.error('Footer 정보 업데이트 실패:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

/**
 * @route   PUT /api/footer
 * @desc    Footer 정보 업데이트 (기존 문서 수정)
 * @access  Public (인증 제거됨)
 */
router.put('/', async (req, res) => {
  try {
    console.log('Footer 정보 업데이트 요청 수신 (PUT):', req.body);
    
    // 가장 최근 문서 찾기
    const footerInfo = await Footer.findOne().sort({ createdAt: -1 });
    
    if (!footerInfo) {
      // 기존 문서가 없으면 새로 생성
      const newFooter = new Footer({
        ...req.body,
        updatedAt: new Date()
      });
      
      const savedFooter = await newFooter.save();
      console.log('새 Footer 정보 생성 성공:', savedFooter._id);
      return res.json(savedFooter);
    }
    
    // 기존 문서 업데이트
    const updatedFooter = await Footer.findByIdAndUpdate(
      footerInfo._id,
      { 
        ...req.body,
        updatedAt: new Date()
      },
      { new: true }
    );
    
    console.log('Footer 정보 업데이트 성공:', updatedFooter._id);
    res.json(updatedFooter);
  } catch (error) {
    console.error('Footer 정보 업데이트 실패:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

module.exports = router; 