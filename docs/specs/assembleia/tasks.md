# 📋 Decomposição de Tarefas Frontend — Gestão de Assembleias (assembleia)

*   **Capability**: assembleia
*   **UI Spec de referência**: [ui-spec.md](ui-spec.md)
*   **API Contract Backend**: [api-contract.md](../../../../consorcio-api/docs/specs/assembleia/api-contract.md)
*   **Total de tarefas**: 8
*   **REQ-IDs cobertos**: 2/2

---

## Legenda

- `[ ]` — Pendente
- `[/]` — Em progresso
- `[x]` — Concluída

---

## Tarefas

### [FRONTEND] REQ-ASM-001: Agendamento e Histórico de Assembleias
- [x] Criar página `AssembleiasPage.jsx` com seletor de grupo e tabela de histórico
- [x] Criar hook `useAssembleias(grupoId)` (TanStack useQuery para `GET /api/assembleias/grupo/{grupoId}`)
- [x] Criar hook `useCriarAssembleia()` (TanStack useMutation para `POST /api/assembleias`)
- [x] Criar schema Zod `assembleiaSchema` (data obrigatória, grupoId obrigatório)
- [x] Implementar invalidação de cache pós-agendamento
- [x] Implementar estados: loading (skeleton), error (toast), empty state

### [FRONTEND] REQ-ASM-002: Validação de Duplicatas de Captação
- [x] Implementar feedback visual de erro 400 quando grupo já possui assembleia CAPTANDO
- [x] Exibir badge visual de status por assembleia (CAPTANDO, REALIZADA, FECHADA)

### [DESIGN] REQ-ASM-001: Design da Tela de Assembleias
- [x] Prototipar tela com seletor de grupo, formulário e tabela de histórico
- [x] Definir estados visuais: loading, error, empty state, success (confetti)
- [x] Validar acessibilidade WCAG AA

### [TESTE E2E] Estabilidade e Dados (Pendência)
- [ ] Estabilizar teste Playwright `Deve impedir o processo de Apurar Assembleia se a Captação não estiver fechada`: Garantir a criação ou mock de uma Assembleia `AGENDADA` no banco de teste para que a UI consiga selecionar corretamente e o timeout de locator não dispare.
