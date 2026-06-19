# 📋 Decomposição de Tarefas Frontend — Autenticação e Sessão (auth)

*   **Capability**: auth
*   **UI Spec de referência**: [ui-spec.md](ui-spec.md)
*   **API Contract Backend**: [api-contract.md](../../../../consorcio-api/docs/specs/auth/api-contract.md)
*   **Total de tarefas**: 6
*   **REQ-IDs cobertos**: 2/2

---

## Legenda

- `[ ]` — Pendente
- `[/]` — Em progresso
- `[x]` — Concluída

---

## Tarefas

### [FRONTEND] REQ-AUTH-001: Formulário de Login
- [x] Criar página `LoginPage.jsx` com formulário de e-mail e senha
- [x] Migrar validação para schema Zod `loginSchema` (e-mail obrigatório, senha mínimo 6 chars)
- [x] Implementar hook `useLogin()` (TanStack useMutation para `POST /api/login`)
- [x] Implementar estados: loading (spinner no botão), error (toast 401), success (redirect)
- [x] Implementar hook `useLogout()` (TanStack useMutation para `POST /api/login/logout`)

### [FRONTEND] REQ-AUTH-002: F5-Safety (Revalidação de Sessão)
- [x] Refatorar `AuthContext.jsx` para usar `GET /api/login/me` em vez de `localStorage`
- [x] Criar hook `useSessionValidation()` (TanStack useQuery para `/api/login/me`)
- [x] Implementar estado de loading global (splash screen) enquanto `/me` não retorna
- [x] Remover referências a `localStorage.getItem('consorcio_api_token')`
- [x] Implementar redirect para `/login` quando `/me` retorna 401

### [DESIGN] REQ-AUTH-001: Design da Tela de Login
- [x] Prototipar tela de login com tema escuro
- [x] Definir estados visuais: normal, loading, error, success
- [x] Validar contraste WCAG AA dos campos de formulário
