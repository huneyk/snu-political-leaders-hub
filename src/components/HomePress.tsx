import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '@/lib/apiService';

interface PressItem {
  _id?: string;
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  isImportant: boolean;
}

const HomePress: React.FC = () => {
  const [pressItem, setPressItem] = useState<PressItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    loadPressFromMongoDB();

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadPressFromMongoDB = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('MongoDB에서 언론보도 로드 시도');

      const items = await apiService.getPress();
      console.log('언론보도 데이터 로드 완료', items);

      if (Array.isArray(items) && items.length > 0) {
        const importantItems = items.filter(item => item.isImportant);
        console.log(`중요 언론보도 수: ${importantItems.length}`);

        let latest: PressItem | null = null;

        if (importantItems.length > 0) {
          const sortedImportant = importantItems.sort((a, b) => {
            if (a.createdAt && b.createdAt) {
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            }
            return 0;
          });
          const top = sortedImportant[0];
          latest = {
            id: top._id || top.id,
            _id: top._id,
            title: top.title || '제목 없음',
            content: top.content || '내용 없음',
            author: top.author || '작성자 미상',
            createdAt: top.createdAt || new Date().toISOString(),
            isImportant: top.isImportant || false,
          };
        } else {
          const sorted = [...items].sort((a, b) => {
            if (a.createdAt && b.createdAt) {
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            }
            return 0;
          });
          if (sorted.length > 0) {
            const top = sorted[0];
            latest = {
              id: top._id || top.id,
              _id: top._id,
              title: top.title || '제목 없음',
              content: top.content || '내용 없음',
              author: top.author || '작성자 미상',
              createdAt: top.createdAt || new Date().toISOString(),
              isImportant: top.isImportant || false,
            };
          }
        }

        if (isMountedRef.current) {
          setPressItem(latest);
          setIsLoading(false);
          setError(null);
        }
        return;
      }

      console.log('언론보도 데이터 없음');
      if (isMountedRef.current) {
        setPressItem(null);
        setIsLoading(false);
        setError(null);
      }
    } catch (error) {
      console.error('언론보도 로드 중 오류 발생:', error);
      if (isMountedRef.current) {
        setPressItem(null);
        setIsLoading(false);
        setError('언론보도를 불러오는 중 오류가 발생했습니다.');
      }
    }
  };

  // 데이터가 없거나 오류 발생 시 카드 미노출 (fallback 데이터 사용 안 함)
  if (!isLoading && !pressItem) {
    return null;
  }

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          {isLoading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-mainBlue mx-auto"></div>
              <p className="mt-4 text-gray-600">언론보도를 불러오는 중입니다...</p>
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
          ) : pressItem ? (
            <div className="p-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-mainBlue/10 text-mainBlue flex-shrink-0">
                    언론보도
                  </span>
                  <h3 className="text-xl font-bold text-gray-900 truncate" style={{ wordBreak: 'keep-all' }}>{pressItem.title}</h3>
                </div>
                <Link
                  to="/press"
                  className="inline-block px-4 py-2 bg-mainBlue/70 text-white font-medium rounded hover:bg-blue-900/70 transition-colors duration-300 text-sm flex-shrink-0 ml-4"
                >
                  더보기 {'>'}
                </Link>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
};

export default HomePress;
