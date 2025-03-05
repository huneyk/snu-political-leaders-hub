import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FileDown, Mail } from 'lucide-react';
import logo from '/logo.png'; // Using the logo.png file from the public directory

interface FooterConfig {
  wordFile: string;
  hwpFile: string;
  pdfFile: string;
  email: string;
}

const Footer = () => {
  const [footerConfig, setFooterConfig] = useState<FooterConfig>({
    wordFile: '',
    hwpFile: '',
    pdfFile: '',
    email: ''
  });

  useEffect(() => {
    // Load footer configuration from localStorage
    const savedConfig = localStorage.getItem('footer-config');
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        setFooterConfig(parsedConfig);
      } catch (error) {
        console.error('Failed to parse footer config:', error);
      }
    }
  }, []);

  const handleDownload = (fileType: 'wordFile' | 'hwpFile' | 'pdfFile') => {
    const fileUrl = footerConfig[fileType];
    if (!fileUrl) return;

    // Create a temporary link element
    const link = document.createElement('a');
    link.href = fileUrl;
    
    // Set the download filename based on file type
    switch (fileType) {
      case 'wordFile':
        link.download = '입학지원서.docx';
        break;
      case 'hwpFile':
        link.download = '입학지원서.hwp';
        break;
      case 'pdfFile':
        link.download = '과정안내서.pdf';
        break;
    }
    
    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleEmailClick = () => {
    if (footerConfig.email) {
      window.location.href = `mailto:${footerConfig.email}?subject=서울대학교 정치지도자과정 지원서 접수`;
    }
  };

  return (
    <footer className="bg-gray-100 py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <div className="mb-4 md:mb-0 flex items-center gap-3">
            <img
              src={logo}
              alt="서울대학교 정치지도자 과정 로고"
              className="h-10 w-auto object-contain"
            />
            <div>
              <h4 className="text-sm text-mainBlue" style={{ wordBreak: 'keep-all' }}>서울대학교 정치지도자과정</h4>
              <p className="text-gray-600 text-xs" style={{ wordBreak: 'keep-all' }}>Political Leaders Program</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 justify-center">
            <Button 
              variant="default" 
              size="sm"
              onClick={() => handleDownload('wordFile')}
              disabled={!footerConfig.wordFile}
              className="flex items-center gap-1 bg-[#666666] hover:bg-[#555555] text-white"
            >
              <FileDown size={16} />
              <span style={{ wordBreak: 'keep-all' }}>입학지원서 (Word) 다운로드</span>
            </Button>
            
            <Button 
              variant="default" 
              size="sm"
              onClick={() => handleDownload('hwpFile')}
              disabled={!footerConfig.hwpFile}
              className="flex items-center gap-1 bg-[#666666] hover:bg-[#555555] text-white"
            >
              <FileDown size={16} />
              <span style={{ wordBreak: 'keep-all' }}>입학지원서 (HWP) 다운로드</span>
            </Button>
            
            <Button 
              variant="default" 
              size="sm"
              onClick={() => handleDownload('pdfFile')}
              disabled={!footerConfig.pdfFile}
              className="flex items-center gap-1 bg-[#666666] hover:bg-[#555555] text-white"
            >
              <FileDown size={16} />
              <span style={{ wordBreak: 'keep-all' }}>과정안내서 (PDF) 다운로드</span>
            </Button>
            
            <Button 
              variant="default" 
              size="sm"
              onClick={handleEmailClick}
              disabled={!footerConfig.email}
              className="flex items-center gap-1 bg-[#666666] hover:bg-[#555555] text-white"
            >
              <Mail size={16} />
              <span style={{ wordBreak: 'keep-all' }}>지원서 이메일 접수</span>
            </Button>
          </div>
        </div>
        
        <div className="border-t border-gray-300 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-500 text-sm mb-4 md:mb-0">
              <p style={{ wordBreak: 'keep-all' }}>서울특별시 관악구 관악로 1 서울대학교 아시아연구소 517호 정치지도자과정</p>
              <p style={{ wordBreak: 'keep-all' }}>Tel: 02-880-4107  Email : plp@snu.ac.kr</p>
            </div>
            <div className="text-gray-500 text-sm">
              <span style={{ wordBreak: 'keep-all' }}>{new Date().getFullYear()} © 2025 서울대학교 정치외교학부 정치지도자과정 
               All rights reserved.</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
