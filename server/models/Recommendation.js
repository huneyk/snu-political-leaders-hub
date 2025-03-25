const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema({
  sectionTitle: String,
  title: String,
  name: String,
  position: String,
  content: String,
  imageUrl: String,
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
  collection: 'recommendations',
  strict: false // 스키마에 정의되지 않은 필드도 허용
}); 

module.exports = mongoose.model('Recommendation', recommendationSchema);
