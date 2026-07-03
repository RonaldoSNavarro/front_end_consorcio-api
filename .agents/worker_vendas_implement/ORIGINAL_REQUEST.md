## 2026-07-02T01:30:04Z
You are a teamwork_preview_worker.
Your working directory is f:\Dev\Projetos\front_end_consorcio-api\.agents\worker_vendas_implement.
Your task is to implement the Sales, Quota Reservation, and Contracts module in the frontend and backend.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Please perform the following implementation tasks:

1. Create a migration file f:\Dev\Projetos\consorcio-api\src\main\resources\db\migration\V47__inserir_alertas_compliance_osama.sql with SQL that inserts a listas_restritivas entry (id 100, origin 'OFAC') and alerts in alertas_compliance for both OSAMA BIN LADEN client records (from V32 and V34 scripts) to ensure they are blocked by compliance during E2E testing:
   - Use SELECT and WHERE NOT EXISTS statements to make the script safe for both H2 and PostgreSQL.

2. Modify f:\Dev\Projetos\consorcio-api\src\main\java\br\com\estudo\consorcio\domain\service\PropostaAdesaoService.java:
   - Inject br.com.estudo.consorcio.domain.repository.AlertaComplianceRepository.
   - In criarProposta, check if the client has any pending or confirmed compliance alerts (existsByClienteIdAndStatusIn).
   - If true, throw new RegraDeNegocioException("Operação bloqueada pelo Compliance. Cliente possui alertas restritivos (PLD/FT).").

3. Refactor f:\Dev\Projetos\front_end_consorcio-api\src\pages\VendaPropostaPage.jsx to implement a 4-step wizard that aligns with the user requirements and E2E tests:
   - Stepper Steps: ['Cliente', 'Simulação e Grupo', 'Canal de Venda', 'Confirmação'] (Passos 0, 1, 2, 3).
   - Step 0 (Select Cliente):
     - Title h3 must contain "Selecionar Consorciado".
     - Search input has type="search".
     - Active client cards rendered inside a container with class ".max-h-72".
     - Each card contains a button that, when clicked, saves the client and automatically advances to Step 1. Ensure selection doesn't cause page focus loss or DOM reference issues.
   - Step 1 (Valor do Crédito & Simulação & Grupo/Cota):
     - Title h3 must contain "Valor do Crédito".
     - Numeric input has type="number" to specify the credit value.
     - Simulates installment breakdown based on the credit amount: Fundo Comum (credit/term), Taxa Adm (Fundo Comum * taxa/100), Fundo Reserva (Fundo Comum * reserves/100, default 2%), Seguro Prestamista (Fundo Comum * 1% if checked), and Total.
     - Displays list of groups (EM_FORMACAO or EM_ANDAMENTO) fetched from api.grupos.listar().
     - For each group, show health indicators: % collected (arrecadado) and remaining term.
     - Fetch group's cotas using api.cotas.listarPorGrupo(grupoId) and list vacant quotas from 1 to 100 (numbers not present in the group's cotas). Let the broker select a quota number.
     - Displays button with text containing "Avançar" to proceed to Step 2.
   - Step 2 (Tipo de Venda & Detalhes):
     - Title h3 must contain "Tipo de Venda".
     - Displays active sales channels.
     - Select buttons displaying "Comissão:" (e.g., "Comissão: 5%"). Clicking a button saves the channel and automatically advances to Step 3.
     - Checkbox/Toggle for insurance prestamista.
   - Step 3 (Confirmar Proposta & Geração Visual do Contrato & Aceite):
     - Title h3 must contain "Confirmar Proposta".
     - Visual contract card showing structured details: Customer, Group, Quota, Credit, Term, and the monthly installment composition (Fundo Comum, Taxa Adm, Fundo Reserva, Seguro).
     - Submit button with text "Efetivar Proposta".
     - Clicking "Efetivar Proposta" runs the mutation chain: proposal creation -> approval -> contract efetivação sequentially. If successful, display Toast notification "Venda efetivada!" and navigate to "/cotas". If any step fails, catch and display the error toast (expected "bloqueada por PLD/FT" for restricted clients).

4. Verify your changes compile and run build/test steps as required. Document commands and results in your handoff report f:\Dev\Projetos\front_end_consorcio-api\.agents\worker_vendas_implement\handoff.md. Send a completion message back.
