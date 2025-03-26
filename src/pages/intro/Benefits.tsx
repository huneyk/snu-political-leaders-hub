import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import ScrollReveal from '@/components/ScrollReveal';
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

// 폴백 데이터
const FALLBACK_BENEFITS: BenefitItem[] = [
  {
    _id: '0',
    sectionTitle: '과정 특전',
    title: '서울대학교 정치외교학부 교수 추천서 발급',
    description: '1기 수료생에게는 서울대학교 정치외교학부 교수의 추천서가 발급됩니다.',
    order: 0,
    isActive: true
  },
  {
    _id: '1',
    sectionTitle: '과정 특전',
    title: '정치지도자과정 수료증 발급',
    description: '본 과정을 수료한 학생들에게는 서울대학교 사회과학대학장과 정치외교학부장 명의의 수료증이 발급됩니다.',
    order: 1,
    isActive: true
  },
  {
    _id: '2',
    sectionTitle: '과정 특전',
    title: '정치지도자과정 동문회 참여',
    description: '본 과정을 수료한 학생들은 정치지도자과정 동문회에 참여할 수 있는 자격이 부여됩니다.',
    order: 2,
    isActive: true
  }
];

const Benefits = () => {
  const [sectionTitle, setSectionTitle] = useState('과정 특전');
  const [benefits, setBenefits] = useState<BenefitItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // 페이지 리프레시 시 현재 경로 저장
    if (window.location.pathname.includes('/intro/benefits')) {
      sessionStorage.setItem('lastPath', window.location.pathname);
    } else if (window.location.pathname === '/' && sessionStorage.getItem('lastPath')?.includes('/intro/benefits')) {
      // 루트 페이지에 있지만 이전에 benefits 페이지에 있었다면
      console.log('Benefits 페이지 복원 시도');
      const lastPath = sessionStorage.getItem('lastPath');
      if (lastPath) {
        window.history.replaceState(null, '', lastPath);
      }
    }
    
    fetchBenefits();
  }, []);

  // 로컬 스토리지에서 데이터 로드
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
          return true;
        }
      } catch (error) {
        console.error('Failed to parse benefits:', error);
      }
    }
    return false;
  };

  // MongoDB에서 특전 데이터 가져오기
  const fetchBenefits = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('MongoDB에서 과정 특전 데이터 로드 시도');
      
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
      
      // API URL 가져오기
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      console.log('API URL:', API_URL);
      
      // fetch API로 직접 데이터 가져오기
      const response = await fetch(`${API_URL}/benefits`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      console.log('응답 상태:', response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error(`서버 오류: ${response.status}`);
      }
      
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
        console.log('MongoDB에서 데이터를 찾을 수 없습니다. 폴백 데이터를 사용합니다.');
        setBenefits(FALLBACK_BENEFITS);
        setSectionTitle('과정 특전');
        
        // 폴백 데이터 캐싱
        localStorage.setItem('benefits', JSON.stringify(FALLBACK_BENEFITS));
        localStorage.setItem('benefitsTime', Date.now().toString());
        localStorage.setItem('course-benefits-title', '과정 특전');
        localStorage.setItem('course-benefits', JSON.stringify(FALLBACK_BENEFITS));
      }
    } catch (err) {
      console.error('특전 정보를 불러오는 중 오류가 발생했습니다:', err);
      setError('특전 정보를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      
      // 로컬 스토리지에서 데이터 로드 시도
      if (!loadFromLocalStorage()) {
        // 로컬 데이터도 없으면 폴백 데이터 사용
        setBenefits(FALLBACK_BENEFITS);
      }
      
      // 최대 3번까지 재시도
      if (retryCount < MAX_RETRIES) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          fetchBenefits();
        }, 3000);  // 3초 후 재시도
      }
    } finally {
      setIsLoading(false);
    }
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
        <ScrollReveal>
          <section className="py-16 bg-mainBlue text-white">
            <div className="main-container">
              <h1 className="text-3xl md:text-4xl font-bold mb-4 reveal">{sectionTitle}</h1>
              <p className="text-white/80 max-w-3xl reveal reveal-delay-100">
                서울대학교 정치지도자과정의 특전입니다.
              </p>
            </div>
          </section>
        </ScrollReveal>

        <div className="main-container py-12">
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
                  onClick={fetchBenefits}
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