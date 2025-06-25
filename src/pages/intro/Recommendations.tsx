import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import ScrollReveal from '@/components/ScrollReveal';
import { apiService } from '@/lib/apiService';
import axios from 'axios';

// API 기본 URL 설정
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:5001/api';

interface Recommendation {
  _id?: string;
  title: string;
  text: string;
  author: string;
  position: string;
  photoUrl: string;
}

const Recommendations = () => {
  const [sectionTitle, setSectionTitle] = useState('추천의 글');
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 이미지 URL을 처리하는 함수
  const processImageUrl = (url: string) => {
    if (!url) return '';
    
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

  // MongoDB에서 추천의 글 데이터 로드
  const loadRecommendations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('MongoDB에서 추천의 글 데이터 로드 시도...');
      
      // 먼저 로컬스토리지에서 백업 데이터 확인
      const backupData = localStorage.getItem('recommendations');
      if (backupData) {
        try {
          const parsedBackup = JSON.parse(backupData);
          if (Array.isArray(parsedBackup) && parsedBackup.length > 0) {
            console.log('로컬스토리지에서 추천사 백업 데이터 로드:', parsedBackup);
            setRecommendations(parsedBackup);
            setIsLoading(false);
            return;
          }
        } catch (e) {
          console.warn('로컬스토리지 백업 데이터 파싱 실패:', e);
        }
      }
      
      // apiService를 사용하여 추천사 데이터 가져오기
      const data = await apiService.getRecommendations();
      
      console.log('추천의 글 데이터 로드 완료:', data);
      console.log('데이터 타입:', typeof data);
      console.log('데이터가 배열인가?', Array.isArray(data));
      
      if (data && Array.isArray(data) && data.length > 0) {
        console.log('MongoDB에서 추천의 글 데이터 로드 성공:', data);
        
        // 섹션 제목 설정 (모든 추천글은 동일한 섹션 제목 사용)
        if (data[0].sectionTitle) {
          setSectionTitle(data[0].sectionTitle);
        }
        
        // MongoDB 데이터를 프론트엔드 형식으로 변환
        const formattedData = data.map((item: any) => ({
          _id: item._id || '',
          title: item.title || '',
          text: item.content || item.text || '',
          author: item.name || item.author || '',
          position: item.position || item.affiliation || '',
          imageUrl: item.imageUrl || item.photo || '/images/default-profile.jpg',
          photoUrl: item.imageUrl || item.photo || '/images/default-profile.jpg'
        }));
        
        console.log('변환된 추천사 데이터:', formattedData);
        setRecommendations(formattedData);
        
        // 로컬스토리지에 백업 저장
        try {
          localStorage.setItem('recommendations', JSON.stringify(formattedData));
          localStorage.setItem('recommendationsTime', Date.now().toString());
          console.log('추천사 데이터 로컬스토리지에 백업 완료');
        } catch (storageError) {
          console.warn('로컬스토리지 백업 실패:', storageError);
        }
        
        setError(null);
      } else {
        console.log('MongoDB에서 데이터를 찾을 수 없습니다. 로컬 데이터를 사용합니다.');
        loadFromLocalStorage();
      }
    } catch (err) {
      console.error('추천사를 불러오는 중 오류가 발생했습니다:', err);
      setError('추천사를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      
      // 오류 발생 시 로컬스토리지에서 폴백 데이터 로드
      loadFromLocalStorage();
    } finally {
      setIsLoading(false);
    }
  };
  
  // localStorage에서 데이터 로드 (fallback)
  const loadFromLocalStorage = () => {
    const savedTitle = localStorage.getItem('recommendations-title');
    const savedRecommendations = localStorage.getItem('recommendations');
    
    if (savedTitle) {
      setSectionTitle(savedTitle);
      console.log('localStorage에서 섹션 제목 로드:', savedTitle);
    }
    
    if (savedRecommendations) {
      try {
        const parsedRecommendations = JSON.parse(savedRecommendations);
        console.log('localStorage에서 추천의 글 데이터 로드:', parsedRecommendations);
        
        // 데이터 형식 변환 및 이미지 URL 처리
        const updatedRecommendations = parsedRecommendations.map((rec: any) => ({
          _id: rec._id || '',
          title: rec.title || '',
          text: rec.text || '', 
          author: rec.author || '',
          position: rec.position || '',
          photoUrl: processImageUrl(rec.photoUrl || '')
        }));
        
        setRecommendations(updatedRecommendations);
        setError(null); // localStorage에서 데이터를 로드했으므로 오류 메시지를 지웁니다
      } catch (error) {
        console.error('localStorage에서 추천의 글 데이터 파싱 실패:', error);
        setError('저장된 데이터를 불러오는 중 오류가 발생했습니다.');
      }
    } else {
      console.warn('localStorage에 추천의 글 데이터가 없습니다.');
      // 로컬 스토리지에도 데이터가 없는 경우 빈 배열 설정
      setRecommendations([]);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // 컴포넌트 마운트 시 데이터 로드
    loadRecommendations();
    
    // 에러가 있는 경우 5초 후 자동으로 다시 시도
    const retryTimer = setTimeout(() => {
      if (error && recommendations.length === 0) {
        console.log('자동 재시도: 추천의 글 데이터 로드');
        loadRecommendations();
      }
    }, 5000);
    
    return () => clearTimeout(retryTimer);
  }, [error]);

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
        {/* 스타일 1: 파란색 배경의 제목 띠 */}
        <div className="w-full bg-mainBlue text-white">
          <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="main-container">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{sectionTitle}</h1>

            </div>
          </div>
        </div>

        {/* 스타일 2: Benefits 페이지 스타일의 백업 제목 (필요시 주석 해제) */}
        {/* <div className="main-container">
          <h1 className="section-title text-center mb-12" style={{ wordBreak: 'keep-all' }}>{sectionTitle}</h1>
        </div> */}

        <div className="main-container py-12">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mainBlue"></div>
              <span className="ml-3 text-mainBlue">추천의 글을 불러오는 중...</span>
            </div>
          ) : error && recommendations.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-lg inline-block">
                <p className="font-medium">{error}</p>
                <button 
                  onClick={loadRecommendations}
                  className="mt-3 px-4 py-2 bg-mainBlue text-white rounded-md text-sm hover:bg-blue-800 transition-colors"
                >
                  다시 시도
                </button>
              </div>
            </div>
          ) : recommendations.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              <p>등록된 추천의 글이 없습니다.</p>
            </div>
          ) : (
            <motion.div 
              className="grid gap-8 md:gap-12 max-w-4xl mx-auto"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {recommendations.map((recommendation, index) => (
                <motion.div 
                  key={index}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                  variants={itemVariants}
                >
                  <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6">
                    {recommendation.photoUrl && (
                      <div className="flex-shrink-0">
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-gray-100 shadow-sm mx-auto md:mx-0 bg-mainBlue">
                          <img 
                            src={recommendation.photoUrl} 
                            alt={`${recommendation.author || '추천인'} 사진`} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              console.error(`이미지 로드 실패: ${recommendation.photoUrl}`);
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
                    
                    <div className={`flex-1 ${!recommendation.photoUrl ? 'md:pl-0' : ''}`}>
                      {recommendation.title && (
                        <h2 className="text-xl font-bold text-mainBlue mb-3">{recommendation.title}</h2>
                      )}
                      
                      <div className="mb-4 text-lg md:text-xl leading-relaxed text-gray-700 italic">
                        "{recommendation.text}"
                      </div>
                      
                      <div className="flex flex-col items-start">
                        <h3 className="text-xl font-bold text-mainBlue">{recommendation.author}</h3>
                        <p className="text-gray-600">{recommendation.position}</p>
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