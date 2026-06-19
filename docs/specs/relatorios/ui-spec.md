# 📋 Especificação de UI — Relatórios e PLD/FT (Capability: relatorios)

*   **Status**: DRAFT
*   **Versão**: v1.0
*   **Spec Backend**: [spec.md](../../../../consorcio-api/docs/specs/relatorios/spec.md)
*   **API Contract**: [api-contract.md](../../../../consorcio-api/docs/specs/relatorios/api-contract.md)
*   **Última alteração**: Criação da especificação unificada para PLD/FT, Balancete e Estatísticas.

---

## 🎯 Objetivo de UI
Fornecer à diretoria e equipe de compliance uma visão consolidada do fluxo do consórcio, focada em métricas financeiras, quadratura contábil (Balancete COSIF) e rastreio de operações de alto valor para Prevenção à Lavagem de Dinheiro e Financiamento ao Terrorismo (PLD/FT).

---

## 🖥️ Telas e Componentes

### 1. Página: RelatorioPldFtPage
- **Rota**: `/relatorios/pld-ft`
- **Permissões**: 🔒 ADMIN, AUDITOR

#### Endpoints
- `GET /api/relatorios/pld-ft` (hook: `usePldFtQuery`)

#### Critérios de Aceitação
- **AC-UI-1**: O usuário deve poder filtrar lances atípicos por um período (Data Início e Data Fim).
- **AC-UI-2**: A tabela deve mostrar o nome, documento, valor da oferta e código do grupo.
- **AC-UI-3**: Deve usar o schema Zod `pldFtFiltroSchema` para evitar submissão com datas inválidas.

---

### 2. Página: RelatorioBalancetePage
- **Rota**: `/relatorios/balancete`
- **Permissões**: 🔒 ADMIN, AUDITOR

#### Endpoints
- `GET /api/relatorios/balancete/{grupoId}` (hook: `useBalanceteQuery`)

#### Critérios de Aceitação
- **AC-UI-1**: A tela deve exigir a seleção do `grupoId` (combobox). Opcionalmente a `dataReferencia`.
- **AC-UI-2**: A tabela exibirá as contas COSIF (código, nome, natureza e saldo).
- **AC-UI-3**: Deve usar o schema Zod `balanceteFiltroSchema`.

---

### 3. Página: RelatorioEstatisticasPage
- **Rota**: `/relatorios/estatisticas`
- **Permissões**: 🔒 ADMIN, AUDITOR, OPERADOR (se aplicável, ou restrito)

#### Endpoints
- `GET /api/relatorios/estatisticas/{grupoId}` (hook: `useEstatisticasQuery`)

#### Critérios de Aceitação
- **AC-UI-1**: Formulário requer `grupoId`, `dataInicio` e `dataFim`.
- **AC-UI-2**: Apresentação visual em cards (KPIs) mostrando total de adesões, cancelamentos e valores liberados.
- **AC-UI-3**: Deve usar o schema Zod `estatisticasFiltroSchema`.

---

## Estados Comuns
- **Loading**: Skeleton das tabelas/cards.
- **Empty State**: Mensagem informando ausência de dados no período/grupo.
- **Error (400/403/500)**: Toast alert.
