import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { PlusCircle, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { apiService } from '@/lib/apiService';

interface RulesArticle {
  _id?: string;
  title: string;
  items: string[];
  order: number;
}

interface RulesData {
  _id?: string;
  introText: string;
  articles: RulesArticle[];
  externalLinkText: string;
  externalLinkUrl: string;
  isActive?: boolean;
}

const EMPTY_RULES: RulesData = {
  introText: '',
  articles: [],
  externalLinkText: '',
  externalLinkUrl: '',
  isActive: true
};

const RulesManage = () => {
  const { toast } = useToast();
  const [rules, setRules] = useState<RulesData>(EMPTY_RULES);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    setIsLoading(true);
    try {
      const data = (await apiService.getRules()) as RulesData;
      const articles = (data.articles ?? []).map((article, idx) => ({
        ...article,
        items: article.items ?? [],
        order: article.order ?? idx
      }));
      setRules({
        ...EMPTY_RULES,
        ...data,
        articles
      });
    } catch (err: any) {
      console.error('운영 준칙 데이터 로드 실패:', err);
      const status = err?.response?.status;
      if (status === 404) {
        // 데이터가 아직 없는 경우 - 새로 생성할 수 있도록 빈 상태 유지
        setRules(EMPTY_RULES);
        toast({
          title: '운영 준칙 없음',
          description: '아직 등록된 운영 준칙이 없습니다. 새로 작성 후 저장해주세요.'
        });
      } else {
        toast({
          title: '데이터 로드 실패',
          description: '운영 준칙 정보를 불러오는 중 오류가 발생했습니다.',
          variant: 'destructive'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBasicChange = (field: keyof RulesData, value: string) => {
    setRules((prev) => ({ ...prev, [field]: value }));
  };

  const handleArticleTitleChange = (idx: number, value: string) => {
    setRules((prev) => {
      const articles = [...prev.articles];
      articles[idx] = { ...articles[idx], title: value };
      return { ...prev, articles };
    });
  };

  const handleArticleItemChange = (articleIdx: number, itemIdx: number, value: string) => {
    setRules((prev) => {
      const articles = [...prev.articles];
      const items = [...articles[articleIdx].items];
      items[itemIdx] = value;
      articles[articleIdx] = { ...articles[articleIdx], items };
      return { ...prev, articles };
    });
  };

  const addArticle = () => {
    setRules((prev) => ({
      ...prev,
      articles: [
        ...prev.articles,
        { title: '', items: [''], order: prev.articles.length }
      ]
    }));
  };

  const removeArticle = (idx: number) => {
    setRules((prev) => {
      const articles = prev.articles
        .filter((_, i) => i !== idx)
        .map((article, i) => ({ ...article, order: i }));
      return { ...prev, articles };
    });
  };

  const moveArticle = (idx: number, direction: -1 | 1) => {
    setRules((prev) => {
      const newIdx = idx + direction;
      if (newIdx < 0 || newIdx >= prev.articles.length) return prev;
      const articles = [...prev.articles];
      [articles[idx], articles[newIdx]] = [articles[newIdx], articles[idx]];
      return {
        ...prev,
        articles: articles.map((article, i) => ({ ...article, order: i }))
      };
    });
  };

  const addItemToArticle = (articleIdx: number) => {
    setRules((prev) => {
      const articles = [...prev.articles];
      articles[articleIdx] = {
        ...articles[articleIdx],
        items: [...articles[articleIdx].items, '']
      };
      return { ...prev, articles };
    });
  };

  const removeItemFromArticle = (articleIdx: number, itemIdx: number) => {
    setRules((prev) => {
      const articles = [...prev.articles];
      const items = articles[articleIdx].items.filter((_, i) => i !== itemIdx);
      articles[articleIdx] = { ...articles[articleIdx], items };
      return { ...prev, articles };
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('adminToken') || '';
      const payload = {
        ...rules,
        articles: rules.articles.map((article, idx) => ({
          ...article,
          order: idx,
          items: article.items.filter((item) => item.trim() !== '')
        }))
      };

      const response = rules._id
        ? await apiService.updateRules(payload, token)
        : await apiService.createRules(payload, token);

      const normalized = {
        ...EMPTY_RULES,
        ...response,
        articles: (response.articles ?? []).map((article: RulesArticle, idx: number) => ({
          ...article,
          items: article.items ?? [],
          order: article.order ?? idx
        }))
      };
      setRules(normalized);

      toast({
        title: '저장 완료',
        description: '운영 준칙이 성공적으로 저장되었습니다.'
      });
    } catch (err) {
      console.error('운영 준칙 저장 실패:', err);
      toast({
        title: '저장 실패',
        description: '운영 준칙 저장 중 오류가 발생했습니다.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!rules._id) return;
    if (!window.confirm('현재 운영 준칙을 삭제하시겠습니까? 삭제 후에는 복구할 수 없습니다.')) {
      return;
    }
    try {
      const token = localStorage.getItem('adminToken') || '';
      await apiService.deleteRules(rules._id, token);
      toast({
        title: '삭제 완료',
        description: '운영 준칙이 삭제되었습니다.'
      });
      setRules(EMPTY_RULES);
    } catch (err) {
      console.error('운영 준칙 삭제 실패:', err);
      toast({
        title: '삭제 실패',
        description: '운영 준칙 삭제 중 오류가 발생했습니다.',
        variant: 'destructive'
      });
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mainBlue"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">운영 준칙 관리</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-4">
            입학안내 - 운영 준칙 페이지에 표시되는 내용을 관리합니다.
          </p>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>도입 문구</CardTitle>
        </CardHeader>
        <CardContent>
          <Label htmlFor="introText" className="mb-2 block">
            상단에 표시되는 안내 문구
          </Label>
          <Textarea
            id="introText"
            value={rules.introText}
            onChange={(e) => handleBasicChange('introText', e.target.value)}
            className="min-h-24"
            placeholder="예: 서울대학교 정치지도자과정은 수강생 선발과 관리에 있어서..."
          />
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>조항 목록</CardTitle>
        </CardHeader>
        <CardContent>
          {rules.articles.length === 0 ? (
            <p className="text-sm text-gray-500 mb-4">등록된 조항이 없습니다.</p>
          ) : (
            rules.articles.map((article, articleIdx) => (
              <div key={articleIdx} className="mb-6 border rounded-md p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Input
                    value={article.title}
                    onChange={(e) => handleArticleTitleChange(articleIdx, e.target.value)}
                    placeholder="예: 제10조(상벌)"
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => moveArticle(articleIdx, -1)}
                    disabled={articleIdx === 0}
                    title="위로 이동"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => moveArticle(articleIdx, 1)}
                    disabled={articleIdx === rules.articles.length - 1}
                    title="아래로 이동"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeArticle(articleIdx)}
                    title="조항 삭제"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <Label className="mb-2 block text-sm">세부 항목</Label>
                {article.items.map((item, itemIdx) => (
                  <div key={itemIdx} className="flex items-start gap-2 mb-2">
                    <Textarea
                      value={item}
                      onChange={(e) =>
                        handleArticleItemChange(articleIdx, itemIdx, e.target.value)
                      }
                      className="flex-1 min-h-16"
                      placeholder="예: ① 과정 개설기관에서는 장학금을 줄 수 있다."
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItemFromArticle(articleIdx, itemIdx)}
                      title="항목 삭제"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => addItemToArticle(articleIdx)}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  세부 항목 추가
                </Button>

                {articleIdx < rules.articles.length - 1 && <Separator className="my-4" />}
              </div>
            ))
          )}
          <Button variant="outline" size="sm" className="mt-2" onClick={addArticle}>
            <PlusCircle className="h-4 w-4 mr-2" />
            조항 추가
          </Button>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>외부 링크</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="externalLinkText" className="mb-2 block">
              버튼 텍스트
            </Label>
            <Input
              id="externalLinkText"
              value={rules.externalLinkText}
              onChange={(e) => handleBasicChange('externalLinkText', e.target.value)}
              placeholder="예: 「서울대학교 공개강좌 및 직업교육훈련과정 등에 관한 규정」 전문 확인"
            />
          </div>
          <div>
            <Label htmlFor="externalLinkUrl" className="mb-2 block">
              링크 URL
            </Label>
            <Input
              id="externalLinkUrl"
              value={rules.externalLinkUrl}
              onChange={(e) => handleBasicChange('externalLinkUrl', e.target.value)}
              placeholder="예: https://snurnd.snu.ac.kr/?q=node/707"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button
          variant="destructive"
          onClick={handleDelete}
          disabled={!rules._id || isSaving}
        >
          삭제
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? '저장 중...' : rules._id ? '저장' : '신규 등록'}
        </Button>
      </div>
    </AdminLayout>
  );
};

export default RulesManage;
