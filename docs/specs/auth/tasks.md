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
- [ ] Migrar validação para schema Zod `loginSchema` (e-mail obrigatório, senha mínimo 6 chars)
- [ ] Implementar hook `useLogin()` (TanStack useMutation para `POST /api/login`)
- [ ] Implementar estados: loading (spinner no botão), error (toast 401), success (redirect)
- [ ] Implementar hook `useLogout()` (TanStack useMutation para `POST /api/login/logout`)

### [FRONTEND] REQ-AUTH-002: F5-Safety (Revalidação de Sessão)
- [ ] Refatorar `AuthContext.jsx` para usar `GET /api/login/me` em vez de `localStorage`
- [ ] Criar hook `useSessionValidation()` (TanStack useQuery para `/api/login/me`)
- [ ] Implementar estado de loading global (splash screen) enquanto `/me` não retorna
- [ ] Remover referências a `localStorage.getItem('consorcio_api_token')`
- [ ] Implementar redirect para `/login` quando `/me` retorna 401

### [DESIGN] REQ-AUTH-001: Design da Tela de Login
- [x] Prototipar tela de login com tema escuro
- [ ] Definir estados visuais: normal, loading, error, success
- [ ] Validar contraste WCAG AA dos campos de formulário
