const mongoose = require('mongoose');

const greetingSchema = new mongoose.Schema({
  title: String,
  content: String,
  author: String,
  position: String,
  imageUrl: String,
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
  collection: 'greetings',
  strict: false // 스키마에 정의되지 않은 필드도 허용
}); 

module.exports = mongoose.model('Greeting', greetingSchema);
