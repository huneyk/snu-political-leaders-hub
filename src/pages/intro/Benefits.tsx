import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { apiService } from '@/lib/apiService';

interface BenefitItem {
  _id?: string;
  sectionTitle: string;
  title: string;
  description: string;
  iconType?: string;
  order?: number;
  isActive?: boolean;
}

// API 서버 URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// 폴백 데이터
const FALLBACK_BENEFITS: BenefitItem[] = [];

const Benefits = () => {
  const [sectionTitle, setSectionTitle] = useState('과정 특전');
  const [benefits, setBenefits] = useState<BenefitItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchBenefits();
  }, []);

  // MongoDB에서 특전 데이터 가져오기 - fetch API 사용
  const fetchBenefits = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // 로컬 스토리지에서 캐시된 데이터 확인
      const cachedData = localStorage.getItem('benefits');
      const cachedTime = localStorage.getItem('benefitsTime');
      const CACHE_DURATION = 60 * 60 * 1000; // 1시간
      
      // 캐시가 유효한 경우 캐시된 데이터 사용
      if (cachedData && cachedTime && (Date.now() - parseInt(cachedTime)) < CACHE_DURATION) {
        const parsedData = JSON.parse(cachedData);
        setBenefits(parsedData);
        setSectionTitle(parsedData[0]?.sectionTitle || '과정 특전');
        setIsLoading(false);
        return;
      }
      
      // fetch API로 데이터 가져오기
      const response = await fetch(`${API_URL}/content/benefits`);
      
      // 응답 상태 확인
      if (!response.ok) {
        throw new Error(`서버 오류: ${response.status}`);
      }
      
      // JSON 데이터 파싱
      const data = await response.json();
      console.log('과정 특전 데이터 로드 완료:', data);
      
      if (data && Array.isArray(data) && data.length > 0) {
        // 첫 번째 항목의 sectionTitle을 사용
        setSectionTitle(data[0].sectionTitle || '과정 특전');
        
        // 활성화된 항목만 필터링하고 정렬
        const activeBenefits = data
          .filter((benefit: BenefitItem) => benefit.isActive !== false)
          .sort((a: BenefitItem, b: BenefitItem) => {
            return (a.order || 0) - (b.order || 0);
          });
        
        setBenefits(activeBenefits);
        
        // 데이터 캐싱
        localStorage.setItem('benefits', JSON.stringify(activeBenefits));
        localStorage.setItem('benefitsTime', Date.now().toString());
        
        // 이전 버전과의 호환성을 위해 레거시 키에도 저장
        localStorage.setItem('course-benefits-title', data[0].sectionTitle || '과정 특전');
        localStorage.setItem('course-benefits', JSON.stringify(activeBenefits));
        
        setError(null);
      } else {
        // 데이터가 없는 경우 로컬 스토리지에서 로드
        console.log('MongoDB에서 데이터를 찾을 수 없습니다. 로컬 데이터를 사용합니다.');
        loadFromLocalStorage();
      }
    } catch (err) {
      console.error('특전 정보를 불러오는 중 오류가 발생했습니다:', err);
      setError('특전 정보를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      
      // 로컬 스토리지에서 폴백 데이터 로드
      loadFromLocalStorage();
      
      // 최대 3번까지 재시도
      if (retryCount < MAX_RETRIES) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          fetchBenefits();
        }, 3000);  // 3초 후 재시도
      } else {
        // 모든 재시도 실패 시 폴백 데이터 사용
        setBenefits(FALLBACK_BENEFITS);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadFromLocalStorage = () => {
    const savedTitle = localStorage.getItem('course-benefits-title');
    const savedBenefits = localStorage.getItem('course-benefits');
    
    if (savedTitle) setSectionTitle(savedTitle);
    if (savedBenefits) {
      try {
        const parsedBenefits = JSON.parse(savedBenefits);
        // Handle old format without title
        if (Array.isArray(parsedBenefits)) {
          if (typeof parsedBenefits[0] === 'string') {
            // Old format: string[]
            setBenefits(parsedBenefits.map(content => ({ 
              sectionTitle: savedTitle || '과정 특전',
              title: '', 
              description: content
            })));
          } else {
            // Handle new format with title and content
            setBenefits(parsedBenefits);
          }
        }
      } catch (error) {
        console.error('Failed to parse benefits:', error);
      }
    }
  };

  // 수동 재시도 핸들러
  const handleRetry = () => {
    setRetryCount(0);
    fetchBenefits();
  };

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

  return (
    <>
      <Header />
      <main className="pt-24 pb-16">
        <div className="main-container">
          <h1 className="section-title text-center mb-12" style={{ wordBreak: 'keep-all' }}>{sectionTitle}</h1>
          
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mainBlue"></div>
              <p className="text-gray-600">과정의 특전을 불러오는 중...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 space-y-4">
              <p className="text-red-500">{error}</p>
              {retryCount >= MAX_RETRIES && (
                <button 
                  onClick={handleRetry}
                  className="px-4 py-2 bg-mainBlue text-white rounded hover:bg-mainBlue/90 transition-colors"
                >
                  다시 시도
                </button>
              )}
            </div>
          ) : benefits.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              <p style={{ wordBreak: 'keep-all' }}>등록된 특전이 없습니다.</p>
            </div>
          ) : (
            <motion.div 
              className="grid gap-8 md:gap-12 max-w-4xl mx-auto"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {benefits.map((benefit, index) => (
                <motion.div 
                  key={benefit._id || index}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                  variants={itemVariants}
                >
                  <div className="p-6 md:p-8">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-mainBlue text-white flex items-center justify-center text-xl font-bold">
                        {index + 1}
                      </div>
                      
                      <div className="flex-1">
                        {benefit.title && (
                          <h2 className="text-xl md:text-2xl font-bold text-mainBlue mb-3" style={{ wordBreak: 'keep-all' }}>{benefit.title}</h2>
                        )}
                        
                        <div className="text-lg leading-relaxed text-gray-700 whitespace-pre-line" style={{ wordBreak: 'keep-all' }}>
                          {benefit.description}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Benefits; 