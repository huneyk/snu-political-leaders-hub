const express = require('express');
const router = express.Router();
const multer = require('multer');
const xlsx = require('xlsx');
const Graduate = require('../models/Graduate');
const { isAdmin } = require('../middleware/authMiddleware');

// Multer 설정 (메모리 스토리지 사용)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Excel 파일만 허용
    const allowedTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Excel 파일만 업로드 가능합니다. (.xls, .xlsx)'));
    }
  }
});

// 모든 수료자 정보 가져오기 (공개 접근 가능)
router.get('/', async (req, res) => {
  try {
    // 기수별로 정렬
    const graduates = await Graduate.find().sort({ term: 1, name: 1 });
    res.json(graduates);
  } catch (error) {
    console.error('수료자 목록 조회 중 오류 발생:', error);
    res.status(500).json({ message: '수료자 목록을 불러오는 중 오류가 발생했습니다.' });
  }
});

// 기수별 수료자 정보 가져오기 (공개 접근 가능)
router.get('/term/:term', async (req, res) => {
  try {
    const { term } = req.params;
    const graduates = await Graduate.find({ term: Number(term) }).sort({ name: 1 });
    res.json(graduates);
  } catch (error) {
    console.error(`${req.params.term}기 수료자 목록 조회 중 오류 발생:`, error);
    res.status(500).json({ message: '수료자 목록을 불러오는 중 오류가 발생했습니다.' });
  }
});

// 새 수료자 정보 추가 (관리자만 접근 가능)
router.post('/', isAdmin, async (req, res) => {
  try {
    const newGraduate = new Graduate(req.body);
    const savedGraduate = await newGraduate.save();
    res.status(201).json(savedGraduate);
  } catch (error) {
    console.error('수료자 정보 추가 중 오류 발생:', error);
    res.status(400).json({ message: '수료자 정보 추가에 실패했습니다.', error: error.message });
  }
});

// 수료자 정보 수정 (관리자만 접근 가능)
router.put('/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updatedGraduate = await Graduate.findByIdAndUpdate(
      id, 
      req.body, 
      { new: true, runValidators: true }
    );
    
    if (!updatedGraduate) {
      return res.status(404).json({ message: '해당 ID의 수료자 정보를 찾을 수 없습니다.' });
    }
    
    res.json(updatedGraduate);
  } catch (error) {
    console.error('수료자 정보 수정 중 오류 발생:', error);
    res.status(400).json({ message: '수료자 정보 수정에 실패했습니다.', error: error.message });
  }
});

// 수료자 정보 삭제 (관리자만 접근 가능)
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedGraduate = await Graduate.findByIdAndDelete(id);
    
    if (!deletedGraduate) {
      return res.status(404).json({ message: '해당 ID의 수료자 정보를 찾을 수 없습니다.' });
    }
    
    res.json({ message: '수료자 정보가 성공적으로 삭제되었습니다.', id });
  } catch (error) {
    console.error('수료자 정보 삭제 중 오류 발생:', error);
    res.status(500).json({ message: '수료자 정보 삭제에 실패했습니다.' });
  }
});

// 여러 수료자 정보 일괄 추가 (관리자만 접근 가능)
router.post('/batch', isAdmin, async (req, res) => {
  try {
    if (!Array.isArray(req.body)) {
      return res.status(400).json({ message: '배열 형태의 데이터가 필요합니다.' });
    }
    
    const graduates = await Graduate.insertMany(req.body);
    res.status(201).json(graduates);
  } catch (error) {
    console.error('수료자 정보 일괄 추가 중 오류 발생:', error);
    res.status(400).json({ message: '수료자 정보 일괄 추가에 실패했습니다.', error: error.message });
  }
});

// Excel 파일 업로드로 수료자 일괄 추가 (관리자만 접근 가능)
router.post('/upload-excel', isAdmin, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Excel 파일이 필요합니다.' });
    }

    // Excel 파일 읽기
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // JSON으로 변환
    const data = xlsx.utils.sheet_to_json(worksheet);
    
    if (data.length === 0) {
      return res.status(400).json({ message: 'Excel 파일에 데이터가 없습니다.' });
    }

    // 데이터 변환 및 검증
    const graduates = data.map((row, index) => {
      // 컬럼명 매핑 (한글/영문 모두 지원)
      const term = row['기수'] || row['term'] || row['Term'];
      const name = row['성명'] || row['name'] || row['Name'] || row['이름'];
      const organization = row['소속'] || row['organization'] || row['Organization'];
      const position = row['직위'] || row['position'] || row['Position'] || row['직책'];

      // 필수 필드 검증
      if (!term || !name) {
        throw new Error(`${index + 2}행: 기수와 성명은 필수 항목입니다.`);
      }

      return {
        term: Number(term),
        name: String(name).trim(),
        organization: organization ? String(organization).trim() : '',
        position: position ? String(position).trim() : '',
        isGraduated: true
      };
    });

    // MongoDB에 일괄 저장
    const savedGraduates = await Graduate.insertMany(graduates);
    
    res.status(201).json({
      message: `${savedGraduates.length}명의 수료자 정보가 추가되었습니다.`,
      count: savedGraduates.length,
      graduates: savedGraduates
    });
  } catch (error) {
    console.error('Excel 파일 업로드 중 오류 발생:', error);
    res.status(400).json({ 
      message: 'Excel 파일 업로드에 실패했습니다.', 
      error: error.message 
    });
  }
});

module.exports = router; 