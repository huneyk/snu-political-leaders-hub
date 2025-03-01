
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const UsersTab = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>회원 관리</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <p className="text-gray-500 mb-4">회원 정보를 관리합니다.</p>
        <Link to="/admin/users" className="block">
          <Button 
            className="w-full h-24 bg-mainBlue hover:bg-blue-900"
          >
            <span className="text-lg font-medium">회원 목록 보기</span>
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default UsersTab;
