import { Link, useLocation } from 'react-router-dom';
import { Calendar, Users, GraduationCap, Image } from 'lucide-react';

const MobileFloatingMenu = () => {
  const location = useLocation();

  // 현재 경로가 해당 메뉴 항목의 경로와 일치하는지 확인
  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  const menuItems = [
    {
      name: '학사일정',
      path: '/schedule',
      icon: <Calendar size={20} />,
    },
    {
      name: '강사진',
      path: '/schedule/lecturers',
      icon: <Users size={20} />,
    },
    {
      name: '입학안내',
      path: '/admission',
      icon: <GraduationCap size={20} />,
    },
    {
      name: '갤러리',
      path: '/gallery',
      icon: <Image size={20} />,
    },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-50">
      <div className="flex justify-around items-center h-16">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`flex flex-col items-center justify-center w-full h-full ${
              isActive(item.path)
                ? 'text-mainBlue'
                : 'text-gray-500 hover:text-mainBlue'
            }`}
          >
            <div className="mb-1">{item.icon}</div>
            <span className="text-xs font-medium">{item.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MobileFloatingMenu; 