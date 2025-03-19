import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   POST /api/auth/login
 * @desc    사용자 로그인 및 토큰 발급
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // 필수 필드 유효성 검사
    if (!email || !password) {
      return res.status(400).json({ message: '이메일과 비밀번호를 입력하세요.' });
    }
    
    // 사용자 찾기
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: '이메일 또는 비밀번호가 일치하지 않습니다.' });
    }
    
    // 비밀번호 검증
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: '이메일 또는 비밀번호가 일치하지 않습니다.' });
    }
    
    // JWT 토큰 생성
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    // 사용자 정보에서 비밀번호 제외
    const userResponse = {
      _id: user._id,
      email: user.email,
      name: user.name,
      role: user.role
    };
    
    res.json({
      message: '로그인 성공',
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('로그인 실패:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    현재 로그인된 사용자 정보 조회
 * @access  Private
 */
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('사용자 정보 조회 실패:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

/**
 * @route   POST /api/auth/register
 * @desc    신규 사용자 등록 (관리자만 가능)
 * @access  Private/Admin
 */
router.post('/register', authenticateToken, async (req, res) => {
  try {
    // 관리자 권한 확인
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: '권한이 없습니다.' });
    }
    
    const { email, password, name, role } = req.body;
    
    // 필수 필드 유효성 검사
    if (!email || !password || !name) {
      return res.status(400).json({ message: '이메일, 비밀번호, 이름은 필수 항목입니다.' });
    }
    
    // 이메일 중복 확인
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: '이미 등록된 이메일입니다.' });
    }
    
    // 신규 사용자 생성
    const newUser = new User({
      email,
      password,
      name,
      role: role || 'user'
    });
    
    await newUser.save();
    
    res.status(201).json({
      message: '사용자가 성공적으로 등록되었습니다.',
      user: {
        _id: newUser._id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('사용자 등록 실패:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

export default router; 