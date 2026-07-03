# Handoff Report — Review Vendas & Compliance

## 1. Observation

### Verbatim File Paths & Line Numbers Reviewed
1. **Frontend Page**: `f:\Dev\Projetos\front_end_consorcio-api\src\pages\VendaPropostaPage.jsx`
   - Lines 47-50: TanStack `useQuery` call for fetching clients list.
   - Lines 144-173: `handleEfetivarProposta` asynchronous execution sequence.
   - Lines 255-266: Credit value input definition.
2. **Backend Database Migration**: `f:\Dev\Projetos\consorcio-api\src\main\resources\db\migration\V47__inserir_alertas_compliance_osama.sql`
   - Lines 1-16: Seeding restricted list and compliance alerts.
3. **Backend Service Class**: `f:\Dev\Projetos\consorcio-api\src\main\java\br\com\estudo\consorcio\domain\service\PropostaAdesaoService.java`
   - Lines 52-58: Interception logic verifying active compliance alerts.

### Terminal Executions & Outputs

#### Frontend Production Build (`npm run build`)
```
> front_end_consorcio-api@0.0.0 build
> vite build

vite v5.4.21 building for production...
transforming...
✓ 2526 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                     1.87 kB │ gzip:   0.93 kB
dist/assets/index-C2hI1sXt.css     69.22 kB │ gzip:  10.27 kB
dist/assets/index-1kxWRQH5.js   1,012.49 kB │ gzip: 274.86 kB
✓ built in 31.97s
```

#### Sales E2E Tests (`npx playwright test e2e/vendas.spec.js`)
```
Running 1 test using 1 worker

  ✓  1 [chromium] › e2e\vendas.spec.js:12:3 › Fluxo de Venda Proposta › Deve completar o Wizard de Venda com sucesso (8.7s)

  1 passed (11.0s)
```

#### Compliance E2E Tests (`npx playwright test e2e/compliance.spec.js`)
```
Running 3 tests using 1 worker

[1/3] [chromium] › e2e\compliance.spec.js:14:3 › Compliance e Testes Negativos › Deve impedir venda para cliente bloqueado em lista restritiva (OFAC/ONU)
  1) [chromium] › e2e\compliance.spec.js:14:3 › Compliance e Testes Negativos › Deve impedir venda para cliente bloqueado em lista restritiva (OFAC/ONU) 

    Error: expect(locator).toBeVisible() failed

    Locator: locator('text=/bloqueada por PLD\\/FT/i')
    Expected: visible
    Timeout: 5000ms
    Error: element(s) not found

    Call log:
      - Expect "toBeVisible" with timeout 5000ms
      - waiting for locator('text=/bloqueada por PLD\\/FT/i')

      37 |     // 7. Espera-se o bloqueio por PLD/FT
      38 |     const toast = page.locator('text=/bloqueada por PLD\\/FT/i');
    > 39 |     await expect(toast).toBeVisible({ timeout: 5000 });
         |                         ^
      40 |   });

[2/3] [chromium] › e2e\compliance.spec.js:42:3 › Compliance e Testes Negativos › Deve bloquear lance de cota CANCELADA na Assembleia
[3/3] [chromium] › e2e\compliance.spec.js:61:3 › Compliance e Testes Negativos › Deve impedir o processo de Apurar Assembleia se a Captação não estiver fechada
  1 failed
    [chromium] › e2e\compliance.spec.js:14:3 › Compliance e Testes Negativos › Deve impedir venda para cliente bloqueado em lista restritiva (OFAC/ONU) 
  2 passed (38.3s)
```

---

## 2. Logic Chain

1. **E2E Failure (Compliance)**: The Playwright test `Deve impedir venda para cliente bloqueado em lista restritiva (OFAC/ONU)` fails because the toast selector `text=/bloqueada por PLD\\/FT/i` times out.
2. **Text Mismatch**:
   - The backend service throws `RegraDeNegocioException("Operação bloqueada pelo Compliance. Cliente possui alertas restritivos (PLD/FT).")`.
   - The global exception handler converts this to an HTTP 400 with `mensagem: "Erro de negócio"` and `detalhes: "Operação bloqueada pelo Compliance. Cliente possui alertas restritivos (PLD/FT)."`.
   - The frontend API service (`api.js`) formats the error as `"Erro de negócio: Operação bloqueada pelo Compliance. Cliente possui alertas restritivos (PLD/FT)."`.
   - The E2E test expects the toast to match `/bloqueada por PLD\\/FT/i` (literal `bloqueada por PLD/FT`). Since the message contains "bloqueada pelo Compliance..." and does not contain the word "por", the regex match fails.
3. **ADR/Constitution Violation**: 
   - Rule 3 of `docs/constitution.md` states that React Hook Form + Zod schema validation is **mandatory** on client-side inputs (preventing negative values and validating formats). `VendaPropostaPage.jsx` completely skips React Hook Form and Zod schemas, managing inputs via raw `useState`.
   - Rule 5 of `docs/constitution.md` mandates that all page/business logic (fetching, calculation, mutating, side effects) reside in custom hooks, leaving components strictly to presentation. `VendaPropostaPage.jsx` has inline query calls, derived calculations, handlers, and side effects.
   - Rule 2 of `docs/constitution.md` mandates that critical financial mutations call `queryClient.invalidateQueries` immediately. `handleEfetivarProposta` triggers three consecutive API calls (proposal creation, approval, contract activation) but fails to invalidate any queries afterward (e.g. `['cotas']`, `['clientes']`).
4. **Adversarial Input Vulnerability**: Since there is no Zod validation schema on the client, entering a negative value like `-50000` in the "Valor do Crédito" field yields a simulation calculation showing negative installments and negative totals directly in the UI.

---

## 3. Caveats

- We did not verify the behavior of the database under actual concurrent high-load transactions since we tested in a single-user E2E context.
- We assumed the user profiles required for compliance/sales routes are predefined in the database seeds, which is the default in the test environment (`admin`/`admin`).

---

## 4. Conclusion

The backend compliance database seeding (`V47`) and transaction checks (`PropostaAdesaoService.java`) are implemented correctly. However, the E2E compliance test fails due to a toast message mismatch. Additionally, the frontend page implementation violates several React architecture standards (no Zod validation, no hooks/presentation separation, and no cache invalidation).

Therefore, the verdict is **REQUEST_CHANGES**.

---

## 5. Verification Method

To verify the test execution and code status:
1. Ensure the PostgreSQL database is online.
2. Start the backend Spring Boot server from `f:\Dev\Projetos\consorcio-api` via:
   ```powershell
   .\mvnw.cmd spring-boot:run
   ```
3. Run the Playwright test commands from `f:\Dev\Projetos\front_end_consorcio-api`:
   ```powershell
   npx playwright test e2e/vendas.spec.js
   npx playwright test e2e/compliance.spec.js
   ```
4. Verify files manually:
   - Check `VendaPropostaPage.jsx` to confirm the absence of `react-hook-form` and `zod` imports.

---

## Quality Review Report

**Verdict**: REQUEST_CHANGES

### Findings

#### [Critical] Finding 1 — Toast Mismatch Causing E2E Test Failure
- **What**: The E2E test `Deve impedir venda para cliente bloqueado em lista restritiva (OFAC/ONU)` fails because the expected regex `/bloqueada por PLD\\/FT/i` does not match the actual toast error.
- **Where**: `f:\Dev\Projetos\front_end_consorcio-api\e2e\compliance.spec.js`, line 38-39 and `src/pages/VendaPropostaPage.jsx`.
- **Why**: The backend error is `"Operação bloqueada pelo Compliance. Cliente possui alertas restritivos (PLD/FT)."`, which contains "bloqueada pelo" rather than "bloqueada por".
- **Suggestion**: Either update the test in `compliance.spec.js` to expect `/bloqueada.*PLD\\/FT/i` or update the backend exception message/frontend error mapping to return `"Venda bloqueada por PLD/FT"`.

#### [Critical] Finding 2 — Missing Client-Side Form Validation (Zod & React Hook Form)
- **Where**: `f:\Dev\Projetos\front_end_consorcio-api\src\pages\VendaPropostaPage.jsx`, lines 255-266.
- **Why**: Violates Rule 3 of `docs/constitution.md`. No client-side Zod validation schema is declared to prevent negative inputs, check bounds, or handle formats.
- **Suggestion**: Create a schema (e.g., `propostaSchema` using Zod) validating that `valorCreditoSolicitado` is positive and exceeds minimum threshold (e.g. `z.number().positive().min(...)`), and integrate it with `useForm` from `react-hook-form`.

#### [Major] Finding 3 — Separation of Presentation and Logic Violation
- **Where**: `f:\Dev\Projetos\front_end_consorcio-api\src\pages\VendaPropostaPage.jsx`.
- **Why**: Violates Rule 5 of `docs/constitution.md`. The page component contains state hook declarations, calculations, query definitions (`useQuery`), and transaction handlers directly in its body.
- **Suggestion**: Distill all fetching, state management, calculation of simulated installments, and proposal execution logic into a custom hook (e.g., `useVendaProposta` in `src/hooks/useVendaProposta.js`). The component should only accept hook properties and bind events/render elements.

#### [Major] Finding 4 — Missing TanStack Query Mutations and Cache Invalidation
- **Where**: `f:\Dev\Projetos\front_end_consorcio-api\src\pages\VendaPropostaPage.jsx`, `handleEfetivarProposta` (lines 144-173).
- **Why**: Violates Rule 2 of `docs/constitution.md`. Direct async-await calls are made to services without wrapping in a TanStack `useMutation` hook. Also, no query invalidation occurs upon successful execution, leaving the local client cache stale.
- **Suggestion**: Wrap the proposal generation chain in a `useMutation` hook. On success, call `queryClient.invalidateQueries({ queryKey: ['cotas'] })` and potentially other relevant cache keys.

---

## Adversarial Challenge Report

**Overall risk assessment**: MEDIUM

### Challenges

#### [High] Challenge 1 — Negative Value Simulation Injection
- **Assumption Challenged**: Users will always input positive numeric credit amounts.
- **Attack Scenario**: An operator enters a negative credit value (`-50000`) in the input box.
- **Blast Radius**: The system calculates negative installment rates (Fundo Comum, Taxa de Administração, Fundo de Reserva, and Total Monthly Installment). The UI renders these negative values (e.g., `R$ -590,00`). If submitted, it could either throw a backend error or corrupt database records if backend constraint checks are missing.
- **Mitigation**: Add schema level range validation on the client side (`zod` schema check `.positive()`) and a corresponding check in the backend entity model/service.

#### [Low] Challenge 2 — Race Condition on Compliance Status Changes
- **Assumption Challenged**: The client alert status will remain constant between client selection and proposal submittal.
- **Attack Scenario**: A client is selected (having no alerts). Before the operator clicks "Efetivar Proposta", a restricted list check runs and seeds a confirmed compliance alert for that client.
- **Blast Radius**: When the user clicks "Efetivar Proposta", the frontend sends the request. Fortunately, the backend service re-verifies `alertaComplianceRepository.existsByClienteIdAndStatusIn` during `criarProposta` transaction, so the transaction is correctly blocked with a 400 response. This acts as a robust defense, making the backend logic safe.
- **Mitigation**: None needed on the backend (as it handles it securely); frontend should handle the resulting error toast cleanly.
