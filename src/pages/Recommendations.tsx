import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { apiService } from '@/lib/apiService';

interface Recommendation {
  _id: string;
  sectionTitle: string;
  title: string;
  name: string;
  position: string;
  content: string;
  imageUrl: string;
  order: number;
  isActive: boolean;
}

// API 서버 URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// 폴백 데이터
const FALLBACK_RECOMMENDATIONS: Recommendation[] = [];

const Recommendations = () => {
  const [title, setTitle] = useState('추천의 글');
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  // MongoDB에서 추천사 데이터 가져오기 - fetch API 사용
  const fetchRecommendations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // fetch API로 데이터 가져오기
      const response = await fetch(`${API_URL}/content/recommendations?t=${Date.now()}`); // 캐시 방지 타임스탬프 추가
      
      // 응답 상태 확인
      if (!response.ok) {
        throw new Error(`서버 오류: ${response.status}`);
      }
      
      // JSON 데이터 파싱
      const data = await response.json();
      console.log('Recommendations API Response:', data);
      
      if (data && Array.isArray(data)) {
        // 데이터 설정 (캐싱 제거)
        setRecommendations(data);
        
        // 섹션 제목 설정 (첫 번째 항목에서 가져옴)
        if (data.length > 0 && data[0].sectionTitle) {
          setTitle(data[0].sectionTitle);
        }
      } else {
        throw new Error('올바른 형식의 데이터가 아닙니다.');
      }
    } catch (err) {
      console.error('추천사를 불러오는 중 오류가 발생했습니다:', err);
      setError('추천사를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      
      // 최대 3번까지 재시도
      if (retryCount < MAX_RETRIES) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          fetchRecommendations();
        }, 3000);  // 3초 후 재시도
      } else {
        // 모든 재시도 실패 시 폴백 데이터 사용
        setRecommendations(FALLBACK_RECOMMENDATIONS);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 페이지 로드 시 데이터 가져오기
  useEffect(() => {
    window.scrollTo(0, 0);
    fetchRecommendations();
  }, []);

  // 재시도 핸들러
  const handleRetry = () => {
    setRetryCount(0);
    fetchRecommendations();
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
          <h1 className="section-title text-center mb-12" style={{ wordBreak: 'keep-all' }}>{title}</h1>
          
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mainBlue"></div>
              <p className="text-gray-600">추천의 글을 불러오는 중...</p>
            </div>
          ) : error ? (
            <div className="text-center space-y-4 py-12">
              <p className="text-red-500" style={{ wordBreak: 'keep-all' }}>{error}</p>
              {retryCount >= MAX_RETRIES && (
                <button 
                  onClick={handleRetry}
                  className="px-4 py-2 bg-mainBlue text-white rounded hover:bg-mainBlue/90 transition-colors"
                >
                  다시 시도
                </button>
              )}
            </div>
          ) : recommendations.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              <p style={{ wordBreak: 'keep-all' }}>등록된 추천의 글이 없습니다.</p>
            </div>
          ) : (
            <motion.div 
              className="grid gap-8 md:gap-12"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {recommendations.map((recommendation) => (
                <motion.div 
                  key={recommendation._id}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                  variants={itemVariants}
                >
                  <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6">
                    {recommendation.imageUrl && (
                      <div className="flex-shrink-0">
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-gray-100 shadow-sm mx-auto md:mx-0">
                          <img 
                            src={recommendation.imageUrl} 
                            alt={`${recommendation.name} 사진`} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback if image fails to load
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=No+Image';
                            }}
                          />
                        </div>
                      </div>
                    )}
                    
                    <div className={`flex-1 ${!recommendation.imageUrl ? 'md:pl-0' : ''}`}>
                      {recommendation.title && (
                        <h2 className="mb-3 text-xl font-bold text-gray-800" style={{ wordBreak: 'keep-all' }}>
                          {recommendation.title}
                        </h2>
                      )}
                      <div className="mb-4 text-lg md:text-xl leading-relaxed text-gray-700 italic" style={{ wordBreak: 'keep-all' }}>
                        "{recommendation.content}"
                      </div>
                      
                      <div className="flex flex-col items-start">
                        <h3 className="text-xl font-bold text-mainBlue" style={{ wordBreak: 'keep-all' }}>{recommendation.name}</h3>
                        <p className="text-gray-600" style={{ wordBreak: 'keep-all' }}>{recommendation.position}</p>
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

export default Recommendations; 