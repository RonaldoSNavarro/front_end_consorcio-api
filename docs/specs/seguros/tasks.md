# 📋 Decomposição de Tarefas Frontend — Seguros (seguros)

*   **Capability**: seguros
*   **UI Spec de referência**: [ui-spec.md](ui-spec.md)
*   **API Contract Backend**: [api-contract.md](../../../../consorcio-api/docs/specs/seguros/api-contract.md)
*   **Total de tarefas**: 3
*   **REQ-IDs cobertos**: 2/2

---

## Legenda

- `[ ]` — Pendente
- `[/]` — Em progresso
- `[x]` — Concluída

---

## Tarefas

### [FRONTEND] REQ-SEG-001: Campo de Seguro na Parcela
- [x] Incluir campo `valorSeguro` no formulário de criação de parcela
- [x] Incluir coluna "Seguro" na tabela de parcelas
- [ ] Incluir validação Zod `valorSeguro: z.number().min(0)` no `parcelaSchema`

### [FRONTEND] REQ-SEG-002: Transparência do Repasse Contábil
- [ ] Exibir na coluna de seguro o valor que será repassado contabilmente (informativo)

### [DESIGN] REQ-SEG-001: Design do Campo de Seguro
- [x] Campo integrado ao formulário de parcela existente
- [ ] Validar alinhamento visual com os demais campos financeiros
