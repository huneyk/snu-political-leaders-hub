import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { PlusCircle, Trash2 } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface Target {
  text: string;
}

interface Subsection {
  title: string;
  content: string;
}

interface Section {
  title: string;
  content: string;
  subsections: Subsection[];
  targets?: Target[];
}

interface AdmissionInfo {
  title: string;
  term: string;
  year: string;
  startMonth: string;
  endMonth: string;
  capacity: string;
  sections: Section[];
}

const AdmissionManage = () => {
  const { toast } = useToast();
  const [admissionInfo, setAdmissionInfo] = useState<AdmissionInfo>({
    title: '제',
    term: '',
    year: '2025',
    startMonth: '3',
    endMonth: '8',
    capacity: '30',
    sections: [
      {
        title: '모집 인원',
        content: '',
        subsections: []
      },
      {
        title: '모집 대상',
        content: '다음 중 하나 이상에 해당하는 전·현직자',
        subsections: [],
        targets: [
          { text: '' },
          { text: '' },
          { text: '' }
        ]
      },
      {
        title: '지원 절차',
        content: '',
        subsections: [
          {
            title: '원서 교부 및 접수 기간',
            content: ''
          },
          {
            title: '원서 교부 및 접수 장소',
            content: '홈페이지(plpsnu.ne.kr)에서 다운로드, 우편 또는 이메일 접수\n우편 접수 주소: (08826) 서울특별시 관악구 관악로 1 서울대학교 아시아연구소 517호 정치지도자과정\n이메일 접수 주소: plp@snu.ac.kr'
          },
          {
            title: '제출 서류',
            content: '1) 입학지원서\n2) 재직증명서 또는 경력증명서 1통 (이메일 접수 시, 사진 촬영 사본 제출 가능)\n3) 증명사진 1매\n4) 개인정보수집이용동의서'
          },
          {
            title: '서류 전형 및 면접 후 개별 통보',
            content: '서류 전형 결과 발표 (합격자에 한하여 개별 통보) : \n면접 : (서류 전형 합격자 대상)\n최종 선정 결과 발표 : (합격자에 한하여 개별 통보)'
          },
          {
            title: '등록일',
            content: ''
          }
        ]
      }
    ]
  });

  useEffect(() => {
    // 로컬 스토리지에서 데이터 로드
    const savedData = localStorage.getItem('admission-info');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setAdmissionInfo(parsedData);
      } catch (error) {
        console.error('Failed to parse admission info:', error);
      }
    }
  }, []);

  const handleTitleChange = (value: string) => {
    setAdmissionInfo(prev => ({ ...prev, title: value }));
  };

  const handleTermChange = (value: string) => {
    setAdmissionInfo(prev => ({ ...prev, term: value }));
  };

  const handleYearChange = (value: string) => {
    setAdmissionInfo(prev => ({ ...prev, year: value }));
  };

  const handleStartMonthChange = (value: string) => {
    setAdmissionInfo(prev => ({ ...prev, startMonth: value }));
  };

  const handleEndMonthChange = (value: string) => {
    setAdmissionInfo(prev => ({ ...prev, endMonth: value }));
  };

  const handleCapacityChange = (value: string) => {
    setAdmissionInfo(prev => ({ ...prev, capacity: value }));
  };

  const handleSectionContentChange = (sectionIndex: number, value: string) => {
    const newSections = [...admissionInfo.sections];
    newSections[sectionIndex].content = value;
    setAdmissionInfo(prev => ({ ...prev, sections: newSections }));
  };

  const handleSubsectionTitleChange = (sectionIndex: number, subsectionIndex: number, value: string) => {
    const newSections = [...admissionInfo.sections];
    newSections[sectionIndex].subsections[subsectionIndex].title = value;
    setAdmissionInfo(prev => ({ ...prev, sections: newSections }));
  };

  const handleSubsectionContentChange = (sectionIndex: number, subsectionIndex: number, value: string) => {
    const newSections = [...admissionInfo.sections];
    newSections[sectionIndex].subsections[subsectionIndex].content = value;
    setAdmissionInfo(prev => ({ ...prev, sections: newSections }));
  };

  const handleTargetChange = (sectionIndex: number, targetIndex: number, value: string) => {
    const newSections = [...admissionInfo.sections];
    if (newSections[sectionIndex].targets) {
      newSections[sectionIndex].targets![targetIndex].text = value;
      setAdmissionInfo(prev => ({ ...prev, sections: newSections }));
    }
  };

  const addTarget = (sectionIndex: number) => {
    const newSections = [...admissionInfo.sections];
    if (newSections[sectionIndex].targets) {
      newSections[sectionIndex].targets!.push({ text: '' });
      setAdmissionInfo(prev => ({ ...prev, sections: newSections }));
    }
  };

  const removeTarget = (sectionIndex: number, targetIndex: number) => {
    const newSections = [...admissionInfo.sections];
    if (newSections[sectionIndex].targets && newSections[sectionIndex].targets!.length > 1) {
      newSections[sectionIndex].targets = newSections[sectionIndex].targets!.filter((_, index) => index !== targetIndex);
      setAdmissionInfo(prev => ({ ...prev, sections: newSections }));
    }
  };

  const handleSave = () => {
    // 데이터 저장
    localStorage.setItem('admission-info', JSON.stringify(admissionInfo));
    
    toast({
      title: "저장 완료",
      description: "입학 지원 정보가 저장되었습니다.",
    });
  };

  return (
    <>
      <Header />
      <div className="container mx-auto py-20 px-4">
        <h1 className="text-3xl font-bold mb-6">입학 지원 관리</h1>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>기본 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Input 
                  value={admissionInfo.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-16"
                />
                <Input 
                  value={admissionInfo.term}
                  onChange={(e) => handleTermChange(e.target.value)}
                  className="w-16"
                  placeholder="기수"
                />
                <span>기</span>
              </div>
              <div className="flex items-center gap-2">
                <span>(</span>
                <Input 
                  value={admissionInfo.year}
                  onChange={(e) => handleYearChange(e.target.value)}
                  className="w-20"
                />
                <span>년</span>
                <Input 
                  value={admissionInfo.startMonth}
                  onChange={(e) => handleStartMonthChange(e.target.value)}
                  className="w-16"
                />
                <span>~</span>
                <Input 
                  value={admissionInfo.endMonth}
                  onChange={(e) => handleEndMonthChange(e.target.value)}
                  className="w-16"
                />
                <span>월)</span>
              </div>
              <span className="ml-2">지원 안내</span>
            </div>
          </CardContent>
        </Card>

        {admissionInfo.sections.map((section, sectionIndex) => (
          <Card key={sectionIndex} className="mb-8">
            <CardHeader>
              <CardTitle>{section.title}</CardTitle>
            </CardHeader>
            <CardContent>
              {section.title === '모집 인원' && (
                <div className="mb-4">
                  <div className="flex items-center gap-2">
                    <Input 
                      value={admissionInfo.capacity}
                      onChange={(e) => handleCapacityChange(e.target.value)}
                      className="w-20"
                    />
                    <span>명 내외</span>
                  </div>
                </div>
              )}

              {section.title !== '모집 인원' && (
                <div className="mb-4">
                  <Label className="mb-2 block">내용</Label>
                  <Textarea 
                    value={section.content}
                    onChange={(e) => handleSectionContentChange(sectionIndex, e.target.value)}
                    className="min-h-20"
                  />
                </div>
              )}

              {section.targets && (
                <div className="mb-4">
                  <Label className="mb-2 block">모집 대상</Label>
                  {section.targets.map((target, targetIndex) => (
                    <div key={targetIndex} className="flex items-center gap-2 mb-2">
                      <span>{targetIndex + 1}.</span>
                      <Input 
                        value={target.text}
                        onChange={(e) => handleTargetChange(sectionIndex, targetIndex, e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeTarget(sectionIndex, targetIndex)}
                        disabled={section.targets!.length <= 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => addTarget(sectionIndex)}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    항목 추가
                  </Button>
                </div>
              )}

              {section.subsections.length > 0 && (
                <div className="space-y-6 mt-6">
                  {section.subsections.map((subsection, subsectionIndex) => (
                    <div key={subsectionIndex}>
                      <div className="mb-4">
                        <Label className="mb-2 block">소제목</Label>
                        <Input 
                          value={subsection.title}
                          onChange={(e) => handleSubsectionTitleChange(sectionIndex, subsectionIndex, e.target.value)}
                        />
                      </div>
                      <div className="mb-4">
                        <Label className="mb-2 block">내용</Label>
                        <Textarea 
                          value={subsection.content}
                          onChange={(e) => handleSubsectionContentChange(sectionIndex, subsectionIndex, e.target.value)}
                          className="min-h-20"
                        />
                      </div>
                      {subsectionIndex < section.subsections.length - 1 && <Separator className="my-4" />}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        <div className="flex justify-end">
          <Button onClick={handleSave}>저장</Button>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AdmissionManage; 