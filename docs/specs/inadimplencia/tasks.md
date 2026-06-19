# 📋 Decomposição de Tarefas Frontend — Mora e Inadimplência (inadimplencia)

*   **Capability**: inadimplencia
*   **UI Spec de referência**: [ui-spec.md](ui-spec.md)
*   **API Contract Backend**: [api-contract.md](../../../../consorcio-api/docs/specs/inadimplencia/api-contract.md)
*   **Total de tarefas**: 8
*   **REQ-IDs cobertos**: 3/3

---

## Legenda

- `[ ]` — Pendente
- `[/]` — Em progresso
- `[x]` — Concluída

---

## Tarefas

### [FRONTEND] REQ-INA-001: Pagamento de Parcela com Encargos
- [x] Integrar botão de pagamento na `FinanceiroPage.jsx`
- [x] Criar hook `usePagarParcela()` (TanStack useMutation para `PUT /api/parcelas/{id}/pagar`)
- [x] Criar schema Zod `pagamentoSchema` (dataPagamento obrigatória)
- [x] Implementar exibição de detalhamento de encargos (multa + juros) no feedback
- [x] Implementar invalidação de cache de parcelas pós-pagamento

### [FRONTEND] REQ-INA-002: Estorno de Pagamento
- [x] Criar hook `useEstornarParcela()` (TanStack useMutation para `POST /api/parcelas/{id}/estornar`)
- [x] Implementar dialog de confirmação antes do estorno
- [x] Implementar invalidação de cache pós-estorno

### [FRONTEND] REQ-INA-003: Painel de Inadimplência
- [x] Integrar painel na `FinanceiroPage.jsx`
- [x] Criar hook `useInadimplencia(cotaId)` (TanStack useQuery para `GET /api/cotas/{id}/inadimplencia`)
- [x] Implementar badges de inadimplência na `CotasPage.jsx`
- [x] Implementar estados: loading (spinner), adimplente (verde), inadimplente (vermelho)

### [DESIGN] REQ-INA-001: Design do Painel de Inadimplência
- [x] Prototipar painel com detalhamento de encargos
- [x] Definir badges: Adimplente (verde) / Inadimplente (vermelho)
- [x] Validar acessibilidade WCAG AA
