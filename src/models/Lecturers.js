import mongoose from 'mongoose';

const lecturerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  imageUrl: {
    type: String
  },
  biography: {
    type: String
  },
  term: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['특별강사진', '서울대 정치외교학부 교수진'],
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

export default mongoose.model('Lecturer', lecturerSchema); 