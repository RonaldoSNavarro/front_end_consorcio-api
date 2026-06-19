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
- [x] Criar hook `useReajustarGrupo()` (TanStack useMutation para `PUT /api/grupos/{id}/reajuste`)
- [x] Criar schema Zod `reajusteSchema` (novoValorCredito: positivo, obrigatório)
- [x] Implementar dialog de reajuste com campo de novo valor
- [x] Implementar invalidação de cache de grupos e parcelas pós-reajuste

### [FRONTEND] REQ-ENC-002: Encerramento de Grupo
- [x] Criar página `EncerrarGrupoPage.jsx`
- [x] Criar hook `useEncerrarGrupo()` (TanStack useMutation para `POST /api/grupos/{id}/encerrar`)
- [x] Criar hook `useFinanceiroGrupo(grupoId)` (TanStack useQuery para `GET /api/grupos/{id}/financeiro`)
- [x] Implementar ConfirmDialog com alerta irreversível
- [x] Implementar relatório de encerramento (parcelas baixadas, PDD, RNP)
- [x] Implementar proteção RBAC (apenas ADMIN) via ProtectedRoute

### [FRONTEND] REQ-ENC-003: Exibição de RNP
- [x] Implementar linha de RNP no relatório de encerramento
- [x] Formatar valores monetários no padrão BRL (R$ X.XXX,XX)

### [DESIGN] REQ-ENC-002: Design da Tela de Encerramento
- [x] Prototipar tela com resumo financeiro, dialog de confirmação e relatório
- [x] Definir layout do relatório de encerramento (cards com ícones)
- [x] Validar acessibilidade WCAG AA
