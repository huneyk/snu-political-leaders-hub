import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { apiService } from '@/lib/apiService';

interface Professor {
  _id: string;
  name: string;
  title: string;
  department: string;
  specialization: string;
  imageUrl: string;
  bio: string;
  email: string;
  order: number;
  isActive: boolean;
}

const Professors = () => {
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // MongoDB에서 교수진 데이터 가져오기
    const fetchProfessors = async () => {
      try {
        setIsLoading(true);
        const data = await apiService.getProfessors();
        if (data && Array.isArray(data)) {
          setProfessors(data);
        }
        setError(null);
      } catch (err) {
        console.error('교수진 정보를 불러오는 중 오류가 발생했습니다:', err);
        setError('데이터를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfessors();
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
          ) : error ? (
            <div className="text-center text-red-500 py-12">
              <p>{error}</p>
            </div>
          ) : professors.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-gray-500">등록된 교수진 정보가 없습니다.</p>
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid gap-8 md:grid-cols-2"
            >
              {professors.map((professor) => (
                <motion.div 
                  key={professor._id}
                  variants={itemVariants}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      {professor.imageUrl && (
                        <div className="flex-shrink-0">
                          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-gray-100 shadow-sm mx-auto md:mx-0">
                            <img 
                              src={professor.imageUrl} 
                              alt={`${professor.name} 사진`} 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                // Fallback if image fails to load
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=No+Image';
                              }}
                            />
                          </div>
                        </div>
                      )}
                      
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-mainBlue mb-1">{professor.name}</h3>
                        <p className="text-gray-700 mb-1">{professor.title}</p>
                        <p className="text-gray-600 mb-3">{professor.department}</p>
                        
                        {professor.specialization && (
                          <p className="text-gray-700 text-sm">
                            <span className="font-semibold">전문 분야: </span>
                            {professor.specialization}
                          </p>
                        )}
                        
                        {professor.email && (
                          <p className="text-gray-700 text-sm">
                            <span className="font-semibold">이메일: </span>
                            <a href={`mailto:${professor.email}`} className="text-blue-600 hover:underline">
                              {professor.email}
                            </a>
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {professor.bio && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-gray-700 text-sm whitespace-pre-line">{professor.bio}</p>
                      </div>
                    )}
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

export default Professors; 