const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Footer = require('../models/Footer');
const mongoose = require('mongoose');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

// 업로드 디렉토리 설정
const uploadDir = path.join(__dirname, '../uploads');

// 업로드 디렉토리가 없는 경우 생성
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 파일 확장자에 따른 MIME 타입 맵핑
const mimeTypes = {
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.hwp': 'application/x-hwp'
};

// 파일 업로드 설정
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // 원본 파일 이름에서 확장자 추출
    const fileExt = path.extname(file.originalname).toLowerCase();
    
    // 파일 이름 생성: 원본이름_타임스탬프.확장자
    const uniqueFileName = `${path.basename(file.originalname, fileExt)}_${Date.now()}${fileExt}`;
    
    cb(null, uniqueFileName);
  }
});

// 허용된 파일 타입 필터링
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.pdf', '.doc', '.docx', '.hwp'];
  const fileExt = path.extname(file.originalname).toLowerCase();
  
  if (allowedExtensions.includes(fileExt)) {
    cb(null, true);
  } else {
    cb(new Error('지원되지 않는 파일 형식입니다. PDF, DOC, DOCX, HWP 파일만 업로드 가능합니다.'), false);
  }
};

// 업로드 미들웨어 설정
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB 크기 제한
  }
});

/**
 * @route   POST /api/upload
 * @desc    파일 업로드 처리 및 MongoDB Footer 컬렉션 업데이트
 * @access  Private (admin)
 */
router.post('/', upload.single('file'), async (req, res) => {
  try {
    console.log('파일 업로드 요청 수신:', req.file?.originalname);
    
    if (!req.file) {
      return res.status(400).json({ message: '업로드할 파일이 없습니다.' });
    }
    
    // 업로드된 파일의 URL 생성
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://snu-plp-hub-server.onrender.com'
      : `http://localhost:${process.env.PORT || 5001}`;
    
    const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;
    
    // 파일 타입 식별
    const fileType = req.body.fileType || determineFileType(req.file.originalname);
    let updateData = {};
    
    // DB에 저장할 필드 결정
    if (fileType === 'wordFile') {
      updateData.wordFile = fileUrl;
    } else if (fileType === 'hwpFile') {
      updateData.hwpFile = fileUrl;
    } else if (fileType === 'pdfFile') {
      updateData.pdfFile = fileUrl;
    }
    
    // MongoDB 연결 상태 확인
    if (mongoose.connection.readyState !== 1) {
      console.log('MongoDB 연결이 활성화되지 않았습니다.');
      return res.status(200).json({
        message: '파일은 업로드되었으나 데이터베이스에 저장되지 않았습니다. (연결 오류)',
        filename: req.file.filename,
        originalname: req.file.originalname,
        fileUrl: fileUrl,
        size: req.file.size
      });
    }
    
    // Footer 컬렉션의 가장 최근 문서 조회
    const existingFooter = await Footer.findOne().sort({ updatedAt: -1 });
    
    if (existingFooter) {
      // 기존 Footer 문서 업데이트
      console.log(`기존 Footer 문서(${existingFooter._id}) 업데이트: ${fileType} = ${fileUrl}`);
      
      // 업데이트할 필드 설정
      existingFooter[fileType] = fileUrl;
      existingFooter.updatedAt = new Date();
      
      // 저장
      await existingFooter.save();
      
      console.log('Footer 문서 업데이트 성공:', existingFooter);
      
      // 응답
      res.json({
        message: '파일 업로드 성공 및 Footer 정보 업데이트 완료',
        filename: req.file.filename,
        originalname: req.file.originalname,
        fileUrl: fileUrl,
        size: req.file.size,
        footerId: existingFooter._id,
        fileType: fileType
      });
    } else {
      // Footer 문서가 없는 경우 새로 생성
      console.log('Footer 문서 없음, 새로 생성합니다.');
      
      const newFooter = new Footer({
        email: 'plp@snu.ac.kr', // 기본 이메일
        ...updateData, // 파일 URL 포함
      });
      
      const savedFooter = await newFooter.save();
      
      console.log('새 Footer 문서 생성 성공:', savedFooter);
      
      // 응답
      res.json({
        message: '파일 업로드 성공 및 새 Footer 문서 생성 완료',
        filename: req.file.filename,
        originalname: req.file.originalname,
        fileUrl: fileUrl,
        size: req.file.size,
        footerId: savedFooter._id,
        fileType: fileType
      });
    }
  } catch (error) {
    console.error('파일 업로드 처리 실패:', error);
    res.status(500).json({ 
      message: '파일 업로드 중 오류가 발생했습니다.', 
      error: error.message 
    });
  }
});

/**
 * @route   GET /api/upload/files
 * @desc    업로드된 파일 목록 조회
 * @access  Private (admin)
 */
router.get('/files', async (req, res) => {
  try {
    // 업로드 디렉토리 파일 목록 읽기
    fs.readdir(uploadDir, (err, files) => {
      if (err) {
        console.error('업로드 디렉토리 읽기 오류:', err);
        return res.status(500).json({ message: '파일 목록을 불러오는데 실패했습니다.' });
      }
      
      // 디렉토리 자체나 숨김 파일은 제외
      const fileList = files.filter(file => !file.startsWith('.') && file !== 'README.md');
      
      // 파일 정보 구성
      const fileDetails = fileList.map(file => {
        const filePath = path.join(uploadDir, file);
        try {
          const stats = fs.statSync(filePath);
          const fileExt = path.extname(file).toLowerCase();
          
          // 파일 URL 생성
          const baseUrl = process.env.NODE_ENV === 'production' 
            ? 'https://snu-plp-hub-server.onrender.com'
            : `http://localhost:${process.env.PORT || 5001}`;
          
          const fileUrl = `${baseUrl}/uploads/${file}`;
          
          return {
            filename: file,
            size: stats.size,
            createdAt: stats.birthtime,
            lastModified: stats.mtime,
            mimetype: mimeTypes[fileExt] || 'application/octet-stream',
            url: fileUrl
          };
        } catch (statErr) {
          console.error(`파일 정보 읽기 오류 (${file}):`, statErr);
          return {
            filename: file,
            error: '파일 정보를 읽을 수 없습니다.'
          };
        }
      });
      
      res.json({
        message: '파일 목록 조회 성공',
        files: fileDetails
      });
    });
  } catch (error) {
    console.error('파일 목록 조회 실패:', error);
    res.status(500).json({ 
      message: '파일 목록을 조회하는 중 오류가 발생했습니다.', 
      error: error.message 
    });
  }
});

/**
 * @route   DELETE /api/upload/:filename
 * @desc    파일 삭제
 * @access  Private (admin)
 */
router.delete('/:filename', async (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(uploadDir, filename);
    
    // 파일 존재 여부 확인
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: '삭제할 파일을 찾을 수 없습니다.' });
    }
    
    // 파일 정보 확인 (삭제 전에 URL 조회)
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://snu-plp-hub-server.onrender.com'
      : `http://localhost:${process.env.PORT || 5001}`;
    
    const fileUrl = `${baseUrl}/uploads/${filename}`;
    
    // Footer 컬렉션에서 해당 파일 URL을 사용하는 문서 확인
    const existingFooter = await Footer.findOne({
      $or: [
        { wordFile: fileUrl },
        { hwpFile: fileUrl },
        { pdfFile: fileUrl }
      ]
    });
    
    // 파일 삭제
    fs.unlinkSync(filePath);
    
    // Footer 문서도 업데이트 (파일 URL 제거)
    if (existingFooter) {
      if (existingFooter.wordFile === fileUrl) {
        existingFooter.wordFile = '';
      }
      if (existingFooter.hwpFile === fileUrl) {
        existingFooter.hwpFile = '';
      }
      if (existingFooter.pdfFile === fileUrl) {
        existingFooter.pdfFile = '';
      }
      
      existingFooter.updatedAt = new Date();
      await existingFooter.save();
      
      console.log('Footer 문서에서 파일 URL 제거됨:', filename);
    }
    
    res.json({
      message: '파일이 성공적으로 삭제되었습니다.',
      filename: filename,
      footerUpdated: !!existingFooter
    });
  } catch (error) {
    console.error('파일 삭제 실패:', error);
    res.status(500).json({ 
      message: '파일을 삭제하는 중 오류가 발생했습니다.', 
      error: error.message 
    });
  }
});

// 파일 타입 결정 (확장자 기반)
function determineFileType(filename) {
  const ext = path.extname(filename).toLowerCase();
  
  if (ext === '.docx' || ext === '.doc') {
    return 'wordFile';
  } else if (ext === '.hwp') {
    return 'hwpFile';
  } else if (ext === '.pdf') {
    return 'pdfFile';
  }
  
  // 기본값
  return 'otherFile';
}

module.exports = router; 