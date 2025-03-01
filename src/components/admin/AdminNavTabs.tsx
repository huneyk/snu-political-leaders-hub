
import { Link, useLocation } from 'react-router-dom';

interface AdminNavTabsProps {
  activeTab: string;
}

const AdminNavTabs = ({ activeTab }: AdminNavTabsProps) => {
  const location = useLocation();
  const path = location.pathname;
  
  // Determine if we're on any content management page
  const isContentPage = path.includes('/admin/greeting') || 
                       path.includes('/admin/recommendations') || 
                       path.includes('/admin/course-goal') || 
                       path.includes('/admin/course-benefits') || 
                       path.includes('/admin/professors') ||
                       path === '/admin';
  
  // Use the determined content page status or the activeTab prop
  const effectiveActiveTab = isContentPage ? 'content' : activeTab;
  
  return (
    <div className="mb-6">
      <div className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground w-full overflow-x-auto flex-nowrap">
        <Link 
          to="/admin"
          className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${effectiveActiveTab === 'content' ? 'bg-background text-foreground shadow-sm' : ''}`}
        >
          콘텐츠 관리
        </Link>
        <Link 
          to="/admin/users"
          className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${activeTab === 'users' ? 'bg-background text-foreground shadow-sm' : ''}`}
        >
          회원 관리
        </Link>
        <Link 
          to="/admin/schedule"
          className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${activeTab === 'schedule' ? 'bg-background text-foreground shadow-sm' : ''}`}
        >
          일정 관리
        </Link>
        <Link 
          to="/admin/gallery"
          className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${activeTab === 'gallery' ? 'bg-background text-foreground shadow-sm' : ''}`}
        >
          갤러리 관리
        </Link>
        <Link 
          to="/admin/notices"
          className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${activeTab === 'notice' ? 'bg-background text-foreground shadow-sm' : ''}`}
        >
          공지사항 관리
        </Link>
      </div>
    </div>
  );
};

export default AdminNavTabs;
