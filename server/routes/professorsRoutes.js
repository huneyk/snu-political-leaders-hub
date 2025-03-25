const express = require('express');
const router = express.Router();
const ProfessorSection = require('../models/ProfessorSection');
const { isAdmin } = require('../middleware/authMiddleware');

// 모든 교수진 정보 가져오기 (공개)
router.get('/', async (req, res) => {
  try {
    console.log('교수진 정보 조회 요청 수신');
    
    // MongoDB에서 교수진 데이터 가져오기
    const professorSections = await ProfessorSection.find({ isActive: true }).sort({ order: 1 });
    
    // 데이터가 없는 경우 처리
    if (!professorSections || professorSections.length === 0) {
      console.log('교수진 데이터가 없습니다.');
      return res.json([]); // 빈 배열 반환
    }
    
    console.log(`교수진 정보 조회 성공: ${professorSections.length}개 섹션 발견`);
    res.json(professorSections);
  } catch (error) {
    console.error('교수진 정보 조회 실패:', error);
    res.status(500).json({ message: '교수진 정보를 가져오는 중 오류가 발생했습니다.', error: error.message });
  }
});

// ID로 교수진 섹션 가져오기
router.get('/:id', async (req, res) => {
  try {
    const section = await ProfessorSection.findById(req.params.id);
    
    if (!section) {
      return res.status(404).json({ message: '요청한 교수진 섹션을 찾을 수 없습니다.' });
    }
    
    res.json(section);
  } catch (error) {
    console.error('교수진 섹션 조회 실패:', error);
    res.status(500).json({ message: '교수진 섹션을 가져오는 중 오류가 발생했습니다.' });
  }
});

// 교수진 섹션 추가 (관리자 전용)
router.post('/', isAdmin, async (req, res) => {
  try {
    const { sectionTitle, professors, order, isActive } = req.body;
    
    if (!sectionTitle || !professors || !Array.isArray(professors)) {
      return res.status(400).json({ message: '섹션 제목과 교수진 목록은 필수 항목입니다.' });
    }
    
    // 교수진 정보 유효성 검사
    for (const professor of professors) {
      if (!professor.name || !professor.position || !professor.organization) {
        return res.status(400).json({ message: '각 교수의 이름, 직위, 소속은 필수 항목입니다.' });
      }
    }
    
    const newSection = new ProfessorSection({
      sectionTitle,
      professors,
      order: order || 0,
      isActive: isActive !== undefined ? isActive : true,
    });
    
    const savedSection = await newSection.save();
    res.status(201).json(savedSection);
  } catch (error) {
    console.error('교수진 섹션 생성 실패:', error);
    res.status(500).json({ message: '교수진 섹션을 생성하는 중 오류가 발생했습니다.' });
  }
});

// 교수진 섹션 수정 (관리자 전용)
router.put('/:id', isAdmin, async (req, res) => {
  try {
    const { sectionTitle, professors, order, isActive } = req.body;
    
    if (!sectionTitle || !professors || !Array.isArray(professors)) {
      return res.status(400).json({ message: '섹션 제목과 교수진 목록은 필수 항목입니다.' });
    }
    
    // 교수진 정보 유효성 검사
    for (const professor of professors) {
      if (!professor.name || !professor.position || !professor.organization) {
        return res.status(400).json({ message: '각 교수의 이름, 직위, 소속은 필수 항목입니다.' });
      }
    }
    
    const updatedSection = await ProfessorSection.findByIdAndUpdate(
      req.params.id,
      {
        sectionTitle,
        professors,
        order: order || 0,
        isActive: isActive !== undefined ? isActive : true,
        updatedAt: Date.now()
      },
      { new: true }
    );
    
    if (!updatedSection) {
      return res.status(404).json({ message: '수정할 교수진 섹션을 찾을 수 없습니다.' });
    }
    
    res.json(updatedSection);
  } catch (error) {
    console.error('교수진 섹션 수정 실패:', error);
    res.status(500).json({ message: '교수진 섹션을 수정하는 중 오류가 발생했습니다.' });
  }
});

// 교수진 섹션 삭제 (관리자 전용)
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    const deletedSection = await ProfessorSection.findByIdAndDelete(req.params.id);
    
    if (!deletedSection) {
      return res.status(404).json({ message: '삭제할 교수진 섹션을 찾을 수 없습니다.' });
    }
    
    res.json({ message: '교수진 섹션이 성공적으로 삭제되었습니다.', deletedSection });
  } catch (error) {
    console.error('교수진 섹션 삭제 실패:', error);
    res.status(500).json({ message: '교수진 섹션을 삭제하는 중 오류가 발생했습니다.' });
  }
});

module.exports = router; 