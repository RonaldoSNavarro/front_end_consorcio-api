# 📋 Decomposição de Tarefas Frontend — Apuração e Contemplações (contemplacao)

*   **Capability**: contemplacao
*   **UI Spec de referência**: [ui-spec.md](ui-spec.md)
*   **API Contract Backend**: [api-contract.md](../../../../consorcio-api/docs/specs/contemplacao/api-contract.md)
*   **Total de tarefas**: 9
*   **REQ-IDs cobertos**: 6/6

---

## Legenda

- `[ ]` — Pendente
- `[/]` — Em progresso
- `[x]` — Concluída

---

## Tarefas

### [FRONTEND] REQ-CON-001: Resultado da Apuração
- [x] Integrar seção de resultado na `AssembleiasPage.jsx`
- [x] Criar hook `useContemplações(assembleiaId)` (TanStack useQuery)
- [x] Implementar tabela de resultado com colunas: Cota, Tipo, Valor Lance, Crédito, Status
- [x] Integrar efeito Confetti para vencedor

### [FRONTEND] REQ-CON-002: Feedback de Saldo Insuficiente
- [x] Implementar exibição de alert vermelho quando apuração retorna 422 (saldo insuficiente)

### [FRONTEND] REQ-CON-003: Fluxo de Integralização
- [x] Criar seção de integralização na `LancesPendentesPage.jsx`
- [x] Criar hook `useIntegralizar()` (TanStack useMutation para `POST /api/contemplacoes/lances/{id}/integralizar`)
- [x] Implementar badges de status: PENDENTE_INTEGRALIZACAO (laranja), AGUARDANDO_ANALISE (amarelo), APROVADO (verde)
- [x] Implementar invalidação de cache pós-integralização

### [FRONTEND] REQ-CON-004: Pagamento do Bem
- [x] Criar hook `usePagamentoBem()` (TanStack useMutation para `POST /api/contemplacoes/{id}/pagamento-bem`)
- [x] Implementar botão e feedback visual de desembolso

### [FRONTEND] REQ-CON-005/006: Segregação Lance Fixo
- [x] Implementar agrupamento visual de lances por modalidade (LIVRE/FIXO)
- [x] Implementar badges distintos por tipo de contemplação (SORTEIO/LANCE_LIVRE/LANCE_FIXO)

### [DESIGN] REQ-CON-001: Design do Resultado da Apuração
- [x] Prototipar seção de resultado com confetti
- [x] Definir palette de badges por status de contemplação
- [x] Validar acessibilidade WCAG AA
