import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import ScrollReveal from '@/components/ScrollReveal';
import { apiService } from '@/lib/apiService';

interface Objective {
  _id: string;
  title: string;
  description: string;
  iconType: string;
  order: number;
  isActive: boolean;
}

const Objectives = () => {
  const [sectionTitle, setSectionTitle] = useState('과정의 목표');
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 아이콘 타입에 따른 이미지 URL 반환
  const getIconUrl = (iconType: string) => {
    switch (iconType) {
      case 'leader':
        return '/images/icons/leader-icon.svg';
      case 'expertise':
        return '/images/icons/expertise-icon.svg';
      case 'network':
        return '/images/icons/network-icon.svg';
      default:
        return '/images/icons/default-icon.svg';
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // MongoDB에서 목표 데이터 가져오기
    const fetchObjectives = async () => {
      try {
        setIsLoading(true);
        const data = await apiService.getObjectives();
        if (data && Array.isArray(data)) {
          setObjectives(data);
        }
        setError(null);
      } catch (err) {
        console.error('목표 정보를 불러오는 중 오류가 발생했습니다:', err);
        setError('데이터를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchObjectives();
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
                서울대학교 정치지도자과정의 교육 목표입니다.
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
          ) : objectives.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              <p>등록된 과정 목표가 없습니다.</p>
            </div>
          ) : (
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
                      <div className="w-full h-full flex items-center justify-center bg-mainBlue text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
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
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Objectives; 