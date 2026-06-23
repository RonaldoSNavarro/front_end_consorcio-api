# 📋 Índice de Requisitos e Capabilities — Frontend Consórcio

Este documento serve como índice para as especificações de UI modulares e centraliza o mapeamento entre capabilities do backend e telas/componentes do frontend.

---

## 🗂️ 1. Índice de Capabilities (UI Specs)

Cada capability do backend possui sua especificação de UI isolada no frontend, derivada do `api-contract.md` do backend:

| # | Capability | UI Spec (Frontend) | Spec Backend | API Contract Backend | Páginas Relacionadas |
|---|-----------|--------------------|--------------|-----------------------|---------------------|
| 1 | Autenticação e Sessão (auth) | [ui-spec.md](specs/auth/ui-spec.md) | [spec.md](../../consorcio-api/docs/specs/auth/spec.md) | [api-contract.md](../../consorcio-api/docs/specs/auth/api-contract.md) | `LoginPage` |
| 2 | Gestão de Assembleias (assembleia) | [ui-spec.md](specs/assembleia/ui-spec.md) | [spec.md](../../consorcio-api/docs/specs/assembleia/spec.md) | [api-contract.md](../../consorcio-api/docs/specs/assembleia/api-contract.md) | `AssembleiasPage` |
| 3 | Composição de Fundos e Parcelas (fundos) | [ui-spec.md](specs/fundos/ui-spec.md) | [spec.md](../../consorcio-api/docs/specs/fundos/spec.md) | [api-contract.md](../../consorcio-api/docs/specs/fundos/api-contract.md) | `FinanceiroPage` |
| 4 | Oferta de Lances (lances) | [ui-spec.md](specs/lances/ui-spec.md) | [spec.md](../../consorcio-api/docs/specs/lances/spec.md) | [api-contract.md](../../consorcio-api/docs/specs/lances/api-contract.md) | `AssembleiasPage`, `LancesPendentesPage` |
| 5 | Apuração e Contemplações (contemplacao) | [ui-spec.md](specs/contemplacao/ui-spec.md) | [spec.md](../../consorcio-api/docs/specs/contemplacao/spec.md) | [api-contract.md](../../consorcio-api/docs/specs/contemplacao/api-contract.md) | `AssembleiasPage`, `LancesPendentesPage` |
| 6 | Mora e Inadimplência (inadimplencia) | [ui-spec.md](specs/inadimplencia/ui-spec.md) | [spec.md](../../consorcio-api/docs/specs/inadimplencia/spec.md) | [api-contract.md](../../consorcio-api/docs/specs/inadimplencia/api-contract.md) | `FinanceiroPage`, `CotasPage` |
| 7 | Seguros (seguros) | [ui-spec.md](specs/seguros/ui-spec.md) | [spec.md](../../consorcio-api/docs/specs/seguros/spec.md) | [api-contract.md](../../consorcio-api/docs/specs/seguros/api-contract.md) | `FinanceiroPage` |
| 8 | Restituição de Excluídos (excluidos) | [ui-spec.md](specs/excluidos/ui-spec.md) | [spec.md](../../consorcio-api/docs/specs/excluidos/spec.md) | [api-contract.md](../../consorcio-api/docs/specs/excluidos/api-contract.md) | `ReembolsosExcluidosPage`, `CotasPage` |
| 9 | Reajustes e Encerramento (encerramento) | [ui-spec.md](specs/encerramento/ui-spec.md) | [spec.md](../../consorcio-api/docs/specs/encerramento/spec.md) | [api-contract.md](../../consorcio-api/docs/specs/encerramento/api-contract.md) | `EncerrarGrupoPage`, `GruposPage` |
| 10 | Compliance e Listas Restritivas (compliance) | [ui-spec.md](specs/compliance/ui-spec.md) | [spec.md](../../consorcio-api/docs/specs/compliance/spec.md) | [api-contract.md](../../consorcio-api/docs/specs/compliance/api-contract.md) | `CompliancePainelPage` |

---

## 🏗️ 2. Mapeamento de Entidades Backend → Frontend

O frontend não mantém entidades persistidas, mas consome os DTOs de resposta do backend. O mapeamento abaixo indica quais DTOs são consumidos e em quais componentes:

### DTOs Consumidos

| Entidade Backend | DTO Response | Páginas/Hooks que Consomem |
|-----------------|-------------|----------------------------|
| `Cliente` | `ClienteResponseDTO` | `ClientesPage`, `ClienteForm` |
| `Grupo` | `GrupoResponseDTO` | `GruposPage`, `GrupoForm`, `DashboardPage` |
| `Cota` | `CotaResponseDTO` | `CotasPage`, `CotaForm` |
| `Parcela` | `ParcelaResponseDTO` | `FinanceiroPage` |
| `Assembleia` | `AssembleiaResponseDTO` | `AssembleiasPage` |
| `Lance` | `LanceResponseDTO` | `AssembleiasPage`, `LancesPendentesPage` |
| `Contemplacao` | `ContemplacaoResponseDTO` | `AssembleiasPage`, `LancesPendentesPage` |
| `LancamentoContabil` | `LancamentoContabilResponseDTO` | `FinanceiroPage`, `RelatorioBalancetePage` |
| `AlertaCompliance` | `AlertaComplianceResponseDTO` | `CompliancePainelPage` |

---

## 🎨 3. Design Tokens Globais

### Cores (Tailwind CSS v3)

O projeto utiliza as paletas nativas do Tailwind com suporte a `dark mode: class`.

| Elemento | Tema Claro | Tema Escuro |
|-------|-----|-----|
| Background Principal | `bg-slate-50` | `dark:bg-slate-900` |
| Background Card | `bg-white` | `dark:bg-slate-800` |
| Acento Primário | `bg-amber-500` | `bg-amber-500` |
| Texto Principal | `text-slate-900` | `dark:text-white` |
| Texto Secundário | `text-slate-500` | `dark:text-slate-400` |
| Bordas | `border-slate-200` | `dark:border-slate-700/60` |
| Status Positivo | `text-emerald-500` | `text-emerald-400` |
| Status Negativo | `text-rose-500` | `text-rose-400` |

### Tipografia

| Uso | Font Family | Weight |
|-----|------------|--------|
| Headings (h1-h3) | Space Grotesk | 600-700 |
| Body text | Inter | 400-500 |
| Monospace (código) | JetBrains Mono | 400 |

---

## 🔒 4. Convenções de Rotas e RBAC

| Padrão de Rota | Permissão | Componente Guard |
|---------------|-----------|-----------------|
| `/login` | 🔓 Público | — |
| `/dashboard`, `/clientes`, `/grupos`, `/cotas` | 🔒 Autenticado | `ProtectedRoute` |
| `/assembleias`, `/lances-pendentes`, `/financeiro` | 🔒 Autenticado | `ProtectedRoute` |
| `/reembolsos-excluidos` | 🔒 Autenticado | `ProtectedRoute` |
| `/relatorios/estatisticas` | 🔒 Autenticado | `ProtectedRoute` |
| `/relatorios/balancete`, `/relatorios/pld-ft` | 🔒 ADMIN, AUDITOR | `ProtectedRoute(allowedRoles)` |
| `/grupos/:id/encerrar` | 🔒 ADMIN | `ProtectedRoute(allowedRoles)` |
