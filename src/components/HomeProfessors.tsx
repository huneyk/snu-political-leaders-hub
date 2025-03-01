
import { Link } from 'react-router-dom';

const HomeProfessors = () => {
  const professors = [
    {
      id: 1,
      name: "김상배",
      position: "서울대학교 정치외교학부 교수",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80"
    },
    {
      id: 2,
      name: "임혜란",
      position: "서울대학교 정치외교학부 교수",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80"
    },
    {
      id: 3,
      name: "김의영",
      position: "서울대학교 정치외교학부 교수",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80"
    },
  ];

  return (
    <section className="py-20 bg-white" id="professors">
      <div className="main-container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-mainBlue mb-4 reveal">교수진 소개</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto reveal reveal-delay-100">
            정치지도자과정 강사진 소개
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {professors.map((professor, index) => (
            <div 
              key={professor.id} 
              className={`bg-white rounded-lg shadow-card overflow-hidden transform transition-all duration-500 hover:-translate-y-2 hover:shadow-elegant reveal ${
                index === 0 ? '' : index === 1 ? 'reveal-delay-100' : 'reveal-delay-200'
              }`}
            >
              <div className="h-64 overflow-hidden">
                <img 
                  src={professor.image} 
                  alt={professor.name} 
                  className="w-full h-full object-cover object-center transition-transform duration-700 hover:scale-110"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-mainBlue mb-1">{professor.name}</h3>
                <p className="text-gray-600 mb-4">{professor.position}</p>
                <div className="border-t border-gray-100 pt-4 mt-auto">
                  <Link 
                    to="/schedule/lecturers" 
                    className="text-mainBlue hover:text-opacity-80 font-medium transition-colors flex items-center"
                  >
                    <span>프로필 보기</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center reveal reveal-delay-300">
          <Link 
            to="/schedule/lecturers" 
            className="btn-primary"
          >
            전체 강사진 보기
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HomeProfessors;
