// MongoDB 운영 준칙 초기 데이터 추가 스크립트
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const Rules = require('../models/Rules');

const INITIAL_DATA = {
  introText:
    '서울대학교 정치지도자과정은 수강생 선발과 관리에 있어서「 서울대학교 공개강좌 및 직업교육훈련과정 등에 관한 규정 」을 준수합니다.',
  articles: [
    {
      title: '제10조(상벌)',
      order: 0,
      items: [
        '① 과정 개설기관에서는 장학금을 줄 수 있다.',
        '② 이수자 중 성적이 우수하고 타의 모범이 된 사람에게는 별지 제6호서식(공동개설의 경우 별지 제7호서식)의 상장을 수여할 수 있다. 다만, 제9조 단서에 해당하는 이수자에게는 별지 제8호서식(공동개설의 경우 별지 제9호서식)의 상장을 수여할 수 있다.',
        '③ 수강생이 과정의 질서를 문란하게 하거나 수강생으로서의 본분과 품위에 어긋난 행위를 함으로써 과정의 목적을 달성하기가 현저히 곤란한 경우에는 개설기관장은 해당 수강생에게 의견 제출의 기회를 부여한 후 수강자격을 박탈하거나 이를 일정기간 제한할 수 있다.'
      ]
    }
  ],
  externalLinkText: '「서울대학교 공개강좌 및 직업교육훈련과정 등에 관한 규정」 전문 확인',
  externalLinkUrl: 'https://snurnd.snu.ac.kr/?q=node/707',
  isActive: true
};

async function addInitialRules() {
  try {
    const existing = await Rules.findOne({ isActive: true });
    if (existing) {
      console.log('이미 활성화된 운영 준칙 데이터가 존재합니다. ID:', existing._id);
      mongoose.disconnect();
      return;
    }

    const rules = new Rules({
      ...INITIAL_DATA,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await rules.save();
    console.log('✅ 운영 준칙 초기 데이터가 성공적으로 추가되었습니다.');
    console.log('추가된 데이터 ID:', rules._id);
    mongoose.disconnect();
  } catch (error) {
    console.error('❌ 운영 준칙 데이터 추가 오류:', error);
    mongoose.disconnect();
    process.exit(1);
  }
}

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB 데이터베이스에 성공적으로 연결되었습니다.');
    addInitialRules();
  })
  .catch((err) => {
    console.error('❌ MongoDB 연결 오류:', err);
    process.exit(1);
  });
