
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';

interface Lecturer {
  id: number;
  name: string;
  title: string;
  image: string;
  bio: string;
  type: 'special' | 'faculty';
}

const ScheduleLecturers = () => {
  const [activeTab, setActiveTab] = useState<'special' | 'faculty'>('faculty');
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const lecturers: Lecturer[] = [
    {
      id: 1,
      name: "김상배",
      title: "서울대학교 정치외교학부 교수",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80",
      bio: "국제정치학, 정보혁명과 네트워크 세계정치, 신흥안보 전문가",
      type: 'faculty'
    },
    {
      id: 2,
      name: "임혜란",
      title: "서울대학교 정치외교학부 교수",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80",
      bio: "비교정치경제, 동아시아 발전국가 연구 전문가",
      type: 'faculty'
    },
    {
      id: 3,
      name: "김의영",
      title: "서울대학교 정치외교학부 교수",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80",
      bio: "비교정치, 시민사회, 거버넌스 전문가",
      type: 'faculty'
    },
    {
      id: 4,
      name: "홍길동",
      title: "전 국무총리",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80",
      bio: "행정 및 정책 전문가",
      type: 'special'
    },
    {
      id: 5,
      name: "이몽룡",
      title: "전 국회의장",
      image: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80",
      bio: "의회정치 및 입법과정 전문가",
      type: 'special'
    },
    {
      id: 6,
      name: "성춘향",
      title: "전 외교부 장관",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80",
      bio: "국제관계 및 외교정책 전문가",
      type: 'special'
    },
  ];

  const filteredLecturers = lecturers.filter(lecturer => lecturer.type === activeTab);

  return (
    <>
      <Header />
      <main className="pt-24 pb-16">
        <ScrollReveal>
          <section className="py-16 bg-mainBlue text-white">
            <div className="main-container">
              <h1 className="text-3xl md:text-4xl font-bold mb-4 reveal">강사진</h1>
              <p className="text-white/80 max-w-3xl reveal reveal-delay-100">
                서울대학교 정치지도자과정의 우수한 강사진을 소개합니다.
              </p>
            </div>
          </section>

          <section className="py-16">
            <div className="main-container">
              <div className="max-w-5xl mx-auto">
                <div className="flex justify-center mb-12 reveal reveal-delay-200">
                  <div className="inline-flex p-1 bg-gray-100 rounded-lg">
                    <button
                      className={`px-6 py-3 rounded-md font-medium transition-all ${
                        activeTab === 'faculty'
                          ? 'bg-mainBlue text-white shadow-md'
                          : 'text-gray-500 hover:text-mainBlue'
                      }`}
                      onClick={() => setActiveTab('faculty')}
                    >
                      서울대학교 정치외교학부 교수진
                    </button>
                    <button
                      className={`px-6 py-3 rounded-md font-medium transition-all ${
                        activeTab === 'special'
                          ? 'bg-mainBlue text-white shadow-md'
                          : 'text-gray-500 hover:text-mainBlue'
                      }`}
                      onClick={() => setActiveTab('special')}
                    >
                      특별 강사진
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredLecturers.map((lecturer, index) => (
                    <div
                      key={lecturer.id}
                      className={`bg-white rounded-lg shadow-card overflow-hidden transform transition-all duration-500 hover:-translate-y-2 hover:shadow-elegant reveal ${
                        index % 3 === 0 ? '' : index % 3 === 1 ? 'reveal-delay-100' : 'reveal-delay-200'
                      }`}
                    >
                      <div className="h-64 overflow-hidden">
                        <img
                          src={lecturer.image}
                          alt={lecturer.name}
                          className="w-full h-full object-cover object-center transition-transform duration-700 hover:scale-110"
                        />
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-mainBlue mb-1">{lecturer.name}</h3>
                        <p className="text-gray-600 mb-4">{lecturer.title}</p>
                        <p className="text-gray-700 text-sm">{lecturer.bio}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </ScrollReveal>
      </main>
      <Footer />
    </>
  );
};

export default ScheduleLecturers;
