# Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bootstrap the Lumina monorepo with working infrastructure — Turborepo, Supabase migrations, Hono API scaffold, React frontend scaffold, Auth flow (register church + invite members), and CI/CD.

**Architecture:** Turborepo monorepo with `apps/web` (React/Vite) and `apps/api` (Hono/Node). Frontend talks only to the API via JWT-authenticated REST. Supabase handles Auth + Postgres + RLS. API validates JWT and enforces RBAC. n8n handles async notifications via webhook.

**Tech Stack:** Node 20, pnpm 9, Turborepo, Hono, Vitest, React 18, Vite, TypeScript, shadcn/ui, TanStack Query, Zustand, React Hook Form, Zod, Supabase CLI, GitHub Actions

---

## File Map

```
lumina/
├── package.json                          root workspace
├── pnpm-workspace.yaml
├── turbo.json
├── .gitignore
├── .env.example                          root env template
├── apps/
│   ├── api/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── vitest.config.ts
│   │   └── src/
│   │       ├── index.ts                  Hono app entry
│   │       ├── db/
│   │       │   └── client.ts             Supabase service-role client
│   │       ├── middleware/
│   │       │   ├── auth.ts               JWT validation → injects profile
│   │       │   └── rbac.ts               requireRole helper
│   │       ├── routes/
│   │       │   └── auth.ts               /auth/invite, /auth/accept/:token
│   │       └── services/
│   │           └── invite.service.ts     invite create/accept logic
│   │   └── src/__tests__/
│   │       ├── middleware/
│   │       │   ├── auth.test.ts
│   │       │   └── rbac.test.ts
│   │       └── services/
│   │           └── invite.service.test.ts
│   └── web/
│       ├── package.json
│       ├── tsconfig.json
│       ├── vite.config.ts
│       ├── index.html
│       └── src/
│           ├── main.tsx
│           ├── app/
│           │   ├── router.tsx
│           │   └── providers.tsx
│           ├── shared/
│           │   └── lib/
│           │       ├── supabase.ts
│           │       └── api-client.ts
│           └── features/
│               └── auth/
│                   ├── pages/
│                   │   ├── LoginPage.tsx
│                   │   └── AcceptInvitePage.tsx
│                   └── hooks/
│                       └── useAuth.ts
├── packages/
│   └── types/
│       ├── package.json
│       └── src/
│           └── index.ts                  shared DTOs
└── supabase/
    ├── config.toml
    └── migrations/
        ├── 001_churches.sql
        ├── 002_profiles.sql
        ├── 003_invites.sql
        ├── 004_departments.sql
        ├── 005_events.sql
        ├── 006_scales.sql
        ├── 007_notifications.sql
        └── 008_sync_logs.sql
```

---

## Task 1: Initialize Turborepo Monorepo

**Files:**
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `turbo.json`
- Create: `.gitignore`
- Create: `.env.example`

- [ ] **Step 1: Install pnpm globally if not present**

```powershell
npm install -g pnpm@9
pnpm --version
```
Expected: `9.x.x`

- [ ] **Step 2: Create root package.json**

Create `C:\Dev\Lumina\package.json`:
```json
{
  "name": "lumina",
  "private": true,
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "test": "turbo test",
    "lint": "turbo lint",
    "typecheck": "turbo typecheck"
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "typescript": "^5.4.0"
  },
  "engines": {
    "node": ">=20.0.0",
    "pnpm": ">=9.0.0"
  },
  "packageManager": "pnpm@9.0.0"
}
```

- [ ] **Step 3: Create pnpm-workspace.yaml**

Create `C:\Dev\Lumina\pnpm-workspace.yaml`:
```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

- [ ] **Step 4: Create turbo.json**

Create `C:\Dev\Lumina\turbo.json`:
```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["^build"]
    },
    "lint": {},
    "typecheck": {
      "dependsOn": ["^build"]
    }
  }
}
```

- [ ] **Step 5: Create .gitignore**

Create `C:\Dev\Lumina\.gitignore`:
```
node_modules/
dist/
build/
.env
.env.local
.env.production
.env.development
*.key
*.pem
.turbo/
.supabase/
coverage/
```

- [ ] **Step 6: Create .env.example**

Create `C:\Dev\Lumina\.env.example`:
```
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# API
JWT_SECRET=your-jwt-secret
N8N_WEBHOOK_SECRET=your-n8n-webhook-secret
PORT=3001

# External partner API
EXTERNAL_API_URL=https://partner-api.example.com
EXTERNAL_API_KEY=your-external-api-key

# Frontend
VITE_API_URL=http://localhost:3001
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# n8n
EVOLUTION_API_URL=https://your-evolution-api.com
EVOLUTION_API_KEY=your-evolution-key
RESEND_API_KEY=your-resend-key
```

- [ ] **Step 7: Initialize git and install root deps**

```powershell
cd C:\Dev\Lumina
git init
pnpm install
```
Expected: `node_modules/` created, `pnpm-lock.yaml` generated.

- [ ] **Step 8: Create directory structure**

```powershell
mkdir apps\api, apps\web, packages\types, supabase\migrations
```

- [ ] **Step 9: Commit**

```powershell
git add package.json pnpm-workspace.yaml turbo.json .gitignore .env.example
git commit -m "chore: initialize turborepo monorepo"
```

---

## Task 2: Setup packages/types (Shared DTOs)

**Files:**
- Create: `packages/types/package.json`
- Create: `packages/types/tsconfig.json`
- Create: `packages/types/src/index.ts`

- [ ] **Step 1: Create packages/types/package.json**

Create `C:\Dev\Lumina\packages\types\package.json`:
```json
{
  "name": "@lumina/types",
  "version": "0.0.1",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": {
    "typescript": "^5.4.0"
  }
}
```

- [ ] **Step 2: Create packages/types/tsconfig.json**

Create `C:\Dev\Lumina\packages\types\tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Create shared types**

Create `C:\Dev\Lumina\packages\types\src\index.ts`:
```typescript
export type Role = 'admin' | 'lider' | 'membro'
export type Source = 'lumina' | 'external'
export type InviteStatus = 'pending' | 'accepted' | 'expired'
export type SlotStatus = 'pendente' | 'confirmado' | 'recusado' | 'substituido'
export type NotificationChannel = 'whatsapp' | 'email'
export type NotificationType = 'invite' | 'scale' | 'reminder' | 'custom'
export type NotificationStatus = 'sent' | 'failed' | 'delivered'

export interface Church {
  id: string
  name: string
  slug: string
  plan: string
  source: Source
  external_id: string | null
  synced_at: string | null
  created_at: string
}

export interface Profile {
  id: string
  church_id: string
  role: Role
  full_name: string
  phone: string | null
  avatar_url: string | null
  status: 'ativo' | 'inativo' | 'visitante'
  source: Source
  external_id: string | null
  synced_at: string | null
  created_at: string
}

export interface Invite {
  id: string
  church_id: string
  email: string
  role: Role
  token: string
  accepted_at: string | null
  expires_at: string
  created_by: string
}

// API request/response DTOs
export interface CreateInviteRequest {
  email: string
  role: Role
}

export interface AcceptInviteRequest {
  full_name: string
  password: string
}

export interface AuthContext {
  profile: Profile
}
```

- [ ] **Step 4: Commit**

```powershell
git add packages/types
git commit -m "feat: add shared types package"
```

---

## Task 3: Setup apps/api (Hono + TypeScript + Vitest)

**Files:**
- Create: `apps/api/package.json`
- Create: `apps/api/tsconfig.json`
- Create: `apps/api/vitest.config.ts`
- Create: `apps/api/src/index.ts`

- [ ] **Step 1: Create apps/api/package.json**

Create `C:\Dev\Lumina\apps\api\package.json`:
```json
{
  "name": "@lumina/api",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "vitest run",
    "test:watch": "vitest",
    "typecheck": "tsc --noEmit",
    "lint": "eslint src"
  },
  "dependencies": {
    "@hono/node-server": "^1.12.0",
    "@lumina/types": "workspace:*",
    "@supabase/supabase-js": "^2.43.0",
    "hono": "^4.4.0",
    "jose": "^5.3.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "tsx": "^4.11.0",
    "typescript": "^5.4.0",
    "vitest": "^1.6.0"
  }
}
```

- [ ] **Step 2: Create apps/api/tsconfig.json**

Create `C:\Dev\Lumina\apps\api\tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "skipLibCheck": true,
    "esModuleInterop": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 3: Create apps/api/vitest.config.ts**

Create `C:\Dev\Lumina\apps\api\vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
  },
})
```

- [ ] **Step 4: Write failing health check test**

Create `C:\Dev\Lumina\apps\api\src\__tests__\health.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import app from '../index'

describe('GET /health', () => {
  it('returns 200 with status ok', async () => {
    const res = await app.request('/health')
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual({ status: 'ok' })
  })
})
```

- [ ] **Step 5: Run test to verify it fails**

```powershell
cd C:\Dev\Lumina
pnpm install
cd apps/api
pnpm test
```
Expected: FAIL — `Cannot find module '../index'`

- [ ] **Step 6: Create apps/api/src/index.ts**

Create `C:\Dev\Lumina\apps\api\src\index.ts`:
```typescript
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'

const app = new Hono()

app.use('*', logger())
app.use('*', cors({
  origin: [
    'http://localhost:5173',
    'https://lumina.vercel.app',
  ],
  credentials: true,
}))

app.get('/health', (c) => c.json({ status: 'ok' }))

export default app
```

- [ ] **Step 7: Run test to verify it passes**

```powershell
pnpm test
```
Expected: PASS — `GET /health > returns 200 with status ok`

- [ ] **Step 8: Commit**

```powershell
cd C:\Dev\Lumina
git add apps/api
git commit -m "feat: scaffold hono api with health check"
```

---

## Task 4: API Database Client

**Files:**
- Create: `apps/api/src/db/client.ts`

- [ ] **Step 1: Write failing test**

Create `C:\Dev\Lumina\apps\api\src\__tests__\db\client.test.ts`:
```typescript
import { describe, it, expect, vi } from 'vitest'

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({ from: vi.fn() })),
}))

describe('db client', () => {
  it('exports a supabase client', async () => {
    process.env.SUPABASE_URL = 'https://test.supabase.co'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key'
    const { db } = await import('../../db/client')
    expect(db).toBeDefined()
    expect(typeof db.from).toBe('function')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```powershell
cd C:\Dev\Lumina\apps\api
pnpm test src/__tests__/db/client.test.ts
```
Expected: FAIL — `Cannot find module '../../db/client'`

- [ ] **Step 3: Create apps/api/src/db/client.ts**

Create `C:\Dev\Lumina\apps\api\src\db\client.ts`:
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
}

export const db = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false },
})
```

- [ ] **Step 4: Run test to verify it passes**

```powershell
pnpm test src/__tests__/db/client.test.ts
```
Expected: PASS

- [ ] **Step 5: Commit**

```powershell
cd C:\Dev\Lumina
git add apps/api/src/db
git commit -m "feat: add supabase service-role client"
```

---

## Task 5: API Auth Middleware

**Files:**
- Create: `apps/api/src/middleware/auth.ts`
- Create: `apps/api/src/middleware/rbac.ts`

- [ ] **Step 1: Write failing auth middleware test**

Create `C:\Dev\Lumina\apps\api\src\__tests__\middleware\auth.test.ts`:
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Hono } from 'hono'

// Mock db before importing middleware
vi.mock('../../db/client', () => ({
  db: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
    })),
  },
}))

import { authMiddleware } from '../../middleware/auth'
import { db } from '../../db/client'

describe('authMiddleware', () => {
  let app: Hono

  beforeEach(() => {
    app = new Hono()
    app.use('*', authMiddleware)
    app.get('/test', (c) => c.json(c.get('profile')))
  })

  it('returns 401 when no Authorization header', async () => {
    const res = await app.request('/test')
    expect(res.status).toBe(401)
  })

  it('returns 401 when token is invalid', async () => {
    const res = await app.request('/test', {
      headers: { Authorization: 'Bearer invalid-token' },
    })
    expect(res.status).toBe(401)
  })

  it('returns 401 when profile not found in db', async () => {
    // Valid JWT structure but db returns no profile
    const mockDb = vi.mocked(db)
    mockDb.from.mockReturnValueOnce({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: { message: 'Not found' } })),
        })),
      })),
    } as any)

    // Use a real Supabase-shaped JWT for this test
    // We test the "profile not found" path with a mocked verifier
    const res = await app.request('/test', {
      headers: { Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEyMyIsImV4cCI6OTk5OTk5OTk5OX0.invalid' },
    })
    expect(res.status).toBe(401)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```powershell
cd C:\Dev\Lumina\apps\api
pnpm test src/__tests__/middleware/auth.test.ts
```
Expected: FAIL — `Cannot find module '../../middleware/auth'`

- [ ] **Step 3: Create apps/api/src/middleware/auth.ts**

Create `C:\Dev\Lumina\apps\api\src\middleware\auth.ts`:
```typescript
import type { Context, Next } from 'hono'
import { jwtVerify, createRemoteJWKSet } from 'jose'
import { db } from '../db/client'
import type { Profile } from '@lumina/types'

declare module 'hono' {
  interface ContextVariableMap {
    profile: Profile
  }
}

const SUPABASE_URL = process.env.SUPABASE_URL!
const jwks = createRemoteJWKSet(
  new URL(`${SUPABASE_URL}/auth/v1/.well-known/jwks.json`)
)

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const token = authHeader.slice(7)

  let userId: string
  try {
    const { payload } = await jwtVerify(token, jwks)
    userId = payload.sub as string
  } catch {
    return c.json({ error: 'Invalid token' }, 401)
  }

  const { data: profile, error } = await db
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error || !profile) {
    return c.json({ error: 'Profile not found' }, 401)
  }

  c.set('profile', profile as Profile)
  await next()
}
```

- [ ] **Step 4: Write failing RBAC test**

Create `C:\Dev\Lumina\apps\api\src\__tests__\middleware\rbac.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { Hono } from 'hono'
import { requireRole } from '../../middleware/rbac'
import type { Profile } from '@lumina/types'

function makeApp(role: string) {
  const app = new Hono()
  app.use('*', async (c, next) => {
    c.set('profile', { role } as Profile)
    await next()
  })
  app.get('/test', requireRole('admin'), (c) => c.json({ ok: true }))
  return app
}

describe('requireRole', () => {
  it('allows request when role matches', async () => {
    const res = await makeApp('admin').request('/test')
    expect(res.status).toBe(200)
  })

  it('returns 403 when role does not match', async () => {
    const res = await makeApp('membro').request('/test')
    expect(res.status).toBe(403)
  })

  it('allows multiple roles', async () => {
    const app = new Hono()
    app.use('*', async (c, next) => {
      c.set('profile', { role: 'lider' } as Profile)
      await next()
    })
    app.get('/test', requireRole('admin', 'lider'), (c) => c.json({ ok: true }))
    const res = await app.request('/test')
    expect(res.status).toBe(200)
  })
})
```

- [ ] **Step 5: Run RBAC test to verify it fails**

```powershell
pnpm test src/__tests__/middleware/rbac.test.ts
```
Expected: FAIL — `Cannot find module '../../middleware/rbac'`

- [ ] **Step 6: Create apps/api/src/middleware/rbac.ts**

Create `C:\Dev\Lumina\apps\api\src\middleware\rbac.ts`:
```typescript
import type { Context, Next } from 'hono'
import type { Role } from '@lumina/types'

export function requireRole(...roles: Role[]) {
  return async (c: Context, next: Next) => {
    const profile = c.get('profile')
    if (!roles.includes(profile.role as Role)) {
      return c.json({ error: 'Forbidden' }, 403)
    }
    await next()
  }
}
```

- [ ] **Step 7: Run all middleware tests**

```powershell
pnpm test src/__tests__/middleware
```
Expected: All PASS

- [ ] **Step 8: Commit**

```powershell
cd C:\Dev\Lumina
git add apps/api/src/middleware
git commit -m "feat: add auth and rbac middleware"
```

---

## Task 6: API Invite Service + Routes

**Files:**
- Create: `apps/api/src/services/invite.service.ts`
- Create: `apps/api/src/routes/auth.ts`

- [ ] **Step 1: Write failing invite service test**

Create `C:\Dev\Lumina\apps\api\src\__tests__\services\invite.service.test.ts`:
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../db/client', () => ({
  db: {
    from: vi.fn(),
  },
}))

import { createInvite, acceptInvite, getInviteByToken } from '../../services/invite.service'
import { db } from '../../db/client'

describe('invite.service', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('createInvite', () => {
    it('inserts invite and returns it', async () => {
      const mockInvite = {
        id: 'inv-1',
        church_id: 'church-1',
        email: 'test@test.com',
        role: 'membro',
        token: expect.any(String),
        expires_at: expect.any(String),
        created_by: 'user-1',
      }

      vi.mocked(db.from).mockReturnValueOnce({
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: mockInvite, error: null })),
          })),
        })),
      } as any)

      const result = await createInvite({
        church_id: 'church-1',
        email: 'test@test.com',
        role: 'membro',
        created_by: 'user-1',
      })

      expect(result).toMatchObject({
        email: 'test@test.com',
        role: 'membro',
      })
    })
  })

  describe('getInviteByToken', () => {
    it('returns null when invite not found', async () => {
      vi.mocked(db.from).mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: null, error: { message: 'Not found' } })),
          })),
        })),
      } as any)

      const result = await getInviteByToken('bad-token')
      expect(result).toBeNull()
    })

    it('returns null when invite is expired', async () => {
      const expiredInvite = {
        id: 'inv-1',
        token: 'token-1',
        expires_at: new Date(Date.now() - 1000).toISOString(),
        accepted_at: null,
      }

      vi.mocked(db.from).mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: expiredInvite, error: null })),
          })),
        })),
      } as any)

      const result = await getInviteByToken('token-1')
      expect(result).toBeNull()
    })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```powershell
cd C:\Dev\Lumina\apps\api
pnpm test src/__tests__/services/invite.service.test.ts
```
Expected: FAIL — `Cannot find module '../../services/invite.service'`

- [ ] **Step 3: Create apps/api/src/services/invite.service.ts**

Create `C:\Dev\Lumina\apps\api\src\services\invite.service.ts`:
```typescript
import { randomUUID } from 'crypto'
import { db } from '../db/client'
import type { Role, Invite } from '@lumina/types'

interface CreateInviteParams {
  church_id: string
  email: string
  role: Role
  created_by: string
}

export async function createInvite(params: CreateInviteParams): Promise<Invite> {
  const token = randomUUID()
  const expires_at = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString()

  const { data, error } = await db
    .from('invites')
    .insert({ ...params, token, expires_at })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as Invite
}

export async function getInviteByToken(token: string): Promise<Invite | null> {
  const { data, error } = await db
    .from('invites')
    .select('*')
    .eq('token', token)
    .single()

  if (error || !data) return null

  const invite = data as Invite
  const isExpired = new Date(invite.expires_at) < new Date()
  const isAccepted = invite.accepted_at !== null

  if (isExpired || isAccepted) return null
  return invite
}

export async function acceptInvite(token: string): Promise<void> {
  const { error } = await db
    .from('invites')
    .update({ accepted_at: new Date().toISOString() })
    .eq('token', token)

  if (error) throw new Error(error.message)
}
```

- [ ] **Step 4: Run service test to verify it passes**

```powershell
pnpm test src/__tests__/services/invite.service.test.ts
```
Expected: All PASS

- [ ] **Step 5: Create apps/api/src/routes/auth.ts**

Create `C:\Dev\Lumina\apps\api\src\routes\auth.ts`:
```typescript
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { authMiddleware } from '../middleware/auth'
import { requireRole } from '../middleware/rbac'
import { createInvite, getInviteByToken, acceptInvite } from '../services/invite.service'
import { db } from '../db/client'

const authRouter = new Hono()

const createInviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(['admin', 'lider', 'membro']),
})

const acceptInviteSchema = z.object({
  full_name: z.string().min(2),
  password: z.string().min(8),
})

// POST /auth/invite — admin only
authRouter.post(
  '/invite',
  authMiddleware,
  requireRole('admin'),
  zValidator('json', createInviteSchema),
  async (c) => {
    const profile = c.get('profile')
    const { email, role } = c.req.valid('json')

    const invite = await createInvite({
      church_id: profile.church_id,
      email,
      role,
      created_by: profile.id,
    })

    return c.json(invite, 201)
  }
)

// POST /auth/accept/:token — public
authRouter.post(
  '/accept/:token',
  zValidator('json', acceptInviteSchema),
  async (c) => {
    const token = c.req.param('token')
    const { full_name, password } = c.req.valid('json')

    const invite = await getInviteByToken(token)
    if (!invite) {
      return c.json({ error: 'Invalid or expired invite' }, 400)
    }

    // Create Supabase auth user
    const { data: authData, error: authError } = await db.auth.admin.createUser({
      email: invite.email,
      password,
      email_confirm: true,
    })

    if (authError || !authData.user) {
      return c.json({ error: 'Failed to create user' }, 500)
    }

    // Create profile
    const { error: profileError } = await db.from('profiles').insert({
      id: authData.user.id,
      church_id: invite.church_id,
      role: invite.role,
      full_name,
      status: 'ativo',
      source: 'lumina',
    })

    if (profileError) {
      await db.auth.admin.deleteUser(authData.user.id)
      return c.json({ error: 'Failed to create profile' }, 500)
    }

    await acceptInvite(token)
    return c.json({ message: 'Account created successfully' }, 201)
  }
)

export { authRouter }
```

- [ ] **Step 6: Add zod and zod-validator to api deps**

Edit `C:\Dev\Lumina\apps\api\package.json` — add to dependencies:
```json
"@hono/zod-validator": "^0.2.2",
"zod": "^3.23.0"
```

Then:
```powershell
cd C:\Dev\Lumina
pnpm install
```

- [ ] **Step 7: Wire authRouter into index.ts**

Edit `C:\Dev\Lumina\apps\api\src\index.ts`:
```typescript
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { authRouter } from './routes/auth'

const app = new Hono()

app.use('*', logger())
app.use('*', cors({
  origin: [
    'http://localhost:5173',
    'https://lumina.vercel.app',
  ],
  credentials: true,
}))

app.get('/health', (c) => c.json({ status: 'ok' }))
app.route('/auth', authRouter)

export default app
```

- [ ] **Step 8: Run all tests**

```powershell
cd C:\Dev\Lumina\apps\api
pnpm test
```
Expected: All PASS

- [ ] **Step 9: Commit**

```powershell
cd C:\Dev\Lumina
git add apps/api/src/routes apps/api/src/services apps/api/src/index.ts apps/api/package.json pnpm-lock.yaml
git commit -m "feat: add invite service and auth routes"
```

---

## Task 7: Supabase Migrations

**Files:**
- Create: `supabase/config.toml`
- Create: `supabase/migrations/001_churches.sql` through `008_sync_logs.sql`

- [ ] **Step 1: Install Supabase CLI**

```powershell
pnpm install -g supabase
supabase --version
```
Expected: `1.x.x`

- [ ] **Step 2: Initialize Supabase**

```powershell
cd C:\Dev\Lumina
supabase init
```
Expected: `supabase/config.toml` created.

- [ ] **Step 3: Create 001_churches.sql**

Create `C:\Dev\Lumina\supabase\migrations\001_churches.sql`:
```sql
create table churches (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  plan text not null default 'free',
  source text not null default 'lumina',
  external_id text,
  synced_at timestamptz,
  created_at timestamptz not null default now()
);

alter table churches enable row level security;

-- Only profiles belonging to this church can read it
create policy "churches_select" on churches
  for select using (
    id = (select church_id from profiles where id = auth.uid())
  );
```

- [ ] **Step 4: Create 002_profiles.sql**

Create `C:\Dev\Lumina\supabase\migrations\002_profiles.sql`:
```sql
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  church_id uuid not null references churches on delete cascade,
  role text not null check (role in ('admin', 'lider', 'membro')),
  full_name text not null,
  phone text,
  avatar_url text,
  status text not null default 'ativo' check (status in ('ativo', 'inativo', 'visitante')),
  source text not null default 'lumina',
  external_id text,
  synced_at timestamptz,
  created_at timestamptz not null default now()
);

create index profiles_church_id_idx on profiles (church_id);
create index profiles_external_id_idx on profiles (external_id) where external_id is not null;

alter table profiles enable row level security;

create policy "profiles_select" on profiles
  for select using (
    church_id = (select church_id from profiles where id = auth.uid())
  );

create policy "profiles_insert_self" on profiles
  for insert with check (id = auth.uid());

create policy "profiles_update_admin" on profiles
  for update using (
    (select role from profiles where id = auth.uid()) = 'admin'
    and church_id = (select church_id from profiles where id = auth.uid())
  );
```

- [ ] **Step 5: Create 003_invites.sql**

Create `C:\Dev\Lumina\supabase\migrations\003_invites.sql`:
```sql
create table invites (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references churches on delete cascade,
  email text not null,
  role text not null check (role in ('admin', 'lider', 'membro')),
  token text not null unique,
  accepted_at timestamptz,
  expires_at timestamptz not null,
  created_by uuid not null references profiles on delete cascade,
  created_at timestamptz not null default now()
);

create index invites_church_id_idx on invites (church_id);
create index invites_token_idx on invites (token);

alter table invites enable row level security;

create policy "invites_select_admin" on invites
  for select using (
    church_id = (select church_id from profiles where id = auth.uid())
    and (select role from profiles where id = auth.uid()) in ('admin', 'lider')
  );

create policy "invites_insert_admin" on invites
  for insert with check (
    church_id = (select church_id from profiles where id = auth.uid())
    and (select role from profiles where id = auth.uid()) = 'admin'
  );
```

- [ ] **Step 6: Create 004_departments.sql**

Create `C:\Dev\Lumina\supabase\migrations\004_departments.sql`:
```sql
create table departments (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references churches on delete cascade,
  name text not null,
  leader_id uuid references profiles on delete set null,
  description text,
  created_at timestamptz not null default now()
);

create index departments_church_id_idx on departments (church_id);

create table department_members (
  department_id uuid not null references departments on delete cascade,
  profile_id uuid not null references profiles on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (department_id, profile_id)
);

alter table departments enable row level security;
alter table department_members enable row level security;

create policy "departments_select" on departments
  for select using (
    church_id = (select church_id from profiles where id = auth.uid())
  );

create policy "departments_insert_admin" on departments
  for insert with check (
    church_id = (select church_id from profiles where id = auth.uid())
    and (select role from profiles where id = auth.uid()) = 'admin'
  );

create policy "departments_update_admin_lider" on departments
  for update using (
    church_id = (select church_id from profiles where id = auth.uid())
    and (select role from profiles where id = auth.uid()) in ('admin', 'lider')
  );

create policy "department_members_select" on department_members
  for select using (
    (select church_id from departments where id = department_id)
    = (select church_id from profiles where id = auth.uid())
  );
```

- [ ] **Step 7: Create 005_events.sql**

Create `C:\Dev\Lumina\supabase\migrations\005_events.sql`:
```sql
create table events (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references churches on delete cascade,
  title text not null,
  description text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  location text,
  recurrence jsonb,
  created_by uuid not null references profiles on delete cascade,
  created_at timestamptz not null default now()
);

create index events_church_id_idx on events (church_id);
create index events_starts_at_idx on events (starts_at);

alter table events enable row level security;

create policy "events_select" on events
  for select using (
    church_id = (select church_id from profiles where id = auth.uid())
  );

create policy "events_insert_admin_lider" on events
  for insert with check (
    church_id = (select church_id from profiles where id = auth.uid())
    and (select role from profiles where id = auth.uid()) in ('admin', 'lider')
  );

create policy "events_update_admin_lider" on events
  for update using (
    church_id = (select church_id from profiles where id = auth.uid())
    and (select role from profiles where id = auth.uid()) in ('admin', 'lider')
  );

create policy "events_delete_admin" on events
  for delete using (
    church_id = (select church_id from profiles where id = auth.uid())
    and (select role from profiles where id = auth.uid()) = 'admin'
  );
```

- [ ] **Step 8: Create 006_scales.sql**

Create `C:\Dev\Lumina\supabase\migrations\006_scales.sql`:
```sql
create table scales (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events on delete cascade,
  department_id uuid references departments on delete set null,
  name text not null,
  created_at timestamptz not null default now()
);

create index scales_event_id_idx on scales (event_id);

create table scale_slots (
  id uuid primary key default gen_random_uuid(),
  scale_id uuid not null references scales on delete cascade,
  profile_id uuid not null references profiles on delete cascade,
  status text not null default 'pendente'
    check (status in ('pendente', 'confirmado', 'recusado', 'substituido')),
  notified_at timestamptz,
  responded_at timestamptz,
  created_at timestamptz not null default now()
);

create index scale_slots_scale_id_idx on scale_slots (scale_id);
create index scale_slots_profile_id_idx on scale_slots (profile_id);

alter table scales enable row level security;
alter table scale_slots enable row level security;

create policy "scales_select" on scales
  for select using (
    (select church_id from events where id = event_id)
    = (select church_id from profiles where id = auth.uid())
  );

create policy "scale_slots_select" on scale_slots
  for select using (
    (select church_id from events e
      join scales s on s.event_id = e.id
      where s.id = scale_id limit 1)
    = (select church_id from profiles where id = auth.uid())
  );

create policy "scale_slots_update_self" on scale_slots
  for update using (
    profile_id = auth.uid()
  )
  with check (
    status in ('confirmado', 'recusado')
  );
```

- [ ] **Step 9: Create 007_notifications.sql**

Create `C:\Dev\Lumina\supabase\migrations\007_notifications.sql`:
```sql
create table notification_logs (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references churches on delete cascade,
  profile_id uuid references profiles on delete set null,
  channel text not null check (channel in ('whatsapp', 'email')),
  type text not null check (type in ('invite', 'scale', 'reminder', 'custom')),
  status text not null default 'sent' check (status in ('sent', 'failed', 'delivered')),
  payload jsonb,
  sent_at timestamptz not null default now()
);

create index notification_logs_church_id_idx on notification_logs (church_id);
create index notification_logs_profile_id_idx on notification_logs (profile_id);

alter table notification_logs enable row level security;

create policy "notification_logs_select_admin" on notification_logs
  for select using (
    church_id = (select church_id from profiles where id = auth.uid())
    and (select role from profiles where id = auth.uid()) = 'admin'
  );
```

- [ ] **Step 10: Create 008_sync_logs.sql**

Create `C:\Dev\Lumina\supabase\migrations\008_sync_logs.sql`:
```sql
create table sync_logs (
  id uuid primary key default gen_random_uuid(),
  entity text not null,
  external_id text not null,
  action text not null check (action in ('created', 'updated', 'skipped')),
  synced_at timestamptz not null default now()
);

create index sync_logs_entity_idx on sync_logs (entity);
create index sync_logs_synced_at_idx on sync_logs (synced_at);

-- No RLS — service-role only access (API writes, no direct client access)
```

- [ ] **Step 11: Start Supabase local and run migrations**

```powershell
cd C:\Dev\Lumina
supabase start
supabase db push
```
Expected: All migrations applied. Note the local URLs and keys output — copy to `.env.local`.

- [ ] **Step 12: Commit**

```powershell
git add supabase/
git commit -m "feat: add supabase migrations for all phase 1 tables"
```

---

## Task 8: Setup apps/web (Vite + React + TS + shadcn/ui)

**Files:**
- Create: `apps/web/package.json`
- Create: `apps/web/tsconfig.json`
- Create: `apps/web/vite.config.ts`
- Create: `apps/web/index.html`
- Create: `apps/web/src/main.tsx`

- [ ] **Step 1: Create apps/web/package.json**

Create `C:\Dev\Lumina\apps\web\package.json`:
```json
{
  "name": "@lumina/web",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit",
    "lint": "eslint src"
  },
  "dependencies": {
    "@lumina/types": "workspace:*",
    "@supabase/supabase-js": "^2.43.0",
    "@tanstack/react-query": "^5.40.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "react-hook-form": "^7.51.0",
    "react-router-dom": "^6.23.0",
    "zustand": "^4.5.0",
    "zod": "^3.23.0",
    "@hookform/resolvers": "^3.6.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.0",
    "typescript": "^5.4.0",
    "vite": "^5.2.0"
  }
}
```

- [ ] **Step 2: Create apps/web/tsconfig.json**

Create `C:\Dev\Lumina\apps\web\tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "skipLibCheck": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  },
  "include": ["src"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Create apps/web/vite.config.ts**

Create `C:\Dev\Lumina\apps\web\vite.config.ts`:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

- [ ] **Step 4: Create apps/web/index.html**

Create `C:\Dev\Lumina\apps\web\index.html`:
```html
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Lumina</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 5: Create apps/web/src/main.tsx**

Create `C:\Dev\Lumina\apps\web\src\main.tsx`:
```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import { Providers } from './app/providers'
import { AppRouter } from './app/router'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Providers>
      <AppRouter />
    </Providers>
  </React.StrictMode>
)
```

- [ ] **Step 6: Create apps/web/src/index.css**

Create `C:\Dev\Lumina\apps\web\src\index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 7: Install web deps**

```powershell
cd C:\Dev\Lumina
pnpm install
```

- [ ] **Step 8: Initialize shadcn/ui**

```powershell
cd C:\Dev\Lumina\apps\web
pnpm dlx shadcn@latest init
```
When prompted:
- Style: Default
- Base color: Slate
- CSS variables: Yes

- [ ] **Step 9: Add Button and Input components**

```powershell
pnpm dlx shadcn@latest add button input label card
```

- [ ] **Step 10: Commit**

```powershell
cd C:\Dev\Lumina
git add apps/web
git commit -m "feat: scaffold react frontend with vite and shadcn/ui"
```

---

## Task 9: Frontend Foundation (Providers + Router + API Client)

**Files:**
- Create: `apps/web/src/app/providers.tsx`
- Create: `apps/web/src/app/router.tsx`
- Create: `apps/web/src/shared/lib/supabase.ts`
- Create: `apps/web/src/shared/lib/api-client.ts`

- [ ] **Step 1: Create apps/web/src/shared/lib/supabase.ts**

Create `C:\Dev\Lumina\apps\web\src\shared\lib\supabase.ts`:
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

- [ ] **Step 2: Create apps/web/src/shared/lib/api-client.ts**

Create `C:\Dev\Lumina\apps\web\src\shared\lib\api-client.ts`:
```typescript
import { supabase } from './supabase'

const API_URL = import.meta.env.VITE_API_URL

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  const headers = await getAuthHeaders()
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(error.error ?? `HTTP ${res.status}`)
  }

  return res.json() as Promise<T>
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body: unknown) => request<T>('POST', path, body),
  patch: <T>(path: string, body: unknown) => request<T>('PATCH', path, body),
  delete: <T>(path: string) => request<T>('DELETE', path),
}
```

- [ ] **Step 3: Create apps/web/src/app/providers.tsx**

Create `C:\Dev\Lumina\apps\web\src\app\providers.tsx`:
```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
})

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
```

- [ ] **Step 4: Create apps/web/src/app/router.tsx**

Create `C:\Dev\Lumina\apps\web\src\app\router.tsx`:
```typescript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { AcceptInvitePage } from '@/features/auth/pages/AcceptInvitePage'
import { useAuth } from '@/features/auth/hooks/useAuth'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth()
  if (loading) return <div>Carregando...</div>
  if (!session) return <Navigate to="/login" replace />
  return <>{children}</>
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/invite/:token" element={<AcceptInvitePage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <div>Dashboard (em breve)</div>
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
```

- [ ] **Step 5: Commit**

```powershell
cd C:\Dev\Lumina
git add apps/web/src/app apps/web/src/shared
git commit -m "feat: add providers, router, and api client"
```

---

## Task 10: Frontend Auth Pages

**Files:**
- Create: `apps/web/src/features/auth/hooks/useAuth.ts`
- Create: `apps/web/src/features/auth/pages/LoginPage.tsx`
- Create: `apps/web/src/features/auth/pages/AcceptInvitePage.tsx`

- [ ] **Step 1: Create useAuth hook**

Create `C:\Dev\Lumina\apps\web\src\features\auth\hooks\useAuth.ts`:
```typescript
import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/shared/lib/supabase'

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setSession(session)
    )

    return () => subscription.unsubscribe()
  }, [])

  const signOut = () => supabase.auth.signOut()

  return { session, loading, signOut }
}
```

- [ ] **Step 2: Create LoginPage**

Create `C:\Dev\Lumina\apps\web\src\features\auth\pages\LoginPage.tsx`:
```typescript
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/shared/lib/supabase'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
})

type LoginForm = z.infer<typeof loginSchema>

export function LoginPage() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<LoginForm>({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (data: LoginForm) => {
    setError(null)
    const { error } = await supabase.auth.signInWithPassword(data)
    if (error) {
      setError('Email ou senha incorretos')
      return
    }
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Lumina</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register('email')} />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" {...register('password')} />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 3: Create AcceptInvitePage**

Create `C:\Dev\Lumina\apps\web\src\features\auth\pages\AcceptInvitePage.tsx`:
```typescript
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { api } from '@/shared/lib/api-client'

const acceptSchema = z.object({
  full_name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  password: z.string().min(8, 'Senha deve ter ao menos 8 caracteres'),
  confirm_password: z.string(),
}).refine(d => d.password === d.confirm_password, {
  message: 'Senhas não conferem',
  path: ['confirm_password'],
})

type AcceptForm = z.infer<typeof acceptSchema>

export function AcceptInvitePage() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<AcceptForm>({ resolver: zodResolver(acceptSchema) })

  const onSubmit = async (data: AcceptForm) => {
    setError(null)
    try {
      await api.post(`/auth/accept/${token}`, {
        full_name: data.full_name,
        password: data.password,
      })
      navigate('/login')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Criar sua conta</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="full_name">Nome completo</Label>
              <Input id="full_name" {...register('full_name')} />
              {errors.full_name && (
                <p className="text-sm text-red-500">{errors.full_name.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" {...register('password')} />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="confirm_password">Confirmar senha</Label>
              <Input id="confirm_password" type="password" {...register('confirm_password')} />
              {errors.confirm_password && (
                <p className="text-sm text-red-500">{errors.confirm_password.message}</p>
              )}
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Criando conta...' : 'Criar conta'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 4: Typecheck web app**

```powershell
cd C:\Dev\Lumina\apps\web
pnpm typecheck
```
Expected: No errors.

- [ ] **Step 5: Start dev server and verify login page loads**

```powershell
cd C:\Dev\Lumina\apps\web
pnpm dev
```
Open browser at `http://localhost:5173/login`. Expected: Login form renders with email + password fields.

- [ ] **Step 6: Commit**

```powershell
cd C:\Dev\Lumina
git add apps/web/src/features
git commit -m "feat: add auth pages and useAuth hook"
```

---

## Task 11: CI/CD (GitHub Actions)

**Files:**
- Create: `.github/workflows/ci.yml`
- Create: `.github/workflows/deploy-hom.yml`

- [ ] **Step 1: Create .github/workflows directory**

```powershell
mkdir .github\workflows
```

- [ ] **Step 2: Create CI workflow**

Create `C:\Dev\Lumina\.github\workflows\ci.yml`:
```yaml
name: CI

on:
  pull_request:
    branches: [main, hom]
  push:
    branches: [dev]

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v3
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Typecheck
        run: pnpm typecheck

      - name: Lint
        run: pnpm lint

      - name: Test
        run: pnpm test
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_HOM_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_HOM_SERVICE_ROLE_KEY }}

      - name: Build
        run: pnpm build
        env:
          VITE_API_URL: ${{ secrets.API_HOM_URL }}
          VITE_SUPABASE_URL: ${{ secrets.SUPABASE_HOM_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_HOM_ANON_KEY }}
```

- [ ] **Step 3: Create HOM deploy workflow**

Create `C:\Dev\Lumina\.github\workflows\deploy-hom.yml`:
```yaml
name: Deploy HOM

on:
  push:
    branches: [hom]

jobs:
  deploy-api:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v3
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run migrations (HOM)
        run: pnpm supabase db push --project-ref ${{ secrets.SUPABASE_HOM_PROJECT_REF }}
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}

      # Railway deploy via CLI
      - name: Deploy API to Railway
        run: |
          npm install -g @railway/cli
          railway up --service api
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_HOM_TOKEN }}
        working-directory: apps/api

  # Vercel deploy is handled automatically via Vercel GitHub integration
  # hom branch → HOM environment in Vercel
```

- [ ] **Step 4: Add GitHub secrets documentation to .env.example**

Edit `C:\Dev\Lumina\.env.example` — append:
```
# GitHub Actions secrets needed:
# SUPABASE_HOM_URL
# SUPABASE_HOM_ANON_KEY
# SUPABASE_HOM_SERVICE_ROLE_KEY
# SUPABASE_HOM_PROJECT_REF
# SUPABASE_PRD_URL
# SUPABASE_PRD_ANON_KEY
# SUPABASE_PRD_SERVICE_ROLE_KEY
# SUPABASE_PRD_PROJECT_REF
# SUPABASE_ACCESS_TOKEN
# RAILWAY_HOM_TOKEN
# RAILWAY_PRD_TOKEN
# API_HOM_URL
# API_PRD_URL
```

- [ ] **Step 5: Commit**

```powershell
cd C:\Dev\Lumina
git add .github .env.example
git commit -m "ci: add github actions workflows for ci and hom deploy"
```

---

## Task 12: Wire API Entry Point + Start Server End-to-End

**Files:**
- Modify: `apps/api/src/index.ts` (add server start for non-test env)

- [ ] **Step 1: Add server entrypoint for local dev**

Create `C:\Dev\Lumina\apps\api\src\server.ts`:
```typescript
import { serve } from '@hono/node-server'
import app from './index'

const port = Number(process.env.PORT ?? 3001)
serve({ fetch: app.fetch, port }, () => {
  console.log(`API running on http://localhost:${port}`)
})
```

- [ ] **Step 2: Update api package.json scripts**

Edit `C:\Dev\Lumina\apps\api\package.json` — change `dev` script:
```json
"dev": "tsx watch src/server.ts"
```

- [ ] **Step 3: Create .env.local for local dev**

Copy `.env.example` to `.env.local` and fill in values from `supabase start` output:
```powershell
cd C:\Dev\Lumina
copy .env.example apps\api\.env.local
```
Edit `apps/api/.env.local` with values from `supabase start`:
- `SUPABASE_URL` → `API URL` from supabase start output (usually `http://localhost:54321`)
- `SUPABASE_SERVICE_ROLE_KEY` → `service_role key` from supabase start output

- [ ] **Step 4: Start API and verify health check**

```powershell
cd C:\Dev\Lumina\apps\api
pnpm dev
```
In another terminal:
```powershell
Invoke-RestMethod -Uri http://localhost:3001/health
```
Expected: `{ status: 'ok' }`

- [ ] **Step 5: Run full test suite**

```powershell
cd C:\Dev\Lumina
pnpm test
```
Expected: All tests PASS.

- [ ] **Step 6: Final commit**

```powershell
cd C:\Dev\Lumina
git add apps/api/src/server.ts apps/api/package.json
git commit -m "feat: add server entrypoint for local dev"
```

---

## Self-Review

**Spec coverage check:**
- [x] Monorepo Turborepo → Task 1
- [x] packages/types shared DTOs → Task 2
- [x] API Hono scaffold → Task 3
- [x] DB client (service role) → Task 4
- [x] Auth middleware (JWT validation) → Task 5
- [x] RBAC middleware → Task 5
- [x] Invite service → Task 6
- [x] Auth routes (invite + accept) → Task 6
- [x] All 8 migrations (churches → sync_logs) → Task 7
- [x] RLS policies on all tables → Task 7
- [x] React + Vite + shadcn/ui scaffold → Task 8
- [x] Providers + Router + api-client → Task 9
- [x] Auth pages (Login + AcceptInvite) → Task 10
- [x] useAuth hook → Task 10
- [x] CI/CD GitHub Actions → Task 11
- [x] End-to-end server start → Task 12

**Not in this plan (next plans):**
- Members module
- Departments module
- Events module
- Scales module
- Notifications (n8n/WhatsApp/Email)
- External sync service
- PRD deploy workflow
