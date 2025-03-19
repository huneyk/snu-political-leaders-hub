import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

// ES Modules에서 __dirname 사용하기
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 환경 변수 설정
dotenv.config();

// Gallery 모델 스키마
const gallerySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  term: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Notice 모델 스키마
const noticeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  isImportant: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Target 스키마
const targetSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  }
});

// Subsection 스키마
const subsectionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  }
});

// Section 스키마
const sectionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    default: ''
  },
  subsections: [subsectionSchema],
  targets: [targetSchema]
});

// Admission 모델 스키마
const admissionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  term: {
    type: String,
    required: true
  },
  year: {
    type: String,
    required: true
  },
  startMonth: {
    type: String,
    required: true
  },
  endMonth: {
    type: String,
    required: true
  },
  capacity: {
    type: String,
    required: true
  },
  sections: [sectionSchema]
}, {
  timestamps: true
});

// Footer 모델 스키마
const footerSchema = new mongoose.Schema({
  wordFile: {
    type: String,
    default: ''
  },
  hwpFile: {
    type: String,
    default: ''
  },
  pdfFile: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// User 모델 스키마
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// 비밀번호 해싱 미들웨어
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// 모델 생성
const Gallery = mongoose.model('Gallery', gallerySchema);
const Notice = mongoose.model('Notice', noticeSchema);
const Admission = mongoose.model('Admission', admissionSchema);
const Footer = mongoose.model('Footer', footerSchema);
const User = mongoose.model('User', userSchema);

// Local Storage에서 데이터 읽기 (브라우저에서 Export된 JSON 파일 사용)
const EXPORT_DIR = path.join(__dirname, '../../localStorageExport');

// MongoDB 연결
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB 연결 성공');
  } catch (error) {
    console.error('MongoDB 연결 실패:', error.message);
    process.exit(1);
  }
}

// 갤러리 데이터 마이그레이션
async function migrateGallery() {
  try {
    const galleryFilePath = path.join(EXPORT_DIR, 'galleryItems.json');
    if (!fs.existsSync(galleryFilePath)) {
      console.log('갤러리 데이터 파일이 없습니다.');
      return;
    }
    
    const galleryData = JSON.parse(fs.readFileSync(galleryFilePath, 'utf8'));
    
    if (Array.isArray(galleryData) && galleryData.length > 0) {
      // 기존 데이터 삭제
      await Gallery.deleteMany({});
      
      // 날짜 필드 처리 - ISO 문자열을 Date 객체로 변환
      const processedData = galleryData.map(item => ({
        ...item,
        date: new Date(item.date)
      }));
      
      // 새 데이터 삽입
      await Gallery.insertMany(processedData);
      console.log(`갤러리 데이터 ${processedData.length}개 마이그레이션 완료`);
    } else {
      console.log('갤러리 데이터가 없거나 형식이 올바르지 않습니다.');
    }
  } catch (error) {
    console.error('갤러리 데이터 마이그레이션 실패:', error);
  }
}

// 공지사항 데이터 마이그레이션
async function migrateNotices() {
  try {
    const noticesFilePath = path.join(EXPORT_DIR, 'notices.json');
    if (!fs.existsSync(noticesFilePath)) {
      console.log('공지사항 데이터 파일이 없습니다.');
      return;
    }
    
    const noticesData = JSON.parse(fs.readFileSync(noticesFilePath, 'utf8'));
    
    if (Array.isArray(noticesData) && noticesData.length > 0) {
      // 기존 데이터 삭제
      await Notice.deleteMany({});
      
      // 날짜 필드 처리
      const processedData = noticesData.map(item => ({
        ...item,
        createdAt: new Date(item.createdAt)
      }));
      
      // 새 데이터 삽입
      await Notice.insertMany(processedData);
      console.log(`공지사항 데이터 ${processedData.length}개 마이그레이션 완료`);
    } else {
      console.log('공지사항 데이터가 없거나 형식이 올바르지 않습니다.');
    }
  } catch (error) {
    console.error('공지사항 데이터 마이그레이션 실패:', error);
  }
}

// 입학 정보 데이터 마이그레이션
async function migrateAdmission() {
  try {
    const admissionFilePath = path.join(EXPORT_DIR, 'admission-info.json');
    if (!fs.existsSync(admissionFilePath)) {
      console.log('입학 정보 데이터 파일이 없습니다.');
      return;
    }
    
    const admissionData = JSON.parse(fs.readFileSync(admissionFilePath, 'utf8'));
    
    if (admissionData) {
      // 기존 데이터 삭제
      await Admission.deleteMany({});
      
      // 새 데이터 삽입
      const newAdmission = new Admission(admissionData);
      await newAdmission.save();
      console.log('입학 정보 데이터 마이그레이션 완료');
    } else {
      console.log('입학 정보 데이터가 없거나 형식이 올바르지 않습니다.');
    }
  } catch (error) {
    console.error('입학 정보 데이터 마이그레이션 실패:', error);
  }
}

// Footer 데이터 마이그레이션
async function migrateFooter() {
  try {
    const footerFilePath = path.join(EXPORT_DIR, 'footer-config.json');
    if (!fs.existsSync(footerFilePath)) {
      console.log('Footer 데이터 파일이 없습니다.');
      return;
    }
    
    const footerData = JSON.parse(fs.readFileSync(footerFilePath, 'utf8'));
    
    if (footerData) {
      // 기존 데이터 삭제
      await Footer.deleteMany({});
      
      // 새 데이터 삽입
      const newFooter = new Footer(footerData);
      await newFooter.save();
      console.log('Footer 데이터 마이그레이션 완료');
    } else {
      console.log('Footer 데이터가 없거나 형식이 올바르지 않습니다.');
    }
  } catch (error) {
    console.error('Footer 데이터 마이그레이션 실패:', error);
  }
}

// 관리자 계정 생성 함수
async function createAdminUser() {
  try {
    // 기존 관리자 확인
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('관리자 계정이 이미 존재합니다.');
      return;
    }
    
    // 관리자 계정 생성
    const adminUser = new User({
      email: 'admin@snu-plp.ac.kr',
      password: 'admin1234', // bcrypt에 의해 자동으로 해싱됩니다
      name: '관리자',
      role: 'admin'
    });
    
    await adminUser.save();
    console.log('관리자 계정 생성 완료');
  } catch (error) {
    console.error('관리자 계정 생성 실패:', error);
  }
}

// 메인 실행 함수
async function migrateAll() {
  try {
    await connectDB();
    
    // 데이터 마이그레이션
    await migrateGallery();
    await migrateNotices();
    await migrateAdmission();
    await migrateFooter();
    
    // 관리자 계정 생성
    await createAdminUser();
    
    console.log('모든 데이터 마이그레이션 완료');
    process.exit(0);
  } catch (error) {
    console.error('데이터 마이그레이션 중 오류 발생:', error);
    process.exit(1);
  }
}

// 스크립트 실행
migrateAll(); 