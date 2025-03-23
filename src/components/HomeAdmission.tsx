import { useState, useEffect, FC } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '@/lib/apiService';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

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
  _id?: string;
  title: string;
  term: string;
  year: string;
  startMonth: string;
  endMonth: string;
  capacity: string;
  sections: Section[];
  qualificationContent?: string;
  applicationMethodContent?: string;
  targets?: Array<{text: string}>;
  isActive?: boolean;
}

interface HomeAdmissionProps {
  onStatusChange?: (loaded: boolean, error: string | null) => void;
}

const HomeAdmission: FC<HomeAdmissionProps> = ({ onStatusChange }) => {
  const [admissionInfo, setAdmissionInfo] = useState<AdmissionInfoData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAdmissionFromMongoDB();
  }, []);

  // MongoDB에서 입학 안내 데이터 로드
  const loadAdmissionFromMongoDB = async () => {
    try {
      console.log('MongoDB에서 입학 안내 데이터 로드 시도');
      setIsLoading(true);
      setError(null);
      
      if (onStatusChange) onStatusChange(false, null);
      
      const data = await apiService.getAdmission();
      console.log('입학 안내 데이터 로드 완료:', data);
      
      if (data) {
        // 활성화된 입학 안내만 사용 (여러 개 있을 경우 가장 최근 것 사용)
        const activeAdmission = Array.isArray(data) 
          ? data.find(item => item.isActive !== false) || data[0]
          : data;
        
        setAdmissionInfo(activeAdmission);
      } else {
        setAdmissionInfo(null);
      }
      
      setIsLoading(false);
      if (onStatusChange) onStatusChange(true, null);
    } catch (err) {
      console.error('입학 안내 데이터 로드 실패:', err);
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
      setIsLoading(false);
      if (onStatusChange) onStatusChange(true, '입학 안내 로드 실패');
    }
  };

  return (
    <section className="py-16 bg-gray-50" id="admission">
      <div className="main-container">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-mainBlue reveal" style={{ wordBreak: 'keep-all' }}>입학 안내</h2>
          <p className="text-gray-600 max-w-3xl mx-auto mt-4 reveal reveal-delay-100" style={{ wordBreak: 'keep-all' }}>
            서울대학교 정치지도자 과정은 각급 선거 출마 희망자를 우대합니다.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-mainBlue"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">
            <p>{error}</p>
          </div>
        ) : !admissionInfo ? (
          <div className="text-center text-gray-500 py-8">
            <p>등록된 입학 안내 정보가 없습니다.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* 지원 자격 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-mainBlue mb-4" style={{ wordBreak: 'keep-all' }}>
                  지원 자격
                </h3>
                {admissionInfo.qualificationContent && (
                  <div className="text-gray-700 mb-4" style={{ wordBreak: 'keep-all', whiteSpace: 'pre-line' }}>
                    <p>{admissionInfo.qualificationContent}</p>
                  </div>
                )}
                
                {admissionInfo.targets && admissionInfo.targets.length > 0 && (
                  <ul className="space-y-2 text-gray-700">
                    {admissionInfo.targets.map((target, index) => (
                      target.text && (
                        <li key={index} className="flex items-start gap-3">
                          <span className="bg-mainBlue text-white rounded-full w-6 h-6 flex items-center justify-center text-sm flex-shrink-0 mt-0.5">
                            {index + 1}
                          </span>
                          <div>
                            <p style={{ wordBreak: 'keep-all' }}>{target.text}</p>
                          </div>
                        </li>
                      )
                    ))}
                  </ul>
                )}
              </div>
            </div>
            
            {/* 지원 일정 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-mainBlue mb-4" style={{ wordBreak: 'keep-all' }}>
                  지원 일정
                </h3>
                {admissionInfo.applicationMethodContent && (
                  <div className="text-gray-700" style={{ wordBreak: 'keep-all', whiteSpace: 'pre-line' }}>
                    <p>{admissionInfo.applicationMethodContent}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="text-center">
          <Link to="/admission/info">
            <Button className="bg-mainBlue/70 hover:bg-blue-900/70 transition-colors text-white h-9 text-sm px-4">
              <span>자세한 내용 보기</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HomeAdmission;
