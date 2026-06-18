# 📋 Decomposição de Tarefas Frontend — Reajustes e Encerramento (encerramento)

*   **Capability**: encerramento
*   **UI Spec de referência**: [ui-spec.md](ui-spec.md)
*   **API Contract Backend**: [api-contract.md](../../../../consorcio-api/docs/specs/encerramento/api-contract.md)
*   **Total de tarefas**: 9
*   **REQ-IDs cobertos**: 3/3

---

## Legenda

- `[ ]` — Pendente
- `[/]` — Em progresso
- `[x]` — Concluída

---

## Tarefas

### [FRONTEND] REQ-ENC-001: Reajuste do Valor do Crédito
- [x] Integrar botão "Reajustar" na `GruposPage.jsx`
- [ ] Criar hook `useReajustarGrupo()` (TanStack useMutation para `PUT /api/grupos/{id}/reajuste`)
- [ ] Criar schema Zod `reajusteSchema` (novoValorCredito: positivo, obrigatório)
- [ ] Implementar dialog de reajuste com campo de novo valor
- [ ] Implementar invalidação de cache de grupos e parcelas pós-reajuste

### [FRONTEND] REQ-ENC-002: Encerramento de Grupo
- [x] Criar página `EncerrarGrupoPage.jsx`
- [ ] Criar hook `useEncerrarGrupo()` (TanStack useMutation para `POST /api/grupos/{id}/encerrar`)
- [ ] Criar hook `useFinanceiroGrupo(grupoId)` (TanStack useQuery para `GET /api/grupos/{id}/financeiro`)
- [ ] Implementar ConfirmDialog com alerta irreversível
- [ ] Implementar relatório de encerramento (parcelas baixadas, PDD, RNP)
- [ ] Implementar proteção RBAC (apenas ADMIN) via ProtectedRoute

### [FRONTEND] REQ-ENC-003: Exibição de RNP
- [ ] Implementar linha de RNP no relatório de encerramento
- [ ] Formatar valores monetários no padrão BRL (R$ X.XXX,XX)

### [DESIGN] REQ-ENC-002: Design da Tela de Encerramento
- [x] Prototipar tela com resumo financeiro, dialog de confirmação e relatório
- [ ] Definir layout do relatório de encerramento (cards com ícones)
- [ ] Validar acessibilidade WCAG AA
