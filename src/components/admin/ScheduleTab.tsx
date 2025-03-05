import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Calendar, BookOpen, Users } from 'lucide-react';

const ScheduleTab = () => {
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>일정 관리</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-500 mb-4">강의 및 행사 일정을 관리합니다.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button 
            onClick={() => handleNavigation('/admin/schedule')}
            className="h-32 w-full bg-mainBlue hover:bg-blue-900 text-white flex flex-col items-center justify-center gap-2 rounded-md transition-colors cursor-pointer"
          >
            <Calendar size={24} />
            <span className="text-lg font-medium">일정 관리</span>
            <span className="text-sm opacity-80">강의 및 행사 일정 관리</span>
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScheduleTab;
