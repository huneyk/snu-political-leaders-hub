const mongoose = require('mongoose');

// Footer 스키마 정의
const footerSchema = new mongoose.Schema({
  wordFile: {
    type: String,
    default: ''
  },
  hwpFile: {
    type: String,
    default: ''
  },
  pdfFile: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    default: ''
  }
}, { timestamps: true });

// Footer 모델 생성
const Footer = mongoose.model('Footer', footerSchema);

module.exports = Footer; 