# README — Contexto Inicial do Projeto

## O que é

Este arquivo é o ponto de partida do projeto.

Ele não deve concentrar toda a documentação. Sua função é iniciar a análise, orientar o agente e disparar a leitura do arquivo principal de configuração do projeto: `CONFIG.md`.

O `CONFIG.md` contém as regras completas de organização, governança, segurança, checkpoints, tarefas, módulos, versionamento e retomada.

# Do que se trata o projeto

Este projeto é referente a um SAAS que organiza, controla agendas, cuida dos membros, misssionarios e pastores. Todo o fluxo da igreja será tratada nesta plataforma.

---

## Objetivo deste README

Usar este arquivo para:

- Iniciar qualquer nova sessão de trabalho.
- Evitar perda de contexto entre conversas, agentes ou desenvolvedores.
- Padronizar a ordem de leitura dos documentos do projeto.
- Impedir alterações sem análise prévia.
- Direcionar o agente para o `CONFIG.md` antes de qualquer execução.
- Separar contexto inicial de documentação completa.

---

## Quando iniciar a análise

Iniciar este fluxo quando o usuário disser algo como:

- `vamos começar`
- `retomar projeto`
- `analisar README`
- `analisar contexto`
- `analisar arquivo de contexto`
- `continuar de onde paramos`
- `verificar próximo passo`

Ao identificar qualquer um desses gatilhos, o agente deve seguir a ordem obrigatória de leitura.

---

## Ordem obrigatória de leitura

Antes de propor execução, alteração, código, prompt, documentação ou decisão técnica:

1. Ler este `README.md`.
2. Ler `CONFIG.md`.
3. Consultar `PROD.md`, quando existir.
4. Consultar o checkpoint mais recente em `checkpoint/` ou `checkpoints/`, quando existir.
5. Consultar `TASK.md`, quando existir.
6. Consultar documentação específica em `docs/`, `modules/`, `referencias/`, `workflows/`, `sql/` ou pasta equivalente.
7. Apresentar o estado atual encontrado.
8. Sugerir a próxima etapa objetiva.
9. Aguardar confirmação antes de alterar arquivos críticos, integrações, banco de dados ou produção.

---

## Premissas gerais

1. O `README.md` é o disparador inicial do projeto.
2. O `CONFIG.md` é a fonte principal de governança do projeto.
3. O `PROD.md` é o espelho técnico consolidado do estado atual.
4. O `TASK.md` é a referência de progresso operacional.
5. Os checkpoints registram o histórico detalhado das sessões.
6. Cada módulo, funcionalidade ou subprojeto deve ser tratado de forma isolada sempre que possível.
7. É proibido alterar uma funcionalidade existente apenas para ativar uma nova sem explicar impacto, validação e rollback.
8. Secrets, tokens, credenciais, URLs sensíveis e dados reais não devem ser expostos, versionados ou salvos em documentação pública.
9. Em caso de dúvida, o agente deve declarar a incerteza e solicitar validação.
10. Nenhuma premissa crítica deve ser inventada.
11. Toda decisão importante deve ser documentada.

---

## Gatilhos de atenção especial

Antes de qualquer ação envolvendo os temas abaixo, consultar obrigatoriamente o `CONFIG.md` e verificar se existe documentação específica do módulo:

| Tema | Ação obrigatória |
|---|---|
| Produção | Validar branch, rollback, impacto, build, testes e autorização. |
| Banco de dados | Validar migration, backup, rastreabilidade e impacto. |
| Integrações externas | Validar credenciais, limites, logs, retries e segurança. |
| Automações | Validar gatilho, volume, frequência, filas, logs e reversão. |
| Disparo em massa | Validar limite, janela, opt-in, auditoria e risco operacional. |
| Segurança | Validar exposição de secrets, permissões, tokens e logs. |
| Módulo existente | Não alterar fluxo funcional sem análise de impacto. |
| Novo módulo | Criar subprojeto ou área isolada antes de integrar ao fluxo principal. |

---

## Resposta inicial obrigatória do agente

Ao iniciar a análise, responder sempre neste formato:

```md
## Retomada do Projeto

### Arquivos consultados
- [ ] README.md
- [ ] CONFIG.md
- [ ] PROD.md
- [ ] TASK.md
- [ ] Último checkpoint
- [ ] Documentação do módulo, se existir

### Estado atual identificado
Resumo objetivo do estado encontrado.

### Próxima etapa recomendada
Ação mais segura e objetiva para continuar.

### Riscos ou pontos de atenção
Lista curta dos riscos antes de avançar.

### Confirmação necessária
Aguardar aprovação do responsável antes de executar alterações críticas.
```

---

## Política de checkpoints

Sempre que uma etapa relevante for concluída, criar ou atualizar checkpoint conforme as regras do `CONFIG.md`.

O checkpoint deve registrar, no mínimo:

- data e hora real da geração;
- branch atual;
- objetivo da sessão;
- resumo do que foi feito;
- arquivos criados ou alterados;
- validações executadas;
- decisões tomadas;
- pendências;
- próxima etapa recomendada.

Nunca usar hora estimada quando o ambiente permitir consultar a hora real da máquina.

---

## Regras para agentes

O agente deve:

1. Trabalhar passo a passo.
2. Declarar o que vai analisar antes de executar.
3. Separar diagnóstico, plano, execução e validação.
4. Não assumir requisitos ausentes.
5. Não modificar produção sem autorização.
6. Não criar dependência desnecessária entre módulos.
7. Não expor dados sensíveis.
8. Não duplicar documentação sem necessidade.
9. Atualizar `TASK.md`, `PROD.md` e checkpoints quando aplicável.
10. Encerrar cada etapa com próximo passo claro.

---

## O que este README não é

Este arquivo não substitui:

- `CONFIG.md`
- `PROD.md`
- `TASK.md`
- checkpoints
- documentação técnica dos módulos
- documentação de arquitetura
- documentação de segurança

Ele é apenas o disparador de contexto.

---

## Fluxo resumido

```text
Abrir README.md → Ler CONFIG.md → Consultar estado atual → Ver checkpoint → Ver tarefas → Planejar → Confirmar → Executar → Validar → Registrar
```

---

## Primeira ação recomendada

Ao iniciar qualquer trabalho neste projeto, a primeira ação do agente deve ser:

```text
Vou consultar o README.md, o CONFIG.md, o PROD.md, o TASK.md e o último checkpoint para identificar o estado atual e propor a próxima etapa com segurança.
```
