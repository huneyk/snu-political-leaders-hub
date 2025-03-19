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
  title: string;
  organization: string;
  position: string;
  specialization: string;
  imageUrl: string;
  bio: string;
  lectures: string[];
  order: number;
  isActive: boolean;
}

interface LecturersByTerm {
  term: string;
  lecturers: Lecturer[];
}

const ScheduleLecturers = () => {
  // 상태 관리
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [termGroups, setTermGroups] = useState<LecturersByTerm[]>([]);
  const [activeTermIndex, setActiveTermIndex] = useState(0);
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
      
      if (data && Array.isArray(data)) {
        setLecturers(data);
        
        // 기수별로 강사 그룹화
        const groupByTerm = groupLecturersByTerm(data);
        setTermGroups(groupByTerm);
        
        setError(null);
      } else {
        setError('강사진 데이터를 불러올 수 없습니다.');
      }
    } catch (err) {
      console.error('강사진 정보를 불러오는 중 오류가 발생했습니다:', err);
      setError('데이터를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  // 강사진을 기수별로 그룹화하는 함수
  const groupLecturersByTerm = (lecturers: Lecturer[]): LecturersByTerm[] => {
    // 기수 정보 추출 (실제 데이터에 맞게 수정 필요)
    // 여기서는 organization 필드에 기수 정보가 포함되어 있다고 가정
    // 예: "1기 특별강사", "2기 서울대 교수" 등
    
    // 임시로 모든 강사를 현재 기수(1기)로 할당
    const currentTerm = "1";
    
    return [
      {
        term: currentTerm,
        lecturers: lecturers.sort((a, b) => a.order - b.order)
      }
    ];
  };

  // 현재 선택된 기수의 강사진
  const currentTerm = termGroups[activeTermIndex];
  const displayLecturers = currentTerm?.lecturers || [];

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
        ) : displayLecturers.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-gray-700 mb-4">등록된 강사진 정보가 없습니다</h2>
            <p className="text-gray-500">관리자 페이지에서 강사진 정보를 등록해주세요.</p>
          </div>
        ) : (
          <div>
            {/* 기수 탭 */}
            {termGroups.length > 1 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">기수별 강사진</h2>
                <div className="flex flex-wrap gap-2">
                  {termGroups.map((termGroup, index) => (
                    <button
                      key={termGroup.term}
                      className={`px-4 py-2 rounded-full ${
                        index === activeTermIndex
                          ? 'bg-mainBlue text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                      onClick={() => setActiveTermIndex(index)}
                    >
                      {termGroup.term}기
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 강사진 목록 */}
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
                      <p className="text-gray-600">{lecturer.title}</p>
                      <p className="text-gray-500 text-sm">{lecturer.organization} {lecturer.position}</p>
                    </div>
                    
                    {lecturer.bio && (
                      <div className="whitespace-pre-line text-gray-600 text-center mt-4">
                        {lecturer.bio}
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
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default ScheduleLecturers;