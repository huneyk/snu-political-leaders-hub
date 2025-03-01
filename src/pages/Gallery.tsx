
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';

interface GalleryItem {
  id: number;
  title: string;
  date: string;
  image: string;
}

const Gallery = () => {
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const galleryItems: GalleryItem[] = [
    {
      id: 1,
      title: "14기 입학식",
      date: "2024-03-15",
      image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb"
    },
    {
      id: 2,
      title: "국회 방문",
      date: "2024-04-20",
      image: "https://images.unsplash.com/photo-1426604966848-d7adac402bff"
    },
    {
      id: 3,
      title: "특별 강연",
      date: "2024-05-10",
      image: "https://images.unsplash.com/photo-1439337153520-7082a56a81f4"
    },
    {
      id: 4,
      title: "토론 세미나",
      date: "2024-06-05",
      image: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81"
    },
    {
      id: 5,
      title: "현장 견학",
      date: "2024-07-15",
      image: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7"
    },
    {
      id: 6,
      title: "수료식",
      date: "2024-08-25",
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158"
    },
  ];

  const openLightbox = (item: GalleryItem) => {
    setSelectedImage(item);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setSelectedImage(null);
    document.body.style.overflow = 'auto';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  return (
    <>
      <Header />
      <main className="pt-24 pb-16">
        <ScrollReveal>
          <section className="py-16 bg-mainBlue text-white">
            <div className="main-container">
              <h1 className="text-3xl md:text-4xl font-bold mb-4 reveal">갤러리</h1>
              <p className="text-white/80 max-w-3xl reveal reveal-delay-100">
                서울대학교 정치지도자과정의 다양한 활동 사진을 확인하세요.
              </p>
            </div>
          </section>

          <section className="py-16">
            <div className="main-container">
              <div className="max-w-6xl mx-auto">
                <h2 className="text-2xl font-bold text-mainBlue mb-8 reveal reveal-delay-200">제 14기</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {galleryItems.map((item, index) => (
                    <div 
                      key={item.id}
                      className={`group relative rounded-lg overflow-hidden shadow-card cursor-pointer transform transition-all duration-500 hover:-translate-y-2 hover:shadow-elegant reveal ${
                        index % 3 === 0 ? '' : index % 3 === 1 ? 'reveal-delay-100' : 'reveal-delay-200'
                      }`}
                      onClick={() => openLightbox(item)}
                    >
                      <div className="aspect-w-16 aspect-h-9 h-60">
                        <img 
                          src={item.image} 
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          loading="lazy"
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-70 group-hover:opacity-90 transition-opacity"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                        <h3 className="font-bold text-lg mb-1 group-hover:text-subYellow transition-colors">{item.title}</h3>
                        <p className="text-sm text-white/80">{formatDate(item.date)}</p>
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

      {/* Lightbox */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <button
            className="absolute top-4 right-4 text-white bg-transparent p-2 rounded-full hover:bg-white/10 transition-colors"
            onClick={closeLightbox}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
          
          <div className="max-w-5xl max-h-[80vh] relative" onClick={(e) => e.stopPropagation()}>
            <img 
              src={selectedImage.image} 
              alt={selectedImage.title}
              className="max-w-full max-h-[80vh] object-contain"
            />
            <div className="bg-black/70 absolute bottom-0 left-0 right-0 p-4">
              <h3 className="font-bold text-lg text-white mb-1">{selectedImage.title}</h3>
              <p className="text-sm text-white/80">{formatDate(selectedImage.date)}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Gallery;
