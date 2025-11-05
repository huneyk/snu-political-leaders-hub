import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminLayout from '@/components/admin/AdminLayout';
import axios from 'axios';
import { MdEmail } from 'react-icons/md';

// API 기본 URL 설정 - 수정됨
const API_BASE_URL = import.meta.env.MODE === 'production' 
  ? 'https://snu-plp-hub-server.onrender.com/api' 
  : 'http://localhost:5001/api';

interface FooterConfig {
  _id?: string;
  wordFile: string;
  wordFileName?: string;
  hwpFile: string;
  hwpFileName?: string;
  pdfFile: string;
  pdfFileName?: string;
  email: string;
  companyName?: string;
  address?: string;
  contactPhone?: string;
  contactEmail?: string;
  copyrightYear?: string;
  updatedAt?: string;
}

interface FileInfo {
  name: string;
  size: number;
  type: string;
  file?: File;
  url?: string;
  originalName?: string;
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

  // File upload references
  const wordFileRef = useRef<HTMLInputElement>(null);
  const hwpFileRef = useRef<HTMLInputElement>(null);
  const pdfFileRef = useRef<HTMLInputElement>(null);

  // File information
  const [wordFileInfo, setWordFileInfo] = useState<FileInfo | null>(null);
  const [hwpFileInfo, setHwpFileInfo] = useState<FileInfo | null>(null);
  const [pdfFileInfo, setPdfFileInfo] = useState<FileInfo | null>(null);

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
      console.log('Footer 데이터 요청 URL:', `${API_BASE_URL}/footer`);
      
      const response = await axios.get(`${API_BASE_URL}/footer`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer admin-auth'
        }
      });
      
      console.log('Footer API 응답:', response.data);
      
      if (response.data) {
        const data = response.data;
        setFooterConfig({
          _id: data._id,
          wordFile: data.wordFile || '',
          hwpFile: data.hwpFile || '',
          pdfFile: data.pdfFile || '',
          email: data.email || '',
          companyName: data.companyName,
          address: data.address,
          contactPhone: data.contactPhone,
          contactEmail: data.contactEmail,
          copyrightYear: data.copyrightYear,
          updatedAt: data.updatedAt
        });
        
        // 파일 정보 설정
        if (data.wordFile) {
          const fileName = data.wordFileName || data.wordFile.split('/').pop() || '입학지원서.docx';
          setWordFileInfo({
            name: fileName,
            originalName: data.wordFileName,
            size: 0,
            type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            url: data.wordFile
          });
        }
        
        if (data.hwpFile) {
          const fileName = data.hwpFileName || data.hwpFile.split('/').pop() || '입학지원서.hwp';
          setHwpFileInfo({
            name: fileName,
            originalName: data.hwpFileName,
            size: 0,
            type: 'application/x-hwp',
            url: data.hwpFile
          });
        }
        
        if (data.pdfFile) {
          const fileName = data.pdfFileName || data.pdfFile.split('/').pop() || '과정안내서.pdf';
          setPdfFileInfo({
            name: fileName,
            originalName: data.pdfFileName,
            size: 0,
            type: 'application/pdf',
            url: data.pdfFile
          });
        }
        
        toast({
          title: "Footer 정보 로드 성공",
          description: "최신 설정을 불러왔습니다."
        });
      }
    } catch (error) {
      console.error('Footer 정보 로드 실패:', error);
      
      // 자세한 에러 정보 로깅
      if (error.response) {
        console.error('응답 상태:', error.response.status);
        console.error('응답 데이터:', error.response.data);
      } else if (error.request) {
        console.error('요청은 보냈지만 응답이 없습니다:', error.request);
      } else {
        console.error('요청 설정 중 오류:', error.message);
      }
      
      toast({
        title: "Footer 정보 로드 실패",
        description: error.response?.data?.message || error.message || "설정을 불러오는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (fileType: 'wordFile' | 'hwpFile' | 'pdfFile', event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Store file information
    const fileInfo: FileInfo = {
      name: file.name,
      originalName: file.name, // Store original name explicitly
      size: file.size,
      type: file.type,
      file: file
    };
    
    // 파일 크기 제한 (10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast({
        title: "파일 크기 제한 초과",
        description: "10MB 이하의 파일만 업로드 가능합니다.",
        variant: "destructive",
      });
      return;
    }
    
    switch (fileType) {
      case 'wordFile':
        setWordFileInfo(fileInfo);
        break;
      case 'hwpFile':
        setHwpFileInfo(fileInfo);
        break;
      case 'pdfFile':
        setPdfFileInfo(fileInfo);
        break;
    }
    
    toast({
      title: "파일 선택 완료",
      description: `${file.name} 파일이 선택되었습니다. 저장 버튼을 클릭하여 업로드하세요.`,
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFooterConfig(prev => ({ ...prev, email: e.target.value }));
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const uploadFile = async (file: File, fileType: string): Promise<{url: string, filename: string}> => {
    // Store the original filename
    const originalFilename = file.name;
    
    // Create FormData as before
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileType', fileType);
    formData.append('originalFilename', originalFilename); // Add original filename to form data
    
    try {
      // 파일 업로드 API 호출
      const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': 'Bearer admin-auth'
        }
      });
      
      console.log('파일 업로드 응답:', response.data);
      
      // Return both the URL and the original filename
      return {
        url: response.data.fileUrl,
        filename: originalFilename
      };
    } catch (error) {
      console.error('파일 업로드 실패:', error);
      throw error;
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // 중요: 기존 구성에서 시작하되, 기존 파일 이름 필드도 유지합니다
      let updatedConfig = { 
        ...footerConfig,
        // 기존 파일 이름 필드가 있다면 유지
        wordFileName: footerConfig.wordFileName || '',
        hwpFileName: footerConfig.hwpFileName || '',
        pdfFileName: footerConfig.pdfFileName || ''
      };
      
      // Word 파일 처리
      if (wordFileInfo?.file) {
        try {
          const base64 = await fileToBase64(wordFileInfo.file);
          updatedConfig.wordFile = base64;
          updatedConfig.wordFileName = wordFileInfo.name; // 명시적으로 파일명 설정
          console.log('Word 파일명 저장:', updatedConfig.wordFileName); // 디버깅용
        } catch (error) {
          console.error('Word 파일 처리 실패:', error);
        }
      }
      
      // HWP 파일 처리
      if (hwpFileInfo?.file) {
        try {
          const base64 = await fileToBase64(hwpFileInfo.file);
          updatedConfig.hwpFile = base64;
          updatedConfig.hwpFileName = hwpFileInfo.name; // 명시적으로 파일명 설정
          console.log('HWP 파일명 저장:', updatedConfig.hwpFileName); // 디버깅용
        } catch (error) {
          console.error('HWP 파일 처리 실패:', error);
        }
      }
      
      // PDF 파일 처리
      if (pdfFileInfo?.file) {
        try {
          const base64 = await fileToBase64(pdfFileInfo.file);
          updatedConfig.pdfFile = base64;
          updatedConfig.pdfFileName = pdfFileInfo.name; // 명시적으로 파일명 설정
          console.log('PDF 파일명 저장:', updatedConfig.pdfFileName); // 디버깅용
        } catch (error) {
          console.error('PDF 파일 처리 실패:', error);
        }
      }
      
      // 저장 전 데이터 로깅
      console.log('서버로 보내는 데이터:', {
        wordFileName: updatedConfig.wordFileName,
        hwpFileName: updatedConfig.hwpFileName,
        pdfFileName: updatedConfig.pdfFileName
      });
      
      // 서버에 데이터 저장
      const response = await axios.post(`${API_BASE_URL}/footer`, updatedConfig, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer admin-auth'
        }
      });
      
      console.log('서버 응답:', response.data);
      
      // Update state with the response
      setFooterConfig(response.data);
      
      // Update file info objects with filename info
      if (wordFileInfo) {
        setWordFileInfo({
          ...wordFileInfo,
          file: undefined,
          url: response.data.wordFile
        });
      }
      
      if (hwpFileInfo) {
        setHwpFileInfo({
          ...hwpFileInfo,
          file: undefined,
          url: response.data.hwpFile
        });
      }
      
      if (pdfFileInfo) {
        setPdfFileInfo({
          ...pdfFileInfo,
          file: undefined,
          url: response.data.pdfFile
        });
      }
      
      toast({
        title: "설정 저장 성공",
        description: "Footer 설정 및 파일이 성공적으로 저장되었습니다.",
      });
    } catch (error) {
      console.error('Footer 저장 실패:', error);
      toast({
        title: "설정 저장 실패",
        description: "Footer 설정을 저장하는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Helper function to convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleDownload = (url: string, fileName: string) => {
    if (!url) {
      toast({
        title: "다운로드 실패",
        description: "파일이 존재하지 않습니다.",
        variant: "destructive"
      });
      return;
    }
    
    // 다운로드 시작
    try {
      // 파일 이름 추출 (URL의 마지막 부분)
      const extractedFileName = url.split('/').pop() || fileName;
      
      // 링크 생성
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', extractedFileName);
      link.setAttribute('target', '_blank');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('파일 다운로드 오류:', error);
      toast({
        title: "다운로드 실패",
        description: "파일 다운로드 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  };

  const handleDownloadBase64 = (base64Data: string, fileName: string) => {
    if (!base64Data) {
      toast({
        title: "다운로드 실패",
        description: "파일이 존재하지 않습니다.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Create a blob from the base64 data
      const byteString = atob(base64Data.split(',')[1]);
      const mimeType = base64Data.split(',')[0].split(':')[1].split(';')[0];
      
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      
      const blob = new Blob([ab], { type: mimeType });
      
      // Create a download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "다운로드 시작",
        description: `${fileName} 파일이 다운로드됩니다.`
      });
    } catch (error) {
      console.error('파일 다운로드 오류:', error);
      toast({
        title: "다운로드 실패",
        description: "파일 다운로드 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  };

  const lastUpdated = footerConfig.updatedAt 
    ? new Date(footerConfig.updatedAt).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : '업데이트 정보 없음';

  const handleDownloadFile = (fileType: 'wordFile' | 'hwpFile' | 'pdfFile') => {
    let fileData: string;
    let fileName: string;
    
    switch (fileType) {
      case 'wordFile':
        fileData = footerConfig.wordFile;
        fileName = footerConfig.wordFileName || "입학지원서.docx";
        break;
      case 'hwpFile':
        fileData = footerConfig.hwpFile;
        fileName = footerConfig.hwpFileName || "입학지원서.hwp";
        break;
      case 'pdfFile':
        fileData = footerConfig.pdfFile;
        fileName = footerConfig.pdfFileName || "과정안내서.pdf";
        break;
      default:
        return;
    }
    
    if (!fileData) {
      toast({
        title: "다운로드 실패",
        description: "파일이 존재하지 않습니다.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Create download link
      const link = document.createElement('a');
      link.href = fileData; // The base64 data URL
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "다운로드 시작",
        description: `${fileName} 파일이 다운로드됩니다.`
      });
    } catch (error) {
      console.error('파일 다운로드 오류:', error);
      toast({
        title: "다운로드 실패",
        description: "파일 다운로드 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  };

  const handleEmailSubmit = () => {
    const email = footerConfig.email || 'plp@snu.ac.kr';
    const subject = encodeURIComponent('서울대학교 정치지도자과정 지원서 제출');
    const mailtoLink = `mailto:${email}?subject=${subject}`;
    
    window.location.href = mailtoLink;
  };

  return (
    <AdminLayout>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Footer 설정</CardTitle>
            <div className="text-sm text-gray-500">마지막 업데이트: {lastUpdated}</div>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="files">
            <TabsList className="mb-4">
              <TabsTrigger value="files">파일 다운로드 링크</TabsTrigger>
              <TabsTrigger value="contact">연락처</TabsTrigger>
            </TabsList>
            
            <TabsContent value="files" className="space-y-4">
              <div className="space-y-4">
                {/* Word 파일 업로드 */}
                <div>
                  <Label htmlFor="wordFile" className="text-base font-medium">입학지원서 (Word)</Label>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex-1 border rounded p-2 bg-gray-50">
                      {wordFileInfo ? (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <span className="text-blue-600 mr-2">
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                            </span>
                            <div>
                              <p className="text-sm font-medium">
                                {footerConfig.wordFileName || "입학지원서.docx"}
                              </p>
                              {wordFileInfo.size > 0 && (
                                <p className="text-xs text-gray-500">{formatFileSize(wordFileInfo.size)}</p>
                              )}
                            </div>
                          </div>
                          {wordFileInfo.url && (
                            <button 
                              className="text-xs text-blue-600 hover:underline"
                              onClick={() => handleDownloadFile('wordFile')}
                            >
                              다운로드
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">파일을 선택해주세요</span>
                      )}
                    </div>
                    <input 
                      type="file" 
                      id="wordFileUpload" 
                      ref={wordFileRef}
                      className="hidden" 
                      accept=".docx, .doc"
                      onChange={(e) => handleFileUpload('wordFile', e)}
                    />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      type="button" 
                      onClick={() => wordFileRef.current?.click()}
                      disabled={isLoading}
                    >
                      파일 선택
                    </Button>
                  </div>
                </div>
                
                {/* HWP 파일 업로드 */}
                <div>
                  <Label htmlFor="hwpFile" className="text-base font-medium">입학지원서 (HWP)</Label>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex-1 border rounded p-2 bg-gray-50">
                      {hwpFileInfo ? (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <span className="text-red-600 mr-2">
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                            </span>
                            <div>
                              <p className="text-sm font-medium">
                                {footerConfig.hwpFileName || hwpFileInfo.originalName || hwpFileInfo.name || "입학지원서.hwp"}
                              </p>
                              {hwpFileInfo.size > 0 && (
                                <p className="text-xs text-gray-500">{formatFileSize(hwpFileInfo.size)}</p>
                              )}
                            </div>
                          </div>
                          <button 
                            className="text-xs text-red-600 hover:underline"
                            onClick={() => handleDownloadFile('hwpFile')}
                          >
                            다운로드
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">파일을 선택해주세요</span>
                      )}
                    </div>
                    <input 
                      type="file" 
                      id="hwpFileUpload" 
                      ref={hwpFileRef}
                      className="hidden" 
                      accept=".hwp"
                      onChange={(e) => handleFileUpload('hwpFile', e)}
                    />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      type="button" 
                      onClick={() => hwpFileRef.current?.click()}
                      disabled={isLoading}
                    >
                      파일 선택
                    </Button>
                  </div>
                </div>
                
                {/* PDF 파일 업로드 */}
                <div>
                  <Label htmlFor="pdfFile" className="text-base font-medium">과정안내서 (PDF)</Label>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex-1 border rounded p-2 bg-gray-50">
                      {pdfFileInfo ? (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <span className="text-red-700 mr-2">
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                            </span>
                            <div>
                              <p className="text-sm font-medium">
                                {footerConfig.pdfFileName || pdfFileInfo.originalName || pdfFileInfo.name || "과정안내서.pdf"}
                              </p>
                              {pdfFileInfo.size > 0 && (
                                <p className="text-xs text-gray-500">{formatFileSize(pdfFileInfo.size)}</p>
                              )}
                            </div>
                          </div>
                          <button 
                            className="text-xs text-red-700 hover:underline"
                            onClick={() => handleDownloadFile('pdfFile')}
                          >
                            다운로드
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">파일을 선택해주세요</span>
                      )}
                    </div>
                    <input 
                      type="file" 
                      id="pdfFileUpload" 
                      ref={pdfFileRef}
                      className="hidden" 
                      accept=".pdf"
                      onChange={(e) => handleFileUpload('pdfFile', e)}
                    />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      type="button" 
                      onClick={() => pdfFileRef.current?.click()}
                      disabled={isLoading}
                    >
                      파일 선택
                    </Button>
                  </div>
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
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={handleEmailSubmit}
                disabled={isLoading}
              >
                <MdEmail className="text-gray-600" />
                <span>지원서 이메일 제출</span>
              </Button>
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