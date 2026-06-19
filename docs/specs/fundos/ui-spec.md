# 📋 Especificação de UI — Composição de Fundos e Parcelas (fundos)

*   **Status**: IMPLEMENTED v1.0
*   **Versão**: v1.0
*   **Spec Backend**: [spec.md](../../../../consorcio-api/docs/specs/fundos/spec.md)
*   **API Contract**: [api-contract.md](../../../../consorcio-api/docs/specs/fundos/api-contract.md)
*   **Última alteração**: Criação inicial da especificação de UI — origem: SPECIFY-UI inicial

---

## 🎯 Objetivo de UI
Exibir ao operador o cronograma de parcelas por cota, com detalhamento dos componentes de cada parcela (Fundo Comum, Taxa de Administração, Fundo de Reserva, Seguro), e permitir a geração de novas parcelas com validação estrita dos valores.

---

## 🖥️ Telas e Componentes

### Página: FinanceiroPage (seção Parcelas)
- **Rota**: `/financeiro`
- **Permissões**: 🔒 Autenticado
- **REQ-IDs cobertos**: REQ-FUN-001, REQ-FUN-002, REQ-FUN-003
- **Arquivo existente**: `src/pages/FinanceiroPage.jsx`

#### Componentes

| Componente | Tipo | REQ-ID | Hook TanStack | Schema Zod |
|-----------|------|--------|--------------|-----------|
| Seletor de Cota | Select | — | useCotas() | — |
| Tabela de Parcelas | Table | REQ-FUN-001 | useParcelas(cotaId) | — |
| Formulário Nova Parcela | Form | REQ-FUN-001, REQ-FUN-002 | useMutation (criar parcela) | parcelaSchema |
| Resumo Financeiro | Display | REQ-FUN-003 | useFinanceiro(grupoId) | — |

#### Endpoints Consumidos

| Endpoint | Método | Hook | Ação |
|----------|--------|------|------|
| `POST /api/parcelas` | POST | useMutation | Gerar parcela |
| `GET /api/parcelas/cota/{cotaId}` | GET | useQuery | Listar parcelas da cota |

#### Estados

| Estado | Componente/Comportamento |
|--------|------------------------|
| Loading | Skeleton na tabela de parcelas |
| Error (criação) | Toast com mensagem de validação (400) |
| Empty State | "Nenhuma parcela gerada para esta cota" |
| Success | Toast + invalidação de cache + nova linha na tabela |

---

## 🎯 Critérios de Aceitação de UI

### REQ-FUN-001 - AC-UI-1: Visualização do Cronograma de Parcelas
- **Given**: O operador selecionou uma cota no seletor.
- **When**: A cota é selecionada.
- **Then**: A tabela exibe todas as parcelas com colunas: #, Fundo Comum, Taxa Admin, Fundo Reserva, Seguro, Total, Vencimento, Status, e badge colorido por status (PENDENTE=amarelo, PAGA=verde, ATRASADA=vermelho).

### REQ-FUN-002 - AC-UI-1: Validação de Consistência na Criação
- **Given**: O operador está preenchendo o formulário de nova parcela.
- **When**: O operador insere um valor negativo para qualquer componente.
- **Then**: O schema Zod bloqueia a submissão exibindo mensagem inline "Valor deve ser positivo".
