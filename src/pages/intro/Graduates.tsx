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
        <ScrollReveal>
          <section className="py-16 bg-mainBlue text-white">
            <div className="main-container">
              <h1 className="text-3xl md:text-4xl font-bold mb-4 reveal" style={{ wordBreak: 'keep-all' }}>수료자 명단</h1>
            </div>
          </section>
        </ScrollReveal>

        <div className="main-container mt-12">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-mainBlue"></div>
              <p className="mt-4 text-gray-600">수료생 명단을 불러오는 중...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
              {error}
            </div>
          ) : terms.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">등록된 수료생이 없습니다.</p>
            </div>
          ) : (
            <>
              {/* 기수별 탭 */}
              <div className="mb-8">
                <div className="border-b border-gray-200">
                  <nav className="flex flex-wrap -mb-px">
                    <button
                      onClick={() => setSelectedTerm(null)}
                      className={`mr-2 mb-2 px-6 py-3 text-sm font-medium rounded-t-lg transition-colors ${
                        selectedTerm === null
                          ? 'border-b-2 border-mainBlue text-mainBlue bg-blue-50'
                          : 'text-gray-600 hover:text-mainBlue hover:bg-gray-50'
                      }`}
                    >
                      전체
                    </button>
                    {terms.map((term) => (
                      <button
                        key={term}
                        onClick={() => setSelectedTerm(term)}
                        className={`mr-2 mb-2 px-6 py-3 text-sm font-medium rounded-t-lg transition-colors ${
                          selectedTerm === term
                            ? 'border-b-2 border-mainBlue text-mainBlue bg-blue-50'
                            : 'text-gray-600 hover:text-mainBlue hover:bg-gray-50'
                        }`}
                      >
                        {term}기
                      </button>
                    ))}
                  </nav>
                </div>
              </div>

              {/* 수료생 테이블 */}
              {filteredGraduates.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">해당 기수의 수료생이 없습니다.</p>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            기수
                          </th>
                          <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            성명
                          </th>
                          <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            소속
                          </th>
                          <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            직위
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredGraduates.map((graduate) => (
                          <tr key={graduate._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-mainBlue text-white">
                                {graduate.term}기
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {graduate.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {graduate.organization || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {graduate.position || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* 총 인원 표시 */}
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      총 <span className="font-semibold text-mainBlue">{filteredGraduates.length}</span>명
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default GraduatesPage; 