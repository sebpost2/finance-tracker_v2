# Finance Tracker

A full-stack personal finance application to track income and expenses, visualize spending by category, and manage monthly budgets.

**[Live Demo](https://YOUR_VERCEL_URL)** · [Report Bug](https://github.com/sebpost2/finance-tracker_v2/issues)

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

## Features

- **Authentication** — Register and login with email/password. Sessions stored in encrypted HttpOnly cookies with no third-party auth dependency.
- **Dashboard** — Monthly balance overview with income, expenses, and a donut chart breakdown by category.
- **Transactions** — Full CRUD: add, edit, and delete transactions with amount, description, category, type, and date.
- **Categories** — Custom categories with color and emoji icon. Deletions gracefully uncategorize related transactions.
- **Month filter** — Navigate between months to view historical data.
- **Route protection** — Server-side auth guard via Next.js 16 `proxy.ts` (the renamed middleware).

## Architecture Highlights

- **Server Actions** for all mutations — no separate REST API layer needed.
- **Data Access Layer** (`lib/dal.ts`) with React `cache()` to deduplicate session reads per request.
- **`server-only`** enforced on session and DAL modules to prevent accidental client-side imports.
- **Input validation** on all server actions before hitting the database.

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

Create a `.env.local` file:

```env
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-1-[region].pooler.supabase.com:5432/postgres"
SESSION_SECRET="your-random-secret-minimum-32-characters"
```

Run the database migrations (first time only):

```bash
npx prisma db push
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | Supabase PostgreSQL connection string (Session Pooler, port 5432) |
| `SESSION_SECRET` | Random string (min 32 chars) for JWT signing |

Generate a secret: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`

## Project Structure

```
├── app/
│   ├── (auth)/          # Login and register pages
│   ├── actions/         # Server Actions (auth, transactions, categories)
│   └── dashboard/       # Protected dashboard routes
├── components/          # UI components (forms, charts, lists)
├── lib/
│   ├── dal.ts           # Data Access Layer with session verification
│   ├── prisma.ts        # Prisma client singleton
│   └── session.ts       # JWT session management
├── prisma/
│   └── schema.prisma    # Database schema
├── proxy.ts             # Route protection (Next.js 16 middleware)
└── types/               # Shared TypeScript interfaces
```
