# MongoDB Atlas 설정 요약

## 변경 내역
이 프로젝트는 MongoDB Atlas와 `plp_database`를 사용하도록 다음과 같이 수정되었습니다:

1. **ScheduleManageNew.tsx** 파일에 MongoDB Atlas 사용 명시
   - 파일 상단 주석에 'MongoDB Atlas(plp_database)' 연동 정보 추가
   - 기존 코드는 MongoDB 연결 실패 시 localStorage 폴백 로직 유지

2. **데이터베이스 설정 파일 생성/수정**
   - `/src/config/database.ts`: MongoDB Atlas 연결 설정 정보 추가
   - `/src/config/database.js`: MongoDB 연결 로직을 Atlas 사용으로 업데이트
     - `plp_database` 명시적 사용
     - 연결 옵션 추가 (connection pool, timeout 등)
     - 연결 실패 시 에러 처리 개선 (앱 종료 방지)

3. **시드 스크립트 업데이트**
   - `db-seed-schedules.js` 파일을 MongoDB Atlas 사용하도록 수정
   - 연결 설정 및 데이터베이스명 변경
   - Connection Pool 설정 및 에러 처리 개선

4. **환경 설정 가이드 추가**
   - `.env.example` 파일에 MongoDB Atlas 연결 정보 템플릿 추가
   - `README-MONGODB-ATLAS.md` 파일 생성하여 상세 설정 가이드 제공

## 사용 방법

1. MongoDB Atlas 계정 생성 및 클러스터 설정
2. `.env` 파일 생성하여 연결 정보 설정
   ```
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/plp_database?retryWrites=true&w=majority
   DB_NAME=plp_database
   ```
3. 샘플 데이터 추가 (선택사항)
   ```
   node db-seed-schedules.js
   ```

자세한 설정 방법은 `README-MONGODB-ATLAS.md` 파일을 참고하세요.

## 변경사항 주요 특징

1. **안정성 향상**
   - MongoDB 연결 실패 시 localStorage 폴백 메커니즘 유지
   - 서버 연결 오류 시에도 앱 종료 방지
   - 연결 타임아웃 및 재시도 설정 추가

2. **확장성 개선**
   - Connection Pool 설정으로 대량 요청 처리 준비
   - 환경변수 기반 설정으로 개발/테스트/운영 환경 전환 용이

3. **유지보수성 강화**
   - 설정 파일 분리로 코드 가독성 향상
   - 상세한 주석 및 문서화
   - 일관된 에러 처리 및 로깅 