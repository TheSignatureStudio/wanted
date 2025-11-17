const NAV_ITEMS = [
  { href: "#vision", label: "비전" },
  { href: "#features", label: "핵심 기능" },
  { href: "#timeline", label: "로드맵" },
  { href: "#resources", label: "문서" },
  { href: "/dashboard", label: "대시보드" },
];

const FEATURES = [
  {
    title: "GPS & 재택 출근",
    description:
      "지오펜스 기반 출근 인증과 재택 승인 흐름으로 유연한 근무 정책을 운영합니다.",
  },
  {
    title: "회의실 · Zoom 예약",
    description:
      "공간과 화상 회의 리소스를 통합 예약하고 중복·승인 상태를 실시간으로 확인합니다.",
  },
  {
    title: "52시간 규제 가드레일",
    description:
      "주 단위 근무 시간을 자동 합산하여 초과 근무 알림과 승인 워크플로우를 제공합니다.",
  },
  {
    title: "휴가 & 통계 캘린더",
    description:
      "잔여 휴가, 재택 일정, 월별 근무 시간을 한 눈에 확인하고 CSV/ICS로 내보냅니다.",
  },
];

const METRICS = [
  {
    label: "Cloudflare Pages 배포",
    value: "<5분",
    detail: "GitHub push 후 자동 빌드",
  },
  {
    label: "Expo OTA",
    value: "즉시",
    detail: "앱 업데이트 리드타임",
  },
  {
    label: "근무 정책",
    value: "52h SAFE",
    detail: "주 52시간 모니터링",
  },
];

const TIMELINE = [
  {
    quarter: "Q1",
    title: "MVP 클로즈드 베타",
    detail: "GPS 출근 · 재택 승인 · 회의실 예약 코어 플로우 완성",
  },
  {
    quarter: "Q2",
    title: "확장 & 통합",
    detail: "Zoom 연동, 캘린더 공유, Slack/이메일 알림",
  },
  {
    quarter: "Q3",
    title: "정책 자동화",
    detail: "52시간 규제 가드레일, 휴가 정책 엔진, 데이터 웨어하우스 연동",
  },
];

const RESOURCES = [
  {
    title: "요구사항 & 아키텍처",
    description: "역할, 기능, 데이터 모델 초안을 문서화했습니다.",
    action: {
      label: "문서 열기",
      href: "https://github.com/TheSignatureStudio/wanted/tree/main/docs/requirements.md",
    },
  },
  {
    title: "작업 로그",
    description: "세션별 진행 상황과 의사결정을 한 곳에 기록합니다.",
    action: {
      label: "progress.md",
      href: "https://github.com/TheSignatureStudio/wanted/tree/main/docs/progress.md",
    },
  },
  {
    title: "Cloudflare Worker",
    description: "D1 헬스체크 API와 wrangler 기반 배포 구성을 제공합니다.",
    action: {
      label: "코드 보기",
      href: "https://github.com/TheSignatureStudio/wanted/tree/main/apps/worker",
    },
  },
];

export default function Home() {
  return (
    <div className="home">
      <a className="skip-link" href="#main-content">
        본문 바로가기
      </a>
      <header className="site-header" role="banner">
        <div className="site-header__brand">
          <span className="badge">Beta</span>
          <strong>Wanted Attendance Suite</strong>
        </div>
        <nav aria-label="주요 섹션">
          <ul>
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <a href={item.href}>{item.label}</a>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <main className="home__main" id="main-content">
        <section className="home__hero" id="vision">
          <div>
            <p className="home__eyebrow">클라우드 네이티브 근무 플랫폼</p>
            <h1>근태, 예약, 휴가를 하나의 경험으로</h1>
            <p className="home__sub">
              Cloudflare Pages + D1 + Expo 조합으로 웹과 모바일을 동시에 지원하는
              스마트 근무 플랫폼을 준비 중입니다. 직원과 관리자가 같은 데이터를
              같은 속도로 확인하고, 정책은 자동 감시합니다.
            </p>
            <div className="home__actions">
              <a
                className="btn btn--primary"
                href="https://developers.cloudflare.com/d1/"
                target="_blank"
                rel="noreferrer"
              >
                인프라 개요
              </a>
              <a
                className="btn btn--ghost"
                href="https://github.com/TheSignatureStudio/wanted"
                target="_blank"
                rel="noreferrer"
              >
                GitHub 이동
              </a>
            </div>
          </div>
        </section>

        <section className="home__metrics" aria-label="진행 현황 요약">
          {METRICS.map((metric) => (
            <article key={metric.label}>
              <p className="metric__value">{metric.value}</p>
              <p className="metric__label">{metric.label}</p>
              <p className="metric__detail">{metric.detail}</p>
            </article>
          ))}
        </section>

        <section className="home__grid" id="features" aria-label="핵심 기능 목록">
          {FEATURES.map((feature) => (
            <article key={feature.title} className="home__card">
              <h2>{feature.title}</h2>
              <p>{feature.description}</p>
            </article>
          ))}
        </section>

        <section className="home__timeline" id="timeline" aria-label="로드맵">
          <h2>2025 로드맵</h2>
          <ol>
            {TIMELINE.map((item) => (
              <li key={item.quarter}>
                <div className="timeline__quarter">{item.quarter}</div>
                <div>
                  <p className="timeline__title">{item.title}</p>
                  <p className="timeline__detail">{item.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="home__resources" id="resources" aria-label="참고 리소스">
          {RESOURCES.map((resource) => (
            <article key={resource.title}>
              <header>
                <h3>{resource.title}</h3>
                <p>{resource.description}</p>
              </header>
              <a className="btn btn--ghost" href={resource.action.href} target="_blank" rel="noreferrer">
                {resource.action.label}
              </a>
            </article>
          ))}
        </section>
      </main>
      <footer className="site-footer">
        <p>
          Cloudflare Pages · D1 · Expo · Next.js — 모든 근무 데이터를 한곳에서
          관리하세요.
        </p>
      </footer>
    </div>
  );
}
