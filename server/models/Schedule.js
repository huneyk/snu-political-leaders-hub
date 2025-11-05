const mongoose = require('mongoose');

// 세션 스키마 정의
const sessionSchema = new mongoose.Schema({
  title: String,
  description: String,
  speaker: String,
  time: String
}, { _id: false });

// 일정 스키마 정의
const scheduleSchema = new mongoose.Schema({
  term: {
    type: Number,
    default: 1
  },
  year: {
    type: String,
    default: new Date().getFullYear().toString()
  },
  category: {
    type: String,
    enum: ['academic', 'special', 'field', 'overseas', 'social', 'other'],
    default: 'academic'
  },
  title: String,
  date: {
    type: Date,
    default: Date.now
  },
  time: String,
  location: String,
  description: String,
  sessions: [sessionSchema],
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
  collection: 'schedules',
  strict: false // 스키마에 정의되지 않은 필드도 허용
});

module.exports = mongoose.model('Schedule', scheduleSchema); 