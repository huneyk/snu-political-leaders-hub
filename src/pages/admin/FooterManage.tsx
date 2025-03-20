import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminLayout from '@/components/admin/AdminLayout';
import axios from 'axios';

// API 기본 URL 설정
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:5001/api';

interface FooterConfig {
  wordFile: string;
  hwpFile: string;
  pdfFile: string;
  email: string;
}

const FooterManage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
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

  // Admin 인증 체크
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('adminToken');
      const adminAuth = localStorage.getItem('adminAuth');
      
      console.log('인증 체크:', { token, adminAuth });
      
      // token이 있거나 adminAuth가 'true'인 경우 접근 허용
      if (!token && adminAuth !== 'true') {
        console.log('인증 실패: 로그인 페이지로 이동');
        navigate('/admin/login');
      } else {
        console.log('인증 성공: Footer 관리 페이지 접근 허용');
        loadFooterConfig();
      }
    };
    
    checkAuth();
  }, []); // 빈 의존성 배열

  // MongoDB에서 footer 설정 로드
  const loadFooterConfig = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_BASE_URL}/footer`);
      
      if (response.data) {
        const data = response.data;
        setFooterConfig({
          wordFile: data.wordFile || '',
          hwpFile: data.hwpFile || '',
          pdfFile: data.pdfFile || '',
          email: data.email || ''
        });
        
        // Set file names for display
        if (data.wordFile) {
          const wordName = data.wordFile.split('/').pop() || '입학지원서.docx';
          setWordFileName(wordName);
        }
        
        if (data.hwpFile) {
          const hwpName = data.hwpFile.split('/').pop() || '입학지원서.hwp';
          setHwpFileName(hwpName);
        }
        
        if (data.pdfFile) {
          const pdfName = data.pdfFile.split('/').pop() || '과정안내서.pdf';
          setPdfFileName(pdfName);
        }
      }
    } catch (error) {
      console.error('Footer 정보 로드 실패:', error);
      toast({
        title: "Footer 정보 로드 실패",
        description: "설정을 불러오는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
      
      // 에러가 발생하면 localStorage에서 로드 시도 (fallback)
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
          console.error('Failed to parse footer config from localStorage:', error);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (fileType: 'wordFile' | 'hwpFile' | 'pdfFile', event: React.ChangeEvent<HTMLInputElement>) => {
    // 실제 파일 업로드 로직 구현 필요
    // 예시에서는 File URL을 직접 입력받는 방식으로 구현
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    // 선택된 파일의 첫 번째 파일 사용
    const file = files[0];
    
    // 파일명 저장
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

    // 실제 구현에서는 파일을 서버에 업로드하고 URL을 받아야 함
    // 지금은 임시로 파일 이름만 표시하고 실제 URL은 설정하지 않음
    // setFooterConfig(prev => ({ ...prev, [fileType]: fileUrl }));
  };

  const handleUrlChange = (fileType: 'wordFile' | 'hwpFile' | 'pdfFile', e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setFooterConfig(prev => ({ ...prev, [fileType]: url }));
    
    // 파일명 설정
    const fileName = url.split('/').pop() || '';
    switch (fileType) {
      case 'wordFile':
        setWordFileName(fileName || '입학지원서.docx');
        break;
      case 'hwpFile':
        setHwpFileName(fileName || '입학지원서.hwp');
        break;
      case 'pdfFile':
        setPdfFileName(fileName || '과정안내서.pdf');
        break;
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFooterConfig(prev => ({ ...prev, email: e.target.value }));
  };

  const handleSave = async () => {
    const authToken = localStorage.getItem('adminToken') || 'admin-auth';
    
    setIsSaving(true);
    
    try {
      // API를 통해 Footer 정보 저장
      const response = await axios.post(`${API_BASE_URL}/footer`, footerConfig, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (response.data) {
        // localStorage에도 백업으로 저장
        localStorage.setItem('footer-config', JSON.stringify(footerConfig));
        
        toast({
          title: "설정 저장 성공",
          description: "Footer 설정이 성공적으로 저장되었습니다.",
        });
      }
    } catch (error) {
      console.error('Footer 정보 저장 실패:', error);
      
      toast({
        title: "설정 저장 실패",
        description: "Footer 설정을 저장하는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
      
      // 실패해도 localStorage에는 저장
      localStorage.setItem('footer-config', JSON.stringify(footerConfig));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminLayout>
      <Card>
        <CardHeader>
          <CardTitle>Footer 설정</CardTitle>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="files">
            <TabsList className="mb-4">
              <TabsTrigger value="files">파일 다운로드 링크</TabsTrigger>
              <TabsTrigger value="contact">연락처</TabsTrigger>
            </TabsList>
            
            <TabsContent value="files" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="wordFile" className="text-base font-medium">입학지원서 (Word) 링크</Label>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Input
                      id="wordFile"
                      value={footerConfig.wordFile}
                      onChange={(e) => handleUrlChange('wordFile', e)}
                      className="flex-1"
                      disabled={isLoading}
                    />
                    {/* <div className="relative">
                      <Button variant="outline" size="sm" type="button" onClick={() => document.getElementById('wordFileUpload')?.click()}>
                        파일 업로드
                      </Button>
                      <input 
                        type="file" 
                        id="wordFileUpload" 
                        className="hidden" 
                        accept=".docx, .doc"
                        onChange={(e) => handleFileUpload('wordFile', e)}
                      />
                    </div> */}
                  </div>
                  {wordFileName && (
                    <p className="text-sm text-gray-500 mt-1">현재 파일: {wordFileName}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="hwpFile" className="text-base font-medium">입학지원서 (HWP) 링크</Label>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Input
                      id="hwpFile"
                      value={footerConfig.hwpFile}
                      onChange={(e) => handleUrlChange('hwpFile', e)}
                      className="flex-1"
                      disabled={isLoading}
                    />
                    {/* <div className="relative">
                      <Button variant="outline" size="sm" type="button" onClick={() => document.getElementById('hwpFileUpload')?.click()}>
                        파일 업로드
                      </Button>
                      <input 
                        type="file" 
                        id="hwpFileUpload" 
                        className="hidden" 
                        accept=".hwp"
                        onChange={(e) => handleFileUpload('hwpFile', e)}
                      />
                    </div> */}
                  </div>
                  {hwpFileName && (
                    <p className="text-sm text-gray-500 mt-1">현재 파일: {hwpFileName}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="pdfFile" className="text-base font-medium">과정안내서 (PDF) 링크</Label>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Input
                      id="pdfFile"
                      value={footerConfig.pdfFile}
                      onChange={(e) => handleUrlChange('pdfFile', e)}
                      className="flex-1"
                      disabled={isLoading}
                    />
                    {/* <div className="relative">
                      <Button variant="outline" size="sm" type="button" onClick={() => document.getElementById('pdfFileUpload')?.click()}>
                        파일 업로드
                      </Button>
                      <input 
                        type="file" 
                        id="pdfFileUpload" 
                        className="hidden" 
                        accept=".pdf"
                        onChange={(e) => handleFileUpload('pdfFile', e)}
                      />
                    </div> */}
                  </div>
                  {pdfFileName && (
                    <p className="text-sm text-gray-500 mt-1">현재 파일: {pdfFileName}</p>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="contact" className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-base font-medium">지원서 제출 이메일</Label>
                <Input
                  id="email"
                  type="email"
                  className="mt-1.5"
                  value={footerConfig.email}
                  onChange={handleEmailChange}
                  disabled={isLoading}
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        
        <CardFooter className="flex justify-end">
          <Button 
            onClick={handleSave} 
            className="bg-mainBlue hover:bg-blue-900"
            disabled={isLoading || isSaving}
          >
            {isSaving ? '저장 중...' : '저장하기'}
          </Button>
        </CardFooter>
      </Card>
    </AdminLayout>
  );
};

export default FooterManage; 