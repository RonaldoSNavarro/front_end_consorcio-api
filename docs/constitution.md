# 📜 Constituição do Projeto — Frontend Consórcio

Este documento define os princípios fundamentais, regras inegociáveis e padrões de código aplicados ao repositório **front_end_consorcio-api**. Todos os agentes e desenvolvedores devem seguir estas diretrizes sem exceção.

---

## ⛔ 1. Princípio Central da Fonte Única da Verdade (Single Source of Truth)

1. **A pasta `docs/` é a única fonte da verdade de UI**: Nenhuma linha de código deve ser escrita ou modificada com base em suposições ou históricos de chat fragmentados.
2. **Spec-Driven Development (SDD)**: O ciclo de desenvolvimento exige que a especificação de UI (`ui-spec.md`) seja criada e travada (`LOCKED`) antes do início de qualquer implementação.
3. **Derivação do Backend**: Todo `ui-spec.md` DEVE ser derivado de um `api-contract.md` LOCKED no backend (`../../consorcio-api/docs/specs/<capability>/api-contract.md`). Nenhuma tela pode ser criada sem contrato de API disponível.
4. **Protocolo de Desvio de Especificação (UI Drift)**:
   - O código reflete a especificação de UI. Se a implementação diverge do ui-spec, o Code Review ou o QA rejeitarão a alteração.
   - Se durante o desenvolvimento, revisão ou teste for detectada uma lacuna no ui-spec, **a implementação deve ser interrompida imediatamente**.
   - O ui-spec deve ser reaberto, corrigido (gerando um novo versionamento/PATCH pelo Analista) e aprovado. Apenas após a republicação do ui-spec com status atualizado, o desenvolvedor retomará a implementação.
   - Se o problema for do contrato de API, deve-se escalar ao backend via `SPEC DRIFT`.

---

## 🏛️ 2. Arquitetura e Integração

1. **Repositórios Separados com Referência Cruzada**:
   - Backend (`consorcio-api`): API REST stateless — fonte da verdade de negócio e contratos.
   - Frontend (`front_end_consorcio-api`): SPA cliente — fonte da verdade de UI.
   - Ambos compartilham o mesmo diretório pai. Referências cruzadas via caminhos relativos (`../../consorcio-api/docs/`).
2. **Contratos de API como Pré-Requisito**:
   - Antes de qualquer `ui-spec.md` ser criado, o `api-contract.md` do backend correspondente deve estar em status mínimo `LOCKED`.
3. **Consumo Stateless da API**:
   - O frontend consome a API REST do backend via `fetch` com `credentials: 'include'` para transmissão automática de cookies HttpOnly.

---

## 🎨 3. Padrões de Código Inegociáveis (React 18 & Vite)

1. **Gerenciamento de Estado do Servidor**: Uso absoluto de **TanStack Query (React Query) v5**. É proibido o uso de `useState` ou `useContext` locais para armazenar dados replicados da API.
2. **Invalidação de Cache Imediata**: Toda mutação financeira crítica (lances, contemplações, parcelamento) deve executar a invalidação explícita imediata de cache (`queryClient.invalidateQueries`) para refletir dados atualizados e evitar cliques duplos.
3. **Formulários e Validação Estrita**: Utilização obrigatória de **React Hook Form** integrado com schemas **Zod** para validação no lado do cliente (CPF/CNPJ, e-mail, formato monetário e de data, prevenção de valores negativos).
4. **Proxy do Backend para Serviços de Terceiros**: O frontend nunca deve se comunicar diretamente com APIs externas (como ViaCEP). O autocomplete de endereços deve ser feito via proxy implementado no backend.
5. **Separação de Responsabilidades**:
   - **Componentes de Apresentação**: Apenas renderização e binding de eventos. Sem lógica de negócio.
   - **Hooks Customizados**: Toda lógica de dados (fetch, mutação, cálculos derivados) deve residir em hooks customizados.
   - **Services**: Funções puras de chamada à API, sem estado interno.

---

## 🔒 4. Segurança, LGPD & Compliance

1. **Gestão de Sessão Segura**: O JWT de autenticação é gerenciado exclusivamente via cookies HTTP seguros (`HttpOnly = true`, `SameSite = Strict`, `Secure = true` em produção). O frontend **NUNCA** deve persistir tokens no LocalStorage.
2. **F5-Safety (ADR 007)**: Ao recarregar a página, o `AuthContext` deve validar a sessão ativamente via `GET /api/login/me` em vez de ler tokens do `localStorage`.
3. **RBAC (Role-Based Access Control)**: Rotas protegidas devem verificar o perfil do usuário (`ROLE_OPERADOR`, `ROLE_ADMIN`, `ROLE_DIRETOR`) antes de renderizar. Acesso negado redireciona para `/dashboard`.
4. **Prevenção de XSS**: Sanitização de inputs via schemas Zod. Nunca usar `dangerouslySetInnerHTML` sem sanitização explícita.
5. **LGPD**: Dados sensíveis do consorciado (CPF, endereço, renda) nunca devem aparecer em `console.log`, `console.error` ou logs de desenvolvimento em produção.

---

## 🎨 5. Design System

1. **Tema Escuro HSL Harmônico**:
   - Background Principal: `#0F172A` (slate-900)
   - Background Card: `#1E293B` (slate-800)
   - Acento Primário: `#F59E0B` (amber-500)
   - Texto Principal: `#F1F5F9` (slate-100)
   - Texto Secundário: `#94A3B8` (slate-400)
2. **Tipografia**: Space Grotesk (headings) / Inter (body text).
3. **Estilização**: Tailwind CSS com tema escuro customizado.
4. **Acessibilidade WCAG AA**: Todos os componentes devem ter labels adequados, ARIA attributes, contraste mínimo 4.5:1 e navegação completa por teclado.

---

## 📐 6. Artefatos Obrigatórios por Capability

1. **Dupla de Artefatos Frontend**: Cada capability em `docs/specs/<capability>/` DEVE conter obrigatoriamente:
   - `ui-spec.md` — Telas, componentes, hooks, schemas Zod, estados (loading/error/empty), fluxo do usuário e critérios de aceitação de UI por REQ-ID.
   - `tasks.md` — Decomposição em tarefas com categorização `[FRONTEND]`/`[DESIGN]` e vínculo ao REQ-ID.
2. **Referência ao Backend**: Todo `ui-spec.md` deve referenciar explicitamente o `spec.md` e `api-contract.md` do backend via caminhos relativos.
3. **Gate de Implementação**: Nenhuma linha de código pode ser escrita para uma capability cujo `ui-spec.md` não esteja completo e com status mínimo `LOCKED`.
4. **Templates**: Novos artefatos devem seguir os templates em `docs/templates/`.
