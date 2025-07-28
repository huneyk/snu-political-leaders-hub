const mongoose = require('mongoose');
const galleryThumbnailService = require('../services/galleryThumbnailService');
require('dotenv').config();

// MongoDB 연결
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB 연결 성공'))
  .catch(err => {
    console.error('❌ MongoDB 연결 실패:', err);
    process.exit(1);
  });

async function generateInitialThumbnails() {
  try {
    console.log('🚀 초기 갤러리 썸네일 생성 시작');
    console.log('📋 기존 갤러리 데이터를 분석하여 기수별 썸네일을 생성합니다...\n');
    
    // 모든 기수의 썸네일 생성
    const results = await galleryThumbnailService.generateAllThumbnails();
    
    if (results.length > 0) {
      console.log('\n🎉 초기 썸네일 생성 완료!');
      console.log(`📊 총 ${results.length}개 기수의 썸네일이 생성되었습니다:`);
      
      results.forEach((thumbnail, index) => {
        console.log(`\n${index + 1}. 제${thumbnail.term}기:`);
        console.log(`   - 아이템 수: ${thumbnail.itemCount}개`);
        console.log(`   - 최신 날짜: ${new Date(thumbnail.latestDate).toLocaleDateString()}`);
        console.log(`   - 최신 제목: ${thumbnail.latestItemTitle}`);
        console.log(`   - 썸네일 URL: ${thumbnail.thumbnailUrl.substring(0, 50)}...`);
      });
      
      console.log('\n✨ 이제 갤러리 페이지에서 썸네일 기반 시스템을 사용할 수 있습니다!');
    } else {
      console.log('⚠️ 생성된 썸네일이 없습니다. 갤러리 데이터를 확인해주세요.');
    }
    
  } catch (error) {
    console.error('❌ 초기 썸네일 생성 실패:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n📡 MongoDB 연결 종료');
  }
}

generateInitialThumbnails(); 