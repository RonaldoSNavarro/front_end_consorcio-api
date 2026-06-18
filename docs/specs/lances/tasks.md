# 📋 Decomposição de Tarefas Frontend — Oferta de Lances (lances)

*   **Capability**: lances
*   **UI Spec de referência**: [ui-spec.md](ui-spec.md)
*   **API Contract Backend**: [api-contract.md](../../../../consorcio-api/docs/specs/lances/api-contract.md)
*   **Total de tarefas**: 10
*   **REQ-IDs cobertos**: 4/4

---

## Legenda

- `[ ]` — Pendente
- `[/]` — Em progresso
- `[x]` — Concluída

---

## Tarefas

### [FRONTEND] REQ-LAN-001: Elegibilidade e Cadastro de Lance
- [x] Integrar formulário de lance na `AssembleiasPage.jsx`
- [ ] Criar hook `useCriarLance()` (TanStack useMutation para `POST /api/lances`)
- [ ] Criar schema Zod `lanceSchema` (cotaId, assembleiaId, tipo, modalidade, valorOferta)
- [ ] Implementar feedback de erro de elegibilidade (400 — inadimplência, assembleia fechada)

### [FRONTEND] REQ-LAN-002: Validação de Lance Embutido
- [ ] Implementar validação visual do teto de lance embutido (exibir limite do grupo)
- [ ] Implementar feedback de erro 422 (limite excedido)

### [FRONTEND] REQ-LAN-004: Formulário de Lance Fixo
- [ ] Implementar toggle de modalidade (LIVRE/FIXO) que altera comportamento do campo valor
- [ ] Auto-preencher valor com `percentualLanceFixo × valorCredito` quando FIXO
- [ ] Desabilitar campo valor (readonly) quando modalidade é FIXO

### [FRONTEND] REQ-LAN-003: Motor de Amortização
- [x] Criar página `LancesPendentesPage.jsx`
- [ ] Criar hook `useAmortizarReducaoPrazo()` (TanStack useMutation)
- [ ] Criar hook `useAmortizarDiluicao()` (TanStack useMutation)
- [ ] Implementar seletor de tipo de amortização (Redução de Prazo / Diluição)
- [ ] Implementar invalidação de cache de parcelas pós-amortização

### [DESIGN] REQ-LAN-004: Design do Formulário de Lance Fixo
- [ ] Prototipar comportamento visual do toggle LIVRE/FIXO
- [ ] Definir estados: campo editável (LIVRE) vs. readonly com valor calculado (FIXO)
- [ ] Validar acessibilidade WCAG AA
