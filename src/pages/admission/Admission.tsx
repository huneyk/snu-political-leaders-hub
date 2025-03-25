import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { apiService } from '@/lib/apiService';

interface AdmissionData {
  _id?: string;
  title: string;
  term: number;
  year: string;
  startMonth: string;
  endMonth: string;
  capacity: string;
  qualificationContent: string;
  targets: Array<{ text: string }>;
  applicationMethodContent: string;
  requiredDocuments: Array<{ text: string }>;
  applicationProcessContent: string;
  applicationAddress: string;
  scheduleContent: string;
  educationLocation: string;
  classSchedule: string;
  tuitionFee: string;
  additionalItems?: Array<{ text: string }>;
  isActive?: boolean;
}

const AdmissionPage: React.FC = () => {
  const [admission, setAdmission] = useState<AdmissionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchAdmission();
  }, []);

  const fetchAdmission = async () => {
    try {
      setLoading(true);
      console.log('입학안내 데이터 로드 시작...');
      
      const response = await apiService.getAdmission();
      console.log('입학안내 API 응답:', response);
      
      if (response && typeof response === 'object') {
        setAdmission(response);
        
        // 데이터 캐싱 (로컬 스토리지 저장)
        localStorage.setItem('admission-data', JSON.stringify(response));
      } else {
        console.error('입학안내 데이터 형식이 올바르지 않습니다:', response);
        // API 데이터가 없으면 로컬 스토리지에서 가져오기
        loadFromLocalStorage();
      }
      
      setError(null);
    } catch (err) {
      console.error('입학안내 데이터 로드 중 오류 발생:', err);
      // API 오류 시 로컬 스토리지에서 가져오기
      loadFromLocalStorage();
    } finally {
      setLoading(false);
    }
  };
  
  const loadFromLocalStorage = () => {
    try {
      const savedData = localStorage.getItem('admission-data');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setAdmission(parsedData);
        setError(null);
      } else {
        setError('입학안내 정보를 불러올 수 없습니다.');
        setAdmission(null);
      }
    } catch (err) {
      console.error('로컬 스토리지에서 입학안내 데이터를 불러오는 중 오류가 발생했습니다:', err);
      setError('입학안내 정보를 불러올 수 없습니다. 잠시 후 다시 시도해주세요.');
      setAdmission(null);
    }
  };

  const renderTargets = () => {
    if (!admission?.targets?.length) return null;
    
    return (
      <div className="mb-8">
        <h3 className="text-xl font-bold mb-4">지원 자격</h3>
        <p className="mb-4">{admission.qualificationContent}</p>
        <ul className="list-disc pl-5 space-y-2">
          {admission.targets.map((target, idx) => (
            <li key={idx}>{target.text}</li>
          ))}
        </ul>
      </div>
    );
  };
  
  const renderRequiredDocuments = () => {
    if (!admission?.requiredDocuments?.length) return null;
    
    return (
      <div className="mb-8">
        <h3 className="text-xl font-bold mb-4">제출 서류</h3>
        <ul className="list-disc pl-5 space-y-2">
          {admission.requiredDocuments.map((doc, idx) => (
            <li key={idx}>{doc.text}</li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <>
      <Header />
      <main className="pt-24 pb-16">
        <section className="py-16 bg-mainBlue text-white">
          <div className="main-container">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 reveal" style={{ wordBreak: 'keep-all' }}>입학안내</h1>
            {admission && (
              <p className="text-xl opacity-90">{admission.title}</p>
            )}
          </div>
        </section>
        <div className="main-container mt-12">
          {loading ? (
            <div className="flex justify-center my-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mainBlue"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
              {error}
            </div>
          ) : admission ? (
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="mb-8">
                <div className="inline-flex items-center px-4 py-2 bg-mainBlue text-white rounded-full text-lg font-bold mb-4">
                  제{admission.term}기
                </div>
                <h2 className="text-2xl font-bold mb-2">{admission.title}</h2>
                <p className="text-lg text-gray-600">{admission.year}년 {admission.startMonth}월 ~ {admission.endMonth}월</p>
              </div>
              
              {renderTargets()}
              
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-4">모집 인원</h3>
                <p>{admission.capacity}명</p>
              </div>
              
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-4">원서 접수</h3>
                <p className="whitespace-pre-line">{admission.applicationMethodContent}</p>
              </div>
              
              {renderRequiredDocuments()}
              
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-4">접수 방법</h3>
                <p className="whitespace-pre-line">{admission.applicationProcessContent}</p>
              </div>
              
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-4">접수처</h3>
                <p className="whitespace-pre-line">{admission.applicationAddress}</p>
              </div>
              
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-4">전형 일정</h3>
                <p className="whitespace-pre-line">{admission.scheduleContent}</p>
              </div>
              
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-4">교육 장소</h3>
                <p>{admission.educationLocation}</p>
              </div>
              
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-4">수업 일정</h3>
                <p>{admission.classSchedule}</p>
              </div>
              
              {admission.tuitionFee && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold mb-4">교육비</h3>
                  <p>{admission.tuitionFee}</p>
                </div>
              )}
              
              {admission.additionalItems && admission.additionalItems.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold mb-4">참고사항</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    {admission.additionalItems.map((item, idx) => (
                      <li key={idx}>{item.text}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-12">
              등록된 입학안내 정보가 없습니다.
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default AdmissionPage; 