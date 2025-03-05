import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';
import { contentService } from '@/lib/contentService';

const Greeting = () => {
  const [title, setTitle] = useState('인사말');
  const [content, setContent] = useState<string[]>([]);
  const [signText, setSignText] = useState('');

  const loadContent = () => {
    const greetingData = contentService.getGreetingContent();
    setTitle(greetingData.title);
    setContent(contentService.parseContentToParagraphs(greetingData.content));
    setSignText(greetingData.signText);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Load content on mount
    loadContent();
    
    // Listen for content updates
    const handleContentUpdate = (event: CustomEvent) => {
      if (event.detail.type === 'greeting') {
        loadContent();
      }
    };
    
    window.addEventListener('content-updated', handleContentUpdate as EventListener);
    
    return () => {
      window.removeEventListener('content-updated', handleContentUpdate as EventListener);
    };
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
                <div className="prose prose-lg max-w-none" style={{ wordBreak: 'keep-all' }}>
                  {content.map((paragraph, index) => (
                    <p key={index} className="mb-6">{paragraph}</p>
                  ))}
                  
                  <div className="text-right mt-8">
                    <p className="font-medium text-lg" style={{ wordBreak: 'keep-all' }}>{signText}</p>
                  </div>
                </div>
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
