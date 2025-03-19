import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { apiService } from '@/lib/apiService';

interface Recommendation {
  _id: string;
  name: string;
  position: string;
  content: string;
  imageUrl: string;
  order: number;
  isActive: boolean;
}

const Recommendations = () => {
  const [title, setTitle] = useState('추천의 글');
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // MongoDB에서 추천사 데이터 가져오기
    const fetchRecommendations = async () => {
      try {
        setIsLoading(true);
        const data = await apiService.getRecommendations();
        if (data && Array.isArray(data)) {
          setRecommendations(data);
        }
        setError(null);
      } catch (err) {
        console.error('추천사를 불러오는 중 오류가 발생했습니다:', err);
        setError('데이터를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
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
        <div className="main-container">
          <h1 className="section-title text-center mb-12" style={{ wordBreak: 'keep-all' }}>{title}</h1>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mainBlue"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-12">
              <p style={{ wordBreak: 'keep-all' }}>{error}</p>
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