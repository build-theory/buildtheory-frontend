# BuildTheory deployment

## Recommended free beta: Render static site + Render Python web service

The static frontend is free to host. The free backend sleeps after inactivity and has an ephemeral filesystem. It can run the public synthetic replay and configured live beta processing; do not present it as durable customer storage. Model/OCR API usage is separate from hosting and may incur charges.

Use `https://buildtheory.dev` for the frontend and `https://api.buildtheory.dev` for the backend. They are same-site HTTPS hosts, so the Lax session cookie works with credentialed API calls. This also avoids third-party cookie restrictions between unrelated hosting domains.

### Two existing GitHub repositories

Frontend Render Static Site:
- Repository: existing frontend repository (no directory rename needed).
- Build: `npm ci && npm run build`
- Publish directory: `build`
- Set `REACT_APP_API_URL=https://api.buildtheory.dev` before building.
- Add custom domain `buildtheory.dev`.
- Rewrite `/*` to `/index.html` for workspace and unknown SPA paths; existing prerendered route files must take precedence.
- Configure X-Content-Type-Options: nosniff, X-Frame-Options: DENY and Referrer-Policy: strict-origin-when-cross-origin response headers.

Backend Render Web Service:
- Repository: existing backend repository.
- Runtime: Docker using included Dockerfile. Plan: Free.
- Health: `/api/health`.
- Add custom domain `api.buildtheory.dev`.
- Set APP_ENV=production; a random SECRET_KEY of >=32 characters; CORS_ORIGINS=https://buildtheory.dev; DATA_DIR=/app/data; EARLY_ACCESS_ENABLED=false; DATA_STORAGE_PERSISTENT=false; LLM_PROVIDER=anthropic; ANTHROPIC_MODEL=<enabled model ID from your account>; ANTHROPIC_API_KEY=<new secret>; BETA_PASSWORD_HASH=<generated password hash>. Do not put secrets in frontend settings.
- Public replay works without model credentials. For that deployment, leave model credentials and beta password unset.
- PORT is supplied by Render. One worker is intentional. Do not enable autoscaling or multiple instances with local SQLite/session jobs.

The root `render.yaml` is a blueprint for the workspace combined into one repository. With separate repositories, use the dashboard settings above. The frontend also includes its own render.yaml.

### Vercel compatibility

The frontend contains vercel.json and builds on Vercel as Vite, root = frontend repository, output = build. The backend remains on Render. Set the same API variable and custom domains. Vercel’s Hobby fair-use rules currently restrict it to non-commercial personal projects; do not assume a startup product qualifies. Render static hosting is the suggested free alternative. No Vercel server functions are required or provided.

### Before custom domains exist

For local testing, Vite proxies `/api` to localhost:5000. Hosted frontend and backend on unrelated domains require a same-origin API proxy or explicit cross-site cookie configuration. This repository deliberately uses secure same-site production cookies. Configure the two custom domains before using the hosted beta session workflow. Do not silently switch cookies to cross-site mode.

## DNS and HTTPS

At your DNS provider:
- Apex `buildtheory.dev`: use the A/ALIAS/ANAME records shown by your chosen frontend host, with exactly its provided values.
- `www`: optional CNAME to the frontend host’s specified target, then configure an HTTPS redirect to the apex.
- `api`: CNAME to the backend service hostname provided by Render.
- Domain verification TXT records: only if requested by the chosen host.
- Remove conflicting apex/API records as necessary after checking existing services.

No provider target values have been invented. Wait until hosting dashboards give the records. Both hosts must issue valid TLS certificates before testing. `.dev` requires HTTPS in browsers.

## Persistent deployment path

Use a persistent disk mounted at DATA_DIR for the current single-instance SQLite/file architecture. Back up both the database and case directories consistently; restrict access to backups and define backup retention. Set DATA_STORAGE_PERSISTENT=true only after a real durable mount is configured. Enable EARLY_ACCESS_ENABLED=true only then. Free Render disks are unavailable; this durability upgrade generally costs money.

Before real customer data or multiple instances: implement individual accounts, object storage, managed database, a durable job queue, role-based access, operational monitoring and a data-processing review. The current shared beta password is intentionally not enterprise authentication.

## Operations

- Run Gunicorn with exactly one worker and eight request threads; two processing jobs plus bounded queued jobs. Provider request timeout is 120 seconds; one SDK retry. A case invokes multiple model calls.
- Restart marks unfinished cases interrupted. No resume promise. Retention cleanup runs on case requests; also schedule `python maintenance.py` on a persistent deployment for regular expiration cleanup.
- Keep access logs away from document bodies and query strings containing personal information. Do not enable debug logging.
- Do not use `legacy/legacy_app.py` as an entrypoint.
- Persist a strong SECRET_KEY across deploys to preserve session cookies where case storage is durable.
- Optional RATE_LIMIT_STORAGE_URI can point to Redis (install the redis extra); single-instance memory limits reset on restart and are suitable only for this small beta.

## Email

No mailbox exists by implication. Leave REACT_APP_CONTACT_EMAIL blank until you create and verify a mailbox. Choose an email provider, verify domain ownership, then add its exact MX records and SPF/DKIM records. Add a DMARC policy after testing delivery. Enable hello@buildtheory.dev only after inbound/outbound verification. founder@ and support@ are optional aliases. This product does not send email automatically and stores early-access requests only when enabled; read them using `python maintenance.py --export-early-access <private-file-path>` on the backend host. Protect exports as personal data. No public admin endpoint exists.

## Official platform references

- https://render.com/docs/free
- https://render.com/docs/custom-domains
- https://render.com/docs/tls
- https://vercel.com/docs/frameworks/frontend/vite
- https://vercel.com/docs/limits/fair-use-guidelines
