# Handoff Report — worker_vendas_spec

## 1. Observation
We observed the following regarding the sales capablity specifications and tests:
- **UI Spec Mismatch**: In `f:\Dev\Projetos\front_end_consorcio-api\docs\specs\vendas\ui-spec.md` (lines 9-18), the previous specification defined steps for the wizard as:
  ```markdown
  - **Step 1: Cliente**: Input de busca + Lista renderizada com cartões minimalistas de clientes.
  - **Step 2: Grupo**: Lista de grupos elegíveis (Status `EM_CAPTACAO` ou `EM_ANDAMENTO`).
  - **Step 3: Detalhes**: Select para Tipo de Venda. Checkbox / Toggle para "Contratar Seguro Prestamista".
  - **Step 4: Resumo**: Card de revisão apresentando Nome do Cliente...
  ```
- **E2E Test Steps**: In `f:\Dev\Projetos\front_end_consorcio-api\e2e\vendas.spec.js` (lines 15-49) and `compliance.spec.js` (lines 19-39), the actual test steps expect:
  - Step 0 (Cliente selection):
    - `page.locator('h3', { hasText: 'Selecionar Consorciado' })`
    - `input[type="search"]`
    - Client card button `.max-h-72 button`
  - Step 1 (Valor do Crédito & Simulação & Seleção de Grupo/Cota):
    - `page.locator('h3', { hasText: 'Valor do Crédito' })`
    - `input[type="number"]`
    - Button `button:has-text("Avançar")`
  - Step 2 (Tipo de Venda & Detalhes):
    - `page.locator('h3', { hasText: 'Tipo de Venda' })`
    - Card button `button` filter `{ hasText: 'Comissão:' }`
  - Step 3 (Confirmar Proposta & Geração Visual do Contrato & Aceite):
    - `page.locator('h3', { hasText: 'Confirmar Proposta' })`
    - Button `button:has-text("Efetivar Proposta")`
    - Toast notifications: `"Venda efetivada!"` or `/bloqueada por PLD\\/FT/i`
- **Backend Validation**: In `consorcio-api/src/main/java/br/com/estudo/consorcio/domain/service/PropostaAdesaoService.java` (lines 61-63), the backend only validates if a client is active. The compliance check (for restrictive list) is located in `CotaService.java` (lines 133-137), leading to inconsistencies and flakiness if compliance checks are bypassed during proposal creation.

## 2. Logic Chain
1. The previous specification in `ui-spec.md` described different steps (Client, Group, Details, Summary) compared to the selectors searched by Playwright E2E tests (`Selecionar Consorciado`, `Valor do Crédito`, `Tipo de Venda`, `Confirmar Proposta`).
2. Playwright tests would timeout (hang) on Steps 1 and 3 because inputs like `input[type="number"]`, button `"Avançar"`, and button `"Efetivar Proposta"` did not align with the old UI specification and placeholder layout.
3. Therefore, updating `ui-spec.md` to define a 4-step wizard matching E2E selectors and user requirements establishes the correct design blueprint.
4. Defining tasks in `tasks.md` maps out the frontend implementation of these steps, E2E test alignment, and backend compliance checks to prevent the timeout flakiness in the negative scenario (such as seeding/mocking lists and blocking at proposal/contract execution).

## 3. Caveats
- No React or Java code was modified in this task, only the specification files under `docs/specs/vendas/` were updated as requested.
- Integration tests assume that the backend will block restricted clients with a 400/422 status, yielding the expected toast error `"bloqueada por PLD/FT"`.

## 4. Conclusion
We successfully updated:
1. `f:\Dev\Projetos\front_end_consorcio-api\docs\specs\vendas\ui-spec.md` to define the 4-step wizard matching the E2E tests and user requirements.
2. `f:\Dev\Projetos\front_end_consorcio-api\docs\specs\vendas\tasks.md` to establish concrete implementation, test alignment, and backend resolution tasks.

## 5. Verification Method
1. Inspect the content of `f:\Dev\Projetos\front_end_consorcio-api\docs\specs\vendas\ui-spec.md` to ensure it details the 4 steps (Passo 0 to Passo 3) and matches the elements (`input[type="search"]`, `input[type="number"]`, `button:has-text("Avançar")`, buttons containing `"Comissão:"`, `button:has-text("Efetivar Proposta")`, and success/error toasts).
2. Inspect `f:\Dev\Projetos\front_end_consorcio-api\docs\specs\vendas\tasks.md` to confirm the tasks cover frontend layout implementation, backend compliance list check issues, and Playwright test alignment.
