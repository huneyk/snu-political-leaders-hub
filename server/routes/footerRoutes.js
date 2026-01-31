const express = require('express');
const router = express.Router();
const Footer = require('../models/Footer');
const mongoose = require('mongoose');
const multer = require('multer');
const { GridFSBucket } = require('mongodb');
const { Readable } = require('stream');
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');

// Multer 메모리 스토리지 설정 (GridFS에 저장하기 위해)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB 제한
  }
});

/**
 * @route   GET /api/footer
 * @desc    Get footer information (메타데이터만, 파일 데이터는 제외)
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
    
    // 가장 최근의 footer 설정 조회
    const footer = await Footer.findOne().sort({ updatedAt: -1 });
    
    if (footer) {
      console.log('Footer 데이터 조회 성공 (메타데이터만)');
      // 파일 데이터를 제외하고 메타데이터만 반환
      res.json({
        _id: footer._id,
        wordFileId: footer.wordFileId,
        wordFileName: footer.wordFileName,
        hwpFileId: footer.hwpFileId,
        hwpFileName: footer.hwpFileName,
        pdfFileId: footer.pdfFileId,
        pdfFileName: footer.pdfFileName,
        email: footer.email,
        companyName: footer.companyName,
        address: footer.address,
        contactPhone: footer.contactPhone,
        contactEmail: footer.contactEmail,
        copyrightYear: footer.copyrightYear,
        updatedAt: footer.updatedAt
      });
    } else {
      // 데이터가 없으면 기본값 반환
      console.log('Footer 데이터가 없어 기본값 반환');
      res.json({
        wordFileId: null,
        wordFileName: '',
        hwpFileId: null,
        hwpFileName: '',
        pdfFileId: null,
        pdfFileName: '',
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
 * @route   POST /api/footer/upload
 * @desc    Upload file to GridFS and update footer
 * @access  Admin
 */
router.post('/upload', isAdmin, upload.single('file'), async (req, res) => {
  try {
    console.log('POST /api/footer/upload - 파일 업로드 요청 수신');
    
    if (!req.file) {
      return res.status(400).json({ message: '업로드할 파일이 없습니다.' });
    }
    
    // MongoDB 연결 상태 확인
    if (mongoose.connection.readyState !== 1) {
      console.log('MongoDB 연결이 활성화되지 않았습니다.');
      return res.status(500).json({ message: 'Database connection is not active' });
    }
    
    const { fileType } = req.body; // 'wordFile', 'hwpFile', 'pdfFile'
    
    // multer가 한글 파일명을 깨뜨리는 문제 해결
    // Buffer를 통해 올바르게 디코딩
    const fileName = Buffer.from(req.file.originalname, 'latin1').toString('utf8');
    
    console.log(`파일 업로드 중: ${fileName} (타입: ${fileType})`);
    
    // GridFS 버킷 생성
    const bucket = new GridFSBucket(mongoose.connection.db, {
      bucketName: 'footerFiles'
    });
    
    // 파일 스트림 생성
    const readableStream = Readable.from(req.file.buffer);
    
    // GridFS에 파일 업로드
    const uploadStream = bucket.openUploadStream(fileName, {
      contentType: req.file.mimetype,
      metadata: {
        fileType: fileType,
        uploadDate: new Date()
      }
    });
    
    // 파일 업로드 Promise
    const fileId = await new Promise((resolve, reject) => {
      readableStream.pipe(uploadStream)
        .on('error', reject)
        .on('finish', () => {
          console.log(`파일 GridFS 업로드 완료: ${uploadStream.id}`);
          resolve(uploadStream.id);
        });
    });
    
    // Footer 문서 업데이트
    let footer = await Footer.findOne().sort({ updatedAt: -1 });
    
    if (!footer) {
      footer = new Footer({
        email: 'plp@snu.ac.kr'
      });
    }
    
    // 기존 파일이 있다면 GridFS에서 삭제
    if (fileType === 'wordFile' && footer.wordFileId) {
      try {
        const oldFileId = new mongoose.Types.ObjectId(footer.wordFileId);
        await bucket.delete(oldFileId);
        console.log(`기존 Word 파일 삭제됨: ${footer.wordFileId}`);
      } catch (err) {
        console.error('기존 파일 삭제 실패:', err);
      }
    } else if (fileType === 'hwpFile' && footer.hwpFileId) {
      try {
        const oldFileId = new mongoose.Types.ObjectId(footer.hwpFileId);
        await bucket.delete(oldFileId);
        console.log(`기존 HWP 파일 삭제됨: ${footer.hwpFileId}`);
      } catch (err) {
        console.error('기존 파일 삭제 실패:', err);
      }
    } else if (fileType === 'pdfFile' && footer.pdfFileId) {
      try {
        const oldFileId = new mongoose.Types.ObjectId(footer.pdfFileId);
        await bucket.delete(oldFileId);
        console.log(`기존 PDF 파일 삭제됨: ${footer.pdfFileId}`);
      } catch (err) {
        console.error('기존 파일 삭제 실패:', err);
      }
    }
    
    // 새 파일 ID와 파일명 저장
    if (fileType === 'wordFile') {
      footer.wordFileId = fileId;
      footer.wordFileName = fileName;
    } else if (fileType === 'hwpFile') {
      footer.hwpFileId = fileId;
      footer.hwpFileName = fileName;
    } else if (fileType === 'pdfFile') {
      footer.pdfFileId = fileId;
      footer.pdfFileName = fileName;
    }
    
    footer.updatedAt = new Date();
    await footer.save();
    
    console.log('Footer 업데이트 성공');
    
    res.json({
      message: '파일 업로드 성공',
      fileId: fileId,
      fileName: fileName,
      fileType: fileType,
      footer: {
        _id: footer._id,
        wordFileId: footer.wordFileId,
        wordFileName: footer.wordFileName,
        hwpFileId: footer.hwpFileId,
        hwpFileName: footer.hwpFileName,
        pdfFileId: footer.pdfFileId,
        pdfFileName: footer.pdfFileName,
        email: footer.email
      }
    });
  } catch (error) {
    console.error('파일 업로드 오류:', error);
    res.status(500).json({ message: 'Error uploading file', error: error.message });
  }
});

/**
 * @route   POST /api/footer
 * @desc    Update footer information (메타데이터만)
 * @access  Admin
 */
router.post('/', isAdmin, async (req, res) => {
  try {
    console.log('POST /api/footer - 요청 수신');
    console.log('요청 본문:', req.body);
    
    // MongoDB 연결 상태 확인
    if (mongoose.connection.readyState !== 1) {
      console.log('MongoDB 연결이 활성화되지 않았습니다.');
      return res.status(500).json({ message: 'Database connection is not active' });
    }
    
    const { 
      _id, 
      email, 
      companyName, 
      address, 
      contactPhone, 
      contactEmail, 
      copyrightYear 
    } = req.body;
    
    let footer;
    
    // _id가 있으면 해당 문서 업데이트, 없으면 새로 생성 또는 최근 문서 업데이트
    if (_id) {
      console.log(`ID ${_id}로 기존 Footer 문서 업데이트 시도`);
      
      footer = await Footer.findByIdAndUpdate(
        _id,
        {
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
      console.log('ID가 없으므로 최근 Footer 문서 찾기 또는 새로 생성');
      
      // 가장 최근의 footer 문서 조회
      const existingFooter = await Footer.findOne().sort({ updatedAt: -1 });
      
      if (existingFooter) {
        console.log('기존 Footer 문서 발견, 업데이트합니다:', existingFooter._id);
        
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
    
    console.log('Footer 저장 성공:', footer._id);
    
    // 메타데이터만 반환
    res.json({
      _id: footer._id,
      wordFileId: footer.wordFileId,
      wordFileName: footer.wordFileName,
      hwpFileId: footer.hwpFileId,
      hwpFileName: footer.hwpFileName,
      pdfFileId: footer.pdfFileId,
      pdfFileName: footer.pdfFileName,
      email: footer.email,
      companyName: footer.companyName,
      address: footer.address,
      contactPhone: footer.contactPhone,
      contactEmail: footer.contactEmail,
      copyrightYear: footer.copyrightYear,
      updatedAt: footer.updatedAt
    });
  } catch (error) {
    console.error('Footer 정보 저장 오류:', error);
    res.status(500).json({ message: 'Error saving footer information', error: error.message });
  }
});

/**
 * @route   PUT /api/footer
 * @desc    Footer 정보 업데이트 (메타데이터만)
 * @access  Admin
 */
router.put('/', isAdmin, async (req, res) => {
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
    
    const { _id, email, companyName, address, contactPhone, contactEmail, copyrightYear } = req.body;
    
    // req.body에서 _id 확인
    if (_id) {
      // 기존 문서 업데이트
      const updatedFooter = await Footer.findByIdAndUpdate(
        _id,
        { 
          email,
          companyName,
          address,
          contactPhone,
          contactEmail,
          copyrightYear,
          updatedAt: new Date()
        },
        { new: true }
      );
      
      if (!updatedFooter) {
        return res.status(404).json({ message: '지정된 ID의 문서를 찾을 수 없습니다.' });
      }
      
      console.log('Footer 정보 업데이트 성공 (PUT):', updatedFooter._id);
      
      // 메타데이터만 반환
      return res.json({
        _id: updatedFooter._id,
        wordFileId: updatedFooter.wordFileId,
        wordFileName: updatedFooter.wordFileName,
        hwpFileId: updatedFooter.hwpFileId,
        hwpFileName: updatedFooter.hwpFileName,
        pdfFileId: updatedFooter.pdfFileId,
        pdfFileName: updatedFooter.pdfFileName,
        email: updatedFooter.email,
        companyName: updatedFooter.companyName,
        address: updatedFooter.address,
        contactPhone: updatedFooter.contactPhone,
        contactEmail: updatedFooter.contactEmail,
        copyrightYear: updatedFooter.copyrightYear,
        updatedAt: updatedFooter.updatedAt
      });
    }
    
    // ID가 없는 경우 가장 최근 문서 찾아 업데이트
    const footerInfo = await Footer.findOne().sort({ createdAt: -1 });
    
    if (!footerInfo) {
      // 기존 문서가 없으면 새로 생성
      const newFooter = new Footer({
        email,
        companyName,
        address,
        contactPhone,
        contactEmail,
        copyrightYear,
        updatedAt: new Date()
      });
      
      const savedFooter = await newFooter.save();
      console.log('새 Footer 정보 생성 성공 (PUT):', savedFooter._id);
      
      // 메타데이터만 반환
      return res.json({
        _id: savedFooter._id,
        wordFileId: savedFooter.wordFileId,
        wordFileName: savedFooter.wordFileName,
        hwpFileId: savedFooter.hwpFileId,
        hwpFileName: savedFooter.hwpFileName,
        pdfFileId: savedFooter.pdfFileId,
        pdfFileName: savedFooter.pdfFileName,
        email: savedFooter.email,
        companyName: savedFooter.companyName,
        address: savedFooter.address,
        contactPhone: savedFooter.contactPhone,
        contactEmail: savedFooter.contactEmail,
        copyrightYear: savedFooter.copyrightYear,
        updatedAt: savedFooter.updatedAt
      });
    }
    
    // 기존 문서 업데이트
    const updatedFooter = await Footer.findByIdAndUpdate(
      footerInfo._id,
      { 
        email,
        companyName,
        address,
        contactPhone,
        contactEmail,
        copyrightYear,
        updatedAt: new Date()
      },
      { new: true }
    );
    
    console.log('Footer 정보 업데이트 성공 (PUT):', updatedFooter._id);
    
    // 메타데이터만 반환
    res.json({
      _id: updatedFooter._id,
      wordFileId: updatedFooter.wordFileId,
      wordFileName: updatedFooter.wordFileName,
      hwpFileId: updatedFooter.hwpFileId,
      hwpFileName: updatedFooter.hwpFileName,
      pdfFileId: updatedFooter.pdfFileId,
      pdfFileName: updatedFooter.pdfFileName,
      email: updatedFooter.email,
      companyName: updatedFooter.companyName,
      address: updatedFooter.address,
      contactPhone: updatedFooter.contactPhone,
      contactEmail: updatedFooter.contactEmail,
      copyrightYear: updatedFooter.copyrightYear,
      updatedAt: updatedFooter.updatedAt
    });
  } catch (error) {
    console.error('Footer 정보 업데이트 실패 (PUT):', error);
    res.status(500).json({ 
      message: '서버 오류가 발생했습니다.', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
    });
  }
});

/**
 * @route   GET /api/footer/download/:fileType
 * @desc    Download file from GridFS
 * @access  Public
 */
router.get('/download/:fileType', async (req, res) => {
  try {
    const { fileType } = req.params; // 'wordFile', 'hwpFile', 'pdfFile'
    
    console.log(`파일 다운로드 요청: ${fileType}`);
    
    // MongoDB 연결 상태 확인
    if (mongoose.connection.readyState !== 1) {
      console.log('MongoDB 연결이 활성화되지 않았습니다.');
      return res.status(500).json({ message: 'Database connection is not active' });
    }
    
    // Footer 문서 조회
    const footer = await Footer.findOne().sort({ updatedAt: -1 });
    
    if (!footer) {
      return res.status(404).json({ message: 'Footer 정보를 찾을 수 없습니다.' });
    }
    
    // 파일 ID 가져오기
    let fileId, fileName;
    if (fileType === 'wordFile') {
      fileId = footer.wordFileId;
      fileName = footer.wordFileName || '입학지원서.docx';
    } else if (fileType === 'hwpFile') {
      fileId = footer.hwpFileId;
      fileName = footer.hwpFileName || '입학지원서.hwp';
    } else if (fileType === 'pdfFile') {
      fileId = footer.pdfFileId;
      fileName = footer.pdfFileName || '과정안내서.pdf';
    } else {
      return res.status(400).json({ message: '유효하지 않은 파일 타입입니다.' });
    }
    
    if (!fileId) {
      return res.status(404).json({ message: '파일이 존재하지 않습니다.' });
    }
    
    // GridFS 버킷 생성
    const bucket = new GridFSBucket(mongoose.connection.db, {
      bucketName: 'footerFiles'
    });
    
    // ObjectId로 변환
    let objectId;
    try {
      objectId = new mongoose.Types.ObjectId(fileId);
    } catch (error) {
      console.error('유효하지 않은 파일 ID:', fileId);
      return res.status(400).json({ message: '유효하지 않은 파일 ID입니다.' });
    }
    
    // 파일 정보 조회
    const files = await bucket.find({ _id: objectId }).toArray();
    
    if (!files || files.length === 0) {
      return res.status(404).json({ message: 'GridFS에서 파일을 찾을 수 없습니다.' });
    }
    
    const file = files[0];
    
    console.log(`파일 다운로드 시작: ${fileName} (ID: ${fileId})`);
    
    // RFC 6266에 따른 한글 파일명 처리
    // HTTP 헤더는 ASCII만 허용하므로 filename*만 사용
    const encodedFileName = encodeURIComponent(fileName);
    const contentDisposition = `attachment; filename*=UTF-8''${encodedFileName}`;
    
    // 응답 헤더 설정
    res.set({
      'Content-Type': file.contentType || 'application/octet-stream',
      'Content-Disposition': contentDisposition,
      'Content-Length': file.length
    });
    
    // GridFS에서 파일 스트리밍
    const downloadStream = bucket.openDownloadStream(objectId);
    
    downloadStream.on('error', (error) => {
      console.error('파일 다운로드 스트림 오류:', error);
      if (!res.headersSent) {
        res.status(500).json({ message: 'Error downloading file', error: error.message });
      }
    });
    
    downloadStream.pipe(res);
  } catch (error) {
    console.error('파일 다운로드 오류:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Error downloading file', error: error.message });
    }
  }
});

/**
 * @route   DELETE /api/footer/delete/:fileType
 * @desc    Delete file from GridFS and update footer
 * @access  Admin
 */
router.delete('/delete/:fileType', isAdmin, async (req, res) => {
  try {
    const { fileType } = req.params; // 'wordFile', 'hwpFile', 'pdfFile'
    
    console.log(`파일 삭제 요청: ${fileType}`);
    
    // MongoDB 연결 상태 확인
    if (mongoose.connection.readyState !== 1) {
      console.log('MongoDB 연결이 활성화되지 않았습니다.');
      return res.status(500).json({ message: 'Database connection is not active' });
    }
    
    // Footer 문서 조회
    const footer = await Footer.findOne().sort({ updatedAt: -1 });
    
    if (!footer) {
      return res.status(404).json({ message: 'Footer 정보를 찾을 수 없습니다.' });
    }
    
    // 파일 ID 가져오기
    let fileId;
    if (fileType === 'wordFile') {
      fileId = footer.wordFileId;
    } else if (fileType === 'hwpFile') {
      fileId = footer.hwpFileId;
    } else if (fileType === 'pdfFile') {
      fileId = footer.pdfFileId;
    } else {
      return res.status(400).json({ message: '유효하지 않은 파일 타입입니다.' });
    }
    
    if (!fileId) {
      return res.status(404).json({ message: '삭제할 파일이 존재하지 않습니다.' });
    }
    
    // GridFS 버킷 생성
    const bucket = new GridFSBucket(mongoose.connection.db, {
      bucketName: 'footerFiles'
    });
    
    // ObjectId로 변환
    let objectId;
    try {
      objectId = new mongoose.Types.ObjectId(fileId);
    } catch (error) {
      console.error('유효하지 않은 파일 ID:', fileId);
      return res.status(400).json({ message: '유효하지 않은 파일 ID입니다.' });
    }
    
    // GridFS에서 파일 삭제
    try {
      await bucket.delete(objectId);
      console.log(`파일 삭제 완료: ${fileId}`);
    } catch (err) {
      console.error('GridFS 파일 삭제 실패:', err);
      return res.status(500).json({ message: 'GridFS에서 파일 삭제 중 오류가 발생했습니다.' });
    }
    
    // Footer 문서에서 파일 정보 제거
    if (fileType === 'wordFile') {
      footer.wordFileId = null;
      footer.wordFileName = '';
    } else if (fileType === 'hwpFile') {
      footer.hwpFileId = null;
      footer.hwpFileName = '';
    } else if (fileType === 'pdfFile') {
      footer.pdfFileId = null;
      footer.pdfFileName = '';
    }
    
    footer.updatedAt = new Date();
    await footer.save();
    
    console.log('Footer 업데이트 성공 (파일 정보 제거)');
    
    res.json({
      message: '파일 삭제 성공',
      fileType: fileType,
      footer: {
        _id: footer._id,
        wordFileId: footer.wordFileId,
        wordFileName: footer.wordFileName,
        hwpFileId: footer.hwpFileId,
        hwpFileName: footer.hwpFileName,
        pdfFileId: footer.pdfFileId,
        pdfFileName: footer.pdfFileName,
        email: footer.email
      }
    });
  } catch (error) {
    console.error('파일 삭제 오류:', error);
    res.status(500).json({ message: 'Error deleting file', error: error.message });
  }
});

module.exports = router; 