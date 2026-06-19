# Consórcio Admin - Frontend Financeiro 📊

Este é o módulo Frontend de administração do **Consórcio API**, responsável por se conectar com nosso motor financeiro Spring Boot e administrar grupos, cotas, parcelas e apuração de assembleias de forma visual, segura e com foco em alta fidelidade regulatória.

---

## 🏗️ Arquitetura e Tecnologias

A aplicação adota um ecossistema modular escalável, projetado para suportar fluxos de caixa complexos com robustez e consistência de estado:

*   **React 18**: Construção da interface declarativa com hooks.
*   **Vite**: Ferramenta de build de última geração para desenvolvimento ágil.
*   **React Router DOM**: Gestão de rotas da SPA com controle de acesso baseado em perfis (RBAC) e proteção contra acessos diretos indevidos.
*   **TanStack Query (React Query) v5**: Gestão absoluta de Server State, cache de dados, paginação e invalidação instantânea de queries pós-mutação para evitar cliques duplos e inconsistências financeiras.
*   **Zod & React Hook Form**: Formulários não-controlados super performáticos que validam formatos (CPF/CNPJ, datas, moedas) e previnem valores negativos ou injeções no lado do cliente.
*   **ViaCEP Integrado**: Consulta automatizada de CEPs via proxy no backend (prevenindo problemas de CORS e exposição a terceiros no cliente).

---

## 🎨 Identidade Visual & Design System Premium

A aplicação foi reformulada para seguir uma estética corporativa sóbria e premium (padrão de bancos e fintechs):

*   **Tema Escuro HSL Harmônico**:
    *   **Background Principal**: `#0B0F19` (Midnight Navy profundo)
    *   **Background de Painéis**: `#111827` (Deep Slate / Slate 900)
    *   **Bordas & Vidro**: Transparências suaves e sombras com sensação de profundidade (`box-shadow`).
    *   **Acento Primário**: `#3B82F6` (Corporate Blue) e `#6366F1` (Indigo), com `#F59E0B` (Amber) reservado exclusivamente para sinalização de lances contemplados ou avisos financeiros.
*   **Zero Emojis**: Todos os emojis nativos foram substituídos por ícones vetoriais SVG minimalistas importados de `Icons.jsx`.
*   **Scrollbars & Focos**: Scrollbars de trilha oculta super finos e anel de foco Indigo unificado para todos os elementos interativos.
*   **Modais Estáveis (Anti-Overflow)**: Os backdrops e contêineres de modal utilizam alinhamento dinâmico (`items-start` no topo para telas pequenas com scroll vertical ativo, e `md:items-center` em resoluções normais), impedindo que formulários extensos cortem o cabeçalho no limite do navegador.

---

## 🛡️ Validações Estritas & Conformidade Regulatória

Nossa malha de formulários e exibições garante total aderência contábil e de compliance:
*   **Integralização de Lances (ADR 004)**: Controle de lances pendentes com prazos úteis rígidos e justificativa obrigatória de cancelamento por decurso de prazo.
*   **Restituição de Excluídos (ADR 005 - Art. 30 da Lei 11.795/08)**: Memória de cálculo detalhada aplicando a amortização do fundo comum sobre o valor atualizado do bem na data da AGO de sorteio, com dedução de 10% da cláusula penal contábil.
*   **Mapeamento COSIF**: Indicações explícitas de partidas dobradas e contas contábeis de auditoria (BACEN) em cada operação.

---

## 📑 SDD (Spec-Driven Development) & Capabilities

O projeto é guiado estritamente por especificações de UI (`docs/specs/`) vinculadas aos contratos de API do backend. 
Atualmente, o **Sign-Off** foi concluído com sucesso para as seguintes 9 capabilities (`IMPLEMENTED v1.0`):
1. Autenticação e Sessão (com F5-Safety)
2. Gestão de Assembleias
3. Composição de Fundos e Parcelas
4. Oferta de Lances
5. Apuração e Contemplações
6. Mora e Inadimplência
7. Seguros
8. Restituição de Excluídos
9. Reajustes e Encerramento
10. Relatórios (PLD/FT, Balancete e Estatísticas)

**Em Andamento:**
* (Nenhuma capability no momento. Todas as 10 capabilities essenciais foram implementadas.)

---

## 📂 Estrutura de Diretórios

```text
src/
 ┣ components/
 ┃ ┣ forms/       # Formulários validados por Schemas Zod
 ┃ ┣ layout/      # Sidebar, AppLayout e ProtectedRoute (RBAC)
 ┃ ┗ ui/          # Ícones SVG e notificações de Toast
 ┣ context/       # AuthContext (JWT) e ToastContext (Alertas)
 ┣ hooks/         # Custom Hooks isolando todas as Queries/Mutações do TanStack
 ┣ pages/         # Telas (Dashboard, Clientes, Financeiro, AGO, Lances, Reembolsos, etc)
 ┣ schemas/       # Schemas Zod de validação estrita (login, assembleia, lance, etc)
 ┣ services/      # Isolamento da conexão com o Backend Spring Boot (api.js & mockDb.js)
 ┣ test/          # Suíte de testes unitários de Schemas e Hooks
 ┣ App.jsx        # Configuração de Rotas e Provedores do App
 ┗ main.jsx       # Ponto de montagem no DOM
```

---

## 🚀 Como Executar

O frontend depende do backend Spring Boot estar rodando na porta 8080. O `api.js` possui um detector automático de proxy: se a API real estiver offline, a aplicação cairá suavemente em **Modo Simulado (mockDb local)**, permitindo desenvolvimento offline completo.

1. Instale todas as dependências:
   ```bash
   npm install
   ```

2. Execute o servidor de desenvolvimento Vite:
   ```bash
   npm run dev
   ```

3. Execute a suíte de testes unitários e de integração:
   ```bash
   npm run test:run
   ```

---

## 🧪 Cobertura de Testes (Vitest)

A aplicação conta com validação automatizada contínua por meio de Vitest, cobrindo:
*   **Schemas Zod**: Validação de CPFs/CNPJs, regras financeiras, patrimônio e formatos.
*   **TanStack Hooks**: Validação de cache, queries e mutações em modo simulação.
*   **Integração do DOM**: Testes em `App.test.jsx` cobrindo o fluxo de login e criação de clientes.

Todos os **37 testes integrados** passam com 100% de sucesso.
