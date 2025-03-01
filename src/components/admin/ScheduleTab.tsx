
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const ScheduleTab = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>일정 관리</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <p className="text-gray-500 mb-4">강의 및 행사 일정을 관리합니다.</p>
        <Link to="/admin/schedule" className="block">
          <Button 
            className="w-full h-24 bg-mainBlue hover:bg-blue-900"
          >
            <span className="text-lg font-medium">일정 관리하기</span>
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default ScheduleTab;
