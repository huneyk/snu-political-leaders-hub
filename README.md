# 서울대학교 정치리더십과정 (SNU Political Leaders Program Hub)

## 프로젝트 개요

서울대학교 정치리더십과정의 공식 웹사이트입니다. 과정 소개, 입학 안내, 강의 일정, 갤러리, 공지사항 등을 관리하는 Full-Stack 웹 애플리케이션입니다.

## 기술 스택

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Routing**: React Router v6
- **State Management**: React Query (TanStack Query)

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (MongoDB Atlas)
- **ODM**: Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **File Upload**: Multer
- **Excel Processing**: xlsx
- **Image Processing**: Sharp

## 로컬 실행 방법

### 사전 요구사항

다음 소프트웨어가 설치되어 있어야 합니다:
- **Node.js** (v16 이상) - [다운로드](https://nodejs.org/)
- **npm** (Node.js와 함께 설치됨)
- **MongoDB Atlas 계정** 또는 로컬 MongoDB 서버

### 1. 저장소 클론

```bash
git clone <YOUR_GIT_URL>
cd snu-political-leaders-hub
```

### 2. Backend 설정 및 실행

```bash
# Backend 디렉토리로 이동
cd server

# 의존성 패키지 설치
npm install

# 환경 변수 설정 (.env 파일 생성)
# server/.env 파일에 다음 내용 추가:
# MONGODB_URI=your_mongodb_connection_string
# JWT_SECRET=your_jwt_secret_key
# PORT=5001

# Backend 서버 실행 (개발 모드)
npm run dev

# 또는 프로덕션 모드
npm start
```

**Backend 서버**: http://localhost:5001

### 3. Frontend 설정 및 실행

새 터미널을 열어서 다음 명령어를 실행합니다:

```bash
# 프로젝트 루트 디렉토리로 이동
cd snu-political-leaders-hub

# 의존성 패키지 설치
npm install

# Frontend 개발 서버 실행
npm run dev
```

**Frontend 서버**: http://localhost:5173

### 4. 관리자 계정 초기 설정

Backend 서버가 실행 중일 때, MongoDB에 관리자 계정을 생성해야 합니다:

```bash
# server 디렉토리에서 실행
cd server
node scripts/createAdmin.js
```

기본 관리자 계정:
- **Username**: `admin`
- **Password**: `admin123`

## 프로젝트 구조

```
snu-political-leaders-hub/
├── src/                      # Frontend 소스 코드
│   ├── components/           # React 컴포넌트
│   ├── pages/               # 페이지 컴포넌트
│   │   ├── admin/           # 관리자 페이지
│   │   └── intro/           # 과정 소개 페이지
│   ├── lib/                 # 유틸리티 및 API 서비스
│   └── hooks/               # Custom React Hooks
├── server/                   # Backend 소스 코드
│   ├── models/              # MongoDB 스키마 모델
│   ├── routes/              # Express 라우트
│   ├── middleware/          # Express 미들웨어
│   ├── scripts/             # 유틸리티 스크립트
│   └── app.js               # Express 서버 진입점
├── public/                   # 정적 파일
└── dist/                     # 빌드 결과물
```

## 주요 기능

### 공개 페이지
- ✅ **과정 소개**: 인사말, 추천의 글, 목표, 특전, 운영 교수진, 수료자 명단
- ✅ **입학 안내**: 지원 안내, 운영 준칙
- ✅ **일정**: 강사진, 달력, 주요 활동
- ✅ **갤러리**: 기수별 사진 갤러리
- ✅ **공지사항**: 공지사항 목록 및 상세보기

### 관리자 페이지 (`/admin`)
- ✅ **콘텐츠 관리**: 인사말, 추천의 글, 목표, 특전, 교수진
- ✅ **강사진 관리**: 기수별 강사진 정보 관리
- ✅ **수료자 명단 관리**: Excel 파일 업로드를 통한 일괄 등록
- ✅ **일정 관리**: 강의 및 행사 일정 관리
- ✅ **갤러리 관리**: 기수별 사진 업로드 및 관리
- ✅ **공지사항 관리**: 공지사항 작성, 수정, 삭제
- ✅ **입학 정보 관리**: 입학 지원 정보 수정
- ✅ **Footer 관리**: 푸터 정보 수정

### 최신 기능: 수료자 명단 (2024.11)

**Admin 기능**:
- Excel 파일 업로드로 수료자 정보 일괄 등록
- 개별 수료자 추가/수정/삭제
- 기수별 그룹화된 수료자 목록 관리

**Web 페이지**:
- 기수별 탭 네비게이션
- 테이블 형태로 수료자 명단 표시 (기수, 성명, 소속, 직위)

**Excel 파일 형식**:
```
기수 | 성명   | 소속        | 직위
-----|--------|-------------|------
1    | 홍길동 | ○○대학교   | 교수
1    | 김철수 | △△연구소   | 연구원
```

## API 엔드포인트

### 주요 API
- `GET /api/graduates` - 전체 수료자 조회
- `POST /api/graduates` - 수료자 추가
- `POST /api/graduates/upload-excel` - Excel 파일 업로드
- `GET /api/gallery` - 갤러리 조회
- `GET /api/notices` - 공지사항 조회
- `GET /api/schedules` - 일정 조회

자세한 API 문서는 `server/routes/` 디렉토리를 참조하세요.

## 환경 변수 설정

### Backend (.env)
```env
# MongoDB 연결 문자열
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname

# JWT 시크릿 키
JWT_SECRET=your-secret-key

# 서버 포트
PORT=5001

# 환경 (development/production)
NODE_ENV=development
```

### Frontend (선택사항)
Vite 환경 변수는 `vite.config.ts`에서 프록시 설정으로 관리됩니다.

## 배포

### Frontend 배포 (Netlify/Vercel)
```bash
npm run build
# dist/ 폴더를 배포
```

### Backend 배포 (Render/Heroku)
- MongoDB Atlas 사용 권장
- 환경 변수 설정 필수
- `npm start` 명령어로 서버 실행

## 트러블슈팅

### MongoDB 연결 오류
- MongoDB Atlas 연결 문자열 확인
- IP 화이트리스트 설정 확인
- 네트워크 방화벽 확인

### CORS 오류
- Backend `app.js`의 CORS 설정 확인
- Frontend에서 올바른 API URL 사용

### 포트 충돌
- Backend: 기본 포트 5001 (변경 가능)
- Frontend: 기본 포트 5173 (변경 가능)

## 개발 가이드

### 코드 스타일
- **Frontend**: ESLint + Prettier
- **Backend**: 함수형 프로그래밍 스타일
- **Naming**: camelCase (JavaScript), kebab-case (파일명)

### Git 워크플로우
1. Feature 브랜치 생성
2. 개발 및 커밋
3. Pull Request 생성
4. 리뷰 및 머지

## 라이선스

이 프로젝트는 서울대학교 정치리더십과정의 공식 웹사이트입니다.

## 문의

프로젝트 관련 문의사항은 서울대학교 정치리더십과정 사무국으로 연락주시기 바랍니다.
