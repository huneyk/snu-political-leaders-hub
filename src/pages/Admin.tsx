
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { getCurrentTab } from '@/utils/adminUtils';
import AdminNavTabs from '@/components/admin/AdminNavTabs';
import ContentTab from '@/components/admin/ContentTab';
import UsersTab from '@/components/admin/UsersTab';
import ScheduleTab from '@/components/admin/ScheduleTab';
import GalleryTab from '@/components/admin/GalleryTab';
import NoticeTab from '@/components/admin/NoticeTab';

const Admin = () => {
  const { isAuthenticated, isLoading } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [activeTab, setActiveTab] = useState(getCurrentTab(location.pathname));

  useEffect(() => {
    // Update active tab when location changes
    setActiveTab(getCurrentTab(location.pathname));
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    toast({
      title: "로그아웃",
      description: "관리자 계정에서 로그아웃되었습니다.",
    });
    navigate('/admin/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>로딩 중...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // 인증 확인 중이거나 실패 시 빈 화면 표시
  }

  return (
    <>
      <Header />
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-mainBlue">관리자 대시보드</h1>
          <Button onClick={handleLogout} variant="destructive">로그아웃</Button>
        </div>

        {/* Navigation tabs */}
        <AdminNavTabs activeTab={activeTab} />

        {/* Content area */}
        <div className="space-y-6">
          {activeTab === 'content' && <ContentTab />}
          {activeTab === 'users' && <UsersTab />}
          {activeTab === 'schedule' && <ScheduleTab />}
          {activeTab === 'gallery' && <GalleryTab />}
          {activeTab === 'notice' && <NoticeTab />}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Admin;
