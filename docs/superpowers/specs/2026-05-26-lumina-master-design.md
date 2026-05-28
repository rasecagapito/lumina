# Lumina — Spec Master (Fase 1)

**Data:** 2026-05-26  
**Status:** Aprovado  
**Escopo:** Arquitetura master do MVP Fase 1 — base para todos os sub-specs de módulo

---

## 1. Visão Geral

Lumina é um SaaS de gestão eclesiástica multi-tenant. Fase 1 cobre: Auth, Membros, Agenda/Eventos, Escalas, Departamentos e Notificações.

Stack: React 18 + TypeScript + Vite + shadcn/ui + Hono API (Railway) + Supabase + n8n + Vercel

---

## 2. Arquitetura Geral

```
Frontend (React 18 + TS + Vite + shadcn/ui)
Deploy: Vercel
  main → PRD | hom → HOM | PR → preview

        │ HTTPS / REST + JWT
        ▼

API (Node + Hono)
Deploy: Railway
  Toda lógica de negócio
  Valida JWT do Supabase Auth
  Emite eventos para n8n via webhook
  Consome API parceira (sync unidirecional — só leitura no MVP)

        │ Postgres client (service role)
        ▼

Supabase
  - Auth (JWT, invite)
  - Postgres + RLS (isolamento por church_id)
  - Storage (fotos, docs)
  PRD e HOM = projetos separados

        │ webhook
        ▼

n8n (self-hosted ou cloud)
  - WhatsApp via Evolution API
  - Email via Resend
  - Automações de escalas e lembretes
```

**Regras:**
- Frontend nunca acessa banco direto — tudo via API
- API valida JWT do Supabase Auth antes de qualquer request
- RLS no banco como defesa em profundidade
- `church_id` sempre extraído do JWT — nunca do body do request
- n8n desacoplado — API dispara webhook, n8n executa async

---

## 3. Multi-Tenant

Modelo: Row-Level Security por `church_id`.

Toda tabela tem `church_id uuid FK churches`. RLS policy padrão:

```sql
USING (church_id = (SELECT church_id FROM profiles WHERE id = auth.uid()))
```

---

## 4. Autenticação e Roles

**Fluxo de entrada:**
1. Admin da igreja cria conta (cadastro direto)
2. Admin convida membros por email — invite vinculado ao `church_id`
3. Membro aceita invite via link → cria profile com role definida

**Roles:**
| Role | Permissões |
|------|-----------|
| `admin` | Acesso total à igreja |
| `lider` | Gerencia escalas e departamentos |
| `membro` | Acessa perfil e confirma participação |

---

## 5. Schema de Banco de Dados

```sql
-- Tenant root
churches
  id uuid PK
  name text
  slug text UNIQUE
  plan text                 -- free | pro | enterprise
  source text DEFAULT 'lumina'
  external_id text
  synced_at timestamptz
  created_at timestamptz

-- Profiles (estende auth.users)
profiles
  id uuid PK FK auth.users
  church_id uuid FK churches
  role text                 -- admin | lider | membro
  full_name text
  phone text
  avatar_url text
  status text               -- ativo | inativo | visitante
  source text DEFAULT 'lumina'
  external_id text
  synced_at timestamptz
  created_at timestamptz

-- Invites
invites
  id uuid PK
  church_id uuid FK churches
  email text
  role text
  token text UNIQUE
  accepted_at timestamptz
  expires_at timestamptz    -- criado_at + 72h
  created_by uuid FK profiles

-- Departamentos
departments
  id uuid PK
  church_id uuid FK churches
  name text
  leader_id uuid FK profiles
  description text

-- Membros em departamentos (N:N)
department_members
  department_id uuid FK
  profile_id uuid FK
  joined_at timestamptz

-- Eventos
events
  id uuid PK
  church_id uuid FK churches
  title text
  description text
  starts_at timestamptz
  ends_at timestamptz
  location text
  recurrence jsonb          -- null | {type: 'weekly', day: 0}
  created_by uuid FK profiles

-- Escalas
scales
  id uuid PK
  event_id uuid FK events
  department_id uuid FK departments
  name text

-- Slots de voluntários
scale_slots
  id uuid PK
  scale_id uuid FK scales
  profile_id uuid FK profiles
  status text               -- pendente | confirmado | recusado | substituido
  notified_at timestamptz
  responded_at timestamptz

-- Log de notificações
notification_logs
  id uuid PK
  church_id uuid FK churches
  profile_id uuid FK profiles
  channel text              -- whatsapp | email
  type text                 -- invite | scale | reminder | custom
  status text               -- sent | failed | delivered
  payload jsonb
  sent_at timestamptz

-- Sync com parceiro externo
sync_logs
  id uuid PK
  entity text               -- 'church' | 'member' | ...
  external_id text
  action text               -- created | updated | skipped
  synced_at timestamptz
```

**Índices obrigatórios:** `church_id` em todas as tabelas, `event_id` em `scales`, `scale_id` em `scale_slots`, `external_id` em `churches` e `profiles`.

---

## 6. API (Hono)

### Estrutura de projeto

```
api/
├── src/
│   ├── index.ts
│   ├── middleware/
│   │   ├── auth.ts           -- valida JWT, injeta profile + church_id
│   │   └── rbac.ts           -- requireRole('admin') | requireRole('lider')
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── members.ts
│   │   ├── departments.ts
│   │   ├── events.ts
│   │   ├── scales.ts
│   │   └── notifications.ts
│   ├── services/
│   │   ├── invite.service.ts
│   │   ├── scale.service.ts
│   │   ├── notify.service.ts
│   │   ├── external-sync.service.ts
│   │   └── audit.service.ts
│   └── db/
│       └── client.ts         -- Supabase service role client
```

### Rotas

```
POST   /auth/invite
POST   /auth/accept/:token

GET    /members
POST   /members
PATCH  /members/:id
DELETE /members/:id

GET    /departments
POST   /departments
PATCH  /departments/:id
PATCH  /departments/:id/members

GET    /events
POST   /events
PATCH  /events/:id
DELETE /events/:id

GET    /events/:id/scales
POST   /events/:id/scales
PATCH  /scales/slots/:id      -- membro confirma/recusa

POST   /notifications/send
```

### Fluxo de escala

```
Admin cria escala
  → API insere scale_slots (status=pendente)
  → notify.service dispara webhook n8n
    → n8n envia WhatsApp + Email
      → Membro responde via link → PATCH /scales/slots/:id
        → Se recusado: backup queue entra automaticamente
```

---

## 7. Integração com Parceiro Externo

MVP: **somente consumo** (sem exposição de endpoints).

```
Empresa parceira API
  │ GET (pull)
  ▼
external-sync.service.ts
  - Busca dados que eles gerenciam
  - Mapeia para schema Lumina
  - Upsert com external_id como chave
  │
  ▼
Supabase (fonte de verdade Lumina)
```

**Regras de merge:**
- `source = 'external'` → campo read-only no frontend
- `source = 'lumina'` → Lumina é dono, sync não sobrescreve
- Merge por campo para entidades mistas

**Mapeamento exato de entidades externas:** `[A DEFINIR COM PARCEIRO]`

Credenciais do parceiro ficam apenas em `.env` (nunca no banco).

---

## 8. Frontend

### Estrutura

```
src/
├── app/
│   ├── router.tsx
│   └── providers.tsx
├── features/
│   ├── auth/
│   ├── members/
│   ├── departments/
│   ├── events/
│   ├── scales/
│   └── notifications/
├── shared/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   │   ├── api-client.ts     -- fetch wrapper com JWT automático
│   │   └── supabase.ts       -- só Auth
│   └── types/
└── assets/
```

### Roteamento

```
/login                        público
/invite/:token                público
/dashboard                    todos (autenticado)
/members                      admin | lider
/members/:id                  admin | lider
/departments                  admin | lider
/events                       todos
/events/:id/scales            admin | lider
/scales/:id                   todos
/settings                     admin
```

### State Management

| Ferramenta | Uso |
|---|---|
| TanStack Query | Cache de servidor, fetching |
| Zustand | Estado UI global (sidebar, tema) |
| React Hook Form + Zod | Formulários e validação |

Frontend nunca usa `service_role`. Nunca acessa banco direto.

---

## 9. CI/CD e Ambientes

### Branches

```
main      → PRD (Vercel + Railway + Supabase PRD)
hom       → HOM (Vercel + Railway staging + Supabase HOM)
feature/* → PR → preview automático Vercel
```

### Pipeline (GitHub Actions)

```
Todo PR:
  lint → typecheck → tests → build check

Merge em hom:
  deploy API Railway staging
  deploy frontend Vercel HOM
  run migrations Supabase HOM

Merge em main:
  aprovação manual obrigatória
  deploy API Railway PRD
  deploy frontend Vercel PRD
  run migrations Supabase PRD
```

### Variáveis de Ambiente

```
Frontend:
  VITE_API_URL
  VITE_SUPABASE_URL
  VITE_SUPABASE_ANON_KEY

API:
  SUPABASE_URL
  SUPABASE_SERVICE_ROLE_KEY
  EXTERNAL_API_URL
  EXTERNAL_API_KEY
  N8N_WEBHOOK_SECRET
  JWT_SECRET

n8n:
  EVOLUTION_API_URL
  EVOLUTION_API_KEY
  RESEND_API_KEY
```

---

## 10. Monorepo

```
lumina/
├── apps/
│   ├── web/          -- React frontend
│   └── api/          -- Hono API
├── packages/
│   └── types/        -- DTOs compartilhados
└── supabase/
    ├── migrations/
    └── seed/
```

Gerenciado por Turborepo. CI unificado.

---

## 11. Segurança

- [ ] `service_role` key nunca exposta ao frontend
- [ ] RLS ativo em todas as tabelas
- [ ] `church_id` sempre do JWT, nunca do body
- [ ] Rate limiting: 100 req/min por IP (Hono middleware)
- [ ] Invites expiram em 72h
- [ ] `.env` nunca versionado — `.env.example` sem valores reais
- [ ] `external_id` e `source` não editáveis pelo usuário final
- [ ] Logs de sync em `sync_logs`
- [ ] CORS restrito a domínios Vercel + localhost

---

## 12. Sub-Specs (a criar)

| Sub-spec | Status |
|---|---|
| `2026-05-26-auth-membros-design.md` | Pendente |
| `2026-05-26-agenda-eventos-design.md` | Pendente |
| `2026-05-26-escalas-design.md` | Pendente |
| `2026-05-26-departamentos-design.md` | Pendente |
| `2026-05-26-notificacoes-design.md` | Pendente |
| `2026-05-26-sync-externo-design.md` | Pendente |

---

## 13. Decisões Consolidadas

| Decisão | Escolha |
|---|---|
| Arquitetura | Frontend + API dedicada (Hono/Railway) |
| Multi-tenant | RLS por church_id |
| Auth | Supabase Auth + JWT validado na API |
| Roles | admin / lider / membro |
| Notificações MVP | WhatsApp (Evolution API) + Email (Resend) via n8n |
| Dados externos | source + external_id, merge por campo, só leitura no MVP |
| Ambientes | 2 projetos Supabase + Vercel previews |
| Estrutura repo | Monorepo Turborepo |
