## 2026-07-02T01:26:28Z

You are a teamwork_preview_worker acting as the Analista de Sistemas.
Your working directory is f:\Dev\Projetos\front_end_consorcio-api\.agents\worker_vendas_spec.
Your task is to update the specifications for the Sales, Quota Reservation, and Contracts module:
1. Update `f:\Dev\Projetos\front_end_consorcio-api\docs\specs\vendas\ui-spec.md` to define a 4-step wizard for `VendaPropostaPage.jsx` that exactly aligns with the E2E tests (`compliance.spec.js` and `vendas.spec.js`) and the new user requirements. Specifically, specify:
   - **Step 0: Selecionar Consorciado**: search (`input[type="search"]`) + cards to click.
   - **Step 1: Valor do Crédito & Simulação & Seleção de Grupo/Cota**: title `h3` contains "Valor do Crédito", credit input `input[type="number"]`, simulation details, group list with health indicators (arrecadação %, remaining term), specific vacant quota selector (1 to 100), and an "Avançar" button.
   - **Step 2: Tipo de Venda & Detalhes**: title `h3` contains "Tipo de Venda", type buttons displaying "Comissão:" to advance.
   - **Step 3: Confirmar Proposta & Geração Visual do Contrato & Aceite**: title `h3` contains "Confirmar Proposta", visual contract card displaying credit, term, composition (Fundo Comum, Taxa Adm, Fundo Reserva, Seguro), and button "Efetivar Proposta" that yields a toast "Venda efetivada!" or compliance block toast.
2. Update `f:\Dev\Projetos\front_end_consorcio-api\docs\specs\vendas\tasks.md` to define tasks for implementing this layout, aligning E2E tests, and resolving backend compliance check issues.
3. When done, write your report to `f:\Dev\Projetos\front_end_consorcio-api\.agents\worker_vendas_spec\handoff.md` and send a message back. Do not write or modify any React/Java code files in this task, only the specification files in `docs/specs/vendas/`.
