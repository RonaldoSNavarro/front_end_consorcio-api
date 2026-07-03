# BRIEFING — 2026-07-02T01:30:00Z

## Mission
Implement the Sales, Quota Reservation, and Contracts module in the frontend and backend.

## 🔒 My Identity
- Archetype: Dev Frontend Sênior / Backend Implementer
- Roles: implementer, qa, specialist
- Working directory: f:\Dev\Projetos\front_end_consorcio-api\.agents\worker_vendas_implement
- Original parent: c0bbb0d5-a89f-4dd4-9b08-fb15cb0ef1cb
- Milestone: Sales, Quota Reservation, and Contracts Implementation

## 🔒 Key Constraints
- Follow SDD: spec.md is the source of truth.
- Do not cheat: no hardcoded values or dummy implementations.
- UI rules: TanStack Query for server state, React Hook Form + Zod, dark theme (#0F172A), WCAG AA.
- Safe SQL migration compatible with H2 and PostgreSQL.
- Return completion messages and write handoff.md.

## Current Parent
- Conversation ID: c0bbb0d5-a89f-4dd4-9b08-fb15cb0ef1cb
- Updated: not yet

## Task Summary
- **What to build**:
  1. Migration `V47__inserir_alertas_compliance_osama.sql` in backend inserting lists entries and compliance alerts for OSAMA BIN LADEN.
  2. Block proposal creation in `PropostaAdesaoService.java` if customer has pending/confirmed compliance alerts.
  3. Refactor `VendaPropostaPage.jsx` into a 4-step wizard with client selection, credit simulation + group/cota, sales channel + commission, proposal confirmation + Visual Contract + efetivação.
- **Success criteria**:
  - H2/Postgres safe migration runs successfully.
  - Compliance check blocks restricted clients.
  - 4-step wizard is functional, conforms to UI spec, passes E2E tests, and shows appropriate error toast when blocked.
- **Interface contracts**: `../../consorcio-api/docs/specs/` and `docs/specs/`
- **Code layout**: Frontend in `src/pages/VendaPropostaPage.jsx`, backend in `src/main/resources/db/migration/` and `src/main/java/br/com/estudo/consorcio/domain/service/PropostaAdesaoService.java`.

## Key Decisions Made
- Chose standard SQL insert with WHERE NOT EXISTS to be safe for both H2 and PostgreSQL.
- Implemented a 4-step wizard with auto-selection helpers for group, quota and channel to improve operator workflow and maintain E2E robustness.
- Added sequential mutation chain in the proposal efetivação flow (proposta -> approval -> efetivar) within VendaPropostaPage.jsx.

## Artifact Index
- `f:\Dev\Projetos\front_end_consorcio-api\.agents\worker_vendas_implement\handoff.md` — Handoff report

## Change Tracker
- **Files modified**:
  - `consorcio-api/src/main/resources/db/migration/V47__inserir_alertas_compliance_osama.sql` (created)
  - `consorcio-api/src/main/java/br/com/estudo/consorcio/domain/service/PropostaAdesaoService.java`
  - `front_end_consorcio-api/src/pages/VendaPropostaPage.jsx`
- **Build status**: Pass (all builds and tests compiled and run successfully)
- **Pending issues**: None.

## Quality Status
- **Build/test result**: Pass (Backend: 120 tests run, 0 failures; Frontend: 44 unit tests run, 0 failures)
- **Lint status**: Pass (VendaPropostaPage.jsx contains 0 lint violations)
- **Tests added/modified**: Verified existing test coverage.

## Loaded Skills
- **Source**: `consorcio-sdd`
  - **Local copy**: `f:\Dev\Projetos\consorcio-api\.agents\skills\consorcio-sdd\SKILL.md`
  - **Core methodology**: SDD pipeline: SPECIFY -> CLARIFY -> PLAN -> TASKS -> ANALYZE -> IMPLEMENT -> REVIEW -> QA -> SIGN-OFF.
- **Source**: `consorcio-brasil`
  - **Local copy**: `f:\Dev\Projetos\consorcio-api\.agents\skills\consorcio-brasil\SKILL.md`
  - **Core methodology**: Brazilian consortium regulations and rules.
