
import { Link } from 'react-router-dom';

const HomeAdmission = () => {
  return (
    <section className="py-20 bg-gray-50" id="admission">
      <div className="main-container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-mainBlue mb-4 reveal">입학 안내</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto reveal reveal-delay-100">
            정치지도자 과정 모집 일정 및 입학지원서 다운로드
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-elegant p-8 md:p-12 max-w-4xl mx-auto reveal reveal-delay-200">
          <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
            <div className="bg-mainBlue/10 rounded-full p-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-mainBlue">
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                <line x1="16" x2="16" y1="2" y2="6" />
                <line x1="8" x2="8" y1="2" y2="6" />
                <line x1="3" x2="21" y1="10" y2="10" />
                <path d="M8 14h.01" />
                <path d="M12 14h.01" />
                <path d="M16 14h.01" />
                <path d="M8 18h.01" />
                <path d="M12 18h.01" />
                <path d="M16 18h.01" />
              </svg>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-mainBlue mb-2">제 15기 (2025년 3월~8월) 지원 안내</h3>
              <p className="text-gray-600">모집 인원: 30명 내외</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="text-xl font-semibold text-mainBlue mb-3">지원 절차</h4>
              <ul className="space-y-4 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="bg-mainBlue text-white rounded-full w-6 h-6 flex items-center justify-center text-sm flex-shrink-0 mt-0.5">1</span>
                  <div>
                    <p className="font-medium">원서 교부 및 접수 기간</p>
                    <p className="text-gray-600 mt-1">2024년 12월 1일 ~ 2025년 2월 15일</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-mainBlue text-white rounded-full w-6 h-6 flex items-center justify-center text-sm flex-shrink-0 mt-0.5">2</span>
                  <div>
                    <p className="font-medium">서류 제출</p>
                    <p className="text-gray-600 mt-1">홈페이지에서 다운로드, 우편 또는 이메일 접수</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-mainBlue text-white rounded-full w-6 h-6 flex items-center justify-center text-sm flex-shrink-0 mt-0.5">3</span>
                  <div>
                    <p className="font-medium">서류 전형 및 면접</p>
                    <p className="text-gray-600 mt-1">서류 전형 합격자에 한하여 개별 통보 후 면접 진행</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-mainBlue text-white rounded-full w-6 h-6 flex items-center justify-center text-sm flex-shrink-0 mt-0.5">4</span>
                  <div>
                    <p className="font-medium">최종 합격자 발표</p>
                    <p className="text-gray-600 mt-1">합격자에 한하여 개별 통보</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="flex justify-center pt-4">
              <Link 
                to="/admission/apply" 
                className="btn-primary"
              >
                자세한 입학 안내 보기
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeAdmission;
