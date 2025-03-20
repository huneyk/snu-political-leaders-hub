const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true,
    trim: true
  },
  isImportant: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true // createdAt, updatedAt 자동 생성
});

module.exports = mongoose.model('Notice', noticeSchema); 