const mongoose = require('mongoose');
const Gallery = require('../models/Gallery');
require('dotenv').config();

// MongoDB 연결
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/snu-plp')
  .then(() => console.log('MongoDB 연결 성공'))
  .catch(err => console.error('MongoDB 연결 실패:', err));

async function debugGalleryTerms() {
  try {
    console.log('🔍 갤러리 데이터베이스 분석 시작...\n');
    
    // 전체 갤러리 항목 수 확인
    const totalCount = await Gallery.countDocuments();
    console.log(`📊 전체 갤러리 항목 수: ${totalCount}개\n`);
    
    // 모든 갤러리 데이터 가져오기 (term과 title만)
    const galleries = await Gallery.find({}, { term: 1, title: 1, date: 1, _id: 1 }).sort({ term: 1, date: -1 });
    
    // 기수별 분포 계산
    const termDistribution = {};
    galleries.forEach(item => {
      const term = item.term;
      if (!termDistribution[term]) {
        termDistribution[term] = [];
      }
      termDistribution[term].push({
        id: item._id,
        title: item.title,
        date: item.date
      });
    });
    
    console.log('📈 기수별 데이터 분포:');
    console.log('=' .repeat(60));
    
    Object.keys(termDistribution).sort((a, b) => Number(a) - Number(b)).forEach(term => {
      const items = termDistribution[term];
      console.log(`제${term}기: ${items.length}개 항목`);
      
      // 각 기수의 첫 3개 항목 샘플 표시
      const sampleItems = items.slice(0, 3);
      sampleItems.forEach((item, index) => {
        const dateStr = new Date(item.date).toLocaleDateString('ko-KR');
        console.log(`  ${index + 1}. ${item.title} (${dateStr})`);
      });
      
      if (items.length > 3) {
        console.log(`  ... 외 ${items.length - 3}개 더`);
      }
      console.log('');
    });
    
    // 특정 기수 데이터 상세 확인 (예: 30기)
    console.log('\n🎯 특정 기수 데이터 상세 확인 (30기 예시):');
    console.log('=' .repeat(60));
    
    const term30Data = await Gallery.find({ term: 30 }).sort({ date: -1 });
    console.log(`제30기 총 ${term30Data.length}개 항목:`);
    
    term30Data.forEach((item, index) => {
      console.log(`${index + 1}. ${item.title}`);
      console.log(`   ID: ${item._id}`);
      console.log(`   날짜: ${new Date(item.date).toLocaleDateString('ko-KR')}`);
      console.log(`   이미지URL: ${item.imageUrl ? '있음' : '없음'}`);
      console.log('');
    });
    
    // term 필드 타입 확인
    console.log('\n🔬 데이터 타입 분석:');
    console.log('=' .repeat(60));
    
    const sampleItem = await Gallery.findOne();
    if (sampleItem) {
      console.log('샘플 항목의 term 필드:');
      console.log(`  값: ${sampleItem.term}`);
      console.log(`  타입: ${typeof sampleItem.term}`);
      console.log(`  JSON 직렬화: ${JSON.stringify(sampleItem.term)}`);
    }
    
    // 유효하지 않은 term 값 확인
    console.log('\n⚠️ 이상한 term 값 확인:');
    const invalidTerms = await Gallery.find({
      $or: [
        { term: null },
        { term: undefined },
        { term: { $type: 'string' } }, // 문자열로 저장된 경우
        { term: { $lt: 1 } }, // 1보다 작은 경우
        { term: { $gt: 100 } } // 100보다 큰 경우 (비현실적인 기수)
      ]
    });
    
    if (invalidTerms.length > 0) {
      console.log(`발견된 이상한 term 값: ${invalidTerms.length}개`);
      invalidTerms.forEach(item => {
        console.log(`  ID: ${item._id}, term: ${item.term} (타입: ${typeof item.term}), title: ${item.title}`);
      });
    } else {
      console.log('모든 term 값이 정상입니다.');
    }
    
    console.log('\n✅ 갤러리 데이터베이스 분석 완료');
    
  } catch (error) {
    console.error('❌ 분석 중 오류 발생:', error);
  } finally {
    mongoose.connection.close();
  }
}

// 스크립트 실행
debugGalleryTerms(); 