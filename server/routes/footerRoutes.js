const express = require('express');
const { isAdmin } = require('../middleware/authMiddleware');
const router = express.Router();

// 기본 정보 객체
const footerInfo = {
  companyName: '서울대학교 정치리더스과정',
  address: '서울시 관악구 관악로 1 서울대학교 사회과학대학',
  contactPhone: '02-880-xxxx',
  contactEmail: 'plp@snu.ac.kr',
  copyrightYear: '2025',
  siteLinks: [
    { title: '홈페이지', url: '/' },
    { title: '소개', url: '/intro' },
    { title: '교육일정', url: '/schedule' },
    { title: '갤러리', url: '/gallery' },
    { title: '공지사항', url: '/notices' }
  ],
  socialLinks: [
    { platform: 'facebook', url: 'https://facebook.com' },
    { platform: 'instagram', url: 'https://instagram.com' }
  ]
};

/**
 * @route   GET /api/footer
 * @desc    Footer 정보 가져오기
 * @access  Public
 */
router.get('/', (req, res) => {
  try {
    res.json(footerInfo);
  } catch (error) {
    console.error('Footer 정보 조회 실패:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

/**
 * @route   PUT /api/footer
 * @desc    Footer 정보 업데이트
 * @access  Private (Admin)
 */
router.put('/', isAdmin, (req, res) => {
  try {
    // 실제 구현에서는 데이터베이스 업데이트 로직이 필요합니다
    // 여기서는 간단한 예시로 제공
    const updatedInfo = { ...footerInfo, ...req.body };
    res.json(updatedInfo);
  } catch (error) {
    console.error('Footer 정보 업데이트 실패:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

module.exports = router; 