import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';
import { apiService } from '@/lib/apiService';

interface RulesArticle {
  _id?: string;
  title: string;
  items: string[];
  order?: number;
}

interface RulesData {
  _id?: string;
  introText: string;
  articles: RulesArticle[];
  externalLinkText: string;
  externalLinkUrl: string;
}

const Rules = () => {
  const [rules, setRules] = useState<RulesData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRules = async () => {
      setIsLoading(true);
      try {
        const data = await apiService.getRules();
        setRules(data as RulesData);
        setError(null);
      } catch (err) {
        console.error('운영 준칙 로드 중 오류:', err);
        setError('운영 준칙 정보를 불러올 수 없습니다.');
        setRules(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRules();
  }, []);

  const sortedArticles = rules?.articles
    ? [...rules.articles].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    : [];

  return (
    <>
      <Header />
      <main className="pt-24 pb-16">
        <ScrollReveal>
          <section className="py-16 bg-mainBlue text-white">
            <div className="main-container">
              <h1 className="text-3xl md:text-4xl font-bold mb-4 reveal">운영 준칙</h1>
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
            {isLoading ? (
              <div className="flex justify-center my-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mainBlue"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
                {error}
              </div>
            ) : rules ? (
              <Card className="mb-8">
                <CardContent className="pt-6">
                  {rules.introText && (
                    <p className="text-lg mb-6 whitespace-pre-line">{rules.introText}</p>
                  )}

                  {sortedArticles.map((article, idx) => (
                    <div key={article._id ?? idx} className="mb-6">
                      <h2 className="text-xl font-semibold mb-4">{article.title}</h2>
                      <div className="space-y-3 pl-4">
                        {article.items.map((item, itemIdx) => (
                          <p key={itemIdx} className="whitespace-pre-line">{item}</p>
                        ))}
                      </div>
                    </div>
                  ))}

                  {rules.externalLinkUrl && rules.externalLinkText && (
                    <div className="flex justify-center">
                      <Button variant="outline" className="flex items-center gap-2" asChild>
                        <a
                          href={rules.externalLinkUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {rules.externalLinkText}
                          <ExternalLink size={16} />
                        </a>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="text-center text-gray-500 py-12">
                등록된 운영 준칙 정보가 없습니다.
              </div>
            )}
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Rules;
