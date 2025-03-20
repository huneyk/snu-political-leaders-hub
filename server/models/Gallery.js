const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  title: {
    type: String, 
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  term: {
    type: Number,
    required: true,
    min: 1
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// 날짜 순 정렬을 위한 인덱스
gallerySchema.index({ date: -1 });

// 업데이트 시 updatedAt 필드 자동 갱신
gallerySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Gallery = mongoose.model('Gallery', gallerySchema);

module.exports = Gallery; 