import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog';
import { apiService } from '@/lib/apiService';

// Add CSS for white header
const headerStyle = `
  .notices-page header {
    background-color: white !important;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
`;

interface AttachmentFile {
  id: string;
  name: string;
  originalName: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: string;
}

interface Notice {
  _id?: string;
  id?: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  isImportant: boolean;
  attachments?: AttachmentFile[];
}

const Notices = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [filteredNotices, setFilteredNotices] = useState<Notice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);

  useEffect(() => {
    // 페이지 로드 시 스크롤을 맨 위로 이동
    window.scrollTo(0, 0);
    
    // 공지사항 데이터 로드
    loadNotices();
  }, []);

  useEffect(() => {
    // 검색어에 따라 공지사항 필터링
    if (searchTerm.trim() === '') {
      setFilteredNotices(notices);
    } else {
      const filtered = notices.filter(
        (notice) =>
          notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          notice.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          notice.author.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredNotices(filtered);
    }
  }, [searchTerm, notices]);

  const loadNotices = async () => {
    setLoading(true);
    console.log('공지사항 로딩 시작');
    try {
      // MongoDB API를 통해 공지사항 데이터 가져오기
      console.log('API 호출 시작: ', `${process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5001/api'}/notices`);
      const data = await apiService.getNotices();
      console.log('API 호출 결과:', data);
      
      if (Array.isArray(data) && data.length > 0) {
        // MongoDB에서 가져온 데이터를 필요한 형식으로 변환
        console.log('데이터 변환 시작');
        const formattedData = data.map(item => ({
          id: item._id,
          _id: item._id,
          title: item.title,
          content: item.content,
          author: item.author,
          createdAt: new Date(item.createdAt).toISOString(),
          isImportant: item.isImportant,
          attachments: item.attachments || []
        }));
        console.log('변환된 데이터:', formattedData);
        
        // 중요 공지사항을 먼저 표시하고, 그 다음에 날짜 내림차순으로 정렬
        const sortedNotices = formattedData.sort((a, b) => {
          if (a.isImportant && !b.isImportant) return -1;
          if (!a.isImportant && b.isImportant) return 1;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        console.log('정렬된 데이터:', sortedNotices);
        
        setNotices(sortedNotices);
        setFilteredNotices(sortedNotices);
      } else {
        console.log('데이터가 없거나 배열이 아님:', data);
        setNotices([]);
        setFilteredNotices([]);
      }
    } catch (error) {
      console.error('공지사항 로드 중 오류 발생:', error);
      setNotices([]);
      setFilteredNotices([]);
    } finally {
      setLoading(false);
      console.log('공지사항 로딩 완료');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string): string => {
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType === 'application/pdf') return '📄';
    if (fileType.includes('word')) return '📝';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊';
    if (fileType.includes('powerpoint') || fileType.includes('presentation')) return '📈';
    if (fileType.startsWith('text/')) return '📃';
    if (fileType.includes('zip') || fileType.includes('rar')) return '📦';
    return '📎';
  };

  const handleFileDownload = (attachment: AttachmentFile) => {
    try {
      // Base64 데이터 URL인 경우 다운로드 처리
      if (attachment.url.startsWith('data:')) {
        const link = document.createElement('a');
        link.href = attachment.url;
        link.download = attachment.originalName || attachment.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // 일반 URL인 경우
        window.open(attachment.url, '_blank');
      }
    } catch (error) {
      console.error('파일 다운로드 실패:', error);
      alert('파일 다운로드에 실패했습니다.');
    }
  };

  const handleNoticeClick = (notice: Notice) => {
    setSelectedNotice(notice);
  };

  return (
    <div className="notices-page">
      <style dangerouslySetInnerHTML={{ __html: headerStyle }} />
      <Header />
      
      <main className="pt-24 pb-16">
        {/* 배너 섹션 */}
        <section className="bg-mainBlue text-white py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">공지사항</h1>
          </div>
        </section>
        
        {/* 공지사항 목록 섹션 */}
        <section className="container mx-auto px-4 py-12">
          <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h2 className="text-2xl font-bold text-gray-800">전체 공지사항</h2>
            <div className="w-full md:w-64">
              <Input
                type="text"
                placeholder="검색어를 입력하세요"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mainBlue"></div>
            </div>
          ) : filteredNotices.length > 0 ? (
            <div className="space-y-4">
              {filteredNotices.map((notice) => (
                <Card 
                  key={notice.id} 
                  className={`hover:shadow-md transition-shadow cursor-pointer ${
                    notice.isImportant ? 'border-l-4 border-l-red-500' : ''
                  }`}
                  onClick={() => handleNoticeClick(notice)}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-xl font-bold">{notice.title}</h3>
                          {notice.isImportant && (
                            <Badge variant="destructive" className="ml-2">
                              중요
                            </Badge>
                          )}
                          {notice.attachments && notice.attachments.length > 0 && (
                            <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-300">
                              📎 {notice.attachments.length}개 파일
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-start md:items-end text-sm text-gray-500">
                        <span>{formatDate(notice.createdAt)}</span>
                        <span className="text-xs">{notice.author}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-xl text-gray-500">공지사항이 없습니다.</p>
            </div>
          )}
        </section>
      </main>
      
      {/* 공지사항 상세 보기 다이얼로그 */}
      <Dialog open={!!selectedNotice} onOpenChange={(open) => !open && setSelectedNotice(null)}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-hidden">
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground z-10">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
            <span className="sr-only">Close</span>
          </DialogClose>
          
          {selectedNotice && (
            <div className="py-4 pr-6 h-[calc(90vh-120px)] overflow-y-auto">
              <div className="flex items-center gap-2 mb-6">
                <h2 className="text-2xl font-bold">{selectedNotice.title}</h2>
                {selectedNotice.isImportant && (
                  <Badge variant="destructive">중요</Badge>
                )}
              </div>
              
              <div className="flex justify-between items-center text-sm text-gray-500 mb-6 pb-4 border-b">
                <span className="font-medium">{selectedNotice.author}</span>
                <span>{formatDate(selectedNotice.createdAt)}</span>
              </div>
              
              <div className="whitespace-pre-line text-gray-800 mb-8 leading-relaxed">
                {selectedNotice.content}
              </div>

              {/* 첨부파일 섹션 */}
              {selectedNotice.attachments && selectedNotice.attachments.length > 0 && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-700">
                    📎 첨부파일 ({selectedNotice.attachments.length}개)
                  </h3>
                  <div className="space-y-3">
                    {selectedNotice.attachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <span className="text-2xl flex-shrink-0">
                            {getFileIcon(attachment.type)}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {attachment.originalName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(attachment.size)} • {attachment.type.split('/')[1]?.toUpperCase() || 'FILE'}
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleFileDownload(attachment)}
                          variant="outline"
                          size="sm"
                          className="ml-4 flex-shrink-0 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700"
                        >
                          <svg 
                            className="w-4 h-4 mr-2" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                            />
                          </svg>
                          다운로드
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
};

export default Notices; 