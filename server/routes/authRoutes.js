const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');

// 관리자 로그인 라우트
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // 개발 모드에서는 항상 로그인 성공
    if (process.env.NODE_ENV === 'development') {
      const token = jwt.sign({ 
        id: 'admin123', 
        email: email || 'admin@example.com',
        isAdmin: true 
      }, process.env.JWT_SECRET || 'your_jwt_secret_key', { expiresIn: '1d' });
      
      return res.json({ 
        token,
        user: {
          email: email || 'admin@example.com',
          isAdmin: true
        }
      });
    }
    
    // 프로덕션 모드에서는 실제 사용자 검증
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ message: '이메일 또는 비밀번호가 일치하지 않습니다.' });
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: '이메일 또는 비밀번호가 일치하지 않습니다.' });
    }
    
    const token = jwt.sign({ 
      id: user._id, 
      email: user.email,
      isAdmin: user.isAdmin 
    }, process.env.JWT_SECRET, { expiresIn: '1d' });
    
    res.json({ 
      token,
      user: {
        email: user.email,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    console.error('로그인 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 관리자 계정 생성 (개발용)
router.post('/register', async (req, res) => {
  try {
    if (process.env.NODE_ENV !== 'development') {
      return res.status(403).json({ message: '개발 모드에서만 사용 가능한 기능입니다.' });
    }
    
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: '이메일과 비밀번호를 모두 입력해주세요.' });
    }
    
    // 아직 User 모델이 없으면 임시 응답 반환
    if (!User) {
      return res.status(201).json({ 
        message: '개발 모드: 관리자 계정이 생성됐다고 가정합니다.',
        user: {
          email,
          isAdmin: true
        }
      });
    }
    
    // 기존 사용자 확인
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: '이미 사용 중인 이메일입니다.' });
    }
    
    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 사용자 생성
    const newUser = new User({
      email,
      password: hashedPassword,
      isAdmin: true
    });
    
    await newUser.save();
    
    res.status(201).json({ 
      message: '관리자 계정이 성공적으로 생성되었습니다.',
      user: {
        email: newUser.email,
        isAdmin: newUser.isAdmin
      }
    });
  } catch (error) {
    console.error('회원가입 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 토큰 인증 테스트 라우트
router.get('/verify', (req, res) => {
  // 개발 모드에서는 항상 성공
  if (process.env.NODE_ENV === 'development') {
    return res.json({ 
      authenticated: true,
      message: '개발 모드: 인증이 유효합니다.'
    });
  }
  
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ authenticated: false, message: '인증 토큰이 필요합니다.' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ authenticated: false, message: '유효하지 않은 토큰입니다.' });
    }
    
    res.json({ 
      authenticated: true,
      user: {
        email: user.email,
        isAdmin: user.isAdmin
      },
      message: '인증이 유효합니다.'
    });
  });
});

module.exports = router; 