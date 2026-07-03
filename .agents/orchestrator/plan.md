# Project Plan: Sales, Quota Reservation, and Contracts Module Integration

## Overview
This plan defines the path to develop and integrate the Sales, Quota Reservation, and Contracts module in the React frontend, ensuring compliance with BACEN regulations and compatibility with the backend endpoints.

## Architecture & Integration
- **Framework**: React 18 + Vite + TailwindCSS
- **State Management**: TanStack Query (React Query) v5 for server state, React Hook Form + Zod for client forms.
- **Backend Endpoints**:
  - `GET /api/vendas/tipos` / `/tipos/todos` - List sale types
  - `GET /api/vendas/produtos` - List products/plans
  - `POST /api/vendas/propostas` - Create a proposal (starts as EM_ANALISE)
  - `POST /api/vendas/propostas/{id}/aprovar` - Approve proposal, generates ContratoAdesao (starts as PENDENTE_PAGAMENTO)
  - `POST /api/vendas/contratos/{id}/efetivar` - Simulate payment, allocates group, creates Cota.

## Milestones
| # | Name | Scope / Deliverables | Dependencies | Status |
|---|------|----------------------|--------------|--------|
| 1 | Investigation | Analyze existing pages, backend endpoints, and test suite. | None | PLANNED |
| 2 | Spec & Tasks Update | Update `docs/specs/vendas/ui-spec.md` and `tasks.md` to cover simulation, group health, specific quota selection, and contract rendering. | M1 | PLANNED |
| 3 | Design | Create mockups or Tailwind component designs for the wizard pages, contract review, and simulation. | M2 | PLANNED |
| 4 | Implementation | Implement credit simulation, group/quota picker, visual contract with BCB divisions (Fundo Comum, Taxa Adm, Fundo Reserva), and systemic acceptance. | M3 | PLANNED |
| 5 | Code Review | Review implementation against `ui-spec.md` and React/TanStack guidelines. | M4 | PLANNED |
| 6 | QA & Test Fixes | Run E2E tests, stabilize Playwright flakiness (OFAC/ONU tests), and verify the new wizard flow. | M5 | PLANNED |
| 7 | CTO Sign-off | Final verification and project documentation update. | M6 | PLANNED |
