# 📋 Especificação de UI — Autenticação e Sessão (auth)

*   **Status**: DRAFT
*   **Versão**: v1.0
*   **Spec Backend**: [spec.md](../../../../consorcio-api/docs/specs/auth/spec.md)
*   **API Contract**: [api-contract.md](../../../../consorcio-api/docs/specs/auth/api-contract.md)
*   **Última alteração**: Criação inicial da especificação de UI — origem: SPECIFY-UI inicial

---

## 🎯 Objetivo de UI
Fornecer ao operador do backoffice uma experiência de login segura, fluida e resiliente a recarregamentos de página (F5), com feedback visual claro para falhas de autenticação e transição suave para o dashboard pós-login.

---

## 🖥️ Telas e Componentes

### Página: LoginPage
- **Rota**: `/login`
- **Permissões**: 🔓 Público
- **REQ-IDs cobertos**: REQ-AUTH-001, REQ-AUTH-002
- **Arquivo existente**: `src/pages/LoginPage.jsx`

#### Componentes

| Componente | Tipo | REQ-ID | Hook TanStack | Schema Zod |
|-----------|------|--------|--------------|-----------|
| LoginForm (inline) | Form | REQ-AUTH-001 | useMutation (login) | loginSchema |
| AuthContext | Provider | REQ-AUTH-002 | — | — |

#### Endpoints Consumidos

| Endpoint | Método | Hook | Ação |
|----------|--------|------|------|
| `POST /api/login` | POST | useMutation | Autenticar operador |
| `POST /api/login/logout` | POST | useMutation | Encerrar sessão |
| `GET /api/login/me` | GET | useQuery | Revalidar sessão (F5-safety) |

#### Estados

| Estado | Componente/Comportamento |
|--------|------------------------|
| Loading (login) | Botão com spinner + disabled |
| Error (401) | Toast de erro "Credenciais inválidas" |
| Success | Redirect para `/dashboard` |
| Loading (F5 — /me) | Tela de splash/skeleton antes de resolver sessão |
| Error (/me — 401) | Redirect silencioso para `/login` |

---

## 🎯 Critérios de Aceitação de UI

### REQ-AUTH-001 - AC-UI-1: Formulário de Login com Validação
- **Given**: O operador está na tela `/login`.
- **When**: O operador tenta submeter o formulário sem preencher e-mail ou senha.
- **Then**: O formulário exibe mensagens de validação inline (Zod) sem disparar requisição ao backend.

### REQ-AUTH-001 - AC-UI-2: Feedback Visual de Autenticação Bem-Sucedida
- **Given**: O operador preencheu credenciais válidas.
- **When**: O operador clica em "Entrar".
- **Then**: O botão exibe um spinner (loading), a requisição é enviada ao `POST /api/login`, e ao receber 200 o operador é redirecionado para `/dashboard`.

### REQ-AUTH-001 - AC-UI-3: Feedback Visual de Falha de Autenticação
- **Given**: O operador preencheu credenciais inválidas.
- **When**: O operador clica em "Entrar".
- **Then**: O sistema exibe um toast de erro com a mensagem "Credenciais inválidas" e mantém o operador na tela de login.

### REQ-AUTH-002 - AC-UI-1: Revalidação Transparente ao Recarregar (F5)
- **Given**: O operador está autenticado com sessão ativa (cookie HttpOnly presente).
- **When**: O operador recarrega a página (F5) em qualquer rota protegida.
- **Then**: O `AuthContext` exibe um estado de loading, faz `GET /api/login/me`, e ao receber 200 mantém o operador logado na rota atual sem redirecionamento.

### REQ-AUTH-002 - AC-UI-2: Redirect ao Login com Sessão Expirada
- **Given**: O operador está em uma rota protegida, mas o cookie expirou.
- **When**: O operador recarrega a página (F5).
- **Then**: O `AuthContext` faz `GET /api/login/me`, recebe 401, e redireciona para `/login`.
