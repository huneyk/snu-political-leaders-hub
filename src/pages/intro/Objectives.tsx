import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import ScrollReveal from '@/components/ScrollReveal';
import { apiService } from '@/lib/apiService';
import axios from 'axios';

interface Objective {
  _id: string;
  sectionTitle: string;
  title: string;
  description: string;
  iconType: string;
  iconImage: string;
  order: number;
  isActive: boolean;
}

// API 서버 URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// 폴백 데이터
const FALLBACK_OBJECTIVES: Objective[] = [];

const Objectives = () => {
  const [sectionTitle, setSectionTitle] = useState('과정의 목표');
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  // 아이콘 타입에 따른 이미지 URL 반환 (iconImage가 없는 경우의 fallback)
  const getIconUrl = (iconType: string) => {
    switch (iconType) {
      case 'leader':
        return '/images/icons/leader-icon.svg';
      case 'expertise':
        return '/images/icons/expertise-icon.svg';
      case 'network':
        return '/images/icons/network-icon.svg';
      case 'global':
        return '/images/icons/global-icon.svg';
      default:
        return '/images/icons/default-icon.svg';
    }
  };

  // 로컬 스토리지에서 데이터 로드 (API 장애 시 폴백)
  const loadFromLocalStorage = () => {
    try {
      const savedTitle = localStorage.getItem('course-goal-title');
      const savedGoals = localStorage.getItem('course-goals');
      
      if (savedTitle) setSectionTitle(savedTitle);
      
      if (savedGoals) {
        const parsedGoals = JSON.parse(savedGoals);
        // 데이터 형식에 따라 변환
        if (Array.isArray(parsedGoals)) {
          if (typeof parsedGoals[0] === 'string') {
            // 이전 단순 문자열 배열 형식
            setObjectives(parsedGoals.map((content, index) => ({
              _id: String(index),
              sectionTitle: savedTitle || '과정의 목표',
              title: `목표 ${index + 1}`,
              description: content,
              iconType: 'default',
              iconImage: '',
              order: index,
              isActive: true
            })));
          } else {
            // 기존 객체 배열 형식
            setObjectives(parsedGoals.map((item: any, index: number) => ({
              _id: String(index),
              sectionTitle: savedTitle || '과정의 목표',
              title: item.title || `목표 ${index + 1}`,
              description: item.content || '',
              iconType: 'default',
              iconImage: item.imageUrl || '',
              order: index,
              isActive: true
            })));
          }
        }
      }
    } catch (err) {
      console.error('로컬 스토리지에서 데이터를 불러오는 중 오류 발생:', err);
    }
  };

  // MongoDB에서 목표 데이터 가져오기
  const fetchObjectives = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('===== Objectives.tsx: MongoDB에서 과정 목표 데이터 로드 시도 =====');
      
      // 캐시 무시하고 항상 서버에서 데이터 가져오기
      console.log('서버에서 최신 데이터 가져오기...');
      
      console.log('apiService.getObjectives() 호출 시작...');
      // apiService 사용하여 데이터 가져오기
      const data = await apiService.getObjectives();
      console.log('===== Objectives.tsx: 과정 목표 데이터 로드 완료 =====');
      console.log('데이터:', data);
      console.log('데이터 타입:', typeof data);
      console.log('데이터가 배열인가?', Array.isArray(data));
      if (Array.isArray(data)) {
        console.log('배열 길이:', data.length);
      }
      
      if (data && Array.isArray(data) && data.length > 0) {
        // 첫 번째 항목의 sectionTitle을 사용
        const newSectionTitle = data[0].sectionTitle || '과정의 목표';
        console.log('섹션 제목 설정:', newSectionTitle);
        setSectionTitle(newSectionTitle);
        
        // 활성화된 항목만 필터링하고 정렬
        const sortedObjectives = data
          .filter((obj: Objective) => {
            const isActive = obj.isActive !== false;
            if (!isActive) console.log('비활성화된 목표 필터링:', obj.title);
            return isActive;
          })
          .sort((a: Objective, b: Objective) => a.order - b.order);
        
        console.log('처리된 목표 데이터:', sortedObjectives);
        console.log('목표 개수:', sortedObjectives.length);
        
        setObjectives(sortedObjectives);
        
        // 데이터 캐싱
        localStorage.setItem('objectives', JSON.stringify(sortedObjectives));
        localStorage.setItem('objectivesTime', Date.now().toString());
        console.log('데이터 캐싱 완료');
        
        setError(null);
      } else {
        // 데이터가 없는 경우 로컬 스토리지에서 로드
        console.log('MongoDB에서 데이터를 찾을 수 없습니다. 로컬 데이터를 사용합니다.');
        loadFromLocalStorage();
      }
    } catch (err) {
      console.error('===== Objectives.tsx: 목표 정보를 불러오는 중 오류 발생 =====');
      console.error('오류 세부 정보:', err);
      
      if (axios?.isAxiosError && axios.isAxiosError(err)) {
        console.error('Axios 오류 세부 정보:', {
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data,
          message: err.message
        });
      }
      
      setError('목표 정보를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      
      // objectives_backup 확인
      try {
        const backup = localStorage.getItem('objectives_backup');
        if (backup) {
          console.log('objectives_backup에서 데이터 복원 시도');
          const backupData = JSON.parse(backup);
          setObjectives(backupData);
          setSectionTitle(backupData[0]?.sectionTitle || '과정의 목표');
          return;
        }
      } catch (storageError) {
        console.warn('백업 복원 실패:', storageError);
      }
      
      // 로컬 스토리지에서 폴백 데이터 로드
      loadFromLocalStorage();
      
      // 최대 3번까지 재시도
      if (retryCount < MAX_RETRIES) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          fetchObjectives();
        }, 3000);  // 3초 후 재시도
      } else {
        // 모든 재시도 실패 시 폴백 데이터 사용
        setObjectives(FALLBACK_OBJECTIVES);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 페이지 로드 시 데이터 가져오기
  useEffect(() => {
    window.scrollTo(0, 0);
    
    // localStorage에서 캐시 데이터 삭제
    try {
      console.log('캐시 데이터 삭제 중...');
      localStorage.removeItem('objectives');
      localStorage.removeItem('objectivesTime');
      console.log('캐시 데이터 삭제 완료');
    } catch (err) {
      console.error('캐시 데이터 삭제 중 오류:', err);
    }
    
    fetchObjectives();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  // 수동 재시도 핸들러
  const handleRetry = () => {
    setRetryCount(0);
    fetchObjectives();
  };

  return (
    <>
      <Header />
      <main className="pt-24 pb-16">
        <ScrollReveal>
          <section className="py-16 bg-mainBlue text-white">
            <div className="main-container">
              <h1 className="text-3xl md:text-4xl font-bold mb-4 reveal">{sectionTitle}</h1>

            </div>
          </section>
        </ScrollReveal>

        <div className="main-container py-12">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mainBlue"></div>
              <p className="text-gray-600">과정의 목표를 불러오는 중...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 space-y-4">
              <p className="text-red-500">{error}</p>
              <button 
                onClick={handleRetry}
                className="px-4 py-2 bg-mainBlue text-white rounded hover:bg-mainBlue/90 transition-colors"
              >
                다시 시도
              </button>
            </div>
          ) : objectives.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              <p>등록된 과정 목표가 없습니다.</p>
              <button 
                onClick={handleRetry}
                className="mt-4 px-4 py-2 bg-mainBlue text-white rounded hover:bg-mainBlue/90 transition-colors"
              >
                데이터 새로고침
              </button>
            </div>
          ) : (
            <>
              <div className="flex justify-end mb-6">
                <button 
                  onClick={handleRetry}
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300 transition-colors"
                >
                  새로고침
                </button>
              </div>
              <motion.div 
                className="grid gap-10 md:gap-16 max-w-4xl mx-auto"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {objectives.map((objective, index) => (
                  <motion.div 
                    key={objective._id}
                    className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-6 md:gap-8`}
                    variants={itemVariants}
                  >
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden shadow-md mx-auto md:mx-0 bg-mainBlue">
                        {objective.iconImage ? (
                          <img 
                            src={objective.iconImage} 
                            alt={objective.title} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-mainBlue text-white">
                            <img 
                              src={getIconUrl(objective.iconType)} 
                              alt={objective.title}
                              className="w-8 h-8 md:w-10 md:h-10" 
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <h2 className="text-xl md:text-2xl font-bold text-mainBlue mb-3">{objective.title}</h2>
                      <div className="prose prose-lg max-w-none">
                        <p className="text-gray-700 whitespace-pre-line">{objective.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Objectives; 