const express = require('express');
const router = express.Router();
const { isAdmin } = require('../middleware/authMiddleware');

// 기본 콘텐츠 라우트
router.get('/', (req, res) => {
  res.json({ message: '콘텐츠 API 엔드포인트' });
});

module.exports = router; 