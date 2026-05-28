# PROD.md — Espelho Técnico do Projeto Lumina

> Atualizado em: 2026-05-28
> Branch ativo: `dev`

---

## 1. Visão Geral

**Lumina** é um SaaS multi-tenant de gestão eclesiástica para igrejas brasileiras.

- Multi-tenant por `church_id` (RLS no Supabase)
- 3 papéis: `admin`, `lider`, `membro`
- Integração unidirecional com API de parceiro externo (MVP: só leitura)
- Notificações via WhatsApp (Evolution API + n8n) e Email (Resend + n8n)

---

## 2. Stack

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Frontend | React + TypeScript + Vite | 18 / 5.x |
| UI | shadcn/ui + Tailwind | v3 |
| Estado servidor | TanStack Query | v5 |
| Formulários | React Hook Form + Zod | — |
| Backend API | Hono (Node.js) | v4 |
| Auth | Supabase Auth (JWKS) | — |
| Banco | Supabase Postgres + RLS | — |
| Automações | n8n + Evolution API + Resend | — |
| Deploy API | Railway | — |
| Deploy Frontend | Vercel | — |
| Monorepo | Turborepo + pnpm | v2 / v9 |
| Testes | Vitest | v1.6 |
| CI/CD | GitHub Actions | — |

---

## 3. Ambientes

**Repositório:** `https://github.com/rasecagapito/lumina`

| Ambiente | Branch | API | Frontend | Supabase |
|----------|--------|-----|----------|----------|
| Produção | `main` | Railway PRD | Vercel PRD | Self-hosted Coolify — `supabase.hagap.online` (ref: `hagap-selfhosted-prd`) |
| Homologação | `hom` | Railway HOM | Vercel HOM | Supabase cloud — `znpqxsuxcwwfafztjxya` (lumina-hom) |
| Desenvolvimento | `dev` | localhost:3001 | localhost:5173 | HOM |

### Fluxo obrigatório

```
dev → hom → main
```

Nunca push direto em `main`. Toda alteração passa por `dev` → PR para `hom` → validação → PR para `main`.

### Proteções de branch

| Branch | Regras | Status |
|--------|--------|--------|
| `main` | Sem push direto · exige PR + 1 aprovação · bloqueia force push e exclusão | ✅ Ativo |
| `hom` | Via PR · bloqueia force push e exclusão | ✅ Ativo |
| `dev` | Push livre · nunca vai direto para produção | — |

> Proteções aplicadas via GitHub API em 2026-05-28.

---

## 4. Estrutura do Monorepo

```text
C:\Dev\Lumina\
├── apps/
│   ├── api/                    Hono API
│   │   └── src/
│   │       ├── index.ts        app Hono (exporta)
│   │       ├── server.ts       entrypoint local (tsx watch)
│   │       ├── db/client.ts    Supabase service-role
│   │       ├── middleware/
│   │       │   ├── auth.ts     JWT/JWKS → injeta profile
│   │       │   └── rbac.ts     requireRole(...)
│   │       ├── routes/
│   │       │   └── auth.ts     POST /auth/invite, POST /auth/accept/:token
│   │       └── services/
│   │           └── invite.service.ts
│   └── web/                    React frontend
│       └── src/
│           ├── app/
│           │   ├── providers.tsx   QueryClient + AuthProvider
│           │   └── router.tsx      Rotas + ProtectedRoute
│           ├── features/
│           │   └── auth/
│           │       ├── providers/AuthProvider.tsx
│           │       ├── hooks/useAuth.ts
│           │       └── pages/
│           │           ├── LoginPage.tsx
│           │           └── AcceptInvitePage.tsx
│           └── shared/lib/
│               ├── supabase.ts     cliente anon
│               └── api-client.ts  REST + Bearer JWT
├── packages/
│   └── types/src/index.ts      @lumina/types (DTOs)
├── supabase/migrations/        001–008 SQL com RLS
└── .github/workflows/
    ├── ci.yml                  PR/push dev → typecheck+lint+test+build
    └── deploy-hom.yml          push hom → migrations + Railway deploy
```

---

## 5. Banco de Dados

### Tabelas e RLS

| Tabela | RLS | Política principal |
|--------|-----|--------------------|
| `churches` | ✅ | select: `id = church_id do auth.uid()` |
| `profiles` | ✅ | select: mesmo `church_id`; update: apenas admin |
| `invites` | ✅ | insert/select: admin da mesma church |
| `departments` | ✅ | select: mesmo `church_id` |
| `department_members` | ✅ | select: mesmo `church_id` |
| `events` | ✅ | select: mesmo `church_id` |
| `event_participants` | ✅ | select: mesmo `church_id` |
| `scales` | ✅ | select: mesmo `church_id` |
| `scale_slots` | ✅ | update: apenas próprio `profile_id` (confirmado/recusado) |
| `notifications` | ✅ | select: mesmo `church_id` |
| `sync_logs` | ❌ | service-role only |

### Campos de proveniência

Todas as tabelas sincronizáveis têm:
- `source` (`lumina` | `external`) — origem do registro
- `external_id` — ID no sistema parceiro
- `synced_at` — timestamp da última sync

---

## 6. Segurança

- `service_role` key: apenas em `apps/api`, nunca exposta ao frontend
- `church_id`: sempre extraído do JWT verificado, nunca aceito do request body
- RLS ativo em todas as tabelas exceto `sync_logs`
- Invites expiram em 72h (token UUID, `expires_at`)
- `.env` / `.env.local` no `.gitignore`
- CORS: a configurar (restrito a domínios Vercel + localhost)
- `external_id` e `source`: não editáveis por usuários finais

---

## 7. Fluxo de Auth

```
1. Admin cria invite → POST /auth/invite (JWT + role=admin)
   → API valida JWT, extrai church_id do profile, cria registro em `invites`

2. Convidado acessa link → /accept/:token
   → POST /auth/accept/:token com { full_name, password }
   → API: cria user Supabase, cria profile, marca invite como aceito

3. Login → POST supabase.auth.signInWithPassword (direto no frontend)
   → JWT retornado e armazenado no AuthProvider
   → Todas as chamadas à API incluem Bearer JWT
```

---

## 8. Módulos implementados

| Módulo | Rotas API | Frontend |
|--------|-----------|----------|
| Auth (invite+accept) | `POST /auth/invite`, `POST /auth/accept/:token` | LoginPage, AcceptInvitePage |

---

## 9. Módulos planejados — Fase 1

| Módulo | Spec | Plano | Implementado |
|--------|------|-------|--------------|
| Auth + Membros | ⏳ | ⏳ | ❌ |
| Eventos | ⏳ | ⏳ | ❌ |
| Escalas | ⏳ | ⏳ | ❌ |
| Departamentos | ⏳ | ⏳ | ❌ |
| Notificações | ⏳ | ⏳ | ❌ |
| Sync externo | ⏳ | ⏳ | ❌ |

---

## 10. CI/CD

| Trigger | Workflow | Ações |
|---------|----------|-------|
| PR → `main` / `hom` | `ci.yml` | typecheck + lint + test + build |
| push → `dev` | `ci.yml` | typecheck + lint + test + build |
| push → `hom` | `deploy-hom.yml` | migrations Supabase HOM + deploy Railway HOM |

### Secrets GitHub Actions

| Secret | Status |
|--------|--------|
| `SUPABASE_HOM_URL` | ✅ Configurado |
| `SUPABASE_HOM_ANON_KEY` | ✅ Configurado |
| `SUPABASE_HOM_SERVICE_ROLE_KEY` | ✅ Configurado |
| `SUPABASE_HOM_PROJECT_REF` | ✅ Configurado |
| `SUPABASE_ACCESS_TOKEN` | ✅ Configurado |
| `SUPABASE_PRD_URL` | ⏳ Pendente |
| `SUPABASE_PRD_ANON_KEY` | ⏳ Pendente |
| `SUPABASE_PRD_SERVICE_ROLE_KEY` | ⏳ Pendente |
| `SUPABASE_PRD_DB_URL` | ⏳ Pendente |
| `RAILWAY_HOM_TOKEN` | ⏳ Pendente (Railway não configurado) |
| `RAILWAY_PRD_TOKEN` | ⏳ Pendente |
| `API_HOM_URL` | ⏳ Pendente |
| `API_PRD_URL` | ⏳ Pendente |

---

## 11. Pontos de atenção

- Supabase HOM provisionado ✅ — PRD self-hosted no Coolify (`supabase.hagap.online`) ✅
- Proteções de branch `main` e `hom` ativas no GitHub ✅
- 5 secrets HOM configurados no GitHub Actions ✅
- Railway e Vercel não configurados ainda ⏳
- Secrets PRD não configurados ainda ⏳ (aguarda Railway)
- CORS não implementado na API (necessário antes do primeiro deploy)
- PRD usa Supabase self-hosted: `supabase db push` via `--db-url`, não `--project-ref`
- `sync_logs` sem RLS — acessível apenas via service-role (intencional)
- Tailwind v3 obrigatório (v4 incompatível com shadcn/ui)
- `vi.doMock` + `vi.resetModules` padrão nos testes (módulos com env-vars em import-time)
- Nunca hardcodar secrets no código — apenas GitHub Actions Secrets ou `.env` local (gitignored)

---

## 12. Comandos de desenvolvimento

```powershell
# Instalar dependências
pnpm install

# API local (porta 3001)
pnpm --filter api dev

# Frontend local (porta 5173)
pnpm --filter web dev

# Testes API
pnpm --filter api vitest run

# Typecheck geral
pnpm typecheck

# Build geral
pnpm build
```
