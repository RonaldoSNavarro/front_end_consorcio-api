# Especificação do Frontend: Módulo de Vendas

## Visão Geral
Este módulo foca na experiência do usuário para a venda de novas propostas de adesão ao consórcio e na administração dos Tipos de Venda disponíveis no sistema.

## Componentes Principais

### 1. Administração de Tipos de Venda (`TiposDeVendaPage`)
- **Público**: `ADMIN` ou perfis de gestão comercial.
- **Funcionalidade**: Listar, criar e inativar diferentes tipos de venda (ex: Venda Direta, Portal, Parceiro).
- **Dados**: Nome, Canal, Percentual de Comissão, Exigência de Seguro.

### 2. Fluxo de Venda / Wizard (`VendaPropostaPage`)
- **Público**: Corretores, Vendedores, Atendentes.
- **Funcionalidade**: Um formulário dividido em passos (wizard) para facilitar a seleção de dados.
- **Passos**:
  1. **Seleção de Cliente**: Busca de cliente ativo para associar à proposta.
  2. **Valor do Crédito**: Informação do valor do crédito desejado (o grupo será alocado automaticamente pelo backend).
  3. **Configuração da Venda**: Escolha do Tipo de Venda aplicável e opt-in para Seguro de Vida.
  4. **Confirmação**: Revisão dos dados e envio final (que aciona a geração da cota e parcelas no backend).
