# Especificação de UI: Módulo de Vendas

## `TiposDeVendaPage.jsx`
- **Tabela de Tipos**: Colunas para Nome, Canal, Comissão e Status (Badge).
- **Ações**: Modal para "Novo Tipo de Venda" e "Editar".
- **Botão Toggle**: Habilitar/Desabilitar ativo diretamente na linha.
- **Layout**: Utiliza o padrão `glass-panel` existente na aplicação.

## `VendaPropostaPage.jsx`
- **Wizard Container**: Exibe 4 steps horizontais (Stepper) indicando o progresso da venda.
- **Step 1: Cliente**: Input de busca + Lista renderizada com cartões minimalistas de clientes.
- **Step 2: Grupo**: Lista de grupos elegíveis (Status `EM_CAPTACAO` ou `EM_ANDAMENTO`).
- **Step 3: Detalhes**: 
  - Select para Tipo de Venda.
  - Checkbox / Toggle para "Contratar Seguro Prestamista".
- **Step 4: Resumo**: Card de revisão apresentando Nome do Cliente, Nome do Grupo, Valor do Crédito Base e Confirmação.
- **Feedback**: Toast Notifications para Sucesso (`Cota XXX gerada com sucesso`) ou Erro.
