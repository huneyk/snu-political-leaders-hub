const mongoose = require('mongoose');

// 수료자 스키마 정의
const graduateSchema = new mongoose.Schema({
  term: {
    type: Number,
    required: true,
    min: 1
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  isGraduated: {
    type: Boolean,
    default: true
  },
  graduationDate: {
    type: Date
  },
  organization: {
    type: String,
    trim: true
  },
  position: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 업데이트 전 updatedAt 필드 자동 갱신
graduateSchema.pre('findOneAndUpdate', function() {
  this.set({ updatedAt: new Date() });
});

module.exports = mongoose.model('Graduate', graduateSchema); 