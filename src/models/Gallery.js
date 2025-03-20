import mongoose from 'mongoose';

const gallerySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, '제목은 필수 입력 사항입니다.'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, '설명은 필수 입력 사항입니다.'],
    trim: true,
  },
  imageUrl: {
    type: String,
    required: [true, '이미지 URL은 필수 입력 사항입니다.'],
  },
  date: {
    type: Date,
    default: Date.now,
  },
  term: {
    type: Number,
    required: [true, '기수는 필수 입력 사항입니다.'],
    min: [1, '기수는 1 이상이어야 합니다.'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, { 
  timestamps: true 
});

// 날짜 기준 내림차순 인덱스 추가
gallerySchema.index({ date: -1 });

// 저장 전 updatedAt 필드 업데이트
gallerySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Gallery = mongoose.model('Gallery', gallerySchema);

export default Gallery; 