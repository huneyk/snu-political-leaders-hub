import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';
import './ScheduleLecturers.css'; // Import CSS file for lecturers styles

// 강사진 데이터 인터페이스
interface Faculty {
  id: string;
  name: string;
  imageUrl: string;
  biography: string;
}

interface FacultyCategory {
  id: string;
  name: string; // 특별강사진 or 서울대 정치외교학부 교수진
  faculty: Faculty[];
}

interface TermFaculty {
  term: string; // 기수
  categories: FacultyCategory[];
}

// 빈 배열로 초기화
const defaultTerms: TermFaculty[] = [];

const ScheduleLecturers = () => {
  // 상태 관리
  const [terms, setTerms] = useState<TermFaculty[]>(defaultTerms);
  const [activeTermIndex, setActiveTermIndex] = useState(0);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [noData, setNoData] = useState(false);

  // 컴포넌트 마운트 시 한 번만 실행
  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    console.log('컴포넌트 마운트, 데이터 로드 시작');
    loadFacultyData();
  }, []);

  // 강사진 데이터 로드
  const loadFacultyData = () => {
    try {
      // 로컬스토리지에서 데이터 가져오기 시도
      const savedData = localStorage.getItem('faculty-data');
      
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          console.log('로드된 강사진 데이터 전체:', parsedData);
          
          // 데이터 형식에 따라 처리
          if (Array.isArray(parsedData) && parsedData.length > 0) {
            // 각 기수별로 유효한 강사만 필터링
            const validTerms = parsedData.map(term => {
              // 각 카테고리 처리
              const validCategories = term.categories.map(category => {
                // 이름이 있는 강사만 필터링
                const validFaculty = category.faculty.filter(f => f.name && f.name.trim() !== '');
                console.log(`기수 ${term.term} ${category.name} 유효한 강사 수:`, validFaculty.length);
                
                return {
                  ...category,
                  faculty: validFaculty.length > 0 ? validFaculty : []
                };
              });
              
              // 유효한 강사가 있는 카테고리만 유지
              const nonEmptyCategories = validCategories.filter(cat => cat.faculty.length > 0);
              
              return {
                ...term,
                categories: nonEmptyCategories.length > 0 ? nonEmptyCategories : validCategories
              };
            });
            
            // 유효한 강사가 있는 기수만 표시
            const nonEmptyTerms = validTerms.filter(term => 
              term.categories.some(cat => cat.faculty.length > 0)
            );
            
            if (nonEmptyTerms.length > 0) {
              // 기수를 내림차순으로 정렬 (높은 기수가 먼저 오도록)
              const sortedTerms = [...nonEmptyTerms].sort((a, b) => {
                const termA = parseInt(a.term);
                const termB = parseInt(b.term);
                return termB - termA; // 내림차순 정렬
              });
              
              setTerms(sortedTerms);
              setNoData(false);
              console.log('유효한 기수 데이터 설정 (내림차순):', sortedTerms.length, '개');
              
              // 가장 최근 기수(첫 번째 항목)를 기본으로 선택
              setActiveTermIndex(0);
            } else {
              console.log('유효한 강사 데이터가 없음');
              setTerms([]);
              setNoData(true);
            }
          } else {
            console.log('유효한 데이터 형식이 아님');
            setTerms([]);
            setNoData(true);
          }
        } catch (parseError) {
          console.error('JSON 파싱 오류:', parseError);
          setTerms([]);
          setNoData(true);
        }
      } else {
        console.log('저장된 강사진 데이터 없음');
        setTerms([]);
        setNoData(true);
      }
    } catch (error) {
      console.error('강사진 데이터 로드 실패:', error);
      setTerms([]);
      setNoData(true);
    } finally {
      setLoading(false);
      console.log('데이터 로드 완료');
    }
  };

  // 현재 선택된 기수와 카테고리
  const currentTerm = terms[activeTermIndex] || terms[0];
  const currentCategory = currentTerm?.categories[activeCategoryIndex] || currentTerm?.categories[0];
  const displayFaculty = currentCategory?.faculty || [];

  return (
    <div className="min-h-screen bg-gray-100 lecturers-page">
      <Header />
      
      {/* 배너 섹션 */}
      <section className="pt-24 pb-16 bg-mainBlue text-white">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">강사진 소개</h1>
          <p className="text-white/80 max-w-3xl">
            서울대학교 정치리더십 프로그램의 강사진을 소개합니다.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mainBlue"></div>
          </div>
        ) : noData ? (
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-gray-700 mb-4">등록된 강사진 정보가 없습니다</h2>
            <p className="text-gray-500">관리자 페이지에서 강사진 정보를 등록해주세요.</p>
          </div>
        ) : (
          <div>
            {/* 기수 탭 */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">기수별 강사진</h2>
              <div className="flex flex-wrap gap-2">
                {terms.map((term, index) => (
                  <button
                    key={term.term}
                    className={`px-4 py-2 rounded-full ${
                      index === activeTermIndex
                        ? 'bg-mainBlue text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                    onClick={() => {
                      setActiveTermIndex(index);
                      setActiveCategoryIndex(0); // 기수 변경 시 첫 번째 카테고리로 초기화
                    }}
                  >
                    {term.term}기
                  </button>
                ))}
              </div>
            </div>

            {/* 카테고리 탭 */}
            {currentTerm && currentTerm.categories.length > 0 && (
              <div className="mb-8">
                <div className="flex flex-wrap gap-2">
                  {currentTerm.categories.map((category, index) => (
                    <button
                      key={category.id}
                      className={`px-4 py-2 rounded-full ${
                        index === activeCategoryIndex
                          ? 'bg-mainBlue text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                      onClick={() => setActiveCategoryIndex(index)}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 강사진 목록 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayFaculty.map((faculty) => (
                <div
                  key={faculty.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:shadow-lg"
                >
                  <div className="p-6">
                    <div className="flex flex-col items-center mb-4">
                      {faculty.imageUrl ? (
                        <div className="w-32 h-32 rounded-full overflow-hidden mb-4 border-4 border-gray-100">
                          <img
                            src={faculty.imageUrl}
                            alt={faculty.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // 이미지 로드 실패 시 기본 이미지로 대체
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=No+Image';
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center mb-4 border-4 border-gray-100">
                          <span className="text-gray-400 text-4xl">?</span>
                        </div>
                      )}
                      <h3 className="text-xl font-bold text-mainBlue">{faculty.name}</h3>
                    </div>
                    <div className="whitespace-pre-line text-gray-600 text-center">
                      {faculty.biography}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default ScheduleLecturers;