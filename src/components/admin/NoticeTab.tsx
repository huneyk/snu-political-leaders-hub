
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';

const NoticeTab = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>공지사항 관리</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <p className="text-gray-500 mb-4">공지사항을 관리합니다.</p>
        <Link to="/admin/notices" className="block">
          <Button 
            className="w-full h-24 bg-mainBlue hover:bg-blue-900 flex items-center justify-center gap-3"
          >
            <Bell className="h-6 w-6" />
            <span className="text-lg font-medium">공지사항 관리하기</span>
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default NoticeTab;
