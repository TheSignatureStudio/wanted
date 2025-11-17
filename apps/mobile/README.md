# Wanted Attendance Mobile App

React Native (Expo) 기반의 모바일 출퇴근 관리 앱입니다.

## 주요 기능

### 📱 출퇴근 체크
- GPS 기반 위치 확인
- 실시간 출퇴근 기록
- 오늘의 근무 일정 표시

### 🏠 홈 대시보드
- 오늘의 근무 요약
- 주간 근무 시간 통계
- 남은 연차 확인
- 빠른 실행 메뉴

### 📋 더보기
- 각종 신청 및 예약 기능 접근
- 사용자 프로필
- 앱 정보 및 설정

## 시작하기

### 개발 환경 실행

```bash
# 의존성 설치
npm install

# Expo 개발 서버 시작
npx expo start

# 또는 루트에서
cd ../../
npm run dev:mobile
```

### 플랫폼별 실행

- **iOS**: `i` 키를 누르거나 Expo Go 앱에서 QR 코드 스캔
- **Android**: `a` 키를 누르거나 Expo Go 앱에서 QR 코드 스캔
- **Web**: `w` 키를 눌러 브라우저에서 실행

## 필요한 권한

### iOS
- 위치 정보 (출퇴근 확인용)

### Android
- ACCESS_FINE_LOCATION (정확한 위치)
- ACCESS_COARSE_LOCATION (대략적인 위치)

## 기술 스택

- **Framework**: Expo / React Native
- **Navigation**: Expo Router (파일 기반 라우팅)
- **Language**: TypeScript
- **Styling**: StyleSheet (React Native 기본)
- **Location**: expo-location

## 프로젝트 구조

```
apps/mobile/
├── app/                    # 라우팅 (Expo Router)
│   ├── (tabs)/
│   │   ├── index.tsx      # 홈 화면
│   │   ├── attendance.tsx # 출퇴근 체크
│   │   └── explore.tsx    # 더보기
│   └── _layout.tsx
├── components/            # 재사용 컴포넌트
├── constants/             # 테마 및 상수
│   └── theme.ts
├── hooks/                 # 커스텀 훅
└── assets/               # 이미지 및 정적 파일
```

## 테마

앱은 다크/라이트 모드를 자동으로 지원하며, `constants/theme.ts`에서 커스터마이징할 수 있습니다.

## 빌드 및 배포

### EAS Build (권장)

```bash
# EAS CLI 설치
npm install -g eas-cli

# EAS 프로젝트 설정
eas build:configure

# 개발 빌드
eas build --platform ios --profile development
eas build --platform android --profile development

# 프로덕션 빌드
eas build --platform all --profile production
```

### 로컬 빌드

```bash
# iOS (맥 필요)
npx expo run:ios

# Android
npx expo run:android
```

## 환경 변수

`.env` 파일을 생성하여 API 엔드포인트를 설정하세요:

```
EXPO_PUBLIC_API_URL=https://your-worker-api.workers.dev
```

## 문제 해결

### 위치 권한 오류
- iOS: 시뮬레이터에서는 위치 시뮬레이션 설정 필요
- Android: AVD에서 위치 설정 필요

### 빌드 오류
```bash
# 캐시 및 node_modules 삭제
rm -rf node_modules
npm install

# Expo 캐시 클리어
npx expo start -c
```

## 참고 자료

- [Expo 문서](https://docs.expo.dev/)
- [React Native 문서](https://reactnative.dev/)
- [Expo Router 문서](https://docs.expo.dev/router/introduction/)
- [expo-location 문서](https://docs.expo.dev/versions/latest/sdk/location/)
