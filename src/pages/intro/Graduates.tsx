import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';
import { apiService } from '../../lib/apiService';

interface Graduate {
  _id: string;
  term: number;
  name: string;
  isGraduated: boolean;
  organization?: string;
  position?: string;
}

const GraduatesPage: React.FC = () => {
  const [graduates, setGraduates] = useState<Graduate[]>([]);
  const [terms, setTerms] = useState<number[]>([]);
  const [selectedTerm, setSelectedTerm] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'term'>('name');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 모든 수료생 데이터 로드
  useEffect(() => {
    const fetchGraduates = async () => {
      try {
        setLoading(true);
        console.log('수료생 데이터 로드 시작...');
        console.log('API URL:', process.env.NODE_ENV === 'production' ? '/api/graduates' : 'http://localhost:5001/api/graduates');
        
        const response = await apiService.getGraduates();
        console.log('API 응답 원본:', response);
        
        // 응답이 없거나 유효하지 않은 경우 빈 배열로 처리
        const data = response || [];
        console.log('가져온 수료생 데이터:', data);
        
        // 데이터가 배열인지 확인하고, 배열이 아니면 빈 배열로 설정
        const typedData = Array.isArray(data) ? data : [];
        console.log('타입 변환 후 데이터:', typedData);
        
        setGraduates(typedData);
        
        if (typedData.length === 0) {
          console.log('수료생 데이터가 없습니다.');
          setTerms([]);
          setSelectedTerm(null);
          setError(null);
          setLoading(false);
          return;
        }
        
        // 기수 목록 추출 및 숫자 배열로 변환
        const termNumbers: number[] = typedData
          .map(graduate => {
            // term 필드가 있는지 확인
            if (graduate && 'term' in graduate) {
              const term = graduate.term;
              // term이 문자열이면 숫자로 변환
              return typeof term === 'string' ? parseInt(term, 10) : Number(term);
            }
            return NaN;
          })
          .filter(term => !isNaN(term));
          
        console.log('추출된 기수 목록 (필터링 전):', termNumbers);
          
        // 중복 제거하고 정렬
        const uniqueTerms = Array.from(new Set(termNumbers)).sort((a, b) => a - b);
        console.log('중복 제거 후 정렬된 기수 목록:', uniqueTerms);
        
        setTerms(uniqueTerms);
        
        // 가장 최근 기수를 기본 선택
        if (uniqueTerms.length > 0) {
          const maxTerm = Math.max(...uniqueTerms);
          console.log('최근 기수로 선택됨:', maxTerm);
          setSelectedTerm(maxTerm);
        } else {
          console.log('기수가 없어 전체 보기로 설정됨');
          setSelectedTerm(null);
        }
        
        setError(null);
      } catch (err) {
        console.error('수료생 데이터 로드 중 오류 발생:', err);
        // 오류 발생 시 빈 데이터로 초기화
        setGraduates([]);
        setTerms([]);
        setSelectedTerm(null);
        setError('수료생 명단을 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchGraduates();
  }, []);

  // 기수별 수료생 목록 필터링
  const filteredGraduates = selectedTerm 
    ? graduates.filter(g => {
        const termNumber = typeof g.term === 'string' ? parseInt(g.term, 10) : g.term;
        return termNumber === selectedTerm && g.isGraduated;
      })
    : graduates.filter(g => g.isGraduated);

  return (
    <>
      <Header />
      <main className="pt-24 pb-16">
        <section className="py-16 bg-mainBlue text-white">
          <div className="main-container">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 reveal" style={{ wordBreak: 'keep-all' }}>정치지도자과정 수료생 명단</h1>
          </div>
        </section>
        <div className="main-container mt-12">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <label className="text-gray-700 font-medium">기수 선택:</label>
              <select
                value={selectedTerm || ''}
                onChange={(e) => setSelectedTerm(e.target.value ? Number(e.target.value) : null)}
                className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-mainBlue"
              >
                <option value="">전체</option>
                {terms.map((term) => (
                  <option key={term} value={term}>
                    {term}기
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center space-x-4">
              <label className="text-gray-700 font-medium">정렬:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'term')}
                className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-mainBlue"
              >
                <option value="name">이름순</option>
                <option value="term">기수순</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
              {error}
            </div>
          )}

          {filteredGraduates.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">등록된 수료생이 없습니다.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGraduates.map((graduate) => (
                <div
                  key={graduate._id}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">{graduate.name}</h3>
                    <span className="bg-mainBlue text-white px-3 py-1 rounded-full text-sm">
                      {graduate.term}기
                    </span>
                  </div>
                  <div className="space-y-2 text-gray-600">
                    <p>소속: {graduate.organization}</p>
                    <p>직위: {graduate.position}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default GraduatesPage; 