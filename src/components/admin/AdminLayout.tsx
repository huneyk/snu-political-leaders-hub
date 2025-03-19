import { ReactNode } from 'react';
import AdminNavTabs from './AdminNavTabs';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 pt-20 pb-6">
        <h1 className="text-3xl font-bold text-mainBlue mb-6">관리자 대시보드</h1>
        <AdminNavTabs />
        <div className="pt-6">
          {children}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AdminLayout; 