#!/bin/bash

# 모든 Vite 프로세스 종료
pkill -f "node.*vite" || true

# 개발 서버 실행
cd "$(dirname "$0")" && npm run dev