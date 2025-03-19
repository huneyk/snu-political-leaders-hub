import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '@/lib/apiService';

interface Professor {
  _id?: string;
  name: string;
  position: string;
  organization: string;
  profile: string;
}

interface ProfessorSection {
  _id: string;
  sectionTitle: string;
  professors: Professor[];
  order: number;
  isActive: boolean;
}

const HomeProfessors = () => {
  const [sections, setSections] = useState<ProfessorSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // MongoDB에서 교수진 데이터 가져오기
    const fetchProfessors = async () => {
      try {
        setIsLoading(true);
        const data = await apiService.getProfessors();
        
        if (data && Array.isArray(data)) {
          setSections(data);
        } else {
          setError('데이터 형식이 올바르지 않습니다.');
        }
      } catch (error) {
        console.error('교수진 정보를 불러오는 중 오류가 발생했습니다:', error);
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfessors();
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
      
      // 정렬 우선 순위: 1) order 필드, 2) 제목에서 추출한 기수 번호
      if (a.order !== b.order) {
        return a.order - b.order; // order 값이 작을수록 우선 순위가 높음
      }
      return getTermNumber(b.sectionTitle) - getTermNumber(a.sectionTitle);
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
  
  if (error) {
    return (
      <section className="py-20 bg-white" id="professors">
        <div className="main-container">
          <div className="flex justify-center items-center h-64">
            <p className="text-red-500">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  const latestSection = getLatestSection();
  
  if (!latestSection) {
    return null; // 섹션이 없으면 컴포넌트를 렌더링하지 않음
  }

  return (
    <section className="py-16 bg-white" id="professors">
      <div className="main-container">
        <div>
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-mainBlue mb-4 reveal">{latestSection.sectionTitle}</h2>
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
      </div>
    </section>
  );
};

export default HomeProfessors;
