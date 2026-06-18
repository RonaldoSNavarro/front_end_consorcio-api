# 📋 Especificação de UI — Apuração e Contemplações (contemplacao)

*   **Status**: DRAFT
*   **Versão**: v1.0
*   **Spec Backend**: [spec.md](../../../../consorcio-api/docs/specs/contemplacao/spec.md)
*   **API Contract**: [api-contract.md](../../../../consorcio-api/docs/specs/contemplacao/api-contract.md)
*   **Última alteração**: Criação inicial da especificação de UI — origem: SPECIFY-UI inicial

---

## 🎯 Objetivo de UI
Exibir ao operador o resultado da apuração da assembleia (vencedores por lance livre, fixo ou sorteio), gerenciar o fluxo de integralização de lances pendentes, e permitir o registro de pagamento de bem com feedback visual claro por status de contemplação.

---

## 🖥️ Telas e Componentes

### Página: AssembleiasPage (seção Resultado)
- **Rota**: `/assembleias`
- **Permissões**: 🔒 Autenticado
- **REQ-IDs cobertos**: REQ-CON-001, REQ-CON-002, REQ-CON-005, REQ-CON-006
- **Arquivo existente**: `src/pages/AssembleiasPage.jsx`

#### Componentes

| Componente | Tipo | REQ-ID | Hook TanStack | Schema Zod |
|-----------|------|--------|--------------|-----------|
| Resultado Apuração | Display | REQ-CON-001, REQ-CON-006 | useContemplações(assembleiaId) | — |
| Badge Tipo Contemplação | Badge | REQ-CON-005 | — | — |
| Alerta Saldo Insuficiente | Alert | REQ-CON-002 | — | — |

### Página: LancesPendentesPage (seção Integralização)
- **Rota**: `/lances-pendentes`
- **Permissões**: 🔒 Autenticado
- **REQ-IDs cobertos**: REQ-CON-003, REQ-CON-004, REQ-CON-006
- **Arquivo existente**: `src/pages/LancesPendentesPage.jsx`

#### Componentes

| Componente | Tipo | REQ-ID | Hook TanStack | Schema Zod |
|-----------|------|--------|--------------|-----------|
| Tabela de Contemplações Pendentes | Table | REQ-CON-003, REQ-CON-006 | useContemplações() | — |
| Botão Integralizar Lance | Action | REQ-CON-003 | useMutation (integralizar) | — |
| Botão Pagamento do Bem | Action | REQ-CON-004 | useMutation (pagamento) | — |
| Badge Status Contemplação | Badge | REQ-CON-003 | — | — |

#### Endpoints Consumidos

| Endpoint | Método | Hook | Ação |
|----------|--------|------|------|
| `POST /api/contemplacoes` | POST | useMutation | Registrar contemplação (apuração) |
| `GET /api/contemplacoes/assembleia/{assembleiaId}` | GET | useQuery | Listar contemplações |
| `POST /api/contemplacoes/lances/{id}/integralizar` | POST | useMutation | Confirmar integralização |
| `POST /api/contemplacoes/{id}/pagamento-bem` | POST | useMutation | Registrar desembolso do crédito |

#### Estados

| Estado | Componente/Comportamento |
|--------|------------------------|
| PENDENTE_INTEGRALIZACAO | Badge laranja "Aguardando Pagamento do Lance" |
| AGUARDANDO_ANALISE | Badge amarelo "Em Análise" |
| APROVADO | Badge verde "Crédito Liberado" |
| Saldo Insuficiente (422) | Alert vermelho "Saldo do Fundo Comum insuficiente para contemplação" |
| Success (integralização) | Toast + badge atualizado + invalidação de cache |

---

## 🎯 Critérios de Aceitação de UI

### REQ-CON-001 - AC-UI-1: Exibição do Resultado da Apuração
- **Given**: A apuração da assembleia foi executada.
- **When**: O operador visualiza o resultado.
- **Then**: A tabela exibe as cotas contempladas com colunas: Cota, Tipo (SORTEIO/LANCE_LIVRE/LANCE_FIXO), Valor do Lance, Crédito Liberado, Status, e efeito confetti para o vencedor.

### REQ-CON-002 - AC-UI-1: Feedback Visual de Saldo Insuficiente
- **Given**: O saldo do Fundo Comum do grupo é insuficiente para a contemplação.
- **When**: A apuração retorna erro 422.
- **Then**: O sistema exibe alert vermelho "Saldo insuficiente no Fundo Comum" sem alterar o status das cotas.

### REQ-CON-003 - AC-UI-1: Fluxo de Integralização Visual
- **Given**: Uma contemplação está no status `PENDENTE_INTEGRALIZACAO`.
- **When**: O operador clica em "Confirmar Pagamento do Lance".
- **Then**: O status transita para `AGUARDANDO_ANALISE`, o badge muda de laranja para amarelo, e o cache é invalidado.

### REQ-CON-006 - AC-UI-1: Exibição Segregada de Lance Fixo vs Livre
- **Given**: A assembleia possui lances livres e fixos.
- **When**: O resultado da apuração é exibido.
- **Then**: Os lances são agrupados visualmente por modalidade (LIVRE / FIXO), com badges distintos para cada tipo de contemplação.
