import express from 'express';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fileStorage from '../fileStorage.js';

// ES 모듈에서 __dirname 사용하기
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// 메모리 내 사용자 저장소
const inMemoryUsers = new Map();

// 사용자 데이터 파일 경로
const dataDir = path.join(__dirname, '..', 'data');
const usersFilePath = path.join(dataDir, 'users.json');

// 데이터 디렉토리 확인 및 생성
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// 파일에서 사용자 로드
function loadUsersFromFile() {
  try {
    if (fs.existsSync(usersFilePath)) {
      const data = fs.readFileSync(usersFilePath, 'utf8');
      const users = JSON.parse(data);
      
      // Map으로 변환
      inMemoryUsers.clear();
      users.forEach(user => {
        inMemoryUsers.set(user.email, user);
      });
      
      console.log(`${inMemoryUsers.size}명의 사용자를 파일에서 로드했습니다.`);
    } else {
      console.log('사용자 파일이 없습니다. 새로 생성합니다.');
      saveUsersToFile();
    }
  } catch (error) {
    console.error('사용자 로드 오류:', error);
  }
}

// 파일에 사용자 저장
function saveUsersToFile() {
  try {
    const users = Array.from(inMemoryUsers.values());
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf8');
    console.log(`${users.length}명의 사용자를 파일에 저장했습니다.`);
  } catch (error) {
    console.error('사용자 저장 오류:', error);
  }
}

// 초기 사용자 로드
loadUsersFromFile();

// 관리자 계정 생성 (없는 경우)
if (!inMemoryUsers.has('admin@example.com')) {
  inMemoryUsers.set('admin@example.com', {
    id: 'admin',
    name: '관리자',
    email: 'admin@example.com',
    password: 'admin123', // 실제 환경에서는 해시된 비밀번호 사용
    isAdmin: true,
    createdAt: new Date().toISOString()
  });
  saveUsersToFile();
}

// 토큰 생성 함수
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, isAdmin: user.isAdmin },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '30d' }
  );
};

// 미들웨어: 인증 확인
const authMiddleware = (req, res, next) => {
  try {
    const token = req.header('x-auth-token');
    
    if (!token) {
      return res.status(401).json({ message: '인증 토큰이 없습니다.' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
  }
};

// 미들웨어: 관리자 권한 확인
const adminMiddleware = (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: '관리자 권한이 필요합니다.' });
  }
  next();
};

// @route   POST /api/auth/register
// @desc    사용자 등록
// @access  Public
router.post('/register', (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // 필수 필드 확인
    if (!name || !email || !password) {
      return res.status(400).json({ message: '모든 필드를 입력해주세요.' });
    }
    
    // 이메일 중복 확인
    if (inMemoryUsers.has(email)) {
      return res.status(400).json({ message: '이미 등록된 이메일입니다.' });
    }
    
    // 새 사용자 생성
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password, // 실제 환경에서는 해시된 비밀번호 사용
      isAdmin: false,
      createdAt: new Date().toISOString()
    };
    
    // 사용자 저장
    inMemoryUsers.set(email, newUser);
    saveUsersToFile();
    
    // 토큰 생성 및 응답
    const token = generateToken(newUser);
    
    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        isAdmin: newUser.isAdmin
      }
    });
  } catch (error) {
    console.error('사용자 등록 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// @route   POST /api/auth/login
// @desc    로그인 및 토큰 발급
// @access  Public
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;
    
    // 사용자 확인
    const user = inMemoryUsers.get(email);
    
    if (!user || user.password !== password) {
      return res.status(401).json({ message: '이메일 또는 비밀번호가 일치하지 않습니다.' });
    }
    
    // 토큰 생성 및 응답
    const token = generateToken(user);
    
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    console.error('로그인 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// @route   GET /api/auth/me
// @desc    현재 사용자 정보 조회
// @access  Private
router.get('/me', authMiddleware, (req, res) => {
  try {
    const user = Array.from(inMemoryUsers.values()).find(u => u.id === req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }
    
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin
    });
  } catch (error) {
    console.error('사용자 정보 조회 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// @route   GET /api/auth/users
// @desc    모든 사용자 조회 (관리자 전용)
// @access  Private/Admin
router.get('/users', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const users = Array.from(inMemoryUsers.values()).map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt
    }));
    
    res.json(users);
  } catch (error) {
    console.error('사용자 목록 조회 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

export default router; 