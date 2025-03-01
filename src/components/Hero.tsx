
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Hero = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative h-screen flex items-center overflow-hidden bg-gradient-to-r from-mainBlue via-mainBlue/95 to-mainBlue/90">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1605810230434-7631ac76ec81')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
      
      <div className="main-container relative z-10 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h1 
            className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-6 transition-all duration-1000 ease-out ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            }`}
          >
            서울대학교 정치지도자 과정
          </h1>
          <p 
            className={`text-xl md:text-2xl font-light mb-8 text-white/80 transition-all duration-1000 delay-300 ease-out ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            }`}
          >
            SNU Political Leaders Program
          </p>
          <p 
            className={`mb-12 max-w-2xl mx-auto transition-all duration-1000 delay-500 ease-out ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            }`}
          >
            미래 정치를 이끌어갈 지도자를 양성하는 국내 최고 수준의 정치 교육 프로그램
          </p>
          <div 
            className={`flex flex-col sm:flex-row justify-center gap-4 transition-all duration-1000 delay-700 ease-out ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            }`}
          >
            <Link to="/admission/apply" className="btn-secondary">
              입학 안내
            </Link>
            <Link to="/intro/greeting" className="bg-white/10 backdrop-blur-sm text-white border border-white/30 px-6 py-3 rounded-md transition-all duration-300 hover:bg-white/20 transform hover:-translate-y-1 active:translate-y-0">
              과정 소개
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-0 right-0 flex justify-center animate-bounce">
        <a href="#highlights" aria-label="Scroll down" className="text-white/80 hover:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12l7 7 7-7"/>
          </svg>
        </a>
      </div>
    </section>
  );
};

export default Hero;
