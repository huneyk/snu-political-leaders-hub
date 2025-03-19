import mongoose from 'mongoose';

/**
 * 일정(Schedule) 스키마
 * 
 * 학사일정, 현장탐방, 해외연수, 친교활동 등의 일정 정보를 저장합니다.
 * 기수별로 구분되어 관리됩니다.
 * 관리자 입력 형식에 맞게 설계되었습니다.
 */
const scheduleSchema = new mongoose.Schema({
  // 기수 (ex: '25', '26'...)
  term: {
    type: String,
    required: true,
    trim: true
  },
  
  // 년도 (ex: '2024')
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
    default: 'academic'
  },
  
  // 일정 제목
  title: {
    type: String,
    required: true,
    trim: true
  },
  
  // 일정 날짜 (관리자 페이지에서 'mm/dd/yyyy' 형식으로 입력됨)
  date: {
    type: Date,
    required: true
  },
  
  // 일정 시간 (30분 단위 드롭다운 메뉴로 입력됨)
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
  
  // 활성 상태 (비활성 일정은 웹사이트에 표시되지 않음)
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true // createdAt, updatedAt 자동 생성
});

// 날짜별 정렬을 위한 인덱스
scheduleSchema.index({ date: 1 });

export default mongoose.model('Schedule', scheduleSchema); 