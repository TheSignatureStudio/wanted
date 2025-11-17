# Wanted Attendance Suite

근태 관리, 회의실·화상회의 예약, 재택·GPS 출근 제어를 통합 제공하는 웹/모바일 하이브리드 애플리케이션입니다. GitHub을 소스 원격 저장소로 사용하고, Cloudflare Pages & Workers + D1 조합으로 인프라를 구성합니다. 모바일 앱은 Expo 기반으로 빌드하여 OTA 업데이트 및 스토어 배포를 지원합니다.

## 핵심 목표

- 직원·관리자 전용 대시보드에서 출퇴근 기록, 근무 통계, 휴가 잔여 일수를 즉시 파악
- GPS 지오펜스 및 재택 승인 로직을 통한 출근 위치 제어
- 회의실 및 Zoom 리소스 예약/승인/중복 관리
- 주 52시간 규제 자동 감시 및 알림
- 월 캘린더 뷰 기반 근무·휴가·재택 내역 시각화

## 오늘의 진행 상황

- npm 워크스페이스 + Turborepo 기반 모노레포 구성
- Next.js(App Router) 웹 앱, Expo 기반 모바일 앱, Cloudflare Worker(API) 스캐폴딩
- 단일 CSS 전략을 반영한 웹 홈 화면 메시지 업데이트
- 접근성 요소(스킵 링크, ARIA)와 로드맵/리소스 섹션을 포함한 UX 확장

## 문서

- `docs/requirements.md`: 기능 요구사항, 사용자 역할, 규정 로직 요약
- `docs/progress.md`: 작업 세션별 진행 로그

## 모노레포 구성

```
apps/
  web/      # Next.js 15 기반 Cloudflare Pages 타겟 웹
  mobile/   # Expo 관리형 앱 (iOS/Android/Web)
  worker/   # Cloudflare Worker + D1 API
docs/        # 요구사항 및 진행 로그
```

## 사용 방법

```bash
# 의존성 설치
npm install

# 웹 개발 서버
npm run dev:web

# 모바일 앱(Expo)
npm run dev:mobile

# Cloudflare Worker 로컬
npm run dev --workspace @wanted/worker
```

