# Tasks SDD — Módulo de Vendas (Frontend)

- **Capability**: vendas
- **UI Spec**: [ui-spec.md](ui-spec.md) v2.2
- **Spec Backend**: [spec.md](../../consorcio-api/docs/specs/vendas/spec.md) v2.2
- **API Contract**: [api-contract.md](../../consorcio-api/docs/specs/vendas/api-contract.md) v2.2
- **Status**: IMPLEMENTED

## BUG-PLD-VND-001 — REQ-VND-008

- [x] **[FRONTEND] REQ-VND-008 / AC-UI-1** — Interpretar `PENDENTE_ANALISE_RISCO` retornado por `POST /api/vendas/propostas` como proposta registrada e retida.
- [x] **[FRONTEND] REQ-VND-008 / AC-UI-1** — Interromper as chamadas de aprovação e efetivação automática quando a proposta exigir Compliance.
- [x] **[FRONTEND] REQ-VND-008 / AC-UI-1** — Exibir toast de aviso e direcionar para `/compliance/analise-risco`.
- [x] **[QA] REQ-VND-008 / AC-UI-1** — Cobrir no Vitest que aprovação e efetivação não são chamadas após a retenção.
- [x] **[QA] REQ-VND-008 / AC-UI-1** — Atualizar o cenário Playwright para validar o aviso e o redirecionamento ao Compliance.
- [x] **[DOCS] REQ-VND-008** — Sincronizar `ui-spec.md`, tarefas e matrizes de rastreabilidade com o contrato backend v2.1.

## Evidências

- `useVendaProposta.js`
- `hooks.test.jsx`
- `e2e/compliance.spec.js`
- Resultado: 13 testes frontend aprovados; ESLint direcionado aprovado.

## BUG-FIN-VND-002 — REQ-VND-004 e REQ-VND-005

- [x] **[FRONTEND]** Remover a chamada automática de `/contratos/{id}/efetivar` do wizard.
- [x] **[FRONTEND]** Encerrar o fluxo após a aprovação e informar que a primeira parcela está pendente.
- [x] **[FRONTEND]** Invalidar os caches de cotas, grupos, parcelas e dashboard.
- [x] **[QA]** Garantir em Vitest que o pagamento não é simulado.
- [x] **[QA]** Atualizar o cenário E2E e o texto de sucesso.

## Evidências v2.2

- `hooks.test.jsx` e `AnaliseRiscoPage.test.jsx`: 16 testes aprovados.
- `e2e/vendas.spec.js`: cenário atualizado para o novo estado pendente.
