# 📋 Especificação de UI — Seguros (seguros)

*   **Status**: DRAFT
*   **Versão**: v1.0
*   **Spec Backend**: [spec.md](../../../../consorcio-api/docs/specs/seguros/spec.md)
*   **API Contract**: [api-contract.md](../../../../consorcio-api/docs/specs/seguros/api-contract.md)
*   **Última alteração**: Criação inicial da especificação de UI — origem: SPECIFY-UI inicial

---

## 🎯 Objetivo de UI
Exibir ao operador o componente de seguro como parte integrante da parcela mensal, sem tela dedicada. O valor do seguro é um campo no formulário de criação de parcela e uma coluna na tabela de parcelas.

---

## 🖥️ Telas e Componentes

> **Nota arquitetural**: A capability de Seguros não possui tela dedicada. O seguro é um componente integrado na parcela, exibido na `FinanceiroPage` (capability `fundos`).

### Página: FinanceiroPage (campo integrado)
- **Rota**: `/financeiro`
- **Permissões**: 🔒 Autenticado
- **REQ-IDs cobertos**: REQ-SEG-001, REQ-SEG-002
- **Arquivo existente**: `src/pages/FinanceiroPage.jsx`

#### Componentes

| Componente | Tipo | REQ-ID | Hook TanStack | Schema Zod |
|-----------|------|--------|--------------|-----------|
| Campo Valor Seguro (no form de parcela) | Input | REQ-SEG-001 | — (parte do useMutation de parcela) | parcelaSchema.valorSeguro |
| Coluna Seguro (na tabela de parcelas) | Column | REQ-SEG-001 | — (parte do useQuery de parcelas) | — |

#### Endpoints Consumidos

| Endpoint | Método | Relação |
|----------|--------|---------|
| `POST /api/parcelas` | POST | Campo `valorSeguro` no request |
| `PUT /api/parcelas/{id}/pagar` | PUT | Repasse contábil automático (backend) |
| `GET /api/parcelas/cota/{cotaId}` | GET | Coluna `valorSeguro` no response |

#### Estados

| Estado | Componente/Comportamento |
|--------|------------------------|
| Validação | Zod: `valorSeguro` ≥ 0 (pode ser zero se não há seguro) |

---

## 🎯 Critérios de Aceitação de UI

### REQ-SEG-001 - AC-UI-1: Exibição do Componente de Seguro na Parcela
- **Given**: O operador está visualizando o cronograma de parcelas de uma cota.
- **When**: A tabela é carregada.
- **Then**: Cada parcela exibe o valor do seguro em uma coluna dedicada "Seguro", e o valor total da parcela inclui o componente de seguro.

### REQ-SEG-001 - AC-UI-2: Validação do Valor de Seguro
- **Given**: O operador está criando uma nova parcela.
- **When**: O operador insere um valor negativo no campo "Seguro".
- **Then**: O schema Zod bloqueia a submissão exibindo "Valor de seguro não pode ser negativo".
