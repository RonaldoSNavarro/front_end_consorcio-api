# 📋 Decomposição de Tarefas Frontend — Relatórios (relatorios)

*   **Capability**: relatorios
*   **UI Spec de referência**: [ui-spec.md](ui-spec.md)
*   **API Contract Backend**: [api-contract.md](../../../../consorcio-api/docs/specs/relatorios/api-contract.md)
*   **Total de tarefas**: 10
*   **REQ-IDs cobertos**: Múltiplos

---

## Legenda

- `[ ]` — Pendente
- `[/]` — Em progresso
- `[x]` — Concluída

---

## Tarefas

### [FRONTEND] REQ-REL-001: Mocks e Hook Query
- [ ] Implementar `getPldFt`, `getBalancete`, `getEstatisticas` no `mockDb.js`
- [ ] Mapear as chamadas simuladas em `api.js` (obj `api.relatorios`)
- [ ] Criar arquivo `src/schemas/relatoriosSchema.js` com os schemas Zod
- [ ] Criar o hook unificado `src/hooks/useRelatorios.js` com TanStack Query

### [FRONTEND] REQ-REL-002: Integração Relatório PLD/FT
- [ ] Conectar `RelatorioPldFtPage.jsx` ao `usePldFtQuery`
- [ ] Refatorar form de filtros para usar `useForm` e `pldFtFiltroSchema`
- [ ] Renderizar resultados com dados provenientes da query (ou mock)

### [FRONTEND] REQ-REL-003: Integração Balancete
- [ ] Conectar `RelatorioBalancetePage.jsx` ao `useBalanceteQuery`
- [ ] Refatorar form de filtros para usar `useForm` e `balanceteFiltroSchema`

### [FRONTEND] REQ-REL-004: Integração Estatísticas
- [ ] Conectar `RelatorioEstatisticasPage.jsx` ao `useEstatisticasQuery`
- [ ] Refatorar form de filtros para usar `useForm` e `estatisticasFiltroSchema`
