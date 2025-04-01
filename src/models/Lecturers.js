import mongoose from 'mongoose';

const lecturerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  title: {
    type: String,
    trim: true
  },
  organization: {
    type: String,
    trim: true
  },
  position: {
    type: String,
    trim: true
  },
  imageUrl: {
    type: String
  },
  biography: {
    type: String
  },
  specialization: {
    type: String,
    trim: true
  },
  lectures: {
    type: [String],
    default: []
  },
  term: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    default: '특별강사진'
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

// 기수별, 카테고리별 그룹화를 위한 인덱스 설정
lecturerSchema.index({ term: 1, category: 1, order: 1 });

export default mongoose.model('Lecturer', lecturerSchema); 