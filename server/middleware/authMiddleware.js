const jwt = require('jsonwebtoken');

// 토큰 인증 미들웨어
const authenticateToken = (req, res, next) => {
  // 헤더에서 토큰 가져오기
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN 형식에서 TOKEN 부분만 추출
  
  // 특별한 개발 모드: admin-auth 토큰은 항상 허용
  if (token === 'admin-auth') {
    req.user = { id: 'admin', role: 'admin', isAdmin: true };
    return next();
  }
  
  if (!token) {
    return res.status(401).json({ message: '인증 토큰이 필요합니다.' });
  }
  
  // 토큰 검증
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: '유효하지 않은 토큰입니다.' });
    }
    
    // 토큰이 유효하면 사용자 정보를 요청 객체에 첨부
    req.user = user;
    next();
  });
};

// 관리자 권한 확인 미들웨어
const isAdmin = (req, res, next) => {
  // 일단 모든 요청 허용 (개발 모드)
  return next();
  
  // 실제 구현 (주석 처리)
  /*
  // 헤더에서 토큰 가져오기
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: '관리자 권한이 필요합니다.' });
  }
  
  // 토큰 검증
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err || !user.isAdmin) {
      return res.status(403).json({ message: '관리자 권한이 없습니다.' });
    }
    
    req.user = user;
    next();
  });
  */
};

module.exports = {
  authenticateToken,
  isAdmin
}; 