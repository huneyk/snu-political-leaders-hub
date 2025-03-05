import { Link, useLocation } from 'react-router-dom';
import { Calendar, Users, GraduationCap, Image, Home } from 'lucide-react';
import { useEffect, useState } from 'react';

const MobileFloatingMenu = () => {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // 화면 크기 변경 감지
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg 브레이크포인트(1024px) 미만일 때 모바일로 간주
    };

    // 초기 체크
    checkIfMobile();

    // 리사이즈 이벤트 리스너 추가
    window.addEventListener('resize', checkIfMobile);

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  // 스크롤 감지
  useEffect(() => {
    const checkScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 100); // 100px 이상 스크롤 시 메뉴 표시
    };

    // 초기 체크
    checkScroll();

    // 스크롤 이벤트 리스너 추가
    window.addEventListener('scroll', checkScroll);

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      window.removeEventListener('scroll', checkScroll);
    };
  }, []);

  // 현재 경로가 해당 메뉴 항목의 경로와 일치하는지 확인
  const isActive = (path: string) => {
    return location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
  };

  const menuItems = [
    {
      name: '홈',
      path: '/',
      icon: <Home size={20} />,
    },
    {
      name: '학사일정',
      path: '/schedule/calendar',
      icon: <Calendar size={20} />,
    },
    {
      name: '강사진',
      path: '/schedule/lecturers',
      icon: <Users size={20} />,
    },
    {
      name: '입학안내',
      path: '/admission/info',
      icon: <GraduationCap size={20} />,
    },
    {
      name: '갤러리',
      path: '/gallery',
      icon: <Image size={20} />,
    },
  ];

  // 모바일이 아니고 스크롤되지 않았으면 렌더링하지 않음
  if (!isMobile && !isScrolled) return null;

  // 모바일 모드일 때는 하단에 가로로, 데스크탑 모드일 때는 오른쪽에 세로로 표시
  const mobileStyle = {
    backgroundColor: 'rgba(15, 15, 112, 0.3)'
  };

  const desktopStyle = {
    backgroundColor: 'rgba(15, 15, 112, 0.3)',
    width: '60px',
    borderRadius: '8px 0 0 8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
  };

  if (isMobile) {
    // 모바일 모드 - 하단에 가로로 표시
    return (
      <div 
        className="fixed bottom-0 left-0 right-0 shadow-lg border-t border-gray-200 z-[9999]"
        style={mobileStyle}
      >
        <div className="flex justify-around items-center h-16">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex flex-col items-center justify-center w-full h-full ${
                isActive(item.path)
                  ? 'text-white font-bold'
                  : 'text-white text-opacity-80 hover:text-white hover:font-semibold'
              }`}
            >
              <div className="mb-1">{item.icon}</div>
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          ))}
        </div>
      </div>
    );
  } else {
    // 데스크탑 모드 - 오른쪽에 세로로 표시 (스크롤 시에만)
    return isScrolled ? (
      <div 
        className="fixed top-1/2 right-0 transform -translate-y-1/2 shadow-lg border-l border-gray-200 z-[9999] transition-all duration-300"
        style={desktopStyle}
      >
        <div className="flex flex-col justify-around items-center py-4 h-auto">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex flex-col items-center justify-center w-full py-3 ${
                isActive(item.path)
                  ? 'text-white font-bold'
                  : 'text-white text-opacity-80 hover:text-white hover:font-semibold'
              }`}
            >
              <div className="mb-1">{item.icon}</div>
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          ))}
        </div>
      </div>
    ) : null;
  }
};

export default MobileFloatingMenu; 