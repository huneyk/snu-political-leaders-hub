# MongoDB Atlas 설정 가이드

## MongoDB Atlas란?
MongoDB Atlas는 MongoDB에서 제공하는 완전 관리형 클라우드 데이터베이스 서비스입니다. 이 가이드에서는 MongoDB Atlas를 설정하고 SNU-PLP-Hub 애플리케이션과 연결하는 방법을 설명합니다.

## 1. MongoDB Atlas 계정 생성 및 클러스터 설정

1. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) 웹사이트에 접속하여 계정을 생성합니다.
2. 새 프로젝트를 생성합니다.
3. 클러스터 생성:
   - "Build a Database" 버튼을 클릭합니다.
   - 무료 Shared 클러스터를 선택합니다. (Free Tier 라벨이 있는 옵션)
   - 클라우드 제공업체와 지역을 선택합니다. (한국에서 사용할 경우 가까운 아시아 리전 권장)
   - 클러스터 이름을 입력하고 "Create Cluster" 버튼을 클릭합니다.

## 2. 데이터베이스 액세스 설정

1. 왼쪽 메뉴에서 "Database Access"를 클릭합니다.
2. "Add New Database User" 버튼을 클릭합니다.
3. 사용자 이름과 강력한 비밀번호를 설정합니다.
4. "Database User Privileges"는 "Read and Write to Any Database"로 설정합니다.
5. "Add User" 버튼을 클릭하여 사용자를 생성합니다.

## 3. 네트워크 액세스 설정

1. 왼쪽 메뉴에서 "Network Access"를 클릭합니다.
2. "Add IP Address" 버튼을 클릭합니다.
3. 개발 목적으로는 모든 IP에서 접근을 허용할 수 있습니다: "Allow Access from Anywhere"를 선택합니다.
   (프로덕션 환경에서는 특정 IP만 허용하는 것이 좋습니다)
4. "Confirm" 버튼을 클릭합니다.

## 4. 연결 문자열 가져오기

1. 클러스터 대시보드로 돌아가서 "Connect" 버튼을 클릭합니다.
2. "Connect your application"을 선택합니다.
3. Driver로 "Node.js"를 선택하고 버전을 선택합니다.
4. 연결 문자열을 복사합니다.
5. 연결 문자열의 `<username>`, `<password>`, `<dbname>` 부분을 다음과 같이 수정합니다:
   - `<username>`: 생성한 데이터베이스 사용자 이름
   - `<password>`: 생성한 데이터베이스 사용자 비밀번호
   - `<dbname>`: `plp_database`

예시:
```
mongodb+srv://myuser:mypassword@cluster0.mongodb.net/plp_database?retryWrites=true&w=majority
```

## 5. 애플리케이션에 연결 설정하기

1. 프로젝트 루트 디렉토리에 `.env` 파일을 생성하고 다음 정보를 추가합니다:
   ```
   MONGODB_URI=mongodb+srv://myuser:mypassword@cluster0.mongodb.net/plp_database?retryWrites=true&w=majority
   DB_NAME=plp_database
   ```
   
2. `.env.example` 파일을 참고하여 다른 필요한 환경 변수도 설정합니다.

## 6. 샘플 데이터 추가

1. 다음 명령어를 실행하여 샘플 일정 데이터를 MongoDB Atlas에 추가합니다:
   ```
   node db-seed-schedules.js
   ```

## 문제 해결

MongoDB Atlas 연결에 문제가 있는 경우 다음을 확인하세요:

1. 네트워크 연결이 정상적으로 작동하는지 확인합니다.
2. 데이터베이스 사용자 이름과 비밀번호가 올바른지 확인합니다.
3. IP 액세스 목록에 현재 IP가 추가되어 있는지 확인합니다.
4. 연결 문자열의 형식이 올바른지 확인합니다.

더 자세한 내용은 [MongoDB Atlas 문서](https://docs.atlas.mongodb.com/) 를 참고하세요. 