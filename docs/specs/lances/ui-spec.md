# 📋 Especificação de UI — Oferta de Lances (lances)

*   **Status**: DRAFT
*   **Versão**: v1.0
*   **Spec Backend**: [spec.md](../../../../consorcio-api/docs/specs/lances/spec.md)
*   **API Contract**: [api-contract.md](../../../../consorcio-api/docs/specs/lances/api-contract.md)
*   **Última alteração**: Criação inicial da especificação de UI — origem: SPECIFY-UI inicial

---

## 🎯 Objetivo de UI
Permitir ao operador cadastrar ofertas de lance (livre ou fixo) para cotas elegíveis durante a janela de captação da assembleia, com cálculo automático de valor para lances fixos, validação de elegibilidade em tempo real e gestão de amortização pós-contemplação.

---

## 🖥️ Telas e Componentes

### Página: AssembleiasPage (seção Lances)
- **Rota**: `/assembleias`
- **Permissões**: 🔒 Autenticado
- **REQ-IDs cobertos**: REQ-LAN-001, REQ-LAN-002, REQ-LAN-004
- **Arquivo existente**: `src/pages/AssembleiasPage.jsx`

#### Componentes

| Componente | Tipo | REQ-ID | Hook TanStack | Schema Zod |
|-----------|------|--------|--------------|-----------|
| Formulário de Lance | Form | REQ-LAN-001, REQ-LAN-002, REQ-LAN-004 | useMutation (criar lance) | lanceSchema |
| Seletor de Modalidade | Radio/Select | REQ-LAN-004 | — | — |
| Campo Valor (condicional) | Input | REQ-LAN-004 | — | — |
| Lista de Lances | Table | REQ-LAN-001 | useLances(assembleiaId) | — |

### Página: LancesPendentesPage (seção Amortização)
- **Rota**: `/lances-pendentes`
- **Permissões**: 🔒 Autenticado
- **REQ-IDs cobertos**: REQ-LAN-003
- **Arquivo existente**: `src/pages/LancesPendentesPage.jsx`

#### Componentes

| Componente | Tipo | REQ-ID | Hook TanStack | Schema Zod |
|-----------|------|--------|--------------|-----------|
| Lista de Lances Pendentes | Table | REQ-LAN-003 | useLancesPendentes() | — |
| Seletor de Amortização | Radio | REQ-LAN-003 | — | — |
| Botão Amortizar Redução Prazo | Action | REQ-LAN-003 | useMutation (redução prazo) | — |
| Botão Amortizar Diluição | Action | REQ-LAN-003 | useMutation (diluição) | — |

#### Endpoints Consumidos

| Endpoint | Método | Hook | Ação |
|----------|--------|------|------|
| `POST /api/lances` | POST | useMutation | Cadastrar lance |
| `POST /api/parcelas/cota/{cotaId}/lance/reducao-prazo` | POST | useMutation | Amortizar por redução de prazo |
| `POST /api/parcelas/cota/{cotaId}/lance/diluicao` | POST | useMutation | Amortizar por diluição |

#### Estados

| Estado | Componente/Comportamento |
|--------|------------------------|
| Loading (lances) | Skeleton na tabela de lances |
| Error (elegibilidade) | Toast "Cota inadimplente" ou "Assembleia fechada" (400) |
| Error (limite embutido) | Toast "Lance excede o limite de 30% do crédito" (422) |
| Modalidade FIXO | Campo valor auto-preenchido e desabilitado (readonly) |
| Modalidade LIVRE | Campo valor editável com validação de mínimo > 0 |
| Success (amortização) | Toast + invalidação de cache de parcelas |

---

## 🎯 Critérios de Aceitação de UI

### REQ-LAN-001 - AC-UI-1: Validação de Elegibilidade Visual
- **Given**: O operador seleciona uma cota com parcela atrasada para ofertar lance.
- **When**: O formulário é submetido.
- **Then**: O sistema exibe toast de erro "Cota inadimplente — não elegível para lance" e mantém o formulário.

### REQ-LAN-002 - AC-UI-1: Limite Visual de Lance Embutido
- **Given**: O operador seleciona tipo "EMBUTIDO" e digita valor acima do teto do grupo.
- **When**: O formulário é submetido.
- **Then**: O sistema exibe toast de erro "Valor excede o limite de lance embutido do grupo" (422).

### REQ-LAN-004 - AC-UI-1: Cálculo Automático no Lance Fixo
- **Given**: O operador seleciona modalidade "FIXO" no formulário de lance.
- **When**: A modalidade é selecionada.
- **Then**: O campo de valor é preenchido automaticamente com `percentualLanceFixo × valorCredito` e fica desabilitado (readonly) para edição.

### REQ-LAN-003 - AC-UI-1: Seleção de Tipo de Amortização
- **Given**: O operador está na página de lances pendentes com um lance pago.
- **When**: O operador seleciona "Redução de Prazo" e clica em "Amortizar".
- **Then**: O sistema executa a amortização, exibe toast de sucesso e atualiza a lista de parcelas da cota.
