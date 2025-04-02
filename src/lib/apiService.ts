/**
 * API Service
 * 
 * This service handles all API calls to the backend server to fetch data from MongoDB.
 * It replaces the localStorage-based contentService in the production environment.
 */

import axios from 'axios';

// 기본 URL 설정 - 서버 URL 직접 지정
const baseURL = import.meta.env.MODE === 'production' 
  ? 'https://snu-plp-hub-server.onrender.com/api' 
  : 'http://localhost:5001/api';
console.log('🔗 API 기본 URL:', baseURL);
console.log('🔧 현재 환경:', import.meta.env.MODE);

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
      console.log('요청 URL:', `${baseURL}/greeting`);
      console.log('현재 환경:', import.meta.env.MODE);
      
      const response = await axios.get(`${baseURL}/greeting`);
      console.log('인사말 API 응답 상태:', response.status);
      console.log('인사말 API 응답 데이터:', response.data);
      return response.data;
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
      console.log('추천의 글 데이터 가져오기 시작');
      // 경로 수정: /api/recommendations -> /api/content/recommendations/all
      const response = await axios.get(`${baseURL}/content/recommendations/all`);
      console.log('추천의 글 데이터 로드 완료:', response.data);
      return response.data;
    } catch (error) {
      console.error('추천의 글 로드 실패:', error);
      throw error;
    }
  },

  // 목표(Objectives) 관련 API
  getObjectives: async () => {
    try {
      console.log('▶️▶️▶️ getObjectives 함수 호출 시작 ▶️▶️▶️');
      console.log('요청 URL:', `${baseURL}/objectives`);
      console.log('현재 환경:', import.meta.env.MODE);
      
      // 인증 없이 요청
      const headers: any = {
        'Content-Type': 'application/json'
      };
      
      let response;
      
      // 먼저 /api/objectives 경로로 시도
      try {
        console.log('🔄 첫 번째 경로로 서버에 요청 전송 시작: /api/objectives');
        const config = {
          headers,
          withCredentials: false // 인증 관련 쿠키 전송 방지
        };
        console.log('요청 설정:', config);
        
        response = await axios.get(`${baseURL}/objectives`, config);
        console.log('✅ 첫 번째 경로 성공 (/api/objectives)');
        console.log('응답 상태:', response.status);
        console.log('응답 헤더:', response.headers);
      } catch (firstPathError) {
        console.warn('⚠️ 첫 번째 경로 실패:', firstPathError);
        console.warn('⚠️ 두 번째 경로 시도: /api/content/objectives');
        
        // 첫 번째 경로 실패 시 두 번째 경로 시도
        const config = {
          headers,
          withCredentials: false
        };
        console.log('두 번째 요청 설정:', config);
        
        response = await axios.get(`${baseURL}/content/objectives`, config);
        console.log('✅ 두 번째 경로 성공 (/api/content/objectives)');
        console.log('응답 상태:', response.status);
        console.log('응답 헤더:', response.headers);
      }
      
      console.log('===== 서버 응답 확인 =====');
      console.log('목표 API 응답 상태:', response.status);
      console.log('목표 API 응답 데이터:', response.data);
      console.log('데이터 타입:', typeof response.data);
      console.log('데이터가 배열인가?', Array.isArray(response.data));
      
      if (Array.isArray(response.data)) {
        console.log('배열 길이:', response.data.length);
        if (response.data.length > 0) {
          console.log('첫 번째 항목 샘플:', {
            _id: response.data[0]._id,
            title: response.data[0].title,
            description: response.data[0].description,
            sectionTitle: response.data[0].sectionTitle
          });
        }
      }
      
      // 백업: 로컬스토리지에 최신 데이터 저장
      try {
        localStorage.setItem('objectives_backup', JSON.stringify(response.data));
        localStorage.setItem('objectives_backup_time', Date.now().toString());
        console.log('목표 데이터 로컬스토리지에 백업 완료');
      } catch (storageError) {
        console.warn('로컬스토리지 백업 실패:', storageError);
      }
      
      return response.data;
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
        
        if (error.request) {
          console.error('🔍 Request 객체:', {
            method: error.config?.method,
            url: error.config?.url,
            headers: error.config?.headers
          });
        }
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
      
      // ID가 있으면 PUT 요청으로 업데이트
      if (objectiveData._id) {
        console.log(`ID ${objectiveData._id}를 가진 목표 업데이트 시도 - PUT 사용`);
        response = await axios.put(
          `${baseURL}/objectives/${objectiveData._id}`, 
          objectiveData, 
          { headers: { 'Content-Type': 'application/json' } }
        );
      } 
      // ID가 없으면 POST 요청으로 새로 생성
      else {
        console.log('새 목표 생성 시도 - POST 사용');
        response = await axios.post(
          `${baseURL}/objectives`, 
          objectiveData, 
          { headers: { 'Content-Type': 'application/json' } }
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
      const response = await axios.delete(`${baseURL}/objectives/${id}`, {
        headers: {
          'Content-Type': 'application/json'
        }
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
      console.log('요청 URL:', `${baseURL}/benefits`);
      
      // 여러 API 경로를 시도
      let response;
      let error;
      
      // 첫 번째 시도: /benefits
      try {
        console.log('첫 번째 경로 시도: /benefits');
        response = await axios.get(`${baseURL}/benefits`);
        console.log('첫 번째 경로 성공');
      } catch (err) {
        console.warn('첫 번째 경로 실패, 두 번째 경로 시도');
        error = err;
        
        // 두 번째 시도: /content/benefits
        try {
          console.log('두 번째 경로 시도: /content/benefits');
          response = await axios.get(`${baseURL}/content/benefits`);
          console.log('두 번째 경로 성공');
        } catch (err2) {
          console.error('두 번째 경로도 실패');
          throw err2;
        }
      }
      
      console.log('Benefits API 응답 상태:', response.status);
      console.log('Benefits API 응답 데이터 타입:', typeof response.data);
      console.log('Benefits API 응답 데이터 길이:', Array.isArray(response.data) ? response.data.length : 'Not an array');
      
      return response.data;
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
      console.log('요청 URL:', `${baseURL}/content/benefits/all`);
      
      const headers: any = {
        'Content-Type': 'application/json'
      };
      
      // 테스트를 위해 인증 제거
      // if (token) {
      //   headers.Authorization = `Bearer ${token}`;
      // }
      
      const response = await axios.get(`${baseURL}/content/benefits/all`, { headers });
      console.log('전체 특전 데이터 조회 결과:', response.status);
      return response.data;
    } catch (error) {
      console.error('관리자용 특전 데이터 조회 실패:', error);
      throw error;
    }
  },
  
  // 특전 생성 API (관리자용)
  createBenefit: async (benefitData: any, token?: string) => {
    try {
      console.log('새 특전 생성 시작');
      console.log('요청 URL:', `${baseURL}/content/benefits`);
      
      const headers: any = {
        'Content-Type': 'application/json'
      };
      
      // 테스트를 위해 인증 제거
      // if (token) {
      //   headers.Authorization = `Bearer ${token}`;
      // }
      
      const response = await axios.post(`${baseURL}/content/benefits`, benefitData, { headers });
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
      console.log('요청 URL:', `${baseURL}/content/benefits/${id}`);
      
      const headers: any = {
        'Content-Type': 'application/json'
      };
      
      // 테스트를 위해 인증 제거
      // if (token) {
      //   headers.Authorization = `Bearer ${token}`;
      // }
      
      const response = await axios.put(`${baseURL}/content/benefits/${id}`, benefitData, { headers });
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
      console.log('요청 URL:', `${baseURL}/content/benefits/${id}`);
      
      const headers: any = {
        'Content-Type': 'application/json'
      };
      
      // 테스트를 위해 인증 제거
      // if (token) {
      //   headers.Authorization = `Bearer ${token}`;
      // }
      
      const response = await axios.delete(`${baseURL}/content/benefits/${id}`, { headers });
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
      console.log('요청 URL:', `${baseURL}/professors`);
      console.log('현재 환경:', import.meta.env.MODE);
      
      // 인증 없이 요청
      const headers: any = {
        'Content-Type': 'application/json'
      };
      
      let response;
      
      // 먼저 /api/professors 경로로 시도
      try {
        console.log('🔄 첫 번째 경로로 서버에 요청 전송 시작: /api/professors');
        const config = {
          headers,
          withCredentials: false // 인증 관련 쿠키 전송 방지
        };
        console.log('요청 설정:', config);
        
        response = await axios.get(`${baseURL}/professors`, config);
        console.log('✅ 첫 번째 경로 성공 (/api/professors)');
        console.log('응답 상태:', response.status);
        console.log('응답 헤더:', response.headers);
      } catch (firstPathError) {
        console.warn('⚠️ 첫 번째 경로 실패:', firstPathError);
        console.warn('⚠️ 두 번째 경로 시도: /api/content/professors');
        
        // 첫 번째 경로 실패 시 두 번째 경로 시도
        const config = {
          headers,
          withCredentials: false
        };
        console.log('두 번째 요청 설정:', config);
        
        response = await axios.get(`${baseURL}/content/professors`, config);
        console.log('✅ 두 번째 경로 성공 (/api/content/professors)');
        console.log('응답 상태:', response.status);
        console.log('응답 헤더:', response.headers);
      }
      
      console.log('===== 서버 응답 확인 =====');
      console.log('교수진 API 응답 상태:', response.status);
      console.log('교수진 API 응답 데이터:', response.data);
      console.log('데이터 타입:', typeof response.data);
      console.log('데이터가 배열인가?', Array.isArray(response.data));
      
      if (Array.isArray(response.data)) {
        console.log('배열 길이:', response.data.length);
        if (response.data.length > 0) {
          console.log('첫 번째 항목 샘플:', {
            _id: response.data[0]._id,
            sectionTitle: response.data[0].sectionTitle,
            professors: response.data[0].professors?.length || 0
          });
        }
      }
      
      // 백업: 로컬스토리지에 최신 데이터 저장
      try {
        localStorage.setItem('professors-data', JSON.stringify(response.data));
        localStorage.setItem('professors-data-time', Date.now().toString());
        console.log('교수진 데이터 로컬스토리지에 백업 완료');
      } catch (storageError) {
        console.warn('로컬스토리지 백업 실패:', storageError);
      }
      
      return response.data;
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
      console.log('요청 URL:', `${baseURL}/content/professors/all`);
      
      const headers: any = {
        'Content-Type': 'application/json'
      };
      
      // 테스트를 위해 인증 제거
      // if (token) {
      //   headers.Authorization = `Bearer ${token}`;
      // }
      
      const response = await axios.get(`${baseURL}/content/professors/all`, { headers });
      console.log('전체 교수진 데이터 조회 결과:', response.status);
      return response.data;
    } catch (error) {
      console.error('교수진 전체 데이터 조회 실패:', error);
      throw error;
    }
  },
  
  // 새 교수진 섹션 생성 API
  createProfessorSection: async (sectionData: any, token?: string) => {
    try {
      console.log('새 교수진 섹션 생성 시작');
      console.log('요청 URL:', `${baseURL}/content/professors`);
      
      const headers: any = {
        'Content-Type': 'application/json'
      };
      
      // 테스트를 위해 인증 제거
      // if (token) {
      //   headers.Authorization = `Bearer ${token}`;
      // }
      
      const response = await axios.post(`${baseURL}/content/professors`, sectionData, { headers });
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
      console.log('요청 URL:', `${baseURL}/content/professors/${sectionId}`);
      
      const headers: any = {
        'Content-Type': 'application/json'
      };
      
      // 테스트를 위해 인증 제거
      // if (token) {
      //   headers.Authorization = `Bearer ${token}`;
      // }
      
      const response = await axios.put(`${baseURL}/content/professors/${sectionId}`, sectionData, { headers });
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
      console.log('요청 URL:', `${baseURL}/content/professors/${sectionId}`);
      
      const headers: any = {
        'Content-Type': 'application/json'
      };
      
      // 테스트를 위해 인증 제거
      // if (token) {
      //   headers.Authorization = `Bearer ${token}`;
      // }
      
      const response = await axios.delete(`${baseURL}/content/professors/${sectionId}`, { headers });
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
        ? 'https://snu-plp-hub-server.onrender.com/api/content/schedules/all'
        : 'http://localhost:5001/api/content/schedules/all';
      
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

  // 일정 생성 API
  createSchedule: async (scheduleData: any, token: string) => {
    try {
      console.log('▶️▶️▶️ createSchedule 함수 호출 시작 ▶️▶️▶️');
      console.log('새 일정 생성 시작:', scheduleData.title);
      
      // 완전한 URL 경로 사용
      const apiUrl = import.meta.env.MODE === 'production' 
        ? 'https://snu-plp-hub-server.onrender.com/api/content/schedules'
        : 'http://localhost:5001/api/content/schedules';
      
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
        ? `https://snu-plp-hub-server.onrender.com/api/content/schedules/${id}`
        : `http://localhost:5001/api/content/schedules/${id}`;
      
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
        ? `https://snu-plp-hub-server.onrender.com/api/content/schedules/${id}`
        : `http://localhost:5001/api/content/schedules/${id}`;
      
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
      // 완전한 URL 경로 사용
      const apiUrl = import.meta.env.MODE === 'production' 
        ? 'https://snu-plp-hub-server.onrender.com/api/lecturers'
        : 'http://localhost:5001/api/lecturers';
      
      console.log('요청 URL (수정됨):', apiUrl);
      console.log('현재 환경:', import.meta.env.MODE);
      
      // 명시적인 헤더 설정
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };
      
      let response;
      
      // 첫 번째 시도: 직접 URL로 요청
      try {
        console.log('🔄 서버에 직접 요청 전송 시작:', apiUrl);
        const config = {
          headers,
          withCredentials: false
        };
        console.log('요청 설정:', config);
        
        response = await axios.get(apiUrl, config);
        console.log('✅ API 요청 성공');
        console.log('응답 상태:', response.status);
      } catch (firstError) {
        console.warn('⚠️ 첫 번째 요청 실패:', firstError.message);
        console.warn('⚠️ baseURL + 경로 조합으로 다시 시도');
        
        try {
          // 두 번째 시도: 기존 방식으로 시도
          response = await axios.get(`${baseURL}/lecturers`, {
            headers,
            withCredentials: false
          });
          console.log('✅ 두 번째 시도 성공');
        } catch (secondError) {
          console.warn('⚠️ 두 번째 시도도 실패, content 경로 시도');
          
          // 세 번째 시도: content 경로
          response = await axios.get(`${baseURL}/content/lecturers`, {
            headers,
            withCredentials: false
          });
          console.log('✅ 세 번째 시도 성공');
        }
      }
      
      console.log('===== 서버 응답 확인 =====');
      console.log('강사진 API 응답 상태:', response.status);
      console.log('강사진 API 응답 데이터 타입:', typeof response.data);
      
      // 데이터 유효성 검사: HTML이 반환된 경우
      if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
        console.error('❌ API가 HTML을 반환했습니다. 서버 설정 문제가 있습니다.');
        throw new Error('API returned HTML instead of JSON data');
      }
      
      if (Array.isArray(response.data)) {
        console.log('배열 길이:', response.data.length);
        if (response.data.length > 0) {
          console.log('첫 번째 항목 샘플:', {
            _id: response.data[0]._id,
            name: response.data[0].name,
            term: response.data[0].term,
            category: response.data[0].category
          });
        }
        
        // 백업: 로컬스토리지에 최신 데이터 저장
        try {
          localStorage.setItem('lecturers-data', JSON.stringify(response.data));
          localStorage.setItem('lecturers-data-time', Date.now().toString());
          console.log('강사진 데이터 로컬스토리지에 백업 완료');
        } catch (storageError) {
          console.warn('로컬스토리지 백업 실패:', storageError);
        }
        
        return response.data;
      } else {
        console.error('❌ API 응답이 배열이 아닙니다:', response.data);
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
  getLecturersAll: async () => {
    try {
      console.log('관리자용 모든 강사진 데이터 조회 시작');
      console.log('요청 URL:', `${baseURL}/content/lecturers/all`);
      
      const response = await axios.get(`${baseURL}/content/lecturers/all`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('전체 강사진 데이터 조회 결과:', response.status);
      console.log('조회된 강사 수:', response.data?.length || 0);
      
      return response.data;
    } catch (error) {
      console.error('관리자용 강사진 데이터 조회 실패:', error);
      
      // 로컬 스토리지에서 백업 데이터 시도
      try {
        const backup = localStorage.getItem('faculty-data');
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
      console.log('갤러리 데이터 가져오기 시도');
      const response = await axios.get(`${baseURL}/gallery`);
      console.log('갤러리 데이터 응답:', response.data);
      return response.data;
    } catch (error) {
      console.error('갤러리 데이터 가져오기 실패:', error);
      throw error;
    }
  },

  // 갤러리 항목 추가
  addGalleryItem: async (galleryData: any, token?: string) => {
    try {
      console.log('새 갤러리 항목 추가 시작');
      
      const headers: any = {
        'Content-Type': 'application/json'
      };
      
      // 인증 미들웨어 제거 - 토큰 없이도 작동하도록 수정
      const response = await axios.post(`${baseURL}/gallery`, galleryData, {
        headers,
        withCredentials: true
      });
      
      console.log('갤러리 항목 추가 성공:', response.status);
      return response.data;
    } catch (error) {
      console.error('갤러리 항목 추가 실패:', error);
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

  // 갤러리 항목 수정
  updateGalleryItem: async (id: string, galleryData: any, token?: string) => {
    try {
      console.log(`갤러리 항목 수정 시작 (ID: ${id})`);
      
      // 인증 미들웨어 제거 - 헤더 단순화
      const headers: any = {
        'Content-Type': 'application/json'
      };
      
      // API 요청 시도 - 인증 요구 없이
      const response = await axios.put(`${baseURL}/gallery/${id}`, galleryData, {
        headers,
        withCredentials: true
      });
      
      console.log('갤러리 항목 수정 성공:', response.status);
      return response.data;
    } catch (error) {
      console.error(`갤러리 항목 수정 실패 (ID: ${id}):`, error);
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

  // 갤러리 항목 삭제
  deleteGalleryItem: async (id: string, token?: string) => {
    try {
      console.log(`갤러리 항목 삭제 시작 (ID: ${id})`);
      
      // 인증 미들웨어 제거 - 헤더 단순화
      const headers: any = {
        'Content-Type': 'application/json'
      };
      
      // API 요청 시도 - 인증 요구 없이
      const response = await axios.delete(`${baseURL}/gallery/${id}`, {
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
      const response = await axios.get(`${baseURL}/notices`);
      console.log('공지사항 데이터 응답:', response.data);
      return response.data;
    } catch (error) {
      console.error('공지사항 데이터 가져오기 실패:', error);
      throw error;
    }
  },

  // 공지사항 추가 - 인증 제거됨
  addNotice: async (noticeData: any) => {
    try {
      console.log('새 공지사항 추가 시작');
      
      // admin-auth 토큰 추가
      const response = await axios.post(`${baseURL}/notices`, noticeData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer admin-auth'
        }
      });
      
      console.log('공지사항 추가 성공:', response.status);
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

  // 공지사항 수정 - 인증 제거됨
  updateNotice: async (id: string, noticeData: any) => {
    try {
      console.log(`공지사항 수정 시작 (ID: ${id})`);
      
      // admin-auth 토큰 추가
      const response = await axios.put(`${baseURL}/notices/${id}`, noticeData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer admin-auth'
        }
      });
      
      console.log('공지사항 수정 성공:', response.status);
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

  // 공지사항 삭제 - 인증 제거됨
  deleteNotice: async (id: string) => {
    try {
      console.log(`공지사항 삭제 시작 (ID: ${id})`);
      
      // admin-auth 토큰 추가
      const response = await axios.delete(`${baseURL}/notices/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer admin-auth'
        }
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

  // 입학정보(Admission) 관련 API
  getAdmission: async () => {
    try {
      const response = await axios.get(`${baseURL}/admission`);
      if (response.data && response.data.term) {
        // Ensure term is always returned as a number
        response.data.term = typeof response.data.term === 'string' 
          ? parseInt(response.data.term.replace(/\D/g, ''), 10) 
          : response.data.term;
      }
      return response.data;
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
      
      const response = await axios.put(`${baseURL}/admission`, admissionData, {
        headers
      });
      return response.data;
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
      
      const response = await axios.post(`${baseURL}/admission`, admissionData, {
        headers
      });
      return response.data;
    } catch (error) {
      console.error('Error creating admission data:', error);
      throw error;
    }
  },

  // 푸터(Footer) 관련 API
  getFooter: async () => {
    try {
      console.log('푸터 데이터 가져오기 시작');
      console.log('요청 URL:', `${baseURL}/footer`);
      console.log('현재 환경:', import.meta.env.MODE);
      
      const response = await axios.get(`${baseURL}/footer`);
      console.log('푸터 API 응답 상태:', response.status);
      console.log('푸터 API 응답 데이터:', response.data);
      return response.data;
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
  async createRecommendation(recommendationData: any) {
    try {
      const response = await axios.post(`${baseURL}/content/recommendations`, recommendationData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('추천의 글 생성 실패:', error);
      throw error;
    }
  },
  
  // 추천의 글 삭제 함수
  async deleteRecommendation(id: string) {
    try {
      const response = await axios.delete(`${baseURL}/content/recommendations/${id}`);
      return response.data;
    } catch (error) {
      console.error('추천의 글 삭제 실패:', error);
      throw error;
    }
  },

  // 강사 생성 API
  createLecturer: async (lecturerData) => {
    try {
      console.log('새 강사 정보 생성 시작');
      console.log('요청 URL:', `${baseURL}/content/lecturers`);
      console.log('강사 정보:', lecturerData.name);
      
      const response = await axios.post(`${baseURL}/content/lecturers`, lecturerData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('강사 정보 생성 결과:', response.status);
      return response.data;
    } catch (error) {
      console.error('강사 정보 생성 실패:', error);
      throw error;
    }
  },
  
  // 강사 정보 수정 API
  updateLecturer: async (id, lecturerData) => {
    try {
      console.log(`ID ${id}를 가진 강사 정보 수정 시작`);
      console.log('요청 URL:', `${baseURL}/content/lecturers/${id}`);
      
      const response = await axios.put(`${baseURL}/content/lecturers/${id}`, lecturerData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('강사 정보 수정 결과:', response.status);
      return response.data;
    } catch (error) {
      console.error('강사 정보 수정 실패:', error);
      throw error;
    }
  },
  
  // 강사 정보 삭제 API
  deleteLecturer: async (id) => {
    try {
      console.log(`ID ${id}를 가진 강사 정보 삭제 시작`);
      console.log('요청 URL:', `${baseURL}/content/lecturers/${id}`);
      
      const response = await axios.delete(`${baseURL}/content/lecturers/${id}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('강사 정보 삭제 결과:', response.status);
      return response.data;
    } catch (error) {
      console.error('강사 정보 삭제 실패:', error);
      throw error;
    }
  },
}; 