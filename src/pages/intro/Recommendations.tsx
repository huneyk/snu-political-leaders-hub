import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import ScrollReveal from '@/components/ScrollReveal';

interface Recommendation {
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

  // 이미지 URL을 처리하는 함수
  const processImageUrl = (url: string) => {
    if (!url) return '';
    
    // 디버깅을 위해 원본 URL 출력
    console.log('Processing image URL:', url);
    
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

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Load recommendations from localStorage
    const savedTitle = localStorage.getItem('recommendations-title');
    const savedRecommendations = localStorage.getItem('recommendations');
    
    if (savedTitle) setSectionTitle(savedTitle);
    if (savedRecommendations) {
      try {
        const parsedRecommendations = JSON.parse(savedRecommendations);
        console.log('Raw recommendations data:', parsedRecommendations);
        
        // Handle old format without title and process image URLs
        const updatedRecommendations = parsedRecommendations.map((rec: any) => ({
          title: rec.title || '',
          text: rec.text || rec.text || '', // Fallback for old data structure
          author: rec.author || '',
          position: rec.position || '',
          photoUrl: processImageUrl(rec.photoUrl || '')
        }));
        setRecommendations(updatedRecommendations);
        console.log('Loaded recommendations with processed image URLs:', updatedRecommendations);
      } catch (error) {
        console.error('Failed to parse recommendations:', error);
      }
    }
    
    setIsLoading(false);
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
                서울대학교 정치지도자과정에 대한 추천의 글입니다.
              </p>
            </div>
          </section>
        </ScrollReveal>

        <div className="main-container py-12">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mainBlue"></div>
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
                            alt={`${recommendation.author} 사진`} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              console.error(`Image failed to load: ${recommendation.photoUrl}`);
                              // Fallback if image fails to load
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