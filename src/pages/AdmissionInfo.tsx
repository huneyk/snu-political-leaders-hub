import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';

interface Target {
  text: string;
}

interface Subsection {
  title: string;
  content: string;
}

interface Section {
  title: string;
  content: string;
  subsections: Subsection[];
  targets?: Target[];
}

interface AdmissionInfo {
  title: string;
  term: string;
  year: string;
  startMonth: string;
  endMonth: string;
  capacity: string;
  sections: Section[];
}

const AdmissionInfo = () => {
  const [admissionInfo, setAdmissionInfo] = useState<AdmissionInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 로컬 스토리지에서 데이터 로드
    const savedData = localStorage.getItem('admission-info');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setAdmissionInfo(parsedData);
      } catch (error) {
        console.error('Failed to parse admission info:', error);
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
            <h1 className="text-4xl md:text-5xl font-bold mb-4">입학 지원 안내</h1>
            <p className="text-xl opacity-90">서울대학교 정치리더십과정 입학 지원에 관한 안내입니다.</p>
          </div>
        </div>

        <div className="main-container py-16">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mainBlue"></div>
            </div>
          ) : !admissionInfo ? (
            <div className="text-center py-12">
              <p className="text-xl text-gray-500">등록된 입학 지원 정보가 없습니다.</p>
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="max-w-4xl mx-auto"
            >
              <motion.div variants={itemVariants} className="mb-12 text-center">
                <h2 className="text-3xl font-bold text-mainBlue mb-4">
                  {admissionInfo.title} {admissionInfo.term}기 ({admissionInfo.year}년 {admissionInfo.startMonth}~{admissionInfo.endMonth}월) 지원 안내
                </h2>
              </motion.div>

              {admissionInfo.sections.map((section, sectionIndex) => (
                <motion.div key={sectionIndex} variants={itemVariants} className="mb-12">
                  <h3 className="text-2xl font-bold text-mainBlue mb-6 pb-2 border-b border-gray-200">
                    {section.title}
                  </h3>

                  {section.title === '모집 인원' && (
                    <p className="text-lg mb-4">{admissionInfo.capacity}명 내외</p>
                  )}

                  {section.content && section.title !== '모집 인원' && (
                    <p className="text-lg mb-4">{section.content}</p>
                  )}

                  {section.targets && section.targets.length > 0 && (
                    <ul className="list-decimal pl-6 mb-6 space-y-2">
                      {section.targets.map((target, targetIndex) => (
                        target.text && (
                          <li key={targetIndex} className="text-lg">
                            {target.text}
                          </li>
                        )
                      ))}
                    </ul>
                  )}

                  {section.subsections.length > 0 && (
                    <div className="space-y-8 mt-8">
                      {section.subsections.map((subsection, subsectionIndex) => (
                        <div key={subsectionIndex} className="bg-gray-50 p-6 rounded-lg">
                          <h4 className="text-xl font-bold text-mainBlue mb-4">
                            {subsection.title}
                          </h4>
                          <div className="whitespace-pre-line text-gray-700">
                            {subsection.content}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}

              <motion.div variants={itemVariants} className="mt-12 text-center">
                <p className="text-lg text-gray-600 mb-6">
                  문의사항은 아래 연락처로 문의해 주시기 바랍니다.
                </p>
                <div className="bg-gray-50 p-6 rounded-lg inline-block mx-auto">
                  <p className="font-medium mb-3">문의처</p>
                  <p>전화: 02-880-4107</p>
                  <p>이메일: <a href="mailto:plp@snu.ac.kr" className="hover:text-mainBlue transition-colors">plp@snu.ac.kr</a></p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default AdmissionInfo; 