import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { MdFileDownload, MdEmail } from 'react-icons/md';
import { FaFacebookF, FaYoutube } from 'react-icons/fa';
import { SiNaver } from 'react-icons/si';
import { toast } from '@/hooks/use-toast';
import axios from 'axios';

interface FooterProps {
  className?: string;
}

interface FooterConfig {
  _id?: string;
  wordFileId?: string | null;
  wordFileName?: string;
  hwpFileId?: string | null;
  hwpFileName?: string;
  pdfFileId?: string | null;
  pdfFileName?: string;
  email: string;
  companyName?: string;
  address?: string;
  contactPhone?: string;
  contactEmail?: string;
  copyrightYear?: string;
}

const Footer: React.FC<FooterProps> = ({ className }) => {
  const [footerConfig, setFooterConfig] = useState<FooterConfig>({
    wordFileId: null,
    wordFileName: '',
    hwpFileId: null,
    hwpFileName: '',
    pdfFileId: null,
    pdfFileName: '',
    email: 'plp@snu.ac.kr'
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFooterConfig = async () => {
      setLoading(true);
      try {
        // API 엔드포인트 설정
        const API_BASE_URL = import.meta.env.MODE === 'production' 
          ? 'https://snu-plp-hub-server.onrender.com/api' 
          : 'http://localhost:5001/api';
          
        const response = await axios.get(`${API_BASE_URL}/footer`);
        
        if (response.data) {
          setFooterConfig(response.data);
          // 로컬 스토리지에 백업 (오프라인 지원)
          localStorage.setItem('footer-config', JSON.stringify(response.data));
          localStorage.setItem('footer-config-timestamp', new Date().toISOString());
        }
      } catch (error) {
        console.error('Footer 정보 로드 실패:', error);
        
        // 로컬 저장소에서 로드 시도
        const savedConfig = localStorage.getItem('footer-config');
        if (savedConfig) {
          try {
            setFooterConfig(JSON.parse(savedConfig));
          } catch (e) {
            console.error('저장된 Footer 설정 파싱 오류:', e);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    loadFooterConfig();
  }, []);

  const handleDownload = async (fileType: string, fileName: string) => {
    if (!fileType) {
      toast({
        title: "다운로드 실패",
        description: "파일이 존재하지 않습니다.",
        variant: "destructive"
      });
      return;
    }
    
    // 다운로드 시작
    try {
      // API 기본 URL 설정
      const API_BASE_URL = import.meta.env.MODE === 'production' 
        ? 'https://snu-plp-hub-server.onrender.com/api' 
        : 'http://localhost:5001/api';
      
      // API를 통해 파일 다운로드
      const response = await axios.get(`${API_BASE_URL}/footer/download/${fileType}`, {
        responseType: 'blob'
      });
      
      // Blob을 사용하여 다운로드 링크 생성
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log(`파일 다운로드 완료: ${fileName}`);
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

  const currentYear = new Date().getFullYear();
  
  return (
    <footer className={`bg-gray-100 py-8 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <div className="flex items-center gap-2">
              <img 
                src="/logo.png" 
                alt="서울대학교 정치리더십과정 로고" 
                className="h-10 w-auto object-contain"
              />
              <div className="text-left">
                <p className="text-sm">서울대학교 정치지도자과정<br />SNU Political Leaders Program</p>
                <p className="text-xs text-gray-600">서울시 관악구 관악로 1 서울대학교 아시아연구소 517호</p>
                <p className="text-xs text-gray-600">Tel: 02-880-4107  Email: plp@snu.ac.kr</p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-2 md:gap-4">
            {/* 입학지원서 다운로드 (Word) */}
            {footerConfig.wordFileId && (
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => handleDownload(
                  'wordFile', 
                  footerConfig.wordFileName || '입학지원서.docx'
                )}
                disabled={loading}
              >
                <MdFileDownload className="text-blue-600" />
                <span>입학지원서 (Word)</span>
              </Button>
            )}
            
            {/* 입학지원서 다운로드 (HWP) */}
            {footerConfig.hwpFileId && (
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => handleDownload(
                  'hwpFile', 
                  footerConfig.hwpFileName || '입학지원서.hwp'
                )}
                disabled={loading}
              >
                <MdFileDownload className="text-red-600" />
                <span>입학지원서 (HWP)</span>
              </Button>
            )}
            
            {/* 과정안내서 다운로드 (PDF) */}
            {footerConfig.pdfFileId && (
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => handleDownload(
                  'pdfFile', 
                  footerConfig.pdfFileName || '과정안내서.pdf'
                )}
                disabled={loading}
              >
                <MdFileDownload className="text-red-800" />
                <span>과정안내서 (PDF)</span>
              </Button>
            )}
            
            {/* 이메일 주소 */}
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={handleEmailSubmit}
              disabled={loading}
            >
              <MdEmail className="text-gray-600" />
              <span>지원서 이메일 제출</span>
            </Button>
          </div>
        </div>
        
        {/* 소셜 미디어 링크 추가 */}
        <div className="flex justify-center gap-4 mb-4">
          <a 
            href="https://www.facebook.com/plpsnu" 
            target="_blank" 
            rel="noopener noreferrer"
            className="transition-transform hover:scale-110"
          >
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full bg-blue-600 text-white hover:bg-blue-700 h-10 w-10"
            >
              <FaFacebookF size={20} />
              <span className="sr-only">페이스북</span>
            </Button>
          </a>
          
          <a 
            href="https://www.youtube.com/@snuplp" 
            target="_blank" 
            rel="noopener noreferrer"
            className="transition-transform hover:scale-110"
          >
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full bg-red-600 text-white hover:bg-red-700 h-10 w-10"
            >
              <FaYoutube size={20} />
              <span className="sr-only">유튜브</span>
            </Button>
          </a>
          
          <a 
            href="https://blog.naver.com/plpsnu" 
            target="_blank" 
            rel="noopener noreferrer"
            className="transition-transform hover:scale-110"
          >
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full bg-green-600 text-white hover:bg-green-700 h-10 w-10"
            >
              <SiNaver size={18} />
              <span className="sr-only">네이버 블로그</span>
            </Button>
          </a>
        </div>
        
        <div className="border-t border-gray-300 pt-4">
          <p className="text-center text-gray-500 text-sm">
            © {footerConfig.copyrightYear || currentYear} 서울대학교 정치외교학부 All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
