**[English](README.md) · [Español](README.es.md)**

---

# Finance Tracker

A full-stack personal finance application to track income and expenses, visualize spending by category, and manage monthly budgets.

**[Live Demo](https://finance-tracker-v2-seven.vercel.app/login)** · [Report Bug](https://github.com/sebpost2/finance-tracker_v2/issues)

> Click **"Try demo"** on the login page — no account needed.

---

## Screenshots

> _Add screenshots here after deploying_

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Database | PostgreSQL (Supabase) |
| ORM | Prisma v7 |
| Auth | Custom JWT (jose) — stateless sessions via HttpOnly cookies |
| Charts | Recharts |
| Deploy | Vercel |
| Testing | Vitest (unit) + Playwright (E2E) |

## Features

- **Demo mode** — One-click demo with 3 months of realistic pre-seeded data. No account required, fully isolated per visitor.
- **Net Savings** — Prominent all-time accumulated balance, separate from monthly stats.
- **Dashboard** — Monthly balance, income vs expenses trend chart (6 months), expense donut chart with percentages, and income breakdown by source.
- **Transactions** — Full CRUD with search, CSV export, and optimistic UI updates (React 19 `useOptimistic`).
- **Categories** — Custom categories with color, emoji, and optional monthly budget limits with progress bars. Toggle between Expense and Income views.
- **Month filter** — Navigate between months; all charts and stats update server-side.
- **Dark mode** — Cookie-based theme persisted server-side (no flash on load). Defaults to dark.
- **Toasts** — Feedback after every mutation (add, edit, delete).
- **Settings** — Update display name and change password.
- **Route protection** — Server-side auth guard via Next.js 16 `proxy.ts`.
- **Security headers** — X-Frame-Options, HSTS, Referrer-Policy, Permissions-Policy.

## Architecture Highlights

- **Server Actions** for all mutations — no REST API layer.
- **Data Access Layer** (`lib/dal.ts`) with React `cache()` to deduplicate session reads per request.
- **`server-only`** on session and DAL modules to prevent accidental client-side imports.
- **Input validation** on all server actions before touching the database.
- **Cookie-based dark mode** — theme class applied on the server render, zero flash of unstyled content.
- **`useOptimistic`** (React 19) — deleting a transaction removes it from the UI instantly.

## Running Locally

### Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project (free tier works)

### Setup

```bash
git clone https://github.com/sebpost2/finance-tracker_v2.git
cd finance-tracker_v2
npm install
```

Create `.env.local`:

```env
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-1-[region].pooler.supabase.com:5432/postgres"
SESSION_SECRET="your-random-secret-minimum-32-characters"
```

Initialize the database (Supabase SQL Editor or `prisma db push`):

```bash
npx prisma db push
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Testing

```bash
npm test              # Vitest unit tests (13 tests)
npm run test:e2e      # Playwright E2E against BASE_URL
```

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | Supabase PostgreSQL — Session Pooler, port 5432 |
| `SESSION_SECRET` | Random string ≥ 32 chars for JWT signing |

Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`

## Project Structure

```
├── app/
│   ├── (auth)/          # Login, register
│   ├── actions/         # Server Actions — auth, transactions, categories, settings, demo
│   └── dashboard/       # Protected routes (dashboard, transactions, categories, settings)
├── components/          # UI — forms, charts, lists, toasts, navigation
├── contexts/            # Toast context
├── e2e/                 # Playwright E2E tests
├── lib/
│   ├── dal.ts           # Data Access Layer with session verification
│   ├── prisma.ts        # Prisma client singleton (pg adapter)
│   ├── session.ts       # JWT session management (jose)
│   └── utils.ts         # Shared formatters and helpers
├── prisma/
│   └── schema.prisma    # Database schema (User, Category, Transaction)
├── proxy.ts             # Route protection (Next.js 16 middleware)
└── types/               # Shared TypeScript interfaces
```
