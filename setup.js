import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ES 모듈에서 __dirname 사용하기
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('===== 초기 설정 시작 =====');

// 필요한 디렉토리 생성
const directories = [
  'data',
  'dist',
  'data/images',
  'data/images/gallery'
];

directories.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`디렉토리 생성됨: ${dirPath}`);
  } else {
    console.log(`디렉토리 이미 존재함: ${dirPath}`);
  }
});

// 기본 HTML 파일 생성
const htmlContent = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>서울대학교 정치지도자과정</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="container">
    <h1>서울대학교 정치지도자과정</h1>
    
    <div class="coming-soon">
      <p>사이트가 현재 구축 중입니다. 곧 서비스를 시작할 예정입니다.</p>
    </div>
    
    <h2>프로그램 소개</h2>
    <p>서울대학교 정치지도자과정(Political Leaders Program, PLP)은 급변하는 국내외 정세의 변화에 대응하는 개방적 교육 플랫폼으로, 서울대학교 정치외교학부가 개설한 특별 과정입니다.</p>
    
    <div class="features">
      <div class="feature">
        <h3>전문 교육</h3>
        <p>서울대학교 정치외교학부 교수진 및 각계 명사 동문을 중심으로 구성된 강사진의 알찬 강의</p>
      </div>
      <div class="feature">
        <h3>리더십 함양</h3>
        <p>국내 각계의 현직 또는 잠재적 지도자들의 리더십을 고양하는 프로그램</p>
      </div>
      <div class="feature">
        <h3>정치 과제 진단</h3>
        <p>한국 정치가 안고 있는 다양한 과제들을 진단하고 이에 대한 처방을 고민하는 국내 최고 수준의 프로그램</p>
      </div>
    </div>
    
    <div class="contact">
      <p>서울대학교 정치외교학부</p>
      <p>Political Leaders Program (PLP)</p>
      <p>문의사항은 관리자에게 연락해주세요.</p>
    </div>
  </div>
  <script src="main.js"></script>
</body>
</html>`;

// CSS 파일 내용
const cssContent = `:root {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #f8f9fa;
}

body {
  margin: 0;
  padding: 20px;
}

.container {
  margin-top: 50px;
  background-color: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 800px;
  margin: 50px auto;
}

h1 {
  color: #1a56db;
  text-align: center;
  margin-top: 40px;
}

h2 {
  color: #2563eb;
  margin-top: 30px;
}

.logo {
  display: block;
  max-width: 200px;
  margin: 0 auto 30px;
}

.contact {
  margin-top: 40px;
  font-size: 0.9em;
  color: #666;
  text-align: center;
  border-top: 1px solid #eee;
  padding-top: 20px;
}

.coming-soon {
  text-align: center;
  font-size: 1.2em;
  margin: 30px 0;
  color: #4b5563;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 30px;
}

.feature {
  padding: 20px;
  background-color: #f3f4f6;
  border-radius: 8px;
}

.feature h3 {
  color: #2563eb;
  margin-top: 0;
}`;

// JavaScript 파일 내용
const jsContent = `// 페이지가 로드되면 실행
document.addEventListener('DOMContentLoaded', function() {
  console.log('서울대학교 정치지도자과정 웹사이트에 오신 것을 환영합니다!');
  
  // 현재 날짜 표시
  const today = new Date();
  const dateString = today.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // 푸터에 날짜 추가
  const contact = document.querySelector('.contact');
  const dateElement = document.createElement('p');
  dateElement.textContent = \`오늘 날짜: \${dateString}\`;
  contact.appendChild(dateElement);
});`;

// 파일 생성 함수
const createFile = (filePath, content) => {
  try {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`파일 생성됨: ${filePath}`);
  } catch (error) {
    console.error(`파일 생성 오류 (${filePath}):`, error);
  }
};

// 정적 파일 생성
createFile(path.join(__dirname, 'dist', 'index.html'), htmlContent);
createFile(path.join(__dirname, 'dist', 'styles.css'), cssContent);
createFile(path.join(__dirname, 'dist', 'main.js'), jsContent);

// 기본 .env 파일 생성 (없는 경우)
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  const envContent = `NODE_ENV=development
PORT=5001
MONGO_URI=mongodb://localhost:27017/snu-plp-hub
JWT_SECRET=your_jwt_secret_key_change_this_in_production`;
  
  createFile(envPath, envContent);
}

console.log('===== 초기 설정 완료 =====');
console.log('서버를 시작하려면 다음 명령어를 실행하세요:');
console.log('npm run dev'); 