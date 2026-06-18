# 📋 Decomposição de Tarefas Frontend — Composição de Fundos e Parcelas (fundos)

*   **Capability**: fundos
*   **UI Spec de referência**: [ui-spec.md](ui-spec.md)
*   **API Contract Backend**: [api-contract.md](../../../../consorcio-api/docs/specs/fundos/api-contract.md)
*   **Total de tarefas**: 6
*   **REQ-IDs cobertos**: 3/3

---

## Legenda

- `[ ]` — Pendente
- `[/]` — Em progresso
- `[x]` — Concluída

---

## Tarefas

### [FRONTEND] REQ-FUN-001: Cronograma de Parcelas
- [x] Criar seção de parcelas em `FinanceiroPage.jsx`
- [ ] Criar hook `useParcelas(cotaId)` (TanStack useQuery para `GET /api/parcelas/cota/{cotaId}`)
- [ ] Criar hook `useCriarParcela()` (TanStack useMutation para `POST /api/parcelas`)
- [ ] Criar schema Zod `parcelaSchema` (valores positivos, data obrigatória)
- [ ] Implementar badges de status coloridos (PENDENTE/PAGA/ATRASADA)
- [ ] Implementar invalidação de cache pós-criação

### [FRONTEND] REQ-FUN-002: Validação de Consistência JPA
- [ ] Implementar exibição do campo `valorParcela` calculado (soma dos componentes)
- [ ] Implementar validação Zod que soma não pode ser negativa

### [DESIGN] REQ-FUN-001: Design do Painel Financeiro
- [x] Prototipar seção de parcelas com tabela e formulário
- [ ] Definir badges coloridos por status
- [ ] Validar acessibilidade WCAG AA
