# Field Compliance

A self-hosted, mobile-and-desktop-responsive field testing platform for electrical
businesses. The first tool covers **Exit & Emergency Lighting testing** to
AS/NZS 2293: build a profile for each customer site (fittings, a reference photo
per fitting, an uploadable site/floor plan PDF), run test jobs against that site,
record a before/after photo and pass/fail checklist per fitting per visit, and
generate a clean, branded PDF report that highlights anything needing repair.

Built to support **multiple businesses** (multi-tenant) and **multiple tools**
over time — Exit & Emergency Lighting is the first of several planned testing
tools sharing the same customers/sites/jobs backbone.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Prisma + SQLite (file-based, no external database service required)
- Auth.js (NextAuth v5) with email/password login, JWT sessions
- `@react-pdf/renderer` for branded PDF report generation
- File uploads (logos, fitting photos, before/after photos, site plan PDFs)
  stored on local disk and served through an authenticated API route

## Getting started (development)

```bash
npm install
cp .env.example .env        # then set a real AUTH_SECRET (see below)
npx prisma migrate deploy
npm run dev
```

Open http://localhost:3000, click **Create an account** to register your
business (this creates the first user as the business Owner), then sign in.

## Environment variables

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | SQLite connection string, e.g. `file:./dev.db` |
| `AUTH_SECRET` | Random secret used to sign session cookies. Generate with `openssl rand -hex 32`. **Must** be set to a real value in production. |

## Deploying (self-hosted)

```bash
npm install
npm run build
npx prisma migrate deploy
npm run start -- -p 3000
```

Run this behind a reverse proxy (Caddy, Nginx, etc.) that terminates TLS.
The app trusts the incoming `Host` header (`trustHost: true`), so no fixed
`AUTH_URL` is required — just make sure the proxy forwards the correct host.

**Persistent state to back up / preserve across deploys:**

- `dev.db` (the SQLite database) — the file named by `DATABASE_URL`
- `uploads/` — logos, fitting photos, before/after photos, site plan PDFs

Both are deliberately outside `public/`, because Next's production server
(`next start`) only serves what's inside `public/` when it started — files
written there at runtime (like these uploads) would 404. They're served
instead through `src/app/api/uploads/[...path]/route.ts`, which streams them
from disk on every request and checks that the requesting user belongs to the
business that owns the file.

## Data model

- **Business** — a tenant. Holds branding (logo, name, email, phone, address,
  REC/license number, ABN) shown on every PDF report. Settings are editable
  by Owner/Admin users.
- **User** — belongs to one business; role is Owner, Admin, or Technician.
- **Customer** — a client of the business.
- **Site** — a physical premises belonging to a customer. Holds an optional
  site/floor plan PDF.
- **Fitting** — a persistent record of one exit sign / emergency light at a
  site (reference ID, location description, type, reference photo). Test
  history accumulates against the fitting across every job visit.
- **Job** — one testing visit to a site (6-monthly discharge test or annual
  full test), assigned to a technician.
- **FittingTestResult** — the result of testing one fitting during one job:
  before/after photos, an AS/NZS 2293 checklist (duration test, illumination,
  battery condition, lamp condition, physical damage, signage visibility),
  overall pass/fail/needs-repair, comments and repair notes.

## PDF reports

`GET /api/jobs/[id]/report` renders a branded PDF for a job: business
letterhead, customer/site/test details, a pass/fail summary, a full results
table, and a dedicated "Repairs Required" section with before/after photos
for anything that failed or needs repair.
