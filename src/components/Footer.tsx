import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { MdFileDownload, MdEmail } from 'react-icons/md';
import { toast } from '@/hooks/use-toast';
import axios from 'axios';

interface FooterProps {
  className?: string;
}

interface FooterConfig {
  wordFile: string;
  hwpFile: string;
  pdfFile: string;
  email: string;
  companyName?: string;
  address?: string;
  contactPhone?: string;
  contactEmail?: string;
  copyrightYear?: string;
}

const Footer: React.FC<FooterProps> = ({ className }) => {
  const [footerConfig, setFooterConfig] = useState<FooterConfig>({
    wordFile: '',
    hwpFile: '',
    pdfFile: '',
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

  const handleEmailCopy = () => {
    if (footerConfig.email) {
      navigator.clipboard.writeText(footerConfig.email)
        .then(() => {
          toast({
            title: "이메일 주소 복사됨",
            description: `${footerConfig.email}가 클립보드에 복사되었습니다.`
          });
        })
        .catch((err) => {
          console.error('클립보드 복사 실패:', err);
          toast({
            title: "복사 실패",
            description: "이메일 주소를 복사하는데 실패했습니다.",
            variant: "destructive"
          });
        });
    }
  };

  const currentYear = new Date().getFullYear();
  
  return (
    <footer className={`bg-gray-100 py-8 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <p className="text-center text-gray-500 text-sm">서울대학교 정치지도자과정<br />SNU Political Leaders Program</h2>
            <p className="text-center text-gray-500 text-sm">서울시 관악구 관악로 1 서울대학교 아시아연구소 517호 정치지도자과정</p>            <p className="text-gray-600">Tel: 02-880-4107  Email : plp@snu.ac.kr</p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-2 md:gap-4">
            {/* 입학지원서 다운로드 (Word) */}
            {footerConfig.wordFile && (
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => handleDownload(footerConfig.wordFile, '입학지원서.docx')}
                disabled={loading}
              >
                <MdFileDownload className="text-blue-600" />
                <span>입학지원서 (Word)</span>
              </Button>
            )}
            
            {/* 입학지원서 다운로드 (HWP) */}
            {footerConfig.hwpFile && (
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => handleDownload(footerConfig.hwpFile, '입학지원서.hwp')}
                disabled={loading}
              >
                <MdFileDownload className="text-red-600" />
                <span>입학지원서 (HWP)</span>
              </Button>
            )}
            
            {/* 과정안내서 다운로드 (PDF) */}
            {footerConfig.pdfFile && (
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => handleDownload(footerConfig.pdfFile, '과정안내서.pdf')}
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
              onClick={handleEmailCopy}
              disabled={loading}
            >
              <MdEmail className="text-gray-600" />
              <span>{footerConfig.email || 'plp@snu.ac.kr'}</span>
            </Button>
          </div>
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
