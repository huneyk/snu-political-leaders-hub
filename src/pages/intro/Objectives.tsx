import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import ScrollReveal from '@/components/ScrollReveal';

interface GoalItem {
  title: string;
  content: string;
  imageUrl: string;
}

const Objectives = () => {
  const [sectionTitle, setSectionTitle] = useState('과정의 목표');
  const [goals, setGoals] = useState<GoalItem[]>([]);
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
    
    // Load goals from localStorage
    const savedTitle = localStorage.getItem('course-goal-title');
    const savedGoals = localStorage.getItem('course-goals');
    
    if (savedTitle) setSectionTitle(savedTitle);
    if (savedGoals) {
      try {
        const parsedGoals = JSON.parse(savedGoals);
        console.log('Raw goals data:', parsedGoals);
        
        // Handle old format (string array)
        if (Array.isArray(parsedGoals) && typeof parsedGoals[0] === 'string') {
          setGoals(parsedGoals.map(goal => ({ 
            title: '', 
            content: goal, 
            imageUrl: '' 
          })));
        } else {
          // Process image URLs
          const processedGoals = parsedGoals.map((goal: GoalItem) => ({
            ...goal,
            imageUrl: processImageUrl(goal.imageUrl || '')
          }));
          setGoals(processedGoals);
          console.log('Processed goals with image URLs:', processedGoals);
        }
      } catch (error) {
        console.error('Failed to parse goals:', error);
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
          ) : goals.length === 0 ? (
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
              {goals.map((goal, index) => (
                <motion.div 
                  key={index}
                  className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-6 md:gap-8`}
                  variants={itemVariants}
                >
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden shadow-md mx-auto md:mx-0 bg-mainBlue">
                      {goal.imageUrl ? (
                        <img 
                          src={goal.imageUrl} 
                          alt={goal.title} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.error(`Image failed to load: ${goal.imageUrl}`);
                            // Fallback if image fails to load
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Icon';
                            // 플레이스홀더 이미지도 로드 실패하면 기본 색상 배경 유지
                            (e.target as HTMLImageElement).onerror = () => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            };
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-mainBlue text-white">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    {goal.title && (
                      <h2 className="text-xl md:text-2xl font-bold text-mainBlue mb-3">{goal.title}</h2>
                    )}
                    <div className="prose prose-lg max-w-none">
                      <p className="text-gray-700 whitespace-pre-line">{goal.content}</p>
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