
import { Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminLink = () => {
  return (
    <Link 
      to="/admin/login" 
      className="text-sm text-gray-600 hover:text-mainBlue transition-colors flex items-center gap-1 absolute top-4 right-4 md:right-8"
    >
      <Settings size={16} />
      <span>관리자</span>
    </Link>
  );
};

export default AdminLink;
