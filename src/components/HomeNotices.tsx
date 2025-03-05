import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface Notice {
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
  const isMountedRef = useRef(true);
  const updateIntervalRef = useRef<number | null>(null);

  // 컴포넌트 마운트/언마운트 처리
  useEffect(() => {
    isMountedRef.current = true;
    
    // 초기 공지사항 로드
    loadNotice();
    
    // localStorage 변경 이벤트 리스너 등록
    window.addEventListener('storage', handleStorageChange);
    
    // 주기적으로 공지사항 업데이트 (5초마다)
    updateIntervalRef.current = window.setInterval(() => {
      if (isMountedRef.current) {
        console.log('공지사항 주기적 업데이트 실행');
        loadNotice();
      }
    }, 5000);
    
    return () => {
      isMountedRef.current = false;
      window.removeEventListener('storage', handleStorageChange);
      
      if (updateIntervalRef.current) {
        window.clearInterval(updateIntervalRef.current);
        updateIntervalRef.current = null;
      }
    };
  }, []);

  // localStorage 변경 감지 시 공지사항 리로드
  const handleStorageChange = (event: StorageEvent) => {
    if (event.key === 'notices' && isMountedRef.current) {
      console.log('공지사항 localStorage 변경 감지');
      loadNotice();
    }
  };

  // 공지사항 로드 함수
  const loadNotice = () => {
    try {
      console.log('공지사항 로드 시도');
      const savedNotices = localStorage.getItem('notices');
      
      if (savedNotices) {
        const parsedNotices: Notice[] = JSON.parse(savedNotices);
        console.log(`파싱된 공지사항 수: ${parsedNotices.length}`);
        
        // 중요 공지사항 필터링
        const importantNotices = parsedNotices.filter(notice => notice.isImportant);
        console.log(`중요 공지사항 수: ${importantNotices.length}`);
        
        if (importantNotices.length > 0) {
          // 최신 공지사항 정렬 (생성일 기준 내림차순)
          const sortedNotices = importantNotices.sort((a, b) => {
            // createdAt이 있으면 날짜 기준, 없으면 id 기준으로 정렬
            if (a.createdAt && b.createdAt) {
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            }
            return b.id.localeCompare(a.id);
          });
          
          // 가장 최신 중요 공지사항 선택
          const latestNotice = sortedNotices[0];
          console.log('최신 중요 공지사항 로드:', latestNotice.title);
          
          if (isMountedRef.current) {
            setNotice(latestNotice);
          }
          return;
        }
      }
      
      console.log('저장된 중요 공지사항이 없어 기본 공지사항 사용');
      if (isMountedRef.current) {
        setNotice(DEFAULT_NOTICE);
      }
    } catch (error) {
      console.error('공지사항 로드 중 오류 발생:', error);
      if (isMountedRef.current) {
        setNotice(DEFAULT_NOTICE);
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

  // 내용 요약 함수 (최대 100자)
  const summarizeContent = (content: string, maxLength = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h4 className="text-3xl font-bold text-gray-900 mb-4">주요 공지사항</h4>

        </div>

        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">{notice.title}</h3>
              <span className="text-sm text-gray-500">{formatDate(notice.createdAt)}</span>
            </div>
            <p className="text-gray-700 mb-4">{summarizeContent(notice.content)}</p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">작성자: {notice.author}</span>
              <Link
                to="/notices"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-300"
              >
                더 보기
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeNotices; 