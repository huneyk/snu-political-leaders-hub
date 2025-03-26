import { useEffect, useState, useCallback } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';
import { apiService } from '@/lib/apiService';

interface GreetingData {
  title: string;
  content: string;
  author: string;
  position: string;
  imageUrl: string;
  isActive: boolean;
}

const Greeting = () => {
  const [greetingData, setGreetingData] = useState<GreetingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  const loadContent = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 로컬 스토리지에서 캐시된 데이터 확인
      const cachedData = localStorage.getItem('greetingData');
      const cachedTimestamp = localStorage.getItem('greetingDataTimestamp');
      const CACHE_DURATION = 5 * 60 * 1000; // 5분

      if (cachedData && cachedTimestamp) {
        const timestamp = parseInt(cachedTimestamp);
        if (Date.now() - timestamp < CACHE_DURATION) {
          const parsedData = JSON.parse(cachedData);
          setGreetingData(parsedData);
          setLoading(false);
          return;
        }
      }

      // API에서 데이터 가져오기
      const data = await apiService.getGreeting();
      
      if (data) {
        setGreetingData(data);
        // 데이터 캐싱
        localStorage.setItem('greetingData', JSON.stringify(data));
        localStorage.setItem('greetingDataTimestamp', Date.now().toString());
      }
    } catch (err) {
      console.error('인사말을 불러오는 중 오류가 발생했습니다:', err);
      setError('데이터를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      
      // 재시도 로직
      if (retryCount < MAX_RETRIES) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
        }, 2000); // 2초 후 재시도
      }
    } finally {
      setLoading(false);
    }
  }, [retryCount]);

  useEffect(() => {
    window.scrollTo(0, 0);
    loadContent();
  }, [loadContent]);

  const handleRetry = () => {
    setRetryCount(0);
    loadContent();
  };

  return (
    <>
      <Header />
      <main className="pt-24 pb-16">
        <ScrollReveal>
          <section className="py-16 bg-mainBlue text-white">
            <div className="main-container">
              <h1 className="text-3xl md:text-4xl font-bold mb-4 reveal" style={{ wordBreak: 'keep-all' }}>
                {greetingData?.title || '인사말'}
              </h1>
              <p className="text-white/80 max-w-3xl reveal reveal-delay-100" style={{ wordBreak: 'keep-all' }}>
                서울대학교 정치지도자과정의 인사말입니다.
              </p>
            </div>
          </section>

          <section className="py-16">
            <div className="main-container">
              <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-elegant p-8 md:p-12 reveal reveal-delay-200">
                {loading ? (
                  <div className="flex flex-col items-center justify-center h-64 space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mainBlue"></div>
                    <p className="text-gray-600">데이터를 불러오는 중...</p>
                  </div>
                ) : error ? (
                  <div className="text-center space-y-4">
                    <p className="text-red-500">{error}</p>
                    {retryCount < MAX_RETRIES ? (
                      <p className="text-gray-600">재시도 중... ({retryCount + 1}/{MAX_RETRIES})</p>
                    ) : (
                      <button
                        onClick={handleRetry}
                        className="px-4 py-2 bg-mainBlue text-white rounded hover:bg-mainBlue/90 transition-colors"
                      >
                        다시 시도
                      </button>
                    )}
                  </div>
                ) : greetingData ? (
                  <div className="prose prose-lg max-w-none" style={{ wordBreak: 'keep-all' }}>
                    {apiService.parseContentToParagraphs(greetingData.content).map((paragraph, index) => (
                      <p key={index} className="mb-6">{paragraph}</p>
                    ))}
                    
                    <div className="text-right mt-8">
                      <p className="font-medium text-lg" style={{ wordBreak: 'keep-all' }}>
                        {greetingData.position} {greetingData.author}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-600">
                    데이터가 없습니다.
                  </div>
                )}
              </div>
            </div>
          </section>
        </ScrollReveal>
      </main>
      <Footer />
    </>
  );
};

export default Greeting;
