const mongoose = require('mongoose');

// Footer 스키마 정의
const FooterSchema = new mongoose.Schema({
  wordFile: {
    type: String,
    default: ''
  },
  wordFileName: {
    type: String,
    default: ''
  },
  hwpFile: {
    type: String,
    default: ''
  },
  hwpFileName: {
    type: String,
    default: ''
  },
  pdfFile: {
    type: String,
    default: ''
  },
  pdfFileName: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    default: 'plp@snu.ac.kr'
  },
  companyName: {
    type: String,
    default: '서울대학교 정치리더스과정'
  },
  address: {
    type: String,
    default: '서울시 관악구 관악로 1 서울대학교 사회과학대학'
  },
  contactPhone: {
    type: String,
    default: '02-880-xxxx'
  },
  contactEmail: {
    type: String,
    default: 'plp@snu.ac.kr'
  },
  copyrightYear: {
    type: String,
    default: new Date().getFullYear().toString()
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

// Footer 모델 생성
const Footer = mongoose.model('Footer', FooterSchema);

module.exports = Footer; 