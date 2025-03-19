import mongoose from 'mongoose';

const objectiveSchema = new mongoose.Schema({
  sectionTitle: {
    type: String,
    default: '과정의 목표',
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  iconType: {
    type: String,
    default: 'default'
  },
  iconImage: {
    type: String, // Base64 또는 URL 문자열
    default: ''
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Objective', objectiveSchema); 