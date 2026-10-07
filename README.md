# BuildTheory

Agentic AI for insurance operations. This React application integrates a public startup website and a real case workspace. BuildTheory is in development and preparing for private beta; there are no customer, traction, compliance, calibrated accuracy or incorporated-entity claims.

## Routes

`/` homepage · `/product` real capabilities · `/technology` architecture · `/about` approach and optional founder · `/contact` contact options · `/privacy` data handling · `/terms` beta use · `/app` actual case workspace.

## Setup (Node 22.12+; Node 24 recommended)

```sh
npm ci
cp .env.example .env
npm start
```

Run the Flask backend on port 5000 in another terminal. In local development REACT_APP_API_URL can be empty: the Vite development proxy sends /api to localhost:5000. The public sample needs no model key. Live uploads and live sample inference require backend model credentials and beta access.

## Environment variables (all public, build-time)

| Variable | Value |
|---|---|
| REACT_APP_API_URL | Production https://api.buildtheory.dev; empty for local development proxy |
| REACT_APP_CONTACT_EMAIL | Blank until a real enabled mailbox exists |
| REACT_APP_FOUNDER_NAME | Optional verified founder name |
| REACT_APP_FOUNDER_BIO | Optional verified bio; founder section requires name and bio |
| REACT_APP_FOUNDER_LINKEDIN | Optional HTTPS profile |
| REACT_APP_FOUNDER_GITHUB | Optional HTTPS profile |
| REACT_APP_ANALYTICS_ENABLED | Default off; true emits named DOM events only, no tracker or destination |

Do not set any model key or backend secret in frontend environment variables. `src/config.js` centralizes the product configuration. Contact and founder sections omit themselves when unconfigured. Early-access availability comes from the backend, not a fake frontend success state.

## Validation and production build

```sh
npm run lint
npm test
npm run build
```

JavaScript project: no standalone TypeScript typecheck exists; lint/tests and production compilation are the relevant checks. The postbuild script prerenders the seven marketing routes from the same React components for crawlable content and per-page metadata. The workspace is lazy-loaded. No remote fonts, third-party brand logos or default trackers are used. Reduced-motion support, labels, keyboard focus, skip link and responsive navigation are included.

## Free deployment

Recommended: Render Static Site. Build `npm ci && npm run build`, publish `build`, custom domain buildtheory.dev, API at api.buildtheory.dev. Configure SPA fallback `/* -> /index.html` after static-file resolution. The included render.yaml describes the frontend service. Free backend storage is temporary and may sleep; contact collection should remain off. Live AI/API calls can cost money independently of hosting.

Vercel configuration is also provided. Import the frontend repository, Vite preset, build npm run build, output build. Vercel Hobby currently restricts commercial use; use an eligible plan or choose Render for the free startup beta.

The included docs/DEPLOYMENT.md gives full two-repository setup, DNS, HTTPS, persistence and domain email. No hosting-specific DNS target has been invented. Before custom domains, unrelated frontend/backend hosts need a same-origin API proxy to avoid third-party cookie restrictions. The recommended custom-domain pair is same-site.

## Analytics

Events: homepage_view, try_beta_clicked, sample_claim_started, claim_analysis_started, claim_analysis_completed, early_access_opened, early_access_submitted. Optional host listener: `window.addEventListener('buildtheory:analytics', handler)`. Only the event name is emitted; no document/identity payload. Review privacy notice before adding any actual analytics vendor.

## Legacy source

Prior UI/components are retained under legacy/ for historical reference and excluded from the build. Original patient browsing and browser inference were replaced with the secure backend case API. Local directories use BuildTheory names; existing Git remotes were preserved. Rename GitHub repositories/descriptions manually when desired; suggested description: “BuildTheory — assistive insurance document intelligence with specialized model tasks and human review.”

Full implementation and verification report: [docs/HANDOFF.md](docs/HANDOFF.md).
