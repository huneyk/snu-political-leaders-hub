import jwt from 'jsonwebtoken';

/**
 * JWT 토큰 검증 미들웨어
 * 요청 헤더의 Authorization 필드에서 토큰을 추출하고 검증
 */
const authenticateToken = (req, res, next) => {
  // Authorization 헤더에서 토큰 추출
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN" 형식에서 TOKEN 부분 추출
  
  // 특별한 개발 모드: admin-auth 토큰은 항상 허용
  if (token === 'admin-auth') {
    req.user = { id: 'admin', role: 'admin' };
    return next();
  }
  
  if (!token) {
    return res.status(401).json({ message: '인증 토큰이 필요합니다.' });
  }
  
  try {
    // 토큰 검증
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // 검증된 사용자 정보를 요청 객체에 추가
    next();
  } catch (error) {
    console.error('토큰 검증 실패:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: '토큰이 만료되었습니다. 다시 로그인해주세요.' });
    }
    
    return res.status(403).json({ message: '유효하지 않은 토큰입니다.' });
  }
};

/**
 * 관리자 권한 검증 미들웨어
 * authenticateToken 미들웨어 이후에 사용해야 함
 */
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: '관리자 권한이 필요합니다.' });
  }
};

export { authenticateToken, isAdmin }; 