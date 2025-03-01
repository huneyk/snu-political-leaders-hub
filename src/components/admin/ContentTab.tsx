
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { FileText, MessageSquare, Target, Award, Users } from 'lucide-react';

const ContentTab = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>콘텐츠 관리</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-500 mb-4">홈페이지의 콘텐츠를 관리합니다.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link to="/admin/greeting" className="block no-underline">
            <div 
              className="h-32 w-full bg-mainBlue hover:bg-blue-900 text-white flex flex-col items-center justify-center gap-2 rounded-md transition-colors cursor-pointer"
            >
              <FileText size={24} />
              <span className="text-lg font-medium">인사말 관리</span>
              <span className="text-sm opacity-80">인사말 페이지 내용 수정</span>
            </div>
          </Link>
          <Link to="/admin/recommendations" className="block no-underline">
            <div 
              className="h-32 w-full bg-mainBlue hover:bg-blue-900 text-white flex flex-col items-center justify-center gap-2 rounded-md transition-colors cursor-pointer"
            >
              <MessageSquare size={24} />
              <span className="text-lg font-medium">추천의 글 관리</span>
              <span className="text-sm opacity-80">추천의 글 페이지 내용 수정</span>
            </div>
          </Link>
          <Link to="/admin/course-goal" className="block no-underline">
            <div 
              className="h-32 w-full bg-mainBlue hover:bg-blue-900 text-white flex flex-col items-center justify-center gap-2 rounded-md transition-colors cursor-pointer"
            >
              <Target size={24} />
              <span className="text-lg font-medium">과정의 목표 관리</span>
              <span className="text-sm opacity-80">과정 목표 페이지 내용 수정</span>
            </div>
          </Link>
          <Link to="/admin/course-benefits" className="block no-underline">
            <div 
              className="h-32 w-full bg-mainBlue hover:bg-blue-900 text-white flex flex-col items-center justify-center gap-2 rounded-md transition-colors cursor-pointer"
            >
              <Award size={24} />
              <span className="text-lg font-medium">과정의 특전 관리</span>
              <span className="text-sm opacity-80">과정 특전 페이지 내용 수정</span>
            </div>
          </Link>
          <Link to="/admin/professors" className="block no-underline">
            <div 
              className="h-32 w-full bg-mainBlue hover:bg-blue-900 text-white flex flex-col items-center justify-center gap-2 rounded-md transition-colors cursor-pointer"
            >
              <Users size={24} />
              <span className="text-lg font-medium">운영 교수진 관리</span>
              <span className="text-sm opacity-80">교수진 정보 수정</span>
            </div>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContentTab;
