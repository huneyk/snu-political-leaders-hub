import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';

const Rules = () => {
  return (
    <>
      <Header />
      <main className="pt-24 pb-16">
        <ScrollReveal>
          <section className="py-16 bg-mainBlue text-white">
            <div className="main-container">
              <h1 className="text-3xl md:text-4xl font-bold mb-4 reveal">운영 준칙</h1>
              <p className="text-white/80 max-w-3xl reveal reveal-delay-100">
                서울대학교 정치지도자과정의 운영 준칙입니다.
              </p>
            </div>
          </section>
        </ScrollReveal>

        <div className="container mx-auto py-12 px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
          >
            <Card className="mb-8">
              <CardContent className="pt-6">
                <p className="text-lg mb-6">
                  서울대학교 정치지도자과정은 수강생 선발과 관리에 있어서「 서울대학교 공개강좌 및 직업교육훈련과정 등에 관한 규정 」을 준수합니다.
                </p>
                
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-4">제10조(상벌)</h2>
                  <div className="space-y-3 pl-4">
                    <p>① 과정 개설기관에서는 장학금을 줄 수 있다.</p>
                    <p>② 이수자 중 성적이 우수하고 타의 모범이 된 사람에게는 별지 제6호서식(공동개설의 경우 별지 제7호서식)의 상장을 수여할 수 있다. 다만, 제9조 단서에 해당하는 이수자에게는 별지 제8호서식(공동개설의 경우 별지 제9호서식)의 상장을 수여할 수 있다.</p>
                    <p>③ 수강생이 과정의 질서를 문란하게 하거나 수강생으로서의 본분과 품위에 어긋난 행위를 함으로써 과정의 목적을 달성하기가 현저히 곤란한 경우에는 개설기관장은 해당 수강생에게 의견 제출의 기회를 부여한 후 수강자격을 박탈하거나 이를 일정기간 제한할 수 있다.</p>
                  </div>
                </div>
                
                <div className="flex justify-center">
                  <Button variant="outline" className="flex items-center gap-2" asChild>
                    <a 
                      href="https://snurnd.snu.ac.kr/?q=node/707" 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      「서울대학교 공개강좌 및 직업교육훈련과정 등에 관한 규정」 전문 확인
                      <ExternalLink size={16} />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Rules; 