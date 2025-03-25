const mongoose = require('mongoose');

const professorSchema = new mongoose.Schema({
  name: String,
  position: String,
  organization: String,
  profile: String
});

const professorSectionSchema = new mongoose.Schema({
  sectionTitle: String,
  professors: [professorSchema],
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
  collection: 'professorsections',
  strict: false // 스키마에 정의되지 않은 필드도 허용
});

module.exports = mongoose.model('ProfessorSection', professorSectionSchema); 