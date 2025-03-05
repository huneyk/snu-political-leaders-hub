import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { FileDown } from 'lucide-react';

const FooterTab = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Footer 관리</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <p className="text-gray-500 mb-4">Footer의 다운로드 버튼 및 이메일 주소를 관리합니다.</p>
        <Link to="/admin/footer" className="block">
          <Button 
            className="w-full h-24 bg-mainBlue hover:bg-blue-900 flex items-center justify-center gap-3"
          >
            <FileDown className="h-6 w-6" />
            <span className="text-lg font-medium">Footer 관리하기</span>
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default FooterTab; 