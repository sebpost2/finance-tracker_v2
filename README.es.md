**[English](README.md) · [Español](README.es.md)**

---

# Finance Tracker

Aplicación full-stack de finanzas personales para registrar ingresos y gastos, visualizar el gasto por categoría y administrar presupuestos mensuales.

**[Demo en vivo](https://finance-tracker-v2-seven.vercel.app/login)** · [Reportar bug](https://github.com/sebpost2/finance-tracker_v2/issues)

> Haz clic en **"Try demo"** en la pantalla de login — no necesitas cuenta.

---

## Capturas

> _Agregar capturas aquí después del deploy_

---

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16 (App Router) |
| Lenguaje | TypeScript |
| Estilos | Tailwind CSS v4 |
| Base de datos | PostgreSQL (Supabase) |
| ORM | Prisma v7 |
| Auth | JWT custom (jose) — sesiones stateless con cookies HttpOnly |
| Gráficos | Recharts |
| Deploy | Vercel |
| Testing | Vitest (unit) + Playwright (E2E) |

## Features

- **Modo demo** — Un clic abre el demo con 3 meses de data realista pre-cargada. Sin registro, aislado por visitante.
- **Ahorro neto** — Balance histórico acumulado destacado, separado de las stats mensuales.
- **Dashboard** — Balance del mes, gráfico de tendencia ingresos vs gastos (6 meses), donut de gastos con porcentajes y desglose de ingresos por fuente.
- **Transacciones** — CRUD completo con búsqueda, export CSV y UI optimista (React 19 `useOptimistic`).
- **Categorías** — Personalizadas con color, emoji y límite mensual opcional con barra de progreso. Toggle entre vistas Gasto e Ingreso.
- **Filtro de mes** — Navega entre meses; todas las charts y stats actualizan server-side.
- **Dark mode** — Tema persistido en cookie server-side (sin flash al cargar). Dark por default.
- **Toasts** — Feedback después de cada mutación (crear, editar, eliminar).
- **Settings** — Cambiar nombre de display y contraseña.
- **Protección de rutas** — Guard de auth server-side vía Next.js 16 `proxy.ts`.
- **Headers de seguridad** — X-Frame-Options, HSTS, Referrer-Policy, Permissions-Policy.

## Highlights de arquitectura

- **Server Actions** para todas las mutaciones — sin capa REST.
- **Data Access Layer** (`lib/dal.ts`) con React `cache()` para deduplicar lecturas de sesión por request.
- **`server-only`** en los módulos de sesión y DAL para prevenir imports accidentales en cliente.
- **Validación de input** en todas las server actions antes de tocar la base de datos.
- **Dark mode basado en cookie** — la clase de tema se aplica en el render del servidor, cero flash.
- **`useOptimistic`** (React 19) — borrar una transacción la quita del UI al instante.

## Correr localmente

### Requisitos

- Node.js 20+
- Un proyecto [Supabase](https://supabase.com) (free tier funciona)

### Setup

```bash
git clone https://github.com/sebpost2/finance-tracker_v2.git
cd finance-tracker_v2
npm install
```

Crea `.env.local`:

```env
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-1-[region].pooler.supabase.com:5432/postgres"
SESSION_SECRET="tu-string-aleatorio-minimo-32-caracteres"
```

Inicializa la base de datos (Supabase SQL Editor o `prisma db push`):

```bash
npx prisma db push
```

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Testing

```bash
npm test              # Tests unitarios con Vitest (13 tests)
npm run test:e2e      # Tests E2E con Playwright contra BASE_URL
```

## Variables de entorno

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | PostgreSQL de Supabase — Session Pooler, puerto 5432 |
| `SESSION_SECRET` | String aleatorio ≥ 32 chars para firmar JWT |

Generar: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`

## Estructura del proyecto

```
├── app/
│   ├── (auth)/          # Login, registro
│   ├── actions/         # Server Actions — auth, transactions, categories, settings, demo
│   └── dashboard/       # Rutas protegidas (dashboard, transactions, categories, settings)
├── components/          # UI — formularios, charts, listas, toasts, navegación
├── contexts/            # Contexto de toasts
├── e2e/                 # Tests E2E de Playwright
├── lib/
│   ├── dal.ts           # Data Access Layer con verificación de sesión
│   ├── prisma.ts        # Singleton del cliente Prisma (adapter pg)
│   ├── session.ts       # Gestión de sesiones JWT (jose)
│   └── utils.ts         # Formatters y helpers compartidos
├── prisma/
│   └── schema.prisma    # Schema de la BD (User, Category, Transaction)
├── proxy.ts             # Protección de rutas (middleware de Next.js 16)
└── types/               # Interfaces TS compartidas
```
