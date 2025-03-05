import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';

const AdminHomeButton = () => {
  const navigate = useNavigate();

  return (
    <Button
      variant="outline"
      className="flex items-center gap-2 mb-4"
      onClick={() => navigate('/admin')}
    >
      <Home size={16} />
      <span>관리자 홈으로 돌아가기</span>
    </Button>
  );
};

export default AdminHomeButton; 