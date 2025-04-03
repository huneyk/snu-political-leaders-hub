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
    _id: '67dacce9aeafee936ec42488',
    sectionTitle: '과정 특전',
    title: '서울대학교 정기간행물 및 시설 이용',
    description: '본 과정 수강자들은 본교에서 발행하는 정기간행물과 자료들을 증정 받으며, 본교의 각종 시설을 이용할 수 있습니다.',
    iconType: 'default',
    order: 4,
    isActive: true
  },
  {
    _id: '1',
    sectionTitle: '과정 특전',
    title: '서울대학교 정치외교학부 교수 추천서 발급',
    description: '1기 수료생에게는 서울대학교 정치외교학부 교수의 추천서가 발급됩니다.',
    order: 0,
    isActive: true
  },
  {
    _id: '2',
    sectionTitle: '과정 특전',
    title: '정치지도자과정 수료증 발급',
    description: '본 과정을 수료한 학생들에게는 서울대학교 사회과학대학장과 정치외교학부장 명의의 수료증이 발급됩니다.',
    order: 1,
    isActive: true
  },
  {
    _id: '3',
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
      console.log('----------- 과정 특전 데이터 로드 시도 -----------');
      
      // 캐시 체크 제거하고 항상 서버에서 최신 데이터 가져오기
      console.log('MongoDB에서 최신 데이터 가져오기 시도');
      
      try {
        // apiService 사용하여 데이터 가져오기
        console.log('apiService.getBenefits() 호출 시작');
        const data = await apiService.getBenefits();
        console.log('과정 특전 데이터 로드 결과:', data);
        
        if (Array.isArray(data) && data.length > 0) {
          // 첫 번째 항목의 sectionTitle을 사용
          setSectionTitle(data[0].sectionTitle || '과정 특전');
          
          // 활성화된 항목만 필터링하고 정렬
          const activeBenefits = data
            .filter((benefit: BenefitItem) => benefit.isActive !== false)
            .sort((a: BenefitItem, b: BenefitItem) => {
              return (a.order || 0) - (b.order || 0);
            });
          
          console.log('활성화된 특전 갯수:', activeBenefits.length);
          setBenefits(activeBenefits);
          
          // 데이터 캐싱
          localStorage.setItem('benefits', JSON.stringify(activeBenefits));
          localStorage.setItem('benefitsTime', Date.now().toString());
          localStorage.setItem('course-benefits-title', data[0].sectionTitle || '과정 특전');
          localStorage.setItem('course-benefits', JSON.stringify(activeBenefits));
          
          console.log('MongoDB에서 데이터 로드 성공 및 캐싱 완료');
        } else {
          console.log('데이터가 없거나 배열이 아닙니다.');
          throw new Error('데이터 형식 오류');
        }
      } catch (apiError) {
        console.error('apiService.getBenefits() 호출 중 오류:', apiError);
        
        // 여러 경로로 시도
        console.log('직접 API 호출 시도 (fetch)');
        const response = await fetch(`/api/benefits`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        
        console.log('응답 상태:', response.status, response.statusText);
        
        if (!response.ok) {
          throw new Error(`서버 오류: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('과정 특전 데이터 로드 완료 (fetch 방식):', data);
        
        if (Array.isArray(data) && data.length > 0) {
          // 첫 번째 항목의 sectionTitle을 사용
          setSectionTitle(data[0].sectionTitle || '과정 특전');
          
          // 활성화된 항목만 필터링하고 정렬
          const activeBenefits = data
            .filter((benefit: BenefitItem) => benefit.isActive !== false)
            .sort((a: BenefitItem, b: BenefitItem) => {
              return (a.order || 0) - (b.order || 0);
            });
          
          console.log('활성화된 특전 갯수:', activeBenefits.length);
          setBenefits(activeBenefits);
          
          // 데이터 캐싱
          localStorage.setItem('benefits', JSON.stringify(activeBenefits));
          localStorage.setItem('benefitsTime', Date.now().toString());
          localStorage.setItem('course-benefits-title', data[0].sectionTitle || '과정 특전');
          localStorage.setItem('course-benefits', JSON.stringify(activeBenefits));
        } else {
          console.log('데이터가 없거나 배열이 아닙니다.');
          throw new Error('데이터 형식 오류');
        }
      }
    } catch (err) {
      console.error('과정 특전 데이터 로드 중 오류 발생:', err);
      setError('특전 정보를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      
      // 로컬 스토리지에서 데이터 로드 시도
      if (!loadFromLocalStorage()) {
        // 로컬 데이터도 없으면 폴백 데이터 사용
        useFallbackData();
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // 폴백 데이터 사용 함수
  const useFallbackData = () => {
    console.log('폴백 데이터 사용 (직접 저장된 MongoDB 데이터)');
    setBenefits(FALLBACK_BENEFITS);
    setSectionTitle('과정 특전');
    
    // 폴백 데이터 캐싱
    localStorage.setItem('benefits', JSON.stringify(FALLBACK_BENEFITS));
    localStorage.setItem('benefitsTime', Date.now().toString());
    localStorage.setItem('course-benefits-title', '과정 특전');
    localStorage.setItem('course-benefits', JSON.stringify(FALLBACK_BENEFITS));
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