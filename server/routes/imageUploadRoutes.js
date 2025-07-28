const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const imageOptimizer = require('../middleware/imageOptimization');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

// 이미지 업로드 디렉토리 설정
const uploadDir = path.join(__dirname, '../uploads/images');

// 업로드 디렉토리가 없는 경우 생성
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('이미지 업로드 디렉토리 생성됨:', uploadDir);
}

// 이미지 파일 업로드 설정
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

// 이미지 파일 타입 필터링
const imageFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp'
  ];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('지원되지 않는 이미지 형식입니다. JPEG, PNG, GIF, WebP 이미지만 업로드 가능합니다.'), false);
  }
};

// 이미지 업로드 미들웨어 설정
const uploadImage = multer({
  storage: storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB 크기 제한 (원본, 최적화 후 작아짐)
    files: 10 // 최대 10개 파일 동시 업로드
  }
});

/**
 * @route   POST /api/images/upload
 * @desc    단일 이미지 업로드 및 최적화
 * @access  Protected
 */
router.post('/upload', uploadImage.single('image'), imageOptimizer.processUploadedImage(), async (req, res) => {
  try {
    console.log('이미지 업로드 요청 수신:', req.file?.originalname);
    
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        message: '업로드할 이미지가 없습니다.' 
      });
    }
    
    // 업로드된 이미지의 기본 URL 생성
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://snu-plp-hub-server.onrender.com/uploads/images'
      : `http://localhost:${process.env.PORT || 5001}/uploads/images`;
    
    let responseData = {
      success: true,
      message: '이미지 업로드 성공',
      originalName: req.file.originalname,
      fileName: req.file.filename,
      size: req.file.size,
      url: `${baseUrl}/${req.file.filename}`,
      uploadedAt: new Date().toISOString()
    };

    // 이미지 최적화가 완료된 경우
    if (req.file.optimized && req.optimizedImages) {
      const imageResponse = imageOptimizer.formatImageResponse(
        req.optimizedImages,
        baseUrl,
        req.file.originalname
      );
      
      responseData = {
        ...responseData,
        optimized: true,
        images: imageResponse
      };
      
      console.log(`🎉 이미지 최적화 완료: ${Object.keys(req.optimizedImages).length}개 크기 생성`);
    }
    
    res.status(200).json(responseData);
    
  } catch (error) {
    console.error('이미지 업로드 실패:', error);
    res.status(500).json({ 
      success: false,
      message: '이미지 업로드 중 오류가 발생했습니다.',
      error: error.message 
    });
  }
});

/**
 * @route   POST /api/images/upload/multiple
 * @desc    다중 이미지 업로드 및 최적화
 * @access  Protected
 */
router.post('/upload/multiple', uploadImage.array('images', 10), async (req, res) => {
  try {
    console.log(`다중 이미지 업로드 요청: ${req.files?.length || 0}개 파일`);
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: '업로드할 이미지가 없습니다.' 
      });
    }
    
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://snu-plp-hub-server.onrender.com/uploads/images'
      : `http://localhost:${process.env.PORT || 5001}/uploads/images`;
    
    const results = [];
    
    // 각 파일을 순차적으로 최적화 처리
    for (const file of req.files) {
      try {
        if (imageOptimizer.isImage(file.filename)) {
          const optimizedImages = await imageOptimizer.optimizeImage(
            file.path,
            path.dirname(file.path),
            file.originalname
          );
          
          const imageResponse = imageOptimizer.formatImageResponse(
            optimizedImages,
            baseUrl,
            file.originalname
          );
          
          results.push({
            success: true,
            originalName: file.originalname,
            optimized: true,
            images: imageResponse
          });
          
        } else {
          results.push({
            success: true,
            originalName: file.originalname,
            fileName: file.filename,
            url: `${baseUrl}/${file.filename}`,
            optimized: false
          });
        }
      } catch (error) {
        console.error(`파일 처리 실패 ${file.originalname}:`, error);
        results.push({
          success: false,
          originalName: file.originalname,
          error: error.message
        });
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    
    res.status(200).json({
      success: true,
      message: `${successCount}/${req.files.length}개 이미지 처리 완료`,
      results: results,
      uploadedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('다중 이미지 업로드 실패:', error);
    res.status(500).json({ 
      success: false,
      message: '다중 이미지 업로드 중 오류가 발생했습니다.',
      error: error.message 
    });
  }
});

/**
 * @route   GET /api/images
 * @desc    업로드된 이미지 목록 조회
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const files = await fs.promises.readdir(uploadDir);
    
    // 이미지 파일만 필터링
    const imageFiles = files.filter(file => 
      imageOptimizer.isImage(file) && !file.startsWith('.')
    );
    
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://snu-plp-hub-server.onrender.com/uploads/images'
      : `http://localhost:${process.env.PORT || 5001}/uploads/images`;
    
    const imageList = await Promise.all(
      imageFiles.map(async (file) => {
        try {
          const filePath = path.join(uploadDir, file);
          const stats = await fs.promises.stat(filePath);
          
          return {
            filename: file,
            url: `${baseUrl}/${file}`,
            size: stats.size,
            createdAt: stats.birthtime,
            lastModified: stats.mtime
          };
        } catch (error) {
          console.error(`파일 정보 읽기 오류 (${file}):`, error);
          return null;
        }
      })
    );
    
    const validImages = imageList.filter(img => img !== null);
    
    res.json({
      success: true,
      message: '이미지 목록 조회 성공',
      count: validImages.length,
      images: validImages
    });
    
  } catch (error) {
    console.error('이미지 목록 조회 실패:', error);
    res.status(500).json({ 
      success: false,
      message: '이미지 목록을 조회하는 중 오류가 발생했습니다.', 
      error: error.message 
    });
  }
});

/**
 * @route   DELETE /api/images/:filename
 * @desc    이미지 파일 삭제
 * @access  Protected
 */
router.delete('/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(uploadDir, filename);
    
    // 파일 존재 확인
    try {
      await fs.promises.access(filePath);
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: '파일을 찾을 수 없습니다.'
      });
    }
    
    // 파일 삭제
    await fs.promises.unlink(filePath);
    
    // 관련된 최적화된 이미지들도 삭제 (같은 base name을 가진 파일들)
    const baseName = path.parse(filename).name.split('_')[0];
    const allFiles = await fs.promises.readdir(uploadDir);
    const relatedFiles = allFiles.filter(file => file.startsWith(baseName + '_'));
    
    for (const relatedFile of relatedFiles) {
      try {
        await fs.promises.unlink(path.join(uploadDir, relatedFile));
        console.log(`🗑️ 관련 파일 삭제: ${relatedFile}`);
      } catch (error) {
        console.warn(`⚠️ 관련 파일 삭제 실패: ${relatedFile}`, error.message);
      }
    }
    
    res.json({
      success: true,
      message: '이미지가 성공적으로 삭제되었습니다.',
      deletedFile: filename,
      relatedFilesDeleted: relatedFiles.length
    });
    
  } catch (error) {
    console.error('이미지 삭제 실패:', error);
    res.status(500).json({
      success: false,
      message: '이미지 삭제 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

module.exports = router; 