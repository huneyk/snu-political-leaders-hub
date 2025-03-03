import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '/logo.jpg'; // Using the logo.jpg file from the public directory

interface SubMenuItem {
  name: string;
  path: string;
}

interface MenuItem {
  name: string;
  path: string;
  submenu?: SubMenuItem[];
}

const menuItems: MenuItem[] = [
  {
    name: '과정 소개',
    path: '/intro',
    submenu: [
      { name: '인사말', path: '/intro/greeting' },
      { name: '추천의 글', path: '/intro/recommendations' },
      { name: '과정의 목표', path: '/intro/objectives' },
      { name: '과정의 특전', path: '/intro/benefits' },
      { name: '운영 교수진', path: '/intro/professors' },
    ],
  },
  {
    name: '입학 안내',
    path: '/admission',
    submenu: [
      { name: '입학 지원 안내', path: '/admission/info' },
      { name: '운영 준칙', path: '/admission/rules' },
    ],
  },
  {
    name: '학사 일정',
    path: '/schedule',
    submenu: [
      { name: '학사 일정', path: '/schedule/calendar' },
      { name: '특별 활동', path: '/schedule/activities' },
      { name: '강 사 진', path: '/schedule/lecturers' },
    ],
  },
  { name: '갤러리', path: '/gallery' },
  { name: '공지 사항', path: '/notices' },
];

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const location = useLocation();
  
  // Check if we're on the home page
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleSubmenu = (name: string) => {
    setActiveSubmenu(activeSubmenu === name ? null : name);
  };

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-md py-2'
          : 'bg-transparent py-4'
      }`}
    >
      <div className="main-container flex justify-between items-center">
        <Link to="/" className="flex items-center gap-3 animate-fade-in">
          <img
            src={logo}
            alt="서울대학교 정치지도자 과정 로고"
            className="h-12 w-auto object-contain"
          />
          <div className="flex flex-col">
            <span className={`text-sm font-medium ${isScrolled ? 'text-mainBlue' : 'text-white'}`}>서울대학교 정치지도자 과정</span>
            <span className={`text-xs font-light ${isScrolled ? 'text-subGray' : 'text-white/80'}`}>SNU Political Leaders Program</span>
          </div>
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden lg:flex space-x-8 items-center animate-fade-in">
          {menuItems.map((item) => (
            <div
              key={item.name}
              className="relative dropdown-container"
            >
              {item.submenu ? (
                <button
                  className={`menu-item py-2 flex items-center ${
                    isScrolled || !isHomePage
                      ? 'text-gray-800 hover:text-mainBlue after:bg-mainBlue' 
                      : 'text-white hover:text-white/80 after:bg-white'
                  } ${isActive(item.path) ? 'active' : ''}`}
                >
                  {item.name}
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="ml-1 w-3 h-3"
                  >
                    <path d="m6 9 6 6 6-6"/>
                  </svg>
                </button>
              ) : (
                <Link
                  to={item.path}
                  className={`menu-item py-2 ${
                    isScrolled || !isHomePage
                      ? 'text-gray-800 hover:text-mainBlue after:bg-mainBlue' 
                      : 'text-white hover:text-white/80 after:bg-white'
                  } ${isActive(item.path) ? 'active' : ''}`}
                >
                  {item.name}
                </Link>
              )}
              
              {item.submenu && (
                <div className="dropdown-menu" onMouseEnter={(e) => e.stopPropagation()}>
                  <div className="py-1">
                    {item.submenu.map((subitem) => (
                      <Link
                        key={subitem.name}
                        to={subitem.path}
                        className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-50 hover:text-mainBlue transition-colors"
                      >
                        {subitem.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className={`lg:hidden z-50 p-2 ${isScrolled || !isHomePage ? 'text-mainBlue' : 'text-white'}`}
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          <div className="w-6 flex flex-col justify-center items-center">
            <span
              className={`bg-current block transition-all duration-300 ease-out h-0.5 w-full rounded-sm ${
                mobileMenuOpen
                  ? 'rotate-45 translate-y-1'
                  : '-translate-y-0.5'
              }`}
            ></span>
            <span
              className={`bg-current block transition-all duration-300 ease-out h-0.5 w-full rounded-sm my-0.5 ${
                mobileMenuOpen ? 'opacity-0' : 'opacity-100'
              }`}
            ></span>
            <span
              className={`bg-current block transition-all duration-300 ease-out h-0.5 w-full rounded-sm ${
                mobileMenuOpen
                  ? '-rotate-45 -translate-y-1'
                  : 'translate-y-0.5'
              }`}
            ></span>
          </div>
        </button>

        {/* Mobile Menu */}
        <div
          className={`fixed inset-0 bg-white z-40 transition-all duration-500 ease-in-out transform ${
            mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex flex-col h-full pt-20 px-6 overflow-y-auto">
            {menuItems.map((item) => (
              <div key={item.name} className="py-2 border-b border-gray-100">
                <div
                  className="flex justify-between items-center py-2"
                  onClick={() => item.submenu && toggleSubmenu(item.name)}
                >
                  {item.submenu ? (
                    <button
                      className={`text-lg font-medium ${
                        isActive(item.path) ? 'text-mainBlue' : 'text-gray-800'
                      }`}
                    >
                      {item.name}
                    </button>
                  ) : (
                    <Link
                      to={item.path}
                      className={`text-lg font-medium ${
                        isActive(item.path) ? 'text-mainBlue' : 'text-gray-800'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  )}
                  {item.submenu && (
                    <button
                      className="ml-2 p-1 rounded-full bg-gray-100"
                      aria-label="Toggle submenu"
                    >
                      <svg
                        className={`w-4 h-4 transition-transform ${
                          activeSubmenu === item.name ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                  )}
                </div>

                {item.submenu && (
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      activeSubmenu === item.name
                        ? 'max-h-96 opacity-100'
                        : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="pl-4 py-2 flex flex-col space-y-2">
                      {item.submenu.map((subitem) => (
                        <Link
                          key={subitem.name}
                          to={subitem.path}
                          className="py-1 text-gray-600 hover:text-mainBlue transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {subitem.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
