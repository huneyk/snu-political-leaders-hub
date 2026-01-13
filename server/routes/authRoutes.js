const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');

// ============================================
// CWE-798: JWT 시크릿 키 보안 강화
// ============================================
const JWT_SECRET = process.env.JWT_SECRET;

// 프로덕션 환경에서 JWT_SECRET 필수 검증
if (process.env.NODE_ENV === 'production' && !JWT_SECRET) {
  throw new Error('[CWE-798] JWT_SECRET 환경변수가 설정되지 않았습니다.');
}

// 개발 환경에서만 기본값 사용 (경고 출력)
const getJWTSecret = () => {
  if (JWT_SECRET) return JWT_SECRET;
  if (process.env.NODE_ENV !== 'production') {
    console.warn('⚠️ [CWE-798] JWT_SECRET이 설정되지 않아 개발용 기본값을 사용합니다.');
    return 'dev_only_secret_key_change_in_production';
  }
  throw new Error('[CWE-798] JWT_SECRET 환경변수가 필요합니다.');
};

// ============================================
// 환경변수 기반 관리자 계정 설정
// ============================================
const getEnvAdminCredentials = () => {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  
  if (adminEmail && adminPassword) {
    return { email: adminEmail.toLowerCase().trim(), password: adminPassword };
  }
  return null;
};

// 환경변수 관리자 계정 검증 함수
const validateEnvAdmin = async (email, password) => {
  const envAdmin = getEnvAdminCredentials();
  
  if (!envAdmin) {
    return null; // 환경변수에 관리자 계정이 설정되지 않음
  }
  
  // 이메일 비교 (대소문자 무시)
  if (email.toLowerCase().trim() !== envAdmin.email) {
    return null;
  }
  
  // 비밀번호 비교
  if (password !== envAdmin.password) {
    return null;
  }
  
  // 환경변수 관리자 계정 인증 성공
  return {
    id: 'env-admin',
    email: envAdmin.email,
    isAdmin: true,
    role: 'admin',
    source: 'env'
  };
};

// ============================================
// CWE-307: 로그인 Rate Limiting (Brute Force 방지)
// ============================================
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 5, // 15분당 최대 5번 로그인 시도
  message: {
    success: false,
    message: '로그인 시도 횟수가 초과되었습니다. 15분 후에 다시 시도해주세요.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // 성공한 요청은 카운트에서 제외
  handler: (req, res, next, options) => {
    console.warn(`🚨 [CWE-307] 로그인 시도 횟수 초과 - IP: ${req.ip}, Email: ${req.body?.email || 'unknown'}`);
    res.status(429).json(options.message);
  }
});

// 입력값 검증 함수
const validateLoginInput = (email, password) => {
  const errors = [];
  
  // 이메일 형식 검증
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || typeof email !== 'string' || !emailRegex.test(email)) {
    errors.push('유효한 이메일 주소를 입력해주세요.');
  }
  
  // 비밀번호 검증
  if (!password || typeof password !== 'string' || password.length < 1) {
    errors.push('비밀번호를 입력해주세요.');
  }
  
  // 입력값 길이 제한 (CWE-20: Improper Input Validation)
  if (email && email.length > 100) {
    errors.push('이메일이 너무 깁니다.');
  }
  if (password && password.length > 100) {
    errors.push('비밀번호가 너무 깁니다.');
  }
  
  return errors;
};

// 관리자 로그인 라우트 (POST) - CWE-307 Rate Limiting 적용
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // 로그인 시도 로깅 (비밀번호 제외)
    console.log('로그인 요청:', { 
      email: email ? email.substring(0, 3) + '***' : 'undefined',
      ip: req.ip,
      timestamp: new Date().toISOString()
    });
    
    // CWE-20: 입력값 검증
    const validationErrors = validateLoginInput(email, password);
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        success: false,
        message: validationErrors[0] // 첫 번째 에러만 반환 (정보 노출 최소화)
      });
    }
    
    // 이메일 정규화 (소문자 변환, 공백 제거)
    const normalizedEmail = email.toLowerCase().trim();
    
    // 1단계: 환경변수 관리자 계정 확인 (.env의 ADMIN_EMAIL, ADMIN_PASSWORD)
    const envAdminUser = await validateEnvAdmin(normalizedEmail, password);
    
    if (envAdminUser) {
      // 환경변수 관리자 로그인 성공
      const token = jwt.sign({ 
        id: envAdminUser.id, 
        email: envAdminUser.email,
        isAdmin: true,
        role: 'admin',
        source: 'env',
        iat: Math.floor(Date.now() / 1000)
      }, getJWTSecret(), { 
        expiresIn: '8h',
        issuer: 'snu-plp-server'
      });
      
      console.log(`✅ 환경변수 관리자 로그인 성공 - Email: ${normalizedEmail.substring(0, 3)}***, IP: ${req.ip}`);
      
      return res.json({ 
        success: true,
        message: '로그인 성공',
        token,
        user: {
          email: envAdminUser.email,
          isAdmin: true,
          role: 'admin'
        }
      });
    }
    
    // 2단계: MongoDB 사용자 확인
    const user = await User.findOne({ email: normalizedEmail });
    
    // CWE-209: 사용자 존재 여부를 노출하지 않음 (일관된 응답)
    if (!user) {
      // 타이밍 공격 방지를 위한 더미 비밀번호 비교
      await bcrypt.compare(password, '$2a$10$dummyhashfortiminattackprevention');
      return res.status(401).json({ 
        success: false,
        message: '이메일 또는 비밀번호가 일치하지 않습니다.' 
      });
    }
    
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      console.warn(`🚨 [CWE-307] 로그인 실패 - Email: ${normalizedEmail.substring(0, 3)}***, IP: ${req.ip}`);
      return res.status(401).json({ 
        success: false,
        message: '이메일 또는 비밀번호가 일치하지 않습니다.' 
      });
    }
    
    // role 또는 isAdmin 필드를 확인하여 관리자 권한 결정
    const isAdmin = user.role === 'admin' || user.isAdmin === true;
    
    if (!isAdmin) {
      return res.status(403).json({ 
        success: false,
        message: '관리자 권한이 필요합니다.' 
      });
    }
    
    // CWE-613: 세션 만료 시간 단축 (8시간)
    const token = jwt.sign({ 
      id: user._id, 
      email: user.email,
      isAdmin: isAdmin,
      role: user.role || 'admin',
      source: 'db',
      iat: Math.floor(Date.now() / 1000)
    }, getJWTSecret(), { 
      expiresIn: '8h',
      issuer: 'snu-plp-server'
    });
    
    console.log(`✅ DB 관리자 로그인 성공 - Email: ${normalizedEmail.substring(0, 3)}***, IP: ${req.ip}`);
    
    res.json({ 
      success: true,
      message: '로그인 성공',
      token,
      user: {
        email: user.email,
        isAdmin: isAdmin,
        role: user.role || 'admin'
      }
    });
  } catch (error) {
    console.error('로그인 오류:', error);
    // CWE-209: 에러 상세 정보 노출 방지
    res.status(500).json({ 
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

// GET 요청에 대한 정보 응답 (CWE-798: 하드코딩된 credentials 제거)
router.get('/login', (req, res) => {
  res.json({
    message: 'Login API Information',
    method: 'POST',
    endpoint: '/api/auth/login',
    body: {
      email: 'string (required)',
      password: 'string (required)'
    },
    note: 'This endpoint requires POST method for login'
  });
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
      success: true,
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

// 토큰 인증 테스트 라우트 - CWE-287: 항상 실제 토큰 검증 수행
router.get('/verify', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ authenticated: false, message: '인증 토큰이 필요합니다.' });
  }
  
  try {
    const decoded = jwt.verify(token, getJWTSecret(), {
      issuer: 'snu-plp-server'
    });
    
    res.json({ 
      success: true,
      authenticated: true,
      user: {
        email: decoded.email,
        isAdmin: decoded.isAdmin
      },
      message: '인증이 유효합니다.'
    });
  } catch (err) {
    // CWE-209: 구체적인 에러 유형 노출 방지
    console.warn(`🚨 토큰 검증 실패 - IP: ${req.ip}, Error: ${err.name}`);
    return res.status(403).json({ authenticated: false, message: '유효하지 않은 토큰입니다.' });
  }
});

module.exports = router; 