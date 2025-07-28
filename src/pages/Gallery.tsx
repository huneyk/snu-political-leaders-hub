import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, Image, Calendar } from 'lucide-react';
import { apiService } from '@/lib/apiService';
import './Gallery.css';

// 기수별 갤러리 썸네일 정보 인터페이스
interface GalleryThumbnail {
  _id: string;
  term: number;
  thumbnailUrl: string;
  itemCount: number;
  latestDate: string;
  latestItemTitle: string;
  lastUpdated: string;
  isActive: boolean;
}

// 기수별 갤러리 정보 인터페이스 (기존 호환성 유지)
interface TermGalleryInfo {
  term: string;
  count: number;
  latestDate: string;
  thumbnailUrl: string;
}

const Gallery = () => {
  const navigate = useNavigate();
  const [termGalleries, setTermGalleries] = useState<TermGalleryInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previousTerms, setPreviousTerms] = useState<string[]>([]);
  const [newlyAddedTerms, setNewlyAddedTerms] = useState<string[]>([]);

  useEffect(() => {
    loadGalleryMetadata();
    
    // 페이지 포커스 시 자동 새로고침 (새로운 기수 감지용)
    const handleFocus = () => {
      console.log('📱 페이지 포커스 감지 - 갤러리 메타데이터 새로고침');
      loadGalleryMetadata();
    };
    
    // 주기적으로 새로운 기수 체크 (5분마다)
    const intervalId = setInterval(() => {
      console.log('🔄 주기적 갤러리 메타데이터 업데이트 체크');
      loadGalleryMetadata();
    }, 5 * 60 * 1000); // 5분
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(intervalId);
    };
  }, []);

  const loadGalleryMetadata = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('📋 갤러리 메타데이터 로드 시작');
      
      // 썸네일 API는 서버에서 구현되지 않음 - 기본 갤러리 API 사용
      console.log('📋 기본 갤러리 API 사용 (썸네일 API 미구현)');
      
      // 썸네일 API 실패 시 기존 방식으로 Fallback
      console.log('🔄 기존 갤러리 시스템으로 Fallback');
      
      // valid-terms API는 서버에서 구현되지 않음 - 갤러리 데이터에서 기수 추출
      console.log('📋 갤러리 데이터에서 기수 추출 (valid-terms API 미구현)');
      let validTerms: string[] = [];
      
      // 실제 존재하는 기수들의 갤러리 데이터만 가져오기
      const galleryData = await apiService.getGallery();
      
      // 갤러리 데이터에서 기수 추출
      if (Array.isArray(galleryData) && galleryData.length > 0) {
        validTerms = [...new Set(galleryData.map(item => String(item.term)))].sort((a, b) => Number(a) - Number(b));
        console.log('🔍 갤러리 데이터에서 추출한 기수들:', validTerms);
        
        // 디버깅: 전체 갤러리 데이터의 기수 분포 확인
        const allTermDistribution = galleryData.reduce((acc, item) => {
          const termKey = String(item.term);
          acc[termKey] = (acc[termKey] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        console.log('🔍 메인 갤러리 - 전체 데이터의 기수 분포:', allTermDistribution);
        
        // 새로운 기수 감지
        if (previousTerms.length > 0) {
          const newTerms = validTerms.filter(term => !previousTerms.includes(term));
          if (newTerms.length > 0) {
            console.log('🎉 새로운 기수 감지:', newTerms);
            setNewlyAddedTerms(newTerms);
            setTimeout(() => {
              setNewlyAddedTerms([]);
            }, 10000);
          }
        }
        setPreviousTerms(validTerms);
      }
      
      if (validTerms.length === 0) {
        console.warn('⚠️ 실제 존재하는 기수가 없습니다');
        setTermGalleries([]);
        return;
      }
      
      if (Array.isArray(galleryData) && galleryData.length > 0) {
        // 실제 존재하는 기수들만 필터링
        const filteredData = galleryData.filter(item => validTerms.includes(String(item.term)));
        
        // 기수별로 그룹화
        const termGroups: { [key: string]: any[] } = {};
        
        filteredData.forEach(item => {
          const term = String(item.term);
          if (!termGroups[term]) {
            termGroups[term] = [];
          }
          termGroups[term].push(item);
        });
        
        // 기수별 정보 생성 (실제 존재하는 기수만)
        const termInfos: TermGalleryInfo[] = validTerms.map(term => {
          const items = termGroups[term] || [];
          
          if (items.length > 0) {
            // 날짜순으로 정렬하여 최신 날짜 찾기
            const sortedItems = items.sort((a, b) => 
              new Date(b.date).getTime() - new Date(a.date).getTime()
            );
            
            return {
              term,
              count: items.length,
              latestDate: sortedItems[0].date,
              thumbnailUrl: sortedItems[0].imageUrl || ''
            };
          } else {
            return {
              term,
              count: 0,
              latestDate: new Date().toISOString(),
              thumbnailUrl: ''
            };
          }
        }).filter(Boolean);
        
        // 기수별로 정렬 (최신 기수부터)
        const sortedTermInfos = termInfos.sort((a, b) => Number(b.term) - Number(a.term));
        
        setTermGalleries(sortedTermInfos);
        console.log('✅ 갤러리 메타데이터 로드 완료 (Fallback):', sortedTermInfos);
        
      } else {
        // 갤러리 데이터가 없어도 실제 존재하는 기수들은 표시
        const termInfos: TermGalleryInfo[] = validTerms.map(term => ({
          term,
          count: 0,
          latestDate: new Date().toISOString(),
          thumbnailUrl: ''
        }));
        
        const sortedTermInfos = termInfos.sort((a, b) => Number(b.term) - Number(a.term));
        setTermGalleries(sortedTermInfos);
        console.log('📋 갤러리 데이터는 없지만 유효한 기수들로 목록 생성 (Fallback):', sortedTermInfos);
      }
      
    } catch (err: any) {
      console.error('❌ 갤러리 메타데이터 로드 실패:', err);
      
      // 환경 정보 로깅
      console.error('🌐 현재 환경:', import.meta.env.MODE);
      console.error('🔗 API URL:', import.meta.env.MODE === 'production' 
        ? 'https://snu-plp-hub-server.onrender.com/api' 
        : 'http://localhost:5001/api');
      
      // Axios 에러 세부 정보
      if (err.isAxiosError) {
        console.error('🔍 Gallery 페이지 Axios 에러 세부정보:', {
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data,
          headers: err.response?.headers,
          config: {
            url: err.config?.url,
            method: err.config?.method,
            baseURL: err.config?.baseURL,
            timeout: err.config?.timeout
          }
        });
        
        // HTML 응답 감지
        if (typeof err.response?.data === 'string' && err.response.data.includes('<!DOCTYPE html>')) {
          console.error('🚨 Gallery 페이지: 서버가 HTML 페이지를 반환했습니다 - 라우팅 문제일 가능성');
        }
        
        // 상세한 에러 메시지 설정
        if (err.response?.status === 404) {
          setError('갤러리 API를 찾을 수 없습니다. 서버 설정을 확인해주세요.');
        } else if (err.response?.status === 500) {
          setError('서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        } else if (err.code === 'NETWORK_ERROR' || err.message.includes('Network Error')) {
          setError('네트워크 연결에 문제가 있습니다. 인터넷 연결을 확인해주세요.');
        } else {
          setError(`갤러리 데이터를 불러오는 중 오류가 발생했습니다. (${err.response?.status || err.message})`);
        }
      } else {
        setError(`갤러리 데이터를 불러오는 중 오류가 발생했습니다. (${err.message || '알 수 없는 오류'})`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTermClick = (term: string) => {
    navigate(`/gallery/term/${term}`);
  };

  if (loading) {
    return (
      <div className="gallery-page">
        <Header />
        <section className="pt-28 pb-16 bg-mainBlue text-white">
          <div className="main-container">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">갤러리</h1>
            <p className="text-lg opacity-90">정치지도자 과정의 다양한 활동들을 만나보세요</p>
          </div>
        </section>
        
        <main className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="overflow-hidden">
                    <div className="aspect-video bg-gray-200">
                      <Skeleton className="w-full h-full" />
                    </div>
                    <CardContent className="p-6">
                      <Skeleton className="h-6 w-20 mb-2" />
                      <Skeleton className="h-4 w-32 mb-4" />
                      <Skeleton className="h-10 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="gallery-page">
        <Header />
        <section className="pt-28 pb-16 bg-mainBlue text-white">
          <div className="main-container">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">갤러리</h1>
            <p className="text-lg opacity-90">정치지도자 과정의 다양한 활동들을 만나보세요</p>
          </div>
        </section>
        
        <main className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">오류!</strong>
                <span className="block sm:inline"> {error}</span>
                <Button 
                  onClick={loadGalleryMetadata} 
                  className="mt-4 bg-red-600 hover:bg-red-700 text-white"
                >
                  다시 시도
                </Button>
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }

  return (
    <div className="gallery-page">
      <Header />
      
      {/* 상단 배너 */}
      <section className="pt-28 pb-16 bg-mainBlue text-white">
        <div className="main-container">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">갤러리</h1>
          <p className="text-lg opacity-90">정치지도자 과정의 다양한 활동들을 기수별로 만나보세요</p>
        </div>
      </section>
      
      <main className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            
            {/* 새로운 기수 추가 알림 */}
            {newlyAddedTerms.length > 0 && (
              <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 border-l-4 border-green-500 rounded-lg animate-pulse">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">
                      🎉 새로운 기수가 추가되었습니다! 제{newlyAddedTerms.join(', ')}기 갤러리를 확인해보세요.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 기수별 갤러리 목록 */}
            {termGalleries.length > 0 ? (
              <>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold mb-2">기수별 갤러리</h2>
                  <p className="text-gray-600">각 기수별로 정리된 갤러리를 확인하실 수 있습니다.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {termGalleries.map((termInfo) => {
                    const isNewTerm = newlyAddedTerms.includes(termInfo.term);
                    return (
                      <Card 
                        key={termInfo.term} 
                        className={`overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer border-0 shadow-sm group ${
                          isNewTerm ? 'ring-2 ring-green-400 shadow-lg bg-gradient-to-br from-green-50 to-blue-50' : ''
                        }`}
                        onClick={() => handleTermClick(termInfo.term)}
                      >
                                             <div className="relative aspect-video bg-gray-100">
                         {termInfo.thumbnailUrl ? (
                           <img
                             src={termInfo.thumbnailUrl}
                             alt={`제 ${termInfo.term}기 갤러리`}
                             className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                           />
                         ) : (
                           // CSS 기반 placeholder
                           <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-gray-500">
                             <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-3">
                               <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
                               <circle cx="9" cy="9" r="2"></circle>
                               <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
                             </svg>
                             <span className="text-sm font-medium">제 {termInfo.term}기</span>
                             <span className="text-xs">갤러리</span>
                           </div>
                         )}
                        
                        {/* 오버레이 */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <div className="bg-white p-3 rounded-full shadow-lg">
                            <ArrowRight className="w-6 h-6 text-gray-700" />
                          </div>
                        </div>
                        
                        {/* 기수 배지 */}
                        <div className="absolute top-4 left-4 flex items-center gap-2">
                          <Badge className="bg-mainBlue text-white font-bold text-lg px-3 py-1">
                            제 {termInfo.term}기
                          </Badge>
                          {isNewTerm && (
                            <Badge className="bg-green-500 text-white font-bold text-xs px-2 py-1 animate-bounce">
                              NEW
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-xl font-bold">제 {termInfo.term}기 갤러리</h3>
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Image className="w-3 h-3" />
                            {termInfo.count}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-500 mb-4">
                          <Calendar className="w-4 h-4 mr-2" />
                          최근 업데이트: {new Intl.DateTimeFormat('ko-KR', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          }).format(new Date(termInfo.latestDate))}
                        </div>
                        
                        <Button 
                          className="w-full bg-mainBlue hover:bg-blue-700 text-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTermClick(termInfo.term);
                          }}
                        >
                          갤러리 보기
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </CardContent>
                    </Card>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="text-center py-16">
                <div className="text-gray-400 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4">
                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
                    <circle cx="9" cy="9" r="2"></circle>
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">갤러리가 비어있습니다</h3>
                <p className="text-gray-600 mb-4">
                  아직 등록된 갤러리가 없습니다. 관리자 페이지에서 갤러리를 추가해주세요.
                </p>
                <Button onClick={loadGalleryMetadata} className="bg-mainBlue hover:bg-blue-700 text-white">
                  새로고침
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Gallery;
