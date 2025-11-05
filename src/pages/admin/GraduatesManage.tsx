import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../lib/apiService';
import AdminLayout from '@/components/admin/AdminLayout';
import * as XLSX from 'xlsx';

interface Graduate {
  _id: string;
  term: number;
  name: string;
  isGraduated: boolean;
  organization?: string;
  position?: string;
  graduationDate?: string;
}

const GraduatesManage: React.FC = () => {
  const navigate = useNavigate();
  const [graduates, setGraduates] = useState<Graduate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 수정 모드 상태
  const [editMode, setEditMode] = useState(false);
  const [editGraduate, setEditGraduate] = useState<Graduate | null>(null);
  
  // Excel 업로드 관련 상태
  const [uploadStatus, setUploadStatus] = useState<string>('');

  // 입력 폼 상태
  const [newGraduate, setNewGraduate] = useState<Omit<Graduate, '_id'>>({
    term: 1,
    name: '',
    isGraduated: true,
    organization: '',
    position: '',
  });

  // 모든 수료생 데이터 로드
  useEffect(() => {
    const fetchGraduates = async () => {
      try {
        setLoading(true);
        const data = await apiService.getGraduates();
        setGraduates(data);
        setError(null);
      } catch (err) {
        console.error('수료 원우 데이터 로드 중 오류 발생:', err);
        setError('수료 원우 명단을 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchGraduates();
  }, []);

  // 입력 폼 변경 핸들러
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    // 체크박스는 체크 여부를 값으로 설정
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setNewGraduate(prev => ({ ...prev, [name]: checked }));
      return;
    }
    
    // 기수 필드는 반드시 숫자로 변환
    if (name === 'term') {
      const termNumber = parseInt(value, 10);
      setNewGraduate(prev => ({ ...prev, [name]: isNaN(termNumber) ? 1 : termNumber }));
      return;
    }
    
    setNewGraduate(prev => ({ ...prev, [name]: value }));
  };

  // 수료생 추가 핸들러
  const handleAddGraduate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newGraduate.name.trim()) {
      alert('성명은 필수 입력 항목입니다.');
      return;
    }
    
    // 기수가 숫자인지 확인
    const graduateData = {
      ...newGraduate,
      term: typeof newGraduate.term === 'string' ? parseInt(newGraduate.term, 10) : newGraduate.term
    };
    
    try {
      setLoading(true);
      const addedGraduate = await apiService.addGraduate(graduateData);
      
      // 리스트에 추가된 수료생 추가
      setGraduates(prev => [...prev, addedGraduate]);
      
      // 입력 폼 초기화
      setNewGraduate({
        term: graduateData.term, // 기수는 유지
        name: '',
        isGraduated: true,
        organization: '',
        position: '',
      });
      
      alert('수료 원우가 성공적으로 추가되었습니다.');
    } catch (err) {
      console.error('수료 원우 추가 중 오류 발생:', err);
      alert('수료 원우 추가에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 수료 원우 삭제 핸들러
  const handleDeleteGraduate = async (id: string) => {
    if (!window.confirm('정말로 이 수료 원우 정보를 삭제하시겠습니까?')) {
      return;
    }
    
    try {
      setLoading(true);
      await apiService.deleteGraduate(id);
      
      // 삭제된 수료생 제거
      setGraduates(prev => prev.filter(g => g._id !== id));
      
      alert('수료 원우 정보가 성공적으로 삭제되었습니다.');
    } catch (err) {
      console.error('수료 원우 삭제 중 오류 발생:', err);
      alert('수료 원우 삭제에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 수료 상태 변경 핸들러
  const handleToggleGraduated = async (id: string, currentStatus: boolean) => {
    try {
      setLoading(true);
      const updatedGraduate = await apiService.updateGraduate(id, { isGraduated: !currentStatus });
      
      // 수정된 수료생 정보 업데이트
      setGraduates(prev => 
        prev.map(g => g._id === id ? { ...g, isGraduated: updatedGraduate.isGraduated } : g)
      );
    } catch (err) {
      console.error('수료 상태 변경 중 오류 발생:', err);
      alert('수료 상태 변경에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 수정 모드 시작 핸들러
  const handleStartEdit = (graduate: Graduate) => {
    setEditGraduate(graduate);
    setEditMode(true);
  };
  
  // 수정 취소 핸들러
  const handleCancelEdit = () => {
    setEditGraduate(null);
    setEditMode(false);
  };
  
  // 수정 폼 변경 핸들러
  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!editGraduate) return;
    
    const { name, value, type } = e.target as HTMLInputElement;
    
    // 체크박스는 체크 여부를 값으로 설정
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setEditGraduate(prev => prev ? { ...prev, [name]: checked } : null);
      return;
    }
    
    // 기수 필드는 반드시 숫자로 변환
    if (name === 'term') {
      const termNumber = parseInt(value, 10);
      setEditGraduate(prev => prev ? { ...prev, [name]: isNaN(termNumber) ? 1 : termNumber } : null);
      return;
    }
    
    setEditGraduate(prev => prev ? { ...prev, [name]: value } : null);
  };
  
  // 수정 저장 핸들러
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editGraduate) return;
    
    if (!editGraduate.name.trim()) {
      alert('성명은 필수 입력 항목입니다.');
      return;
    }
    
    try {
      setLoading(true);
      
      // 기수가 숫자인지 확인
      const graduateData = {
        ...editGraduate,
        term: typeof editGraduate.term === 'string' ? parseInt(editGraduate.term, 10) : editGraduate.term
      };
      
      const updatedGraduate = await apiService.updateGraduate(editGraduate._id, graduateData);
      
      // 수정된 수료생 정보 업데이트
      setGraduates(prev => 
        prev.map(g => g._id === editGraduate._id ? updatedGraduate : g)
      );
      
      setEditMode(false);
      setEditGraduate(null);
      
      alert('수료 원우 정보가 성공적으로 수정되었습니다.');
    } catch (err) {
      console.error('수료 원우 수정 중 오류 발생:', err);
      alert('수료 원우 수정에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // Excel 파일 업로드 핸들러
  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Excel 파일 확인
    const validExtensions = ['.xlsx', '.xls'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!validExtensions.includes(fileExtension)) {
      alert('Excel 파일(.xlsx, .xls)만 업로드 가능합니다.');
      e.target.value = '';
      return;
    }
    
    setUploadStatus('파일을 읽는 중...');
    
    try {
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        try {
          const data = event.target?.result;
          if (!data) {
            throw new Error('파일을 읽을 수 없습니다.');
          }
          
          // Excel 파일 파싱
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          // JSON으로 변환
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
          
          if (jsonData.length < 2) {
            throw new Error('Excel 파일에 데이터가 없습니다.');
          }
          
          // 헤더 행 제거
          const dataRows = jsonData.slice(1);
          
          // 데이터 변환 (기수, 성명, 소속, 직책 순서 가정)
          const graduatesData = dataRows
            .filter(row => row && row.length > 0 && row[1]) // 성명이 있는 행만
            .map(row => ({
              term: typeof row[0] === 'number' ? row[0] : parseInt(String(row[0]), 10) || 1,
              name: String(row[1] || '').trim(),
              organization: row[2] ? String(row[2]).trim() : '',
              position: row[3] ? String(row[3]).trim() : '',
              isGraduated: true
            }));
          
          if (graduatesData.length === 0) {
            throw new Error('유효한 데이터가 없습니다. 기수와 성명은 필수 입력 항목입니다.');
          }
          
          setUploadStatus(`${graduatesData.length}명의 수료 원우 데이터를 업로드하는 중...`);
          
          // 일괄 추가 API 호출
          const result = await apiService.addGraduatesBatch(graduatesData);
          
          // 리스트 업데이트
          const updatedGraduates = await apiService.getGraduates();
          setGraduates(updatedGraduates);
          
          setUploadStatus('');
          alert(`${graduatesData.length}명의 수료 원우가 성공적으로 추가되었습니다.`);
          
          // 파일 input 초기화
          e.target.value = '';
        } catch (parseError) {
          console.error('Excel 파일 파싱 중 오류:', parseError);
          setUploadStatus('');
          alert(`Excel 파일 처리 중 오류가 발생했습니다: ${parseError instanceof Error ? parseError.message : '알 수 없는 오류'}`);
          e.target.value = '';
        }
      };
      
      reader.onerror = () => {
        setUploadStatus('');
        alert('파일을 읽는 중 오류가 발생했습니다.');
        e.target.value = '';
      };
      
      reader.readAsBinaryString(file);
    } catch (error) {
      console.error('Excel 파일 업로드 중 오류:', error);
      setUploadStatus('');
      alert('Excel 파일 업로드에 실패했습니다.');
      e.target.value = '';
    }
  };

  // 기수별 그룹화된 수료생 목록
  const graduatesByTerm: Record<number, Graduate[]> = {};
  graduates.forEach(graduate => {
    if (!graduatesByTerm[graduate.term]) {
      graduatesByTerm[graduate.term] = [];
    }
    graduatesByTerm[graduate.term].push(graduate);
  });

  // 기수 옵션 (1기부터 20기까지)
  const termOptions = Array.from({ length: 20 }, (_, i) => i + 1);

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">수료 원우 관리</h1>

        {/* 수료 원우 추가 폼 */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">수료 원우 추가</h2>
          <form onSubmit={handleAddGraduate}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">기수</label>
                <select
                  name="term"
                  value={newGraduate.term}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  {termOptions.map(term => (
                    <option key={term} value={term}>{term}기</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">성명 *</label>
                <input
                  type="text"
                  name="name"
                  value={newGraduate.name}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">소속</label>
                <input
                  type="text"
                  name="organization"
                  value={newGraduate.organization}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">직책</label>
                <input
                  type="text"
                  name="position"
                  value={newGraduate.position}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isGraduated"
                  checked={newGraduate.isGraduated}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">수료 완료</span>
              </label>
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              disabled={loading}
            >
              {loading ? '처리 중...' : '수료 원우 추가'}
            </button>
          </form>
        </div>

        {/* Excel 파일 업로드 섹션 */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">Excel 파일로 일괄 추가</h2>
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">
              Excel 파일 형식: 첫 번째 행은 헤더이며, 데이터는 두 번째 행부터 시작합니다.
            </p>
            <p className="text-sm text-gray-600 mb-4">
              열 순서: <span className="font-medium">기수</span> | <span className="font-medium">성명</span> | <span className="font-medium">소속</span> | <span className="font-medium">직책</span>
            </p>
            <div className="flex items-center gap-4">
              <label className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors cursor-pointer">
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleExcelUpload}
                  className="hidden"
                  disabled={loading}
                />
                <span>Excel 파일 선택</span>
              </label>
              {uploadStatus && (
                <span className="text-sm text-gray-600">{uploadStatus}</span>
              )}
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <p className="text-sm text-blue-800 mb-2"><strong>예시 Excel 파일 형식:</strong></p>
            <table className="min-w-full text-sm border-collapse border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-gray-300 px-2 py-1">기수</th>
                  <th className="border border-gray-300 px-2 py-1">성명</th>
                  <th className="border border-gray-300 px-2 py-1">소속</th>
                  <th className="border border-gray-300 px-2 py-1">직책</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-2 py-1">1</td>
                  <td className="border border-gray-300 px-2 py-1">홍길동</td>
                  <td className="border border-gray-300 px-2 py-1">서울대학교</td>
                  <td className="border border-gray-300 px-2 py-1">교수</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-2 py-1">1</td>
                  <td className="border border-gray-300 px-2 py-1">김영희</td>
                  <td className="border border-gray-300 px-2 py-1">고려대학교</td>
                  <td className="border border-gray-300 px-2 py-1">연구원</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 수료 원우 수정 폼 */}
        {editMode && editGraduate && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-8 border-2 border-blue-400">
            <h2 className="text-xl font-semibold mb-4">수료 원우 정보 수정</h2>
            <form onSubmit={handleSaveEdit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">기수</label>
                  <select
                    name="term"
                    value={editGraduate.term}
                    onChange={handleEditInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    {termOptions.map(term => (
                      <option key={term} value={term}>{term}기</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">성명 *</label>
                  <input
                    type="text"
                    name="name"
                    value={editGraduate.name}
                    onChange={handleEditInputChange}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">소속</label>
                  <input
                    type="text"
                    name="organization"
                    value={editGraduate.organization || ''}
                    onChange={handleEditInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">직책</label>
                  <input
                    type="text"
                    name="position"
                    value={editGraduate.position || ''}
                    onChange={handleEditInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isGraduated"
                    checked={editGraduate.isGraduated}
                    onChange={handleEditInputChange}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">수료 완료</span>
                </label>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  disabled={loading}
                >
                  {loading ? '처리 중...' : '저장'}
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                  disabled={loading}
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 수료 원우 목록 */}
        {loading && graduates.length === 0 ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
            <p className="mt-2 text-gray-600">수료 원우 데이터를 불러오는 중...</p>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-semibold mb-4">수료 원우 목록</h2>
            
            {Object.keys(graduatesByTerm).length === 0 ? (
              <p className="text-gray-500 text-center py-4">등록된 수료 원우가 없습니다.</p>
            ) : (
              Object.entries(graduatesByTerm)
                .sort(([termA], [termB]) => Number(termB) - Number(termA)) // 최신 기수가 먼저 오도록 정렬
                .map(([term, termGraduates]) => (
                  <div key={term} className="mb-8">
                    <h3 className="text-lg font-medium mb-3">{term}기 ({termGraduates.length}명)</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 border">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">성명</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">소속</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">직책</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">수료 상태</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">관리</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {termGraduates.map(graduate => (
                            <tr key={graduate._id}>
                              <td className="px-4 py-2 whitespace-nowrap">{graduate.name}</td>
                              <td className="px-4 py-2 whitespace-nowrap">{graduate.organization || '-'}</td>
                              <td className="px-4 py-2 whitespace-nowrap">{graduate.position || '-'}</td>
                              <td className="px-4 py-2 whitespace-nowrap">
                                <button
                                  onClick={() => handleToggleGraduated(graduate._id, graduate.isGraduated)}
                                  className={`px-2 py-1 rounded text-xs ${
                                    graduate.isGraduated 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-gray-100 text-gray-800'
                                  }`}
                                >
                                  {graduate.isGraduated ? '수료 완료' : '수료 전'}
                                </button>
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-right">
                                <div className="flex justify-end space-x-2">
                                  <button
                                    onClick={() => handleStartEdit(graduate)}
                                    className="text-blue-600 hover:text-blue-900"
                                  >
                                    수정
                                  </button>
                                  <button
                                    onClick={() => handleDeleteGraduate(graduate._id)}
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    삭제
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default GraduatesManage; 