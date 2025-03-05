import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface Target {
  text: string;
}

interface Subsection {
  title: string;
  content: string;
}

interface Section {
  title: string;
  content: string;
  subsections: Subsection[];
  targets?: Target[];
}

interface AdmissionInfoData {
  title: string;
  term: string;
  year: string;
  startMonth: string;
  endMonth: string;
  capacity: string;
  sections: Section[];
}

const HomeAdmission = () => {
  const [admissionInfo, setAdmissionInfo] = useState<AdmissionInfoData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 로컬 스토리지에서 데이터 로드
    const savedData = localStorage.getItem('admission-info');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setAdmissionInfo(parsedData);
      } catch (error) {
        console.error('Failed to parse admission info:', error);
      }
    }
    setIsLoading(false);
  }, []);

  return (
    <section className="py-16 bg-gray-50" id="admission">
      <div className="main-container">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-mainBlue mb-4 reveal">입학 안내</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto reveal reveal-delay-100">
            정치지도자 과정 모집 일정 및 전형 일정
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 md:p-8 max-w-4xl mx-auto mb-10 reveal reveal-delay-200">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mainBlue"></div>
            </div>
          ) : !admissionInfo ? (
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
                <h3 className="text-2xl font-bold text-mainBlue mb-2">입학 정보가 준비 중입니다</h3>
                <p className="text-gray-600">관리자 페이지에서 입학 정보를 등록해주세요.</p>
              </div>
            </div>
          ) : (
            <div>
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
                  <h3 className="text-2xl font-bold text-mainBlue mb-2">
                    {admissionInfo.title} {admissionInfo.term}기 ({admissionInfo.year}년 {admissionInfo.startMonth}~{admissionInfo.endMonth}월) 지원 안내
                  </h3>
                </div>
              </div>

              <div className="space-y-6">
                {/* 모집 인원 섹션 */}
                <div className="mb-6">
                  <h4 className="text-xl font-semibold text-mainBlue mb-3">모집 인원</h4>
                  <p className="text-gray-700 mb-4">{admissionInfo.capacity}명 내외</p>
                </div>
                
                {/* 모집 대상 - 모든 섹션에서 찾기 */}
                {(() => {
                  // 모집 대상에 해당하는 섹션 찾기
                  const targetSection = admissionInfo.sections.find(
                    section => section.title.includes('모집 대상') || 
                              section.title.includes('지원 자격') || 
                              section.title.includes('대상')
                  );
                  
                  // 섹션이 없으면 두 번째 섹션 사용
                  const sectionToUse = targetSection || (admissionInfo.sections.length > 1 ? admissionInfo.sections[1] : null);
                  
                  if (!sectionToUse) return null;
                  
                  return (
                    <div className="mb-6">
                      <h4 className="text-xl font-semibold text-mainBlue mb-3">모집 대상</h4>
                      
                      {sectionToUse.content && (
                        <p className="text-gray-700 mb-4">{sectionToUse.content}</p>
                      )}
                      
                      {sectionToUse.targets && sectionToUse.targets.length > 0 && (
                        <ul className="space-y-2 text-gray-700 mb-4">
                          {sectionToUse.targets.map((target, targetIndex) => (
                            target.text && (
                              <li key={targetIndex} className="flex items-start gap-3">
                                <span className="bg-mainBlue text-white rounded-full w-6 h-6 flex items-center justify-center text-sm flex-shrink-0 mt-0.5">{targetIndex + 1}</span>
                                <div>
                                  <p>{target.text}</p>
                                </div>
                              </li>
                            )
                          ))}
                        </ul>
                      )}
                      
                      {sectionToUse.subsections && sectionToUse.subsections.length > 0 && sectionToUse.subsections.map((subsection, subIndex) => (
                        <div key={subIndex} className="mt-4">
                          <p className="font-medium">{subsection.title}</p>
                          <p className="text-gray-600 mt-1">{subsection.content}</p>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </div>

        <div className="text-center">
          <Link 
            to="/admission/info" 
            className="inline-block px-4 py-2 bg-mainBlue/70 text-white font-medium rounded hover:bg-blue-900/70 transition-colors duration-300 text-sm"
          >
            자세한 내용 보기 {'>'}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HomeAdmission;
