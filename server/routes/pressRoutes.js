const express = require('express');
const router = express.Router();
const Press = require('../models/Press');
const { isAdmin } = require('../middleware/authMiddleware');

// 모든 언론보도 가져오기 (공개)
router.get('/', async (req, res) => {
  try {
    console.log('📰 언론보도 조회 요청 수신');

    const pressItems = await Press.find().sort({ createdAt: -1 });

    if (!pressItems || pressItems.length === 0) {
      console.log('⚠️ 언론보도 데이터가 없습니다.');
      return res.status(404).json({ message: '언론보도 데이터를 찾을 수 없습니다.' });
    }

    console.log(`✅ 언론보도 조회 성공: ${pressItems.length}개 항목`);

    const itemsWithAttachments = pressItems.filter(p => p.attachments && p.attachments.length > 0);
    if (itemsWithAttachments.length > 0) {
      console.log(`📎 첨부파일이 있는 언론보도: ${itemsWithAttachments.length}개`);
      itemsWithAttachments.forEach(p => {
        console.log(`  - "${p.title}": ${p.attachments.length}개 파일`);
      });
    } else {
      console.log('📎 첨부파일이 있는 언론보도 없음');
    }

    res.json(pressItems);
  } catch (error) {
    console.error('❌ 언론보도 조회 실패:', error);
    res.status(500).json({ message: '언론보도를 가져오는 중 오류가 발생했습니다.', error: error.message });
  }
});

// 특정 언론보도 가져오기
router.get('/:id', async (req, res) => {
  try {
    const pressItem = await Press.findById(req.params.id);

    if (!pressItem) {
      return res.status(404).json({ message: '해당 언론보도를 찾을 수 없습니다.' });
    }

    res.json(pressItem);
  } catch (error) {
    console.error(`언론보도 ID ${req.params.id} 조회 실패:`, error);
    res.status(500).json({ message: '언론보도를 가져오는 중 오류가 발생했습니다.' });
  }
});

// 언론보도 생성 (관리자 전용)
router.post('/', isAdmin, async (req, res) => {
  try {
    console.log('=== 언론보도 생성 요청 ===');
    console.log('전체 요청 데이터 크기:', JSON.stringify(req.body).length, 'bytes');
    console.log('title:', req.body.title);
    console.log('author:', req.body.author);
    console.log('첨부파일 데이터 타입:', typeof req.body.attachments);
    console.log('첨부파일 개수:', Array.isArray(req.body.attachments) ? req.body.attachments.length : 0);

    if (req.body.attachments && Array.isArray(req.body.attachments) && req.body.attachments.length > 0) {
      console.log('📎 첨부파일 상세 정보:');
      req.body.attachments.forEach((att, idx) => {
        console.log(`  파일 ${idx + 1}:`, {
          id: att.id,
          name: att.name,
          size: att.size,
          type: att.type,
          urlLength: att.url ? att.url.length : 0
        });
      });
    } else {
      console.log('⚠️ 첨부파일이 없거나 비어있음');
    }

    const { title, content, author, isImportant, attachments } = req.body;

    const pressItem = new Press({
      title,
      content,
      author,
      isImportant: isImportant || false,
      attachments: attachments || []
    });

    console.log('📝 저장할 언론보도 attachments 개수:', pressItem.attachments.length);

    const savedItem = await pressItem.save();

    console.log('✅ 저장 완료!');
    console.log('💾 MongoDB에 저장된 attachments 개수:', savedItem.attachments.length);
    if (savedItem.attachments.length > 0) {
      console.log('💾 첫 번째 첨부파일:', {
        id: savedItem.attachments[0].id,
        name: savedItem.attachments[0].name,
        size: savedItem.attachments[0].size
      });
    }

    res.status(201).json(savedItem);
  } catch (error) {
    console.error('❌ 언론보도 생성 오류:', error);
    console.error('❌ 에러 스택:', error.stack);
    res.status(500).json({ message: '언론보도 생성 실패', error: error.message });
  }
});

// 언론보도 수정 (관리자 전용)
router.put('/:id', isAdmin, async (req, res) => {
  try {
    console.log('=== 언론보도 수정 요청 ===');
    console.log('수정할 ID:', req.params.id);
    console.log('전체 요청 데이터:', JSON.stringify(req.body, null, 2));
    console.log('첨부파일 데이터 타입:', typeof req.body.attachments);
    console.log('첨부파일 데이터:', req.body.attachments);

    const { title, content, author, isImportant, attachments } = req.body;

    const updateData = {
      title,
      content,
      author,
      isImportant: isImportant || false,
      attachments: attachments || []
    };

    console.log('업데이트할 데이터:', JSON.stringify(updateData, null, 2));

    const pressItem = await Press.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!pressItem) {
      return res.status(404).json({ message: '언론보도를 찾을 수 없습니다' });
    }

    console.log('수정된 언론보도:', JSON.stringify(pressItem, null, 2));
    res.json(pressItem);
  } catch (error) {
    console.error('언론보도 수정 오류:', error);
    res.status(500).json({ message: '언론보도 수정 실패', error: error.message });
  }
});

// 언론보도 삭제 (관리자 전용)
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    const deletedItem = await Press.findByIdAndDelete(req.params.id);

    if (!deletedItem) {
      return res.status(404).json({ message: '해당 언론보도를 찾을 수 없습니다.' });
    }

    console.log('언론보도 삭제 성공:', req.params.id);
    res.json({ message: '언론보도가 성공적으로 삭제되었습니다.' });
  } catch (error) {
    console.error(`언론보도 ID ${req.params.id} 삭제 실패:`, error);
    res.status(500).json({ message: '언론보도를 삭제하는 중 오류가 발생했습니다.' });
  }
});

module.exports = router;
