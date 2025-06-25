import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import ScrollReveal from '@/components/ScrollReveal';
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

// 폴백 데이터
const FALLBACK_RECOMMENDATIONS: Recommendation[] = [];

const Recommendations = () => {
  const title = '추천의 글'; // 하드코딩된 제목
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  // 이미지 URL을 처리하는 함수
  const processImageUrl = (url: string) => {
    if (!url) return '/images/default-profile.jpg';
    
    // Base64 인코딩된 이미지 데이터인 경우 (data:image로 시작)
    if (url.startsWith('data:image')) {
      return url;
    }
    
    // URL이 이미 절대 경로인 경우 (http:// 또는 https://로 시작)
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // URL이 /로 시작하는 경우 (루트 상대 경로)
    if (url.startsWith('/')) {
      return `${window.location.origin}${url}`;
    }
    
    // 이미지 경로가 'images/'로 시작하는 경우 (admin에서 업로드한 이미지)
    if (url.startsWith('images/')) {
      return `${window.location.origin}/${url}`;
    }
    
    // 그 외의 경우 public/images 폴더 내의 경로로 간주
    return `${window.location.origin}/images/${url}`;
  };

  // MongoDB에서 추천사 데이터 가져오기 - apiService 사용
  const fetchRecommendations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('MongoDB에서 추천의 글 데이터 가져오기 시도...');
      
      // apiService를 사용하여 데이터 가져오기
      const data = await apiService.getRecommendations();
      console.log('Recommendations API Response:', data);
      
      if (data && Array.isArray(data)) {
        // 활성화된 항목만 필터링하고 정렬
        const sortedRecommendations = data
          .filter((rec: Recommendation) => {
            const isActive = rec.isActive !== false;
            if (!isActive) console.log('비활성화된 추천의 글 필터링:', rec.title);
            return isActive;
          })
          .sort((a: Recommendation, b: Recommendation) => a.order - b.order);
        
        console.log('처리된 추천의 글 데이터:', sortedRecommendations);
        console.log('추천의 글 개수:', sortedRecommendations.length);
        
        setRecommendations(sortedRecommendations);
        
        // 데이터 캐싱
        localStorage.setItem('recommendations', JSON.stringify(sortedRecommendations));
        localStorage.setItem('recommendationsTime', Date.now().toString());
        console.log('데이터 캐싱 완료');
        
        setError(null);
      } else {
        throw new Error('올바른 형식의 데이터가 아닙니다.');
      }
    } catch (err) {
      console.error('===== Recommendations.tsx: 추천의 글을 불러오는 중 오류 발생 =====');
      console.error('오류 세부 정보:', err);
      
      setError('추천의 글을 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      
      // 로컬 스토리지에서 백업 데이터 시도
      try {
        const backup = localStorage.getItem('recommendations_backup');
        if (backup) {
          console.log('recommendations_backup에서 데이터 복원 시도');
          const backupData = JSON.parse(backup);
          setRecommendations(backupData);
          return;
        }
      } catch (storageError) {
        console.warn('백업 복원 실패:', storageError);
      }
      
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
    
    // localStorage에서 캐시 데이터 삭제
    try {
      console.log('캐시 데이터 삭제 중...');
      localStorage.removeItem('recommendations');
      localStorage.removeItem('recommendationsTime');
      console.log('캐시 데이터 삭제 완료');
    } catch (err) {
      console.error('캐시 데이터 삭제 중 오류:', err);
    }
    
    fetchRecommendations();
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
    fetchRecommendations();
  };

  return (
    <>
      <Header />
      <main className="pt-24 pb-16">
        <ScrollReveal>
          <section className="py-16 bg-mainBlue text-white">
            <div className="main-container">
              <h1 className="text-3xl md:text-4xl font-bold mb-4 reveal">{title}</h1>
            </div>
          </section>
        </ScrollReveal>

        <div className="main-container py-12">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mainBlue"></div>
              <p className="text-gray-600">추천의 글을 불러오는 중...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 space-y-4">
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
                className="grid gap-8 md:gap-12 max-w-4xl mx-auto"
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
                          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-gray-100 shadow-sm mx-auto md:mx-0 bg-mainBlue">
                            <img 
                              src={processImageUrl(recommendation.imageUrl)} 
                              alt={`${recommendation.name || '추천인'} 사진`} 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                console.error(`이미지 로드 실패: ${recommendation.imageUrl}`);
                                // 기본 이미지로 대체
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Profile';
                                // 플레이스홀더 이미지도 로드 실패하면 기본 색상 배경 유지
                                (e.target as HTMLImageElement).onerror = () => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                };
                              }}
                            />
                          </div>
                        </div>
                      )}
                      
                      <div className={`flex-1 ${!recommendation.imageUrl ? 'md:pl-0' : ''}`}>
                        {recommendation.title && (
                          <h2 className="text-xl font-bold text-mainBlue mb-3" style={{ wordBreak: 'keep-all' }}>
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
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Recommendations; 