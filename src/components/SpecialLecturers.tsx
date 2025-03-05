import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

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

// 기본 데이터 (데이터가 없을 경우 표시)
const defaultFaculty: Faculty[] = [
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
];

const SpecialLecturers = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [latestTerm, setLatestTerm] = useState<string>('');
  const [specialFaculty, setSpecialFaculty] = useState<Faculty[]>([]);

  useEffect(() => {
    loadFacultyData();
    
    // 로컬 스토리지 변경 이벤트 리스너 추가
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      // 컴포넌트 언마운트 시 이벤트 리스너 제거
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // 로컬 스토리지 변경 이벤트 핸들러
  const handleStorageChange = (event: StorageEvent) => {
    if (event.key === 'faculty-data') {
      loadFacultyData();
    }
  };

  // 강사진 데이터 로드
  const loadFacultyData = () => {
    setIsLoading(true);
    
    try {
      // 로컬스토리지에서 데이터 가져오기
      const savedData = localStorage.getItem('faculty-data');
      
      if (savedData) {
        const parsedData = JSON.parse(savedData) as TermFaculty[];
        
        if (Array.isArray(parsedData) && parsedData.length > 0) {
          // 기수를 내림차순으로 정렬 (높은 기수가 먼저 오도록)
          const sortedTerms = [...parsedData].sort((a, b) => {
            const termA = parseInt(a.term);
            const termB = parseInt(b.term);
            return termB - termA; // 내림차순 정렬
          });
          
          // 최신 기수
          const latestTermData = sortedTerms[0];
          
          if (latestTermData) {
            setLatestTerm(latestTermData.term);
            
            // 특별강사진 카테고리 찾기
            const specialCategory = latestTermData.categories.find(
              category => category.name === '특별강사진'
            );
            
            if (specialCategory && specialCategory.faculty.length > 0) {
              // 유효한 강사만 필터링 (이름이 있는 강사)
              const validFaculty = specialCategory.faculty.filter(
                f => f.name && f.name.trim() !== ''
              );
              
              if (validFaculty.length > 0) {
                // 최대 4명까지만 표시
                setSpecialFaculty(validFaculty.slice(0, 4));
              } else {
                setSpecialFaculty(defaultFaculty);
              }
            } else {
              setSpecialFaculty(defaultFaculty);
            }
          } else {
            setSpecialFaculty(defaultFaculty);
          }
        } else {
          setSpecialFaculty(defaultFaculty);
        }
      } else {
        setSpecialFaculty(defaultFaculty);
      }
    } catch (error) {
      console.error('강사진 데이터 로드 실패:', error);
      setSpecialFaculty(defaultFaculty);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-10 bg-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">특별강사진</h2>
          {latestTerm && (
            <p className="text-gray-600 text-lg">
              제 {latestTerm}기 특별강사진을 소개합니다
            </p>
          )}
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {specialFaculty.map((faculty, index) => (
                <div 
                  key={`${faculty.id || index}-${faculty.name}`}
                  className="bg-white p-4 rounded shadow-md hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="w-full h-48 rounded bg-gray-200 mb-4 overflow-hidden">
                    {faculty.imageUrl ? (
                      <img 
                        src={faculty.imageUrl} 
                        alt={faculty.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-500">
                        <div className="text-4xl">👤</div>
                      </div>
                    )}
                  </div>
                  <h3 className="font-bold text-lg text-gray-900">{faculty.name}</h3>
                  {faculty.biography && (
                    <div className="mt-2 text-gray-700">
                      {faculty.biography.split('\n').slice(0, 2).map((line, i) => (
                        <p key={i} className={`${i === 0 ? 'font-medium' : 'text-gray-600'} text-sm mb-1`}>
                          {line}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="text-center mt-8">
              <Link 
                to="/schedule/lecturers" 
                className="inline-block px-4 py-2 bg-mainBlue/70 text-white font-medium rounded hover:bg-blue-900/70 transition-colors duration-300 text-sm"
              >
                자세한 내용 보기 {'>'}
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SpecialLecturers; 