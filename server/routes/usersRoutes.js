const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');

// 기본 사용자 라우트
router.get('/', isAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error('사용자 조회 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

module.exports = router; 