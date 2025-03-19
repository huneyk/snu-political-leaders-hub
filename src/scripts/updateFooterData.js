/**
 * Footer 데이터 업데이트 스크립트
 * 
 * 이 스크립트는 Footer 컬렉션에 입학지원서 링크와 문의 이메일 정보를 업데이트합니다.
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Footer from '../models/Footer.js';

// 환경 변수 설정
dotenv.config();

// MongoDB 연결 URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/snu-plp-hub';

// Footer 정보
const footerData = {
  // 파일 URL을 적절하게 변경하세요
  wordFile: 'https://snu-plp.ac.kr/downloads/application_form.docx',
  hwpFile: 'https://snu-plp.ac.kr/downloads/application_form.hwp',
  pdfFile: 'https://snu-plp.ac.kr/downloads/application_form.pdf',
  email: 'plp@snu.ac.kr'  // 적절한 이메일 주소로 변경하세요
};

// MongoDB에 연결
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB에 연결되었습니다.');
    return true;
  } catch (error) {
    console.error('MongoDB 연결 실패:', error);
    return false;
  }
};

// Footer 데이터 업데이트 함수
async function updateFooterData() {
  try {
    // 기존 Footer 정보 조회
    let footer = await Footer.findOne();
    
    if (footer) {
      console.log('기존 Footer 정보가 있습니다. 정보를 업데이트합니다.');
      
      // 기존 정보 업데이트
      footer.wordFile = footerData.wordFile;
      footer.hwpFile = footerData.hwpFile;
      footer.pdfFile = footerData.pdfFile;
      footer.email = footerData.email;
      
      await footer.save();
      
      console.log('Footer 정보가 성공적으로 업데이트되었습니다:');
    } else {
      console.log('Footer 정보가 없습니다. 새로운 Footer 정보를 생성합니다.');
      
      // 새 정보 생성
      const newFooter = new Footer(footerData);
      await newFooter.save();
      
      console.log('Footer 정보가 성공적으로 생성되었습니다:');
    }
    
    // 업데이트된 정보 출력
    console.log('- Word 파일 링크:', footerData.wordFile);
    console.log('- HWP 파일 링크:', footerData.hwpFile);
    console.log('- PDF 파일 링크:', footerData.pdfFile);
    console.log('- 문의 이메일:', footerData.email);
  } catch (error) {
    console.error('Footer 정보 업데이트 실패:', error);
  }
}

// 메인 함수
async function main() {
  try {
    const connected = await connectDB();
    if (!connected) {
      process.exit(1);
    }
    
    console.log('Footer 정보 업데이트를 시작합니다...');
    await updateFooterData();
    
    // 연결 종료
    await mongoose.connection.close();
    console.log('MongoDB 연결이 종료되었습니다.');
    process.exit(0);
  } catch (error) {
    console.error('스크립트 실행 중 오류 발생:', error);
    try {
      await mongoose.connection.close();
    } catch (closeError) {
      console.error('연결 종료 실패:', closeError);
    }
    process.exit(1);
  }
}

// 스크립트 실행
main(); 