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
    
    // 기존에 컬렉션이 있는지 확인하는 함수
    const checkCollection = async () => {
      const collections = await mongoose.connection.db.listCollections().toArray();
      return collections.some(collection => collection.name === 'graduates');
    };
    
    // 메인 함수
    const createCollection = async () => {
      try {
        const exists = await checkCollection();
        
        if (exists) {
          console.log('graduates 컬렉션이 이미 존재합니다.');
        } else {
          // 컬렉션 생성 (빈 문서 하나 추가하고 삭제하여 컬렉션 생성)
          const dummyGraduate = new Graduate({
            term: 1,
            name: 'Initial Entry',
            isGraduated: true
          });
          
          await dummyGraduate.save();
          console.log('graduates 컬렉션이 성공적으로 생성되었습니다.');
          
          // 더미 데이터 삭제
          await Graduate.deleteOne({ _id: dummyGraduate._id });
          console.log('초기 더미 데이터가 삭제되었습니다.');
        }
        
        // 연결 종료
        mongoose.connection.close();
        console.log('MongoDB 연결이 종료되었습니다.');
      } catch (error) {
        console.error('오류 발생:', error);
        mongoose.connection.close();
      }
    };
    
    // 실행
    createCollection();
  })
  .catch((error) => {
    console.error('MongoDB 연결 실패:', error);
  }); 