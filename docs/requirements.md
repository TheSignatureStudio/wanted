# 요구사항 및 아키텍처 개요

## 사용자 역할

- **관리자(Admin)**: 지점/팀 관리, GPS 지오펜스 등록, 재택 정책 설정, 회의실·Zoom 리소스 등록, 근무/휴가 승인, 규정 위반 모니터링.
- **매니저(Manager)**: 소속 팀 일정 승인, 회의실 관리, 근무 통계 확인, 팀 휴가 독려.
- **직원(Staff)**: 출퇴근 기록, 재택·휴가 신청, 회의실/Zoom 예약, 통계 조회.

## 기능 개요

1. **출퇴근 및 위치 제어**
   - GPS 기반 지오펜스: 지점별 허용 반경 정의, 모바일 앱에서 위치 인증 후 출근 처리.
   - 재택 근무: 날짜별 신청/승인/취소, 승인 기간에는 위치 검증 우회.
   - 외근/방문객 모드 등 확장 여지 확보.

2. **근무 시간 규정**
   - 주 단위(월~일) 집계로 52시간 초과 감시.
   - 경고 알림, 관리자 승인 워크플로우, 추가 수당 데이터 기록.

3. **휴가 관리**
   - 연차/반차/반반차 등 유형별 잔여 일수 계산.
   - 발생/이월 규칙 정의, 사용 독려 알림, 계획 등록.

4. **회의실 & Zoom 예약**
   - 관리자가 공간/장비/화상 회의 계정 등록.
   - 직원이 시간대·참석자·장비 선택 후 예약, 중복 방지 및 승인 흐름.
   - Zoom 미팅 자동 생성(추후 API 연동) 및 링크 공유.

5. **통계 & 캘린더**
   - 월별 달력에서 근무 시간, 재택/휴가 상태, 초과근무 하이라이트.
   - 주/월/연 단위 리포트, CSV/ICS 내보내기.

## 기술 스택 제안

- **프론트엔드**: Next.js 15(App Router) + React Query, Shadcn UI 기반 컴포넌트, React Hook Form.
- **모바일**: Expo(React Native) + Expo Router, 웹 코드 일부 공유(모듈/서비스 레이어).
- **백엔드**: Cloudflare Pages Functions or Workers, tRPC/REST 혼합 가능.
- **데이터베이스**: Cloudflare D1 + Drizzle ORM (마이그레이션 wrangler 통합).
- **인증**: Clerk 혹은 Auth0(SSO, MFA), RBAC로 Admin/Manager/Staff 구분.
- **알림**: Expo Push, 이메일(Webhook via Resend), Slack Webhook optional.

## 데이터 모델 초안

- `users`: 기본 프로필, 역할, 팀, 근무 형태.
- `teams`: 조직 구조, 관리자 연결.
- `work_locations`: 지점 정보, 좌표/반경, 근무 유형.
- `remote_schedules`: 사용자별 재택 신청/승인 기록, 상태.
- `attendance_logs`: 출퇴근 시각, 위치 인증 결과, 근무 타입.
- `weekly_summaries`: 집계된 주간 근무 시간, 초과 여부, 승인 상태.
- `leave_policies`, `leave_balances`, `leave_requests`: 휴가 정책/잔여/신청 흐름.
- `resources`: 회의실/Zoom/장비 엔티티, 속성.
- `reservations`: 예약 정보, 참석자, 상태, 관련 리소스 링크.

## 향후 단계

1. 사용자 여정(출근, 예약, 휴가) 플로우차트 및 API 요구사항 상세화
2. 와이어프레임/디자인 시스템 정의
3. 모노레포(예: Turborepo) 구성 및 패키지 결정
4. Cloudflare Wrangler, Expo EAS CI 파이프라인 설계

