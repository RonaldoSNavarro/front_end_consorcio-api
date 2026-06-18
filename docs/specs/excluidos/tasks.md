# 📋 Decomposição de Tarefas Frontend — Restituição de Excluídos (excluidos)

*   **Capability**: excluidos
*   **UI Spec de referência**: [ui-spec.md](ui-spec.md)
*   **API Contract Backend**: [api-contract.md](../../../../consorcio-api/docs/specs/excluidos/api-contract.md)
*   **Total de tarefas**: 8
*   **REQ-IDs cobertos**: 5/5

---

## Legenda

- `[ ]` — Pendente
- `[/]` — Em progresso
- `[x]` — Concluída

---

## Tarefas

### [FRONTEND] REQ-EXC-001: Cancelamento de Cota
- [x] Integrar botão "Cancelar" na `CotasPage.jsx`
- [ ] Criar hook `useCancelarCota()` (TanStack useMutation para `POST /api/cotas/{id}/cancelar`)
- [ ] Implementar ConfirmDialog antes do cancelamento
- [ ] Implementar invalidação de cache de cotas pós-cancelamento

### [FRONTEND] REQ-EXC-002/003/004: Reembolso de Cota Cancelada
- [x] Criar página `ReembolsosExcluidosPage.jsx`
- [ ] Criar hook `useReembolsarCota()` (TanStack useMutation para `POST /api/cotas/{id}/reembolsar`)
- [ ] Implementar exibição de memória de cálculo (total FC, multa 10%, valor líquido)
- [ ] Implementar badges: Pendente Reembolso (amarelo), Reembolsada (verde)
- [ ] Implementar bloqueio de duplo reembolso (desabilitar botão quando `reembolsada == true`)

### [FRONTEND] REQ-EXC-005: Feedback Contábil
- [ ] Exibir informação de lançamento contábil COSIF no toast de sucesso (informativo)

### [DESIGN] REQ-EXC-001: Design da Tela de Reembolsos
- [x] Prototipar tela com tabela de cotas canceladas e ações
- [ ] Definir layout da memória de cálculo
- [ ] Validar acessibilidade WCAG AA
