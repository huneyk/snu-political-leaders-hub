
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-100 pt-16 pb-8 border-t border-gray-200">
      <div className="main-container">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="animate-fade-in">
            <h3 className="text-xl font-bold text-mainBlue mb-6">자료 다운로드</h3>
            <div className="flex flex-wrap gap-4">
              <a 
                href="/documents/admission-form.hwp" 
                download 
                className="btn-secondary"
              >
                입학지원서 (HWP) 다운로드
              </a>
              <a 
                href="/documents/program-guide.pdf" 
                download 
                className="btn-secondary"
              >
                과정안내서 (PDF) 다운로드
              </a>
              <a 
                href="mailto:plp@snu.ac.kr" 
                className="btn-secondary"
              >
                이메일 지원 서류 접수
              </a>
            </div>
          </div>

          <div className="animate-fade-in">
            <h3 className="text-xl font-bold text-mainBlue mb-6">빠른 메뉴</h3>
            <div className="grid grid-cols-2 gap-4">
              <Link to="/intro/greeting" className="hover:text-mainBlue transition-colors">인사말</Link>
              <Link to="/admission/apply" className="hover:text-mainBlue transition-colors">입학 지원</Link>
              <Link to="/schedule/calendar" className="hover:text-mainBlue transition-colors">학사 일정</Link>
              <Link to="/gallery" className="hover:text-mainBlue transition-colors">갤러리</Link>
              <Link to="/notices" className="hover:text-mainBlue transition-colors">공지 사항</Link>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="mb-6 md:mb-0">
              <h2 className="text-lg font-bold text-mainBlue">서울대학교 정치지도자 과정</h2>
              <p className="text-sm text-gray-600 mt-1">SNU Political Leaders Program</p>
            </div>
            <div className="text-sm text-gray-600">
              <p>서울특별시 관악구 관악로 1 서울대학교 사회과학대학 아시아연구소 내 정치지도자과정 사무국</p>
              <p className="mt-2">Tel: 02-880-4107 | Email: <a href="mailto:plp@snu.ac.kr" className="hover:text-mainBlue transition-colors">plp@snu.ac.kr</a></p>
            </div>
          </div>

          <div className="mt-8 text-center text-sm text-gray-500">
            <p>서울대학교 정치외교학부 © All Rights Reserved</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
