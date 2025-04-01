import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// MongoDB Atlas 연결 설정
// .env 파일에 MONGODB_URI 또는 MONGO_URI 사용 확인
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb+srv://<username>:<password>@<cluster-url>/plp_database?retryWrites=true&w=majority';
const DB_NAME = process.env.DB_NAME || 'plp_database';

const connectDB = async () => {
  try {
    console.log('MongoDB 연결 시작...');
    console.log(`데이터베이스 이름: ${DB_NAME}`);
    
    // URI 구조 검증 (비밀 정보는 숨김)
    const redactedUri = MONGODB_URI.replace(/(mongodb(\+srv)?:\/\/)([^:]+):([^@]+)@/, '$1****:****@');
    console.log(`MongoDB URI 구조: ${redactedUri}`);
    
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // 10초로 타임아웃 증가
      maxPoolSize: 10, // 연결 풀 크기
      socketTimeoutMS: 45000, // 소켓 타임아웃
    };
    
    // DB 이름이 URI에 포함되어 있지 않은 경우 명시적으로 지정
    const uri = MONGODB_URI.includes('plp_database') 
      ? MONGODB_URI 
      : `${MONGODB_URI.replace(/\/[^\/]*(\?|$)/, `/${DB_NAME}$1`)}`;
    
    console.log('MongoDB 연결 옵션:', JSON.stringify(options));  
    
    // 연결 시도
    await mongoose.connect(uri, options);
    
    // 연결 상태 확인
    const connectionState = mongoose.connection.readyState;
    const stateMessages = {
      0: '연결 해제',
      1: '연결됨',
      2: '연결 중',
      3: '연결 해제 중',
    };
    
    console.log(`MongoDB 연결 상태: ${stateMessages[connectionState] || '알 수 없음'} (${connectionState})`);
    
    if (connectionState === 1) {
      console.log('✅ MongoDB Atlas(plp_database) 연결 성공');
      
      // 컬렉션 목록 조회
      const collections = await mongoose.connection.db.listCollections().toArray();
      console.log(`사용 가능한 컬렉션: ${collections.map(c => c.name).join(', ')}`);
      
      // 컬렉션 내 문서 수 확인 (주요 컬렉션)
      const collectionsToCheck = ['lecturers', 'professors', 'objectives', 'benefits'];
      for (const collection of collectionsToCheck) {
        try {
          const count = await mongoose.connection.db.collection(collection).countDocuments();
          console.log(`📊 ${collection} 컬렉션 문서 수: ${count}`);
        } catch (err) {
          console.log(`⚠️ ${collection} 컬렉션 정보 조회 실패:`, err.message);
        }
      }
    }
    
    // 이벤트 리스너 추가
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB 연결 오류 발생:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB 연결이 끊어졌습니다. 재연결을 시도합니다.');
    });
    
  } catch (error) {
    console.error('❌ MongoDB Atlas 연결 실패');
    console.error('오류 유형:', error.name);
    console.error('오류 메시지:', error.message);
    
    if (error.name === 'MongooseServerSelectionError') {
      console.error('서버 선택 실패: MongoDB 서버에 연결할 수 없습니다.');
      console.error('서버 정보:', error.reason?.servers || '정보 없음');
    }
    
    console.log('🔄 로컬 스토리지 모드로 대체 작동합니다.');
    // 연결 실패 시에도 서버가 계속 실행되도록 함
    // process.exit(1); // 주석 처리하여 실패해도 종료하지 않음
  }
};

export default connectDB; 