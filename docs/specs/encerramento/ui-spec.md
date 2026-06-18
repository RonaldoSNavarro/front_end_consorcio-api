# 📋 Especificação de UI — Reajustes e Encerramento (encerramento)

*   **Status**: DRAFT
*   **Versão**: v1.0
*   **Spec Backend**: [spec.md](../../../../consorcio-api/docs/specs/encerramento/spec.md)
*   **API Contract**: [api-contract.md](../../../../consorcio-api/docs/specs/encerramento/api-contract.md)
*   **Última alteração**: Criação inicial da especificação de UI — origem: SPECIFY-UI inicial

---

## 🎯 Objetivo de UI
Permitir ao operador reajustar o valor do bem de referência de um grupo (com recalculação automática de parcelas), e ao administrador encerrar um grupo contabilmente com baixa de inadimplência para PDD e transferência de RNP, exibindo relatório consolidado pós-encerramento.

---

## 🖥️ Telas e Componentes

### Página: GruposPage (ação reajuste)
- **Rota**: `/grupos`
- **Permissões**: 🔒 Autenticado
- **REQ-IDs cobertos**: REQ-ENC-001
- **Arquivo existente**: `src/pages/GruposPage.jsx`

#### Componentes

| Componente | Tipo | REQ-ID | Hook TanStack | Schema Zod |
|-----------|------|--------|--------------|-----------|
| Botão Reajustar | Action | REQ-ENC-001 | useMutation (reajuste) | reajusteSchema |
| Dialog de Reajuste | Form | REQ-ENC-001 | — | reajusteSchema |

### Página: EncerrarGrupoPage
- **Rota**: `/grupos/:id/encerrar`
- **Permissões**: 🔒 ADMIN
- **REQ-IDs cobertos**: REQ-ENC-002, REQ-ENC-003
- **Arquivo existente**: `src/pages/EncerrarGrupoPage.jsx`

#### Componentes

| Componente | Tipo | REQ-ID | Hook TanStack | Schema Zod |
|-----------|------|--------|--------------|-----------|
| Resumo Financeiro do Grupo | Display | REQ-ENC-002 | useFinanceiro(grupoId) | — |
| Botão Encerrar Grupo | Action | REQ-ENC-002, REQ-ENC-003 | useMutation (encerrar) | — |
| Relatório de Encerramento | Display | REQ-ENC-002, REQ-ENC-003 | — | — |
| ConfirmDialog | Dialog | — | — | — |

#### Endpoints Consumidos

| Endpoint | Método | Hook | Ação |
|----------|--------|------|------|
| `PUT /api/grupos/{id}/reajuste` | PUT | useMutation | Reajustar valor do crédito |
| `POST /api/grupos/{id}/encerrar` | POST | useMutation | Encerrar grupo contabilmente |
| `GET /api/grupos/{id}/financeiro` | GET | useQuery | Relatório financeiro consolidado |

#### Estados

| Estado | Componente/Comportamento |
|--------|------------------------|
| Loading (financeiro) | Skeleton nos cards de resumo |
| EM_ANDAMENTO | Botão "Encerrar" habilitado + resumo financeiro |
| ENCERRADO | Badge "Encerrado" + relatório final exibido |
| Error (já encerrado) | Toast "Grupo já encerrado" (422) |
| Success (reajuste) | Toast "Valor do crédito atualizado para R$ X.XXX,XX" + invalidação |
| Success (encerramento) | Relatório: parcelas baixadas, PDD total, RNP transferido |
| Dialog confirmação | ConfirmDialog com alerta "Esta ação é irreversível" |

---

## 🎯 Critérios de Aceitação de UI

### REQ-ENC-001 - AC-UI-1: Reajuste do Valor do Crédito
- **Given**: O operador está na página de grupos e seleciona um grupo EM_ANDAMENTO.
- **When**: O operador clica em "Reajustar", informa o novo valor e confirma.
- **Then**: O sistema atualiza o valor do crédito do grupo, recalcula todas as parcelas pendentes, e exibe toast de sucesso com o novo valor formatado em moeda.

### REQ-ENC-002 - AC-UI-1: Encerramento de Grupo com Relatório
- **Given**: O administrador está na página de encerramento de um grupo EM_ANDAMENTO.
- **When**: O administrador clica em "Encerrar Grupo" e confirma no dialog.
- **Then**: O sistema encerra o grupo e exibe relatório: total de parcelas baixadas para PDD, valor total provisionado em PDD, valor transferido para RNP, e data de encerramento.

### REQ-ENC-003 - AC-UI-1: Exibição de Recursos Não Procurados (RNP)
- **Given**: O grupo possui cotas canceladas com reembolso pendente.
- **When**: O grupo é encerrado.
- **Then**: O relatório de encerramento exibe a linha "Recursos Não Procurados (RNP)" com o valor total transferido.

### REQ-ENC-002 - AC-UI-2: RBAC — Apenas ADMIN Pode Encerrar
- **Given**: Um operador com perfil `ROLE_OPERADOR` tenta acessar `/grupos/:id/encerrar`.
- **When**: O ProtectedRoute verifica o perfil.
- **Then**: O operador é redirecionado para `/dashboard` sem acesso à tela de encerramento.
