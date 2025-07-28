const mongoose = require('mongoose');
const galleryThumbnailService = require('../services/galleryThumbnailService');

// 환경 변수에서 MongoDB URI 가져오기
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI 환경 변수가 설정되지 않았습니다.');
  process.exit(1);
}

// MongoDB 연결
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ 프로덕션 MongoDB 연결 성공'))
  .catch(err => {
    console.error('❌ 프로덕션 MongoDB 연결 실패:', err);
    process.exit(1);
  });

async function setupProductionThumbnails() {
  try {
    console.log('🚀 프로덕션 환경 썸네일 설정 시작');
    
    // 기존 썸네일 확인
    const existingThumbnails = await galleryThumbnailService.getAllThumbnails();
    console.log(`📊 기존 썸네일 개수: ${existingThumbnails.length}개`);
    
    if (existingThumbnails.length > 0) {
      console.log('✅ 기존 썸네일이 존재합니다:');
      existingThumbnails.forEach(thumb => {
        console.log(`  - 제${thumb.term}기: ${thumb.itemCount}개 항목`);
      });
    }
    
    // 모든 기수의 썸네일 생성/업데이트
    console.log('\n🖼️ 썸네일 생성/업데이트 시작...');
    const results = await galleryThumbnailService.generateAllThumbnails();
    
    if (results.length > 0) {
      console.log('\n🎉 프로덕션 썸네일 설정 완료!');
      console.log(`📊 총 ${results.length}개 기수의 썸네일이 설정되었습니다:`);
      
      results.forEach((thumbnail, index) => {
        console.log(`\n${index + 1}. 제${thumbnail.term}기:`);
        console.log(`   - 아이템 수: ${thumbnail.itemCount}개`);
        console.log(`   - 최신 날짜: ${new Date(thumbnail.latestDate).toLocaleDateString()}`);
        console.log(`   - 최신 제목: ${thumbnail.latestItemTitle}`);
      });
      
      console.log('\n✨ 프로덕션 갤러리 페이지에서 썸네일을 확인할 수 있습니다!');
    } else {
      console.log('⚠️ 생성된 썸네일이 없습니다. 갤러리 데이터를 확인해주세요.');
    }
    
  } catch (error) {
    console.error('❌ 프로덕션 썸네일 설정 실패:', error);
    throw error;
  } finally {
    mongoose.connection.close();
    console.log('\n📡 MongoDB 연결 종료');
  }
}

// 즉시 실행
setupProductionThumbnails()
  .then(() => {
    console.log('✅ 프로덕션 썸네일 설정 완료');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ 프로덕션 썸네일 설정 실패:', error);
    process.exit(1);
  }); 