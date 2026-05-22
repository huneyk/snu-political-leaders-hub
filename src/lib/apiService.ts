/**
 * API Service
 * 
 * This service handles all API calls to the backend server to fetch data from MongoDB.
 * It replaces the localStorage-based contentService in the production environment.
 */

import axios from 'axios';

// API 서버 URL 설정 - fallback 시스템 구현
const PRODUCTION_API = 'https://snu-plp-hub-server.onrender.com/api'; // 서버 로그에서 확인된 실제 작동 URL
const LOCALHOST_API = 'http://localhost:5001/api';

// 개발 환경에 따른 baseURL 설정
const baseURL = import.meta.env.MODE === 'production' 
  ? PRODUCTION_API 
  : LOCALHOST_API;

console.log('🔧 API 설정 정보:');
console.log('- 현재 모드:', import.meta.env.MODE);
console.log('- VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('- baseURL:', baseURL);

// API 요청 시 자동 fallback 처리하는 함수
const makeApiRequest = async <T>(
  endpoint: string, 
  options: any = {}
): Promise<T> => {
  // 개발 환경에서는 프록시 사용, production에서는 전체 URL 사용
  if (import.meta.env.MODE === 'development') {
    try {
      console.log(`🔗 Trying API (Dev Proxy): /api${endpoint}`);
      const response = await axios({
        ...options,
        url: `/api${endpoint}`,
        timeout: 15000,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...options.headers
        }
      });
      console.log(`✅ Success with dev proxy`);
      return response.data;
    } catch (error) {
      console.warn(`❌ Dev proxy failed:`, error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  } else {
    // Production 환경에서는 신뢰할 수 있는 URL만 사용
    const urls = [
      'https://snu-plp-hub-server.onrender.com/api', // 서버 로그에서 확인된 실제 작동 서버
    ];
    let lastError: any = null;

    for (const baseUrl of urls) {
      try {
        console.log(`🔗 Trying API: ${baseUrl}${endpoint}`);
        const response = await axios({
          ...options,
          url: `${baseUrl}${endpoint}`,
          timeout: 15000,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...options.headers
          }
        });
        
        console.log(`✅ Success with: ${baseUrl}`);
        console.log(`📊 Response status: ${response.status}`);
        console.log(`📊 Response data type: ${typeof response.data}`);
        console.log(`📊 Response data:`, response.data);
        
        // HTML 응답 감지 및 에러 처리
        if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
          console.error('❌ API가 HTML 페이지를 반환했습니다. 서버 라우팅 문제일 수 있습니다.');
          throw new Error('API returned HTML instead of JSON data');
        }
        
        return response.data;
      } catch (error) {
        console.warn(`❌ Failed with ${baseUrl}:`, error instanceof Error ? error.message : 'Unknown error');
        
        // 상세한 에러 정보 로깅
        if (axios.isAxiosError(error)) {
          console.error('🔍 makeApiRequest Axios 에러 세부정보:', {
            baseUrl,
            endpoint,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            headers: error.response?.headers,
            config: {
              url: error.config?.url,
              method: error.config?.method,
              baseURL: error.config?.baseURL,
              timeout: error.config?.timeout
            }
          });
          
          // HTML 응답 감지
          if (typeof error.response?.data === 'string' && error.response.data.includes('<!DOCTYPE html>')) {
            console.error('🚨 makeApiRequest: 서버가 HTML 페이지를 반환했습니다 - 라우팅 문제일 가능성');
          }
        }
        
        lastError = error;
        continue;
      }
    }

    console.error('🚨 All API endpoints failed');
    throw lastError;
  }
};

// API 요청 시 기본 헤더 설정
const apiConfig = {
  headers: {
    'Content-Type': 'application/json'
  }
};

// API 서비스 정의
export const apiService = {
  // 인사말(Greeting) 관련 API
  getGreeting: async () => {
    try {
      console.log('인사말 데이터 가져오기 시작');
      console.log('현재 환경:', import.meta.env.MODE);
      
      const data = await makeApiRequest('/greeting', {
        method: 'GET'
      });
      
      console.log('인사말 API 응답 데이터:', data);
      return data;
    } catch (error) {
      console.error('Error fetching greeting data:', error);
      if (axios.isAxiosError(error)) {
        console.error('Axios Error Details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message
        });
      }
      throw error;
    }
  },

  // 인사말 저장 API (관리자용)
  updateGreeting: async (greetingData: any, token?: string) => {
    console.log('인사말 데이터 저장 시작');
    console.log('토큰 존재 여부:', token ? '있음' : '없음');
    
    const headers: any = {
      'Content-Type': 'application/json',
    };
    
    // 토큰이 있으면 헤더에 추가 (선택사항)
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    try {
      let response;
      
      // _id 유무에 따라 요청 방식 분기
      if (greetingData._id && greetingData._id !== 'default-greeting-id' && greetingData._id !== 'error-greeting-id') {
        // ID가 있고 유효한 경우 PUT 요청
        console.log('PUT 요청으로 인사말 업데이트');
        // 이전: PUT /api/greeting/:id -> 수정: PUT /api/greeting
        response = await axios.put(`${baseURL}/greeting`, greetingData, {
          headers
        });
      } else {
        // ID가 없거나 유효하지 않은 경우 POST 요청
        console.log('POST 요청으로 새 인사말 생성');
        response = await axios.post(`${baseURL}/greeting`, greetingData, {
          headers
        });
      }
      
      console.log('서버 응답 성공:', response.status);
      return response.data;
    } catch (error) {
      console.error('인사말 저장 중 오류:', error);
      throw error;
    }
  },

  // 추천의 글 관련 API
  getRecommendations: async () => {
    try {
      console.log('▶️▶️▶️ getRecommendations 함수 호출 시작 ▶️▶️▶️');
      console.log('현재 환경:', import.meta.env.MODE);
      
      let data;
      
      // 먼저 /api/recommendations 경로로 시도
      try {
        console.log('🔄 첫 번째 경로 시도: /recommendations');
        const timestamp = Date.now();
        data = await makeApiRequest(`/recommendations?t=${timestamp}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        console.log('✅ 첫 번째 경로 성공 (/recommendations)');
      } catch (firstPathError) {
        console.warn('⚠️ 첫 번째 경로 실패:', firstPathError);
        console.warn('⚠️ 두 번째 경로 시도: /content/recommendations');
        
        // 첫 번째 경로 실패 시 두 번째 경로 시도
        const timestamp = Date.now();
        data = await makeApiRequest(`/content/recommendations?t=${timestamp}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        console.log('✅ 두 번째 경로 성공 (/content/recommendations)');
      }
      
      console.log('✅ 추천사 API 응답 성공');
      console.log('응답 데이터:', data);
      console.log('데이터 타입:', typeof data);
      console.log('데이터가 배열인가?', Array.isArray(data));
      
      if (Array.isArray(data)) {
        console.log('배열 길이:', data.length);
      }
      
      // 백업: 로컬스토리지에 최신 데이터 저장 (용량 최적화)
      try {
        // 기존 백업 데이터 정리
        localStorage.removeItem('recommendations_backup');
        localStorage.removeItem('recommendations_backup_time');
        
        // 데이터 압축 저장 (MongoDB 스키마에 맞는 필수 필드만)
        const compactData = Array.isArray(data) ? data.map(item => ({
          _id: item._id,
          sectionTitle: item.sectionTitle,
          title: item.title,
          name: item.name,
          position: item.position,
          content: item.content,
          imageUrl: item.imageUrl,
          order: item.order,
          isActive: item.isActive
        })) : data;
        
        localStorage.setItem('recommendations_backup', JSON.stringify(compactData));
        localStorage.setItem('recommendations_backup_time', Date.now().toString());
        console.log('추천사 데이터 로컬스토리지에 백업 완료');
      } catch (storageError) {
        console.warn('로컬스토리지 백업 실패:', storageError);
        // 용량 초과 시 기존 데이터 정리 후 재시도
        try {
          localStorage.clear();
          const compactData = Array.isArray(data) ? data.slice(0, 3) : data; // 최대 3개만 저장
          localStorage.setItem('recommendations_backup', JSON.stringify(compactData));
          console.log('로컬스토리지 정리 후 백업 완료');
        } catch (retryError) {
          console.warn('로컬스토리지 백업 재시도 실패:', retryError);
        }
      }
      
      return data;
    } catch (error) {
      console.error('❌❌❌ 추천사 데이터 가져오기 오류 ❌❌❌');
      console.error('Error fetching recommendations data:', error);
      
      if (axios.isAxiosError(error)) {
        console.error('🔍 Axios Error Details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message
        });
      }
      
      // 로컬스토리지에서 백업 데이터 시도
      try {
        const backup = localStorage.getItem('recommendations_backup');
        if (backup) {
          console.log('로컬스토리지에서 백업 데이터 복원 시도');
          return JSON.parse(backup);
        }
      } catch (storageError) {
        console.warn('로컬스토리지 복원 실패:', storageError);
      }
      
      throw error;
    }
  },

  // 추천사 데이터 검증 및 처리 헬퍼 함수
  validateAndProcessRecommendations: async (data: any) => {
    console.log('추천사 데이터 검증 시작:', data);
    
    // 배열이 아닌 경우 배열로 변환 시도
    let processedData = data;
    if (!Array.isArray(data)) {
      if (data && typeof data === 'object') {
        // 객체에 data 속성이 있는 경우
        if (data.data && Array.isArray(data.data)) {
          processedData = data.data;
        }
        // 객체에 recommendations 속성이 있는 경우
        else if (data.recommendations && Array.isArray(data.recommendations)) {
          processedData = data.recommendations;
        }
        // 단일 객체인 경우 배열로 감싸기
        else {
          processedData = [data];
        }
      } else {
        throw new Error('올바른 형식의 데이터가 아닙니다.');
      }
    }
    
    if (!Array.isArray(processedData)) {
      console.error('최종 데이터가 배열이 아님:', typeof processedData);
      throw new Error('올바른 형식의 데이터가 아닙니다.');
    }
    
    if (processedData.length === 0) {
      console.warn('추천사 데이터가 비어있음');
      return [];
    }
    
    // 데이터 구조 검증 및 정리
    const validatedData = processedData.filter((item: any) => {
      if (!item || typeof item !== 'object') {
        console.warn('유효하지 않은 추천사 항목:', item);
        return false;
      }
      
      // 필수 필드 확인
      const hasTitle = item.title && typeof item.title === 'string';
      const hasContent = (item.content || item.text) && typeof (item.content || item.text) === 'string';
      const hasName = item.name && typeof item.name === 'string';
      
      if (!hasTitle || !hasContent || !hasName) {
        console.warn('필수 필드가 누락된 추천사 항목:', item);
        return false;
      }
      
      return true;
    });
    
    console.log(`✅ 추천사 데이터 검증 완료: ${validatedData.length}개 항목`);
    
    // 백업 저장
    try {
      localStorage.setItem('recommendations_backup', JSON.stringify(validatedData));
      localStorage.setItem('recommendations_backup_time', Date.now().toString());
      console.log('추천사 데이터 로컬스토리지에 백업 완료');
    } catch (storageError) {
      console.warn('로컬스토리지 백업 실패:', storageError);
    }
    
    return validatedData;
  },

  // 목표(Objectives) 관련 API
  getObjectives: async () => {
    try {
      console.log('▶️▶️▶️ getObjectives 함수 호출 시작 ▶️▶️▶️');
      console.log('현재 환경:', import.meta.env.MODE);
      
      let data;
      
      // 먼저 /api/objectives 경로로 시도
      try {
        console.log('🔄 첫 번째 경로 시도: /objectives');
        data = await makeApiRequest('/objectives', {
          method: 'GET'
        });
        console.log('✅ 첫 번째 경로 성공 (/objectives)');
      } catch (firstPathError) {
        console.warn('⚠️ 첫 번째 경로 실패:', firstPathError);
        console.warn('⚠️ 두 번째 경로 시도: /content/objectives');
        
        // 첫 번째 경로 실패 시 두 번째 경로 시도
        data = await makeApiRequest('/content/objectives', {
          method: 'GET'
        });
        console.log('✅ 두 번째 경로 성공 (/content/objectives)');
      }
      
      console.log('===== 서버 응답 확인 =====');
      console.log('목표 API 응답 데이터:', data);
      console.log('데이터 타입:', typeof data);
      console.log('데이터가 배열인가?', Array.isArray(data));
      
      if (Array.isArray(data)) {
        console.log('배열 길이:', data.length);
        if (data.length > 0) {
          console.log('첫 번째 항목 샘플:', {
            _id: data[0]._id,
            title: data[0].title,
            description: data[0].description,
            sectionTitle: data[0].sectionTitle
          });
        }
      }
      
      // 백업: 로컬스토리지에 최신 데이터 저장 (용량 최적화)
      try {
        // 기존 백업 데이터 정리
        localStorage.removeItem('objectives_backup');
        localStorage.removeItem('objectives_backup_time');
        
        // 데이터 압축 저장 (필수 필드만)
        const compactData = Array.isArray(data) ? data.map(item => ({
          _id: item._id,
          title: item.title,
          description: item.description,
          sectionTitle: item.sectionTitle,
          isActive: item.isActive
        })) : data;
        
        localStorage.setItem('objectives_backup', JSON.stringify(compactData));
        localStorage.setItem('objectives_backup_time', Date.now().toString());
        console.log('목표 데이터 로컬스토리지에 백업 완료');
      } catch (storageError) {
        console.warn('로컬스토리지 백업 실패:', storageError);
        // 용량 초과 시 기존 데이터 정리 후 재시도
        try {
          const compactData = Array.isArray(data) ? data.slice(0, 5) : data; // 최대 5개만 저장
          localStorage.setItem('objectives_backup', JSON.stringify(compactData));
          console.log('로컬스토리지 정리 후 백업 완료');
        } catch (retryError) {
          console.warn('로컬스토리지 백업 재시도 실패:', retryError);
        }
      }
      
      return data;
    } catch (error) {
      console.error('❌❌❌ 목표 데이터 가져오기 오류 ❌❌❌');
      console.error('Error fetching objectives data:', error);
      
      if (axios.isAxiosError(error)) {
        console.error('🔍 Axios Error Details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message,
          request: error.request ? '요청이 전송됨' : '요청이 전송되지 않음',
          response: error.response ? '응답 수신됨' : '응답 수신되지 않음',
          config: error.config
        });
      }
      
      // 로컬스토리지에서 백업 데이터 시도
      try {
        const backup = localStorage.getItem('objectives_backup');
        if (backup) {
          console.log('로컬스토리지에서 백업 데이터 복원 시도');
          return JSON.parse(backup);
        }
      } catch (storageError) {
        console.warn('로컬스토리지 복원 실패:', storageError);
      }
      
      // 최종적으로 빈 배열 반환
      return [];
    }
  },

  // 목표 저장 API (관리자용)
  updateObjective: async (objectiveData: any, token?: string) => {
    try {
      let response;
      const headers: any = {
        'Content-Type': 'application/json',
      };
      
      // 토큰이 있으면 헤더에 추가
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      // ID가 있으면 PUT 요청으로 업데이트
      if (objectiveData._id) {
        console.log(`ID ${objectiveData._id}를 가진 목표 업데이트 시도 - PUT 사용`);
        response = await axios.put(
          `${baseURL}/objectives/${objectiveData._id}`, 
          objectiveData, 
          { headers }
        );
      } 
      // ID가 없으면 POST 요청으로 새로 생성
      else {
        console.log('새 목표 생성 시도 - POST 사용');
        response = await axios.post(
          `${baseURL}/objectives`, 
          objectiveData, 
          { headers }
        );
      }
      
      return response.data;
    } catch (error) {
      console.error('목표 저장 중 오류:', error);
      throw error;
    }
  },

  // 목표 삭제 API
  deleteObjective: async (id: string, token?: string) => {
    try {
      console.log(`ID ${id}를 가진 목표 삭제 시도`);
      const headers: any = {
        'Content-Type': 'application/json',
      };
      
      // 토큰이 있으면 헤더에 추가
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      const response = await axios.delete(`${baseURL}/objectives/${id}`, {
        headers
      });
      return response.data;
    } catch (error) {
      console.error('목표 삭제 중 오류:', error);
      throw error;
    }
  },

  // 혜택(Benefits) 관련 API
  getBenefits: async () => {
    try {
      console.log('Benefits API Request 시작');
      
      // 여러 API 경로를 시도
      let data;
      
      // 첫 번째 시도: /benefits
      try {
        console.log('첫 번째 경로 시도: /benefits');
        data = await makeApiRequest('/benefits', {
          method: 'GET'
        });
        console.log('첫 번째 경로 성공');
      } catch (err) {
        console.warn('첫 번째 경로 실패, 두 번째 경로 시도');
        
        // 두 번째 시도: /content/benefits
        try {
          console.log('두 번째 경로 시도: /content/benefits');
          data = await makeApiRequest('/content/benefits', {
            method: 'GET'
          });
          console.log('두 번째 경로 성공');
        } catch (err2) {
          console.error('두 번째 경로도 실패');
          throw err2;
        }
      }
      
      console.log('Benefits API 응답 데이터 타입:', typeof data);
      console.log('Benefits API 응답 데이터 길이:', Array.isArray(data) ? data.length : 'Not an array');
      
      return data;
    } catch (error) {
      console.error('특전 데이터 가져오기 오류:', error);
      
      if (axios.isAxiosError(error)) {
        console.error('Axios Error Details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        });
      }
      
      // 로컬 스토리지에서 백업 데이터 시도
      try {
        const backup = localStorage.getItem('benefits');
        if (backup) {
          console.log('로컬 스토리지에서 백업 데이터 복원 시도');
          return JSON.parse(backup);
        }
      } catch (storageError) {
        console.warn('로컬 스토리지 복원 실패:', storageError);
      }
      
      throw error;
    }
  },
  
  // 관리자용 모든 혜택 조회 API
  getBenefitsAll: async (token: string) => {
    try {
      console.log('관리자용 특전 데이터 조회 시작');
      
      const headers: any = {
        'Content-Type': 'application/json'
      };
      
      // 토큰이 있으면 헤더에 추가
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      const data = await makeApiRequest('/benefits', {
        method: 'GET',
        headers
      });
      
      console.log('전체 특전 데이터 조회 결과 성공');
      return data;
    } catch (error) {
      console.error('관리자용 특전 데이터 조회 실패:', error);
      throw error;
    }
  },
  
  // 특전 생성 API (관리자용)
  createBenefit: async (benefitData: any, token?: string) => {
    try {
      console.log('새 특전 생성 시작');
      console.log('요청 URL:', `${baseURL}/benefits`);
      
      const headers: any = {
        'Content-Type': 'application/json'
      };
      
      // 토큰이 있으면 헤더에 추가
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      const response = await axios.post(`${baseURL}/benefits`, benefitData, { headers });
      console.log('특전 생성 결과:', response.status);
      return response.data;
    } catch (error) {
      console.error('특전 생성 실패:', error);
      throw error;
    }
  },
  
  // 특전 업데이트 API (관리자용)
  updateBenefit: async (id: string, benefitData: any, token?: string) => {
    try {
      console.log(`ID ${id}를 가진 특전 업데이트 시작`);
      console.log('요청 URL:', `${baseURL}/benefits/${id}`);
      
      const headers: any = {
        'Content-Type': 'application/json'
      };
      
      // 토큰이 있으면 헤더에 추가
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      const response = await axios.put(`${baseURL}/benefits/${id}`, benefitData, { headers });
      console.log('특전 업데이트 결과:', response.status);
      return response.data;
    } catch (error) {
      console.error('특전 업데이트 실패:', error);
      throw error;
    }
  },
  
  // 특전 삭제 API (관리자용)
  deleteBenefit: async (id: string, token?: string) => {
    try {
      console.log(`ID ${id}를 가진 특전 삭제 시작`);
      console.log('요청 URL:', `${baseURL}/benefits/${id}`);
      
      const headers: any = {
        'Content-Type': 'application/json'
      };
      
      // 토큰이 있으면 헤더에 추가
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      const response = await axios.delete(`${baseURL}/benefits/${id}`, { headers });
      console.log('특전 삭제 결과:', response.status);
      return response.data;
    } catch (error) {
      console.error('특전 삭제 실패:', error);
      throw error;
    }
  },

  // 교수진(Professors) 관련 API
  getProfessors: async () => {
    try {
      console.log('▶️▶️▶️ getProfessors 함수 호출 시작 ▶️▶️▶️');
      console.log('현재 환경:', import.meta.env.MODE);
      
      let data;
      
      // 먼저 /api/professors 경로로 시도
      try {
        console.log('🔄 첫 번째 경로 시도: /professors');
        data = await makeApiRequest('/professors', {
          method: 'GET'
        });
        console.log('✅ 첫 번째 경로 성공 (/professors)');
      } catch (firstPathError) {
        console.warn('⚠️ 첫 번째 경로 실패:', firstPathError);
        console.warn('⚠️ 두 번째 경로 시도: /content/professors');
        
        // 첫 번째 경로 실패 시 두 번째 경로 시도
        data = await makeApiRequest('/content/professors', {
          method: 'GET'
        });
        console.log('✅ 두 번째 경로 성공 (/content/professors)');
      }
      
      console.log('===== 서버 응답 확인 =====');
      console.log('교수진 API 응답 데이터:', data);
      console.log('데이터 타입:', typeof data);
      console.log('데이터가 배열인가?', Array.isArray(data));
      
      if (Array.isArray(data)) {
        console.log('배열 길이:', data.length);
        if (data.length > 0) {
          console.log('첫 번째 항목 샘플:', {
            _id: data[0]._id,
            sectionTitle: data[0].sectionTitle,
            professors: data[0].professors?.length || 0
          });
        }
      }
      
      // 백업: 로컬스토리지에 최신 데이터 저장
      try {
        localStorage.setItem('professors-data', JSON.stringify(data));
        localStorage.setItem('professors-data-time', Date.now().toString());
        console.log('교수진 데이터 로컬스토리지에 백업 완료');
      } catch (storageError) {
        console.warn('로컬스토리지 백업 실패:', storageError);
      }
      
      return data;
    } catch (error) {
      console.error('❌❌❌ 교수진 데이터 가져오기 오류 ❌❌❌');
      console.error('Error fetching professors data:', error);
      
      if (axios.isAxiosError(error)) {
        console.error('🔍 Axios Error Details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message,
          request: error.request ? '요청이 전송됨' : '요청이 전송되지 않음',
          response: error.response ? '응답 수신됨' : '응답 수신되지 않음',
          config: error.config
        });
      }
      
      // 로컬스토리지에서 백업 데이터 시도
      try {
        const backup = localStorage.getItem('professors-data');
        if (backup) {
          console.log('로컬스토리지에서 백업 데이터 복원 시도');
          return JSON.parse(backup);
        }
      } catch (storageError) {
        console.warn('로컬스토리지 복원 실패:', storageError);
      }
      
      throw error;
    }
  },

  // 관리자용 교수진 전체 목록 조회 API
  getProfessorsAll: async (token?: string) => {
    try {
      console.log('관리자용 교수진 데이터 조회 시작');
      
      const headers: any = {
        'Content-Type': 'application/json'
      };
      
      // 테스트를 위해 인증 제거
      // if (token) {
      //   headers.Authorization = `Bearer ${token}`;
      // }
      
      const data = await makeApiRequest('/professors', {
        method: 'GET',
        headers
      });
      
      console.log('전체 교수진 데이터 조회 결과 성공');
      return data;
    } catch (error) {
      console.error('교수진 전체 데이터 조회 실패:', error);
      throw error;
    }
  },
  
  // 새 교수진 섹션 생성 API
  createProfessorSection: async (sectionData: any, token?: string) => {
    try {
      console.log('새 교수진 섹션 생성 시작');
      console.log('요청 URL:', `${baseURL}/professors`);
      
      const headers: any = {
        'Content-Type': 'application/json'
      };
      
      // 테스트를 위해 인증 제거
      // if (token) {
      //   headers.Authorization = `Bearer ${token}`;
      // }
      
      const response = await axios.post(`${baseURL}/professors`, sectionData, { headers });
      console.log('교수진 섹션 생성 결과:', response.status);
      return response.data;
    } catch (error) {
      console.error('교수진 섹션 생성 실패:', error);
      throw error;
    }
  },
  
  // 교수진 섹션 업데이트 API
  updateProfessorSection: async (sectionId: string, sectionData: any, token?: string) => {
    try {
      console.log(`ID ${sectionId}를 가진 교수진 섹션 업데이트 시작`);
      console.log('요청 URL:', `${baseURL}/professors/${sectionId}`);
      
      const headers: any = {
        'Content-Type': 'application/json'
      };
      
      // 테스트를 위해 인증 제거
      // if (token) {
      //   headers.Authorization = `Bearer ${token}`;
      // }
      
      const response = await axios.put(`${baseURL}/professors/${sectionId}`, sectionData, { headers });
      console.log('교수진 섹션 업데이트 결과:', response.status);
      return response.data;
    } catch (error) {
      console.error('교수진 섹션 업데이트 실패:', error);
      throw error;
    }
  },
  
  // 교수진 섹션 삭제 API
  deleteProfessorSection: async (sectionId: string, token?: string) => {
    try {
      console.log(`ID ${sectionId}를 가진 교수진 섹션 삭제 시작`);
      console.log('요청 URL:', `${baseURL}/professors/${sectionId}`);
      
      const headers: any = {
        'Content-Type': 'application/json'
      };
      
      // 테스트를 위해 인증 제거
      // if (token) {
      //   headers.Authorization = `Bearer ${token}`;
      // }
      
      const response = await axios.delete(`${baseURL}/professors/${sectionId}`, { headers });
      console.log('교수진 섹션 삭제 결과:', response.status);
      return response.data;
    } catch (error) {
      console.error('교수진 섹션 삭제 실패:', error);
      throw error;
    }
  },

  // 일정(Schedules) 관련 API
  getSchedules: async (category?: string) => {
    try {
      console.log('▶️▶️▶️ getSchedules 함수 호출 시작 ▶️▶️▶️');
      console.log('현재 환경:', import.meta.env.MODE);
      
      // 명시적인 헤더 설정
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };
      
      // 쿼리 파라미터 구성
      let queryParams = '';
      if (category) {
        queryParams = `?category=${category}`;
      }
      
      // 완전한 URL 경로 사용
      const apiUrl = import.meta.env.MODE === 'production' 
        ? `https://snu-plp-hub-server.onrender.com/api/schedules${queryParams}`
        : `http://localhost:5001/api/schedules${queryParams}`;
      
      console.log('요청 URL:', apiUrl);
      
      let response;
      
      // 첫 번째 시도: 직접 URL로 요청
      try {
        console.log('🔄 첫 번째 경로로 서버에 요청 전송 시작:', apiUrl);
        const config = {
          headers,
          withCredentials: false
        };
        
        response = await axios.get(apiUrl, config);
        console.log('✅ 첫 번째 경로 성공');
      } catch (firstPathError) {
        console.warn('⚠️ 첫 번째 경로 실패:', firstPathError);
        console.warn('⚠️ 두 번째 경로 시도: /api/content/schedules');
        
        // 두 번째 시도: content 경로
        try {
          const config = {
            headers,
            withCredentials: false
          };
          
          const contentUrl = `${baseURL}/content/schedules${queryParams}`;
          console.log('요청 URL (두 번째 시도):', contentUrl);
          
          response = await axios.get(contentUrl, config);
          console.log('✅ 두 번째 경로 성공');
        } catch (secondPathError) {
          console.error('❌ 모든 API 경로 시도 실패');
          throw secondPathError;
        }
      }
      
      console.log('===== 서버 응답 확인 =====');
      console.log('일정 API 응답 상태:', response.status);
      console.log('일정 API 응답 데이터 타입:', typeof response.data);
      
      // 데이터 유효성 검사
      if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
        console.error('❌ API가 HTML을 반환했습니다. 서버 설정 문제가 있습니다.');
        throw new Error('API returned HTML instead of JSON data');
      }
      
      if (Array.isArray(response.data)) {
        console.log('배열 길이:', response.data.length);
        if (response.data.length > 0) {
          console.log('첫 번째 항목 샘플:', {
            _id: response.data[0]._id,
            title: response.data[0].title,
            date: response.data[0].date,
            category: response.data[0].category
          });
        }
        
        // 백업: 로컬스토리지에 최신 데이터 저장
        try {
          const storageKey = category ? `schedules-${category}` : 'schedules-all';
          localStorage.setItem(storageKey, JSON.stringify(response.data));
          localStorage.setItem(`${storageKey}-time`, Date.now().toString());
          console.log('일정 데이터 로컬스토리지에 백업 완료 (키:', storageKey, ')');
        } catch (storageError) {
          console.warn('로컬스토리지 백업 실패:', storageError);
        }
        
      return response.data;
      } else {
        console.error('❌ API 응답이 배열이 아닙니다:', response.data);
        throw new Error('API did not return an array of schedules');
      }
    } catch (error) {
      console.error('❌❌❌ 일정 데이터 가져오기 오류 ❌❌❌');
      console.error('Error fetching schedules data:', error);
      
      if (axios.isAxiosError(error)) {
        console.error('🔍 Axios Error Details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: typeof error.response?.data === 'string' && error.response?.data.includes('<!DOCTYPE html>') 
            ? 'HTML 페이지가 반환됨 (서버 설정 문제)' 
            : error.response?.data,
          message: error.message,
          request: error.request ? '요청이 전송됨' : '요청이 전송되지 않음',
          response: error.response ? '응답 수신됨' : '응답 수신되지 않음',
          config: {
            url: error.config?.url,
            method: error.config?.method,
            headers: error.config?.headers
          }
        });
      }
      
      // 로컬스토리지에서 백업 데이터 시도
      try {
        console.log('💾 로컬스토리지에서 백업 데이터 복원 시도');
        const storageKey = category ? `schedules-${category}` : 'schedules-all';
        const backup = localStorage.getItem(storageKey);
        
        if (backup) {
          const parsedData = JSON.parse(backup);
          console.log(`로컬스토리지에서 ${parsedData.length}개의 일정 데이터 복원됨`);
          return parsedData;
        }
      } catch (storageError) {
        console.warn('로컬스토리지 복원 실패:', storageError);
      }
      
      // 최종적으로 빈 배열 반환
      console.log('빈 배열 반환');
      return [];
    }
  },

  // 관리자용 모든 일정 조회 API
  getSchedulesAll: async (token?: string) => {
    try {
      console.log('▶️▶️▶️ getSchedulesAll 함수 호출 시작 ▶️▶️▶️');
      console.log('현재 환경:', import.meta.env.MODE);
      
      // 완전한 URL 경로 사용
      const apiUrl = import.meta.env.MODE === 'production' 
        ? 'https://snu-plp-hub-server.onrender.com/api/schedules/all'
        : 'http://localhost:5001/api/schedules/all';
      
      console.log('요청 URL:', apiUrl);
      
      // 명시적인 헤더 설정
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };
      
      // 토큰이 있으면 헤더에 추가
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // API 요청 시도
      console.log('🔄 서버에 일정 데이터 요청 전송');
      
      try {
        // 첫 번째 시도 - 기본 URL로 요청
        const config = {
          headers,
          withCredentials: false,
          timeout: 10000 // 10초 타임아웃
        };
        
        const response = await axios.get(apiUrl, config);
        console.log('✅ 일정 데이터 요청 성공');
        
        // 데이터 유효성 검사
        if (Array.isArray(response.data)) {
          console.log(`총 ${response.data.length}개의 일정 로드됨`);
          
          // 백업: 로컬스토리지에 최신 데이터 저장
          try {
            localStorage.setItem('admin-schedules-all', JSON.stringify(response.data));
            localStorage.setItem('admin-schedules-all-time', Date.now().toString());
            console.log('일정 데이터 로컬스토리지에 백업 완료');
          } catch (storageError) {
            console.warn('로컬스토리지 백업 실패:', storageError);
          }
          
          return response.data;
        } else {
          console.error('API 응답이 배열이 아닙니다:', response.data);
          throw new Error('API did not return an array of schedules');
        }
      } catch (error) {
        // 첫 번째 시도 실패 시 다른 경로로 시도
        console.warn('⚠️ 첫 번째 경로 실패, 대체 경로 시도');
        
        try {
          // 대체 URL - /api/schedules/all 경로 시도
          const altUrl = import.meta.env.MODE === 'production' 
            ? 'https://snu-plp-hub-server.onrender.com/api/schedules/all'
            : 'http://localhost:5001/api/schedules/all';
          
          console.log('🔄 대체 URL로 다시 시도:', altUrl);
          
          const config = {
        headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            withCredentials: false,
            timeout: 10000
          };
          
          const response = await axios.get(altUrl, config);
          console.log('✅ 대체 경로 요청 성공');
          
          // 데이터 유효성 검사
          if (Array.isArray(response.data)) {
            console.log(`총 ${response.data.length}개의 일정 로드됨 (대체 경로)`);
            
            // 백업: 로컬스토리지에 최신 데이터 저장
            try {
              localStorage.setItem('admin-schedules-all', JSON.stringify(response.data));
              localStorage.setItem('admin-schedules-all-time', Date.now().toString());
              console.log('일정 데이터 로컬스토리지에 백업 완료 (대체 경로)');
            } catch (storageError) {
              console.warn('로컬스토리지 백업 실패:', storageError);
            }
            
      return response.data;
          } else {
            throw new Error('Alternative path API did not return an array');
          }
        } catch (altError) {
          console.error('❌ 모든 API 경로 시도 실패');
          throw altError;
        }
      }
    } catch (error) {
      console.error('❌❌❌ 일정 데이터 가져오기 오류 ❌❌❌');
      console.error('Error fetching schedules data:', error);
      
      if (axios.isAxiosError(error)) {
        console.error('🔍 API 오류 세부정보:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message
        });
      }
      
      // 로컬스토리지에서 백업 데이터 시도
      try {
        console.log('💾 로컬스토리지에서 백업 데이터 복원 시도');
        const backup = localStorage.getItem('admin-schedules-all');
        
        if (backup) {
          const parsedData = JSON.parse(backup);
          const backupTime = localStorage.getItem('admin-schedules-all-time');
          
          if (backupTime) {
            const time = new Date(parseInt(backupTime));
            console.log(`백업 데이터 시간: ${time.toLocaleString()}`);
            
            // 백업 데이터가 24시간 이상 지난 경우 경고
            const now = new Date();
            const hoursDiff = (now.getTime() - time.getTime()) / (1000 * 60 * 60);
            if (hoursDiff > 24) {
              console.warn(`⚠️ 백업 데이터가 ${Math.floor(hoursDiff)}시간 전의 데이터입니다`);
            }
          }
          
          console.log(`로컬스토리지에서 ${parsedData.length}개의 일정 데이터 복원됨`);
          return parsedData;
        }
      } catch (storageError) {
        console.warn('로컬스토리지 복원 실패:', storageError);
      }
      
      // 데이터가 없으면 빈 배열 반환
      console.log('빈 배열 반환');
      return [];
    }
  },

  // 기수별 일정 조회 API
  getSchedulesByTerm: async (termNumber: string) => {
    try {
      console.log(`기수별 일정 조회 시작: ${termNumber}기`);
      
      const apiUrl = import.meta.env.MODE === 'production' 
        ? `https://snu-plp-hub-server.onrender.com/api/schedules/term/${termNumber}`
        : `http://localhost:5001/api/schedules/term/${termNumber}`;
      
      console.log('요청 URL:', apiUrl);
      console.log('현재 환경:', import.meta.env.MODE);
      
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        withCredentials: false,
        timeout: 10000
      };
      
      console.log('요청 설정:', config);
      
      const response = await axios.get(apiUrl, config);
      console.log(`API 응답 상태:`, response.status);
      console.log(`API 응답 헤더:`, response.headers);
      console.log(`${termNumber}기 일정 조회 성공:`, response.data);
      console.log(`응답 데이터 타입:`, typeof response.data);
      console.log(`응답이 배열인가?:`, Array.isArray(response.data));
      console.log(`응답 데이터 길이:`, response.data?.length);
      
      if (Array.isArray(response.data) && response.data.length > 0) {
        console.log(`첫 번째 일정 샘플:`, response.data[0]);
      }
      
      return response.data;
    } catch (error) {
      console.error(`${termNumber}기 일정 조회 실패:`, error);
      
      if (axios.isAxiosError(error)) {
        console.error('Axios 에러 세부정보:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message,
          config: {
            url: error.config?.url,
            method: error.config?.method
          }
        });
      }
      
      throw error;
    }
  },

  // 일정 생성 API
  createSchedule: async (scheduleData: any, token: string) => {
    try {
      console.log('▶️▶️▶️ createSchedule 함수 호출 시작 ▶️▶️▶️');
      console.log('새 일정 생성 시작:', scheduleData.title);
      
      // 완전한 URL 경로 사용
      const apiUrl = import.meta.env.MODE === 'production' 
        ? 'https://snu-plp-hub-server.onrender.com/api/schedules'
        : 'http://localhost:5001/api/schedules';
      
      console.log('요청 URL:', apiUrl);
      
      // 헤더 설정
      const headers = {
          'Content-Type': 'application/json',
        'Accept': 'application/json'
      };
      
      // 토큰이 있으면 헤더에 추가
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        console.warn('⚠️ 토큰이 없습니다. 인증이 필요한 API에 접근할 수 없을 수 있습니다.');
      }
      
      const response = await axios.post(apiUrl, scheduleData, {
        headers
      });
      
      console.log('일정 생성 결과:', response.status);
      console.log('생성된 일정 ID:', response.data._id);
      
      return response.data;
    } catch (error) {
      console.error('❌❌❌ 일정 생성 오류 ❌❌❌');
      console.error('Error creating schedule:', error);
      
      if (axios.isAxiosError(error)) {
        console.error('🔍 Axios Error Details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message
        });
      }
      
      throw error;
    }
  },

  // 일정 수정 API
  updateSchedule: async (id: string, data: any, token?: string) => {
    try {
      console.log('▶️▶️▶️ updateSchedule 함수 호출 시작 ▶️▶️▶️');
      console.log('수정할 일정 ID:', id);
      console.log('수정할 데이터:', data);
      
      // 완전한 URL 경로 사용
      const apiUrl = import.meta.env.MODE === 'production' 
        ? `https://snu-plp-hub-server.onrender.com/api/schedules/${id}`
        : `http://localhost:5001/api/schedules/${id}`;
      
      console.log('요청 URL:', apiUrl);
      
      // 명시적인 헤더 설정
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };
      
      // 토큰이 있으면 헤더에 추가
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // API 요청 시도
      console.log('🔄 서버에 일정 수정 요청 전송');
      
      try {
        // 첫 번째 시도 - 기본 URL로 요청
        const config = {
          headers,
          withCredentials: false,
          timeout: 10000 // 10초 타임아웃
        };
        
        const response = await axios.put(apiUrl, data, config);
        console.log('✅ 일정 수정 요청 성공');
        
        // 백업: 로컬스토리지에 최신 데이터 저장
        try {
          localStorage.setItem('admin-schedules-all', JSON.stringify(response.data));
          localStorage.setItem('admin-schedules-all-time', Date.now().toString());
          console.log('일정 데이터 로컬스토리지에 백업 완료');
        } catch (storageError) {
          console.warn('로컬스토리지 백업 실패:', storageError);
        }
        
        return response.data;
      } catch (error) {
        // 첫 번째 시도 실패 시 다른 경로로 시도
        console.warn('⚠️ 첫 번째 경로 실패, 대체 경로 시도');
        
        try {
          // 대체 URL - /api/schedules/:id 경로 시도
          const altUrl = import.meta.env.MODE === 'production' 
            ? `https://snu-plp-hub-server.onrender.com/api/schedules/${id}`
            : `http://localhost:5001/api/schedules/${id}`;
          
          console.log('🔄 대체 URL로 다시 시도:', altUrl);
          
          const config = {
        headers: {
          'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            withCredentials: false,
            timeout: 10000
          };
          
          const response = await axios.put(altUrl, data, config);
          console.log('✅ 대체 경로 요청 성공');
          
          // 백업: 로컬스토리지에 최신 데이터 저장
          try {
            localStorage.setItem('admin-schedules-all', JSON.stringify(response.data));
            localStorage.setItem('admin-schedules-all-time', Date.now().toString());
            console.log('일정 데이터 로컬스토리지에 백업 완료 (대체 경로)');
          } catch (storageError) {
            console.warn('로컬스토리지 백업 실패:', storageError);
          }
          
      return response.data;
        } catch (altError) {
          console.error('❌ 모든 API 경로 시도 실패');
          throw altError;
        }
      }
    } catch (error) {
      console.error('❌❌❌ 일정 수정 실패 ❌❌❌');
      console.error('Error updating schedule:', error);
      
      if (axios.isAxiosError(error)) {
        console.error('🔍 API 오류 세부정보:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message
        });
      }
      
      throw error;
    }
  },

  // 일정 삭제 API
  deleteSchedule: async (id: string, token?: string) => {
    try {
      console.log('▶️▶️▶️ deleteSchedule 함수 호출 시작 ▶️▶️▶️');
      console.log('삭제할 일정 ID:', id);
      
      // 완전한 URL 경로 사용
      const apiUrl = import.meta.env.MODE === 'production' 
        ? `https://snu-plp-hub-server.onrender.com/api/schedules/${id}`
        : `http://localhost:5001/api/schedules/${id}`;
      
      console.log('요청 URL:', apiUrl);
      
      // 명시적인 헤더 설정
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };
      
      // 토큰이 있으면 헤더에 추가
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // API 요청 시도
      console.log('🔄 서버에 일정 삭제 요청 전송');
      
      try {
        // 첫 번째 시도 - 기본 URL로 요청
        const config = {
          headers,
          withCredentials: false,
          timeout: 10000 // 10초 타임아웃
        };
        
        const response = await axios.delete(apiUrl, config);
        console.log('✅ 일정 삭제 요청 성공');
        
        // 백업: 로컬스토리지에서 해당 일정 제거
        try {
          const savedData = localStorage.getItem('admin-schedules-all');
          if (savedData) {
            const schedules = JSON.parse(savedData);
            const updatedSchedules = schedules.filter((schedule: any) => schedule._id !== id);
            localStorage.setItem('admin-schedules-all', JSON.stringify(updatedSchedules));
            localStorage.setItem('admin-schedules-all-time', Date.now().toString());
            console.log('로컬스토리지에서 일정 삭제 완료');
          }
        } catch (storageError) {
          console.warn('로컬스토리지 업데이트 실패:', storageError);
        }
        
        return response.data;
      } catch (error) {
        // 첫 번째 시도 실패 시 다른 경로로 시도
        console.warn('⚠️ 첫 번째 경로 실패, 대체 경로 시도');
        
        try {
          // 대체 URL - /api/schedules/:id 경로 시도
          const altUrl = import.meta.env.MODE === 'production' 
            ? `https://snu-plp-hub-server.onrender.com/api/schedules/${id}`
            : `http://localhost:5001/api/schedules/${id}`;
          
          console.log('🔄 대체 URL로 다시 시도:', altUrl);
          
          const config = {
        headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            withCredentials: false,
            timeout: 10000
          };
          
          const response = await axios.delete(altUrl, config);
          console.log('✅ 대체 경로 요청 성공');
          
          // 백업: 로컬스토리지에서 해당 일정 제거
          try {
            const savedData = localStorage.getItem('admin-schedules-all');
            if (savedData) {
              const schedules = JSON.parse(savedData);
              const updatedSchedules = schedules.filter((schedule: any) => schedule._id !== id);
              localStorage.setItem('admin-schedules-all', JSON.stringify(updatedSchedules));
              localStorage.setItem('admin-schedules-all-time', Date.now().toString());
              console.log('로컬스토리지에서 일정 삭제 완료 (대체 경로)');
            }
          } catch (storageError) {
            console.warn('로컬스토리지 업데이트 실패:', storageError);
          }
          
      return response.data;
        } catch (altError) {
          console.error('❌ 모든 API 경로 시도 실패');
          throw altError;
        }
      }
    } catch (error) {
      console.error('❌❌❌ 일정 삭제 실패 ❌❌❌');
      console.error('Error deleting schedule:', error);
      
      if (axios.isAxiosError(error)) {
        console.error('🔍 API 오류 세부정보:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message
        });
      }
      
      throw error;
    }
  },

  // 강사진(Lecturers) 관련 API
  getLecturers: async () => {
    try {
      console.log('▶️▶️▶️ getLecturers 함수 호출 시작 ▶️▶️▶️');
      console.log('현재 환경:', import.meta.env.MODE);
      
      // /lecturers 엔드포인트 사용
      console.log('🔄 /lecturers 경로로 요청');
      const data = await makeApiRequest('/lecturers', {
        method: 'GET'
      });
      console.log('✅ 강사진 데이터 요청 성공');
      
      console.log('===== 서버 응답 확인 =====');
      console.log('강사진 API 응답 데이터 타입:', typeof data);
      
      // 데이터 유효성 검사: HTML이 반환된 경우
      if (typeof data === 'string' && data.includes('<!DOCTYPE html>')) {
        console.error('❌ API가 HTML을 반환했습니다. 서버 설정 문제가 있습니다.');
        throw new Error('API returned HTML instead of JSON data');
      }
      
      if (Array.isArray(data)) {
        console.log('배열 길이:', data.length);
        if (data.length > 0) {
          console.log('첫 번째 항목 샘플:', {
            _id: data[0]._id,
            name: data[0].name,
            term: data[0].term,
            category: data[0].category
          });
        }
        
        // 백업: 로컬스토리지에 최신 데이터 저장
        try {
          localStorage.setItem('lecturers-data', JSON.stringify(data));
          localStorage.setItem('lecturers-data-time', Date.now().toString());
          console.log('강사진 데이터 로컬스토리지에 백업 완료');
        } catch (storageError) {
          console.warn('로컬스토리지 백업 실패:', storageError);
        }
        
      return data;
      } else {
        console.error('❌ API 응답이 배열이 아닙니다:', data);
        throw new Error('API did not return an array of lecturers');
      }
    } catch (error) {
      console.error('❌❌❌ 강사진 데이터 가져오기 오류 ❌❌❌');
      console.error('Error fetching lecturers data:', error);
      
      if (axios.isAxiosError(error)) {
        console.error('🔍 Axios Error Details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: typeof error.response?.data === 'string' && error.response?.data.includes('<!DOCTYPE html>') 
            ? 'HTML 페이지가 반환됨 (서버 설정 문제)' 
            : error.response?.data,
          message: error.message,
          request: error.request ? '요청이 전송됨' : '요청이 전송되지 않음',
          response: error.response ? '응답 수신됨' : '응답 수신되지 않음',
          config: {
            url: error.config?.url,
            method: error.config?.method,
            headers: error.config?.headers
          }
        });
      }
      
      // 로컬스토리지에서 백업 데이터 시도
      try {
        console.log('💾 로컬스토리지에서 백업 데이터 복원 시도');
        const backup = localStorage.getItem('lecturers-data');
        if (backup) {
          const parsedData = JSON.parse(backup);
          console.log(`로컬스토리지에서 ${parsedData.length}명의 강사 데이터 복원됨`);
          return parsedData;
        }
      } catch (storageError) {
        console.warn('로컬스토리지 복원 실패:', storageError);
      }
      
      // 최종적으로 빈 배열 반환
      console.log('빈 배열 반환');
      return [];
    }
  },

  // 관리자용 모든 강사진 조회 API
  getLecturersAll: async (token?: string) => {
    try {
      console.log('관리자용 모든 강사진 데이터 조회 시작');
      
      const headers: any = {
        'Content-Type': 'application/json'
      };
      
      // 토큰이 있으면 헤더에 추가
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      // /lecturers 엔드포인트 사용 (일반 페이지와 동일한 엔드포인트)
      const data = await makeApiRequest('/lecturers', {
        method: 'GET',
        headers
      });
      
      console.log('전체 강사진 데이터 조회 결과 성공');
      console.log('조회된 강사 수:', Array.isArray(data) ? data.length : 0);
      
      return data;
    } catch (error) {
      console.error('관리자용 강사진 데이터 조회 실패:', error);
      
      // 로컬 스토리지에서 백업 데이터 시도
      try {
        const backup = localStorage.getItem('lecturers-data');
        if (backup) {
          console.log('로컬 스토리지에서 강사진 백업 데이터 복원 시도');
          return JSON.parse(backup);
        }
      } catch (storageError) {
        console.warn('로컬 스토리지 복원 실패:', storageError);
      }
      
      throw error;
    }
  },

  // 갤러리(Gallery) 관련 API
  getGallery: async () => {
    try {
      // 환경 정보 로깅
      console.log('🌐 현재 환경:', import.meta.env.MODE);
      console.log('🔗 API URL:', import.meta.env.MODE === 'production' 
        ? 'https://snu-plp-hub-server.onrender.com/api' 
        : 'http://localhost:5001/api');
      console.log('🔄 갤러리 데이터 가져오기 시도');
      
      const data = await makeApiRequest('/gallery', {
        method: 'GET'
      });
      console.log('✅ 갤러리 데이터 응답 성공:', data);
      return data;
    } catch (error) {
      console.error('❌ 갤러리 데이터 가져오기 실패:', error);
      
      // Axios 에러 세부 정보
      if (axios.isAxiosError(error)) {
        console.error('🔍 Axios 에러 세부정보:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          headers: error.response?.headers,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            baseURL: error.config?.baseURL,
            timeout: error.config?.timeout
          }
        });
        
        // HTML 응답 감지
        if (typeof error.response?.data === 'string' && error.response.data.includes('<!DOCTYPE html>')) {
          console.error('🚨 서버가 HTML 페이지를 반환했습니다 - 라우팅 문제일 가능성');
        }
      }
      
      throw error;
    }
  },

  // 갤러리 헬스체크 - 데이터베이스 연결 및 데이터 상태 확인
  getGalleryHealth: async () => {
    try {
      console.log('🏥 갤러리 헬스체크 요청');
      const data = await makeApiRequest('/gallery/health', {
        method: 'GET'
      });
      console.log('✅ 갤러리 헬스체크 응답:', data);
      return data;
    } catch (error) {
      console.error('❌ 갤러리 헬스체크 실패:', error);
      throw error;
    }
  },

  // 갤러리 썸네일 목록 조회 (메인 갤러리 페이지용)
  getGalleryThumbnails: async () => {
    try {
      console.log('🖼️ 갤러리 썸네일 목록 조회 요청');
      const data = await makeApiRequest('/gallery/thumbnails', {
        method: 'GET'
      });
      console.log('✅ 갤러리 썸네일 목록 응답:', {
        isArray: Array.isArray(data),
        length: Array.isArray(data) ? data.length : 'N/A',
        thumbnails: data
      });
      return data;
    } catch (error) {
      console.error('❌ 갤러리 썸네일 목록 조회 실패:', error);
      throw error;
    }
  },

  // 모든 기수의 썸네일 생성/업데이트 (관리자 전용)
  generateAllGalleryThumbnails: async (token?: string) => {
    try {
      console.log('🖼️ 전체 갤러리 썸네일 생성 요청 (관리자)');
      const headers: any = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      const data = await makeApiRequest('/gallery/thumbnails/generate', {
        method: 'POST',
        headers
      });
      
      console.log('✅ 전체 갤러리 썸네일 생성 응답:', data);
      return data;
    } catch (error) {
      console.error('❌ 전체 갤러리 썸네일 생성 실패:', error);
      throw error;
    }
  },

  // 특정 기수의 썸네일 생성/업데이트 (관리자 전용)
  generateGalleryThumbnailByTerm: async (term: string, token?: string) => {
    try {
      console.log(`🖼️ 제${term}기 갤러리 썸네일 생성 요청 (관리자)`);
      const headers: any = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      const data = await makeApiRequest(`/gallery/thumbnails/generate/${term}`, {
        method: 'POST',
        headers
      });
      
      console.log(`✅ 제${term}기 갤러리 썸네일 생성 응답:`, data);
      return data;
    } catch (error) {
      console.error(`❌ 제${term}기 갤러리 썸네일 생성 실패:`, error);
      throw error;
    }
  },

  // 유효한 기수 목록 가져오기
  getValidTerms: async () => {
    try {
      console.log('🔍 유효한 기수 목록 조회 시도');
      const data = await makeApiRequest('/gallery/valid-terms', {
        method: 'GET'
      });
      console.log('✅ 유효한 기수 목록 응답:', data);
      return data;
    } catch (error) {
      console.error('❌ 유효한 기수 목록 조회 실패:', error);
      throw error;
    }
  },

  // 특정 기수의 갤러리 데이터 가져오기
  getGalleryByTerm: async (term: string) => {
    try {
      console.log(`🎯 제${term}기 갤러리 데이터 조회 시도`);
      console.log(`📍 현재 환경: ${import.meta.env.MODE}`);
      console.log(`📍 요청 URL: /gallery?term=${term}`);
      
      const data = await makeApiRequest(`/gallery?term=${term}`, {
        method: 'GET'
      });
      
      console.log(`✅ 제${term}기 갤러리 데이터 응답:`, {
        isArray: Array.isArray(data),
        length: Array.isArray(data) ? data.length : 'N/A',
        firstItem: Array.isArray(data) && data.length > 0 ? data[0] : 'N/A',
        termDistribution: Array.isArray(data) ? data.reduce((acc, item) => {
          const itemTerm = item.term;
          acc[itemTerm] = (acc[itemTerm] || 0) + 1;
          return acc;
        }, {}) : 'N/A'
      });
      
      return data;
    } catch (error) {
      console.error(`❌ 제${term}기 갤러리 데이터 조회 실패:`, error);
      throw error;
    }
  },

  // 특정 기수의 갤러리 메타데이터만 가져오기 (이미지 URL 제외)
  getGalleryMetaByTerm: async (term: string) => {
    try {
      console.log(`📋 제${term}기 갤러리 메타데이터 조회 시도`);
      console.log(`📍 현재 환경: ${import.meta.env.MODE}`);
      console.log(`📍 요청 URL: /gallery?term=${term}&meta_only=true`);
      
      const data = await makeApiRequest(`/gallery?term=${term}&meta_only=true`, {
        method: 'GET'
      });
      
      console.log(`✅ 제${term}기 갤러리 메타데이터 응답:`, {
        isArray: Array.isArray(data),
        length: Array.isArray(data) ? data.length : 'N/A',
        termDistribution: Array.isArray(data) ? data.reduce((acc, item) => {
          const itemTerm = item.term;
          acc[itemTerm] = (acc[itemTerm] || 0) + 1;
          return acc;
        }, {}) : 'N/A'
      });
      
      return data;
    } catch (error) {
      console.error(`❌ 제${term}기 갤러리 메타데이터 조회 실패:`, error);
      throw error;
    }
  },

  // 갤러리 항목 추가
  addGalleryItem: async (galleryData: any, token?: string) => {
    try {
      console.log('새 갤러리 항목 추가 시작');
      console.log('🔗 현재 환경:', import.meta.env.MODE);
      console.log('🔗 토큰 존재 여부:', !!token);
      
      const headers: any = {
        'Content-Type': 'application/json'
      };
      
      // 토큰이 있으면 Authorization 헤더에 추가
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      } else {
        console.warn('⚠️ 갤러리 항목 추가: 인증 토큰이 없습니다!');
      }
      
      // 개발 환경에서는 프록시를 사용하고, 프로덕션에서는 전체 URL 사용
      const apiUrl = import.meta.env.MODE === 'development' 
        ? '/api/gallery' 
        : `${baseURL}/gallery`;
      
      console.log('🔗 API 요청 URL:', apiUrl);
      
      const response = await axios.post(apiUrl, galleryData, {
        headers,
        withCredentials: true,
        timeout: 60000 // 대용량 이미지를 위해 타임아웃 60초로 설정
      });
      
      console.log('갤러리 항목 추가 성공:', response.status);
      return response.data;
    } catch (error) {
      console.error('갤러리 항목 추가 실패:', error);
      if (axios.isAxiosError(error)) {
        console.error('API 오류 세부정보:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message
        });
      }
      throw error;
    }
  },

  // 갤러리 항목 수정
  updateGalleryItem: async (id: string, galleryData: any, token?: string) => {
    try {
      console.log(`갤러리 항목 수정 시작 (ID: ${id})`);
      console.log('🔗 현재 환경:', import.meta.env.MODE);
      console.log('🔗 토큰 존재 여부:', !!token);
      
      const headers: any = {
        'Content-Type': 'application/json'
      };
      
      // 토큰이 있으면 Authorization 헤더에 추가
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      } else {
        console.warn('⚠️ 갤러리 항목 수정: 인증 토큰이 없습니다!');
      }
      
      // 개발 환경에서는 프록시를 사용하고, 프로덕션에서는 전체 URL 사용
      const apiUrl = import.meta.env.MODE === 'development' 
        ? `/api/gallery/${id}` 
        : `${baseURL}/gallery/${id}`;
      
      console.log('🔗 API 요청 URL:', apiUrl);
      
      const response = await axios.put(apiUrl, galleryData, {
        headers,
        withCredentials: true,
        timeout: 60000 // 대용량 이미지를 위해 타임아웃 60초로 설정
      });
      
      console.log('갤러리 항목 수정 성공:', response.status);
      return response.data;
    } catch (error) {
      console.error(`갤러리 항목 수정 실패 (ID: ${id}):`, error);
      if (axios.isAxiosError(error)) {
        console.error('API 오류 세부정보:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message
        });
      }
      throw error;
    }
  },
  
  // 갤러리 항목 삭제
  deleteGalleryItem: async (id: string, token?: string) => {
    try {
      console.log(`갤러리 항목 삭제 시작 (ID: ${id})`);
      console.log('🔗 현재 환경:', import.meta.env.MODE);
      console.log('🔗 토큰 존재 여부:', !!token);
      
      const headers: any = {
        'Content-Type': 'application/json'
      };
      
      // 토큰이 있으면 Authorization 헤더에 추가
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      } else {
        console.warn('⚠️ 갤러리 항목 삭제: 인증 토큰이 없습니다!');
      }
      
      // 개발 환경에서는 프록시를 사용하고, 프로덕션에서는 전체 URL 사용
      const apiUrl = import.meta.env.MODE === 'development' 
        ? `/api/gallery/${id}` 
        : `${baseURL}/gallery/${id}`;
      
      console.log('🔗 API 요청 URL:', apiUrl);
      
      const response = await axios.delete(apiUrl, {
        headers,
        withCredentials: true
      });
      
      console.log('갤러리 항목 삭제 성공:', response.status);
      return response.data;
    } catch (error) {
      console.error(`갤러리 항목 삭제 실패 (ID: ${id}):`, error);
      if (axios.isAxiosError(error)) {
        console.error('API 오류 세부정보:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message
        });
      }
      throw error;
    }
  },

  // 갤러리 항목 일괄 생성
  createBulkGalleryItems: async (items: any[], token?: string) => {
    try {
      console.log('갤러리 항목 일괄 생성 시작');
      
      // 인증 미들웨어 제거 - 헤더 단순화
      const headers: any = {
        'Content-Type': 'application/json'
      };
      
      const response = await axios.post(`${baseURL}/gallery/bulk`, items, {
        headers,
        withCredentials: true
      });
      
      console.log('갤러리 항목 일괄 생성 성공:', response.status);
      return response.data;
    } catch (error) {
      console.error('갤러리 항목 일괄 생성 실패:', error);
      if (axios.isAxiosError(error)) {
        console.error('API 오류 세부정보:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
      }
      throw error;
    }
  },

  // 공지사항(Notices) 관련 API
  getNotices: async () => {
    try {
      console.log('공지사항 데이터 가져오기 시도');
      const data = await makeApiRequest('/notices', {
        method: 'GET'
      });
      console.log('공지사항 데이터 응답:', data);
      return data;
    } catch (error) {
      console.error('공지사항 데이터 가져오기 실패:', error);
      throw error;
    }
  },

  // 공지사항 추가
  addNotice: async (noticeData: any, token?: string) => {
    try {
      console.log('새 공지사항 추가 시작');
      console.log('=== 서버로 전송할 데이터 상세 분석 ===');
      console.log('noticeData 타입:', typeof noticeData);
      console.log('noticeData 전체:', noticeData);
      console.log('attachments 존재 여부:', 'attachments' in noticeData);
      console.log('attachments 타입:', typeof noticeData.attachments);
      console.log('attachments 길이:', noticeData.attachments?.length);
      console.log('attachments 내용:', JSON.stringify(noticeData.attachments, null, 2));
      
      const headers: any = {
        'Content-Type': 'application/json'
      };
      
      // 토큰이 있으면 헤더에 추가
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      const response = await axios.post(`${baseURL}/notices`, noticeData, {
        headers
      });
      
      console.log('공지사항 추가 성공:', response.status);
      console.log('서버 응답 데이터:', response.data);
      return response.data;
    } catch (error) {
      console.error('공지사항 추가 실패:', error);
      if (axios.isAxiosError(error)) {
        console.error('API 오류 세부정보:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
      }
      throw error;
    }
  },

  // 공지사항 수정
  updateNotice: async (id: string, noticeData: any, token?: string) => {
    try {
      console.log(`공지사항 수정 시작 (ID: ${id})`);
      console.log('=== 서버로 전송할 수정 데이터 상세 분석 ===');
      console.log('noticeData 타입:', typeof noticeData);
      console.log('noticeData 전체:', noticeData);
      console.log('attachments 존재 여부:', 'attachments' in noticeData);
      console.log('attachments 타입:', typeof noticeData.attachments);
      console.log('attachments 길이:', noticeData.attachments?.length);
      console.log('attachments 내용:', JSON.stringify(noticeData.attachments, null, 2));
      
      const headers: any = {
        'Content-Type': 'application/json'
      };
      
      // 토큰이 있으면 헤더에 추가
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      const response = await axios.put(`${baseURL}/notices/${id}`, noticeData, {
        headers
      });
      
      console.log('공지사항 수정 성공:', response.status);
      console.log('서버 응답 데이터:', response.data);
      return response.data;
    } catch (error) {
      console.error(`공지사항 수정 실패 (ID: ${id}):`, error);
      if (axios.isAxiosError(error)) {
        console.error('API 오류 세부정보:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
      }
      throw error;
    }
  },

  // 공지사항 삭제
  deleteNotice: async (id: string, token?: string) => {
    try {
      console.log(`공지사항 삭제 시작 (ID: ${id})`);
      
      const headers: any = {
        'Content-Type': 'application/json'
      };
      
      // 토큰이 있으면 헤더에 추가
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      const response = await axios.delete(`${baseURL}/notices/${id}`, {
        headers
      });
      
      console.log('공지사항 삭제 성공:', response.status);
      return response.data;
    } catch (error) {
      console.error(`공지사항 삭제 실패 (ID: ${id}):`, error);
      if (axios.isAxiosError(error)) {
        console.error('API 오류 세부정보:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
      }
      throw error;
    }
  },

  // 언론보도(Press) 관련 API
  getPress: async () => {
    try {
      console.log('언론보도 데이터 가져오기 시도');
      const data = await makeApiRequest('/press', {
        method: 'GET'
      });
      console.log('언론보도 데이터 응답:', data);
      return data;
    } catch (error) {
      console.error('언론보도 데이터 가져오기 실패:', error);
      throw error;
    }
  },

  // 언론보도 추가
  addPress: async (pressData: any, token?: string) => {
    try {
      console.log('새 언론보도 추가 시작');
      console.log('=== 서버로 전송할 데이터 상세 분석 ===');
      console.log('pressData 타입:', typeof pressData);
      console.log('pressData 전체:', pressData);
      console.log('attachments 존재 여부:', 'attachments' in pressData);
      console.log('attachments 타입:', typeof pressData.attachments);
      console.log('attachments 길이:', pressData.attachments?.length);
      console.log('attachments 내용:', JSON.stringify(pressData.attachments, null, 2));

      const headers: any = {
        'Content-Type': 'application/json'
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await axios.post(`${baseURL}/press`, pressData, {
        headers
      });

      console.log('언론보도 추가 성공:', response.status);
      console.log('서버 응답 데이터:', response.data);
      return response.data;
    } catch (error) {
      console.error('언론보도 추가 실패:', error);
      if (axios.isAxiosError(error)) {
        console.error('API 오류 세부정보:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
      }
      throw error;
    }
  },

  // 언론보도 수정
  updatePress: async (id: string, pressData: any, token?: string) => {
    try {
      console.log(`언론보도 수정 시작 (ID: ${id})`);
      console.log('=== 서버로 전송할 수정 데이터 상세 분석 ===');
      console.log('pressData 타입:', typeof pressData);
      console.log('pressData 전체:', pressData);
      console.log('attachments 존재 여부:', 'attachments' in pressData);
      console.log('attachments 타입:', typeof pressData.attachments);
      console.log('attachments 길이:', pressData.attachments?.length);
      console.log('attachments 내용:', JSON.stringify(pressData.attachments, null, 2));

      const headers: any = {
        'Content-Type': 'application/json'
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await axios.put(`${baseURL}/press/${id}`, pressData, {
        headers
      });

      console.log('언론보도 수정 성공:', response.status);
      console.log('서버 응답 데이터:', response.data);
      return response.data;
    } catch (error) {
      console.error(`언론보도 수정 실패 (ID: ${id}):`, error);
      if (axios.isAxiosError(error)) {
        console.error('API 오류 세부정보:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
      }
      throw error;
    }
  },

  // 언론보도 삭제
  deletePress: async (id: string, token?: string) => {
    try {
      console.log(`언론보도 삭제 시작 (ID: ${id})`);

      const headers: any = {
        'Content-Type': 'application/json'
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await axios.delete(`${baseURL}/press/${id}`, {
        headers
      });

      console.log('언론보도 삭제 성공:', response.status);
      return response.data;
    } catch (error) {
      console.error(`언론보도 삭제 실패 (ID: ${id}):`, error);
      if (axios.isAxiosError(error)) {
        console.error('API 오류 세부정보:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
      }
      throw error;
    }
  },

  // 입학정보(Admission) 관련 API
  getAdmission: async () => {
    try {
      const data = await makeApiRequest('/admissions', {
        method: 'GET'
      }) as any;
      console.log('Admission API response:', data);
      console.log('endYear from API response:', data?.endYear);
      if (data && data.term) {
        // Ensure term is always returned as a number
        data.term = typeof data.term === 'string' 
          ? parseInt(data.term.replace(/\D/g, ''), 10) 
          : data.term;
      }
      return data;
    } catch (error) {
      console.error('Error fetching admission data:', error);
      throw error;
    }
  },

  // 입학정보 업데이트 API (관리자용)
  updateAdmission: async (admissionData: any, token?: string) => {
    try {
      // Ensure term is sent as a number
      if (admissionData.term && typeof admissionData.term === 'string') {
        admissionData.term = parseInt(admissionData.term.replace(/\D/g, ''), 10);
      }
      
      // 임시로 토큰 인증 제거 (테스트용)
      console.log('토큰 인증 우회 - updateAdmission (테스트용)');
      const headers: any = {
        'Content-Type': 'application/json'
      };
      
      // 토큰이 제공된 경우에만 Authorization 헤더 추가
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      const data = await makeApiRequest('/admissions', {
        method: 'PUT',
        data: admissionData,
        headers
      });
      return data;
    } catch (error) {
      console.error('Error updating admission data:', error);
      throw error;
    }
  },

  // 입학정보 생성 API (관리자용)
  createAdmission: async (admissionData: any, token?: string) => {
    try {
      // Ensure term is sent as a number
      if (admissionData.term && typeof admissionData.term === 'string') {
        admissionData.term = parseInt(admissionData.term.replace(/\D/g, ''), 10);
      }
      
      // 임시로 토큰 인증 제거 (테스트용)
      console.log('토큰 인증 우회 - createAdmission (테스트용)');
      const headers: any = {
        'Content-Type': 'application/json'
      };
      
      // 토큰이 제공된 경우에만 Authorization 헤더 추가
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      const data = await makeApiRequest('/admissions', {
        method: 'POST',
        data: admissionData,
        headers
      });
      return data;
    } catch (error) {
      console.error('Error creating admission data:', error);
      throw error;
    }
  },

  // 운영 준칙(Rules) 관련 API
  getRules: async () => {
    try {
      console.log('운영 준칙 데이터 가져오기 시작');
      const data = await makeApiRequest('/rules', {
        method: 'GET'
      });
      console.log('운영 준칙 API 응답 데이터:', data);
      return data;
    } catch (error) {
      console.error('운영 준칙 데이터 가져오기 실패:', error);
      throw error;
    }
  },

  // 운영 준칙 업데이트 API (관리자용) - 활성 문서 갱신
  updateRules: async (rulesData: any, token?: string) => {
    try {
      const headers: any = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      let response;
      if (rulesData._id) {
        console.log(`PUT 요청으로 운영 준칙(ID ${rulesData._id}) 업데이트`);
        response = await axios.put(`${baseURL}/rules/${rulesData._id}`, rulesData, { headers });
      } else {
        console.log('PUT 요청으로 활성 운영 준칙 업데이트');
        response = await axios.put(`${baseURL}/rules`, rulesData, { headers });
      }
      return response.data;
    } catch (error) {
      console.error('운영 준칙 업데이트 실패:', error);
      throw error;
    }
  },

  // 운영 준칙 생성 API (관리자용)
  createRules: async (rulesData: any, token?: string) => {
    try {
      const headers: any = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      const response = await axios.post(`${baseURL}/rules`, rulesData, { headers });
      return response.data;
    } catch (error) {
      console.error('운영 준칙 생성 실패:', error);
      throw error;
    }
  },

  // 운영 준칙 삭제 API (관리자용)
  deleteRules: async (id: string, token?: string) => {
    try {
      const headers: any = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      const response = await axios.delete(`${baseURL}/rules/${id}`, { headers });
      return response.data;
    } catch (error) {
      console.error('운영 준칙 삭제 실패:', error);
      throw error;
    }
  },

  // 푸터(Footer) 관련 API
  getFooter: async () => {
    try {
      console.log('푸터 데이터 가져오기 시작');
      console.log('현재 환경:', import.meta.env.MODE);
      
      const data = await makeApiRequest('/footer', {
        method: 'GET'
      });
      
      console.log('푸터 API 응답 데이터:', data);
      return data;
    } catch (error) {
      console.error('Error fetching footer data:', error);
      if (axios.isAxiosError(error)) {
        console.error('Axios Error Details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message
        });
      }
      throw error;
    }
  },

  // 유틸리티 함수: 컨텐츠를 문단으로 분리
  parseContentToParagraphs: (content: string): string[] => {
    if (!content) return [];
    return content.split(/\n\s*\n/).filter(paragraph => paragraph.trim() !== '');
  },

  // 추천의 글 생성/업데이트 함수
  async createRecommendation(recommendationData: any, token?: string) {
    try {
      const headers: any = {
        'Content-Type': 'application/json'
      };
      
      // 토큰이 있으면 Authorization 헤더에 추가
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      // /api/recommendations 엔드포인트 사용 (recommendationsRoutes.js에서 처리)
      const response = await axios.post(`${baseURL}/recommendations`, recommendationData, {
        headers
      });
      return response.data;
    } catch (error) {
      console.error('추천의 글 생성 실패:', error);
      throw error;
    }
  },
  
  // 추천의 글 삭제 함수
  async deleteRecommendation(id: string, token?: string) {
    try {
      const headers: any = {
        'Content-Type': 'application/json'
      };
      
      // 토큰이 있으면 Authorization 헤더에 추가
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      // /api/recommendations/:id 엔드포인트 사용 (recommendationsRoutes.js에서 처리)
      const response = await axios.delete(`${baseURL}/recommendations/${id}`, {
        headers
      });
      return response.data;
    } catch (error) {
      console.error('추천의 글 삭제 실패:', error);
      throw error;
    }
  },

  // 강사 생성 API
  createLecturer: async (lecturerData: any, token?: string) => {
    try {
      console.log('새 강사 정보 생성 시작');
      console.log('강사 정보:', lecturerData.name);
      
      const headers: any = {
        'Content-Type': 'application/json'
      };
      
      // 토큰이 있으면 헤더에 추가
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      // /lecturers 엔드포인트 사용
      const data = await makeApiRequest('/lecturers', {
        method: 'POST',
        data: lecturerData,
        headers
      });
      
      console.log('강사 정보 생성 결과 성공');
      return data;
    } catch (error) {
      console.error('강사 정보 생성 실패:', error);
      throw error;
    }
  },
  
  // 강사 정보 수정 API
  updateLecturer: async (id: string, lecturerData: any, token?: string) => {
    try {
      console.log(`ID ${id}를 가진 강사 정보 수정 시작`);
      
      const headers: any = {
        'Content-Type': 'application/json'
      };
      
      // 토큰이 있으면 헤더에 추가
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      // /lecturers/:id 엔드포인트 사용
      const data = await makeApiRequest(`/lecturers/${id}`, {
        method: 'PUT',
        data: lecturerData,
        headers
      });
      
      console.log('강사 정보 수정 결과 성공');
      return data;
    } catch (error) {
      console.error('강사 정보 수정 실패:', error);
      throw error;
    }
  },
  
  // 강사 정보 삭제 API
  deleteLecturer: async (id: string, token?: string) => {
    try {
      console.log(`ID ${id}를 가진 강사 정보 삭제 시작`);
      
      const headers: any = {
        'Content-Type': 'application/json'
      };
      
      // 토큰이 있으면 헤더에 추가
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      // /lecturers/:id 엔드포인트 사용
      const data = await makeApiRequest(`/lecturers/${id}`, {
        method: 'DELETE',
        headers
      });
      
      console.log('강사 정보 삭제 결과 성공');
      return data;
    } catch (error) {
      console.error('강사 정보 삭제 실패:', error);
      throw error;
    }
  },

  // 수료자(Graduates) 관련 API
  getGraduates: async () => {
    try {
      console.log('▶️▶️▶️ getGraduates 함수 호출 시작 ▶️▶️▶️');
      console.log('현재 환경:', import.meta.env.MODE);
      
      const data = await makeApiRequest('/graduates', {
        method: 'GET'
      });
      
      console.log('수료자 API 응답 데이터:', data);
      return data;
    } catch (error) {
      console.error('❌ 수료자 데이터 가져오기 실패:', error);
      throw error;
    }
  },

  // 수료자 추가 API
  addGraduate: async (graduateData: any, token?: string) => {
    try {
      console.log('새 수료자 추가 시작');
      
      const headers: any = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      const response = await axios.post(`${baseURL}/graduates`, graduateData, { headers });
      console.log('수료자 추가 성공:', response.status);
      return response.data;
    } catch (error) {
      console.error('수료자 추가 실패:', error);
      throw error;
    }
  },

  // 수료자 정보 수정 API
  updateGraduate: async (id: string, graduateData: any, token?: string) => {
    try {
      console.log(`ID ${id}를 가진 수료자 정보 수정 시작`);
      
      const headers: any = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      const response = await axios.put(`${baseURL}/graduates/${id}`, graduateData, { headers });
      console.log('수료자 정보 수정 성공:', response.status);
      return response.data;
    } catch (error) {
      console.error('수료자 정보 수정 실패:', error);
      throw error;
    }
  },

  // 수료자 정보 삭제 API
  deleteGraduate: async (id: string, token?: string) => {
    try {
      console.log(`ID ${id}를 가진 수료자 정보 삭제 시작`);
      
      const headers: any = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      const response = await axios.delete(`${baseURL}/graduates/${id}`, { headers });
      console.log('수료자 정보 삭제 성공:', response.status);
      return response.data;
    } catch (error) {
      console.error('수료자 정보 삭제 실패:', error);
      throw error;
    }
  },

  // 수료자 정보 일괄 추가 API
  addGraduatesBatch: async (graduatesData: any[], token?: string) => {
    try {
      console.log('수료자 정보 일괄 추가 시작:', graduatesData.length, '명');
      
      const headers: any = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      const response = await axios.post(`${baseURL}/graduates/batch`, graduatesData, { headers });
      console.log('수료자 정보 일괄 추가 성공:', response.status);
      return response.data;
    } catch (error) {
      console.error('수료자 정보 일괄 추가 실패:', error);
      if (axios.isAxiosError(error)) {
        console.error('API 오류 세부정보:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
      }
      throw error;
    }
  },
}; 