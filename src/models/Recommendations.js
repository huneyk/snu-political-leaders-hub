import mongoose from 'mongoose';

const recommendationSchema = new mongoose.Schema({
  sectionTitle: {
    type: String,
    default: '추천의 글',
    trim: true
  },
  title: {
    type: String,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  position: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String
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

export default mongoose.model('Recommendation', recommendationSchema); 