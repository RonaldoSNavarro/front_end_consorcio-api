# 📂 Contexto do Projeto — Frontend Consórcio

Este documento descreve o estado atual do frontend, a stack de referência, as ADRs vigentes e as diretrizes técnicas do projeto **front_end_consorcio-api**.

---

## 🛠️ 1. Stack Tecnológica de Referência

*   **Framework:** React 18.3.1 + Vite 5.4.10
*   **Server State & Cache:** TanStack Query (React Query) v5
*   **Gerenciamento de Formulários:** React Hook Form v7
*   **Validação Client-Side:** Zod v4 (schemas de validação estrita)
*   **Roteamento:** React Router DOM v7
*   **Testes:** Vitest + Testing Library + Happy DOM
*   **Estilização:** Tailwind CSS (tema escuro HSL harmônico)
*   **Linting:** ESLint 9

---

## 💻 2. Inventário de Componentes

### Páginas (13)

| Página | Arquivo | Rota | RBAC |
|--------|---------|------|------|
| Login | `LoginPage.jsx` | `/login` | 🔓 Público |
| Dashboard | `DashboardPage.jsx` | `/dashboard` | 🔒 Autenticado |
| Clientes | `ClientesPage.jsx` | `/clientes` | 🔒 Autenticado |
| Grupos | `GruposPage.jsx` | `/grupos` | 🔒 Autenticado |
| Cotas | `CotasPage.jsx` | `/cotas` | 🔒 Autenticado |
| Assembleias | `AssembleiasPage.jsx` | `/assembleias` | 🔒 Autenticado |
| Lances Pendentes | `LancesPendentesPage.jsx` | `/lances-pendentes` | 🔒 Autenticado |
| Reembolsos Excluídos | `ReembolsosExcluidosPage.jsx` | `/reembolsos-excluidos` | 🔒 Autenticado |
| Financeiro | `FinanceiroPage.jsx` | `/financeiro` | 🔒 Autenticado |
| Encerrar Grupo | `EncerrarGrupoPage.jsx` | `/grupos/:id/encerrar` | 🔒 ADMIN |
| Relatório Balancete | `RelatorioBalancetePage.jsx` | `/relatorios/balancete` | 🔒 ADMIN, DIRETOR |
| Relatório Estatísticas | `RelatorioEstatisticasPage.jsx` | `/relatorios/estatisticas` | 🔒 Autenticado |
| Relatório PLD/FT | `RelatorioPldFtPage.jsx` | `/relatorios/pld-ft` | 🔒 ADMIN, DIRETOR |

### Componentes (9)

| Componente | Diretório | Tipo |
|-----------|-----------|------|
| `ClienteForm.jsx` | `components/forms/` | Formulário |
| `CotaForm.jsx` | `components/forms/` | Formulário |
| `GrupoForm.jsx` | `components/forms/` | Formulário |
| `ConfirmDialog.jsx` | `components/ui/` | UI |
| `Icons.jsx` | `components/ui/` | UI |
| `Confetti.jsx` | `components/` | Efeito |
| `AppLayout.jsx` | `components/layout/` | Layout |
| `ProtectedRoute.jsx` | `components/layout/` | Layout/Auth |
| `Sidebar.jsx` | `components/layout/` | Layout |

### Services (2)

| Service | Descrição |
|---------|-----------|
| `api.js` | Funções de chamada à API REST (17KB, `credentials: 'include'`) |
| `mockDb.js` | Base de dados mock para desenvolvimento offline |

### Context (2)

| Context | Descrição |
|---------|-----------|
| `AuthContext.jsx` | Gerenciamento de sessão e autenticação |
| `ToastContext.jsx` | Notificações toast globais |

---

## 🔴 3. Vulnerabilidades Identificadas

### VUL-001: F5-Safety (Sessão & LocalStorage)
- **Componente**: `AuthContext.jsx`
- **Problema**: O token é inicializado via `localStorage.getItem('consorcio_api_token')`. Sob segurança de JWT HttpOnly Cookie, o localStorage não contém o token real, causando redirecionamento indevido ao login ao atualizar a página (F5).
- **Solução**: Implementação do mecanismo de validação ativa via `GET /api/login/me` (ADR 007 do backend).
- **Status**: ⚠️ Pendente de implementação.

---

## 🏛️ 4. ADRs Vigentes do Frontend

### ADR-FE-001: Derivação Obrigatória do Backend
*   **Contexto**: O frontend e o backend evoluem em repositórios separados. Sem sincronização formal, o frontend pode criar telas para endpoints inexistentes ou contratos divergentes.
*   **Decisão**: Todo `ui-spec.md` do frontend deve referenciar explicitamente o `api-contract.md` do backend via caminho relativo (`../../consorcio-api/docs/specs/<capability>/api-contract.md`). Nenhuma implementação de UI é autorizada antes que o contrato esteja LOCKED.

### ADR-FE-002: TanStack Query como Única Fonte de Server State
*   **Contexto**: Uso de `useState` para dados da API gera inconsistências de cache, duplicação de estado e bugs de sincronização.
*   **Decisão**: Toda interação com a API REST é feita exclusivamente via hooks `useQuery` e `useMutation` do TanStack Query v5. O `useState` é reservado para estado local de UI (modais, filtros, paginação).

### ADR-FE-003: Validação Zod como Gate Obrigatório
*   **Contexto**: Formulários sem validação estrita permitem dados inválidos que sobrecarregam o backend com rejeições 400/422.
*   **Decisão**: Todo formulário utiliza `zodResolver` com schema tipado. Validações incluem: formato CPF/CNPJ, e-mail, valores positivos, datas futuras, e prevenção de XSS.

### ADR-FE-004: Proxy Obrigatório para APIs Externas
*   **Contexto**: Chamadas diretas a APIs de terceiros (ex: ViaCEP) no browser expõem CORS, permitem interceptação de dados e violam princípios de segurança.
*   **Decisão**: Toda API externa é acessada via proxy no backend. O frontend consome `/api/clientes/busca-cep/{cep}` em vez de `viacep.com.br/ws/{cep}/json/`.

---

## 📈 5. Estado Atual do Projeto

- **Fase Atual**: Criação da infraestrutura SDD do frontend.
- **Backend de Referência**: Sprint 5 concluída — 9 capabilities implementadas, 107 testes passando.
- **Status Frontend**: 13 páginas e 9 componentes implementados. Cobertura de testes parcial (`App.test.jsx`, `api.test.js`).
- **Artefatos Gerados**:
  - [constitution.md](constitution.md) — Princípios e regras técnicas inegociáveis.
  - [REQUIREMENTS.md](REQUIREMENTS.md) — Índice de capabilities.
  - [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) — Este documento.
  - [agents.md](agents.md) — Orquestração SDD adaptada ao frontend.
  - [specs/](specs/) — Especificações de UI por capability.
  - [templates/](templates/) — Templates padronizados.
  - [traceability-matrix.md](traceability-matrix.md) — Matriz de rastreabilidade.

---

## ⚠️ Padrões de Código Inegociáveis

> Para a lista completa e detalhada de padrões inegociáveis, consulte [constitution.md](constitution.md) (Seções 3 e 4).
