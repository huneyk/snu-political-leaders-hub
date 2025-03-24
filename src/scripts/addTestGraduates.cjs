const mongoose = require('mongoose');
const dotenv = require('dotenv');

// 환경 변수 로드
dotenv.config();

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

// MongoDB 연결
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB에 연결되었습니다.');
    
    // 모델 생성
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
      },
      {
        term: 3,
        name: '한융합',
        isGraduated: true,
        organization: '연구소',
        position: '연구원'
      },
      {
        term: 4,
        name: '조지도',
        isGraduated: true,
        organization: '언론사',
        position: '기자'
      }
    ];
    
    // 기존 데이터 삭제 후 테스트 데이터 삽입
    const addTestData = async () => {
      try {
        // 컬렉션이 존재하는지 확인
        const collections = await mongoose.connection.db.listCollections().toArray();
        const graduatesExists = collections.some(col => col.name === 'graduates');
        
        if (graduatesExists) {
          console.log('graduates 컬렉션이 존재합니다.');
          
          // 기존 데이터 개수 확인
          const count = await Graduate.countDocuments();
          console.log(`현재 ${count}개의 데이터가 있습니다.`);
          
          // 기존 데이터가 있다면 삭제
          if (count > 0) {
            console.log('기존 데이터를 모두 삭제합니다...');
            await Graduate.deleteMany({});
            console.log('기존 데이터가 모두 삭제되었습니다.');
          }
        } else {
          console.log('graduates 컬렉션이 존재하지 않습니다. 새로 생성합니다.');
        }
        
        // 새 데이터 삽입
        console.log('테스트 데이터를 삽입합니다...');
        const insertedData = await Graduate.insertMany(testGraduates);
        console.log(`${insertedData.length}개의 테스트 데이터가 성공적으로 삽입되었습니다.`);
        
        // 삽입된 데이터 확인
        const allGraduates = await Graduate.find().sort({ term: 1, name: 1 });
        console.log('\n===== 현재 수료생 목록 =====');
        allGraduates.forEach(g => {
          console.log(`${g.term}기 ${g.name} (${g.organization} ${g.position})`);
        });
        
        console.log('\n작업이 완료되었습니다.');
        mongoose.connection.close();
      } catch (error) {
        console.error('오류 발생:', error);
      } finally {
        mongoose.connection.close();
      }
    };
    
    // 실행
    addTestData();
  })
  .catch(error => {
    console.error('MongoDB 연결 실패:', error);
  }); 