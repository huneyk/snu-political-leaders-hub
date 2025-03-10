#!/bin/bash
set -e

# 디버깅을 위한 정보 출력
echo "Current directory: $(pwd)"
ls -la

# 루트 디렉토리 패키지 설치
npm install

# build 디렉토리 생성
mkdir -p build

# React 앱 디렉토리로 이동
cd snu-political-leaders-hub
echo "React app directory: $(pwd)"
ls -la

# React 앱 패키지 설치
npm install

# package.json 확인
cat package.json

# Vite 직접 실행
npx vite build

# 루트 디렉토리로 돌아옴
cd ..

# 빌드된 파일 복사
cp -r snu-political-leaders-hub/dist/* build/

echo "Build completed successfully!"