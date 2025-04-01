import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { apiService } from '@/lib/apiService';

interface GoalItem {
  _id?: string;
  title: string;
  content: string;
  imageUrl?: string;
  order?: number;
  isActive?: boolean;
}

interface ObjectivesProps {
  onStatusChange?: (loaded: boolean, error: string | null) => void;
}

const HomeObjectives = ({ onStatusChange }: ObjectivesProps) => {
  const [sectionTitle, setSectionTitle] = useState('과정의 목표');
  const [goals, setGoals] = useState<GoalItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadObjectivesFromMongoDB();
  }, []);

  // MongoDB에서 과정 목표 데이터 로드
  const loadObjectivesFromMongoDB = async () => {
    try {
      console.log('MongoDB에서 과정 목표 데이터 로드 시도');
      setIsLoading(true);
      setError(null);
      
      if (onStatusChange) onStatusChange(false, null);
      
      const data = await apiService.getObjectives();
      console.log('과정 목표 데이터 로드 완료:', data);
      
      // 데이터 처리
      if (Array.isArray(data) && data.length > 0) {
        // 첫 번째 항목에서 sectionTitle 가져오기 (모든 항목이 같은 sectionTitle을 가짐)
        if (data[0]?.sectionTitle) {
          setSectionTitle(data[0].sectionTitle);
        }
        
        // 데이터 매핑
        const mappedGoals = data.map((item: any) => ({
          _id: item._id,
          title: item.title || '',
          content: item.description || item.content || '',  // description 필드를 먼저 확인
          imageUrl: item.iconImage || item.imageUrl || item.image || item.iconUrl || '',
          order: item.order || 0,
          isActive: item.isActive !== false
        }));
        
        // 활성화된 목표만 필터링하고 순서대로 정렬
        const activeGoals = mappedGoals
          .filter(goal => goal.isActive !== false)
          .sort((a, b) => (a.order || 0) - (b.order || 0));
        
        // 홈페이지에는 최대 3개만 표시
        setGoals(activeGoals.slice(0, 3));
        console.log('처리된 목표 데이터:', activeGoals);
      } else if (data && typeof data === 'object' && Array.isArray(data.objectives)) {
        // 이전 형식: data.objectives 배열이 있는 경우 (하위 호환성 유지)
        if (data.sectionTitle) {
          setSectionTitle(data.sectionTitle);
        }
        
        const mappedGoals = data.objectives.map((item: any) => ({
          _id: item._id,
          title: item.title || '',
          content: item.content || item.description || '',
          imageUrl: item.iconImage || item.imageUrl || item.image || item.iconUrl || '',
          order: item.order || 0,
          isActive: item.isActive !== false
        }));
        
        const activeGoals = mappedGoals
          .filter(goal => goal.isActive !== false)
          .sort((a, b) => (a.order || 0) - (b.order || 0));
        
        setGoals(activeGoals.slice(0, 3));
        console.log('처리된 목표 데이터 (이전 형식):', activeGoals);
      } else {
        setGoals([]);
        console.log('목표 데이터가 없거나 형식이 올바르지 않습니다.');
      }
      
      setIsLoading(false);
      if (onStatusChange) onStatusChange(true, null);
    } catch (err) {
      console.error('과정 목표 데이터 로드 실패:', err);
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
      setIsLoading(false);
      if (onStatusChange) onStatusChange(true, '과정 목표 로드 실패');
    }
  };

  // 이미지 URL 처리 함수
  const getImageUrl = (url?: string): string => {
    if (!url) return '';
    
    // 상대 경로인 경우 API 기본 URL 추가
    if (url.startsWith('/') && !url.startsWith('//')) {
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? 'https://plp.snu.ac.kr' 
        : 'http://localhost:5000';
      return `${baseUrl}${url}`;
    }
    
    // 이미 http:// 또는 https://로 시작하는 URL은 그대로 사용
    return url;
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="main-container">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-mainBlue mb-4 reveal" style={{ wordBreak: 'keep-all' }}>{sectionTitle}</h2>
          <p className="text-gray-600 max-w-2xl mx-auto reveal reveal-delay-100" style={{ wordBreak: 'keep-all' }}>
            서울대학교 정치지도자과정은 다음과 같은 목표를 가지고 있습니다.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-mainBlue"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">
            <p>{error}</p>
          </div>
        ) : goals.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>등록된 과정 목표가 없습니다.</p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto mb-10">
            {goals.map((goal, index) => (
              <div 
                key={goal._id || index}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full overflow-hidden shadow-md bg-mainBlue flex-shrink-0 mr-4">
                    {goal.imageUrl ? (
                      <img 
                        src={getImageUrl(goal.imageUrl)} 
                        alt={goal.title} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error('이미지 로드 실패:', goal.title, goal.imageUrl);
                          // Fallback if image fails to load
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Icon';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-mainBlue text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-mainBlue" style={{ wordBreak: 'keep-all' }}>{goal.title}</h2>
                </div>
                <div className="prose prose-sm max-w-none mb-4">
                  <p className="text-gray-700 line-clamp-3" style={{ wordBreak: 'keep-all' }}>{goal.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="text-center">
          <Link to="/intro/objectives">
            <Button className="bg-mainBlue/70 hover:bg-blue-900/70 transition-colors text-white h-9 text-sm px-4">
              <span>자세한 내용 보기 {'>'}</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HomeObjectives; 