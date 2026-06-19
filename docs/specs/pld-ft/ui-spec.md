# 📋 Especificação de UI — Relatório PLD/FT (pld-ft)

*   **Status**: DRAFT
*   **Versão**: v1.0
*   **Spec Backend**: Pendente de criação no repositório backend
*   **API Contract**: Pendente de criação no repositório backend
*   **Última alteração**: Criação inicial da especificação de UI — origem: SPECIFY-UI inicial

---

## 🎯 Objetivo de UI
Fornecer à diretoria e equipe de compliance (ADMIN/DIRETOR) uma visão consolidada de movimentações financeiras atípicas, lances de alto valor e históricos suspeitos, visando atender normas de Prevenção à Lavagem de Dinheiro e Financiamento ao Terrorismo (PLD/FT).

---

## 🖥️ Telas e Componentes

### Página: RelatorioPldFtPage
- **Rota**: `/relatorios/pld-ft`
- **Permissões**: 🔒 ADMIN, DIRETOR
- **REQ-IDs cobertos**: REQ-PLDFT-001, REQ-PLDFT-002
- **Arquivo existente**: `src/pages/RelatorioPldFtPage.jsx`

#### Componentes (A Desenvolver)

| Componente | Tipo | REQ-ID | Hook TanStack | Schema Zod |
|-----------|------|--------|--------------|-----------|
| PldFtFiltros | Form | REQ-PLDFT-001 | — | pldFtFiltroSchema |
| TabelaOperacoesAtipicas | Data Display | REQ-PLDFT-001 | usePldFtRelatorio | — |
| AlertaSuspeitaBadge | UI | REQ-PLDFT-002 | — | — |

#### Endpoints Consumidos (Propostos)

| Endpoint (A criar no Backend) | Método | Hook | Ação |
|-------------------------------|--------|------|------|
| `GET /api/relatorios/pld-ft` | GET | usePldFtRelatorio | Buscar operações atípicas filtradas |
| `POST /api/relatorios/pld-ft/{id}/auditar` | POST | useAuditarOperacao | Marcar operação como auditada |

#### Estados

| Estado | Componente/Comportamento |
|--------|------------------------|
| Loading | Skeleton da tabela e filtros desabilitados |
| Empty State | "Nenhuma operação atípica encontrada no período." |
| Error | Toast de erro com falha ao buscar relatório |

---

## 🎯 Critérios de Aceitação de UI

### REQ-PLDFT-001 - AC-UI-1: Filtros de Período e Valor
- **Given**: O Diretor acessa a tela de PLD/FT.
- **When**: Ele seleciona um range de datas e um valor mínimo de suspeita.
- **Then**: A tabela é atualizada buscando os dados via React Query, e exibe o estado de loading durante a transição.

### REQ-PLDFT-002 - AC-UI-1: Ação de Auditoria
- **Given**: Uma lista de operações atípicas na tabela.
- **When**: O Diretor clica no botão "Marcar como Auditado" em uma linha.
- **Then**: O sistema emite dialog de confirmação e, após aceitar, invalida o cache atualizando o status da linha para "Verificado".
