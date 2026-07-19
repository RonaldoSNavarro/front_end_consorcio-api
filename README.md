# ConsÃ³rcio Admin - Frontend Financeiro ðŸ“Š

Este Ã© o mÃ³dulo Frontend de administraÃ§Ã£o do **ConsÃ³rcio API**, responsÃ¡vel por se conectar com nosso motor financeiro Spring Boot e administrar grupos, cotas, parcelas e apuraÃ§Ã£o de assembleias de forma visual, segura e com foco em alta fidelidade regulatÃ³ria.

---

## ðŸ�—ï¸� Arquitetura e Tecnologias

A aplicaÃ§Ã£o adota um ecossistema modular escalÃ¡vel, projetado para suportar fluxos de caixa complexos com robustez e consistÃªncia de estado:

*   **React 18**: ConstruÃ§Ã£o da interface declarativa com hooks.
*   **Vite**: Ferramenta de build de Ãºltima geraÃ§Ã£o para desenvolvimento Ã¡gil.
*   **React Router DOM**: GestÃ£o de rotas da SPA com controle de acesso baseado em perfis (RBAC) e proteÃ§Ã£o contra acessos diretos indevidos.
*   **TanStack Query (React Query) v5**: GestÃ£o absoluta de Server State, cache de dados, paginaÃ§Ã£o e invalidaÃ§Ã£o instantÃ¢nea de queries pÃ³s-mutaÃ§Ã£o para evitar cliques duplos e inconsistÃªncias financeiras.
*   **Zod & React Hook Form**: FormulÃ¡rios nÃ£o-controlados super performÃ¡ticos que validam formatos (CPF/CNPJ, datas, moedas) e previnem valores negativos ou injeÃ§Ãµes no lado do cliente.
*   **ViaCEP Integrado**: Consulta automatizada de CEPs via proxy no backend (prevenindo problemas de CORS e exposiÃ§Ã£o a terceiros no cliente).

---

## ðŸŽ¨ Identidade Visual & Design System Premium

A aplicaÃ§Ã£o foi reformulada para seguir uma estÃ©tica corporativa sÃ³bria e premium (padrÃ£o de bancos e fintechs):

*   **Tema Escuro HSL HarmÃ´nico**:
    *   **Background Principal**: `#0B0F19` (Midnight Navy profundo)
    *   **Background de PainÃ©is**: `#111827` (Deep Slate / Slate 900)
    *   **Bordas & Vidro**: TransparÃªncias suaves e sombras com sensaÃ§Ã£o de profundidade (`box-shadow`).
    *   **Acento PrimÃ¡rio**: `#3B82F6` (Corporate Blue) e `#6366F1` (Indigo), com `#F59E0B` (Amber) reservado exclusivamente para sinalizaÃ§Ã£o de lances contemplados ou avisos financeiros.
*   **Zero Emojis**: Todos os emojis nativos foram substituÃ­dos por Ã­cones vetoriais SVG minimalistas importados de `Icons.jsx`.
*   **Scrollbars & Focos**: Scrollbars de trilha oculta super finos e anel de foco Indigo unificado para todos os elementos interativos.
*   **Modais EstÃ¡veis (Anti-Overflow)**: Os backdrops e contÃªineres de modal utilizam alinhamento dinÃ¢mico (`items-start` no topo para telas pequenas com scroll vertical ativo, e `md:items-center` em resoluÃ§Ãµes normais), impedindo que formulÃ¡rios extensos cortem o cabeÃ§alho no limite do navegador.

---

## ðŸ›¡ï¸� ValidaÃ§Ãµes Estritas & Conformidade RegulatÃ³ria

Nossa malha de formulÃ¡rios e exibiÃ§Ãµes garante total aderÃªncia contÃ¡bil e de compliance:
*   **IntegralizaÃ§Ã£o de Lances (ADR 004)**: Controle de lances pendentes com prazos Ãºteis rÃ­gidos e justificativa obrigatÃ³ria de cancelamento por decurso de prazo.
*   **RestituiÃ§Ã£o de ExcluÃ­dos (ADR 005 - Art. 30 da Lei 11.795/08)**: MemÃ³ria de cÃ¡lculo detalhada aplicando a amortizaÃ§Ã£o do fundo comum sobre o valor atualizado do bem na data da AGO de sorteio, com deduÃ§Ã£o de 10% da clÃ¡usula penal contÃ¡bil.
*   **GestÃ£o de InadimplÃªncia**: VisualizaÃ§Ã£o explÃ­cita de cotas `EXCLUIDA` e `EM_EXECUCAO`, com quebra de encargos (Multa/Juros) diretamente na fatura das parcelas atrasadas.
*   **Fluxo de InauguraÃ§Ã£o**: Cotas de Grupos `EM_FORMACAO` entram em perÃ­odo de carÃªncia (`AGUARDANDO_INAUGURACAO`) e sÃ£o ativadas em cascata apenas na oficializaÃ§Ã£o da 1Âª AGO.
*   **Mapeamento COSIF**: IndicaÃ§Ãµes explÃ­citas de partidas dobradas e contas contÃ¡beis de auditoria (BACEN) em cada operaÃ§Ã£o.

---

## ðŸ“‘ SDD (Spec-Driven Development) & Capabilities

O projeto Ã© guiado estritamente por especificaÃ§Ãµes de UI (`docs/specs/`) vinculadas aos contratos de API do backend. 
Atualmente, o **Sign-Off** foi concluÃ­do com sucesso para as seguintes 12 capabilities (`IMPLEMENTED v1.0`):
1. AutenticaÃ§Ã£o e SessÃ£o (com F5-Safety)
2. GestÃ£o de Assembleias
3. ComposiÃ§Ã£o de Fundos e Parcelas
4. Oferta de Lances
5. ApuraÃ§Ã£o e ContemplaÃ§Ãµes
6. Mora e InadimplÃªncia
7. Seguros
8. RestituiÃ§Ã£o de ExcluÃ­dos
9. Reajustes e Encerramento
10. RelatÃ³rios (PLD/FT, Balancete e EstatÃ­sticas)
11. Compliance e Listas Restritivas (PLD/FT)
12. Esteira de Vendas (Proposta de AdesÃ£o, Produtos e Planos)

**Em Andamento / Recentes:**
* **Gestão de Acessos (RBAC):** Novas páginas completas para administração de Perfis (`PerfisPage`) e Usuários (`UsuariosPage`). O frontend agora gerencia as Permissões Granulares em interface e fornece avisos de sistema (Toasts) requerendo logout sempre que os privilégios da sessão ativa são modificados, garantindo consistência JWT em conformidade com o backend.

---

## ðŸ“‚ Estrutura de DiretÃ³rios

```text
src/
 â”£ components/
 â”ƒ â”£ forms/       # FormulÃ¡rios validados por Schemas Zod
 â”ƒ â”£ layout/      # Sidebar, AppLayout e ProtectedRoute (RBAC)
 â”ƒ â”— ui/          # Ã�cones SVG e notificaÃ§Ãµes de Toast
 â”£ context/       # AuthContext (JWT) e ToastContext (Alertas)
 â”£ hooks/         # Custom Hooks isolando todas as Queries/MutaÃ§Ãµes do TanStack
 â”£ pages/         # Telas (Dashboard, Clientes, Financeiro, AGO, Lances, Reembolsos, etc)
 â”£ schemas/       # Schemas Zod de validaÃ§Ã£o estrita (login, assembleia, lance, etc)
 â”£ services/      # Isolamento da conexÃ£o com o Backend Spring Boot (api.js & mockDb.js)
 â”£ test/          # SuÃ­te de testes unitÃ¡rios de Schemas e Hooks
 â”£ App.jsx        # ConfiguraÃ§Ã£o de Rotas e Provedores do App
 â”— main.jsx       # Ponto de montagem no DOM
```

---

## ðŸš€ Como Executar

O frontend foi desenvolvido para operar conectado em 100% do tempo Ã  API real Spring Boot na porta 8080. O modo mock foi permanentemente descontinuado para garantir fidelidade total nas validaÃ§Ãµes transacionais (Lances, IntegralizaÃ§Ãµes, etc).

1. Instale todas as dependÃªncias:
   ```bash
   npm install
   ```

2. Execute o servidor de desenvolvimento Vite:
   ```bash
   npm run dev
   ```

3. Execute a suÃ­te de testes unitÃ¡rios e de integraÃ§Ã£o:
   ```bash
   npm run test:run
   ```

---

## ðŸ§ª Cobertura de Testes (Vitest)

A aplicaÃ§Ã£o conta com validaÃ§Ã£o automatizada contÃ­nua por meio de Vitest, cobrindo:
*   **Schemas Zod**: ValidaÃ§Ã£o de CPFs/CNPJs, regras financeiras, patrimÃ´nio e formatos.
* - **Estado Frontend**: Totalmente refatorado para estÃ©tica Premium, com Skeletons de alto nÃ­vel (`TableSkeleton`, `CardSkeleton`) e temas dinÃ¢micos (Ã‚mbar, Oceano, Esmeralda). As dependÃªncias offline foram erradicadas, tornando o consumo 100% voltado para a API de produÃ§Ã£o Spring Boot.
- **Testes**: 8/8 testes E2E passando com 100% de sucesso. Testes unitÃ¡rios tambÃ©m em conformidade. UI Drift resolvido.

Todos os **47 testes integrados** passam com 100% de sucesso.

* **CRM e Vendas:** Motor de originação de consórcios com cadastro de Corretores, orçamentação e Propostas de Adesão. Tipos de Venda determinam o comissionamento de cada produto, enquanto a Alocação Inteligente encontra o melhor grupo (em andamento ou formação) para alocar o consorciado através de cruzamento da Categoria do Bem e limite de cotas. As regras de cálculo e estornos de Comissões serão estendidas em módulo futuro, tendo a primeira parcela do consórcio composta integralmente por Taxa de Administração e Fundo de Reserva.
