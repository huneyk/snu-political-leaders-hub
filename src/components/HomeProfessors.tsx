import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface Professor {
  name: string;
  position: string;
  organization: string;
  profile: string;
}

interface ProfessorSection {
  title: string;
  professors: Professor[];
}

const HomeProfessors = () => {
  const [sections, setSections] = useState<ProfessorSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 로컬 스토리지에서 데이터 로드
    const savedSections = localStorage.getItem('professor-sections');
    
    if (savedSections) {
      try {
        const parsedSections = JSON.parse(savedSections);
        setSections(parsedSections);
      } catch (error) {
        console.error('Failed to parse professor sections:', error);
      }
    } else {
      // 이전 형식의 데이터가 있는지 확인
      const savedTitle = localStorage.getItem('professors-title');
      const savedProfessors = localStorage.getItem('professors');
      
      if (savedTitle && savedProfessors) {
        try {
          const parsedProfessors = JSON.parse(savedProfessors);
          setSections([{
            title: savedTitle,
            professors: parsedProfessors
          }]);
        } catch (error) {
          console.error('Failed to parse professors:', error);
        }
      } else {
        // 기본 데이터 설정
        setSections([{
          title: "교수진 소개",
          professors: [
            {
              name: "김상배",
              position: "서울대학교 정치외교학부 교수",
              organization: "서울대학교",
              profile: ""
            },
            {
              name: "임혜란",
              position: "서울대학교 정치외교학부 교수",
              organization: "서울대학교",
              profile: ""
            },
            {
              name: "김의영",
              position: "서울대학교 정치외교학부 교수",
              organization: "서울대학교",
              profile: ""
            }
          ]
        }]);
      }
    }
    
    setIsLoading(false);
  }, []);

  // 각 섹션에서 최대 3명의 교수만 표시
  const getDisplayProfessors = (professors: Professor[]) => {
    return professors.slice(0, 3);
  };

  if (isLoading) {
    return (
      <section className="py-20 bg-white" id="professors">
        <div className="main-container">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mainBlue"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-white" id="professors">
      <div className="main-container">
        {sections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-mainBlue mb-4 reveal">{section.title}</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto reveal reveal-delay-100">
                정치지도자과정 강사진 소개
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {getDisplayProfessors(section.professors).map((professor, index) => (
                <div 
                  key={`${sectionIndex}-${index}`} 
                  className={`bg-white rounded-lg shadow-card overflow-hidden transform transition-all duration-500 hover:-translate-y-2 hover:shadow-elegant reveal ${
                    index === 0 ? '' : index === 1 ? 'reveal-delay-100' : 'reveal-delay-200'
                  }`}
                >
                  <div className="h-64 overflow-hidden bg-mainBlue">
                    <div className="w-full h-full flex items-center justify-center text-white">
                      <div className="text-center">
                        <div className="text-6xl font-bold mb-2">{professor.name.charAt(0)}</div>
                        <div className="text-xl">교수</div>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-mainBlue mb-1">{professor.name}</h3>
                    <p className="text-gray-600 mb-1">{professor.position}</p>
                    {professor.organization && (
                      <p className="text-gray-500 text-sm mb-4">{professor.organization}</p>
                    )}
                    <div className="border-t border-gray-100 pt-4 mt-auto">
                      <Link 
                        to="/intro/professors" 
                        className="text-mainBlue hover:text-opacity-80 font-medium transition-colors flex items-center"
                      >
                        <span>프로필 보기</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                          <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {section.professors.length > 3 && (
              <div className="text-center reveal reveal-delay-300">
                <Link 
                  to="/intro/professors" 
                  className="btn-primary"
                >
                  {section.title} 더 보기
                </Link>
              </div>
            )}
          </div>
        ))}

        {sections.length > 0 && (
          <div className="text-center reveal reveal-delay-300">
            <Link 
              to="/intro/professors" 
              className="btn-primary"
            >
              전체 교수진 보기
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default HomeProfessors;
