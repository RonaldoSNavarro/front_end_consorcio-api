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
- [x] Criar hook `useCriarLance()` (TanStack useMutation para `POST /api/lances`)
- [x] Criar schema Zod `lanceSchema` (cotaId, assembleiaId, tipo, modalidade, valorOferta)
- [x] Implementar feedback de erro de elegibilidade (400 — inadimplência, assembleia fechada)

### [FRONTEND] REQ-LAN-002: Validação de Lance Embutido
- [x] Implementar validação visual do teto de lance embutido (exibir limite do grupo)
- [x] Implementar feedback de erro 422 (limite excedido)

### [FRONTEND] REQ-LAN-004: Formulário de Lance Fixo
- [x] Implementar toggle de modalidade (LIVRE/FIXO) que altera comportamento do campo valor
- [x] Auto-preencher valor com `percentualLanceFixo × valorCredito` quando FIXO
- [x] Desabilitar campo valor (readonly) quando modalidade é FIXO

### [FRONTEND] REQ-LAN-003: Motor de Amortização
- [x] Criar página `LancesPendentesPage.jsx`
- [x] Criar hook `useAmortizarReducaoPrazo()` (TanStack useMutation)
- [x] Criar hook `useAmortizarDiluicao()` (TanStack useMutation)
- [x] Implementar seletor de tipo de amortização (Redução de Prazo / Diluição)
- [x] Implementar invalidação de cache de parcelas pós-amortização

### [DESIGN] REQ-LAN-004: Design do Formulário de Lance Fixo
- [x] Prototipar comportamento visual do toggle LIVRE/FIXO
- [x] Definir estados: campo editável (LIVRE) vs. readonly com valor calculado (FIXO)
- [x] Validar acessibilidade WCAG AA
