import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// MongoDB Atlas 연결 설정
// .env 파일에 MONGODB_URI 또는 MONGO_URI 사용 확인
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb+srv://<username>:<password>@<cluster-url>/plp_database?retryWrites=true&w=majority';
const DB_NAME = process.env.DB_NAME || 'plp_database';

const connectDB = async () => {
  try {
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // 5초 타임아웃
      maxPoolSize: 10, // 연결 풀 크기
    };
    
    // DB 이름이 URI에 포함되어 있지 않은 경우 명시적으로 지정
    const uri = MONGODB_URI.includes('plp_database') 
      ? MONGODB_URI 
      : `${MONGODB_URI.replace(/\/[^\/]*(\?|$)/, `/${DB_NAME}$1`)}`;
      
    await mongoose.connect(uri, options);
    console.log('MongoDB Atlas(plp_database) 연결 성공');
  } catch (error) {
    console.error('MongoDB Atlas 연결 실패:', error.message);
    console.log('로컬 스토리지 모드로 대체 작동합니다.');
    // 연결 실패 시에도 서버가 계속 실행되도록 함
    // process.exit(1); // 주석 처리하여 실패해도 종료하지 않음
  }
};

export default connectDB; 