import mongoose from 'mongoose';

// 개별 교수 정보를 위한 스키마
const professorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  position: {
    type: String,
    required: true,
    trim: true
  },
  organization: {
    type: String,
    required: true,
    trim: true
  },
  profile: {
    type: String,
    trim: true
  }
});

// 교수진 섹션 스키마
const professorSectionSchema = new mongoose.Schema({
  sectionTitle: {
    type: String,
    required: true,
    trim: true
  },
  professors: {
    type: [professorSchema],
    required: true,
    validate: {
      validator: function(professors) {
        return professors.length > 0;
      },
      message: '최소 1명 이상의 교수 정보가 필요합니다.'
    }
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

export default mongoose.model('ProfessorSection', professorSectionSchema); 