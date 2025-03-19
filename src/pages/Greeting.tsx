import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';
import { apiService } from '@/lib/apiService';

const Greeting = () => {
  const [title, setTitle] = useState('인사말');
  const [content, setContent] = useState<string[]>([]);
  const [signText, setSignText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadContent = async () => {
    try {
      setLoading(true);
      const greetingData = await apiService.getGreeting();
      
      if (greetingData) {
        setTitle(greetingData.title || '인사말');
        setContent(apiService.parseContentToParagraphs(greetingData.content || ''));
        // author와 position을 signText로 조합
        setSignText(`${greetingData.position || ''} ${greetingData.author || ''}`);
      }
      setError(null);
    } catch (err) {
      console.error('인사말을 불러오는 중 오류가 발생했습니다:', err);
      setError('데이터를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Load content on mount
    loadContent();
  }, []);

  return (
    <>
      <Header />
      <main className="pt-24 pb-16">
        <ScrollReveal>
          <section className="py-16 bg-mainBlue text-white">
            <div className="main-container">
              <h1 className="text-3xl md:text-4xl font-bold mb-4 reveal" style={{ wordBreak: 'keep-all' }}>{title}</h1>
              <p className="text-white/80 max-w-3xl reveal reveal-delay-100" style={{ wordBreak: 'keep-all' }}>
                서울대학교 정치지도자과정의 인사말입니다.
              </p>
            </div>
          </section>

          <section className="py-16">
            <div className="main-container">
              <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-elegant p-8 md:p-12 reveal reveal-delay-200">
                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mainBlue"></div>
                  </div>
                ) : error ? (
                  <div className="text-center text-red-500 p-4">{error}</div>
                ) : (
                  <div className="prose prose-lg max-w-none" style={{ wordBreak: 'keep-all' }}>
                    {content.map((paragraph, index) => (
                      <p key={index} className="mb-6">{paragraph}</p>
                    ))}
                    
                    <div className="text-right mt-8">
                      <p className="font-medium text-lg" style={{ wordBreak: 'keep-all' }}>{signText}</p>
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
