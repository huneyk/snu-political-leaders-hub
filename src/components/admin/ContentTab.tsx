
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, MessageSquare, Target, Award, Users } from 'lucide-react';

const ContentTab = () => {
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>콘텐츠 관리</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-500 mb-4">홈페이지의 콘텐츠를 관리합니다.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div 
            className="h-32 w-full bg-mainBlue hover:bg-blue-900 text-white flex flex-col items-center justify-center gap-2 rounded-md transition-colors cursor-pointer"
            onClick={() => handleNavigation('/admin/greeting')}
          >
            <FileText size={24} />
            <span className="text-lg font-medium">인사말 관리</span>
            <span className="text-sm opacity-80">인사말 페이지 내용 수정</span>
          </div>
          <div 
            className="h-32 w-full bg-mainBlue hover:bg-blue-900 text-white flex flex-col items-center justify-center gap-2 rounded-md transition-colors cursor-pointer"
            onClick={() => handleNavigation('/admin/recommendations')}
          >
            <MessageSquare size={24} />
            <span className="text-lg font-medium">추천의 글 관리</span>
            <span className="text-sm opacity-80">추천의 글 페이지 내용 수정</span>
          </div>
          <div 
            className="h-32 w-full bg-mainBlue hover:bg-blue-900 text-white flex flex-col items-center justify-center gap-2 rounded-md transition-colors cursor-pointer"
            onClick={() => handleNavigation('/admin/course-goal')}
          >
            <Target size={24} />
            <span className="text-lg font-medium">과정의 목표 관리</span>
            <span className="text-sm opacity-80">과정 목표 페이지 내용 수정</span>
          </div>
          <div 
            className="h-32 w-full bg-mainBlue hover:bg-blue-900 text-white flex flex-col items-center justify-center gap-2 rounded-md transition-colors cursor-pointer"
            onClick={() => handleNavigation('/admin/course-benefits')}
          >
            <Award size={24} />
            <span className="text-lg font-medium">과정의 특전 관리</span>
            <span className="text-sm opacity-80">과정 특전 페이지 내용 수정</span>
          </div>
          <div 
            className="h-32 w-full bg-mainBlue hover:bg-blue-900 text-white flex flex-col items-center justify-center gap-2 rounded-md transition-colors cursor-pointer"
            onClick={() => handleNavigation('/admin/professors')}
          >
            <Users size={24} />
            <span className="text-lg font-medium">운영 교수진 관리</span>
            <span className="text-sm opacity-80">교수진 정보 수정</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContentTab;
