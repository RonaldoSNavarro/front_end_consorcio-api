# 📋 Especificação de UI — Compliance e Listas Restritivas (compliance)

*   **Status**: LOCKED
*   **Versão**: v1.0
*   **Spec Backend**: [spec.md](../../consorcio-api/docs/specs/compliance/spec.md)
*   **API Contract**: [api-contract.md](../../consorcio-api/docs/specs/compliance/api-contract.md)
*   **Última alteração**: Criação da especificação de UI para conformidade com a Circular BCB 3.978/2020. — origem: SPECIFY-UI inicial

---

## 🎯 Objetivo de UI
Esta capability fornece aos analistas de compliance e administradores um painel dedicado para monitoramento, deliberação e sincronização manual das bases de dados restritivas (ONU, OFAC e PEP), além de permitir o cadastro de renda e patrimônio estimado na ficha de clientes.

---

## 🖥️ Telas e Componentes

### Página: CompliancePainelPage
- **Rota**: `/compliance/alertas`
- **Permissões**: ROLE_COMPLIANCE | ROLE_ADMIN
- **REQ-IDs cobertos**: REQ-COMP-002, REQ-COMP-005

#### Componentes

| Componente | Tipo | REQ-ID | Hook TanStack | Schema Zod |
|-----------|------|--------|--------------|-----------|
| `CompliancePainelPage` | Página | REQ-COMP-005 | `api.compliance.listarAlertas` | — |
| `DeliberacaoModal` | Form | REQ-COMP-005 | `api.compliance.deliberarAlerta` | Validação local (justificativa obrigatória, min: 10 chars) |
| Botão "Sincronizar" | Ação | REQ-COMP-002 | `api.compliance.sincronizar` | — |

#### Endpoints Consumidos

| Endpoint | Método | Hook | Ação |
|----------|--------|------|------|
| `/api/compliance/alertas` | GET | useQuery | Listar alertas (filtros: status, origemLista) |
| `/api/compliance/alertas/{alertaId}/deliberar` | PUT | useMutation | Deliberar alerta (novoStatus, justificativa) |
| `/api/compliance/sincronizar` | POST | useMutation | Sincronizar listas restritivas em background |

#### Estados

| Estado | Componente/Comportamento |
|--------|------------------------|
| Loading | Renderiza skeletons pulsandos na tabela de alertas |
| Error | Alerta em banner vermelho informando falha de comunicação |
| Empty State | Ícone de check verde sinalizando que nenhum alerta está pendente |
| Success (deliberação) | Invalidação do cache `['alertasCompliance']` e toast de sucesso |
| Success (sincronização) | Toast de sucesso indicando início da ingestão em background |

---

### Componente: ClienteForm (Campos de Renda e Patrimônio)
- **Componente**: `ClienteForm.jsx`
- **Permissões**: ROLE_ATENDIMENTO | ROLE_ADMIN | ROLE_COMPLIANCE
- **REQ-IDs cobertos**: REQ-COMP-003, REQ-COMP-004

#### Novos Campos Formulário

| Campo | Tipo Input | Validação Zod | Default |
|-------|------------|---------------|---------|
| `patrimonioEstimado` | Number | `z.coerce.number().min(0)` | `150000` (Cadastro) / `0` (Mock/Fallback) |
| `rendaMensalDeclarada` | Number | `z.coerce.number().min(0)` | `5000` (Cadastro) / `0` (Mock/Fallback) |
| `nivelRisco` | Select | `z.enum(['BAIXO', 'MEDIO', 'ALTO'])` | `'MEDIO'` |

---

## 🎯 Critérios de Aceitação de UI

### REQ-COMP-002 - AC-UI-1: Disparar Sincronização Manual
- **Given**: Usuário autenticado com perfil `ROLE_ADMIN` ou `ROLE_COMPLIANCE` na tela de Compliance.
- **When**: Clica no botão "Sincronizar Bases".
- **Then**: O botão muda para estado de loading (ícone girando/desabilitado) e exibe um Toast de sucesso: `"Sincronização de listas restritivas iniciada em background."`.

### REQ-COMP-005 - AC-UI-1: Filtros de Alertas
- **Given**: Tela de Painel de Compliance com tabela de alertas carregada.
- **When**: Seleciona o filtro de status "Confirmados" e origem "OFAC".
- **Then**: Atualiza a tabela chamando a API com parâmetros correspondentes e exibindo apenas os alertas em conformidade com o filtro.

### REQ-COMP-005 - AC-UI-2: Deliberar Alerta de Suspeita
- **Given**: Modal de Deliberação aberto para um Alerta Pendente.
- **When**: Preenche justificativa de 5 caracteres e tenta submeter.
- **Then**: O formulário é impedido de enviar e exibe erro: `"Mínimo de 10 caracteres."`.
- **When**: Seleciona "FALSO POSITIVO", insere justificativa válida com mais de 10 caracteres e envia.
- **Then**: Fecha o modal, envia `PUT` para a API, exibe Toast `"Alerta deliberado com sucesso."` e recarrega os dados limpando o item da lista pendente.
