const mongoose = require('mongoose');

const lecturerSchema = new mongoose.Schema({
  name: String,
  imageUrl: String,
  biography: String,
  term: {
    type: String,
    default: "1"
  },
  category: {
    type: String,
    default: "특별강사진"
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { 
  collection: 'lecturers',
  strict: false // 스키마에 정의되지 않은 필드도 허용
});

module.exports = mongoose.model('Lecturer', lecturerSchema); 