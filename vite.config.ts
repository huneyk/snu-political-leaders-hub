import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Vite Configuration for SNU Political Leaders Hub
// Updated: 2024-07-28 - Build cache invalidation
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    // 빌드 최적화 설정
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        // manualChunks 제거: React/Radix UI를 분리하면 Rollup이 청크 간
        // 초기화 순서를 보장하지 못해 production 번들에서
        // "Cannot set properties of undefined (setting 'Children')" 오류가 발생함.
        // Vite/Rollup의 자동 청크 분할에 위임한다.
        // 파일 이름 패턴 설정
        assetFileNames: (assetInfo) => {
          if (!assetInfo.name) return `assets/[name]-[hash][extname]`;
          const info = assetInfo.name.split('.');
          const extType = info[info.length - 1];
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name)) {
            return `images/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
      },
    },
    chunkSizeWarningLimit: 1000,
    cssCodeSplit: true,
  },
  server: {
    host: "::",
    port: 8080,
    strictPort: true,
    // 개발 서버 프록시 설정
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('프록시 오류:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('프록시 요청:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('프록시 응답:', req.method, req.url, proxyRes.statusCode);
          });
        }
      },
    },
  },
  // 글로벌 상수 정의
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV !== 'production'),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    __CACHE_BUST__: JSON.stringify(Date.now()),
  },
});
