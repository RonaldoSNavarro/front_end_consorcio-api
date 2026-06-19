# 📋 Especificação de UI — Restituição de Excluídos (excluidos)

*   **Status**: IMPLEMENTED v1.0
*   **Versão**: v1.0
*   **Spec Backend**: [spec.md](../../../../consorcio-api/docs/specs/excluidos/spec.md)
*   **API Contract**: [api-contract.md](../../../../consorcio-api/docs/specs/excluidos/api-contract.md)
*   **Última alteração**: Criação inicial da especificação de UI — origem: SPECIFY-UI inicial

---

## 🎯 Objetivo de UI
Permitir ao operador cancelar cotas e efetuar reembolsos de consorciados excluídos, exibindo a memória de cálculo detalhada (percentual amortizado sobre bem atualizado, multa rescisória de 10%) e o status de reembolso.

---

## 🖥️ Telas e Componentes

### Página: ReembolsosExcluidosPage
- **Rota**: `/reembolsos-excluidos`
- **Permissões**: 🔒 Autenticado
- **REQ-IDs cobertos**: REQ-EXC-001, REQ-EXC-002, REQ-EXC-003, REQ-EXC-004, REQ-EXC-005
- **Arquivo existente**: `src/pages/ReembolsosExcluidosPage.jsx`

#### Componentes

| Componente | Tipo | REQ-ID | Hook TanStack | Schema Zod |
|-----------|------|--------|--------------|-----------|
| Lista de Cotas Canceladas | Table | REQ-EXC-001 | useCotasCanceladas() | — |
| Botão Cancelar Cota | Action | REQ-EXC-001 | useMutation (cancelar) | — |
| Memória de Cálculo | Display | REQ-EXC-002, REQ-EXC-003, REQ-EXC-004 | — | — |
| Botão Reembolsar | Action | REQ-EXC-002 | useMutation (reembolsar) | — |
| Badge Status Reembolso | Badge | REQ-EXC-002 | — | — |

### Página: CotasPage (ação cancelar)
- **Rota**: `/cotas`
- **Permissões**: 🔒 Autenticado
- **REQ-IDs cobertos**: REQ-EXC-001
- **Arquivo existente**: `src/pages/CotasPage.jsx`

#### Endpoints Consumidos

| Endpoint | Método | Hook | Ação |
|----------|--------|------|------|
| `POST /api/cotas/{id}/cancelar` | POST | useMutation | Cancelar cota |
| `POST /api/cotas/{id}/reembolsar` | POST | useMutation | Efetuar reembolso |

#### Estados

| Estado | Componente/Comportamento |
|--------|------------------------|
| Loading | Skeleton na tabela de cotas canceladas |
| Cancelada (não reembolsada) | Badge amarelo "Pendente de Reembolso" |
| Reembolsada | Badge verde "Reembolsada" com valor líquido |
| Error (cota não cancelada) | Toast "Apenas cotas canceladas podem ser reembolsadas" (400) |
| Error (já reembolsada) | Toast "Cota já foi reembolsada" (422) |
| Success (reembolso) | Toast com memória de cálculo resumida + invalidação de cache |
| Dialog confirmação | ConfirmDialog antes de cancelar/reembolsar |

---

## 🎯 Critérios de Aceitação de UI

### REQ-EXC-001 - AC-UI-1: Cancelamento de Cota com Confirmação
- **Given**: O operador está na lista de cotas ativas.
- **When**: O operador clica em "Cancelar Cota".
- **Then**: O sistema exibe dialog de confirmação. Ao confirmar, a cota muda para status CANCELADA, parcelas pendentes são removidas, e o cache é invalidado.

### REQ-EXC-002 - AC-UI-1: Memória de Cálculo do Reembolso
- **Given**: O operador está na página de reembolsos com uma cota cancelada.
- **When**: O operador clica em "Reembolsar".
- **Then**: O sistema exibe a memória de cálculo no toast de sucesso: total pago ao FC, multa rescisória (10%), e valor líquido reembolsado. O badge muda para "Reembolsada".

### REQ-EXC-002 - AC-UI-2: Bloqueio de Duplo Reembolso
- **Given**: Uma cota já foi reembolsada.
- **When**: O operador tenta reembolsar novamente.
- **Then**: O botão "Reembolsar" fica desabilitado ou o sistema exibe toast "Cota já foi reembolsada" (422).
