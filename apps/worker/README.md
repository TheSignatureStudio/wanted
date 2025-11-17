# Wanted Worker

Cloudflare Pages Functions/Workers 기반 API 레이어입니다. D1 데이터베이스를 사용하며 `/v1` 네임스페이스에 근무 위치, 회의실, 재택 일정 엔드포인트를 제공합니다.

## 개발 실행

```bash
cd apps/worker
npm install
npm run dev
```

Wrangler는 `wrangler.toml`에 정의된 더미 D1 바인딩(`DB`)을 사용합니다. 실제 프로젝트에서는 Cloudflare D1 인스턴스 ID를 주입하세요.

## 엔드포인트

- `GET /` – 서비스 버전 정보
- `GET /health` – D1 헬스체크
- `GET /v1/rooms` – 회의실/Zoom 리소스 목록
- `GET /v1/work-locations` – GPS 지오펜스 목록
- `GET /v1/remote-schedules?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD` – 재택 신청 현황

## 스키마

`schema.sql` 파일에 D1 테이블 설계를 포함했습니다. `wrangler d1 execute` 명령으로 초기화하거나, 추후 Drizzle 등 ORM 마이그레이션으로 전환할 수 있습니다.

