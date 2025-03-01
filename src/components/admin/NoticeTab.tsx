
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const NoticeTab = () => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate('/admin/notices');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>공지사항 관리</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <p className="text-gray-500 mb-4">공지사항을 관리합니다.</p>
        <Button 
          className="w-full h-24 bg-mainBlue hover:bg-blue-900"
          onClick={handleClick}
        >
          <span className="text-lg font-medium">공지사항 관리하기</span>
        </Button>
      </CardContent>
    </Card>
  );
};

export default NoticeTab;
