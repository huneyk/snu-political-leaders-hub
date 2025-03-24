const mongoose = require('mongoose');
const dotenv = require('dotenv');

// .env 파일 로드
dotenv.config();

// MongoDB 연결
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB에 연결되었습니다.');
    
    // 수료자 스키마 정의
    const graduateSchema = new mongoose.Schema({
      term: {
        type: Number,
        required: true,
        min: 1
      },
      name: {
        type: String,
        required: true,
        trim: true
      },
      isGraduated: {
        type: Boolean,
        default: true
      },
      graduationDate: {
        type: Date
      },
      organization: {
        type: String,
        trim: true
      },
      position: {
        type: String,
        trim: true
      },
      createdAt: {
        type: Date,
        default: Date.now
      },
      updatedAt: {
        type: Date,
        default: Date.now
      }
    });
    
    // Graduate 모델 생성
    const Graduate = mongoose.model('Graduate', graduateSchema);
    
    // 테스트 데이터
    const testGraduates = [
      {
        term: 1,
        name: '김정치',
        isGraduated: true,
        organization: '서울대학교',
        position: '교수'
      },
      {
        term: 1,
        name: '이민주',
        isGraduated: true,
        organization: '국회',
        position: '의원'
      },
      {
        term: 2,
        name: '박대표',
        isGraduated: true,
        organization: '정당',
        position: '대표'
      },
      {
        term: 2,
        name: '최시민',
        isGraduated: true,
        organization: '시민단체',
        position: '대표'
      },
      {
        term: 3,
        name: '정외교',
        isGraduated: true,
        organization: '외교부',
        position: '공무원'
      }
    ];
    
    // 데이터 추가 함수
    const addTestData = async () => {
      try {
        // 기존 데이터 확인
        const count = await Graduate.countDocuments();
        if (count > 0) {
          console.log(`이미 ${count}개의 수료생 데이터가 존재합니다.`);
          const addMore = true; // 이 값을 수정하여 추가 데이터 삽입 여부 결정
          
          if (!addMore) {
            console.log('추가 데이터 삽입을 건너뜁니다.');
            mongoose.connection.close();
            return;
          }
        }
        
        // 데이터 추가
        const result = await Graduate.insertMany(testGraduates);
        console.log(`${result.length}개의 테스트 수료생 데이터가 추가되었습니다.`);
        
        // 모든 수료생 출력
        const allGraduates = await Graduate.find().sort({ term: 1, name: 1 });
        console.log('\n===== 현재 수료생 목록 =====');
        allGraduates.forEach(g => {
          console.log(`${g.term}기 ${g.name} (${g.organization} ${g.position})`);
        });
        console.log(`총 ${allGraduates.length}명의 수료생이 등록되어 있습니다.`);
        
        // 연결 종료
        mongoose.connection.close();
        console.log('\nMongoDB 연결이 종료되었습니다.');
      } catch (error) {
        console.error('테스트 데이터 추가 중 오류 발생:', error);
        mongoose.connection.close();
      }
    };
    
    // 실행
    addTestData();
  })
  .catch((error) => {
    console.error('MongoDB 연결 실패:', error);
  }); 