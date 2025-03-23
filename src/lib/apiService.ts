/**
 * API Service
 * 
 * This service handles all API calls to the backend server to fetch data from MongoDB.
 * It replaces the localStorage-based contentService in the production environment.
 */

import axios from 'axios';

// API 기본 URL 설정
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:5001/api';

// API 서비스 정의
export const apiService = {
  // 인사말(Greeting) 관련 API
  getGreeting: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/greeting`);
      console.log('Greeting API Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching greeting data:', error);
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

  // 추천사(Recommendations) 관련 API
  getRecommendations: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/content/recommendations`);
      console.log('Recommendations API Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching recommendations data:', error);
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

  // 목표(Objectives) 관련 API
  getObjectives: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/content/objectives`);
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
      const response = await axios.get(`${API_BASE_URL}/content/benefits`);
      console.log('Benefits API Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching benefits data:', error);
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

  // 교수진(Professors) 관련 API
  getProfessors: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/content/professors`);
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
      const response = await axios.get(`${API_BASE_URL}/content/professors/all`, {
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
      const response = await axios.post(`${API_BASE_URL}/content/professors`, sectionData, {
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
      const response = await axios.put(`${API_BASE_URL}/content/professors/${sectionId}`, sectionData, {
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
      const response = await axios.delete(`${API_BASE_URL}/content/professors/${sectionId}`, {
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
      let url = `${API_BASE_URL}/content/schedules`;
      
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
      const response = await axios.get(`${API_BASE_URL}/content/schedules/all`, {
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
      const response = await axios.post(`${API_BASE_URL}/content/schedules`, scheduleData, {
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
      const response = await axios.put(`${API_BASE_URL}/content/schedules/${id}`, scheduleData, {
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
      const response = await axios.delete(`${API_BASE_URL}/content/schedules/${id}`, {
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
      const response = await axios.get(`${API_BASE_URL}/content/lecturers`);
      return response.data;
    } catch (error) {
      console.error('Error fetching lecturers data:', error);
      throw error;
    }
  },

  // 갤러리(Gallery) 관련 API
  getGallery: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/gallery`);
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
      const response = await axios.post(`${API_BASE_URL}/gallery`, galleryData, {
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
      
      const response = await axios.post(`${API_BASE_URL}/gallery`, galleryData, {
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
      
      const response = await axios.put(`${API_BASE_URL}/gallery/${id}`, galleryData, {
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
      
      const response = await axios.delete(`${API_BASE_URL}/gallery/${id}`, {
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
      const response = await axios.post(`${API_BASE_URL}/gallery/bulk`, items, {
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
      const response = await axios.get(`${API_BASE_URL}/notices`);
      return response.data;
    } catch (error) {
      console.error('Error fetching notices data:', error);
      throw error;
    }
  },

  // 입학정보(Admission) 관련 API
  getAdmission: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admission`);
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
      
      const response = await axios.put(`${API_BASE_URL}/admission`, admissionData, {
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
      
      const response = await axios.post(`${API_BASE_URL}/admission`, admissionData, {
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
      const response = await axios.get(`${API_BASE_URL}/footer`);
      return response.data;
    } catch (error) {
      console.error('Error fetching footer data:', error);
      throw error;
    }
  },

  // 유틸리티 함수: 컨텐츠를 문단으로 분리
  parseContentToParagraphs: (content: string): string[] => {
    if (!content) return [];
    return content.split(/\n\s*\n/).filter(paragraph => paragraph.trim() !== '');
  }
}; 