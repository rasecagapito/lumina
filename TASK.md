# TASK.md — Controle de Tarefas

> Atualizado em: 2026-05-28

---

## Infraestrutura

| Status | Prioridade | Tarefa | Observação |
|--------|-----------|--------|------------|
| ✅ Concluído | Alta | Provisionar Supabase HOM | `znpqxsuxcwwfafztjxya` |
| ✅ Concluído | Alta | Provisionar Supabase PRD | Self-hosted Coolify `supabase.hagap.online` |
| ✅ Concluído | Alta | Configurar secrets GitHub Actions | 10 secrets HOM+PRD |
| ✅ Concluído | Alta | Proteções de branch `main` e `hom` | Via GitHub API |
| ✅ Concluído | Média | Deploy API HOM no Coolify | `api-hom.hagap.online` ✅ |
| ✅ Concluído | Média | Aplicar migrations no HOM | `supabase db push` |
| ✅ Concluído | Alta | Atualizar `deploy-hom.yml` | Railway → Coolify webhook + COOLIFY_API_TOKEN |
| ⏳ Pendente | Média | Configurar Vercel (web HOM) | Vercel GitHub integration |
| ⏳ Pendente | Baixa | Deploy API PRD no Coolify | Após HOM validado |
| ⏳ Pendente | Baixa | Configurar Vercel (web PRD) | Após HOM validado |

---

## Fase 1 — Módulos Core

### Auth + Membros

| Status | Prioridade | Tarefa | Observação |
|--------|-----------|--------|------------|
| ⏳ Pendente | Alta | Brainstorming + spec | `/brainstorming` |
| ⏳ Pendente | Alta | Plano de implementação | `writing-plans` |
| ⏳ Pendente | Alta | Implementar listagem de membros | API + Frontend |
| ⏳ Pendente | Alta | Implementar edição de perfil | Admin edita qualquer, membro edita próprio |
| ⏳ Pendente | Alta | Implementar desativação de membro | Admin only |
| ⏳ Pendente | Alta | Implementar página de membros | React + TanStack Query |

### Departamentos

| Status | Prioridade | Tarefa | Observação |
|--------|-----------|--------|------------|
| ⏳ Pendente | Alta | Brainstorming + spec | `/brainstorming` |
| ⏳ Pendente | Alta | Plano de implementação | `writing-plans` |
| ⏳ Pendente | Alta | CRUD de departamentos | API + Frontend |
| ⏳ Pendente | Alta | Gestão de membros por departamento | API + Frontend |

### Eventos

| Status | Prioridade | Tarefa | Observação |
|--------|-----------|--------|------------|
| ⏳ Pendente | Média | Brainstorming + spec | `/brainstorming` |
| ⏳ Pendente | Média | Plano de implementação | `writing-plans` |
| ⏳ Pendente | Média | CRUD de eventos | API + Frontend |
| ⏳ Pendente | Média | Confirmação de presença | API + Frontend |

### Escalas

| Status | Prioridade | Tarefa | Observação |
|--------|-----------|--------|------------|
| ⏳ Pendente | Média | Brainstorming + spec | `/brainstorming` |
| ⏳ Pendente | Média | Plano de implementação | `writing-plans` |
| ⏳ Pendente | Média | CRUD de escalas e slots | API + Frontend |
| ⏳ Pendente | Média | Confirmação/recusa de slot | Membro confirma próprio slot |
| ⏳ Pendente | Média | Fila de substitutos | Lógica de backup |

### Notificações

| Status | Prioridade | Tarefa | Observação |
|--------|-----------|--------|------------|
| ⏳ Pendente | Média | Brainstorming + spec | `/brainstorming` |
| ⏳ Pendente | Média | Plano de implementação | `writing-plans` |
| ⏳ Pendente | Média | Webhook n8n para disparo | Hono → n8n |
| ⏳ Pendente | Média | Workflow n8n WhatsApp | Evolution API |
| ⏳ Pendente | Média | Workflow n8n Email | Resend |

### Sync Externo

| Status | Prioridade | Tarefa | Observação |
|--------|-----------|--------|------------|
| ⏳ Pendente | Baixa | Brainstorming + spec | `/brainstorming` |
| ⏳ Pendente | Baixa | Plano de implementação | `writing-plans` |
| ⏳ Pendente | Baixa | Serviço de sync (leitura) | Consume API parceiro |
| ⏳ Pendente | Baixa | Merge por external_id | Upsert com source tracking |
| ⏳ Pendente | Baixa | Registro em sync_logs | Auditoria de sync |

---

## Documentação

| Status | Prioridade | Tarefa | Observação |
|--------|-----------|--------|------------|
| ✅ Concluído | Alta | PROD.md | Criado em 2026-05-26 |
| ✅ Concluído | Alta | TASK.md | Criado em 2026-05-26 |
| ⏳ Pendente | Baixa | CHANGELOG.md | Histórico de versões |

---

## Fundação (concluída)

| Status | Tarefa |
|--------|--------|
| ✅ Concluído | Monorepo Turborepo + pnpm |
| ✅ Concluído | `@lumina/types` DTOs |
| ✅ Concluído | Hono API scaffold + testes |
| ✅ Concluído | Supabase service-role client |
| ✅ Concluído | Auth middleware (JWT/JWKS) + RBAC |
| ✅ Concluído | Invite service + rotas |
| ✅ Concluído | 8 migrations SQL com RLS |
| ✅ Concluído | Frontend Vite + React + shadcn/ui |
| ✅ Concluído | AuthProvider + react-query + router |
| ✅ Concluído | LoginPage + AcceptInvitePage |
| ✅ Concluído | CI/CD GitHub Actions |
| ✅ Concluído | Server entrypoint (tsx watch) |
