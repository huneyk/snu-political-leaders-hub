import { ReactNode } from 'react';
import AdminNavTabs from './AdminNavTabs';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavTabs />
      <div className="pt-16">
        {children}
      </div>
    </div>
  );
};

export default AdminLayout; 