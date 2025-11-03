const express = require('express');
const router = express.Router();
const Footer = require('../models/Footer');
const mongoose = require('mongoose');
const { authenticateToken } = require('../middleware/authMiddleware');

/**
 * @route   GET /api/footer
 * @desc    Get footer information
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    console.log('GET /api/footer - 요청 수신');
    console.log('MongoDB 연결 상태:', mongoose.connection.readyState);
    
    // MongoDB 연결 상태 확인
    if (mongoose.connection.readyState !== 1) {
      console.log('MongoDB 연결이 활성화되지 않았습니다.');
      return res.status(500).json({ message: 'Database connection is not active' });
    }
    
    // Collection 목록 확인 (디버깅용)
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('사용 가능한 컬렉션:', collections.map(c => c.name));
    
    // 가장 최근의 footer 설정 조회
    const footer = await Footer.findOne().sort({ updatedAt: -1 });
    
    if (footer) {
      console.log('Footer 데이터 조회 성공:', footer);
      res.json(footer);
    } else {
      // 데이터가 없으면 기본값 반환
      console.log('Footer 데이터가 없어 기본값 반환');
      res.json({
        wordFile: '',
        hwpFile: '',
        pdfFile: '',
        email: 'plp@snu.ac.kr',
        updatedAt: new Date()
      });
    }
  } catch (error) {
    console.error('Footer 정보 조회 오류:', error);
    res.status(500).json({ message: 'Error fetching footer information', error: error.message });
  }
});

/**
 * @route   POST /api/footer
 * @desc    Update or create footer information
 * @access  Private (admin only, but allowing without auth for testing)
 */
router.post('/', async (req, res) => {
  try {
    console.log('POST /api/footer - 요청 수신');
    console.log('요청 헤더:', req.headers);
    console.log('요청 본문:', req.body);
    console.log('MongoDB 연결 상태:', mongoose.connection.readyState);
    
    // MongoDB 연결 상태 확인
    if (mongoose.connection.readyState !== 1) {
      console.log('MongoDB 연결이 활성화되지 않았습니다.');
      return res.status(500).json({ message: 'Database connection is not active' });
    }
    
    // Collection 목록 확인 (디버깅용)
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('사용 가능한 컬렉션:', collections.map(c => c.name));
    
    const { 
      _id, 
      wordFile, 
      wordFileName,
      hwpFile, 
      hwpFileName,
      pdfFile, 
      pdfFileName,
      email, 
      companyName, 
      address, 
      contactPhone, 
      contactEmail, 
      copyrightYear 
    } = req.body;
    
    let footer;
    
    // _id가 있으면 해당 문서 업데이트, 없으면 새로 생성
    if (_id) {
      console.log(`ID ${_id}로 기존 Footer 문서 업데이트 시도`);
      
      footer = await Footer.findByIdAndUpdate(
        _id,
        {
          wordFile,
          wordFileName,
          hwpFile,
          hwpFileName,
          pdfFile,
          pdfFileName,
          email,
          companyName,
          address,
          contactPhone,
          contactEmail,
          copyrightYear,
          updatedAt: new Date()
        },
        { new: true, runValidators: true }
      );
      
      if (!footer) {
        console.log('업데이트할 Footer 문서를 찾을 수 없어 새로 생성합니다.');
        footer = new Footer({
          wordFile,
          wordFileName,
          hwpFile,
          hwpFileName,
          pdfFile,
          pdfFileName,
          email,
          companyName,
          address,
          contactPhone,
          contactEmail,
          copyrightYear
        });
        
        footer = await footer.save();
      }
    } else {
      console.log('ID가 없으므로 새 Footer 문서 생성');
      
      // 가장 최근의 footer 문서 조회
      const existingFooter = await Footer.findOne().sort({ updatedAt: -1 });
      
      if (existingFooter) {
        console.log('기존 Footer 문서 발견, 업데이트합니다:', existingFooter._id);
        
        existingFooter.wordFile = wordFile;
        existingFooter.wordFileName = wordFileName;
        existingFooter.hwpFile = hwpFile;
        existingFooter.hwpFileName = hwpFileName;
        existingFooter.pdfFile = pdfFile;
        existingFooter.pdfFileName = pdfFileName;
        existingFooter.email = email;
        existingFooter.companyName = companyName;
        existingFooter.address = address;
        existingFooter.contactPhone = contactPhone;
        existingFooter.contactEmail = contactEmail;
        existingFooter.copyrightYear = copyrightYear;
        existingFooter.updatedAt = new Date();
        
        footer = await existingFooter.save();
      } else {
        console.log('Footer 문서가 없어 새로 생성합니다.');
        
        footer = new Footer({
          wordFile,
          wordFileName,
          hwpFile,
          hwpFileName,
          pdfFile,
          pdfFileName,
          email,
          companyName,
          address,
          contactPhone,
          contactEmail,
          copyrightYear
        });
        
        footer = await footer.save();
      }
    }
    
    console.log('Footer 저장 성공:', footer);
    res.json(footer);
  } catch (error) {
    console.error('Footer 정보 저장 오류:', error);
    res.status(500).json({ message: 'Error saving footer information', error: error.message });
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
    console.log('요청 헤더:', req.headers);
    
    // 권한 확인 로직 제거 - 모든 요청 허용
    
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