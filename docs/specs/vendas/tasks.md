# Plano de Execução SDD: Módulo de Vendas (Frontend e Integração)

## 1. Especificações (Design & Contratos)
- `[x]` Criar e atualizar o arquivo `spec.md` documentando fluxos e regras de negócio de venda.
- `[x]` Atualizar o arquivo `ui-spec.md` detalhando o Wizard de 4 passos do frontend alinhado aos testes E2E.
- `[x]` Garantir sincronização com o `api-contract.md` no backend.

## 2. Implementação do Layout no Frontend
- `[x]` Atualizar a página `VendaPropostaPage.jsx` para o layout do Wizard de 4 passos (0 a 3):
  - `[x]` **Passo 0 (Selecionar Consorciado)**: Campo `input[type="search"]` de busca e lista de clientes dentro de um container `.max-h-72`. Garantir que o clique no `button` de seleção do cliente armazena o cliente e avança para o Passo 1 automaticamente sem re-renderizações que façam perder a referência no DOM.
  - `[x]` **Passo 1 (Valor do Crédito & Simulação & Grupo/Cota)**: Incluir título `h3` contendo "Valor do Crédito", input numérico `input[type="number"]`, tabela/detalhamento com a simulação das parcelas (Fundo Comum, Taxa Adm, Fundo Reserva, Seguro), listagem de grupos elegíveis com indicadores de saúde (arrecadação %, prazo restante) e seletor de cota vaga (1 a 100). Implementar botão `"Avançar"` para avançar ao Passo 2.
  - `[x]` **Passo 2 (Tipo de Venda & Detalhes)**: Incluir título `h3` contendo "Tipo de Venda" e botões/cards contendo o texto `"Comissão:"` que avançam automaticamente ao Passo 3 no clique.
  - `[x]` **Passo 3 (Confirmar Proposta & Geração Visual do Contrato & Aceite)**: Incluir título `h3` contendo "Confirmar Proposta", card visual simulando o contrato com o detalhamento das parcelas e valores, e o botão `"Efetivar Proposta"`.
- `[x]` Tratar mensagens de Toast de sucesso (`"Venda efetivada!"`) e de erro de compliance (`"bloqueada por PLD/FT"`).

## Backend (consorcio-api)
- `[x]` Corrigir a esteira de propostas para validar listas restritivas (PLD/FT) no momento da criação (`POST /api/vendas/propostas`) ou da efetivação do contrato/cota, garantindo que o status de alerta de compliance (`PENDENTE_ANALISE` ou `CONFIRMADO`) do cliente (ex: OSAMA BIN LADEN) barre a operação com HTTP 422/400.
- `[x]` Criar mecanismos para sincronização síncrona ou mock de base de dados nas migrações SQL/seeds para garantir que a tabela `alertas_compliance` contenha os registros adequados no início dos testes E2E do Playwright.
- `[x]` Ajustar o processador assíncrono `@Async` em `ComplianceSincronizacaoService` se necessário, para que os testes E2E não sofram de flakiness por causa de concorrência ou atraso na carga de dados de PEP, ONU ou OFAC.

## Testes Automatizados (E2E)
- `[x]` Ajustar seletores e transições nos testes E2E (`compliance.spec.js` e `vendas.spec.js`) para garantir compatibilidade com as transições de passos da UI.
- `[x]` Validar a execução completa do teste feliz em `vendas.spec.js` e do fluxo de exceção (bloqueio PLD/FT) em `compliance.spec.js` contra a aplicação integrada.
