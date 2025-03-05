import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface GoalItem {
  title: string;
  content: string;
  imageUrl: string;
}

const HomeObjectives = () => {
  const [sectionTitle, setSectionTitle] = useState('과정의 목표');
  const [goals, setGoals] = useState<GoalItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load goals from localStorage
    const savedTitle = localStorage.getItem('course-goal-title');
    const savedGoals = localStorage.getItem('course-goals');
    
    if (savedTitle) setSectionTitle(savedTitle);
    if (savedGoals) {
      try {
        const parsedGoals = JSON.parse(savedGoals);
        // Handle old format (string array)
        if (Array.isArray(parsedGoals) && typeof parsedGoals[0] === 'string') {
          setGoals(parsedGoals.map(goal => ({ 
            title: '', 
            content: goal, 
            imageUrl: '' 
          })));
        } else {
          // 홈페이지에는 최대 3개만 표시
          setGoals(parsedGoals.slice(0, 3));
        }
      } catch (error) {
        console.error('Failed to parse goals:', error);
      }
    }
    
    setIsLoading(false);
  }, []);

  return (
    <section className="py-16 bg-gray-50">
      <div className="main-container">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-mainBlue mb-4 reveal">{sectionTitle}</h2>
          <p className="text-gray-600 max-w-2xl mx-auto reveal reveal-delay-100">
            서울대학교 정치지도자과정은 다음과 같은 목표를 가지고 있습니다.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-mainBlue"></div>
          </div>
        ) : goals.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>등록된 과정 목표가 없습니다.</p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto mb-10">
            {goals.map((goal, index) => (
              <div 
                key={index}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full overflow-hidden shadow-md bg-mainBlue flex-shrink-0 mr-4">
                    {goal.imageUrl ? (
                      <img 
                        src={goal.imageUrl} 
                        alt={goal.title} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
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
                  <h2 className="text-xl md:text-2xl font-bold text-mainBlue">{goal.title}</h2>
                </div>
                <div className="prose prose-sm max-w-none mb-4">
                  <p className="text-gray-700 line-clamp-3">{goal.content}</p>
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