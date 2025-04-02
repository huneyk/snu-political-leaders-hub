import express from 'express';
import Footer from '../models/Footer.js';
import { authenticateToken } from '../middleware/auth.js';

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
    console.log('Footer 업데이트 요청 데이터:', req.body);
    
    const { 
      _id, wordFile, wordFileName, hwpFile, hwpFileName, 
      pdfFile, pdfFileName, email, // 파일 이름 필드도 명시적으로 추출
      // 기타 필드...
    } = req.body;
    
    let footer;
    
    // _id가 있으면 업데이트, 없으면 새로 생성
    if (_id) {
      console.log('기존 문서 업데이트', _id);
      footer = await Footer.findByIdAndUpdate(
        _id,
        {
          wordFile,
          wordFileName, // 명시적으로 파일명 필드 포함
          hwpFile,
          hwpFileName, // 명시적으로 파일명 필드 포함
          pdfFile,
          pdfFileName, // 명시적으로 파일명 필드 포함
          email,
          // 기타 필드...
          updatedAt: new Date()
        },
        { new: true }
      );
    } else {
      console.log('새 문서 생성');
      footer = new Footer({
        wordFile,
        wordFileName, // 명시적으로 파일명 필드 포함
        hwpFile,
        hwpFileName, // 명시적으로 파일명 필드 포함
        pdfFile,
        pdfFileName, // 명시적으로 파일명 필드 포함
        email,
        // 기타 필드...
      });
      
      await footer.save();
    }
    
    console.log('저장된 문서:', {
      id: footer._id,
      wordFileName: footer.wordFileName,
      hwpFileName: footer.hwpFileName,
      pdfFileName: footer.pdfFileName
    });
    
    res.json(footer);
  } catch (error) {
    console.error('Footer 저장 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router; 