/**
 * Content Service
 * 
 * This service manages content that is shared between admin and public pages.
 * It uses localStorage for persistence in this demo version.
 * In a production environment, this would be replaced with API calls to a backend.
 */

// Content types
export interface GreetingContent {
  title: string;
  content: string;
  signText: string;
}

export interface Recommendation {
  title: string;
  text: string;
  author: string;
  position: string;
  photoUrl: string;
}

export interface CourseGoal {
  title: string;
  content: string;
}

export interface CourseBenefit {
  title: string;
  content: string;
}

// Default content
const DEFAULT_GREETING: GreetingContent = {
  title: '인사말',
  content: `2020년 초반의 세계는 그야말로 대전환(Great Transformation)의 시대를 맞고 있습니다. 최근 러시아-우크라이나 전쟁과 이스라엘–하마스 전쟁의 발발, 그리고 점점 더 가속화되는 미중 글로벌 패권경쟁 등으로 국제정세가 매우 어수선합니다. 각자도생의 논리를 내세우며 서로 경쟁하는 지정학 시대의 부활이 거론되고 있습니다. 주요국들의 국내정치도 큰 도전에 직면하여 그동안 인류가 지향해 온 민주정치의 제도와 가치가 훼손될지 모른다는 우려마저 제기되고 있습니다. 국내적으로도 2026년 6월 지방선거나 2027년 3월 대선 등의 정치일정을 순조롭게 치러야 할 과제를 안고 있습니다.

이렇듯 복합적으로 제기되는 안과 밖의 도전에 슬기롭게 대응하는 차원에서 미래 정치리더십을 제대로 세워야 할 필요성이 그 어느 때보다도 시급하게 요청되고 있습니다. 21세기 미래를 열어 나갈 정치리더십 양성을 위해서 서울대학교 정치외교학부 교수진의 교육이 학내에만 머물지 말고 우리 사회의 미래 정치지망자들과 개방적으로 공유될 수 있는 플랫폼을 마련해야 한다는 요청의 말씀도 이제는 더 이상 가볍게 들을 수 없는 때가 되었다고 생각합니다. 급변하는 국내외 정세의 변화에 대응하는 개방적 교육 플랫폼의 구축을 위해서 서울대학교 정치외교학부는 '정치지도자과정(Political Leaders Program, PLP)'을 개설하게 되었습니다.

정치지도자과정은 서울대학교 정치외교학부 교수진 및 우리 각계의 명사 동문을 중심으로 강사진을 구성하였습니다. 연구와 교육 및 경험에 바탕으로 둔 강의진의 알찬 강의와 수강생들의 활발한 참여를 통해서 한국 정치가 안고 있는 다양한 과제들을 진단하고 이에 대한 처방을 진지하게 고민하는 국내 최고 수준의 프로그램을 마련하였습니다. 정치지도자과정이 국내 각계의 현직 또는 잠재적 지도자들의 리더십을 고양하는데 기여하기를 소망합니다.

아울러 정치지도자과정에서 배출된 역량이 우리의 미래에 투영되어 장차 대한민국이 더욱 건설적인 방향으로 발전해 가기를 기대합니다.`,
  signText: '정치지도자과정 주임교수 김상배'
};

// Storage keys
const STORAGE_KEYS = {
  GREETING: 'greeting-data',
  GREETING_DIRECT: 'greeting-content-direct',
  RECOMMENDATIONS: 'recommendations-data',
  RECOMMENDATIONS_DIRECT: 'recommendations',
  RECOMMENDATIONS_TITLE: 'recommendations-title',
  COURSE_GOAL: 'course-goal-data',
  COURSE_GOAL_DIRECT: 'course-goal',
  COURSE_BENEFITS: 'course-benefits-data',
  COURSE_BENEFITS_DIRECT: 'course-benefits'
};

// Helper functions
const saveToMultipleKeys = (data: any, keys: string[]): void => {
  for (const key of keys) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      console.log(`Data saved to ${key}:`, data);
    } catch (error) {
      console.error(`Error saving to ${key}:`, error);
    }
  }
};

const loadFromMultipleKeys = <T>(keys: string[], defaultValue: T): T => {
  for (const key of keys) {
    try {
      const storedData = localStorage.getItem(key);
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        console.log(`Data loaded from ${key}:`, parsedData);
        return parsedData;
      }
    } catch (error) {
      console.error(`Error loading from ${key}:`, error);
    }
  }
  return defaultValue;
};

// Content service methods
export const contentService = {
  // Greeting content methods
  getGreetingContent: (): GreetingContent => {
    return loadFromMultipleKeys<GreetingContent>(
      [STORAGE_KEYS.GREETING, STORAGE_KEYS.GREETING_DIRECT, 'greeting'],
      DEFAULT_GREETING
    );
  },

  saveGreetingContent: (data: GreetingContent): void => {
    try {
      // Ensure data is properly formatted
      const formattedData: GreetingContent = {
        title: data.title || DEFAULT_GREETING.title,
        content: data.content || DEFAULT_GREETING.content,
        signText: data.signText || DEFAULT_GREETING.signText
      };
      
      // Save to multiple keys for redundancy
      saveToMultipleKeys(formattedData, [
        STORAGE_KEYS.GREETING,
        STORAGE_KEYS.GREETING_DIRECT,
        'greeting'
      ]);
      
      // Trigger a custom event to notify other components that content has changed
      window.dispatchEvent(new CustomEvent('content-updated', { detail: { type: 'greeting' } }));
      
      // Force a refresh of the page if we're on the greeting page
      if (window.location.pathname === '/greeting' || 
          window.location.pathname === '/intro/greeting' ||
          window.location.hash === '#/greeting' || 
          window.location.hash === '#/intro/greeting') {
        console.log('On greeting page, triggering reload');
        setTimeout(() => {
          window.location.reload();
        }, 100);
      }
    } catch (error) {
      console.error('Error saving greeting content:', error);
    }
  },

  // Recommendations content methods
  getRecommendations: (): Recommendation[] => {
    try {
      // Try multiple keys for redundancy
      const possibleDataKeys = [
        STORAGE_KEYS.RECOMMENDATIONS_DIRECT,
        STORAGE_KEYS.RECOMMENDATIONS,
        'recommendation-data'
      ];
      
      for (const key of possibleDataKeys) {
        const storedData = localStorage.getItem(key);
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          if (Array.isArray(parsedData)) {
            console.log(`Recommendations loaded from ${key}:`, parsedData);
            return parsedData;
          } else if (parsedData.recommendations && Array.isArray(parsedData.recommendations)) {
            console.log(`Recommendations loaded from ${key}:`, parsedData.recommendations);
            return parsedData.recommendations;
          }
        }
      }
      
      return [];
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return [];
    }
  },

  getRecommendationsTitle: (): string => {
    try {
      return localStorage.getItem(STORAGE_KEYS.RECOMMENDATIONS_TITLE) || '추천의 글';
    } catch (error) {
      console.error('Error getting recommendations title:', error);
      return '추천의 글';
    }
  },

  saveRecommendations: (title: string, recommendations: Recommendation[]): void => {
    try {
      // Save title
      localStorage.setItem(STORAGE_KEYS.RECOMMENDATIONS_TITLE, title);
      
      // Save recommendations to multiple keys for redundancy
      saveToMultipleKeys(recommendations, [
        STORAGE_KEYS.RECOMMENDATIONS_DIRECT,
        STORAGE_KEYS.RECOMMENDATIONS,
        'recommendation-data'
      ]);
      
      // Also save as a combined object
      saveToMultipleKeys(
        { title, recommendations },
        ['recommendations-full-data']
      );
      
      console.log('Recommendations saved:', { title, recommendations });
      
      // Trigger a custom event to notify other components that content has changed
      window.dispatchEvent(new CustomEvent('content-updated', { detail: { type: 'recommendations' } }));
      
      // Force a refresh of the page if we're on the recommendations page
      if (window.location.pathname === '/recommendations' || 
          window.location.pathname === '/intro/recommendations' ||
          window.location.hash === '#/recommendations' || 
          window.location.hash === '#/intro/recommendations') {
        console.log('On recommendations page, triggering reload');
        setTimeout(() => {
          window.location.reload();
        }, 100);
      }
    } catch (error) {
      console.error('Error saving recommendations:', error);
    }
  },

  // Course Goal content methods
  getCourseGoal: (): CourseGoal => {
    return loadFromMultipleKeys<CourseGoal>(
      [STORAGE_KEYS.COURSE_GOAL, STORAGE_KEYS.COURSE_GOAL_DIRECT],
      { title: '교육목표', content: '' }
    );
  },

  saveCourseGoal: (data: CourseGoal): void => {
    try {
      const formattedData: CourseGoal = {
        title: data.title || '교육목표',
        content: data.content || ''
      };
      
      saveToMultipleKeys(formattedData, [
        STORAGE_KEYS.COURSE_GOAL,
        STORAGE_KEYS.COURSE_GOAL_DIRECT
      ]);
      
      window.dispatchEvent(new CustomEvent('content-updated', { detail: { type: 'course-goal' } }));
    } catch (error) {
      console.error('Error saving course goal:', error);
    }
  },

  // Course Benefits content methods
  getCourseBenefits: (): CourseBenefit[] => {
    return loadFromMultipleKeys<CourseBenefit[]>(
      [STORAGE_KEYS.COURSE_BENEFITS, STORAGE_KEYS.COURSE_BENEFITS_DIRECT],
      []
    );
  },

  saveCourseBenefits: (benefits: CourseBenefit[]): void => {
    try {
      saveToMultipleKeys(benefits, [
        STORAGE_KEYS.COURSE_BENEFITS,
        STORAGE_KEYS.COURSE_BENEFITS_DIRECT
      ]);
      
      window.dispatchEvent(new CustomEvent('content-updated', { detail: { type: 'course-benefits' } }));
    } catch (error) {
      console.error('Error saving course benefits:', error);
    }
  },

  // Helper to parse content into paragraphs
  parseContentToParagraphs: (content: string): string[] => {
    // 연속된 줄바꿈(\n\n)을 기준으로 문단을 나눕니다.
    // 다양한 줄바꿈 패턴을 처리하기 위해 정규식을 사용합니다.
    return content.split(/\n\s*\n/).filter(paragraph => paragraph.trim() !== '');
  }
}; 