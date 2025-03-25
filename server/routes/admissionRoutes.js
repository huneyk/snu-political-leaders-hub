const express = require('express');
const { isAdmin } = require('../middleware/authMiddleware');
const router = express.Router();

// 기본 입학 정보 객체
const admissionInfo = {
  title: '정치리더스과정 입학 안내',
  applicationPeriod: '2025년 1월 1일 ~ 2025년 2월 15일',
  processSteps: [
    {
      title: '서류 접수',
      description: '지원서, 자기소개서, 추천서 등의 서류를 제출해 주세요.',
      duration: '4주'
    },
    {
      title: '서류 심사',
      description: '제출된 서류를 바탕으로 1차 심사가 진행됩니다.',
      duration: '2주'
    },
    {
      title: '면접',
      description: '1차 서류 심사를 통과한 지원자에 한해 면접이 진행됩니다.',
      duration: '1주'
    },
    {
      title: '최종 선발',
      description: '서류와 면접 결과를 종합하여 최종 선발이 이루어집니다.',
      duration: '1주'
    }
  ],
  requirements: [
    '정치, 사회, 경제 분야에 관심이 있는 분',
    '리더십과 봉사 정신을 갖춘 분',
    '대학 졸업 이상의 학력 소지자 (또는 이에 준하는 경험 보유자)',
    '향후 정치 분야에서 활동 계획이 있는 분'
  ],
  fees: {
    applicationFee: '50,000원',
    tuitionFee: '350만원 (학기당)',
    scholarshipAvailable: true
  },
  contactInfo: {
    phone: '02-880-xxxx',
    email: 'plp-admission@snu.ac.kr',
    officeHours: '평일 9:00-17:00'
  }
};

/**
 * @route   GET /api/admission
 * @desc    입학 정보 가져오기
 * @access  Public
 */
router.get('/', (req, res) => {
  try {
    res.json(admissionInfo);
  } catch (error) {
    console.error('입학 정보 조회 실패:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

/**
 * @route   PUT /api/admission
 * @desc    입학 정보 업데이트
 * @access  Private (Admin)
 */
router.put('/', isAdmin, (req, res) => {
  try {
    // 실제 구현에서는 데이터베이스 업데이트 로직이 필요합니다
    // 여기서는 간단한 예시로 제공
    const updatedInfo = { ...admissionInfo, ...req.body };
    res.json(updatedInfo);
  } catch (error) {
    console.error('입학 정보 업데이트 실패:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

module.exports = router; 