
import { useEffect } from 'react';
import ScrollReveal from '@/components/ScrollReveal';
import Hero from '@/components/Hero';
import HomeAdmission from '@/components/HomeAdmission';
import HomeProfessors from '@/components/HomeProfessors';
import HomeSchedule from '@/components/HomeSchedule';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AdminLink from '@/components/AdminLink';

const Index = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Header />
      <AdminLink />
      <main>
        <Hero />
        <ScrollReveal>
          <HomeAdmission />
          <HomeProfessors />
          <HomeSchedule />
        </ScrollReveal>
      </main>
      <Footer />
    </>
  );
};

export default Index;
