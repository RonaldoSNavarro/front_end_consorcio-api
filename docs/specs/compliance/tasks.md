# 📋 Decomposição de Tarefas Frontend — Compliance e Listas Restritivas (compliance)

*   **Capability**: compliance
*   **UI Spec de referência**: [ui-spec.md](ui-spec.md)
*   **API Contract Backend**: [api-contract.md](../../consorcio-api/docs/specs/compliance/api-contract.md)
*   **Total de tarefas**: 5
*   **REQ-IDs cobertos**: REQ-COMP-002, REQ-COMP-003, REQ-COMP-004, REQ-COMP-005

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

### [FRONTEND] REQ-COMP-002, REQ-COMP-005: Cobertura de Testes Automatizados
- [x] Criar arquivo de teste dedicado para `CompliancePainelPage.test.jsx` validando:
  - Carregamento da tabela e filtros.
  - Comportamento de clique e erro no modal de deliberação.
  - Restrição de rota por RBAC (acesso autorizado/negado).
  - Execução da sincronização manual de listas.
