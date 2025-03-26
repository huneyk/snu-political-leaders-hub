import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import ScrollReveal from '@/components/ScrollReveal';
import { apiService } from '@/lib/apiService';

interface Benefit {
  _id: string;
  title: string;
  description: string;
  iconType: string;
  order: number;
  isActive: boolean;
}

const CourseBenefits = () => {
  const [sectionTitle, setSectionTitle] = useState('과정 특전');
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // MongoDB에서 혜택 데이터 가져오기
    const fetchBenefits = async () => {
      try {
        setIsLoading(true);
        
        // Admin 페이지와 동일한 API 엔드포인트 패턴 사용
        const API_BASE_URL = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5001/api';
        console.log('API URL:', API_BASE_URL);
        
        console.log('API 요청 시도:', `${API_BASE_URL}/content/benefits`);
        const response = await fetch(`/api/content/benefits`, {
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
        console.log('혜택 데이터 로드 완료:', data);
        
        if (data && Array.isArray(data)) {
          // 활성화된 항목만 필터링하고 정렬
          const activeBenefits = data
            .filter((benefit: Benefit) => benefit.isActive !== false)
            .sort((a: Benefit, b: Benefit) => {
              return (a.order || 0) - (b.order || 0);
            });
          
          setBenefits(activeBenefits);
          if (data[0]?.sectionTitle) {
            setSectionTitle(data[0].sectionTitle);
          }
        }
        setError(null);
      } catch (err) {
        console.error('혜택 정보를 불러오는 중 오류가 발생했습니다:', err);
        setError('데이터를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        
        // 로컬 스토리지에서 데이터 로드 시도
        const cachedBenefits = localStorage.getItem('benefits');
        if (cachedBenefits) {
          try {
            const parsedData = JSON.parse(cachedBenefits);
            setBenefits(parsedData);
            setSectionTitle(parsedData[0]?.sectionTitle || '과정 특전');
          } catch (cacheErr) {
            console.error('캐시된 데이터 파싱 오류:', cacheErr);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchBenefits();
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

  return (
    <>
      <Header />
      <main className="pt-24 pb-16">
        <ScrollReveal>
          <section className="py-16 bg-mainBlue text-white">
            <div className="main-container">
              <h1 className="text-3xl md:text-4xl font-bold mb-4 reveal">{sectionTitle}</h1>
              <p className="text-white/80 max-w-3xl reveal reveal-delay-100">
                서울대학교 정치지도자과정의 특전 내용입니다.
              </p>
            </div>
          </section>
        </ScrollReveal>

        <div className="main-container py-12">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mainBlue"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-12">
              <p>{error}</p>
            </div>
          ) : benefits.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              <p>등록된 과정 특전이 없습니다.</p>
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
                  key={benefit._id}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                  variants={itemVariants}
                >
                  <div className="p-6 md:p-8">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 rounded-full bg-mainBlue text-white flex items-center justify-center font-bold mr-4">
                        {index + 1}
                      </div>
                      <h2 className="text-xl md:text-2xl font-bold text-mainBlue">{benefit.title}</h2>
                    </div>
                    
                    <div className="ml-14">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {benefit.description}
                      </p>
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

export default CourseBenefits; 