
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const NotFound = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Header />
      <main className="pt-24 pb-16 min-h-screen flex items-center">
        <div className="main-container text-center py-20">
          <div className="max-w-lg mx-auto">
            <h1 className="text-6xl md:text-8xl font-bold text-mainBlue mb-6 animate-fade-in">404</h1>
            <h2 className="text-2xl md:text-3xl font-semibold mb-4 animate-fade-in">페이지를 찾을 수 없습니다</h2>
            <p className="text-gray-600 mb-8 animate-fade-in">
              요청하신 페이지가 존재하지 않거나, 이동되었거나, 일시적으로 사용할 수 없습니다.
            </p>
            <Link 
              to="/" 
              className="btn-primary inline-flex items-center animate-fade-in"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              홈으로 돌아가기
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default NotFound;
