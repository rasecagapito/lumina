# CONFIG — Estrutura Geral e Governança do Projeto

Este arquivo organiza os artefatos do projeto e dos módulos existentes, servindo como ponto inicial de leitura para qualquer análise, implementação, manutenção ou retomada futura.

> **Objetivo:** manter o projeto documentado, rastreável, seguro e fácil de evoluir, evitando perda de contexto, alterações sem controle e retrabalho.

> **Observação:** este arquivo é o guia completo. O `README.md` deve ser curto e apenas disparar a leitura deste `CONFIG.md`.

---

## 1. Finalidade

Esta pasta concentra os principais artefatos de negócio, técnicos e operacionais do projeto.

Use este CONFIG para:

- Entender a finalidade geral do projeto.
- Localizar documentos, módulos, integrações, checkpoints e tarefas.
- Padronizar a entrada de novos arquivos e subprojetos.
- Orientar agentes de IA, desenvolvedores e responsáveis técnicos.
- Garantir continuidade entre sessões de trabalho.
- Reduzir risco de alterações indevidas em funcionalidades já existentes.

---

## 2. Como iniciar qualquer atividade

Antes de iniciar uma análise, implementação, correção, revisão ou retomada:

1. Ler o `README.md` de contexto do projeto (`README.md`) e depois este `CONFIG.md`.
2. Consultar `PROD.md`, quando existir, para entender o estado técnico consolidado do projeto.
3. Consultar o checkpoint mais recente em `checkpoint/` ou `checkpoints/`.
4. Consultar `TASK.md`, quando existir, para identificar pendências e tarefas em andamento.
5. Verificar se há documentação específica do módulo em `docs/`, `modules/` ou pasta equivalente.
6. Registrar claramente a próxima etapa antes de alterar código, dados, integrações ou documentação.
7. Em caso de dúvida, não assumir: documentar a incerteza e solicitar validação do responsável.

---

## 3. Estrutura recomendada de pastas

A estrutura abaixo pode ser adaptada conforme o tamanho e a tecnologia do projeto, mas deve ser mantida como padrão sempre que possível.

```text
/
├── README.md
├── CONFIG.md
├── PROD.md
├── TASK.md
├── CHANGELOG.md
├── .env.example
├── docs/
├── referencias/
├── modules/
├── workflows/
├── sql/
├── scripts/
├── migrations/
├── checkpoint/
├── checklist/
├── evidencias/
├── prompts/
└── src/
```

---

## 4. Uso de cada pasta

| Pasta / Arquivo | Uso |
|---|---|
| `README.md` | Arquivo de contexto inicial do agente. Serve como disparador da análise e aponta para este `CONFIG.md`. |
| `CONFIG.md` | Guia completo de organização, governança, segurança, checkpoints e fluxo de trabalho. |
| `PROD.md` | Espelho técnico consolidado do projeto. Deve refletir o estado atual real. |
| `TASK.md` | Controle de tarefas pendentes, em andamento e concluídas. |
| `CHANGELOG.md` | Histórico resumido de mudanças relevantes por versão ou data. |
| `.env.example` | Modelo seguro das variáveis de ambiente, sem valores reais. |
| `docs/` | Requisitos, decisões funcionais, regras de negócio, arquitetura e documentação técnica. |
| `referencias/` | Materiais de origem, planilhas, exemplos, mapeamentos, prints e documentos recebidos. |
| `modules/` | Documentação ou artefatos separados por módulo, domínio ou funcionalidade. |
| `workflows/` | Exportações, desenhos e documentação de automações, integrações e fluxos operacionais. |
| `sql/` | Consultas, scripts auxiliares, validações e análises ainda não promovidas a migration. |
| `scripts/` | Scripts utilitários de apoio ao projeto. |
| `migrations/` | Alterações versionadas de banco de dados. |
| `checkpoint/` | Registros de continuidade, marcos técnicos e histórico de execução. |
| `checklist/` | Listas de validação, homologação, segurança, deploy e rollback. |
| `evidencias/` | Evidências sanitizadas de testes, validações, prints e auditorias. |
| `prompts/` | Prompts versionados usados por agentes de IA, automações ou documentação. |
| `src/` | Código-fonte executável da aplicação, quando existir. |

---

## 5. Regra geral para módulos

Cada módulo, funcionalidade ou subprojeto deve ser tratado de forma isolada sempre que possível.

Exemplo:

```text
modules/
└── nome-do-modulo/
    ├── README.md
    ├── docs/
    ├── referencias/
    ├── workflows/
    ├── sql/
    ├── checkpoint/
    └── checklist/
```

Cada módulo pode possuir seu próprio `README.md` quando tiver regras, integrações ou histórico específico.

### Regras para novos módulos

1. Criar uma pasta própria para o módulo.
2. Documentar finalidade, entradas, saídas, regras e integrações.
3. Evitar misturar artefatos de módulos diferentes.
4. Não alterar funcionalidades existentes para ativar uma nova sem análise de impacto.
5. Quando houver dependência entre módulos, documentar claramente a relação.
6. Criar checklist específico quando o módulo tiver implantação, integração ou regra crítica.

---

## 6. PROD.md — Espelho técnico do projeto

O arquivo `PROD.md` deve representar o estado técnico consolidado do projeto.

Ele não é um diário de sessão. Para histórico detalhado, use checkpoints.

### O que manter no PROD.md

- Visão geral técnica do projeto.
- Stack utilizada.
- Ambientes existentes.
- Módulos ativos.
- Integrações em produção e homologação.
- Estrutura de banco de dados relevante.
- Fluxos principais.
- Regras críticas de negócio.
- Checklist consolidado.
- Pendências técnicas priorizadas.
- Pontos de atenção conhecidos.

### Regras de manutenção

1. Atualizar após mudanças significativas.
2. Manter organizado e objetivo.
3. Não registrar conversas longas ou logs extensos.
4. Não gravar secrets, tokens, senhas ou dados sensíveis.
5. Antes de iniciar qualquer trabalho, consultar o `PROD.md`.
6. Ao concluir qualquer trabalho relevante, avaliar se o `PROD.md` precisa ser atualizado.

---

## 7. TASK.md — Controle de tarefas

O arquivo `TASK.md` deve refletir o estado real do trabalho.

### Status permitidos

| Status | Significado |
|---|---|
| `⏳ Pendente` | Ainda não iniciado. |
| `🔄 Em andamento` | Em execução ou análise. |
| `✅ Concluído` | Finalizado e validado. |
| `⚠️ Bloqueado` | Depende de decisão, acesso, arquivo ou validação externa. |
| `🧪 Em teste` | Implementado, mas ainda em validação. |

### Modelo recomendado

```md
# TASK.md — Controle de Tarefas

## Tarefas

| Status | Prioridade | Tarefa | Responsável | Observação |
|---|---|---|---|---|
| ⏳ Pendente | Alta | Descrever tarefa | Nome/Área | Observação |
| 🔄 Em andamento | Média | Descrever tarefa | Nome/Área | Observação |
| ✅ Concluído | Baixa | Descrever tarefa | Nome/Área | Observação |
```

---

## 8. Política de checkpoint

Checkpoints servem para preservar continuidade entre sessões, registrar decisões e permitir retomada segura do trabalho.

### Quando criar checkpoint

Criar ou atualizar checkpoint quando:

- Uma etapa importante for concluída.
- Uma decisão técnica relevante for tomada.
- Um erro crítico for diagnosticado.
- Um fluxo, módulo ou integração for validado.
- Antes de uma mudança com risco.
- Ao encerrar uma sessão longa de trabalho.

### Nome do arquivo

Padrão recomendado:

```text
checkpoint/CHECKPOINT_YYYYMMDD_HHMM.md
```

Exemplo:

```text
checkpoint/CHECKPOINT_20260526_1430.md
```

### Como obter data e hora real

No Windows PowerShell:

```powershell
Get-Date -Format 'yyyyMMdd_HHmm'
```

No Linux/macOS:

```bash
date +"%Y%m%d_%H%M"
```

### Conteúdo mínimo do checkpoint

Cada checkpoint deve conter:

- Data e hora real da geração.
- Branch atual.
- Contexto desde o último checkpoint.
- Resumo objetivo do que foi feito.
- Arquivos criados ou alterados.
- Validações executadas.
- Decisões tomadas.
- Erros encontrados e soluções aplicadas.
- Pendências.
- Próximos passos técnicos.

### Modelo de checkpoint

```md
# CHECKPOINT_YYYYMMDD_HHMM

## Contexto

Descrever o ponto de partida e o motivo do checkpoint.

## O que foi feito

- Item 1
- Item 2
- Item 3

## Arquivos alterados

| Arquivo | Alteração |
|---|---|
| `caminho/arquivo` | Descrição da alteração |

## Validações executadas

- Validação 1
- Validação 2

## Decisões tomadas

- Decisão 1
- Decisão 2

## Pendências

- Pendência 1
- Pendência 2

## Próximos passos

1. Próximo passo imediato.
2. Próxima validação.
3. Próxima decisão necessária.
```

---

## 9. Checklist de controle do projeto

Antes de qualquer alteração relevante, validar:

- [ ] O `README.md` foi lido.
- [ ] O `PROD.md` foi consultado.
- [ ] O checkpoint mais recente foi consultado.
- [ ] O `TASK.md` foi conferido.
- [ ] A branch correta está selecionada.
- [ ] O impacto da alteração foi analisado.
- [ ] Existe plano de rollback, quando aplicável.
- [ ] Secrets e credenciais não serão expostos.
- [ ] A alteração não quebra funcionalidade existente.
- [ ] A nova funcionalidade está isolada, quando possível.
- [ ] Testes ou validações foram definidos.
- [ ] Evidências serão registradas quando necessário.

---

## 10. Branches e ambientes

**Repositório:** `https://github.com/rasecagapito/lumina`

### Fluxo obrigatório

```
dev → hom → main
```

Nunca desenvolver diretamente em `main`. Toda alteração inicia em `dev`, valida em `hom`, publica em `main`.

### Branches principais

| Branch | Ambiente | Uso |
|--------|----------|-----|
| `main` | Produção | Código estável e validado. Sem push direto. |
| `hom` | Homologação | Validação antes de produção. Preferencialmente via PR. |
| `dev` | Desenvolvimento | Desenvolvimento contínuo. |
| `feature/nome` | Isolamento | Nova funcionalidade ou ajuste específico. |
| `hotfix/nome` | Emergencial | Correção rápida com rastreabilidade. |

### Proteções de branch

| Branch | Regras |
|--------|--------|
| `main` | Sem push direto · exige PR · exige aprovação · bloqueia force push · bloqueia exclusão |
| `hom` | Preferencialmente via PR · bloqueia force push · bloqueia exclusão |
| `dev` | Push livre · não vai direto para produção |

### Pull Requests

| PR | Uso |
|----|-----|
| `dev → hom` | Alteração pronta para teste em homologação |
| `hom → main` | Alteração validada e aprovada para produção |

### Padrão de commits

```
feat: adiciona tela de login
fix: corrige erro no cadastro de usuário
refactor: reorganiza estrutura de componentes
docs: atualiza documentação do projeto
```

### Antes de alterar produção

- [ ] Build executado.
- [ ] Lint executado.
- [ ] Testes mínimos executados.
- [ ] Impacto de banco avaliado.
- [ ] Rollback definido.
- [ ] Responsável aprovou a alteração.
- [ ] Evidências foram registradas.

---

## 11. Segurança e dados sensíveis

É proibido versionar:

- Senhas.
- Tokens.
- Chaves de API.
- URLs com credenciais.
- Dados pessoais sensíveis.
- Dados reais de clientes sem sanitização.
- Arquivos `.env` reais.
- Dumps de banco com dados produtivos.

### Onde guardar secrets

Secrets devem ficar apenas em locais apropriados, como:

- `.env.local`
- Variáveis de ambiente da plataforma de deploy
- Secret manager
- Cofre de senhas corporativo
- Configuração segura da ferramenta utilizada

### Arquivos de ambiente

Padrão adotado neste projeto:

| Arquivo | Uso | Git |
|---------|-----|-----|
| `.env` | PRD local (self-hosted Coolify) | ❌ ignorado |
| `.env_hom` | HOM local (Supabase cloud) | ❌ ignorado |
| `.env.example` | Modelo sem valores reais | ✅ versionado |

Regra no `.gitignore`: `.env` e `.env_*` cobrem todos os variantes.

**Nunca hardcodar chaves, senhas ou tokens no código.** Secrets em produção ficam exclusivamente em GitHub Actions Secrets.

### Arquivos recomendados no `.gitignore`

```gitignore
.env
.env.*
.env_*
*.key
*.pem
*.pfx
*.bak
*.dump
node_modules/
dist/
build/
coverage/
```

---

## 12. Regra de proteção de funcionalidades existentes

Funcionalidades existentes e já validadas não devem ser alteradas para ativar uma nova funcionalidade sem análise prévia.

Antes de modificar algo já em uso:

1. Explicar o motivo da alteração.
2. Mapear impacto técnico e funcional.
3. Identificar arquivos, fluxos ou integrações afetadas.
4. Definir plano de teste.
5. Definir plano de rollback.
6. Solicitar autorização do responsável pelo projeto.
7. Registrar decisão em checkpoint.

Sempre que possível, novas funcionalidades devem nascer isoladas em novo módulo, nova rota, novo fluxo, nova branch ou nova pasta.

---

## 13. Evidências e validações

Use a pasta `evidencias/` para registrar provas sanitizadas de execução.

Exemplos:

- Prints sem dados sensíveis.
- Logs sanitizados.
- Resultado de testes.
- Resultado de build.
- Resultado de lint.
- Resultado de consulta ou integração.
- Evidência de deploy.
- Evidência de rollback.

### Modelo de evidência

```md
# Evidência — Nome da Validação

## Data e hora

YYYY-MM-DD HH:MM

## Ambiente

Descrever ambiente: local, desenvolvimento, homologação ou produção.

## Objetivo

Descrever o que foi validado.

## Procedimento

Descrever os passos executados.

## Resultado

Descrever o resultado obtido.

## Observações

Registrar riscos, limitações ou próximos passos.
```

---

## 14. Regras para agentes de IA

Quando um agente de IA atuar neste projeto, ele deve seguir este fluxo:

1. Ler o `README.md` de contexto do projeto (`README.md`) e depois este `CONFIG.md`.
2. Consultar `PROD.md`, se existir.
3. Consultar o checkpoint mais recente.
4. Consultar `TASK.md`, se existir.
5. Identificar o módulo ou contexto afetado.
6. Não assumir requisitos ausentes.
7. Não alterar arquivos fora do escopo solicitado.
8. Propor plano antes de executar mudanças relevantes.
9. Trabalhar passo a passo.
10. Registrar decisões importantes.
11. Preservar funcionalidades existentes.
12. Não expor secrets ou dados sensíveis.
13. Atualizar documentação quando a mudança alterar o estado do projeto.

### Antidelírio

Se faltar contexto, o agente deve responder:

```text
Requisitos insuficientes para executar com segurança. Favor detalhar:
1. Objetivo da alteração
2. Módulo afetado
3. Arquivos envolvidos
4. Ambiente alvo
5. Critérios de aceite
```

---

## 15. Critérios de aceite para mudanças

Uma mudança só deve ser considerada concluída quando:

- [ ] O objetivo foi atendido.
- [ ] A alteração está no local correto.
- [ ] O impacto foi avaliado.
- [ ] Não houve exposição de dados sensíveis.
- [ ] As validações necessárias foram executadas.
- [ ] O `TASK.md` foi atualizado, quando aplicável.
- [ ] O checkpoint foi criado ou atualizado, quando aplicável.
- [ ] O `PROD.md` foi atualizado, quando a mudança alterar o estado técnico consolidado.
- [ ] O responsável validou a entrega, quando necessário.

---

## 16. Padrão para documentação de módulo

Quando criar um novo módulo, usar este modelo:

```md
# Nome do Módulo

## Objetivo

Descrever a finalidade do módulo.

## Escopo

O que este módulo faz e o que não faz.

## Entradas

- Entrada 1
- Entrada 2

## Saídas

- Saída 1
- Saída 2

## Regras de negócio

- Regra 1
- Regra 2

## Integrações

- Sistema/Ferramenta 1
- Sistema/Ferramenta 2

## Arquivos relacionados

| Arquivo | Finalidade |
|---|---|
| `caminho/arquivo` | Descrição |

## Riscos

- Risco 1
- Risco 2

## Checklist

- [ ] Item 1
- [ ] Item 2

## Próximos passos

1. Passo 1
2. Passo 2
```

---

## 17. Padrão de versionamento de prompts

Prompts usados no projeto devem ficar em `prompts/` e seguir versionamento.

### Nome recomendado

```text
prompts/NOME_DO_PROMPT_v1.md
prompts/NOME_DO_PROMPT_v2.md
prompts/NOME_DO_PROMPT_v3.md
```

### Conteúdo mínimo

```md
# Nome do Prompt — v1

## Objetivo

## Contexto

## Papel do agente

## Regras

## Fluxo de trabalho

## Limitações

## Saída esperada

## Antidelírio

## Critérios de aceite

## Histórico de versões
```

---

## 18. Governança mínima

Este projeto deve seguir as seguintes regras de governança:

1. Toda mudança relevante deve ter rastreabilidade.
2. Toda decisão técnica importante deve ser documentada.
3. Todo segredo deve permanecer fora do Git.
4. Toda funcionalidade crítica deve ter evidência de validação.
5. Toda nova frente deve ser separada em módulo, branch ou subprojeto.
6. O estado consolidado deve estar no `PROD.md`.
7. O histórico detalhado deve estar em `checkpoint/`.
8. As tarefas devem estar atualizadas em `TASK.md`.
9. Arquivos futuros devem ser adicionados na pasta correta.
10. O projeto deve ser compreensível para outra pessoa ou agente retomar sem depender de memória informal.

---

## 19. Próxima etapa padrão

Ao retomar este projeto, a próxima etapa deve ser apresentada no seguinte formato:

```md
## Retomada do Projeto

### Estado atual identificado

Resumo do que foi encontrado no arquivo de contexto, CONFIG, PROD, TASK e último checkpoint.

### Próxima etapa recomendada

Descrever a próxima ação objetiva.

### Arquivos que serão consultados

- `CLAUDE.md`
- `CONFIG.md`
- `PROD.md`
- `TASK.md`
- `checkpoint/...`

### Riscos antes de avançar

- Risco 1
- Risco 2

### Confirmação necessária

Aguardar aprovação do responsável antes de alterar arquivos críticos.
```

---

## 20. Resumo operacional

Este CONFIG existe para garantir que qualquer pessoa ou agente consiga entender, retomar e evoluir o projeto com segurança.

Antes de agir:

```text
Ler → Entender → Planejar → Validar → Executar → Registrar → Atualizar
```

Essa sequência deve orientar todas as atividades do projeto.

---

## 21. Estado atual do projeto — Lumina

> Atualizado em: 2026-05-28

### Fase concluída

**Fundação técnica completa (Tasks 1–12)** — concluída em 2026-05-26.

### Stack definida

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 18 + TypeScript + Vite + shadcn/ui + Tailwind v3 |
| Backend API | Hono (Node.js) — deploy Railway |
| Banco / Auth | Supabase (Postgres + RLS + Auth) — dois projetos: PRD e HOM |
| Automações | n8n + Evolution API (WhatsApp) + Resend (email) |
| Deploy frontend | Vercel |
| Monorepo | Turborepo + pnpm workspaces |

### Estrutura do monorepo

```text
apps/
  api/          — Hono API (autenticação, RBAC, invite, módulos)
  web/          — React frontend (Vite + shadcn/ui)
packages/
  types/        — DTOs compartilhados (@lumina/types)
supabase/
  migrations/   — 8 migrations SQL com RLS
.github/
  workflows/    — CI (ci.yml) + Deploy HOM (deploy-hom.yml)
```

### O que está implementado

| Componente | Status |
|-----------|--------|
| Monorepo Turborepo | ✅ |
| `@lumina/types` DTOs | ✅ |
| Hono API scaffold + testes (21/21) | ✅ |
| Supabase service-role client | ✅ |
| Auth middleware (JWT/JWKS) | ✅ |
| RBAC middleware | ✅ |
| Invite service + rotas | ✅ |
| 8 migrations SQL (RLS) | ✅ |
| Frontend Vite + shadcn/ui | ✅ |
| AuthProvider + react-query | ✅ |
| LoginPage + AcceptInvitePage | ✅ |
| CI/CD GitHub Actions | ✅ |
| Server entrypoint (`tsx watch`) | ✅ |

### Infraestrutura

| Item | Status |
|------|--------|
| Supabase HOM (`znpqxsuxcwwfafztjxya`) | ✅ Provisionado + migrations aplicadas |
| Supabase PRD (self-hosted Coolify, `supabase.hagap.online`) | ✅ Disponível |
| Proteções de branch `main` e `hom` | ✅ Ativas no GitHub |
| Secrets GitHub Actions (HOM) | ✅ 5 secrets configurados |
| Secrets GitHub Actions (PRD) | ⏳ Pendente |
| Configurar Railway (API HOM + PRD) | ⏳ Pendente |
| Configurar Vercel (web HOM + PRD) | ⏳ Pendente |

### Módulos planejados (Fase 1)

| Módulo | Status |
|--------|--------|
| Auth + Membros | ⏳ Brainstorming pendente |
| Eventos | ⏳ Brainstorming pendente |
| Escalas | ⏳ Brainstorming pendente |
| Departamentos | ⏳ Brainstorming pendente |
| Notificações (WhatsApp + Email) | ⏳ Brainstorming pendente |
| Sync externo (API parceira) | ⏳ Brainstorming pendente |

### Referências disponíveis

| Documento | Local |
|-----------|-------|
| Master design spec | `docs/superpowers/specs/2026-05-26-lumina-master-design.md` |
| Plano de fundação | `docs/superpowers/plans/2026-05-26-foundation.md` |
| Spec inicial consolidada | `docs/spec-inicial.md` |
| Análise Agenda360 | `referencias/agenda360/` |
| Análise Sistema Sepal | `referencias/sepal/` |
| Análise midias.app | `referencias/site-referencia/` |

### Último checkpoint

`checkpoint/CHECKPOINT_20260526_2113.md`

### Próxima etapa

1. Configurar secrets PRD no GitHub Actions
2. Configurar Railway HOM (API deploy) + `RAILWAY_HOM_TOKEN`
3. Configurar Vercel HOM (frontend deploy)
4. Criar `deploy-prd.yml` adaptado para Supabase self-hosted (`--db-url`)
5. Brainstorming do primeiro módulo da Fase 1 (Auth+Membros recomendado)
