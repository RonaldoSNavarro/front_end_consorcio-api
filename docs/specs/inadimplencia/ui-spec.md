# 📋 Especificação de UI — Mora e Inadimplência (inadimplencia)

*   **Status**: DRAFT
*   **Versão**: v1.0
*   **Spec Backend**: [spec.md](../../../../consorcio-api/docs/specs/inadimplencia/spec.md)
*   **API Contract**: [api-contract.md](../../../../consorcio-api/docs/specs/inadimplencia/api-contract.md)
*   **Última alteração**: Criação inicial da especificação de UI — origem: SPECIFY-UI inicial

---

## 🎯 Objetivo de UI
Permitir ao operador visualizar o status de inadimplência de uma cota (cálculo volátil sem persistência), registrar pagamentos de parcelas com cálculo automático de multa e juros pro rata die, e efetuar estornos com feedback contábil.

---

## 🖥️ Telas e Componentes

### Página: FinanceiroPage (seção Pagamento/Inadimplência)
- **Rota**: `/financeiro`
- **Permissões**: 🔒 Autenticado
- **REQ-IDs cobertos**: REQ-INA-001, REQ-INA-002, REQ-INA-003
- **Arquivo existente**: `src/pages/FinanceiroPage.jsx`

#### Componentes

| Componente | Tipo | REQ-ID | Hook TanStack | Schema Zod |
|-----------|------|--------|--------------|-----------|
| Painel de Inadimplência | Display | REQ-INA-003 | useInadimplencia(cotaId) | — |
| Botão Pagar Parcela | Action | REQ-INA-001 | useMutation (pagar) | pagamentoSchema |
| Botão Estornar | Action | REQ-INA-002 | useMutation (estornar) | — |
| Detalhe de Encargos | Display | REQ-INA-001 | — | — |

### Página: CotasPage (badge inadimplência)
- **Rota**: `/cotas`
- **Permissões**: 🔒 Autenticado
- **REQ-IDs cobertos**: REQ-INA-003
- **Arquivo existente**: `src/pages/CotasPage.jsx`

#### Endpoints Consumidos

| Endpoint | Método | Hook | Ação |
|----------|--------|------|------|
| `PUT /api/parcelas/{id}/pagar` | PUT | useMutation | Registrar pagamento |
| `GET /api/cotas/{id}/inadimplencia` | GET | useQuery | Calcular inadimplência simulada |
| `POST /api/parcelas/{id}/estornar` | POST | useMutation | Estornar pagamento |

#### Estados

| Estado | Componente/Comportamento |
|--------|------------------------|
| Adimplente | Badge verde "Adimplente" na lista de cotas |
| Inadimplente | Badge vermelho "Inadimplente (N parcelas)" na lista de cotas |
| Loading (cálculo) | Spinner no painel de inadimplência |
| Pagamento em dia | Toast "Parcela paga — sem encargos" |
| Pagamento com atraso | Exibir detalhamento: multa (2%) + juros pro rata die |
| Success (estorno) | Toast "Estorno realizado" + status volta a PENDENTE |

---

## 🎯 Critérios de Aceitação de UI

### REQ-INA-001 - AC-UI-1: Exibição de Encargos no Pagamento Atrasado
- **Given**: O operador está pagando uma parcela vencida há 10 dias.
- **When**: O operador clica em "Pagar" informando a data efetiva de pagamento.
- **Then**: O sistema exibe o detalhamento dos encargos (multa 2% + juros pro rata die) no toast de sucesso e atualiza a tabela de parcelas.

### REQ-INA-003 - AC-UI-1: Painel de Inadimplência Volátil
- **Given**: O operador selecionou uma cota no painel financeiro.
- **When**: O painel de inadimplência é carregado.
- **Then**: O sistema exibe: quantidade de parcelas atrasadas, valor original atrasado, multa acumulada, juros acumulados e saldo devedor total — tudo calculado em tempo real sem persistência.

### REQ-INA-002 - AC-UI-1: Estorno de Pagamento
- **Given**: O operador deseja estornar um pagamento já efetuado.
- **When**: O operador clica em "Estornar" na parcela PAGA.
- **Then**: O status da parcela volta a PENDENTE, o cache é invalidado e o sistema exibe toast de confirmação.
