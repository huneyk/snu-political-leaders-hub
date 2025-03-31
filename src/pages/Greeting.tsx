import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';
import { apiService } from '@/lib/apiService';

// 인사말 데이터 인터페이스
interface GreetingData {
  _id: string;
  title: string;
  content: string;
  author: string;
  position: string;
  imageUrl: string;
}

// 폴백 데이터
const FALLBACK_GREETING = {
  _id: '0',
  title: '인사말',
  content: '서울대학교 정치지도자과정 인사말입니다. 현재 데이터를 불러올 수 없습니다.',
  author: '정치지도자과정 주임교수',
  position: '',
  imageUrl: ''
};

// API 서버 URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const Greeting = () => {
  const [greeting, setGreeting] = useState<GreetingData>(FALLBACK_GREETING);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  // 인사말 데이터 가져오기 - fetch API 사용
  const fetchGreeting = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 로컬 스토리지에서 캐시된 데이터 확인
      const cachedData = localStorage.getItem('greeting');
      const cachedTime = localStorage.getItem('greetingTime');
      const CACHE_DURATION = 60 * 60 * 1000; // 1시간
      
      // 캐시가 유효한 경우 캐시된 데이터 사용
      if (cachedData && cachedTime && (Date.now() - parseInt(cachedTime)) < CACHE_DURATION) {
        setGreeting(JSON.parse(cachedData));
        setLoading(false);
        return;
      }
      
      // fetch API로 데이터 가져오기
      const response = await fetch(`${API_URL}/greeting`);
      
      // 응답 상태 확인
      if (!response.ok) {
        throw new Error(`서버 오류: ${response.status}`);
      }
      
      // JSON 데이터 파싱
      const data = await response.json();
      console.log('Greeting API Response:', data);
      
      if (data) {
        // 데이터 설정 및 캐싱
        setGreeting(data);
        localStorage.setItem('greeting', JSON.stringify(data));
        localStorage.setItem('greetingTime', Date.now().toString());
      } else {
        throw new Error('데이터가 없습니다.');
      }
    } catch (err) {
      console.error('인사말 정보를 불러오는 중 오류가 발생했습니다:', err);
      setError('인사말 정보를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      
      // 최대 3번까지 재시도
      if (retryCount < MAX_RETRIES) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          fetchGreeting();
        }, 3000);  // 3초 후 재시도
      }
    } finally {
      setLoading(false);
    }
  };

  // 페이지 로드 시 데이터 가져오기
  useEffect(() => {
    window.scrollTo(0, 0);
    fetchGreeting();
  }, []);

  // 재시도 핸들러
  const handleRetry = () => {
    setRetryCount(0);
    fetchGreeting();
  };

  // 콘텐츠를 단락으로 분리
  const contentParagraphs = greeting.content
    ? apiService.parseContentToParagraphs(greeting.content)
    : ['데이터를 불러올 수 없습니다.'];

  return (
    <>
      <Header />
      <main className="pt-24 pb-16">
        <ScrollReveal>
          <section className="py-16 bg-mainBlue text-white">
            <div className="main-container">
              <h1 className="text-3xl md:text-4xl font-bold mb-4 reveal" style={{ wordBreak: 'keep-all' }}>
                {greeting.title}
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
                    <p className="text-gray-600">인사말을 불러오는 중...</p>
                  </div>
                ) : error ? (
                  <div className="text-center space-y-4">
                    <p className="text-red-500">{error}</p>
                    {retryCount >= MAX_RETRIES && (
                      <button 
                        onClick={handleRetry}
                        className="px-4 py-2 bg-mainBlue text-white rounded hover:bg-mainBlue/90 transition-colors"
                      >
                        다시 시도
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="greeting-container space-y-6">
                    {/* 제목은 상단 섹션에 이미 표시되므로 여기서 제거 */}
                    {/* <h1 className="text-2xl font-bold mb-4">{greeting.title}</h1> */}
                    
                    <div className="greeting-content space-y-4">
                      {contentParagraphs.map((paragraph, index) => (
                        <p key={index} className="text-gray-700 leading-relaxed">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                    
                    <div className="greeting-author mt-8 text-right">
                      <p className="font-semibold">{greeting.author}</p>
                      <p className="text-gray-600">{greeting.position}</p>
                    </div>
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
