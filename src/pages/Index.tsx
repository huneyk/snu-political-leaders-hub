import { useEffect, useState, useCallback } from 'react';
import ScrollReveal from '@/components/ScrollReveal';
import Hero from '@/components/Hero';
import HomeNotices from '@/components/HomeNotices';
import HomeObjectives from '@/components/HomeObjectives';
import SpecialLecturers from '@/components/SpecialLecturers';
import HomeSchedule from '@/components/HomeSchedule';
import HomeAdmission from '@/components/HomeAdmission';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AdminLink from '@/components/AdminLink';
import MobileFloatingMenu from '@/components/MobileFloatingMenu';

const Index = () => {
  const [error, setError] = useState<string | null>(null);
  const [scheduleKey, setScheduleKey] = useState<number>(Date.now());
  const [retryCount, setRetryCount] = useState<number>(0);
  const [noticesKey, setNoticesKey] = useState<number>(Date.now());

  // 일정 컴포넌트 리로드 함수
  const reloadSchedule = useCallback(() => {
    console.log('일정 컴포넌트 리로드 시도:', retryCount + 1);
    setScheduleKey(Date.now());
    setRetryCount(prev => prev + 1);
  }, [retryCount]);

  // 공지사항 컴포넌트 리로드 함수
  const reloadNotices = useCallback(() => {
    console.log('공지사항 컴포넌트 리로드');
    setNoticesKey(Date.now());
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // 오류 처리를 위한 전역 에러 핸들러 추가
    const handleError = (event: ErrorEvent) => {
      console.error('페이지 오류 발생:', event.error);
      setError('페이지 로드 중 오류가 발생했습니다. 새로고침을 시도해 주세요.');
      event.preventDefault();
    };
    
    window.addEventListener('error', handleError);
    
    // 컴포넌트 마운트 시 컴포넌트 강제 리렌더링
    setScheduleKey(Date.now());
    setNoticesKey(Date.now());
    
    // localStorage 변경 감지 시 컴포넌트 리로드
    const handleStorageChange = (event: StorageEvent) => {
      console.log('localStorage 변경 감지:', event.key);
      
      if (event.key === 'academicSchedules' || event.key === 'specialActivities') {
        console.log('일정 데이터 변경 감지, 일정 컴포넌트 리로드');
        reloadSchedule();
      }
      
      if (event.key === 'notices') {
        console.log('공지사항 데이터 변경 감지, 공지사항 컴포넌트 리로드');
        reloadNotices();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [reloadSchedule, reloadNotices]);

  // 최대 3번까지 자동 재시도
  useEffect(() => {
    if (retryCount > 0 && retryCount < 3) {
      const timer = setTimeout(() => {
        console.log(`자동 재시도 ${retryCount}/3`);
        reloadSchedule();
      }, 3000); // 3초 후 재시도
      
      return () => clearTimeout(timer);
    }
  }, [retryCount, reloadSchedule]);

  // 오류 발생 시 표시할 컴포넌트
  if (error) {
    return (
      <>
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 py-12 text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">오류 발생</h1>
            <p className="mb-6">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              페이지 새로고침
            </button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // 일정 컴포넌트 수동 리로드 버튼
  const ScheduleReloadButton = () => (
    <div className="text-center mt-4">
      <button
        onClick={reloadSchedule}
        className="text-sm text-blue-600 hover:text-blue-800 underline"
      >
        일정 다시 불러오기
      </button>
    </div>
  );

  return (
    <>
      <Header />
      <AdminLink />
      <main>
        <Hero />
        <div>
          <HomeNotices key={noticesKey} />
        </div>
        <SpecialLecturers />
        <ScrollReveal>
          <HomeObjectives />
          <div>
            <HomeSchedule key={scheduleKey} />
            {retryCount >= 3 && <ScheduleReloadButton />}
          </div>
          <HomeAdmission />
        </ScrollReveal>
      </main>
      <Footer />
      <MobileFloatingMenu />
    </>
  );
};

export default Index;
