import mongoose from 'mongoose';

/**
 * 일정(Schedule) 스키마
 * 
 * 학사일정, 현장탐방, 해외연수, 친교활동 등의 일정 정보를 저장합니다.
 * 기수별로 구분되어 관리됩니다.
 */
const scheduleSchema = new mongoose.Schema({
  // 기수 (ex: '25', '26'...)
  term: {
    type: Number,
    required: true,
    trim: true,
    index: true // 기수별 검색을 위한 인덱스
  },
  
  // 년도 (ex: '2025')
  year: {
    type: String,
    required: true,
    trim: true
  },
  
  // 일정 분류
  // academic: 학사일정, field: 현장탐방, overseas: 해외연수, social: 친교활동, other: 기타
  category: {
    type: String,
    required: true,
    enum: ['academic', 'field', 'overseas', 'social', 'other'],
    default: 'academic',
    index: true // 카테고리별 검색을 위한 인덱스
  },
  
  // 일정 제목
  title: {
    type: String,
    required: true,
    trim: true
  },
  
  // 일정 날짜 (YYYY-MM-DD 형식)
  date: {
    type: Date,
    required: true
  },
  
  // 일정 시간 (HH:MM 형식)
  time: {
    type: String
  },
  
  // 일정 장소
  location: {
    type: String
  },
  
  // 일정 세부 설명
  description: {
    type: String
  },
  
  // 세션 정보 (서브 일정들)
  sessions: [{
    time: {
      type: String
    },
    title: {
      type: String,
      required: true
    },
    location: {
      type: String
    },
    description: {
      type: String
    }
  }],
  
  // 활성 상태 (비활성 일정은 웹사이트에 표시되지 않음)
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true // createdAt, updatedAt 자동 생성
});

// 인덱스 생성
scheduleSchema.index({ term: 1, category: 1 }); // 기수와 카테고리로 복합 검색
scheduleSchema.index({ date: 1 }); // 날짜별 정렬

export default mongoose.model('Schedule', scheduleSchema); 