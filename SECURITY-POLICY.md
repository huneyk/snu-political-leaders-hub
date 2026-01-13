# CWE 기준 보안정책 적용 문서

## 개요

이 문서는 SNU PLP Hub 서버에 적용된 CWE(Common Weakness Enumeration) 기준 보안정책을 설명합니다.

## 적용된 보안 정책

### 1. CWE-16: Configuration (보안 헤더)

**파일**: `server/app.js`

**적용 내용**:
- Helmet 미들웨어를 사용하여 다양한 보안 헤더 설정
- Content-Security-Policy (CSP) 설정
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection
- HSTS (HTTP Strict Transport Security)
- Referrer-Policy

```javascript
app.use(helmet({
  contentSecurityPolicy: { ... },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  noSniff: true,
  xssFilter: true
}));
```

---

### 2. CWE-22: Path Traversal (경로 조작)

**파일**: `server/routes/uploadRoutes.js`, `server/routes/imageUploadRoutes.js`

**적용 내용**:
- 파일명 검증 함수 (`sanitizeFilename`) 추가
- 상위 디렉토리 이동 (`..`) 차단
- 경로 안전성 검증 (`isPathSafe`)
- 위험한 특수 문자 필터링

```javascript
const sanitizeFilename = (filename) => {
  const sanitized = path.basename(filename)
    .replace(/\.\./g, '')
    .replace(/[<>:"|?*\x00-\x1f]/g, '')
    .replace(/^\.+/, '');
  return sanitized;
};
```

---

### 3. CWE-89: NoSQL Injection (MongoDB)

**파일**: `server/app.js`

**적용 내용**:
- express-mongo-sanitize 미들웨어 사용
- MongoDB 연산자 (`$`, `.`) 자동 제거
- 의심스러운 입력 감지 시 로깅

```javascript
app.use(mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    console.warn(`🚨 [CWE-89] NoSQL Injection 시도 감지`);
  }
}));
```

---

### 4. CWE-209: Information Exposure (정보 노출)

**파일**: `server/app.js`, `server/routes/authRoutes.js`

**적용 내용**:
- 에러 응답에서 스택 트레이스 제거
- 일관된 에러 메시지 반환 (사용자 존재 여부 노출 방지)
- 고유 에러 ID로 내부 추적 가능

```javascript
res.status(statusCode).json({
  success: false,
  message: safeMessage,
  errorId: errorId // 고객 지원 시 참조용
});
```

---

### 5. CWE-235: HTTP Parameter Pollution

**파일**: `server/app.js`

**적용 내용**:
- hpp 미들웨어로 파라미터 중복 방지
- 허용 목록(whitelist) 기반 예외 처리

```javascript
app.use(hpp({
  whitelist: ['term', 'limit', 'page']
}));
```

---

### 6. CWE-287: Improper Authentication (부적절한 인증)

**파일**: `server/middleware/authMiddleware.js`

**적용 내용**:
- JWT 토큰 필수 검증 (개발 모드 예외 제거)
- 하드코딩된 백도어 토큰 (`admin-auth`) 제거
- 토큰 형식 및 길이 검증

```javascript
const authenticateToken = (req, res, next) => {
  // 하드코딩된 백도어 토큰 제거됨
  const decoded = jwt.verify(token, getJWTSecret(), {
    issuer: 'snu-plp-server'
  });
};
```

---

### 7. CWE-307: Improper Restriction of Excessive Authentication Attempts

**파일**: `server/routes/authRoutes.js`, `server/app.js`

**적용 내용**:
- 로그인 Rate Limiting: 15분당 5회 시도 제한
- 전역 API Rate Limiting: 15분당 1000개 요청 제한
- 성공한 요청은 카운트에서 제외

```javascript
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 5, // 최대 5번 시도
  skipSuccessfulRequests: true
});
```

---

### 8. CWE-613: Insufficient Session Expiration

**파일**: `server/routes/authRoutes.js`

**적용 내용**:
- JWT 토큰 만료 시간 단축 (24시간 → 8시간)
- 토큰 발급자(issuer) 검증

```javascript
const token = jwt.sign({ ... }, getJWTSecret(), { 
  expiresIn: '8h',
  issuer: 'snu-plp-server'
});
```

---

### 9. CWE-798: Hard-coded Credentials

**파일**: `server/app.js`, `server/routes/authRoutes.js`

**적용 내용**:
- 하드코딩된 관리자 계정 제거
- 프로덕션 환경에서 환경변수 필수 검증
- JWT_SECRET 기본값 사용 시 서버 시작 차단

```javascript
if (process.env.NODE_ENV === 'production') {
  if (!process.env.JWT_SECRET) {
    process.exit(1);
  }
}
```

---

### 10. CWE-862: Missing Authorization

**파일**: `server/routes/uploadRoutes.js`, `server/routes/imageUploadRoutes.js`

**적용 내용**:
- 파일 업로드/삭제에 관리자 인증 필수
- `isAdmin` 미들웨어 적용

```javascript
router.post('/', isAdmin, upload.single('file'), async (req, res) => { ... });
router.delete('/:filename', isAdmin, async (req, res) => { ... });
```

---

## 필수 환경변수

프로덕션 환경에서는 다음 환경변수가 **필수**입니다:

| 환경변수 | 설명 | 예시 |
|---------|------|------|
| `JWT_SECRET` | JWT 서명용 시크릿 키 (최소 32자) | `your-super-secret-key-32-chars-min` |
| `MONGODB_URI` | MongoDB 연결 문자열 | `mongodb+srv://...` |
| `NODE_ENV` | 실행 환경 | `production` |
| `ADMIN_EMAIL` | 관리자 로그인 이메일 | `admin@example.com` |
| `ADMIN_PASSWORD` | 관리자 로그인 비밀번호 | `YourSecurePassword123!` |

### 관리자 계정 설정

관리자 계정은 `.env` 파일에서 설정합니다:

```env
# 관리자 계정
ADMIN_EMAIL=admin@snu-plp.ac.kr
ADMIN_PASSWORD=YourSecureAdminPassword123!
```

**주의사항**:
- 프로덕션 환경에서는 강력한 비밀번호를 사용하세요 (최소 12자, 대소문자/숫자/특수문자 조합)
- `.env` 파일은 절대로 Git에 커밋하지 마세요
- 자세한 설정 방법은 `server/ENV-SETUP.md` 문서를 참조하세요

## 보안 로그 확인

보안 관련 이벤트는 다음 형식으로 로깅됩니다:

```
🚨 [CWE-XXX] 이벤트 설명 - IP: x.x.x.x, Path: /api/...
```

- `CWE-22`: Path Traversal 시도
- `CWE-89`: NoSQL Injection 시도
- `CWE-287`: 인증 실패
- `CWE-307`: Rate Limit 초과
- `CWE-862`: 비인가 접근 시도

## 추가 권장 사항

1. **정기적인 의존성 업데이트**: `npm audit` 실행
2. **HTTPS 사용**: 프로덕션에서는 반드시 HTTPS 사용
3. **로그 모니터링**: 보안 이벤트 로그 정기 검토
4. **비밀번호 정책**: 관리자 계정에 강력한 비밀번호 사용

## 변경 이력

| 날짜 | 버전 | 변경 내용 |
|------|------|----------|
| 2026-01-13 | 1.0.0 | CWE 기준 보안정책 초기 적용 |
