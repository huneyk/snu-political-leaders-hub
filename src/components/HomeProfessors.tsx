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

  // 각 섹션에서 최대 4명의 교수만 표시
  const getDisplayProfessors = (professors: Professor[]) => {
    return professors.slice(0, 4);
  };

  // 가장 최근 기수의 섹션만 표시
  const getLatestSection = () => {
    if (sections.length === 0) return null;
    
    // 기수 번호가 포함된 섹션 제목을 기준으로 정렬
    // 예: "제 14기 특별강사진", "제 13기 특별강사진" 등
    const sortedSections = [...sections].sort((a, b) => {
      const getTermNumber = (title: string) => {
        const match = title.match(/(\d+)기/);
        return match ? parseInt(match[1], 10) : 0;
      };
      
      return getTermNumber(b.title) - getTermNumber(a.title);
    });
    
    return sortedSections[0];
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

  const latestSection = getLatestSection();

  return (
    <section className="py-16 bg-white" id="professors">
      <div className="main-container">
        {latestSection && (
          <div>
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-mainBlue mb-4 reveal">{latestSection.title}</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto reveal reveal-delay-100">
                정치지도자과정 강사진 소개
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-10">
              {getDisplayProfessors(latestSection.professors).map((professor, index) => (
                <div 
                  key={index} 
                  className={`bg-white rounded-lg shadow-md overflow-hidden transform transition-all duration-500 hover:-translate-y-1 hover:shadow-lg reveal ${
                    index === 0 ? '' : index === 1 ? 'reveal-delay-100' : index === 2 ? 'reveal-delay-200' : 'reveal-delay-300'
                  }`}
                >
                  <div className="h-48 overflow-hidden bg-mainBlue">
                    <div className="w-full h-full flex items-center justify-center text-white">
                      <div className="text-center">
                        <div className="text-5xl font-bold mb-1">{professor.name.charAt(0)}</div>
                        <div className="text-lg">교수</div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-mainBlue mb-1">{professor.name}</h3>
                    <p className="text-gray-600 text-sm mb-1">{professor.position}</p>
                    {professor.organization && (
                      <p className="text-gray-500 text-xs mb-3">{professor.organization}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center reveal reveal-delay-300">
              <Link 
                to="/intro/professors" 
                className="inline-block px-4 py-2 bg-mainBlue/70 text-white font-medium rounded hover:bg-blue-900/70 transition-colors duration-300 text-sm"
              >
                자세한 내용 보기 {'>'}
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default HomeProfessors;
