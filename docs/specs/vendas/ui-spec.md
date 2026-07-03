# 📋 Especificação de UI — Módulo de Vendas (vendas)

*   **Status**: LOCKED (Updated to v2.0)
*   **Versão**: v2.0
*   **Spec Backend**: [spec.md](../../consorcio-api/docs/specs/vendas/spec.md)
*   **API Contract**: [api-contract.md](../../consorcio-api/docs/specs/vendas/api-contract.md)
*   **Última alteração**: Atualização do Wizard de Vendas para 4 passos e alinhamento com testes E2E.

---

## 🎯 Objetivo de UI
Fornecer uma interface intuitiva em formato de Wizard (esteira de vendas) para que corretores e operadores possam emitir propostas de adesão a consórcios, alocar clientes a grupos elegíveis e realizar simulações financeiras em conformidade com as regras do BACEN.

---

## 🖥️ Telas e Componentes

### Página: `TiposDeVendaPage.jsx`
- **Rota**: `/vendas/tipos`
- **Permissões**: ROLE_ADMIN | ROLE_GERENTE
- **Funcionalidades**:
  - **Tabela de Tipos**: Colunas para Nome, Canal, Comissão ("Comissão: X%") e Status (Badge ativo/inativo).
  - **Ações**: Modais para "Novo Tipo de Venda" e "Editar".
  - **Botão Toggle**: Habilitar/Desabilitar ativo diretamente na linha da tabela.
  - **Layout**: Utiliza o padrão `glass-panel` existente na aplicação.

### Página: `VendaPropostaPage.jsx`
- **Rota**: `/vendas/proposta`
- **Permissões**: Autenticado (ROLE_VENDEDOR, ROLE_CORRETOR, ROLE_ADMIN)
- **Wizard Container**: Exibe 4 passos horizontais (Stepper) indicando o progresso da proposta:
  - Passo 0: Selecionar Consorciado
  - Passo 1: Valor do Crédito & Simulação & Seleção de Grupo/Cota
  - Passo 2: Tipo de Venda & Detalhes
  - Passo 3: Confirmar Proposta & Geração Visual do Contrato & Aceite

#### Detalhes do Wizard (4 Passos)

##### Step 0: Selecionar Consorciado
- **Título**: Elemento `h3` contendo exatamente o texto `"Selecionar Consorciado"`.
- **Busca de Cliente**: Campo de texto do tipo `input[type="search"]` que filtra a lista de clientes cadastrados de forma dinâmica.
- **Lista de Clientes**: Exibida em um container com a classe `.max-h-72`. Cada cliente é renderizado em um cartão ou linha contendo um botão (`button`).
- **Ação**: Ao clicar no botão do cliente correspondente, o sistema armazena o cliente selecionado e **avança automaticamente** para o próximo passo (Step 1). Não há botão "Próximo/Avançar" nesta etapa.

##### Step 1: Valor do Crédito & Simulação & Seleção de Grupo/Cota
- **Título**: Elemento `h3` contendo exatamente o texto `"Valor do Crédito"`.
- **Entrada de Crédito**: Campo numérico `input[type="number"]` para digitação do valor do crédito solicitado.
- **Simulação Detalhada**: Exibição em tempo real do cálculo das parcelas composto por:
  - Fundo Comum (FC)
  - Taxa de Administração (TA)
  - Fundo de Reserva (FR)
  - Seguro Prestamista (Seguro)
- **Lista de Grupos Elegíveis**: Lista de grupos (status `EM_CAPTACAO` ou `EM_ANDAMENTO`) com indicadores de saúde:
  - Percentual de arrecadação do grupo (ex: "Arrecadação: 85%")
  - Prazo restante em meses
- **Seletor de Cota Vaga**: Campo ou dropdown para selecionar uma cota específica vaga (limitado de 1 a 100).
- **Ação**: Botão `"Avançar"` (`button:has-text("Avançar")` ou `getByRole('button', { name: /Avançar/i })`). Ao clicar, valida os dados e avança para o Step 2.

##### Step 2: Tipo de Venda & Detalhes
- **Título**: Elemento `h3` contendo exatamente o texto `"Tipo de Venda"`.
- **Canais/Tipos de Venda**: Exibição dos tipos de venda ativos (ex: Venda Direta, Portal, Parceiro).
- **Cards/Botões de Seleção**: Botões contendo o texto `"Comissão:"` (ex: `"Comissão: 2%"`).
- **Ação**: Ao clicar em um dos botões de Tipo de Venda contendo `"Comissão:"`, o sistema seleciona o tipo de venda correspondente e **avança automaticamente** para o Step 3.

##### Step 3: Confirmar Proposta & Geração Visual do Contrato & Aceite
- **Título**: Elemento `h3` contendo exatamente o texto `"Confirmar Proposta"`.
- **Geração Visual do Contrato**: Card simulando o Contrato de Adesão que exibe:
  - Valor do Crédito
  - Prazo do Grupo
  - Detalhamento da composição da parcela base (Valores do Fundo Comum, Taxa de Administração, Fundo de Reserva e Seguro Prestamista se contratado).
- **Ação / Efetivação**: Botão `"Efetivar Proposta"` (`button:has-text("Efetivar Proposta")` ou `getByRole('button', { name: /Efetivar Proposta/i })`).
- **Feedback / Toasts**:
  - Em caso de sucesso: Exibir uma notificação Toast contendo o texto `"Venda efetivada!"`.
  - Em caso de bloqueio por Compliance (ex: cliente na lista restritiva OFAC/ONU): Exibir uma notificação Toast de erro contendo o texto `"bloqueada por PLD/FT"` (regex correspondente: `/bloqueada por PLD\/FT/i`).

---

## 📡 Endpoints Consumidos (Vendas)

| Endpoint | Método | Hook / Ação | Descrição |
|----------|--------|-------------|-----------|
| `/api/clientes` | GET | useQuery | Buscar lista de clientes ativos para o Step 0 |
| `/api/vendas/produtos` | GET | useQuery | Listar produtos de consórcio disponíveis |
| `/api/grupos` | GET | useQuery | Listar grupos elegíveis para alocação |
| `/api/vendas/tipos` | GET | useQuery | Listar tipos de venda para o Step 2 |
| `/api/vendas/propostas` | POST | useMutation | Criar proposta de adesão (retorna proposta em `EM_ANALISE`) |
| `/api/vendas/propostas/{id}/aprovar` | POST | useMutation | Aprovar proposta e gerar contrato de adesão |
| `/api/vendas/contratos/{id}/efetivar` | POST | useMutation | Confirmar 1ª parcela, alocar no grupo e gerar Cota |

---

## 🎯 Critérios de Aceitação de UI (E2E Compliance)

### AC-VND-01: Wizard de Venda Feliz (Sucesso)
- **Given** que o corretor acessa `/vendas/proposta`
- **When** seleciona um cliente ativo no Step 0
- **And** define o valor do crédito, visualiza a simulação e clica em "Avançar" no Step 1
- **And** escolhe o canal de venda clicando em um botão que exibe "Comissão:" no Step 2
- **And** clica no botão "Efetivar Proposta" no Step 3
- **Then** a proposta é gerada, aprovada, paga e a cota é criada no backend, exibindo o toast de sucesso `"Venda efetivada!"`.

### AC-VND-02: Bloqueio de Venda por PLD/FT
- **Given** que o corretor busca um cliente em lista restritiva (ex: "OSAMA BIN LADEN") no Step 0
- **When** completa o fluxo inserindo o valor do crédito no Step 1, escolhendo o canal de venda no Step 2 e clicando em "Efetivar Proposta" no Step 3
- **Then** o backend intercepta o bloqueio de compliance e retorna erro HTTP 422/400
- **And** o frontend exibe um toast de erro contendo a mensagem `"bloqueada por PLD/FT"`.

