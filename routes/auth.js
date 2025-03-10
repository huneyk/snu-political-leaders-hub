const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const fileStorage = require('../fileStorage');

// 메모리 내 사용자 저장소
const inMemoryUsers = new Map();

// 파일에서 사용자 데이터 로드
try {
  const userData = fileStorage.loadData('users', { users: [] });
  if (userData.users && Array.isArray(userData.users)) {
    userData.users.forEach(user => {
      inMemoryUsers.set(user.username, user);
    });
    console.log(`Loaded ${userData.users.length} users from file storage`);
    console.log('Current users in memory:', Array.from(inMemoryUsers.entries()).map(([username, user]) => ({
      username,
      password: user.password,
      role: user.role
    })));
  }
} catch (error) {
  console.error('Error loading users from file storage:', error);
}

// 기본 관리자 계정이 없으면 생성
if (!inMemoryUsers.has('admin')) {
  const adminUser = {
    id: 'admin-id',
    username: 'admin',
    password: 'admin123', // 실제로는 해시된 비밀번호를 저장해야 함
    role: 'admin',
    createdAt: new Date()
  };
  
  inMemoryUsers.set('admin', adminUser);
  console.log('기본 관리자 계정이 생성되었습니다. (admin / admin123)');
  
  // 파일에 저장
  saveUsersToFile();
} else {
  // 기존 admin 계정이 있으면 비밀번호를 admin123으로 업데이트
  const adminUser = inMemoryUsers.get('admin');
  if (adminUser.password !== 'admin123') {
    console.log(`Admin 비밀번호를 '${adminUser.password}'에서 'admin123'으로 업데이트합니다.`);
    adminUser.password = 'admin123';
    inMemoryUsers.set('admin', adminUser);
    saveUsersToFile();
  }
}

// 사용자 데이터를 파일에 저장하는 함수
function saveUsersToFile() {
  const users = Array.from(inMemoryUsers.values());
  fileStorage.saveData('users', { users });
  console.log('사용자 데이터를 파일에 저장했습니다.');
}

// 회원가입
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    // MongoDB 연결 확인
    if (req.app.locals.mongoConnected) {
      // 이미 존재하는 사용자인지 확인
      let user = await User.findOne({ username });
      if (user) {
        return res.status(400).json({ message: '이미 존재하는 사용자입니다.' });
      }

      // 새 사용자 생성
      user = new User({
        username,
        password,
        // 첫 번째 사용자는 관리자로 설정 (선택적)
        role: (await User.countDocuments({})) === 0 ? 'admin' : 'user'
      });

      await user.save();

      // JWT 토큰 생성
      const payload = {
        user: {
          id: user.id,
          role: user.role
        }
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '1d' },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
      
      return;
    }
    
    // 파일 시스템 저장소 사용
    if (inMemoryUsers.has(username)) {
      return res.status(400).json({ message: '이미 존재하는 사용자입니다.' });
    }
    
    const isFirstUser = inMemoryUsers.size === 0;
    const user = {
      id: `user-${Date.now()}`,
      username,
      password, // 실제로는 해시해야 함
      role: isFirstUser ? 'admin' : 'user',
      createdAt: new Date()
    };
    
    inMemoryUsers.set(username, user);
    saveUsersToFile();
    
    // JWT 토큰 생성
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };
    
    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1d' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error('회원가입 오류:', err.message);
    res.status(500).json({ message: '서버 오류' });
  }
});

// 로그인
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  console.log(`로그인 시도: 사용자=${username}, 비밀번호=${password}`);
  console.log('현재 메모리에 있는 사용자:', Array.from(inMemoryUsers.entries()).map(([username, user]) => ({
    username,
    password: user.password,
    role: user.role
  })));

  try {
    // MongoDB 연결 확인
    if (req.app.locals.mongoConnected) {
      // 사용자 확인
      const user = await User.findOne({ username });
      if (!user) {
        console.log(`MongoDB: 사용자 '${username}'을 찾을 수 없습니다.`);
        return res.status(400).json({ message: '잘못된 사용자 정보입니다.' });
      }

      // 비밀번호 확인
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        console.log(`MongoDB: 사용자 '${username}'의 비밀번호가 일치하지 않습니다.`);
        return res.status(400).json({ message: '잘못된 사용자 정보입니다.' });
      }

      console.log(`MongoDB: 사용자 '${username}' 로그인 성공`);

      // JWT 토큰 생성
      const payload = {
        user: {
          id: user.id,
          role: user.role
        }
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '1d' },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
      
      return;
    }
    
    // 파일 시스템 저장소 사용
    const user = inMemoryUsers.get(username);
    
    if (!user) {
      console.log(`파일 시스템: 사용자 '${username}'을 찾을 수 없습니다.`);
      return res.status(400).json({ message: '잘못된 사용자 정보입니다.' });
    }
    
    // 비밀번호 확인 (실제로는 해시 비교해야 함)
    if (user.password !== password) {
      console.log(`파일 시스템: 사용자 '${username}'의 비밀번호가 일치하지 않습니다. 입력된 비밀번호: '${password}', 저장된 비밀번호: '${user.password}'`);
      return res.status(400).json({ message: '잘못된 사용자 정보입니다.' });
    }
    
    console.log(`파일 시스템: 사용자 '${username}' 로그인 성공`);
    
    // JWT 토큰 생성
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };
    
    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1d' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error('로그인 오류:', err.message);
    res.status(500).json({ message: '서버 오류' });
  }
});

// 현재 사용자 정보 조회
router.get('/me', auth, async (req, res) => {
  try {
    // MongoDB 연결 확인
    if (req.app.locals.mongoConnected) {
      const user = await User.findById(req.user.id).select('-password');
      return res.json(user);
    }
    
    // 파일 시스템 저장소 사용
    // 사용자 ID로 사용자 찾기
    let foundUser = null;
    for (const user of inMemoryUsers.values()) {
      if (user.id === req.user.id) {
        foundUser = { ...user };
        delete foundUser.password; // 비밀번호 제외
        break;
      }
    }
    
    if (foundUser) {
      return res.json(foundUser);
    }
    
    // 사용자를 찾지 못한 경우 토큰에서 추출한 정보만 반환
    return res.json({
      id: req.user.id,
      role: req.user.role
    });
  } catch (err) {
    console.error('사용자 정보 조회 오류:', err.message);
    res.status(500).json({ message: '서버 오류' });
  }
});

module.exports = router; 