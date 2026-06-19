# 📋 Decomposição de Tarefas Frontend — Relatório PLD/FT (pld-ft)

*   **Capability**: pld-ft
*   **UI Spec de referência**: [ui-spec.md](ui-spec.md)
*   **API Contract Backend**: Pendente
*   **Total de tarefas**: 7
*   **REQ-IDs cobertos**: 2

---

## Legenda

- `[ ]` — Pendente
- `[/]` — Em progresso
- `[x]` — Concluída

---

## Tarefas

### [FRONTEND] REQ-PLDFT-001: Listagem e Filtros
- [ ] Criar página base `RelatorioPldFtPage.jsx` com layout de Dashboard
- [ ] Criar schema Zod `pldFtFiltroSchema` (dataInicio, dataFim, valorMinimo)
- [ ] Implementar form de filtros com React Hook Form integrado ao schema
- [ ] Aguardar contrato de API do backend para implementar `usePldFtRelatorio` (TanStack useQuery)
- [ ] Renderizar tabela de resultados com empty state e loading states

### [FRONTEND] REQ-PLDFT-002: Auditoria de Operações
- [ ] Aguardar contrato de API do backend para implementar `useAuditarOperacao` (TanStack useMutation)
- [ ] Implementar botão de ação "Auditar" em cada linha da tabela com dialog de confirmação

### [DESIGN] REQ-PLDFT-001: Protótipo de PLD/FT
- [ ] Prototipar interface da tabela de auditoria focada em dados massivos
- [ ] Definir padrão visual de alertas (badges de severidade Alta/Média/Baixa)
- [ ] Validar acessibilidade e contraste das cores de severidade
