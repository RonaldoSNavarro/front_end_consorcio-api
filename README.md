# Consórcio Admin - Frontend Financeiro 💸

Este é o módulo Frontend de administração do **Consórcio API**, responsável por se conectar com nosso motor financeiro Spring Boot e administrar grupos, cotas, parcelas e apuração de assembleias de forma visual e segura.

## 🏗️ Arquitetura e Tecnologias

Foi realizada uma refatoração em larga escala que transformou a aplicação base em um ecossistema modular escalável, projetado para suportar altos volumes de dados com confiabilidade.

*   **React 18**: Construção da interface com hooks.
*   **Vite**: Build tool super veloz de última geração.
*   **React Router DOM**: Gestão de SPA (Single Page Application) e bloqueio de rotas protegidas (Deep Linking e Auth).
*   **TanStack Query (React Query)**: Responsável absoluto pelo Server State, paginações, cache em memória, e deduplicação de requisições pesadas (ex: Relatórios Financeiros Contábeis).
*   **Zod & React Hook Form**: Criação de formulários não-controlados super performáticos que barram strings maliciosas e formatos inválidos de CPFs ou Moedas no client-side (antes mesmo de enviar a rede).
*   **ViaCEP Integrado**: Buscador que aciona o proxy do nosso backend para não expor tokens e preenche magicamente a árvore de endereços.

## 🛡️ Validações Estritas (Compliance BCB)
Nossa malha de formulários (`src/components/forms/`) não permite lixo contábil:
- **ClienteForm**: Trava CPFs inválidos (apenas 11 ou 14 dígitos), rejeita patrimônios negativos.
- **GrupoForm**: Bloqueia crédito inicial abaixo de R$ 1.000, e amarra as taxas e prazos.
- **CotaForm**: Requer cliente mapeado e grupo financeiro com verificação na árvore relacional de dependência de chave estrangeira antes de chegar à API.

## 📂 Estrutura de Diretórios

```text
src/
 ┣ components/
 ┃ ┣ forms/       # (ClienteForm, GrupoForm, etc) Validações Zod
 ┃ ┣ layout/      # Layout base (Sidebar, ProtectedRoute)
 ┃ ┗ ui/          # Componentes visuais puramente apresentacionais (Icons, Toasts)
 ┣ context/       # AuthContext (JWT) e ToastContext
 ┣ pages/         # Telas mapeadas nas Rotas (Dashboard, Clientes, Financeiro, etc.)
 ┣ services/      # Isolamento da conexão com o Backend Spring Boot (api.js)
 ┣ App.jsx        # Ponto de entrada (Router Injector)
 ┗ main.jsx       # Ponto de montagem no DOM
```

## 🚀 Como Executar

O frontend depende do backend Spring Boot estar rodando na porta 8080 para a integração ao vivo. No entanto, o `api.js` possui um detector inteligente: se o Spring Boot cair, o frontend entrará magicamente no **Modo Simulado (Local Storage)** para evitar que o operador trave.

1. Instale todas as dependências (`react-query`, `zod`, etc):
```bash
npm install
```

2. Suba o servidor de desenvolvimento Vite (geralmente porta 5173):
```bash
npm run dev
```

## 🔒 Segurança

Todo o fluxo segue orientações do Banco Central e as requisições HTTPS injetam o cookie HttpOnly interceptado pelo `api.js`. As visualizações de telas são fortemente bloqueadas pelo `<ProtectedRoute>` sem evasão de CSRF.

## 🧪 Testes E2E com Agente de Automação (Playwright)

A aplicação possui um script E2E (`e2e_agent.cjs`) que simula a operação completa de um administrador/operador no navegador visível (headed Chrome):

### Pré-requisitos:
* Google Chrome instalado no Windows.
* Banco de dados PostgreSQL rodando na porta 5432 (para injeção e depuração de saldos de capital).
* Backend e Frontend ativos nas portas 8080 e 5173, respectivamente.

### Execução:
Para iniciar os testes automatizados, execute o comando na raiz do frontend:
```bash
node e2e_agent.cjs
```
As evidências visuais de cada cenário de teste e o arquivo consolidado de relatório `relatorio_teste_e2e.md` serão gerados no final do processo.

