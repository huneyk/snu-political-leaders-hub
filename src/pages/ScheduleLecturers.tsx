import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';
import './ScheduleLecturers.css'; // Import CSS file for lecturers styles
import { apiService } from '@/lib/apiService';

// 강사진 데이터 인터페이스
interface Lecturer {
  _id: string;
  name: string;
  term: string;
  category: string;
  imageUrl: string;
  biography: string;
  order: number;
  isActive: boolean;
  // 프론트엔드에서 사용하는 필드 (MongoDB에 없지만 UI에 필요한 경우)
  title?: string;
  organization?: string;
  position?: string;
  specialization?: string;
  lectures?: string[];
}

// 카테고리별 강사진 인터페이스
interface LecturersByCategory {
  category: string;
  lecturers: Lecturer[];
}

// 기수별 카테고리 인터페이스
interface LecturersByTerm {
  term: string;
  categories: LecturersByCategory[];
}

const ScheduleLecturers = () => {
  // 상태 관리
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [termGroups, setTermGroups] = useState<LecturersByTerm[]>([]);
  const [activeTermIndex, setActiveTermIndex] = useState(0);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 컴포넌트 마운트 시 한 번만 실행
  useEffect(() => {
    window.scrollTo(0, 0);
    fetchLecturers();
  }, []);

  // MongoDB에서 강사진 데이터 가져오기
  const fetchLecturers = async () => {
    try {
      setLoading(true);
      const data = await apiService.getLecturers();
      
      // API 응답 로깅 추가
      console.log('강사진 데이터 응답:', data);
      
      if (data && Array.isArray(data) && data.length > 0) {
        setLecturers(data);
        
        // 데이터 캐싱 (로컬 스토리지 저장)
        localStorage.setItem('lecturers-data', JSON.stringify(data));
        
        // 기수별, 카테고리별로 강사 그룹화
        const groupByTerm = groupLecturersByTermAndCategory(data);
        setTermGroups(groupByTerm);
        
        setError(null);
      } else {
        console.error('API 응답에 강사진 데이터가 없습니다:', data);
        // 로컬 스토리지에서 데이터 로드 시도
        loadFromLocalStorage();
      }
    } catch (err) {
      console.error('강사진 정보를 불러오는 중 오류가 발생했습니다:', err);
      // API 오류 시 로컬 스토리지에서 가져오기
      loadFromLocalStorage();
    } finally {
      setLoading(false);
    }
  };
  
  // 로컬 스토리지에서 데이터 로드
  const loadFromLocalStorage = () => {
    try {
      const savedData = localStorage.getItem('lecturers-data');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        console.log("로컬 스토리지에서 가져온 강사진 데이터:", parsedData);
        setLecturers(parsedData);
        // 기수별, 카테고리별로 강사 그룹화
        const groupByTerm = groupLecturersByTermAndCategory(parsedData);
        setTermGroups(groupByTerm);
        setError(null);
      } else {
        setError('강사진 데이터를 찾을 수 없습니다.');
      }
    } catch (err) {
      console.error('로컬 스토리지에서 강사진 데이터를 불러오는 중 오류가 발생했습니다:', err);
      setError('강사진 데이터를 불러올 수 없습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  // 강사진을 기수별, 카테고리별로 그룹화하는 함수
  const groupLecturersByTermAndCategory = (lecturers: Lecturer[]): LecturersByTerm[] => {
    // 기수별로 먼저 그룹화
    const termGroups: { [key: string]: { [key: string]: Lecturer[] } } = {};
    
    lecturers.forEach(lecturer => {
      const term = lecturer.term || '기타';
      const category = lecturer.category || '기타';
      
      if (!termGroups[term]) {
        termGroups[term] = {};
      }
      
      if (!termGroups[term][category]) {
        termGroups[term][category] = [];
      }
      
      termGroups[term][category].push(lecturer);
    });
    
    // 기수 정보를 배열로 변환하고 정렬 (내림차순: 최신 기수가 먼저)
    return Object.keys(termGroups)
      .sort((a, b) => {
        // 기수에서 숫자만 추출하여 내림차순 정렬
        const numA = parseInt(a.replace(/\D/g, '') || '0');
        const numB = parseInt(b.replace(/\D/g, '') || '0');
        return numB - numA;
      })
      .map(term => {
        // 각 기수 내에서 카테고리별로 그룹화
        const categories = Object.keys(termGroups[term]).map(category => ({
          category,
          lecturers: termGroups[term][category].sort((a, b) => a.order - b.order)
        }));
        
        // '특별강사진'이 먼저 오도록 카테고리 정렬
        categories.sort((a, b) => {
          if (a.category === '특별강사진') return -1;
          if (b.category === '특별강사진') return 1;
          return 0;
        });
        
        return {
          term,
          categories
        };
      });
  };

  // 현재 선택된 기수와 카테고리
  const currentTerm = termGroups[activeTermIndex];
  const currentCategory = currentTerm?.categories[activeCategoryIndex];
  const displayLecturers = currentCategory?.lecturers || [];

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
        ) : error ? (
          <div className="text-center text-red-500 py-12">
            <p>{error}</p>
          </div>
        ) : termGroups.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-gray-700 mb-4">등록된 강사진 정보가 없습니다</h2>
            <p className="text-gray-500">관리자 페이지에서 강사진 정보를 등록해주세요.</p>
          </div>
        ) : (
          <div>
            {/* 기수 탭 */}
            {termGroups.length > 1 && (
              <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                  {termGroups.map((termGroup, index) => (
                    <button
                      key={termGroup.term}
                      className={`px-4 py-2 rounded-full ${
                        index === activeTermIndex
                          ? 'bg-mainBlue text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                      onClick={() => {
                        setActiveTermIndex(index);
                        setActiveCategoryIndex(0); // 기수 변경 시 카테고리는 첫 번째(특별강사진)로 리셋
                      }}
                    >
                      {`${termGroup.term}기`}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* 카테고리 탭 */}
            {currentTerm && currentTerm.categories.length > 1 && (
              <div className="mb-8">
                <div className="flex flex-wrap gap-2">
                  {currentTerm.categories.map((category, index) => (
                    <button
                      key={category.category}
                      className={`px-4 py-2 rounded-full ${
                        index === activeCategoryIndex
                          ? 'bg-mainBlue text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                      onClick={() => setActiveCategoryIndex(index)}
                    >
                      {category.category}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 현재 선택된 카테고리 제목 */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-mainBlue mb-2">
                {currentTerm ? `${currentTerm.term}기 ${currentCategory?.category}` : '강사진'}
              </h2>
              <div className="w-20 h-1 bg-mainBlue mb-8"></div>
            </div>

            {/* 강사진 목록 */}
            {displayLecturers.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">해당 카테고리에 등록된 강사진이 없습니다.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayLecturers.map((lecturer) => (
                  <div
                    key={lecturer._id}
                    className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:shadow-lg"
                  >
                    <div className="p-6">
                      <div className="flex flex-col items-center mb-4">
                        {lecturer.imageUrl ? (
                          <div className="w-32 h-32 rounded-full overflow-hidden mb-4 border-4 border-gray-100">
                            <img
                              src={lecturer.imageUrl}
                              alt={lecturer.name}
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
                        <h3 className="text-xl font-bold text-mainBlue">{lecturer.name}</h3>
                        <p className="text-gray-600">{lecturer.title || ''}</p>
                        <p className="text-gray-500 text-sm">
                          {lecturer.organization || ''} 
                          {lecturer.position ? ` ${lecturer.position}` : ''}
                        </p>
                      </div>
                      
                      {lecturer.biography && (
                        <div className="text-gray-600 text-center mt-4">
                          <div className="biography-multiline whitespace-pre-line">
                            {lecturer.biography}
                          </div>
                        </div>
                      )}
                      
                      {lecturer.specialization && (
                        <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                          <p className="text-gray-700 text-sm">
                            <span className="font-semibold">전문 분야: </span>
                            {lecturer.specialization}
                          </p>
                        </div>
                      )}
                      
                      {lecturer.lectures && lecturer.lectures.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <p className="font-semibold text-sm text-center mb-2">강의 주제</p>
                          <ul className="space-y-1">
                            {lecturer.lectures.map((lecture, idx) => (
                              <li key={idx} className="text-sm text-gray-600">• {lecture}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
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