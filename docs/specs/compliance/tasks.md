# 📋 Decomposição de Tarefas Frontend — Compliance e Listas Restritivas (compliance)

*   **Capability**: compliance
*   **UI Spec de referência**: [ui-spec.md](ui-spec.md)
*   **API Contract Backend**: [api-contract.md](../../consorcio-api/docs/specs/compliance/api-contract.md)
*   **Total de tarefas**: 7
*   **REQ-IDs cobertos**: REQ-COMP-002, REQ-COMP-003, REQ-COMP-004, REQ-COMP-005, REQ-COMP-006, REQ-COMP-008

---

## Legenda

- `[ ]` — Pendente
- `[/]` — Em progresso
- `[x]` — Concluída

---

## Tarefas

### [FRONTEND] REQ-COMP-003, REQ-COMP-004: Novos campos de Compliance em Cliente
- [x] Incluir campos `patrimonioEstimado`, `rendaMensalDeclarada` e `nivelRisco` no schema Zod do formulário.
- [x] Renderizar os campos com inputs adequados no `ClienteForm.jsx`.
- [x] Integrar salvamento e edição desses campos no `api.js` e `mockDb.js`.
- [x] Adicionar testes de validação dos novos campos no `schemas.test.js` e `App.test.jsx`.

### [FRONTEND] REQ-COMP-002: Sincronização de Listas
- [x] Mapear rota e endpoint de sincronização no `api.js`.
- [x] Implementar chamada local mockada no `mockDb.js`.
- [x] Adicionar botão "Sincronizar Bases" na tela do painel e associar à mutação.

### [FRONTEND] REQ-COMP-005: Painel de Compliance (Listas Restritivas)
- [x] Criar componente `CompliancePainelPage.jsx`.
- [x] Renderizar tabela de alertas e badges de status/score de similaridade.
- [x] Implementar filtros de status e origem.
- [x] Criar modal de deliberação com veredito e justificativa obrigatória (>10 caracteres).
- [x] Integrar endpoints `/api/compliance/alertas` (GET e PUT) no `api.js` e no mock do frontend.

### [FRONTEND] REQ-COMP-005: Rotas e Acesso Protegido (RBAC)
- [x] Adicionar rota `/compliance/alertas` no `App.jsx` protegida pelo componente de controle de acessos (apenas `ADMIN` e `COMPLIANCE`).
- [x] Renderizar item "Listas Restritivas (PLD)" na barra lateral (`Sidebar.jsx`) condicionado ao perfil do usuário.

### [FRONTEND] REQ-COMP-006: TASK-COMP-016 - Upload de Arquivos na UI
- [x] Criar aba de uploads no painel de compliance com drag-and-drop para os arquivos PEP, ONU e IBGE, incluindo barras de progresso ou loaders.
- [x] Adicionar validação de extensões (.csv, .xml, .xls, .xlsx) no frontend.
- [x] Mapear as chamadas HTTP e mock correspondentes no `api.js` e `mockDb.js`.

### [FRONTEND] REQ-COMP-008: TASK-COMP-017 - Configuração de Agendamento UI
- [x] Criar formulário na UI para alterar a frequência (Diária, Semanal, Mensal) e o horário de execução do Job de Compliance.
- [x] Implementar integração com endpoints `/api/compliance/config` (GET e PUT) em `api.js` e `mockDb.js`.

### [FRONTEND] REQ-COMP-002, REQ-COMP-005, REQ-COMP-006, REQ-COMP-008: Cobertura de Testes Automatizados
- [x] Criar arquivo de teste dedicado para `CompliancePainelPage.test.jsx` validando tabela, filtros, deliberação, sincronização manual.
- [x] Incrementar testes no `CompliancePainelPage.test.jsx` cobrindo a troca de abas, upload de arquivos e salvamento da configuração do cron.

### [TESTE E2E] Estabilidade Global e Bloqueios (Pendência)
- `[x]` **E2E Flakiness na Venda**: Resolver falhas de timeout (`locator.fill`) no teste E2E `Deve impedir venda para cliente bloqueado em lista restritiva (OFAC/ONU)`, assegurando que o modal não re-renderize perdendo a referência no DOM durante o clique de Avançar.
- `[x]` **E2E Timeout Global (Login)**: Mitigar sobrecarga de workers no setup global `test.beforeEach` que ocasionalmente causa timeout no carregamento inicial de `http://localhost:5173/login`.
