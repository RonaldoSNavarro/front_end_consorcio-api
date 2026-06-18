# 📋 Especificação de UI — [Nome da Capability] ([capability])

*   **Status**: DRAFT
*   **Versão**: v1.0
*   **Spec Backend**: [spec.md](../../consorcio-api/docs/specs/[capability]/spec.md)
*   **API Contract**: [api-contract.md](../../consorcio-api/docs/specs/[capability]/api-contract.md)
*   **Última alteração**: [descrição] — origem: SPECIFY-UI inicial

---

## 🎯 Objetivo de UI
[Qual experiência de usuário esta capability entrega, em 2-3 linhas.]

---

## 🖥️ Telas e Componentes

### Página: [NomePage]
- **Rota**: `/[rota]`
- **Permissões**: ROLE_OPERADOR | ROLE_ADMIN
- **REQ-IDs cobertos**: REQ-[CAP]-001, REQ-[CAP]-002

#### Componentes

| Componente | Tipo | REQ-ID | Hook TanStack | Schema Zod |
|-----------|------|--------|--------------|-----------|
| [NomeForm] | Form | REQ-[CAP]-001 | use[Recurso]() | [recurso]Schema |
| [NomeTable] | Display | REQ-[CAP]-002 | use[Recurso]() | — |

#### Endpoints Consumidos

| Endpoint | Método | Hook | Ação |
|----------|--------|------|------|
| `/api/[recurso]` | GET | useQuery | Lista/detalhe |
| `/api/[recurso]` | POST | useMutation | Criação |

#### Estados

| Estado | Componente/Comportamento |
|--------|------------------------|
| Loading | Skeleton / Spinner |
| Error | Toast de erro + botão retry |
| Empty State | Mensagem informativa + CTA |
| Success (mutação) | Toast de sucesso + invalidação de cache |

---

## 🎯 Critérios de Aceitação de UI

### REQ-[CAP]-001 - AC-UI-1: [Título do Cenário de UI]
- **Given**: [estado da interface]
- **When**: [ação do usuário]
- **Then**: [resultado visual esperado]

### REQ-[CAP]-002 - AC-UI-1: [Título do Cenário de UI]
- **Given**: [...]
- **When**: [...]
- **Then**: [...]
