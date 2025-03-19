import mongoose from 'mongoose';

const benefitSchema = new mongoose.Schema({
  sectionTitle: {
    type: String,
    default: '과정 특전',
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

export default mongoose.model('Benefit', benefitSchema); 