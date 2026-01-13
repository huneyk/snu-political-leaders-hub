# 환경변수 설정 가이드

## 개요

SNU PLP Hub 서버는 보안을 위해 민감한 설정값을 환경변수로 관리합니다.
`.env` 파일을 생성하여 아래 환경변수들을 설정해주세요.

## .env 파일 생성

```bash
# server 디렉토리에서 .env 파일 생성
touch .env
```

## 필수 환경변수

| 환경변수 | 설명 | 예시 |
|---------|------|------|
| `MONGODB_URI` | MongoDB 연결 문자열 | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `JWT_SECRET` | JWT 서명용 시크릿 키 (최소 32자) | `your-super-secret-key-32-chars-min` |
| `ADMIN_EMAIL` | 관리자 로그인 이메일 | `admin@example.com` |
| `ADMIN_PASSWORD` | 관리자 로그인 비밀번호 | `YourSecurePassword123!` |

## 선택적 환경변수

| 환경변수 | 설명 | 기본값 |
|---------|------|--------|
| `PORT` | 서버 포트 | `5002` |
| `NODE_ENV` | 실행 환경 | `development` |

## .env 파일 예시

```env
# MongoDB 연결
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/snu-plp-hub?retryWrites=true&w=majority

# JWT 시크릿 (32자 이상 권장)
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long

# 관리자 계정
ADMIN_EMAIL=admin@snu-plp.ac.kr
ADMIN_PASSWORD=YourSecureAdminPassword123!

# 서버 설정
PORT=5002
NODE_ENV=development
```

## 보안 주의사항

1. **`.env` 파일은 절대로 Git에 커밋하지 마세요.**
   - `.gitignore`에 `.env`가 포함되어 있는지 확인하세요.

2. **프로덕션 환경에서는 강력한 비밀번호를 사용하세요.**
   - 최소 12자 이상
   - 영문 대소문자, 숫자, 특수문자 조합

3. **JWT_SECRET은 충분히 긴 랜덤 문자열을 사용하세요.**
   - 온라인 랜덤 문자열 생성기 사용 권장
   - 예: `openssl rand -base64 32`

4. **환경변수 값에 특수문자가 포함된 경우 따옴표로 감싸세요.**
   ```env
   ADMIN_PASSWORD="password!@#with$pecial"
   ```

## 관리자 로그인 우선순위

1. **환경변수 관리자 계정** (`ADMIN_EMAIL`, `ADMIN_PASSWORD`)
2. **MongoDB 사용자 컬렉션** (추가 관리자 계정)

환경변수에 설정된 관리자 계정이 먼저 확인되며, 일치하지 않으면 MongoDB에서 사용자를 검색합니다.
