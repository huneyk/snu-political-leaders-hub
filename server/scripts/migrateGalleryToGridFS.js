const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');
const { Readable } = require('stream');
const dotenv = require('dotenv');

// 환경 변수 로드
dotenv.config();

// 모델 임포트
const Gallery = require('../models/Gallery');

/**
 * Gallery 이미지를 Base64에서 GridFS로 마이그레이션
 */
async function migrateGalleryToGridFS() {
  try {
    console.log('🚀 Gallery 이미지 GridFS 마이그레이션 시작...\n');

    // MongoDB 연결
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB 연결 성공\n');

    // GridFS 버킷 생성
    const bucket = new GridFSBucket(mongoose.connection.db, {
      bucketName: 'galleryImages'
    });

    // 모든 Gallery 문서 조회
    const galleries = await Gallery.find({});
    console.log(`📊 총 ${galleries.length}개의 갤러리 항목 발견\n`);

    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const gallery of galleries) {
      try {
        console.log(`\n처리 중: ${gallery.title} (ID: ${gallery._id})`);

        // Base64 이미지인지 확인
        if (!gallery.imageUrl || !gallery.imageUrl.startsWith('data:image/')) {
          console.log(`  ⏭️  건너뜀: Base64 이미지가 아님`);
          skippedCount++;
          continue;
        }

        // Base64 데이터 파싱
        const matches = gallery.imageUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
          console.log(`  ❌ Base64 파싱 실패`);
          errorCount++;
          continue;
        }

        const mimeType = matches[1]; // 예: 'image/jpeg'
        const base64Data = matches[2];

        // Base64를 Buffer로 변환
        const buffer = Buffer.from(base64Data, 'base64');
        console.log(`  📦 이미지 크기: ${(buffer.length / 1024).toFixed(2)} KB`);

        // 파일 확장자 결정
        const extensionMap = {
          'image/jpeg': '.jpg',
          'image/jpg': '.jpg',
          'image/png': '.png',
          'image/gif': '.gif',
          'image/webp': '.webp'
        };
        const extension = extensionMap[mimeType] || '.jpg';

        // 파일명 생성
        const fileName = `gallery_${gallery._id}_${gallery.term}기_${Date.now()}${extension}`;

        // GridFS에 업로드
        const readableStream = Readable.from(buffer);
        const uploadStream = bucket.openUploadStream(fileName, {
          contentType: mimeType,
          metadata: {
            galleryId: gallery._id.toString(),
            term: gallery.term,
            title: gallery.title,
            originalSize: buffer.length,
            uploadDate: new Date()
          }
        });

        // 스트림 파이프를 Promise로 래핑
        const fileId = await new Promise((resolve, reject) => {
          readableStream.pipe(uploadStream)
            .on('error', reject)
            .on('finish', () => {
              console.log(`  ✅ GridFS 업로드 완료: ${uploadStream.id}`);
              resolve(uploadStream.id);
            });
        });

        // Gallery 문서 업데이트
        gallery.imageUrl = fileId.toString();
        gallery.updatedAt = new Date();
        await gallery.save();

        console.log(`  ✅ Gallery 문서 업데이트 완료`);
        migratedCount++;

      } catch (itemError) {
        console.error(`  ❌ 오류: ${itemError.message}`);
        errorCount++;
      }
    }

    // 결과 출력
    console.log('\n\n' + '='.repeat(60));
    console.log('📊 마이그레이션 결과 요약');
    console.log('='.repeat(60));
    console.log(`✅ 성공: ${migratedCount}개`);
    console.log(`⏭️  건너뜀: ${skippedCount}개`);
    console.log(`❌ 실패: ${errorCount}개`);
    console.log(`📦 총 처리: ${galleries.length}개`);
    console.log('='.repeat(60));

    if (migratedCount > 0) {
      console.log('\n\n💡 다음 단계:');
      console.log('1. Gallery 모델 스키마 업데이트 (imageUrl을 ObjectId로 변경)');
      console.log('2. galleryRoutes에 이미지 다운로드 엔드포인트 추가');
      console.log('3. 프론트엔드에서 이미지 URL 업데이트');
    }

  } catch (error) {
    console.error('\n❌ 마이그레이션 실패:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ MongoDB 연결 종료\n');
  }
}

// 스크립트 실행
if (require.main === module) {
  migrateGalleryToGridFS()
    .then(() => {
      console.log('🎉 마이그레이션 완료!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 마이그레이션 실패:', error);
      process.exit(1);
    });
}

module.exports = migrateGalleryToGridFS;

