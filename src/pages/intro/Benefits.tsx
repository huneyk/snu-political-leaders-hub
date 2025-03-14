import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';

interface Benefit {
  title: string;
  content: string;
}

const Benefits = () => {
  const [sectionTitle, setSectionTitle] = useState('과정의 특전');
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Load benefits from localStorage
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
            setBenefits(parsedBenefits.map(content => ({ title: '', content })));
          } else {
            // New format: Benefit[]
            setBenefits(parsedBenefits);
          }
        }
      } catch (error) {
        console.error('Failed to parse benefits:', error);
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
        <div className="main-container">
          <h1 className="section-title text-center mb-12" style={{ wordBreak: 'keep-all' }}>{sectionTitle}</h1>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mainBlue"></div>
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
                  key={index}
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
                          {benefit.content}
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