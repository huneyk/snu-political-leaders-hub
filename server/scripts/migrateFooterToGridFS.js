const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');
const { Readable } = require('stream');
const dotenv = require('dotenv');

// 환경 변수 로드
dotenv.config();

// 모델 임포트
const Footer = require('../models/Footer');

/**
 * Footer 파일을 Base64에서 GridFS로 마이그레이션
 */
async function migrateFooterToGridFS() {
  try {
    console.log('🚀 Footer 파일 GridFS 마이그레이션 시작...\n');

    // MongoDB 연결
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB 연결 성공\n');

    // GridFS 버킷 생성
    const bucket = new GridFSBucket(mongoose.connection.db, {
      bucketName: 'footerFiles'
    });

    // 모든 Footer 문서 조회
    const footers = await Footer.find({});
    console.log(`📊 총 ${footers.length}개의 Footer 문서 발견\n`);

    if (footers.length === 0) {
      console.log('⚠️  Footer 문서가 없습니다.');
      return;
    }

    let totalMigrated = 0;
    let totalSkipped = 0;
    let totalErrors = 0;

    for (const footer of footers) {
      console.log(`\n처리 중: Footer 문서 (ID: ${footer._id})`);
      
      // Word 파일 마이그레이션
      if (footer.wordFile && footer.wordFile.startsWith('data:')) {
        try {
          const fileId = await migrateFile(
            bucket,
            footer.wordFile,
            footer.wordFileName || '입학지원서.docx',
            'wordFile'
          );
          
          footer.wordFileId = fileId;
          footer.wordFile = undefined; // Base64 데이터 제거
          console.log(`  ✅ Word 파일 마이그레이션 완료: ${fileId}`);
          totalMigrated++;
        } catch (error) {
          console.error(`  ❌ Word 파일 마이그레이션 실패:`, error.message);
          totalErrors++;
        }
      } else if (footer.wordFile) {
        console.log(`  ⏭️  Word 파일 건너뜀: 이미 마이그레이션됨 또는 Base64 아님`);
        totalSkipped++;
      }

      // HWP 파일 마이그레이션
      if (footer.hwpFile && footer.hwpFile.startsWith('data:')) {
        try {
          const fileId = await migrateFile(
            bucket,
            footer.hwpFile,
            footer.hwpFileName || '입학지원서.hwp',
            'hwpFile'
          );
          
          footer.hwpFileId = fileId;
          footer.hwpFile = undefined; // Base64 데이터 제거
          console.log(`  ✅ HWP 파일 마이그레이션 완료: ${fileId}`);
          totalMigrated++;
        } catch (error) {
          console.error(`  ❌ HWP 파일 마이그레이션 실패:`, error.message);
          totalErrors++;
        }
      } else if (footer.hwpFile) {
        console.log(`  ⏭️  HWP 파일 건너뜀: 이미 마이그레이션됨 또는 Base64 아님`);
        totalSkipped++;
      }

      // PDF 파일 마이그레이션
      if (footer.pdfFile && footer.pdfFile.startsWith('data:')) {
        try {
          const fileId = await migrateFile(
            bucket,
            footer.pdfFile,
            footer.pdfFileName || '과정안내서.pdf',
            'pdfFile'
          );
          
          footer.pdfFileId = fileId;
          footer.pdfFile = undefined; // Base64 데이터 제거
          console.log(`  ✅ PDF 파일 마이그레이션 완료: ${fileId}`);
          totalMigrated++;
        } catch (error) {
          console.error(`  ❌ PDF 파일 마이그레이션 실패:`, error.message);
          totalErrors++;
        }
      } else if (footer.pdfFile) {
        console.log(`  ⏭️  PDF 파일 건너뜀: 이미 마이그레이션됨 또는 Base64 아님`);
        totalSkipped++;
      }

      // Footer 문서 업데이트
      footer.updatedAt = new Date();
      await footer.save();
      console.log(`  💾 Footer 문서 업데이트 완료`);
    }

    // 결과 출력
    console.log('\n\n' + '='.repeat(60));
    console.log('📊 마이그레이션 결과 요약');
    console.log('='.repeat(60));
    console.log(`✅ 성공: ${totalMigrated}개 파일`);
    console.log(`⏭️  건너뜀: ${totalSkipped}개 파일`);
    console.log(`❌ 실패: ${totalErrors}개 파일`);
    console.log('='.repeat(60));

    if (totalMigrated > 0) {
      console.log('\n\n✅ Footer 파일이 GridFS로 성공적으로 마이그레이션되었습니다!');
      console.log('💡 이제 /admin/footer 페이지에서 파일을 다운로드할 수 있습니다.');
    } else {
      console.log('\n\n⚠️  마이그레이션할 Base64 파일이 없습니다.');
    }

  } catch (error) {
    console.error('\n❌ 마이그레이션 실패:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ MongoDB 연결 종료\n');
  }
}

/**
 * 단일 파일을 GridFS로 마이그레이션
 */
async function migrateFile(bucket, base64Data, fileName, fileType) {
  // Base64 데이터 파싱
  const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new Error('유효하지 않은 Base64 형식');
  }

  const mimeType = matches[1];
  const base64String = matches[2];

  // Base64를 Buffer로 변환
  const buffer = Buffer.from(base64String, 'base64');
  console.log(`  📦 파일 크기: ${(buffer.length / 1024).toFixed(2)} KB`);

  // 파일명 생성 (타임스탬프 추가)
  const timestamp = Date.now();
  const finalFileName = `${fileType}_${timestamp}_${fileName}`;

  // GridFS에 업로드
  const readableStream = Readable.from(buffer);
  const uploadStream = bucket.openUploadStream(finalFileName, {
    contentType: mimeType,
    metadata: {
      fileType: fileType,
      originalName: fileName,
      uploadDate: new Date(),
      source: 'migration'
    }
  });

  // 스트림 파이프를 Promise로 래핑
  const fileId = await new Promise((resolve, reject) => {
    readableStream.pipe(uploadStream)
      .on('error', reject)
      .on('finish', () => {
        resolve(uploadStream.id);
      });
  });

  return fileId;
}

// 스크립트 실행
if (require.main === module) {
  migrateFooterToGridFS()
    .then(() => {
      console.log('🎉 마이그레이션 완료!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 마이그레이션 실패:', error);
      process.exit(1);
    });
}

module.exports = migrateFooterToGridFS;

