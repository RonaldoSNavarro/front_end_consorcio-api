## 2026-07-01T22:45:38Z
You are a teamwork_preview_worker.
Your working directory is f:\Dev\Projetos\front_end_consorcio-api\.agents\worker_vendas_refactor.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Please perform the following refactoring and fixing tasks:

1. Modify f:\Dev\Projetos\consorcio-api\src\main\java\br\com\estudo\consorcio\domain\service\PropostaAdesaoService.java:
   - Change the compliance block exception message to: "Venda bloqueada por PLD/FT: Cliente possui alertas restritivos." so that the message contains the text "bloqueada por PLD/FT", which is expected by the Playwright E2E test /bloqueada por PLD\\/FT/i.

2. Create a new custom hook file f:\Dev\Projetos\front_end_consorcio-api\src\hooks\useVendaProposta.js:
   - Move all the business logic, state variables, TanStack useQuery calls, calculations, and the proposal execution sequence from VendaPropostaPage.jsx into this hook.
   - Declare a useMutation hook (TanStack Query) to wrap the sequential creation -> approval -> efetivação of the proposal/contract.
   - On mutation success, invalidate the relevant queries: ['cotas'], ['clientes'], and ['grupos'].
   - The hook should also expose the client search state (clienteSearch, setClienteSearch, debouncedSearch).
   - Integrate react-hook-form + zod to validate the credit amount input (valorCredito) on Step 1. The validation must ensure the credit is a positive number and at least R$ 1,000.00. Prevent negative inputs by checking bounds at the schema level.

3. Refactor f:\Dev\Projetos\front_end_consorcio-api\src\pages\VendaPropostaPage.jsx:
   - Import and use the custom hook useVendaProposta from ../hooks/useVendaProposta.
   - Clean up all inline state, queries, and direct handlers from the component body.
   - Integrate react-hook-form inputs with the validation schema (bind the numeric credit input to Hook Form so errors are tracked and displayed).
   - Render the presentation structure (Step 0 to 3) exactly as before, displaying the validation errors if the user enters a negative or invalid value.
   - Make sure all selectors required by E2E tests (headers like "Selecionar Consorciado", "Valor do Crédito", "Tipo de Venda", "Confirmar Proposta", search input, button texts like "Avançar", "Efetivar Proposta", and .max-h-72 button) are preserved and map correctly.

4. Verify that:
   - Backend tests pass (.\mvnw clean test).
   - Frontend unit tests pass (npm run test:run).
   - Frontend lint passes (npm run lint).
   - Frontend E2E tests e2e/vendas.spec.js and e2e/compliance.spec.js both pass successfully when run (npx playwright test).

5. Write a detailed handoff report in f:\Dev\Projetos\front_end_consorcio-api\.agents\worker_vendas_refactor\handoff.md summarizing changes, terminal outputs for build and tests, and send a message back.
