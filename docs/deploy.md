# Cloudflare Pages 배포 가이드

## Next.js (웹)

1. **빌드 명령**

   ```
   npm run build:web
   ```

   - 내부적으로 `apps/web`에서 `next build` 실행 후 `npx @cloudflare/next-on-pages --skip-build`로 `.vercel/output` 구조를 생성합니다.

2. **Cloudflare Pages 설정**
   - Root Directory: `apps/web`
   - Build command: `npm run build:web`
   - Build output directory: `.vercel/output/static`
   - Functions directory: `.vercel/output/functions` (생성 시 자동 감지)
   - 환경 변수: `NODE_VERSION=18.18.0` 이상 권장

3. **주의 사항**
   - `apps/web/tsconfig.json`은 독립적으로 구성되어 있으므로, Pages 빌더가 상위 디렉터리를 복사하지 않아도 됩니다.
   - 배포 후 404가 나올 경우 `.vercel` 산출물이 생성되었는지와 Pages 설정이 위 값과 일치하는지 확인하세요.

## Cloudflare Worker (API)

- `apps/worker` 디렉터리에서 `npm install && npm run deploy` 또는 `wrangler deploy` 명령을 실행합니다.
- Worker는 Pages와 분리된 프로젝트로 운영하며, D1 바인딩 정보는 `wrangler.toml`에 입력합니다.

