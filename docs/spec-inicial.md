# Lumina — Spec Inicial

## O que é o Lumina

SaaS para gestão completa de igrejas: agendas, membros, missionários, pastores, escalas, cuidado pastoral e comunicação.

Consolidado a partir de dois sistemas construídos anteriormente:
- **Agenda360** — gestão de escalas e voluntários (multi-tenant, WhatsApp/Telegram)
- **Sistema Sepal** — acompanhamento pastoral de missionários (check-ins, alertas, mensageria automatizada)

---

## Stack recomendada

| Camada | Tecnologia | Justificativa |
|--------|-----------|---------------|
| Frontend | React 18 + TypeScript + Vite | Testado em ambos os sistemas |
| UI | shadcn/ui + Radix UI + Tailwind CSS | Agenda360 prova a maturidade |
| Roteamento | React Router DOM 6 | Padrão consolidado |
| Estado | TanStack React Query | Otimizado para Supabase |
| Formulários | React Hook Form + Zod | Validação robusta |
| Backend | Supabase (PostgreSQL + RLS) | Auth, DB, Edge Functions num lugar |
| Edge Functions | Deno (Supabase) | Padrão Sepal, funciona bem |
| Automações | n8n | Mensageria e disparos sem acoplamento |
| Deploy frontend | Vercel | Simples, CI/CD automático |
| Deploy alternativo | Docker + Nginx | Opção VPS como Agenda360 |

---

## Módulos planejados

### Core (Fase 1)

| Módulo | Origem | Descrição |
|--------|--------|-----------|
| Auth + Multi-tenant | Agenda360 + Sepal | Cadastro, invite, roles, RLS |
| Membros | Novo | CRUD de membros com perfil, contatos, status |
| Agenda / Eventos | Agenda360 | Eventos da igreja, escalas de serviço |
| Escalas de Voluntários | Agenda360 | Atribuição, confirmação, backup queue |
| Departamentos | Agenda360 | Ministérios e funções por ministério |
| Notificações | Agenda360 + Sepal | WhatsApp + Telegram com janela segura |

### Pastoral (Fase 2)

| Módulo | Origem | Descrição |
|--------|--------|-----------|
| Pastores | Novo | Perfil, atribuições, agenda pastoral |
| Missionários | Sepal | Gestão completa (adaptado do Sepal) |
| Check-ins Pastorais | Sepal | Templates, scoring, alertas, dimensões |
| Mentoria | Sepal | Atribuições mentor ↔ pessoa cuidada |
| Painel PAI | Sepal | Alertas de cuidado pastoral |

### Avançado (Fase 3)

| Módulo | Origem | Descrição |
|--------|--------|-----------|
| Dízimos e Ofertas | Inspirado Ide.On | Área de membros com capacidade de dizimar online |
| Gravação de Cultos | Inspirado Ide.On | Captação ao vivo + upload de áudio do culto |
| Relatórios | Novo | Consolidações, exportações, gráficos |
| AI Pastoral | Novo | Claude API para insights e relatórios |
| App Mobile | Novo | React Native ou PWA |

> Dízimo: membro acessa área própria, registra ou paga dízimo digitalmente. Lumina controla histórico por membro.
> Gravação: pastor grava culto → Lumina armazena + pode integrar com Ide.On para geração de conteúdo.

---

## Padrões de banco de dados

### Multi-tenant
```sql
-- Toda tabela tem:
tenant_id UUID NOT NULL REFERENCES tenants(id)
-- RLS: SELECT/INSERT/UPDATE/DELETE filtram por get_user_tenant_id()
```

### Trigger de novo usuário
- Cria tenant (nome da igreja)
- Cria profile
- Atribui role inicial (admin)
- Habilita módulos do plano contratado

### Governança
- `tenant_admin_slots` (admin1 / admin2) — max 2 admins por tenant
- `governance_audit_logs` — toda ação crítica rastreada

### Feature flags
- `modules` + `tenant_modules` — habilitar/desabilitar por plano ou contrato

---

## Padrões de mensageria

| Regra | Valor |
|-------|-------|
| WhatsApp: janela | 08h–18h BRT |
| WhatsApp: limite diário | 30 mensagens/tenant |
| Telegram: sem janela | Qualquer horário |
| Lembretes | Máx 6, intervalo mínimo 1h |
| Ação sem resposta | Notificar responsável |
| Log | Todas as tentativas em `message_delivery_events` |

---

## Roles (proposta Lumina)

| Role | Acesso |
|------|--------|
| `platform_admin` | Cross-tenant, gestão da plataforma |
| `admin` | Gestão completa da igreja |
| `pastor_titular` | Acesso pastoral + admin |
| `pastor_auxiliar` | Acesso pastoral limitado |
| `lider` | Módulos do ministério |
| `secretaria` | Membros + agenda |
| `membro` | Próprio perfil + agenda pessoal |
| `visitante` | Somente leitura pública |

---

## Ambientes (desde o início)

| Ambiente | Branch | Supabase | Deploy |
|----------|--------|----------|--------|
| Produção | `main` | projeto-prd | Vercel PRD |
| Homologação | `hom` | projeto-hom | Vercel HOM |
| Desenvolvimento | `dev` | local / hom | localhost:5173 |

---

## O que NÃO repetir

1. **AI scaffolding sem implementação** — não criar tabelas AI antes de ter o módulo planejado
2. **Notificações sem edge functions** — usar Deno + n8n desde o início (não HTTP direto)
3. **Docs operacionais espalhadas** — manter tudo em `modules/<nome>/` desde o início
4. **Testes sem política** — definir política antes de escalar
5. **UI sem design system** — shadcn/ui desde o dia 1, não adaptar depois

---

## Referências

- [Agenda360 — Aprendizados](../referencias/agenda360/aprendizados.md)
- [Sepal — Aprendizados](../referencias/sepal/aprendizados.md)
- [Agenda360 — Banco](../referencias/agenda360/banco.md)
- [Sepal — Edge Functions](../referencias/sepal/edge-functions.md)
- [CONFIG.md](../CONFIG.md) — Governança do projeto
