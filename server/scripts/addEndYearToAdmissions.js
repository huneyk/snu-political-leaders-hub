const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB 연결
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB 연결 성공'))
.catch(err => console.error('MongoDB 연결 실패:', err));

// Admission 모델
const Admission = require('../models/Admission');

async function addEndYearToAdmissions() {
  try {
    console.log('기존 admission 데이터에 endYear 필드 추가 중...');
    
    // endYear 필드가 없는 모든 admission 문서 찾기
    const admissions = await Admission.find({ endYear: { $exists: false } });
    
    console.log(`업데이트할 admission 문서 수: ${admissions.length}`);
    
    for (const admission of admissions) {
      // endYear를 year와 같은 값으로 설정 (기본값)
      admission.endYear = admission.year;
      await admission.save();
      console.log(`Admission ${admission._id} 업데이트 완료`);
    }
    
    console.log('모든 admission 데이터에 endYear 필드 추가 완료');
    process.exit(0);
  } catch (error) {
    console.error('endYear 필드 추가 중 오류 발생:', error);
    process.exit(1);
  }
}

addEndYearToAdmissions(); 