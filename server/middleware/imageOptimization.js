const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

/**
 * 이미지 최적화 미들웨어
 * - 이미지 압축
 * - WebP 변환
 * - 다중 크기 생성 (반응형 이미지 지원)
 */

class ImageOptimizer {
  constructor() {
    this.supportedFormats = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    this.imageSizes = {
      thumbnail: 150,
      small: 300,
      medium: 600,
      large: 1200,
      original: null
    };
  }

  /**
   * 파일이 이미지인지 확인
   */
  isImage(filename) {
    const ext = path.extname(filename).toLowerCase();
    return this.supportedFormats.includes(ext);
  }

  /**
   * 이미지 압축 및 최적화
   */
  async optimizeImage(inputPath, outputDir, originalFilename) {
    try {
      const baseName = path.parse(originalFilename).name;
      const optimizedImages = {};

      // Sharp 인스턴스 생성
      const image = sharp(inputPath);
      const metadata = await image.metadata();

      console.log(`🖼️ 이미지 최적화 시작: ${originalFilename} (${metadata.width}x${metadata.height})`);

      // 각 크기별로 이미지 생성
      for (const [sizeName, width] of Object.entries(this.imageSizes)) {
        const outputPath = path.join(outputDir, `${baseName}_${sizeName}.webp`);
        
        let processedImage = image.clone();

        if (width && metadata.width > width) {
          processedImage = processedImage.resize(width, null, {
            withoutEnlargement: true,
            fastShrinkOnLoad: true
          });
        }

        // WebP로 변환 및 압축
        await processedImage
          .webp({
            quality: this.getQualityForSize(sizeName),
            effort: 4, // 압축 노력 수준 (0-6)
            progressive: true
          })
          .toFile(outputPath);

        const stats = await fs.stat(outputPath);
        
        optimizedImages[sizeName] = {
          path: outputPath,
          filename: `${baseName}_${sizeName}.webp`,
          size: stats.size,
          width: width || metadata.width
        };

        console.log(`✅ ${sizeName} 이미지 생성: ${stats.size} bytes`);
      }

      // 원본 이미지 삭제 (최적화된 버전만 유지)
      try {
        await fs.unlink(inputPath);
        console.log(`🗑️ 원본 이미지 삭제: ${inputPath}`);
      } catch (err) {
        console.warn(`⚠️ 원본 이미지 삭제 실패: ${err.message}`);
      }

      return optimizedImages;
    } catch (error) {
      console.error('이미지 최적화 실패:', error);
      throw error;
    }
  }

  /**
   * 크기별 품질 설정
   */
  getQualityForSize(sizeName) {
    const qualityMap = {
      thumbnail: 75,
      small: 80,
      medium: 85,
      large: 90,
      original: 95
    };
    return qualityMap[sizeName] || 85;
  }

  /**
   * 이미지 업로드 후처리 미들웨어
   */
  processUploadedImage() {
    return async (req, res, next) => {
      if (!req.file || !this.isImage(req.file.filename)) {
        return next();
      }

      try {
        const uploadDir = path.dirname(req.file.path);
        const optimizedImages = await this.optimizeImage(
          req.file.path,
          uploadDir,
          req.file.originalname
        );

        // req.file에 최적화된 이미지 정보 추가
        req.optimizedImages = optimizedImages;
        req.file.optimized = true;

        // 기본적으로 medium 크기를 메인 이미지로 설정
        const mainImage = optimizedImages.medium || optimizedImages.large || optimizedImages.original;
        req.file.filename = mainImage.filename;
        req.file.path = mainImage.path;
        req.file.size = mainImage.size;

        console.log(`🎯 메인 이미지 설정: ${mainImage.filename}`);
        next();
      } catch (error) {
        console.error('이미지 처리 중 오류:', error);
        // 처리 실패해도 계속 진행
        next();
      }
    };
  }

  /**
   * 반응형 이미지 srcset 생성
   */
  generateSrcSet(baseName, baseUrl) {
    const srcset = [];
    
    for (const [sizeName, width] of Object.entries(this.imageSizes)) {
      if (width) {
        srcset.push(`${baseUrl}/${baseName}_${sizeName}.webp ${width}w`);
      }
    }
    
    return srcset.join(', ');
  }

  /**
   * 이미지 정보 응답 포맷
   */
  formatImageResponse(optimizedImages, baseUrl, originalFilename) {
    const baseName = path.parse(originalFilename).name;
    
    return {
      originalName: originalFilename,
      baseName: baseName,
      formats: {
        webp: true,
        fallback: false // WebP만 제공
      },
      sizes: Object.keys(optimizedImages).reduce((acc, sizeName) => {
        const image = optimizedImages[sizeName];
        acc[sizeName] = {
          url: `${baseUrl}/${image.filename}`,
          width: image.width,
          size: image.size
        };
        return acc;
      }, {}),
      srcset: this.generateSrcSet(baseName, baseUrl),
      defaultSize: 'medium'
    };
  }
}

module.exports = new ImageOptimizer(); 