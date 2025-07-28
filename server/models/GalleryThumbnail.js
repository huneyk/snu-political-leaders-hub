const mongoose = require('mongoose');

const galleryThumbnailSchema = new mongoose.Schema({
  term: {
    type: Number,
    required: true,
    unique: true,
    index: true
  },
  thumbnailUrl: {
    type: String,
    required: true
  },
  itemCount: {
    type: Number,
    default: 0
  },
  latestDate: {
    type: Date
  },
  latestItemTitle: {
    type: String
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// 기수별 썸네일 정보 조회를 위한 인덱스
galleryThumbnailSchema.index({ term: 1, isActive: 1 });

module.exports = mongoose.model('GalleryThumbnail', galleryThumbnailSchema); 