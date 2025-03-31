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
      const response = await axios.get(`${baseURL}/objectives`);
      console.log('Objectives API Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching objectives data:', error);
      if (axios.isAxiosError(error)) {
        console.error('Axios Error Details:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
      }
      throw error;
    }
  },

  // 혜택(Benefits) 관련 API
  getBenefits: async () => {
    try {
      console.log('Benefits API Request 시작');
      const response = await fetch(`${baseURL}/benefits`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      
      console.log('Benefits API 응답 상태:', response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error(`서버 오류: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Benefits API 응답 데이터:', data);
      return data;
    } catch (error) {
      console.error('Error fetching benefits data:', error);
      throw error;
    }
  },

  // 교수진(Professors) 관련 API
  getProfessors: async () => {
    try {
      const response = await axios.get(`${baseURL}/professors`);
      console.log('Professors API Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching professors data:', error);
      if (axios.isAxiosError(error)) {
        console.error('Axios Error Details:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
      }
      throw error;
    }
  },

  // 관리자용 교수진 전체 목록 조회 API
  getProfessorsAll: async (token: string) => {
    try {
      const response = await axios.get(`${baseURL}/content/professors/all`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching all professors data:', error);
      throw error;
    }
  },
  
  // 새 교수진 섹션 생성 API
  createProfessorSection: async (sectionData: any, token: string) => {
    try {
      const response = await axios.post(`${baseURL}/content/professors`, sectionData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating professor section:', error);
      throw error;
    }
  },
  
  // 교수진 섹션 업데이트 API
  updateProfessorSection: async (sectionId: string, sectionData: any, token: string) => {
    try {
      const response = await axios.put(`${baseURL}/content/professors/${sectionId}`, sectionData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating professor section:', error);
      throw error;
    }
  },
  
  // 교수진 섹션 삭제 API
  deleteProfessorSection: async (sectionId: string, token: string) => {
    try {
      const response = await axios.delete(`${baseURL}/content/professors/${sectionId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting professor section:', error);
      throw error;
    }
  },

  // 일정(Schedules) 관련 API
  getSchedules: async (category?: string) => {
    try {
      let url = `${baseURL}/schedules`;
      
      // 카테고리가 지정된 경우 쿼리 매개변수로 추가
      if (category) {
        url += `?category=${category}`;
      }
      
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching schedules data:', error);
      throw error;
    }
  },

  // 관리자용 모든 일정 조회 API
  getSchedulesAll: async (token: string) => {
    try {
      const response = await axios.get(`${baseURL}/content/schedules/all`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching all schedules data:', error);
      throw error;
    }
  },

  // 일정 생성 API
  createSchedule: async (scheduleData: any, token: string) => {
    try {
      const response = await axios.post(`${baseURL}/content/schedules`, scheduleData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating schedule:', error);
      throw error;
    }
  },

  // 일정 수정 API
  updateSchedule: async (id: string, scheduleData: any, token: string) => {
    try {
      const response = await axios.put(`${baseURL}/content/schedules/${id}`, scheduleData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating schedule with id ${id}:`, error);
      throw error;
    }
  },

  // 일정 삭제 API
  deleteSchedule: async (id: string, token: string) => {
    try {
      const response = await axios.delete(`${baseURL}/content/schedules/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error deleting schedule with id ${id}:`, error);
      throw error;
    }
  },

  // 강사진(Lecturers) 관련 API
  getLecturers: async () => {
    try {
      const response = await axios.get(`${baseURL}/lecturers`);
      console.log('Lecturers API Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching lecturers data:', error);
      throw error;
    }
  },

  // 갤러리(Gallery) 관련 API
  getGallery: async () => {
    try {
      const response = await axios.get(`${baseURL}/gallery`);
      console.log('Gallery API Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching gallery data:', error);
      if (axios.isAxiosError(error)) {
        console.error('Axios Error Details:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
      }
      throw error;
    }
  },

  // 갤러리 항목 추가
  createGalleryItem: async (galleryData: any, token: string) => {
    try {
      const response = await axios.post(`${baseURL}/gallery`, galleryData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      console.log('Create Gallery Item Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating gallery item:', error);
      if (axios.isAxiosError(error)) {
        console.error('Axios Error Details:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
      }
      throw error;
    }
  },
  
  // addGalleryItem 메서드 추가 - createGalleryItem의 별칭으로 작동
  addGalleryItem: async (galleryData: any, token?: string) => {
    try {
      // 임시로 토큰 인증 우회 (테스트용)
      console.log('토큰 인증 우회 - addGalleryItem (테스트용)');
      const headers: any = {
        'Content-Type': 'application/json'
      };
      
      // 토큰이 제공된 경우에만 Authorization 헤더 추가
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      const response = await axios.post(`${baseURL}/gallery`, galleryData, {
        headers
      });
      console.log('Add Gallery Item Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error adding gallery item:', error);
      if (axios.isAxiosError(error)) {
        console.error('Axios Error Details:', {
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
      // 임시로 토큰 인증 우회 (테스트용)
      console.log('토큰 인증 우회 - updateGalleryItem (테스트용)');
      const headers: any = {
        'Content-Type': 'application/json'
      };
      
      // 토큰이 제공된 경우에만 Authorization 헤더 추가
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      const response = await axios.put(`${baseURL}/gallery/${id}`, galleryData, {
        headers
      });
      console.log('Update Gallery Item Response:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error updating gallery item with id ${id}:`, error);
      if (axios.isAxiosError(error)) {
        console.error('Axios Error Details:', {
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
      // 임시로 토큰 인증 우회 (테스트용)
      console.log('토큰 인증 우회 - deleteGalleryItem (테스트용)');
      const headers: any = {};
      
      // 토큰이 제공된 경우에만 Authorization 헤더 추가
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      const response = await axios.delete(`${baseURL}/gallery/${id}`, {
        headers
      });
      console.log('Delete Gallery Item Response:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error deleting gallery item with id ${id}:`, error);
      if (axios.isAxiosError(error)) {
        console.error('Axios Error Details:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
      }
      throw error;
    }
  },

  // 갤러리 항목 일괄 생성
  createBulkGalleryItems: async (items: any[], token: string) => {
    try {
      const response = await axios.post(`${baseURL}/gallery/bulk`, items, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      console.log('Create Bulk Gallery Items Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating bulk gallery items:', error);
      if (axios.isAxiosError(error)) {
        console.error('Axios Error Details:', {
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
      const response = await axios.get(`${baseURL}/notices`);
      return response.data;
    } catch (error) {
      console.error('Error fetching notices data:', error);
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
}; 