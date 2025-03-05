import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';

interface Professor {
  name: string;
  position: string;
  organization: string;
  profile: string;
}

interface ProfessorSection {
  title: string;
  professors: Professor[];
}

const Professors = () => {
  const [sections, setSections] = useState<ProfessorSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 로컬 스토리지에서 데이터 로드
    const savedSections = localStorage.getItem('professor-sections');
    
    if (savedSections) {
      try {
        const parsedSections = JSON.parse(savedSections);
        setSections(parsedSections);
      } catch (error) {
        console.error('Failed to parse professor sections:', error);
      }
    } else {
      // 이전 형식의 데이터가 있는지 확인
      const savedTitle = localStorage.getItem('professors-title');
      const savedProfessors = localStorage.getItem('professors');
      
      if (savedTitle && savedProfessors) {
        try {
          const parsedProfessors = JSON.parse(savedProfessors);
          setSections([{
            title: savedTitle,
            professors: parsedProfessors
          }]);
        } catch (error) {
          console.error('Failed to parse professors:', error);
        }
      } else {
        // 빈 배열로 초기화
        setSections([]);
      }
    }
    
    setIsLoading(false);
  }, []);

  // 애니메이션 변수
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <>
      <Header />
      <main className="pt-20">
        <div className="bg-mainBlue text-white py-16">
          <div className="main-container">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">운영 교수진</h1>
            <p className="text-xl opacity-90">서울대학교 정치리더십과정의 운영을 담당하는 교수진을 소개합니다.</p>
          </div>
        </div>

        <div className="main-container py-16">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mainBlue"></div>
            </div>
          ) : (
            <>
              {sections.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-xl text-gray-500">등록된 교수진 정보가 없습니다.</p>
                </div>
              ) : (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {sections.map((section, sectionIndex) => (
                    <div key={sectionIndex} className="mb-16">
                      <h2 className="text-3xl font-bold text-mainBlue mb-4 pb-2 border-b border-gray-200">
                        {section.title}
                      </h2>
                      
                      <div className="space-y-2">
                        {section.professors.map((professor, index) => (
                          <motion.div
                            key={`${sectionIndex}-${index}`}
                            variants={itemVariants}
                            className="p-2 border-b border-gray-100 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
                              <h3 className="text-lg font-bold text-mainBlue min-w-28">{professor.name}</h3>
                              <p className="text-gray-700 min-w-40">{professor.organization}</p>
                              <p className="text-gray-600">{professor.position}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Professors; 