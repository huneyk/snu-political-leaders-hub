import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true,
    default: ''
  }
});

const documentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  }
});

const admissionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    default: '서울대학교 정치리더십과정'
  },
  term: {
    type: Number,
    required: true,
    validate: {
      validator: function(v) {
        return Number.isInteger(v) && v > 0;
      },
      message: '기수는 양의 정수여야 합니다.'
    }
  },
  year: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^\d{4}$/.test(v);
      },
      message: '연도는 4자리 숫자여야 합니다.'
    }
  },
  startMonth: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function(v) {
        const num = parseInt(v, 10);
        return !isNaN(num) && num >= 1 && num <= 12;
      },
      message: '월은 1부터 12 사이의 숫자여야 합니다.'
    }
  },
  endMonth: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function(v) {
        const num = parseInt(v, 10);
        return !isNaN(num) && num >= 1 && num <= 12;
      },
      message: '월은 1부터 12 사이의 숫자여야 합니다.'
    }
  },
  endYear: {
    type: String,
    required: false,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true; // 선택적 필드이므로 빈 값도 허용
        return /^\d{4}$/.test(v);
      },
      message: '종료 연도는 4자리 숫자여야 합니다.'
    }
  },
  capacity: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^\d+$/.test(v);
      },
      message: '모집 인원은 숫자여야 합니다.'
    }
  },
  // 지원 자격 내용
  qualificationContent: {
    type: String,
    required: true,
    trim: true,
    default: '다음 중 하나 이상에 해당하는 전·현직자'
  },
  // 지원자격 모집대상 (복수 항목)
  targets: {
    type: [itemSchema],
    required: true,
    default: [
      { text: '국회의원, 전직 국회의원' },
      { text: '정당 소속 정치인' },
      { text: '정부 고위 공직자' }
    ],
    validate: {
      validator: function(v) {
        return v.length > 0;
      },
      message: '최소 1개 이상의 모집 대상이 필요합니다.'
    }
  },
  // 지원방법 내용
  applicationMethodContent: {
    type: String,
    trim: true,
    default: ''
  },
  // 지원서류 (복수 항목)
  requiredDocuments: {
    type: [documentSchema],
    default: [
      { name: '입학지원서', description: '' },
      { name: '재직증명서 또는 경력증명서', description: '이메일 접수 시, 사진 촬영 사본 제출 가능' },
      { name: '증명사진', description: '1매' },
      { name: '개인정보수집이용동의서', description: '' }
    ]
  },
  // 접수방법
  applicationProcessContent: {
    type: String,
    trim: true,
    default: '홈페이지(plpsnu.ne.kr)에서 다운로드, 우편 또는 이메일 접수'
  },
  // 접수처
  applicationAddress: {
    type: String,
    trim: true,
    default: '우편 접수 주소: (08826) 서울특별시 관악구 관악로 1 서울대학교 아시아연구소 517호 정치지도자과정\n이메일 접수 주소: plp@snu.ac.kr'
  },
  // 전형일정
  scheduleContent: {
    type: String,
    trim: true,
    default: '원서 교부 및 접수 기간: 2025년 1월 10일 ~ 2월 15일'
  },
  // 교육 장소
  educationLocation: {
    type: String,
    trim: true,
    default: '서울대학교 행정대학원'
  },
  // 수업 일정
  classSchedule: {
    type: String,
    trim: true,
    default: '매주 금요일 14:00~17:30'
  },
  // 교육비
  tuitionFee: {
    type: String,
    trim: true,
    default: '500만원'
  },
  // 기타 추가 항목 (복수 항목)
  additionalItems: {
    type: [itemSchema],
    default: []
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Admission', admissionSchema); 