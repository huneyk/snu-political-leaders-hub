const mongoose = require('mongoose');

const objectiveSchema = new mongoose.Schema({
  sectionTitle: String,
  title: String,
  description: String,
  iconType: String,
  iconImage: String,
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
  collection: 'objectives',
  strict: false // 스키마에 정의되지 않은 필드도 허용
}); 

module.exports = mongoose.model('Objective', objectiveSchema);

