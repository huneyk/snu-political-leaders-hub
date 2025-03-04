import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';

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

// 직접 정의한 기본 데이터
const defaultTerms: TermFaculty[] = [
  {
    term: '3',
    categories: [
      {
        id: '1',
        name: '특별강사진',
        faculty: [
          {
            id: "1",
            name: "홍길동",
            imageUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80",
            biography: "전 국무총리\n행정 및 정책 전문가"
          },
          {
            id: "2",
            name: "이몽룡",
            imageUrl: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80",
            biography: "전 국회의장\n의회정치 및 입법과정 전문가"
          }
        ]
      },
      {
        id: '2',
        name: '서울대 정치외교학부 교수진',
        faculty: [
          {
            id: "1",
            name: "김상배",
            imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80",
            biography: "국제정치학, 정보혁명과 네트워크 세계정치, 신흥안보 전문가"
          },
          {
            id: "2",
            name: "임혜란",
            imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80",
            biography: "비교정치경제, 동아시아 발전국가 연구 전문가"
          }
        ]
      }
    ]
  },
  {
    term: '2',
    categories: [
      {
        id: '1',
        name: '특별강사진',
        faculty: [
          {
            id: "3",
            name: "성춘향",
            imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80",
            biography: "전 외교부 장관\n국제관계 및 외교정책 전문가"
          }
        ]
      },
      {
        id: '2',
        name: '서울대 정치외교학부 교수진',
        faculty: [
          {
            id: "3",
            name: "김의영",
            imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80",
            biography: "비교정치, 시민사회, 거버넌스 전문가"
          }
        ]
      }
    ]
  },
  {
    term: '1',
    categories: [
      {
        id: '1',
        name: '특별강사진',
        faculty: [
          {
            id: "4",
            name: "방자",
            imageUrl: "",
            biography: "전 국회의원\n정치 및 입법 전문가"
          }
        ]
      },
      {
        id: '2',
        name: '서울대 정치외교학부 교수진',
        faculty: [
          {
            id: "4",
            name: "박원호",
            imageUrl: "",
            biography: "정치행태, 정치심리학, 선거연구 전문가"
          }
        ]
      }
    ]
  }
];

const ScheduleLecturers = () => {
  // 상태 관리
  const [terms, setTerms] = useState<TermFaculty[]>(defaultTerms);
  const [activeTermIndex, setActiveTermIndex] = useState(0);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const [loading, setLoading] = useState(false);

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
              console.log('유효한 기수 데이터 설정 (내림차순):', sortedTerms.length, '개');
              
              // 가장 최근 기수(첫 번째 항목)를 기본으로 선택
              setActiveTermIndex(0);
            } else {
              console.log('유효한 강사 데이터가 없음, 기본 데이터 사용');
              setTerms(defaultTerms);
            }
          } else {
            console.log('유효한 데이터 형식이 아님, 기본 데이터 사용');
            setTerms(defaultTerms);
          }
        } catch (parseError) {
          console.error('JSON 파싱 오류:', parseError);
          console.log('파싱 오류로 기본 데이터 사용');
          setTerms(defaultTerms);
        }
      } else {
        console.log('저장된 강사진 데이터 없음, 기본 데이터 사용');
        setTerms(defaultTerms);
      }
    } catch (error) {
      console.error('강사진 데이터 로드 실패:', error);
      setTerms(defaultTerms);
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
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">강사진 소개</h1>
          <p className="text-gray-600">
            서울대학교 정치리더십 프로그램의 강사진을 소개합니다.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div>
            {/* 기수 탭 */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3">기수 선택</h2>
              <div className="flex flex-wrap gap-2 mb-4">
                {terms.map((term, index) => (
                  <button
                    key={`term-${term.term}`}
                    className={`px-4 py-2 rounded-md font-medium transition-all duration-200 ${
                      activeTermIndex === index
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                    onClick={() => {
                      setActiveTermIndex(index);
                      setActiveCategoryIndex(0); // 기수 변경 시 카테고리 초기화
                    }}
                  >
                    제 {term.term} 기
                  </button>
                ))}
              </div>
            </div>

            {/* 카테고리 탭 */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3">카테고리 선택</h2>
              <div className="flex mb-6 border-b">
                {currentTerm?.categories.map((category, index) => (
                  <button
                    key={`category-${category.id}`}
                    className={`px-4 py-2 font-medium transition-all duration-200 ${
                      activeCategoryIndex === index
                        ? "text-blue-600 border-b-2 border-blue-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                    onClick={() => setActiveCategoryIndex(index)}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 현재 선택된 기수와 카테고리 정보 */}
            <div className="mb-6 p-5 bg-white rounded-lg shadow">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-gray-800">
                  제 {currentTerm?.term} 기 {currentCategory?.name}
                </h3>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {displayFaculty.length}명
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                현재 표시 중인 강사진:
              </p>
              <div className="flex flex-wrap gap-1">
                {displayFaculty.map((f, i) => (
                  <span key={i} className="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                    {f.name}
                  </span>
                ))}
                {displayFaculty.length === 0 && (
                  <span className="text-gray-400 text-xs italic">등록된 강사가 없습니다</span>
                )}
              </div>
            </div>

            {/* 강사 카드 목록 */}
            {displayFaculty.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                {displayFaculty.map((faculty, index) => {
                  console.log(`렌더링 중: ${index + 1}/${displayFaculty.length}`, faculty.name);
                  return (
                    <div
                      key={`${faculty.id || index}-${faculty.name}`}
                      className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1"
                    >
                      <div className="p-6">
                        <div className="flex flex-col items-center mb-6">
                          <div className="w-40 h-40 rounded-full bg-gray-200 mb-4 overflow-hidden">
                            {faculty.imageUrl ? (
                              <img
                                src={faculty.imageUrl}
                                alt={faculty.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-500">
                                <div className="text-5xl">👤</div>
                              </div>
                            )}
                          </div>
                          <div className="text-center">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">
                              {faculty.name || "이름 없음"}
                            </h3>
                          </div>
                        </div>
                        <div className="prose prose-sm max-w-none text-gray-600 border-t pt-4">
                          {faculty.biography ? (
                            <div className="space-y-2">
                              {faculty.biography
                                .replace(/\\n/g, '\n') // \n 문자열을 실제 줄바꿈으로 변환
                                .split('\n')
                                .map((line, i) => (
                                  <p key={i} className={`${i === 0 ? 'font-medium text-gray-800' : 'text-gray-600'}`}>
                                    {line || <br />}
                                  </p>
                                ))
                              }
                            </div>
                          ) : (
                            <p className="text-gray-400 italic">약력 정보가 없습니다.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <p className="text-gray-500 text-lg">등록된 강사가 없습니다.</p>
                <p className="text-gray-400 mt-2">다른 기수나 카테고리를 선택해보세요.</p>
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default ScheduleLecturers; 