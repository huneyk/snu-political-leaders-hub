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
  GREETING: 'greeting-data'
};

// Content service methods
export const contentService = {
  // Greeting content methods
  getGreetingContent: (): GreetingContent => {
    try {
      const storedData = localStorage.getItem(STORAGE_KEYS.GREETING);
      if (storedData) {
        return JSON.parse(storedData);
      }
      return DEFAULT_GREETING;
    } catch (error) {
      console.error('Error getting greeting content:', error);
      return DEFAULT_GREETING;
    }
  },

  saveGreetingContent: (data: GreetingContent): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.GREETING, JSON.stringify(data));
      // Trigger a custom event to notify other components that content has changed
      window.dispatchEvent(new CustomEvent('content-updated', { detail: { type: 'greeting' } }));
    } catch (error) {
      console.error('Error saving greeting content:', error);
    }
  },

  // Helper to parse content into paragraphs
  parseContentToParagraphs: (content: string): string[] => {
    // 연속된 줄바꿈(\n\n)을 기준으로 문단을 나눕니다.
    // 다양한 줄바꿈 패턴을 처리하기 위해 정규식을 사용합니다.
    return content.split(/\n\s*\n/).filter(paragraph => paragraph.trim() !== '');
  }
}; 