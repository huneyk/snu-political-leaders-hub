const jwt = require('jsonwebtoken');

// ============================================
// CWE-798: JWT 시크릿 키 보안 강화
// ============================================
const getJWTSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (secret) return secret;
  
  if (process.env.NODE_ENV !== 'production') {
    console.warn('⚠️ [CWE-798] JWT_SECRET이 설정되지 않아 개발용 기본값을 사용합니다.');
    return 'dev_only_secret_key_change_in_production';
  }
  
  throw new Error('[CWE-798] JWT_SECRET 환경변수가 필요합니다.');
};

// ============================================
// CWE-287: 토큰 인증 미들웨어 (보안 강화)
// ============================================
const authenticateToken = (req, res, next) => {
  // 헤더에서 토큰 가져오기
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN 형식에서 TOKEN 부분만 추출
  
  // CWE-798: 하드코딩된 백도어 토큰 제거
  // 이전: if (token === 'admin-auth') - 보안 취약점으로 제거됨
  
  if (!token) {
    return res.status(401).json({ message: '인증 토큰이 필요합니다.' });
  }
  
  // 토큰 형식 기본 검증
  if (token.length < 10 || token.length > 1000) {
    console.warn(`🚨 [CWE-287] 비정상적인 토큰 길이 - IP: ${req.ip}`);
    return res.status(401).json({ message: '유효하지 않은 토큰 형식입니다.' });
  }
  
  try {
    // 토큰 검증
    const decoded = jwt.verify(token, getJWTSecret(), {
      issuer: 'snu-plp-server'
    });
    
    // 토큰이 유효하면 사용자 정보를 요청 객체에 첨부
    req.user = decoded;
    next();
  } catch (err) {
    console.warn(`🚨 [CWE-287] 토큰 검증 실패 - IP: ${req.ip}, Error: ${err.name}`);
    return res.status(403).json({ message: '유효하지 않은 토큰입니다.' });
  }
};

// ============================================
// CWE-862: 관리자 권한 확인 미들웨어 (보안 강화)
// ============================================
const isAdmin = (req, res, next) => {
  // 헤더에서 토큰 가져오기
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    console.warn(`🚨 [CWE-862] 관리자 접근 시도 (토큰 없음) - IP: ${req.ip}, Path: ${req.path}`);
    return res.status(401).json({ message: '관리자 권한이 필요합니다.' });
  }
  
  try {
    // 토큰 검증
    const decoded = jwt.verify(token, getJWTSecret(), {
      issuer: 'snu-plp-server'
    });
    
    // 관리자 권한 확인
    if (!decoded.isAdmin && decoded.role !== 'admin') {
      console.warn(`🚨 [CWE-862] 비관리자의 관리자 접근 시도 - Email: ${decoded.email}, IP: ${req.ip}`);
      return res.status(403).json({ message: '관리자 권한이 없습니다.' });
    }
    
    req.user = decoded;
    next();
  } catch (err) {
    console.warn(`🚨 [CWE-862] 관리자 인증 실패 - IP: ${req.ip}, Error: ${err.name}`);
    return res.status(403).json({ message: '관리자 인증에 실패했습니다.' });
  }
};

module.exports = {
  authenticateToken,
  isAdmin
}; 