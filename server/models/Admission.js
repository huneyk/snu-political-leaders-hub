const mongoose = require('mongoose');

const targetSchema = new mongoose.Schema({
  text: String
});

const requiredDocumentSchema = new mongoose.Schema({
  name: String,
  description: String
});

const additionalItemSchema = new mongoose.Schema({
  text: String
});

const admissionSchema = new mongoose.Schema({
  title: String,
  term: Number,
  year: String,
  startMonth: String,
  endMonth: String,
  endYear: String,
  capacity: String,
  qualificationContent: String,
  targets: [targetSchema],
  applicationMethodContent: String,
  requiredDocuments: [requiredDocumentSchema],
  applicationProcessContent: String,
  applicationAddress: String,
  scheduleContent: String,
  educationLocation: String,
  classSchedule: String,
  tuitionFee: String,
  additionalItems: [additionalItemSchema],
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
  collection: 'admissions',
  strict: false // 스키마에 정의되지 않은 필드도 허용
});

module.exports = mongoose.model('Admission', admissionSchema); 