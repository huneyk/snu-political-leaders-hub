const mongoose = require('mongoose');
const Notice = require('../models/Notice');
require('dotenv').config();

// MongoDB 연결 설정
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

async function addAttachmentsFieldToNotices() {
  try {
    // MongoDB 연결
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB 연결 성공');

    // 모든 공지사항에 attachments 필드 추가 (없는 경우에만)
    const result = await Notice.updateMany(
      { attachments: { $exists: false } }, // attachments 필드가 없는 문서들만
      { $set: { attachments: [] } } // 빈 배열로 설정
    );

    console.log(`${result.modifiedCount}개의 공지사항에 attachments 필드가 추가되었습니다.`);

    // 업데이트된 공지사항 개수 확인
    const totalNotices = await Notice.countDocuments();
    console.log(`전체 공지사항 개수: ${totalNotices}`);

    // 연결 종료
    await mongoose.disconnect();
    console.log('MongoDB 연결 종료');
    
  } catch (error) {
    console.error('마이그레이션 실패:', error);
    process.exit(1);
  }
}

// 스크립트 실행
if (require.main === module) {
  addAttachmentsFieldToNotices();
}

module.exports = addAttachmentsFieldToNotices; 