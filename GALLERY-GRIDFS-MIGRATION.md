# Gallery 이미지 GridFS 마이그레이션 가이드

## 📋 개요

기존 Gallery 이미지를 Base64 형식에서 GridFS로 마이그레이션하는 가이드입니다.

## 🔍 현재 상태

- **Before**: Gallery 문서의 `imageUrl` 필드에 Base64 이미지 데이터 저장
  ```
  imageUrl: "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
  ```

- **After**: GridFS에 이미지 저장, `imageUrl` 필드에는 GridFS 파일 ID만 저장
  ```
  imageUrl: "507f1f77bcf86cd799439011"
  ```

## ⚠️ 마이그레이션 전 준비사항

1. **백업 필수**: MongoDB 데이터베이스 백업
2. **서버 중지**: 마이그레이션 중 서버 정지 권장
3. **충분한 시간**: 이미지 수에 따라 몇 분에서 몇 시간 소요 가능

## 🚀 마이그레이션 실행 방법

### 1단계: 마이그레이션 스크립트 실행

```bash
cd server
node scripts/migrateGalleryToGridFS.js
```

### 2단계: 결과 확인

마이그레이션이 완료되면 다음과 같은 요약이 표시됩니다:

```
============================================================
📊 마이그레이션 결과 요약
============================================================
✅ 성공: 45개
⏭️  건너뜀: 2개
❌ 실패: 0개
📦 총 처리: 47개
============================================================
```

### 3단계: MongoDB 확인

```bash
# MongoDB에서 GridFS 컬렉션 확인
use plp_database
db.galleryImages.files.find().pretty()
db.galleryImages.chunks.findOne()
```

## 📝 마이그레이션 후 코드 변경

마이그레이션 완료 후 다음 파일들을 업데이트해야 합니다:

### 1. Gallery 모델 스키마 업데이트
`server/models/Gallery.js`

### 2. Gallery 라우트에 이미지 다운로드 엔드포인트 추가
`server/routes/galleryRoutes.js`

### 3. 프론트엔드 이미지 URL 처리 변경
- `src/pages/admin/GalleryManage.tsx`
- `src/components/Gallery.tsx`
- `src/pages/GalleryByTerm.tsx`

## 🔄 롤백 방법

문제가 발생한 경우:

1. MongoDB 백업에서 복원
2. 또는 GridFS 파일을 Base64로 재변환 (역 마이그레이션 스크립트 필요)

## 📊 예상 효과

- 초기 페이지 로딩: **10-100배 향상**
- 메모리 사용량: **70% 감소**
- 이미지 lazy loading 지원
- MongoDB 문서 크기 제한 우회

## ⚠️ 주의사항

- 마이그레이션 중에는 서버를 중지하세요
- 백업은 필수입니다
- 마이그레이션 완료 후 코드 변경이 필요합니다
- 프론트엔드 배포 전 테스트 필수

## 🆘 문제 해결

### 문제: "MongoDB connection failed"
- `.env` 파일의 `MONGODB_URI` 확인
- MongoDB Atlas 네트워크 접근 권한 확인

### 문제: "Out of memory"
- 이미지가 너무 많은 경우 배치로 나누어 처리
- Node.js 메모리 증가: `node --max-old-space-size=4096 scripts/migrateGalleryToGridFS.js`

### 문제: 일부 이미지 실패
- 로그에서 실패한 항목 확인
- 해당 Gallery 문서를 수동으로 재처리

# Gallery GridFS Migration Complete
