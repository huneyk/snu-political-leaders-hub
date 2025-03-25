const express = require('express');
const router = express.Router();

// 더미 공지사항 데이터
const dummyNotices = [
  {
    id: 1,
    title: '2025년 정치리더스과정 모집 안내',
    content: '2025년 정치리더스과정 신입생을 모집합니다. 자세한 내용은 본문을 참조하세요.',
    author: '관리자',
    createdAt: '2025-01-05T09:00:00Z',
    isImportant: true
  },
  {
    id: 2,
    title: '2025년 1학기 강의 일정 안내',
    content: '2025년 1학기 강의 일정이 확정되었습니다. 자세한 내용은 본문을 참조하세요.',
    author: '교학처',
    createdAt: '2025-01-10T10:30:00Z',
    isImportant: false
  },
  {
    id: 3,
    title: '특별 강연 안내: 글로벌 리더십',
    content: '글로벌 리더십을 주제로 특별 강연이 진행됩니다. 많은 참여 바랍니다.',
    author: '교학처',
    createdAt: '2025-01-15T11:00:00Z',
    isImportant: false
  }
];

// 모든 공지사항 가져오기 (공개)
router.get('/', (req, res) => {
  try {
    console.log('공지사항 조회 요청 수신');
    console.log(`응답 데이터: ${JSON.stringify(dummyNotices)}`);
    
    res.json(dummyNotices);
  } catch (error) {
    console.error('공지사항 조회 실패:', error);
    res.status(500).json({ message: '공지사항을 가져오는 중 오류가 발생했습니다.' });
  }
});

// 특정 공지사항 가져오기
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const notice = dummyNotices.find(n => n.id === parseInt(id));
    
    if (!notice) {
      return res.status(404).json({ message: '해당 공지사항을 찾을 수 없습니다.' });
    }
    
    res.json(notice);
  } catch (error) {
    console.error(`공지사항 ID ${req.params.id} 조회 실패:`, error);
    res.status(500).json({ message: '공지사항을 가져오는 중 오류가 발생했습니다.' });
  }
});

module.exports = router; 