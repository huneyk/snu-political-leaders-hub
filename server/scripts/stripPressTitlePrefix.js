/**
 * 1회성 정리 스크립트:
 * Press 컬렉션의 제목에서 '[언론보도]' 표시(주변 공백 포함)를 제거합니다.
 *
 * - 제목 어디에 있든 '[언론보도]'를 단일 공백으로 치환 후 trim하여
 *   ' 📍 [언론보도] 제목... '  →  '📍 제목...' 처럼 정리됩니다.
 * - 이외의 필드는 변경하지 않습니다.
 *
 * 실행: cd server && node scripts/stripPressTitlePrefix.js
 */

const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const Press = require('../models/Press');

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

const TAG_REGEX = /\s*\[\s*언론보도\s*\]\s*/g;

const stripTag = (title) => {
  if (!title || typeof title !== 'string') return title;
  return title.replace(TAG_REGEX, ' ').replace(/\s{2,}/g, ' ').trim();
};

async function stripPressTitlePrefix() {
  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI 환경변수가 설정되지 않았습니다.');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB 연결 성공');

    const targets = await Press.find({
      title: { $regex: '\\[\\s*언론보도\\s*\\]', $options: 'i' },
    });

    console.log(`📊 대상 문서 개수: ${targets.length}`);

    if (targets.length === 0) {
      console.log('ℹ️  정리할 문서가 없습니다.');
      await mongoose.disconnect();
      return;
    }

    console.log('🔍 변경 예정 제목 목록:');
    targets.forEach((doc, idx) => {
      const newTitle = stripTag(doc.title);
      console.log(`  ${idx + 1}. "${doc.title}"`);
      console.log(`     → "${newTitle}"`);
    });

    let successCount = 0;
    let skipCount = 0;
    let failCount = 0;

    for (const doc of targets) {
      const newTitle = stripTag(doc.title);

      if (!newTitle || newTitle.length === 0) {
        skipCount += 1;
        console.warn(`  ⚠️  빈 제목이 되어 스킵 (id=${doc._id}): "${doc.title}"`);
        continue;
      }

      if (newTitle === doc.title) {
        skipCount += 1;
        continue;
      }

      try {
        await Press.updateOne(
          { _id: doc._id },
          { $set: { title: newTitle } },
          { timestamps: false }
        );
        successCount += 1;
        console.log(`  ✅ 업데이트 (id=${doc._id})`);
      } catch (err) {
        failCount += 1;
        console.error(`  ❌ 업데이트 실패 (id=${doc._id}): ${err.message}`);
      }
    }

    console.log('\n===== 정리 결과 요약 =====');
    console.log(`  대상 문서:       ${targets.length}`);
    console.log(`  업데이트 성공:   ${successCount}`);
    console.log(`  스킵:            ${skipCount}`);
    console.log(`  실패:            ${failCount}`);
    console.log('============================\n');

    await mongoose.disconnect();
    console.log('✅ MongoDB 연결 종료');
  } catch (error) {
    console.error('❌ 정리 작업 실패:', error);
    try {
      await mongoose.disconnect();
    } catch (_) {}
    process.exit(1);
  }
}

if (require.main === module) {
  stripPressTitlePrefix();
}

module.exports = stripPressTitlePrefix;
