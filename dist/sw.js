// 캐시 이름 설정
const CACHE_NAME = 'snu-plp-cache-v1';

// 캐시할 파일 목록
const urlsToCache = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/index.css',
  '/logo.png',
  '/logo-white.png',
  '/favicon.ico'
];

// 서비스 워커 설치 시 캐시 생성
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  // 대기 중인 서비스 워커를 즉시 활성화
  self.skipWaiting();
});

// 네트워크 요청 가로채기
self.addEventListener('fetch', event => {
  // 해시 라우팅 처리 - 무한 새로고침 방지를 위해 수정
  if (event.request.url.includes('#')) {
    // 해시가 포함된 URL은 처리하지 않고 그대로 통과시킴
    return;
  }

  // API 요청이나 외부 리소스는 캐싱하지 않음
  if (!event.request.url.startsWith(self.location.origin) || 
      event.request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 캐시에서 찾은 경우 캐시된 응답 반환
        if (response) {
          return response;
        }

        // 캐시에 없는 경우 네트워크에서 가져오기
        return fetch(event.request)
          .then(response => {
            // 유효한 응답인지 확인
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // 응답 복제 (스트림은 한 번만 사용 가능)
            const responseToCache = response.clone();

            // 응답을 캐시에 저장
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // 네트워크 요청 실패 시 오프라인 페이지 제공
            if (event.request.url.includes('html')) {
              return caches.match('/index.html');
            }
          });
      })
  );
});

// 캐시 업데이트
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // 오래된 캐시 삭제
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // 활성화 즉시 모든 클라이언트 제어 시작
      return self.clients.claim();
    })
  );
});

// 메시지 처리 (캐시 새로고침 등)
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'REFRESH_CACHE') {
    // 특정 URL의 캐시 새로고침
    const urls = event.data.urls || ['/index.html'];
    
    caches.open(CACHE_NAME)
      .then(cache => {
        urls.forEach(url => {
          // 무한 새로고침 방지를 위해 캐시 헤더 추가
          fetch(url, { 
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0'
            }
          })
            .then(response => {
              if (response.ok) {
                cache.put(url, response);
              }
            })
            .catch(error => {
              console.error('Cache refresh failed:', error);
            });
        });
      });
  }
}); 