import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// ES Modules에서 __dirname 사용하기
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 환경 변수 설정
dotenv.config();

// 모델 import
import Gallery from '../models/Gallery.js';
import Notice from '../models/Notice.js';
import Admission from '../models/Admission.js';
import Footer from '../models/Footer.js';
import User from '../models/User.js';
import Greeting from '../models/Greeting.js';
import Recommendation from '../models/Recommendations.js';
import Objective from '../models/Objectives.js';
import Benefit from '../models/Benefits.js';
import Professor from '../models/Professors.js';
import Schedule from '../models/Schedule.js';
import Lecturer from '../models/Lecturers.js';

// LocalStorage에서 데이터 읽기 (브라우저에서 Export된 JSON 파일 사용)
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

// 로컬 데이터의 키 이름을 가져오기
function getLocalDataKeys() {
  try {
    // localStorageExport 디렉토리의 모든 JSON 파일 목록
    const files = fs.readdirSync(EXPORT_DIR)
      .filter(file => file.endsWith('.json'))
      .map(file => file.replace('.json', ''));
    
    console.log('로컬 데이터 키 목록:', files);
    return files;
  } catch (error) {
    console.error('로컬 데이터 키 가져오기 실패:', error);
    return [];
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

// 인사말 데이터 마이그레이션
async function migrateGreeting() {
  try {
    const greetingFilePath = path.join(EXPORT_DIR, 'greeting.json');
    if (!fs.existsSync(greetingFilePath)) {
      console.log('인사말 데이터 파일이 없습니다.');
      return;
    }
    
    const greetingData = JSON.parse(fs.readFileSync(greetingFilePath, 'utf8'));
    
    if (greetingData) {
      // 기존 데이터 삭제
      await Greeting.deleteMany({});
      
      // 새 데이터 삽입
      const newGreeting = new Greeting(greetingData);
      await newGreeting.save();
      console.log('인사말 데이터 마이그레이션 완료');
    } else {
      console.log('인사말 데이터가 없거나 형식이 올바르지 않습니다.');
    }
  } catch (error) {
    console.error('인사말 데이터 마이그레이션 실패:', error);
  }
}

// 추천사 데이터 마이그레이션
async function migrateRecommendations() {
  try {
    const recommendationsFilePath = path.join(EXPORT_DIR, 'recommendations.json');
    if (!fs.existsSync(recommendationsFilePath)) {
      console.log('추천사 데이터 파일이 없습니다.');
      return;
    }
    
    const recommendationsData = JSON.parse(fs.readFileSync(recommendationsFilePath, 'utf8'));
    
    if (Array.isArray(recommendationsData) && recommendationsData.length > 0) {
      // 기존 데이터 삭제
      await Recommendation.deleteMany({});
      
      // 새 데이터 삽입
      await Recommendation.insertMany(recommendationsData);
      console.log(`추천사 데이터 ${recommendationsData.length}개 마이그레이션 완료`);
    } else {
      console.log('추천사 데이터가 없거나 형식이 올바르지 않습니다.');
    }
  } catch (error) {
    console.error('추천사 데이터 마이그레이션 실패:', error);
  }
}

// 목표 데이터 마이그레이션
async function migrateObjectives() {
  try {
    const objectivesFilePath = path.join(EXPORT_DIR, 'objectives.json');
    if (!fs.existsSync(objectivesFilePath)) {
      console.log('목표 데이터 파일이 없습니다.');
      return;
    }
    
    const objectivesData = JSON.parse(fs.readFileSync(objectivesFilePath, 'utf8'));
    
    if (Array.isArray(objectivesData) && objectivesData.length > 0) {
      // 기존 데이터 삭제
      await Objective.deleteMany({});
      
      // 새 데이터 삽입
      await Objective.insertMany(objectivesData);
      console.log(`목표 데이터 ${objectivesData.length}개 마이그레이션 완료`);
    } else {
      console.log('목표 데이터가 없거나 형식이 올바르지 않습니다.');
    }
  } catch (error) {
    console.error('목표 데이터 마이그레이션 실패:', error);
  }
}

// 혜택 데이터 마이그레이션
async function migrateBenefits() {
  try {
    const benefitsFilePath = path.join(EXPORT_DIR, 'benefits.json');
    if (!fs.existsSync(benefitsFilePath)) {
      console.log('혜택 데이터 파일이 없습니다.');
      return;
    }
    
    const benefitsData = JSON.parse(fs.readFileSync(benefitsFilePath, 'utf8'));
    
    if (Array.isArray(benefitsData) && benefitsData.length > 0) {
      // 기존 데이터 삭제
      await Benefit.deleteMany({});
      
      // 새 데이터 삽입
      await Benefit.insertMany(benefitsData);
      console.log(`혜택 데이터 ${benefitsData.length}개 마이그레이션 완료`);
    } else {
      console.log('혜택 데이터가 없거나 형식이 올바르지 않습니다.');
    }
  } catch (error) {
    console.error('혜택 데이터 마이그레이션 실패:', error);
  }
}

// 교수진 데이터 마이그레이션
async function migrateProfessors() {
  try {
    const professorsFilePath = path.join(EXPORT_DIR, 'professors.json');
    if (!fs.existsSync(professorsFilePath)) {
      console.log('교수진 데이터 파일이 없습니다.');
      return;
    }
    
    const professorsData = JSON.parse(fs.readFileSync(professorsFilePath, 'utf8'));
    
    if (Array.isArray(professorsData) && professorsData.length > 0) {
      // 기존 데이터 삭제
      await Professor.deleteMany({});
      
      // 필드 매핑 및 변환
      const transformedData = professorsData.map(professor => ({
        name: professor.name,
        position: professor.title || professor.position || '교수', // title 또는 position 필드 사용
        organization: professor.department || '', // department 필드를 organization으로 매핑
        profile: professor.bio || '', // bio 필드를 profile로 매핑
        section: professor.specialization || '', // specialization 필드를 section으로 매핑
        order: professor.order || 0,
        isActive: professor.isActive !== undefined ? professor.isActive : true
      }));
      
      // 새 데이터 삽입
      await Professor.insertMany(transformedData);
      console.log(`교수진 데이터 ${transformedData.length}개 마이그레이션 완료`);
    } else {
      console.log('교수진 데이터가 없거나 형식이 올바르지 않습니다.');
    }
  } catch (error) {
    console.error('교수진 데이터 마이그레이션 실패:', error);
  }
}

// 일정 데이터 마이그레이션
async function migrateSchedules() {
  try {
    const schedulesFilePath = path.join(EXPORT_DIR, 'schedules.json');
    if (!fs.existsSync(schedulesFilePath)) {
      console.log('일정 데이터 파일이 없습니다.');
      return;
    }
    
    const schedulesData = JSON.parse(fs.readFileSync(schedulesFilePath, 'utf8'));
    
    if (Array.isArray(schedulesData) && schedulesData.length > 0) {
      // 기존 데이터 삭제
      await Schedule.deleteMany({});
      
      // 날짜 필드 처리
      const processedData = schedulesData.map(item => ({
        ...item,
        date: new Date(item.date)
      }));
      
      // 새 데이터 삽입
      await Schedule.insertMany(processedData);
      console.log(`일정 데이터 ${processedData.length}개 마이그레이션 완료`);
    } else {
      console.log('일정 데이터가 없거나 형식이 올바르지 않습니다.');
    }
  } catch (error) {
    console.error('일정 데이터 마이그레이션 실패:', error);
  }
}

// 강사진 데이터 마이그레이션
async function migrateLecturers() {
  try {
    const lecturersFilePath = path.join(EXPORT_DIR, 'lecturers.json');
    if (!fs.existsSync(lecturersFilePath)) {
      console.log('강사진 데이터 파일이 없습니다.');
      return;
    }
    
    const lecturersData = JSON.parse(fs.readFileSync(lecturersFilePath, 'utf8'));
    
    if (Array.isArray(lecturersData) && lecturersData.length > 0) {
      // 기존 데이터 삭제
      await Lecturer.deleteMany({});
      
      // 필드 매핑 및 변환
      const transformedData = lecturersData.map(lecturer => {
        // lectures 배열에서 첫 번째 항목의 term을 가져오거나 기본값 사용
        const term = lecturer.lectures && lecturer.lectures[0] ? 
                      `${lecturer.lectures[0].term || ''}` : 
                      '제25기';
        
        return {
          name: lecturer.name,
          imageUrl: lecturer.imageUrl || '',
          biography: lecturer.bio || '',
          term: term,
          category: '특별강사진', // 기본 카테고리 설정
          order: lecturer.order || 0,
          isActive: lecturer.isActive !== undefined ? lecturer.isActive : true
        };
      });
      
      // 새 데이터 삽입
      await Lecturer.insertMany(transformedData);
      console.log(`강사진 데이터 ${transformedData.length}개 마이그레이션 완료`);
    } else {
      console.log('강사진 데이터가 없거나 형식이 올바르지 않습니다.');
    }
  } catch (error) {
    console.error('강사진 데이터 마이그레이션 실패:', error);
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

// 데이터 디렉토리에 있는 모든 JSON 파일을 MongoDB에 마이그레이션
async function migrateAllJsonFiles() {
  try {
    const dataDir = EXPORT_DIR;
    const files = fs.readdirSync(dataDir);
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(dataDir, file);
        const collectionName = file.replace('.json', '');
        
        try {
          const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          console.log(`[${collectionName}] 파일 데이터:`, typeof data, Array.isArray(data) ? data.length : 'object');
        } catch (error) {
          console.error(`[${collectionName}] 파일 읽기 오류:`, error.message);
        }
      }
    }
  } catch (error) {
    console.error('디렉토리 읽기 오류:', error);
  }
}

// 메인 실행 함수
async function migrateAll() {
  try {
    await connectDB();
    
    // 로컬 데이터 키 확인
    getLocalDataKeys();
    
    // 모든 JSON 파일 확인
    await migrateAllJsonFiles();
    
    // 데이터 마이그레이션
    await migrateGallery();
    await migrateNotices();
    await migrateAdmission();
    await migrateFooter();
    await migrateGreeting();
    await migrateRecommendations();
    await migrateObjectives();
    await migrateBenefits();
    await migrateProfessors();
    await migrateSchedules();
    await migrateLecturers();
    
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