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

export default function Home() {
  return (
    <div className="home">
      <main className="home__main">
        <section className="home__hero">
          <div>
            <p className="home__eyebrow">Wanted Attendance Suite</p>
            <h1>근태, 예약, 휴가를 하나의 경험으로</h1>
            <p className="home__sub">
              Cloudflare Pages + D1 + Expo 조합으로 웹과 모바일을 동시에 지원하는
              스마트 근무 플랫폼을 준비 중입니다.
            </p>
            <div className="home__actions">
              <a className="btn btn--primary" href="https://cloudflare.com" target="_blank" rel="noreferrer">
                인프라 개요
              </a>
              <a className="btn btn--ghost" href="https://github.com" target="_blank" rel="noreferrer">
                GitHub 이동
              </a>
            </div>
          </div>
        </section>

        <section className="home__grid" aria-label="핵심 기능 목록">
          {FEATURES.map((feature) => (
            <article key={feature.title} className="home__card">
              <h2>{feature.title}</h2>
              <p>{feature.description}</p>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
