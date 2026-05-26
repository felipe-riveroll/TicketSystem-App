# Migración: Supabase + Vercel → Docker + Drizzle + PostgreSQL + better-auth

## Resumen

La app fue migrada de Supabase (auth + base de datos) y Vercel (hosting) a un stack self-hosted con Docker, Drizzle ORM, PostgreSQL y better-auth.

| Antes | Después |
|---|---|
| Supabase Auth | better-auth (email/password, cookie sessions) |
| Supabase Client (acceso directo a DB) | API Routes + Drizzle ORM |
| Vercel (deployment) | Docker (docker-compose) |
| `proxy.ts` middleware | `middleware.ts` con better-auth sessions |
| PostgreSQL trigger (notificaciones) | Lógica en `POST /api/tickets` |
| `@vercel/analytics` | Eliminado |

---

## Stack nuevo

- **Runtime**: Node.js 22 Alpine (Docker)
- **Framework**: Next.js 16.2 (standalone output)
- **ORM**: Drizzle ORM con driver `postgres.js`
- **Base de datos**: PostgreSQL 17 Alpine
- **Auth**: better-auth (email/password, cookie sessions)
- **Package manager**: pnpm

---

## Instrucciones de uso

### 1. Iniciar PostgreSQL

```bash
docker compose up db -d
```

### 2. Crear tablas

```bash
pnpm db:push
```

Esto crea las tablas `users`, `teams`, `tickets`, `tasks`, `notifications` y las tablas adicionales de better-auth (`session`, `verification`).

### 3. Importar datos existentes

```bash
pnpm db:seed
```

Esto importa todos los datos del dump SQL original (equipos, usuarios, tickets, tareas, notificaciones) y resetea las secuencias de IDs.

> **Importante**: Todos los usuarios tienen la contraseña temporal `Asiatech2026!`. Los usuarios deben cambiarla desde Configuración.

### 4. Desarrollo local

```bash
pnpm dev
```

La app corre en `http://localhost:3000`.

### 5. Producción con Docker

```bash
docker compose build
docker compose up
```

---

## Variables de entorno

Archivo `.env.local` para desarrollo:

```env
DATABASE_URL=postgres://tickets:tickets_dev@localhost:5432/tickets
BETTER_AUTH_SECRET=<generar con: openssl rand -base64 32>
BETTER_AUTH_URL=http://localhost:3000
```

En producción (docker-compose), las variables se configuran en el archivo `docker-compose.yml`.

---

## Estructura de archivos nuevos

```
TicketSystem-App/
├── docker-compose.yml          # PostgreSQL + Next.js containers
├── Dockerfile                  # Multi-stage build (deps → builder → runner)
├── .dockerignore
├── .env.local                  # Variables de entorno (desarrollo)
├── drizzle.config.ts           # Configuración de Drizzle Kit
├── middleware.ts                # Auth guard con better-auth (reemplaza proxy.ts)
├── scripts/
│   └── seed.ts                 # Script de migración de datos
├── lib/
│   ├── auth.ts                 # Configuración server-side de better-auth
│   ├── auth-client.ts          # Cliente browser de better-auth
│   └── db/
│       ├── index.ts            # Conexión Drizzle con postgres.js
│       └── schema.ts           # Definición de tablas y relaciones
└── app/api/
    ├── auth/[...all]/route.ts   # Handler de better-auth
    ├── admin/create-user/       # POST - crear usuario (admin)
    ├── tickets/                 # GET (listar), POST (crear + notificación)
    │   └── [id]/route.ts        # PATCH (status, soft-delete)
    ├── tasks/                   # GET (listar), POST (crear)
    │   └── [id]/route.ts        # PATCH, DELETE
    ├── teams/                   # GET (listar), POST (crear)
    │   └── [id]/route.ts        # PATCH
    ├── users/                   # GET (listar por equipo o todos)
    │   └── [id]/route.ts        # PATCH (editar, desactivar)
    ├── notifications/           # GET, PATCH (marcar leída), DELETE
    │   └── [id]/route.ts        # PATCH, DELETE
    ├── metrics/route.ts         # GET (métricas calculadas + datos de gráficas)
    └── user/
        ├── avatar/route.ts      # PATCH (cambiar avatar)
        └── team/route.ts        # GET (nombre del equipo)
```

---

## Archivos eliminados

| Archivo | Razón |
|---|---|
| `lib/supabase/client.ts` | Reemplazado por `lib/auth-client.ts` + fetch() |
| `lib/supabase/server.ts` | Reemplazado por `lib/auth.ts` + `lib/db/index.ts` |
| `lib/supabase/proxy.ts` | Reemplazado por `middleware.ts` |
| `proxy.ts` | Reemplazado por `middleware.ts` |
| `lib/metrics/metrics.service.ts` | Lógica movida a `app/api/metrics/route.ts` |
| `package-lock.json` | Solo se usa pnpm |

**Paquetes removidos**: `@supabase/supabase-js`, `@supabase/ssr`, `@vercel/analytics`

**Paquetes agregados**: `drizzle-orm`, `postgres`, `better-auth`, `bcryptjs`, `drizzle-kit` (dev)

---

## Arquitectura: antes vs después

### Antes (Supabase directo)

```
Cliente → supabase.from("tickets").select() → Supabase API → PostgreSQL
Cliente → supabase.auth.signInWithPassword() → Supabase Auth
```

Cada componente cliente accedía directamente a la base de datos a través del SDK de Supabase.

### Después (API Routes + Drizzle)

```
Cliente → fetch("/api/tickets") → API Route → Drizzle ORM → PostgreSQL
Cliente → signIn.email() → better-auth API → Drizzle ORM → PostgreSQL
```

Los componentes cliente hacen `fetch()` a las API routes de Next.js, que usan Drizzle internamente. Esto da control total sobre cada query.

---

## Comandos disponibles

```bash
pnpm dev          # Servidor de desarrollo
pnpm build        # Build de producción
pnpm start        # Servidor de producción
pnpm db:generate  # Generar migraciones SQL desde el schema
pnpm db:migrate   # Aplicar migraciones pendientes
pnpm db:push      # Push directo del schema a la DB (desarrollo)
pnpm db:studio    # Abrir Drizzle Studio (visor de DB en navegador)
pnpm db:seed      # Importar datos del dump SQL original
```

---

## Notas importantes

- **Contraseñas temporales**: Todos los usuarios existentes tienen la contraseña `Asiatech2026!`. Deben cambiarla desde la sección de Configuración.
- **Trigger eliminado**: El trigger `notify_sistemas_new_ticket` de PostgreSQL fue reemplazado por lógica en `POST /api/tickets` que inserta la notificación después de crear el ticket.
- **RLS**: Las políticas de Row Level Security de Supabase ya no aplican. El control de acceso ahora se maneja en las API routes verificando `session.user.role` y `session.user.teamId`.
- **better-auth**: Requiere una clave secreta (`BETTER_AUTH_SECRET`) para firmar las cookies de sesión. Genera una nueva para producción con `openssl rand -base64 32`.
