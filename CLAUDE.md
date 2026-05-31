# Amine-Fit — Project Instructions

## Git Workflow

**Always commit and push directly to `main`.**

- Never create feature branches
- Every change goes straight to `main` → Vercel deploys automatically
- After each task: `git add <files> && git commit && git push origin main`

## Stack

- Next.js 14 App Router — Arabic RTL UI, Tailwind CSS
- Upstash Redis — data storage (double-encoded JSON, needs two `JSON.parse()`)
- Cookie auth: `admin_token` (dashboard) + `client_token` (HMAC-SHA256, 30-day)
- Resend API — email notifications (`RESEND_API_KEY` env var)
- Gold color scale: `gold-400` = amber/yellow tones

## Key Files

- `lib/nutritionEngine.js` — Harris-Benedict BMR + ADA food exchange engine
- `lib/submissions.js` — Redis read/write helpers
- `lib/clientAuth.js` — client token logic
- `middleware.js` — protects `/dashboard/*` and `/client/*`
- `app/dashboard/calculator/page.js` — nutrition plan generator UI
- `app/plan-report/page.js` — standalone print/PDF report page
