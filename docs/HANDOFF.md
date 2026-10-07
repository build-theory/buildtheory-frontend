# BuildTheory implementation handoff

## Architecture discovered

The original React/CRA interface used simulated account access, document uploads, patient browsing and browser-side Gemini questions. Its Flask backend used five specialized PDF extraction tasks (policy, discharge summary, bill, prescription, test report), parallel processing, fuzzy/date checks, Google Vision OCR and HTML/PDF reports. It had no database, vector search, external legal corpus or durable agent queue. Historical approval/denial and payable-amount logic is not presented as a product decision.

## Major changes

The existing specialists and consistency checks now serve an integrated BuildTheory website and case workspace. Public routes are `/`, `/product`, `/technology`, `/about`, `/privacy`, `/terms`; `/app` is the actual MVP. React is retained, with Vite replacing obsolete CRA tooling. Marketing pages are prerendered from the same components; the workspace loads separately. Branding, configuration, metadata, sitemap, accessibility styles and optional analytics events are centralized. Founder and email content is omitted until configured.

The Flask API adds session-owned cases, shared beta access, CSRF, bounded jobs, SQLite storage, PDF validation, progress, source downloads, case questions and deletion. A public synthetic replay requires no model account. A gated live sample sends the same five synthetic PDFs through real extraction and synthesis. Replay is explicitly disclosed and is not a live AI demonstration. Early-access submissions are validated and stored only when enabled; production requires an explicit persistent-storage acknowledgement.

## Claude integration

The official Anthropic Python SDK is used server-side in `agents/client.py`. Set `LLM_PROVIDER=anthropic`, `ANTHROPIC_API_KEY` and `ANTHROPIC_MODEL` to an enabled model ID. Claude performs five specialist document extractions, combined case synthesis and case questions. Existing Google support remains through `LLM_PROVIDER=google`, `GEMINI_API_KEY`, `GOOGLE_MODEL`. Google Vision OCR is separately optional. There is no public assertion that a particular provider is currently deployed.

## Security findings

Original Git-tracked credentials included model, SMTP/admin and service-account secrets; browser inference exposed a model credential. Active code no longer contains those literals. Secret files were untracked and ignored, private extracted material moved outside tracked source, and legacy deployment disabled. **Rotate/revoke every exposed credential and clean Git history before publishing. Untracking does not remove old commits.**

Fixed public patient/file access, unsafe upload paths, unrestricted origins, fake identity assumptions, verbose personal-data logging, exposed errors and unbounded uploads. Active PDFs are limited to 10 MB each, 25 MB total, 30 pages and bounded page dimensions. No executable upload serving or public email relay remains. Shared beta access and session ownership are appropriate for a small evaluation beta, not enterprise identity or regulated production assurance.

## Environment variables

Backend names (server-only): `APP_ENV`, `SECRET_KEY`, `LLM_PROVIDER`, `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`, `GEMINI_API_KEY`, `GOOGLE_MODEL`, `BETA_PASSWORD_HASH`, `CORS_ORIGINS`, `DATA_DIR`, `RETENTION_HOURS`, `EARLY_ACCESS_ENABLED`, `DATA_STORAGE_PERSISTENT`, `RATE_LIMIT_STORAGE_URI`, `OCR_ENABLED`, `GOOGLE_APPLICATION_CREDENTIALS`, `PORT`.

Frontend names (public, build-time): `REACT_APP_API_URL`, `REACT_APP_CONTACT_EMAIL`, `REACT_APP_FOUNDER_NAME`, `REACT_APP_FOUNDER_BIO`, `REACT_APP_FOUNDER_LINKEDIN`, `REACT_APP_FOUNDER_GITHUB`, `REACT_APP_ANALYTICS_ENABLED`.

Each repository README explains defaults and requirements; `.env.example` contains names only. Never put backend secrets in frontend settings. A public-replay production deployment needs `APP_ENV=production`, a strong stable `SECRET_KEY`, and `CORS_ORIGINS=https://buildtheory.dev`; live AI additionally requires a fresh model credential/model and beta password hash.

## Local run commands

Backend, from `buildtheory-backend` (Python 3.12 recommended):

```sh
python3 -m venv .venv
.venv/bin/pip install -r requirements.lock.txt
cp .env.example .env
.venv/bin/python app.py
```

Frontend, from `buildtheory-frontend` in another terminal (Node 24 recommended):

```sh
npm ci
cp .env.example .env
npm start
```

Visit `http://127.0.0.1:3000`. Leave the frontend API variable blank locally to use the development proxy. The sample works without model credentials. Generate the beta password hash using the interactive command in the backend README.

## Verification

- Frontend: dependency installation, ESLint, 2 tests and production build passed. Six marketing pages prerendered. Dependency audit reported zero known vulnerabilities at verification time.
- Backend: dependency installation, dependency consistency, Python compilation and 12 tests passed. Gunicorn startup and actual API health passed.
- Browser: all seven routes checked at 375, 768, 1280, 1440 and 1920 px with no horizontal overflow. Sample completed via the actual API, rendered review flags/sources, downloaded a synthetic policy PDF and returned a disclosed replay question response. Invalid login, navigation and keyboard focus were checked. No browser console warnings/errors were observed in the final browser check.
- Provider calls and live upload orchestration were tested with mocks; actual Claude/Google/OCR requests require fresh credentials and were **not** executed. Docker build was **not** executed successfully because the local daemon was unavailable. The tested Python runtime was 3.14; the Docker image specifies 3.12. Library deprecation warnings remain. No standalone TypeScript check applies to this JavaScript project.

## Production deployment and DNS

Recommended free beta: Render Static Site for the frontend (`npm ci && npm run build`, publish `build`) plus a free Render Docker web service for the API, with `/api/health` health checking. Set frontend `REACT_APP_API_URL=https://api.buildtheory.dev`. Backend uses a single Gunicorn worker, eight request threads and the included Dockerfile. Vercel frontend configuration is included, but Hobby is restricted to personal non-commercial use; check eligibility before using it for a startup.

Free Render services can sleep and have temporary storage. Keep `EARLY_ACCESS_ENABLED=false` and `DATA_STORAGE_PERSISTENT=false` on that configuration. Hosting can be free while model/OCR calls still incur charges. Durable contacts/customer files need a separately configured persistent deployment. This MVP uses one instance, local SQLite and an in-process queue; do not horizontally scale it.

Use hosting-provided A/ALIAS/ANAME values for `buildtheory.dev`, a hosting-provided CNAME for `api`, optional `www` redirect and any required verification TXT records. Both hosts require HTTPS certificates; `.dev` enforces HTTPS. No provider-specific target values have been invented. These two custom domains are same-site and support the configured session cookies; unrelated temporary hostnames require a same-origin proxy before the hosted session workflow works.

See `DEPLOYMENT.md` for exact dashboard settings, persistence, DNS and email setup.

## Remaining manual actions

1. Rotate exposed credentials and remove secrets from repository history before publishing; do not reuse original local credentials.
2. Choose hosting accounts, connect the two repositories, verify the Docker build on the host, configure secrets/custom domains and apply the actual DNS records supplied there.
3. Configure fresh provider credentials and an enabled model; run the gated synthetic live sample before enabling document uploads for others. Optional OCR needs separate Google credentials.
4. Keep real sensitive customer documents off the free temporary-storage evaluation deployment. Establish individual identity, durable storage, backups, operational monitoring and data-processing arrangements before broader production use.
5. Enable a verified mailbox and founder details only after they exist. Contact collection requires durable storage; no email is sent automatically.
6. Optionally rename GitHub repositories/descriptions manually. Local directories now use BuildTheory names; Git remotes still point to the original repositories. No commits, push or public deployment were performed.

## Claims requiring verification before publishing

Verify the chosen deployed provider/model, enabled upload/OCR features, storage/retention and processor arrangements against the privacy page. Confirm any founder biography, mailbox and links you add. Recheck free-platform terms when deploying. Pages deliberately make no customer, partnership, funding, incorporation, certification, accuracy, external legal retrieval or autonomous claim-decision claims. Outputs require human review and are not legal advice.
