# Handoff Report — sales_and_compliance_investigation

## 1. Observation
We observed the following in the frontend and backend codebases:
1. **Frontend Page Layout Mismatch in Stepper Steps:**
   - In `front_end_consorcio-api/src/pages/VendaPropostaPage.jsx` (Step 1, lines 154-184):
     ```javascript
     {/* PASSO 1 — Produto do Consórcio */}
     {step === 1 && (
       <div className="glass-panel p-6 space-y-4">
         <div className="flex items-center gap-2 mb-4">
           <Package className="w-5 h-5 text-brand-500" />
           <h3 className="font-title font-bold text-slate-900 dark:text-white">Selecione o Produto (Plano)</h3>
         </div>
         ...
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           {isLoadingProdutos ? (
              ...
           ) : (
             (produtos || []).map(p => (
               <button key={p.id} onClick={() => { setSelectedProduto(p); setStep(2); }}
                  className={`w-full text-left p-4 ...`}>
                  ...
     ```
     There is no `input[type="number"]` to specify the credit value, nor is there an "Avançar" button. Users click directly on a product card, which automatically sets the product and advances the stepper to step 2.
   
   - In `front_end_consorcio-api/src/pages/VendaPropostaPage.jsx` (Step 3, lines 265-276):
     ```javascript
     <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-700/50">
       <button className="btn btn-outline" onClick={() => setStep(2)} ...>&larr; Voltar</button>
       <button className="btn btn-primary flex-1" onClick={() => criarPropostaMutation.mutate()} ...>
         {criarPropostaMutation.isPending ? (
           <><Loader2 className="w-4 h-4 animate-spin" /> Gerando Proposta...</>
         ) : (
           <><CheckCircle className="w-4 h-4" /> Gerar Proposta de Adesão</>
         )}
       </button>
     </div>
     ```
     The button text is `"Gerar Proposta de Adesão"`. There is no button containing the text `"Efetivar Proposta"`.

2. **E2E Test Locator Queries:**
   - In `front_end_consorcio-api/e2e/compliance.spec.js` (lines 26-35):
     ```javascript
     // 4. Passo 1: Informar valor do crédito
     const valorInput = page.locator('input[type="number"]');
     await valorInput.fill('50000');
     await page.getByRole('button', { name: /Avançar/i }).click();

     // 5. Passo 2: Selecionar um Tipo de Venda (Canal)
     await page.locator('.glass-panel button').filter({ hasText: /Comissão/i }).first().click();

     // 6. Passo 3: Efetivar Proposta
     await page.getByRole('button', { name: /Efetivar Proposta/i }).click();
     ```
     The test searches for `input[type="number"]` and `button:has-text("Avançar")` on Step 1, and `button:has-text("Efetivar Proposta")` on Step 3.

3. **Backend Service Validation Logic:**
   - In `consorcio-api/src/main/java/br/com/estudo/consorcio/domain/service/PropostaAdesaoService.java` (lines 40-66), `criarProposta` only validates if the customer is active:
     ```java
     if (cliente.getStatus() != StatusCliente.ATIVO) {
         throw new RegraDeNegocioException("RN-VND-001: Cliente inativo não pode gerar nova proposta.");
     }
     ```
     It does not query the `AlertaComplianceRepository` nor perform compliance/restrictive list checks.
   
   - In `consorcio-api/src/main/java/br/com/estudo/consorcio/domain/service/CotaService.java` (lines 133-137), compliance is enforced during cota registration:
     ```java
     // Bloqueio PLD/FT: Verifica se cliente está em listas restritivas (OFAC/ONU/PEP)
     boolean hasAlertaRestritivo = alertaComplianceRepository.existsByClienteIdAndStatusIn(
             cliente.getId(), List.of(StatusAlertaCompliance.PENDENTE_ANALISE, StatusAlertaCompliance.CONFIRMADO));
     if (hasAlertaRestritivo) {
         throw new RegraDeNegocioException("Operação bloqueada pelo Compliance. Cliente possui alertas restritivos (PLD/FT).");
     }
     ```
     This is the only place in the backend codebase enforcing the restrictive list check.
   
   - In `consorcio-api/src/main/java/br/com/estudo/consorcio/service/ComplianceSincronizacaoService.java`, the synchronization method `sincronizarListas()` is annotated with `@Async`. The E2E tests do not trigger this endpoint (`POST /api/compliance/sincronizar`) during test setups, nor do they seed the `alertas_compliance` table.

---

## 2. Logic Chain
1. **Locator Hangs (Timeout):** When Playwright runs `e2e/compliance.spec.js`, it successfully selects "OSAMA BIN LADEN" (who is seeded as an active client via `V34__inserir_osama.sql`) and advances the page to Step 1.
2. At Step 1 ("Selecione o Produto (Plano)"), Playwright attempts to locate `input[type="number"]` and click `/Avançar/i`. Because these elements do not exist in the actual layout of `VendaPropostaPage.jsx` (which lists product cards and advances automatically when one is clicked), Playwright waits indefinitely for them to appear, causing the **timeout flakiness/errors**.
3. **Selector Mismatch on Submission:** Even if those step 1 interactions were bypassed, Playwright would wait indefinitely on Step 3 for a button named `"Efetivar Proposta"`. Since the button is actually named `"Gerar Proposta de Adesão"`, the test would timeout again.
4. **No Compliance Block on Proposal Creation:** Even if the correct button `"Gerar Proposta de Adesão"` was clicked, the backend `PropostaAdesaoService.criarProposta` does not check compliance alerts. The proposal would be created successfully, yielding a `201 Created` response.
5. **Toast Mismatch:** A success toast saying `"Proposta #X gerada! Status: EM_ANALISE."` would be shown instead of the expected compliance block toast `"Operação bloqueada pelo Compliance... (PLD/FT)"`.
6. **No Alerts Seeded:** Furthermore, the `alertas_compliance` table starts empty and is never populated during E2E setups (since the `/api/compliance/sincronizar` endpoint is `@Async` and never triggered by the E2E tests).

---

## 3. Caveats
- No code modifications were implemented in either the frontend or backend as this is a read-only investigation.
- It is assumed that compliance checks should be performed during proposal creation/approval in the backend, but currently it is only present in `CotaService.salvar`.

---

## 4. Conclusion
The E2E test `"Deve impedir venda para cliente bloqueado em lista restritiva (OFAC/ONU)"` times out and fails because:
1. **Interactive Elements Do Not Match UI:** The E2E test searches for an input (`input[type="number"]`) and button names (`Avançar`, `Efetivar Proposta`) that are completely absent from `VendaPropostaPage.jsx`.
2. **Backend Compliance Bypass:** The backend proposal creation endpoint (`POST /api/vendas/propostas`) does not check compliance/restrictive list alerts, which are only checked inside `CotaService.salvar` (which is never called during the sales proposal workflow because group allocation and cota creation is currently a TODO in `efetivarContrato`).
3. **Lack of Compliance Synchronization/Mocks in E2E:** E2E tests do not trigger compliance synchronization nor seed compliance alerts, leaving the `alertas_compliance` table empty.

---

## 5. Verification Method
1. Run the command `npx playwright test e2e/compliance.spec.js` inside the `front_end_consorcio-api` directory.
2. Inspect the Playwright test failure trace. You will observe that it hangs/times out trying to locate `input[type="number"]` at step 1 or `/Efetivar Proposta/i` at step 3.
3. Compare the locator queries in `e2e/compliance.spec.js` (lines 26-35) with the actual DOM structure of `src/pages/VendaPropostaPage.jsx`.
4. Inspect `PropostaAdesaoService.java` to confirm that the `criarProposta` method does not invoke `AlertaComplianceRepository` or any validation aspect.
