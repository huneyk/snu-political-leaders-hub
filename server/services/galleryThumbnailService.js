const Gallery = require('../models/Gallery');
const GalleryThumbnail = require('../models/GalleryThumbnail');

class GalleryThumbnailService {
  
  // 특정 기수의 썸네일 생성/업데이트
  async generateThumbnailForTerm(termNumber) {
    try {
      console.log(`🖼️ 제${termNumber}기 썸네일 생성 시작`);
      
      // 해당 기수의 갤러리 아이템들 조회 (이미지가 있는 것만, 최신순)
      const galleryItems = await Gallery.find({ 
        term: termNumber,
        imageUrl: { $exists: true, $ne: '' }
      }).sort({ date: -1 });
      
      if (galleryItems.length === 0) {
        console.log(`⚠️ 제${termNumber}기에 이미지가 있는 갤러리 아이템이 없습니다.`);
        return null;
      }
      
      // 썸네일로 사용할 이미지 선택 (첫 번째 이미지)
      const thumbnailItem = galleryItems[0];
      const latestDate = galleryItems[0].date;
      
      // 기존 썸네일 정보 조회
      let existingThumbnail = await GalleryThumbnail.findOne({ term: termNumber });
      
      const thumbnailData = {
        term: termNumber,
        thumbnailUrl: thumbnailItem.imageUrl,
        itemCount: galleryItems.length,
        latestDate: latestDate,
        latestItemTitle: thumbnailItem.title,
        lastUpdated: new Date(),
        isActive: true
      };
      
      if (existingThumbnail) {
        // 기존 썸네일 업데이트
        await GalleryThumbnail.findOneAndUpdate(
          { term: termNumber },
          thumbnailData,
          { new: true }
        );
        console.log(`✅ 제${termNumber}기 썸네일 업데이트 완료`);
      } else {
        // 새 썸네일 생성
        const newThumbnail = new GalleryThumbnail(thumbnailData);
        await newThumbnail.save();
        console.log(`✅ 제${termNumber}기 썸네일 생성 완료`);
      }
      
      return thumbnailData;
      
    } catch (error) {
      console.error(`❌ 제${termNumber}기 썸네일 생성 실패:`, error);
      throw error;
    }
  }
  
  // 모든 기수의 썸네일 생성/업데이트
  async generateAllThumbnails() {
    try {
      console.log('🖼️ 모든 기수 썸네일 생성 시작');
      
      // 갤러리에서 실제 존재하는 기수들 조회
      const existingTerms = await Gallery.distinct('term');
      console.log(`📋 발견된 기수들: ${existingTerms.join(', ')}`);
      
      const results = [];
      
      for (const term of existingTerms) {
        if (term != null) {
          const result = await this.generateThumbnailForTerm(term);
          if (result) {
            results.push(result);
          }
        }
      }
      
      console.log(`✅ 총 ${results.length}개 기수의 썸네일 생성 완료`);
      return results;
      
    } catch (error) {
      console.error('❌ 전체 썸네일 생성 실패:', error);
      throw error;
    }
  }
  
  // 모든 활성 썸네일 조회
  async getAllThumbnails() {
    try {
      const thumbnails = await GalleryThumbnail.find({ isActive: true }).sort({ term: 1 });
      console.log(`📋 활성 썸네일 ${thumbnails.length}개 조회 완료`);
      return thumbnails;
    } catch (error) {
      console.error('❌ 썸네일 목록 조회 실패:', error);
      throw error;
    }
  }
  
  // 특정 기수의 썸네일 조회
  async getThumbnailByTerm(termNumber) {
    try {
      const thumbnail = await GalleryThumbnail.findOne({ 
        term: termNumber, 
        isActive: true 
      });
      return thumbnail;
    } catch (error) {
      console.error(`❌ 제${termNumber}기 썸네일 조회 실패:`, error);
      throw error;
    }
  }
  
  // 썸네일 삭제 (비활성화)
  async deactivateThumbnail(termNumber) {
    try {
      await GalleryThumbnail.findOneAndUpdate(
        { term: termNumber },
        { isActive: false },
        { new: true }
      );
      console.log(`✅ 제${termNumber}기 썸네일 비활성화 완료`);
    } catch (error) {
      console.error(`❌ 제${termNumber}기 썸네일 비활성화 실패:`, error);
      throw error;
    }
  }
  
  // 새로운 갤러리 아이템 추가 시 썸네일 자동 업데이트
  async updateThumbnailOnNewItem(galleryItem) {
    try {
      if (!galleryItem.term || !galleryItem.imageUrl) {
        return;
      }
      
      console.log(`🔄 제${galleryItem.term}기 새 아이템으로 썸네일 업데이트 확인`);
      await this.generateThumbnailForTerm(galleryItem.term);
      
    } catch (error) {
      console.error('❌ 새 아이템 썸네일 업데이트 실패:', error);
    }
  }
}

module.exports = new GalleryThumbnailService(); 