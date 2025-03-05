import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface FooterConfig {
  wordFile: string;
  hwpFile: string;
  pdfFile: string;
  email: string;
}

const FooterManage: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [footerConfig, setFooterConfig] = useState<FooterConfig>({
    wordFile: '',
    hwpFile: '',
    pdfFile: '',
    email: ''
  });

  // File references for display
  const [wordFileName, setWordFileName] = useState<string>('');
  const [hwpFileName, setHwpFileName] = useState<string>('');
  const [pdfFileName, setPdfFileName] = useState<string>('');

  useEffect(() => {
    // Load existing configuration from localStorage
    const savedConfig = localStorage.getItem('footer-config');
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        setFooterConfig(parsedConfig);
        
        // Set file names for display
        if (parsedConfig.wordFile) {
          const wordName = parsedConfig.wordFile.split('/').pop() || '입학지원서.docx';
          setWordFileName(wordName);
        }
        
        if (parsedConfig.hwpFile) {
          const hwpName = parsedConfig.hwpFile.split('/').pop() || '입학지원서.hwp';
          setHwpFileName(hwpName);
        }
        
        if (parsedConfig.pdfFile) {
          const pdfName = parsedConfig.pdfFile.split('/').pop() || '과정안내서.pdf';
          setPdfFileName(pdfName);
        }
      } catch (error) {
        console.error('Failed to parse footer config:', error);
      }
    }
  }, []);

  const handleFileUpload = (fileType: 'wordFile' | 'hwpFile' | 'pdfFile', event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    
    const file = event.target.files[0];
    const reader = new FileReader();
    
    reader.onloadend = () => {
      // Store file as data URL
      const fileDataUrl = reader.result as string;
      setFooterConfig(prev => ({ ...prev, [fileType]: fileDataUrl }));
      
      // Update file name for display
      switch (fileType) {
        case 'wordFile':
          setWordFileName(file.name);
          break;
        case 'hwpFile':
          setHwpFileName(file.name);
          break;
        case 'pdfFile':
          setPdfFileName(file.name);
          break;
      }
      
      toast({
        title: "파일 업로드 완료",
        description: `${file.name} 파일이 업로드되었습니다.`,
      });
    };
    
    reader.readAsDataURL(file);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFooterConfig(prev => ({ ...prev, email: e.target.value }));
  };

  const handleSave = () => {
    setIsLoading(true);
    
    try {
      // Save to localStorage
      localStorage.setItem('footer-config', JSON.stringify(footerConfig));
      
      toast({
        title: "저장 완료",
        description: "Footer 설정이 저장되었습니다.",
      });
    } catch (error) {
      console.error('Failed to save footer config:', error);
      toast({
        title: "저장 실패",
        description: "Footer 설정 저장 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Footer 관리</h1>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Footer 다운로드 버튼 및 이메일 관리</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="word-file">입학지원서 (Word) 파일</Label>
                <div className="flex items-center gap-4 mt-2">
                  <Input
                    id="word-file"
                    type="file"
                    accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={(e) => handleFileUpload('wordFile', e)}
                    className="flex-1"
                  />
                  {wordFileName && (
                    <div className="text-sm text-gray-500">
                      현재 파일: {wordFileName}
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <Label htmlFor="hwp-file">입학지원서 (HWP) 파일</Label>
                <div className="flex items-center gap-4 mt-2">
                  <Input
                    id="hwp-file"
                    type="file"
                    accept=".hwp,.hwpx"
                    onChange={(e) => handleFileUpload('hwpFile', e)}
                    className="flex-1"
                  />
                  {hwpFileName && (
                    <div className="text-sm text-gray-500">
                      현재 파일: {hwpFileName}
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <Label htmlFor="pdf-file">과정안내서 (PDF) 파일</Label>
                <div className="flex items-center gap-4 mt-2">
                  <Input
                    id="pdf-file"
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={(e) => handleFileUpload('pdfFile', e)}
                    className="flex-1"
                  />
                  {pdfFileName && (
                    <div className="text-sm text-gray-500">
                      현재 파일: {pdfFileName}
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <Label htmlFor="email">지원서 이메일 접수 주소</Label>
                <Input
                  id="email"
                  type="email"
                  value={footerConfig.email}
                  onChange={handleEmailChange}
                  placeholder="example@snu.ac.kr"
                  className="mt-2"
                />
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-medium mb-2">Footer 미리보기</h3>
              <div className="flex flex-wrap gap-2">
                <Button variant="default" size="sm" className="bg-subYellow hover:bg-subYellow/90 text-mainBlue" disabled={!footerConfig.wordFile}>
                  입학지원서 (Word) 다운로드
                </Button>
                <Button variant="default" size="sm" className="bg-subYellow hover:bg-subYellow/90 text-mainBlue" disabled={!footerConfig.hwpFile}>
                  입학지원서 (HWP) 다운로드
                </Button>
                <Button variant="default" size="sm" className="bg-subYellow hover:bg-subYellow/90 text-mainBlue" disabled={!footerConfig.pdfFile}>
                  과정안내서 (PDF) 다운로드
                </Button>
                <Button variant="default" size="sm" className="bg-subYellow hover:bg-subYellow/90 text-mainBlue" disabled={!footerConfig.email}>
                  지원서 이메일 접수
                </Button>
              </div>
              {footerConfig.email && (
                <p className="text-sm text-gray-500 mt-2">
                  이메일 접수 주소: {footerConfig.email}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button 
              onClick={handleSave} 
              disabled={isLoading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-2"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  <span>저장 중...</span>
                </div>
              ) : (
                <span>저장하기</span>
              )}
            </Button>
          </CardFooter>
        </Card>
      </main>
      <Footer />
    </>
  );
};

export default FooterManage; 