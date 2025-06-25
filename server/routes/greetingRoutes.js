const express = require('express');
const router = express.Router();
const Greeting = require('../models/Greeting');

// 인사말 조회
router.get('/', async (req, res) => {
  try {
    const greeting = await Greeting.findOne();
    if (!greeting) {
      return res.status(404).json({ message: '인사말을 찾을 수 없습니다.' });
    }
    res.json(greeting);
  } catch (error) {
    console.error('인사말 조회 중 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 인사말 업데이트
router.put('/', async (req, res) => {
  try {
    const { content } = req.body;
    
    let greeting = await Greeting.findOne();
    if (!greeting) {
      greeting = new Greeting({ content });
    } else {
      greeting.content = content;
    }
    
    await greeting.save();
    res.json(greeting);
  } catch (error) {
    console.error('인사말 업데이트 중 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

module.exports = router; 