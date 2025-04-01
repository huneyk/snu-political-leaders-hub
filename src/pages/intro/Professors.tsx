import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
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

const Professors = () => {
  const [professorSections, setProfessorSections] = useState<ProfessorSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchProfessors();
  }, []);

  const fetchProfessors = async () => {
    try {
      setIsLoading(true);
      console.log('교수진 데이터 가져오기 시작 - Professors.tsx');
      
      // API에서 교수진 데이터 가져오기
      console.log('apiService.getProfessors() 호출 시작');
      const data = await apiService.getProfessors();
      console.log('apiService.getProfessors() 호출 완료', {
        받은데이터유형: typeof data,
        배열여부: Array.isArray(data),
        데이터길이: Array.isArray(data) ? data.length : 'N/A',
        데이터샘플: Array.isArray(data) && data.length > 0 ? {
          섹션제목: data[0].sectionTitle,
          교수수: data[0].professors?.length
        } : 'No Data'
      });
      
      if (data && Array.isArray(data) && data.length > 0) {
        console.log(`${data.length}개 교수진 섹션 로드 완료`);
        setProfessorSections(data);
        
        // 데이터 캐싱 (로컬 스토리지 저장)
        try {
          localStorage.setItem('professors-data', JSON.stringify(data));
          localStorage.setItem('professors-data-time', Date.now().toString());
          console.log('교수진 데이터 로컬 스토리지에 캐싱 완료');
        } catch (storageError) {
          console.warn('로컬 스토리지 캐싱 실패:', storageError);
        }
      } else {
        console.warn('API에서 유효한 교수진 데이터를 받지 못함, 로컬 스토리지 시도');
        // API 데이터가 없으면 로컬 스토리지에서 가져오기
        loadFromLocalStorage();
      }
      
      setError(null);
    } catch (err) {
      console.error('교수진 정보를 불러오는 중 오류 발생:', err);
      console.error('오류 유형:', err instanceof Error ? err.name : typeof err);
      console.error('오류 메시지:', err instanceof Error ? err.message : '알 수 없는 오류');
      
      // API 오류 시 로컬 스토리지에서 가져오기
      console.log('로컬 스토리지에서 백업 데이터 불러오기 시도');
      loadFromLocalStorage();
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadFromLocalStorage = () => {
    try {
      console.log('교수진 데이터 로컬 스토리지 로드 시도');
      const savedData = localStorage.getItem('professors-data');
      
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        console.log(`로컬 스토리지에서 ${parsedData.length}개 교수진 섹션 복원 성공`);
        setProfessorSections(parsedData);
        setError(null);
      } else {
        console.warn('로컬 스토리지에 교수진 데이터 없음');
        setError('교수진 정보를 불러올 수 없습니다.');
      }
    } catch (err) {
      console.error('로컬 스토리지에서 교수진 데이터를 불러오는 중 오류 발생:', err);
      setError('교수진 정보를 불러올 수 없습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  // 애니메이션 변수
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <>
      <Header />
      <main className="pt-20">
        <div className="bg-mainBlue text-white py-16">
          <div className="main-container">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">운영 교수진</h1>
            <p className="text-xl opacity-90">서울대학교 정치리더십과정의 운영을 담당하는 교수진을 소개합니다.</p>
          </div>
        </div>

        <div className="main-container py-16">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mainBlue"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-12">
              <p>{error}</p>
            </div>
          ) : professorSections.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-gray-500">등록된 교수진 정보가 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-16">
              {professorSections.map((section) => (
                <div key={section._id} className="mb-12">
                  <h2 className="text-2xl font-bold text-mainBlue mb-6 pb-2 border-b-2 border-mainBlue/30">
                    {section.sectionTitle}
                  </h2>
                  
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid gap-8 md:grid-cols-2"
                  >
                    {section.professors.map((professor, index) => (
                      <motion.div 
                        key={index}
                        variants={itemVariants}
                        className="bg-white rounded-lg shadow-md overflow-hidden"
                      >
                        <div className="p-6">
                          <div className="flex flex-col gap-6">
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-mainBlue mb-1">{professor.name}</h3>
                              <p className="text-gray-700 mb-1">{professor.position}</p>
                              <p className="text-gray-600 mb-3">{professor.organization}</p>
                            </div>
                          </div>
                          
                          {professor.profile && (
                            <div className="mt-4 pt-4 border-t border-gray-100">
                              <p className="text-gray-700 text-sm whitespace-pre-line">{professor.profile}</p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Professors; 