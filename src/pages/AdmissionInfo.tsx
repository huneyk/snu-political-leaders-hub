import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { apiService } from '@/lib/apiService';

interface Item {
  text: string;
}

interface Document {
  name: string;
  description: string;
}

interface AdmissionInfo {
  _id?: string;
  title: string;
  term: string;
  year: string;
  startMonth: string;
  endMonth: string;
  capacity: string;
  qualificationContent: string;
  targets: Item[];
  applicationMethodContent: string;
  requiredDocuments: Document[];
  applicationProcessContent: string;
  applicationAddress: string;
  scheduleContent: string;
  educationLocation: string;
  classSchedule: string;
  additionalItems: Item[];
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const AdmissionInfo = () => {
  const [admissionInfo, setAdmissionInfo] = useState<AdmissionInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdmissionData = async () => {
      setIsLoading(true);
      try {
        // MongoDB에서 데이터 로드
        const data = await apiService.getAdmission();
        console.log('Admission data from API:', data);
        setAdmissionInfo(data);
        setError(null);
      } catch (err) {
        console.error('입학 정보를 불러오는 중 오류가 발생했습니다:', err);
        setError('입학 정보를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdmissionData();
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
          ) : error ? (
            <div className="text-center py-12 text-red-500">
              <p className="text-xl">{error}</p>
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

              {/* 모집 인원 */}
              <motion.div variants={itemVariants} className="mb-12">
                <h3 className="text-2xl font-bold text-mainBlue mb-6 pb-2 border-b border-gray-200">
                  모집 인원
                </h3>
                <p className="text-lg mb-4">{admissionInfo.capacity}명 내외</p>
              </motion.div>

              {/* 지원 자격 */}
              <motion.div variants={itemVariants} className="mb-12">
                <h3 className="text-2xl font-bold text-mainBlue mb-6 pb-2 border-b border-gray-200">
                  지원 자격
                </h3>
                <p className="text-lg mb-4">{admissionInfo.qualificationContent}</p>

                {admissionInfo.targets && admissionInfo.targets.length > 0 && (
                  <ul className="list-decimal pl-6 mb-6 space-y-2">
                    {admissionInfo.targets.map((target, index) => (
                      target.text && (
                        <li key={index} className="text-lg">
                          {target.text}
                        </li>
                      )
                    ))}
                  </ul>
                )}
              </motion.div>

              {/* 교육 정보 */}
              <motion.div variants={itemVariants} className="mb-12">
                <h3 className="text-2xl font-bold text-mainBlue mb-6 pb-2 border-b border-gray-200">
                  교육 정보
                </h3>
                <div className="bg-gray-50 p-6 rounded-lg mb-4">
                  <h4 className="text-xl font-bold text-mainBlue mb-4">교육 장소</h4>
                  <p className="text-lg">{admissionInfo.educationLocation}</p>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg mb-4">
                  <h4 className="text-xl font-bold text-mainBlue mb-4">수업 일정</h4>
                  <div className="whitespace-pre-line text-gray-700">
                    {admissionInfo.classSchedule}
                  </div>
                </div>
              </motion.div>

              {/* 지원 방법 */}
              <motion.div variants={itemVariants} className="mb-12">
                <h3 className="text-2xl font-bold text-mainBlue mb-6 pb-2 border-b border-gray-200">
                  지원 일정
                </h3>
                <p className="text-lg mb-4 whitespace-pre-wrap">{admissionInfo.applicationMethodContent}</p>

                {/* 제출 서류 */}
                <div className="bg-gray-50 p-6 rounded-lg mb-6">
                  <h4 className="text-xl font-bold text-mainBlue mb-4">제출 서류</h4>
                  <ul className="list-decimal pl-6 space-y-2">
                    {admissionInfo.requiredDocuments.map((doc, index) => (
                      <li key={index} className="text-lg">
                        {doc.name} {doc.description && <span className="text-gray-600">({doc.description})</span>}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 접수 방법 */}
                <div className="bg-gray-50 p-6 rounded-lg mb-6">
                  <h4 className="text-xl font-bold text-mainBlue mb-4">접수 방법</h4>
                  <div className="whitespace-pre-line text-gray-700">
                    {admissionInfo.applicationProcessContent}
                  </div>
                </div>

                {/* 접수처 */}
                <div className="bg-gray-50 p-6 rounded-lg mb-6">
                  <h4 className="text-xl font-bold text-mainBlue mb-4">접수처</h4>
                  <div className="whitespace-pre-line text-gray-700">
                    {admissionInfo.applicationAddress}
                  </div>
                </div>

                {/* 전형 일정 */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="text-xl font-bold text-mainBlue mb-4">전형 일정</h4>
                  <div className="whitespace-pre-line text-gray-700">
                    {admissionInfo.scheduleContent}
                  </div>
                </div>
              </motion.div>

              {/* 기타 추가 항목 */}
              {admissionInfo.additionalItems && admissionInfo.additionalItems.length > 0 && (
                <motion.div variants={itemVariants} className="mb-12">
                  <h3 className="text-2xl font-bold text-mainBlue mb-6 pb-2 border-b border-gray-200">
                    기타 사항
                  </h3>
                  <ul className="list-disc pl-6 mb-6 space-y-2">
                    {admissionInfo.additionalItems.map((item, index) => (
                      item.text && (
                        <li key={index} className="text-lg">
                          {item.text}
                        </li>
                      )
                    ))}
                  </ul>
                </motion.div>
              )}

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