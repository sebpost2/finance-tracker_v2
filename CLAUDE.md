@AGENTS.md

# Finance Tracker - Architecture

## Stack
- Next.js 16 (App Router) + TypeScript + Tailwind v4
- Prisma v7 with `@prisma/adapter-pg` (no url in schema, adapter in PrismaClient constructor)
- Custom JWT auth via `jose` (NO NextAuth) - sessions stored in HttpOnly cookies
- Route protection via `proxy.ts` (NOT middleware.ts — Next.js 16 renamed it)
- Server Actions for all mutations (auth, CRUD)
- Recharts for charts (Client Component only)

## Key Next.js 16 rules
- `cookies()`, `params`, `searchParams` must ALL be awaited
- Route protection file is `proxy.ts`, export function named `proxy`
- Prisma client: import from `@/app/generated/prisma/client`

## Setup (after cloning)
1. Copy `.env.local.example` to `.env.local` and fill in values
2. `npx prisma db push` — creates tables in Supabase
3. `npm run dev`
