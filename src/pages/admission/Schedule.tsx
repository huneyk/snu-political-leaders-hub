import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { apiService } from '@/lib/apiService';

interface ScheduleData {
  title: string;
  content: string;
  imageUrl?: string;
  term: number;
}

const SchedulePage: React.FC = () => {
  const [schedule, setSchedule] = useState<ScheduleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setLoading(true);
        console.log('일정 데이터 로드 시작...');
        
        const response = await apiService.getSchedule();
        console.log('일정 API 응답:', response);
        
        if (response && typeof response === 'object') {
          setSchedule(response);
        } else {
          console.error('일정 데이터 형식이 올바르지 않습니다:', response);
          setSchedule(null);
        }
        
        setError(null);
      } catch (err) {
        console.error('일정 데이터 로드 중 오류 발생:', err);
        setError('일정 정보를 불러오는 중 오류가 발생했습니다.');
        setSchedule(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, []);

  return (
    <>
      <Header />
      <main className="pt-24 pb-16">
        <section className="py-16 bg-mainBlue text-white">
          <div className="main-container">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 reveal" style={{ wordBreak: 'keep-all' }}>일정안내</h1>
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
          ) : schedule ? (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-6">{schedule.title}</h2>
              {schedule.imageUrl && (
                <img 
                  src={schedule.imageUrl} 
                  alt={schedule.title}
                  className="w-full h-64 object-cover rounded-md mb-6"
                />
              )}
              <div className="prose max-w-none">
                {schedule.content.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-4">{paragraph}</p>
                ))}
              </div>
              <div className="mt-8 p-4 bg-gray-50 rounded-md">
                <p className="text-lg font-semibold text-mainBlue">
                  {schedule.term}기 일정
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-12">
              등록된 일정 정보가 없습니다.
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default SchedulePage; 