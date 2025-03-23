import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { apiService } from '@/lib/apiService';

interface Notice {
  _id?: string;
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  isImportant: boolean;
}

const DEFAULT_NOTICE: Notice = {
  id: 'default',
  title: '서울대학교 정치지도자과정에 오신 것을 환영합니다',
  content: '서울대학교 정치지도자과정은 미래 정치 지도자를 양성하기 위한 프로그램입니다. 다양한 특강과 활동을 통해 정치적 소양을 기를 수 있습니다.',
  author: '관리자',
  createdAt: new Date().toISOString(),
  isImportant: true
};

const HomeNotices: React.FC = () => {
  const [notice, setNotice] = useState<Notice>(DEFAULT_NOTICE);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  // 컴포넌트 마운트/언마운트 처리
  useEffect(() => {
    isMountedRef.current = true;
    
    // 초기 공지사항 로드
    loadNoticeFromMongoDB();
    
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // MongoDB에서 공지사항 로드
  const loadNoticeFromMongoDB = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('MongoDB에서 공지사항 로드 시도');
      
      // apiService를 사용하여 MongoDB에서 공지사항 데이터 가져오기
      const notices = await apiService.getNotices();
      console.log('공지사항 데이터 로드 완료', notices);
      
      if (Array.isArray(notices) && notices.length > 0) {
        // 중요 공지사항 필터링
        const importantNotices = notices.filter(notice => notice.isImportant);
        console.log(`중요 공지사항 수: ${importantNotices.length}`);
        
        if (importantNotices.length > 0) {
          // 최신 공지사항 정렬 (생성일 기준 내림차순)
          const sortedNotices = importantNotices.sort((a, b) => {
            if (a.createdAt && b.createdAt) {
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            }
            return 0;
          });
          
          // 가장 최신 중요 공지사항 선택
          const latestNotice = sortedNotices[0];
          console.log('최신 중요 공지사항 로드:', latestNotice.title);
          
          // MongoDB에서 가져온 데이터 형식으로 변환
          const formattedNotice = {
            id: latestNotice._id || latestNotice.id,
            _id: latestNotice._id,
            title: latestNotice.title || '제목 없음',
            content: latestNotice.content || '내용 없음',
            author: latestNotice.author || '작성자 미상',
            createdAt: latestNotice.createdAt || new Date().toISOString(),
            isImportant: latestNotice.isImportant || false
          };
          
          if (isMountedRef.current) {
            setNotice(formattedNotice);
            setIsLoading(false);
            setError(null);
          }
          return;
        }
        
        // 중요 공지사항이 없는 경우 일반 공지사항 중 최신 공지사항 선택
        const sortedNotices = notices.sort((a, b) => {
          if (a.createdAt && b.createdAt) {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          }
          return 0;
        });
        
        if (sortedNotices.length > 0) {
          const latestNotice = sortedNotices[0];
          const formattedNotice = {
            id: latestNotice._id || latestNotice.id,
            _id: latestNotice._id,
            title: latestNotice.title || '제목 없음',
            content: latestNotice.content || '내용 없음',
            author: latestNotice.author || '작성자 미상',
            createdAt: latestNotice.createdAt || new Date().toISOString(),
            isImportant: latestNotice.isImportant || false
          };
          
          if (isMountedRef.current) {
            setNotice(formattedNotice);
            setIsLoading(false);
            setError(null);
          }
          return;
        }
      }
      
      console.log('공지사항이 없어 기본 공지사항 사용');
      if (isMountedRef.current) {
        setNotice(DEFAULT_NOTICE);
        setIsLoading(false);
        setError(null);
      }
    } catch (error) {
      console.error('공지사항 로드 중 오류 발생:', error);
      if (isMountedRef.current) {
        setNotice(DEFAULT_NOTICE);
        setIsLoading(false);
        setError('공지사항을 불러오는 중 오류가 발생했습니다.');
      }
    }
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'yyyy년 MM월 dd일', { locale: ko });
    } catch (error) {
      console.error('날짜 포맷팅 오류:', error);
      return '날짜 정보 없음';
    }
  };

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          {isLoading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-mainBlue mx-auto"></div>
              <p className="mt-4 text-gray-600">공지사항을 불러오는 중입니다...</p>
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <div className="text-red-500 mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-red-700">{error}</h3>
              <p className="text-sm text-gray-600 mt-2">새로고침 후 다시 시도해주세요.</p>
            </div>
          ) : (
            <div className="p-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900" style={{ wordBreak: 'keep-all' }}>{notice.title}</h3>
                <Link
                  to="/notices"
                  className="inline-block px-4 py-2 bg-mainBlue/70 text-white font-medium rounded hover:bg-blue-900/70 transition-colors duration-300 text-sm"
                >
                  더보기 {'>'}
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default HomeNotices; 