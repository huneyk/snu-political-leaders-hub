/**
 * 1회성 마이그레이션 스크립트:
 * 제목에 '[언론보도]'가 포함된 Notice 문서를 Press 컬렉션으로 이동.
 * - 제목 앞쪽의 '[언론보도]' 접두사는 자동 제거.
 * - 그 외 필드(content, author, isImportant, attachments, createdAt, updatedAt)는 그대로 보존.
 * - Press 저장이 성공한 문서만 Notice 컬렉션에서 삭제.
 *
 * 실행: cd server && node scripts/migrateNoticesToPress.js
 */

const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const Notice = require('../models/Notice');
const Press = require('../models/Press');

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

const PREFIX_REGEX = /^\s*\[\s*언론보도\s*\]\s*/;

const stripPrefix = (title) => {
  if (!title || typeof title !== 'string') return '(제목 없음)';
  const stripped = title.replace(PREFIX_REGEX, '').trim();
  return stripped.length > 0 ? stripped : '(제목 없음)';
};

async function migrateNoticesToPress() {
  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI 환경변수가 설정되지 않았습니다.');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB 연결 성공');

    const targets = await Notice.find({
      title: { $regex: '\\[\\s*언론보도\\s*\\]', $options: 'i' },
    });

    console.log(`📊 대상 문서 개수: ${targets.length}`);

    if (targets.length === 0) {
      console.log('ℹ️  마이그레이션할 문서가 없습니다.');
      await mongoose.disconnect();
      return;
    }

    console.log('🔍 마이그레이션 대상 제목 목록:');
    targets.forEach((doc, idx) => {
      const newTitle = stripPrefix(doc.title);
      console.log(`  ${idx + 1}. "${doc.title}"  →  "${newTitle}"`);
    });

    const migratedNoticeIds = [];
    let successCount = 0;
    let failCount = 0;

    for (const notice of targets) {
      try {
        const pressDoc = new Press({
          title: stripPrefix(notice.title),
          content: notice.content,
          author: notice.author,
          isImportant: notice.isImportant || false,
          attachments: notice.attachments || [],
        });

        // timestamps 보존: save 후 createdAt/updatedAt 강제 덮어쓰기
        const saved = await pressDoc.save();
        await Press.updateOne(
          { _id: saved._id },
          {
            $set: {
              createdAt: notice.createdAt,
              updatedAt: notice.updatedAt,
            },
          },
          { timestamps: false }
        );

        migratedNoticeIds.push(notice._id);
        successCount += 1;
        console.log(`  ✅ 이동 성공 (Press._id=${saved._id}): "${notice.title}"`);
      } catch (err) {
        failCount += 1;
        console.error(`  ❌ 이동 실패: "${notice.title}" - ${err.message}`);
      }
    }

    let deletedCount = 0;
    if (migratedNoticeIds.length > 0) {
      const deleteResult = await Notice.deleteMany({ _id: { $in: migratedNoticeIds } });
      deletedCount = deleteResult.deletedCount || 0;
      console.log(`🗑️  Notice 컬렉션에서 ${deletedCount}개 문서 삭제 완료`);
    }

    console.log('\n===== 마이그레이션 결과 요약 =====');
    console.log(`  대상 문서:       ${targets.length}`);
    console.log(`  이동 성공:       ${successCount}`);
    console.log(`  이동 실패:       ${failCount}`);
    console.log(`  Notice 삭제:     ${deletedCount}`);
    console.log('==================================\n');

    await mongoose.disconnect();
    console.log('✅ MongoDB 연결 종료');
  } catch (error) {
    console.error('❌ 마이그레이션 실패:', error);
    try {
      await mongoose.disconnect();
    } catch (_) {}
    process.exit(1);
  }
}

if (require.main === module) {
  migrateNoticesToPress();
}

module.exports = migrateNoticesToPress;
