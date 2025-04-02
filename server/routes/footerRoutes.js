const express = require('express');
const router = express.Router();
const Footer = require('../models/Footer');
const mongoose = require('mongoose');

/**
 * @route   GET /api/footer
 * @desc    Footer 정보 가져오기
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    console.log('Footer 정보 요청 수신');
    
    // MongoDB 연결 확인
    if (mongoose.connection.readyState !== 1) {
      console.log('MongoDB 연결 상태 오류:', mongoose.connection.readyState);
      return res.status(500).json({ 
        message: 'MongoDB 연결이 활성화되지 않았습니다.', 
        readyState: mongoose.connection.readyState 
      });
    }
    
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
    res.status(500).json({ 
      message: '서버 오류가 발생했습니다.', 
      error: error.message, 
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
    });
  }
});

/**
 * @route   POST /api/footer
 * @desc    Footer 정보 생성/업데이트
 * @access  Public (인증 제거됨)
 */
router.post('/', async (req, res) => {
  try {
    console.log('Footer 정보 업데이트 요청 수신 (POST):', req.body);
    
    // MongoDB 연결 확인
    if (mongoose.connection.readyState !== 1) {
      console.log('MongoDB 연결 상태 오류:', mongoose.connection.readyState);
      return res.status(500).json({ 
        message: 'MongoDB 연결이 활성화되지 않았습니다.', 
        readyState: mongoose.connection.readyState 
      });
    }
    
    // req.body에서 _id가 있으면 해당 문서 업데이트, 없으면 새 문서 생성
    if (req.body._id) {
      try {
        // 기존 문서 업데이트
        const updatedFooter = await Footer.findByIdAndUpdate(
          req.body._id,
          { 
            ...req.body,
            updatedAt: new Date()
          },
          { new: true }
        );
        
        if (!updatedFooter) {
          console.log('지정된 ID로 문서를 찾을 수 없어서 새 문서 생성');
          // ID가 존재하지만 해당 문서가 없는 경우, 새 문서 생성
          const newFooter = new Footer({
            ...req.body,
            updatedAt: new Date()
          });
          
          const savedFooter = await newFooter.save();
          console.log('새 Footer 정보 생성 성공:', savedFooter._id);
          return res.json(savedFooter);
        }
        
        console.log('Footer 정보 업데이트 성공 (ID 기준):', updatedFooter._id);
        return res.json(updatedFooter);
      } catch (updateError) {
        console.error('ID로 업데이트 실패, 새 문서 생성:', updateError.message);
        // ID가 유효하지 않은 경우 새 문서 생성
        const newFooter = new Footer({
          ...req.body,
          updatedAt: new Date()
        });
        
        const savedFooter = await newFooter.save();
        console.log('새 Footer 정보 생성 성공 (업데이트 실패 후):', savedFooter._id);
        return res.json(savedFooter);
      }
    }
    
    // ID 없는 경우 새 문서 생성
    const newFooter = new Footer({
      ...req.body,
      updatedAt: new Date()
    });
    
    const savedFooter = await newFooter.save();
    console.log('Footer 정보 저장 성공 (새 문서):', savedFooter._id);
    
    res.json(savedFooter);
  } catch (error) {
    console.error('Footer 정보 업데이트 실패:', error);
    res.status(500).json({ 
      message: '서버 오류가 발생했습니다.', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
    });
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
    
    // MongoDB 연결 확인
    if (mongoose.connection.readyState !== 1) {
      console.log('MongoDB 연결 상태 오류:', mongoose.connection.readyState);
      return res.status(500).json({ 
        message: 'MongoDB 연결이 활성화되지 않았습니다.', 
        readyState: mongoose.connection.readyState 
      });
    }
    
    // req.body에서 _id 확인
    if (req.body._id) {
      // 기존 문서 업데이트
      const updatedFooter = await Footer.findByIdAndUpdate(
        req.body._id,
        { 
          ...req.body,
          updatedAt: new Date()
        },
        { new: true }
      );
      
      if (!updatedFooter) {
        return res.status(404).json({ message: '지정된 ID의 문서를 찾을 수 없습니다.' });
      }
      
      console.log('Footer 정보 업데이트 성공 (PUT):', updatedFooter._id);
      return res.json(updatedFooter);
    }
    
    // ID가 없는 경우 가장 최근 문서 찾아 업데이트
    const footerInfo = await Footer.findOne().sort({ createdAt: -1 });
    
    if (!footerInfo) {
      // 기존 문서가 없으면 새로 생성
      const newFooter = new Footer({
        ...req.body,
        updatedAt: new Date()
      });
      
      const savedFooter = await newFooter.save();
      console.log('새 Footer 정보 생성 성공 (PUT):', savedFooter._id);
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
    
    console.log('Footer 정보 업데이트 성공 (PUT):', updatedFooter._id);
    res.json(updatedFooter);
  } catch (error) {
    console.error('Footer 정보 업데이트 실패 (PUT):', error);
    res.status(500).json({ 
      message: '서버 오류가 발생했습니다.', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
    });
  }
});

module.exports = router; 