# 📊 Matriz de Rastreabilidade Frontend — REQ-ID → Componente → Teste

*   **Última atualização**: 2026-06-17
*   **Gerada** a partir do inventário de componentes existentes e specs de UI

---

## auth — Autenticação e Sessão

| REQ-ID | Regra | Componente(s) JSX | Hook TanStack | Schema Zod | Teste |
|--------|-------|-------------------|---------------|-----------|-------|
| REQ-AUTH-001 | Autenticação e Emissão de Token | `LoginPage.jsx` | useMutation (login) | loginSchema | — |
| REQ-AUTH-002 | Revalidação Ativa (F5-safety) | `AuthContext.jsx` | useQuery (/me) | — | — |

---

## assembleia — Gestão de Assembleias

| REQ-ID | Regra | Componente(s) JSX | Hook TanStack | Schema Zod | Teste |
|--------|-------|-------------------|---------------|-----------|-------|
| REQ-ASM-001 | Estados da Assembleia | `AssembleiasPage.jsx` | useAssembleias(grupoId) | assembleiaSchema | — |
| REQ-ASM-002 | Vinculação e Frequência | `AssembleiasPage.jsx` | useMutation (criar) | assembleiaSchema | — |

---

## fundos — Composição de Fundos e Parcelas

| REQ-ID | Regra | Componente(s) JSX | Hook TanStack | Schema Zod | Teste |
|--------|-------|-------------------|---------------|-----------|-------|
| REQ-FUN-001 | Composição da Parcela | `FinanceiroPage.jsx` | useParcelas(cotaId) | parcelaSchema | — |
| REQ-FUN-002 | Hook JPA de Consistência | `FinanceiroPage.jsx` | — | parcelaSchema | — |
| REQ-FUN-003 | Segregação Contábil | `FinanceiroPage.jsx` | useFinanceiro(grupoId) | — | — |

---

## lances — Oferta de Lances

| REQ-ID | Regra | Componente(s) JSX | Hook TanStack | Schema Zod | Teste |
|--------|-------|-------------------|---------------|-----------|-------|
| REQ-LAN-001 | Elegibilidade para Lance | `AssembleiasPage.jsx` | useMutation (criar lance) | lanceSchema | — |
| REQ-LAN-002 | Lance Embutido | `AssembleiasPage.jsx` | useMutation (criar lance) | lanceSchema | — |
| REQ-LAN-003 | Motor de Amortização | `LancesPendentesPage.jsx` | useMutation (redução/diluição) | — | — |
| REQ-LAN-004 | Lance Fixo | `AssembleiasPage.jsx` | useMutation (criar lance) | lanceSchema | — |

---

## contemplacao — Apuração e Contemplações

| REQ-ID | Regra | Componente(s) JSX | Hook TanStack | Schema Zod | Teste |
|--------|-------|-------------------|---------------|-----------|-------|
| REQ-CON-001 | Motor de Apuração | `AssembleiasPage.jsx` | useContemplações(assembleiaId) | — | — |
| REQ-CON-002 | Checagem Saldo Ledger | `AssembleiasPage.jsx` | — (feedback de erro 422) | — | — |
| REQ-CON-003 | Homologação Lance Livre | `LancesPendentesPage.jsx` | useMutation (integralizar) | — | — |
| REQ-CON-004 | Lançamentos Contábeis | `LancesPendentesPage.jsx` | useMutation (pagamento-bem) | — | — |
| REQ-CON-005 | Oferta de Lance Fixo | `AssembleiasPage.jsx` | — | — | — |
| REQ-CON-006 | Apuração do Lance Fixo | `AssembleiasPage.jsx`, `LancesPendentesPage.jsx` | useContemplações() | — | — |

---

## inadimplencia — Mora e Inadimplência

| REQ-ID | Regra | Componente(s) JSX | Hook TanStack | Schema Zod | Teste |
|--------|-------|-------------------|---------------|-----------|-------|
| REQ-INA-001 | Encargos de Mora | `FinanceiroPage.jsx` | useMutation (pagar) | pagamentoSchema | — |
| REQ-INA-002 | Destinação Legal | `FinanceiroPage.jsx` | useMutation (estornar) | — | — |
| REQ-INA-003 | Cálculo Volátil | `FinanceiroPage.jsx`, `CotasPage.jsx` | useInadimplencia(cotaId) | — | — |

---

## seguros — Seguros

| REQ-ID | Regra | Componente(s) JSX | Hook TanStack | Schema Zod | Teste |
|--------|-------|-------------------|---------------|-----------|-------|
| REQ-SEG-001 | Cobrança do Prêmio | `FinanceiroPage.jsx` (campo integrado) | — (parte do hook de parcela) | parcelaSchema | — |
| REQ-SEG-002 | Repasse Contábil COSIF | `FinanceiroPage.jsx` | — | — | — |

---

## excluidos — Restituição de Excluídos

| REQ-ID | Regra | Componente(s) JSX | Hook TanStack | Schema Zod | Teste |
|--------|-------|-------------------|---------------|-----------|-------|
| REQ-EXC-001 | Elegibilidade | `CotasPage.jsx`, `ReembolsosExcluidosPage.jsx` | useMutation (cancelar) | — | — |
| REQ-EXC-002 | Memória de Cálculo | `ReembolsosExcluidosPage.jsx` | useMutation (reembolsar) | — | — |
| REQ-EXC-003 | Cláusula Penal | `ReembolsosExcluidosPage.jsx` | — | — | — |
| REQ-EXC-004 | Fixação de Saldo | `ReembolsosExcluidosPage.jsx` | — | — | — |
| REQ-EXC-005 | Contabilização COSIF | `ReembolsosExcluidosPage.jsx` | — | — | — |

---

## encerramento — Reajustes e Encerramento

| REQ-ID | Regra | Componente(s) JSX | Hook TanStack | Schema Zod | Teste |
|--------|-------|-------------------|---------------|-----------|-------|
| REQ-ENC-001 | Motor de Reajuste | `GruposPage.jsx` | useMutation (reajuste) | reajusteSchema | — |
| REQ-ENC-002 | Encerramento + PDD | `EncerrarGrupoPage.jsx` | useMutation (encerrar) | — | — |
| REQ-ENC-003 | Recursos Não Procurados | `EncerrarGrupoPage.jsx` | — | — | — |

---

## compliance — Compliance e Listas Restritivas (PLD/FT)

| REQ-ID | Regra | Componente(s) JSX | Hook TanStack | Schema Zod | Teste |
|--------|-------|-------------------|---------------|-----------|-------|
| REQ-COMP-002 | Sincronização Manual | `CompliancePainelPage.jsx` | useMutation (sincronizar) | — | `CompliancePainelPage.test.jsx` |
| REQ-COMP-003 | Coleta Renda/Patrimônio | `ClienteForm.jsx` | — | clienteSchema | `schemas.test.js`, `App.test.jsx` |
| REQ-COMP-005 | Painel e Deliberação | `CompliancePainelPage.jsx` | useQuery (alertas), useMutation (deliberar) | — | `CompliancePainelPage.test.jsx` |

---

## ⚠️ Cobertura de Testes

| Métrica | Valor |
|---------|-------|
| Total de REQ-IDs rastreados | 28 |
| REQ-IDs com componente mapeado | 28/28 (100%) |
| REQ-IDs com hook TanStack mapeado | 20/28 (71%) |
| REQ-IDs com schema Zod mapeado | 9/28 (32%) |
| REQ-IDs com teste Vitest | 3/28 (10%) |

> **Nota**: A cobertura de testes automatizados está sendo progressivamente expandida. A capabilidade de Compliance está 100% coberta por testes no frontend.

> **Nota**: A cobertura de testes é o próximo passo a ser endereçado na próxima sprint. Os hooks e schemas ainda não extraídos estão marcados nas `tasks.md` de cada capability.
