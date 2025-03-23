import React, { useState, useEffect, FC } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '@/lib/apiService';

// 강사진 데이터 인터페이스 - DB 스키마와 일치하도록 수정
interface Lecturer {
  _id?: string;
  id?: string;
  name: string;
  title?: string;
  organization?: string;
  imageUrl?: string;  // 소문자 필드 (호환성 유지)
  ImageUrl?: string;  // 대문자 필드 (MongoDB에서 사용)
  biography?: string; // DB 필드명과 일치
  photoUrl?: string;  // 호환성 유지
  bio?: string;       // 호환성 유지
  term?: string;
  category?: string;
  order?: number;
  isActive?: boolean;
}

// 컴포넌트 속성 정의
interface SpecialLecturersProps {
  onStatusChange?: (loaded: boolean, error: string | null) => void;
}

const SpecialLecturers: FC<SpecialLecturersProps> = ({ onStatusChange }) => {
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [latestTerm, setLatestTerm] = useState<string>('');
  const [refreshTrigger, setRefreshTrigger] = useState<number>(Date.now());

  useEffect(() => {
    loadLecturersFromMongoDB();
    
    // 이미지 캐싱 문제 해결을 위한 주기적 새로고침
    const interval = setInterval(() => {
      setRefreshTrigger(Date.now());
    }, 300000); // 5분마다 새로고침
    
    return () => clearInterval(interval);
  }, [refreshTrigger]);

  // MongoDB에서 강사진 데이터 로드
  const loadLecturersFromMongoDB = async () => {
    try {
      console.log('MongoDB에서 특별강사진 로드 시도');
      setLoading(true);
      setError(null);
      
      if (onStatusChange) onStatusChange(false, null);
      
      // 캐시 문제를 방지하기 위해 타임스탬프 추가
      const timestamp = Date.now();
      const data = await apiService.getLecturers();
      console.log('특별강사진 데이터 로드 완료', data);
      
      // 전체 데이터의 첫 번째 항목 자세히 로깅 (디버깅용)
      if (Array.isArray(data) && data.length > 0) {
        console.log('첫 번째 특별강사 데이터 샘플:', JSON.stringify(data[0], null, 2));
        console.log('이미지 URL 필드 확인:', {
          imageUrl: data[0].imageUrl,
          ImageUrl: data[0].ImageUrl,
          photoUrl: data[0].photoUrl,
          image: data[0].image,
          photo: data[0].photo
        });
        
        // 기수별로 그룹화
        const termGroups: Record<string, Lecturer[]> = {};
        
        data.forEach(lecturer => {
          if (lecturer.term && lecturer.category === '특별강사진') {
            if (!termGroups[lecturer.term]) {
              termGroups[lecturer.term] = [];
            }
            
            // 이미지 URL 모든 필드 검사 및 로깅
            const possibleImageFields = ['imageUrl', 'ImageUrl', 'photoUrl', 'image', 'photo'];
            const foundImageField = possibleImageFields.find(field => lecturer[field as keyof Lecturer]);
            if (foundImageField) {
              console.log(`강사 ${lecturer.name}의 이미지 필드: ${foundImageField}, 값: ${lecturer[foundImageField as keyof Lecturer]}`);
            } else {
              console.log(`강사 ${lecturer.name}의 이미지 필드를 찾을 수 없음`);
            }
            
            termGroups[lecturer.term].push(lecturer);
          }
        });
        
        // 기수 추출 및 정렬 (내림차순)
        const terms = Object.keys(termGroups).sort((a, b) => Number(b) - Number(a));
        
        if (terms.length > 0) {
          // 최신 기수
          const latest = terms[0];
          setLatestTerm(latest);
          
          // 최신 기수의 특별강사진 (최대 4명)
          const latestLecturers = termGroups[latest].slice(0, 4);
          setLecturers(latestLecturers);
          console.log('설정된 특별강사진:', latestLecturers);
        } else {
          console.log('특별강사진 기수 정보가 없습니다');
          setLecturers([]);
        }
      } else {
        console.log('특별강사진 데이터가 없습니다');
        setLecturers([]);
      }
      
      setLoading(false);
      if (onStatusChange) onStatusChange(true, null);
      
    } catch (err) {
      console.error('특별강사진 데이터 로드 오류:', err);
      setError(err instanceof Error ? err.message : '특별강사진 데이터를 불러오는 중 오류가 발생했습니다.');
      setLecturers([]);
      setLoading(false);
      
      if (onStatusChange) onStatusChange(true, err instanceof Error ? err.message : '특별강사진 데이터 로드 오류');
    }
  };

  // 이미지 URL 가져오기 (모든 가능한 필드 확인)
  const getImageSource = (lecturer: Lecturer): string | undefined => {
    // 모든 가능한 이미지 필드 확인
    const possibleFields = ['imageUrl', 'ImageUrl', 'photoUrl', 'image', 'photo'];
    for (const field of possibleFields) {
      const value = lecturer[field as keyof Lecturer];
      if (value && typeof value === 'string') {
        console.log(`강사 ${lecturer.name}의 이미지 소스: ${field} = ${value}`);
        return value;
      }
    }
    console.log(`강사 ${lecturer.name}의 이미지를 찾을 수 없음`);
    return undefined;
  };

  // 이미지 URL에 캐시 방지용 타임스탬프 추가 및 상대 경로 처리
  const getImageUrl = (url?: string): string => {
    if (!url) {
      console.log('이미지 URL이 없음');
      return '';
    }
    
    console.log('이미지 URL 처리 전:', url);
    
    // ScheduleLecturers 컴포넌트와 동일하게 이미지 URL 직접 사용 
    // 이 방식으로 문제가 해결되지 않으면 다른 접근법을 시도
    return url;
  };

  // 줄바꿈 처리 함수
  const formatBiography = (text?: string): React.ReactNode => {
    if (!text) return null;
    
    // 줄바꿈 문자를 <br> 태그로 변환
    return text.split('\n').map((line, index, array) => (
      <React.Fragment key={index}>
        {line}
        {index < array.length - 1 && <br />}
      </React.Fragment>
    ));
  };

  if (loading) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">특별강사진</h2>
            <p className="text-gray-600 mt-2">특별강사진 정보를 불러오는 중입니다</p>
          </div>
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">특별강사진</h2>
          </div>
          <div className="bg-red-50 border-l-4 border-red-500 p-4 max-w-3xl mx-auto">
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  if (lecturers.length === 0) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">특별강사진</h2>
          </div>
          <p className="text-gray-600 text-center">현재 등록된 특별강사진 정보가 없습니다.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">특별강사진</h2>
          {latestTerm && (
            <p className="text-gray-600 mt-2">
              제 {latestTerm}기 특별강사진을 소개합니다
            </p>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {lecturers.map((lecturer, index) => {
            // 모든 가능한 이미지 필드 확인
            const imageSource = getImageSource(lecturer);
            // 이미지 확인용 로그
            console.log(`렌더링 중인 강사 ${lecturer.name}의 이미지 URL:`, lecturer.imageUrl);
            
            return (
            <div 
              key={lecturer._id || lecturer.id || index}
              className="bg-white rounded-lg shadow-sm overflow-hidden text-center p-4"
            >
              {/* 이미지 영역을 원형으로 변경하고 중앙 정렬 */}
              <div className="flex justify-center mb-4">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-100">
                  {imageSource ? (
                    <img
                      src={imageSource}
                      alt={lecturer.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error('이미지 로드 실패:', lecturer.name, imageSource);
                        // 에러 상세 정보 기록
                        try {
                          const img = e.target as HTMLImageElement;
                          console.error('실패한 이미지 소스:', img.src);
                          // 이미지 URL 직접 콘솔에서 확인할 수 있도록 출력
                          console.error('이미지 URL을 브라우저 콘솔에 복사하여 직접 열어보세요:', img.src);
                          
                          // 대체 이미지 설정
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300?text=No+Image';
                        } catch (err) {
                          console.error('에러 정보 추출 실패:', err);
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300?text=No+Image';
                        }
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gray-200">
                      <svg
                        className="w-16 h-16 text-gray-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
              
              {/* 텍스트 정보 영역을 모두 중앙 정렬 */}
              <div className="text-center">
                <h3 className="text-xl font-bold text-mainBlue">{lecturer.name}</h3>
                {lecturer.title && (
                  <p className="text-gray-600 mt-1">{lecturer.title}</p>
                )}
                {lecturer.organization && (
                  <p className="text-gray-500 text-sm mt-1">{lecturer.organization}</p>
                )}
                {lecturer.biography && (
                  <div className="text-gray-600 text-sm mt-3 whitespace-pre-line">
                    {formatBiography(lecturer.biography)}
                  </div>
                )}
              </div>
            </div>
          )})}
        </div>
        
        <div className="text-center mt-8">
          <Link
            to="/schedule/lecturers"
            className="inline-block px-4 py-2 bg-mainBlue/70 text-white font-medium rounded hover:bg-blue-900/70 transition-colors duration-300 text-sm"
          >
            자세한 내용 보기 {'>'}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default SpecialLecturers; 