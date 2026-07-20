# Regras de Negócio e UI/UX (Módulos e Cotas)

1. **Nomenclatura e Separação de Responsabilidades:**
   - O termo "Amortizar por lance" deve ser evitado. A nomenclatura correta na UI é **"Credenciamento de lances"**.
   - O menu lateral (sidebar) deve utilizar o termo **"Financeiro"** no lugar de "amortização/parcelas".
   - **Módulo Financeiro:** Deve lidar exclusivamente com a listagem de parcelas da cota, geração de parcelas, cobranças e registros de pagamentos (incluindo o pagamento do lance após a cota ser contemplada).
   - **Módulo Contemplação:** A funcionalidade de "oferta de lance" / "credenciamento de lances" deve residir aqui. Deve ser possível escolher o tipo de lance (Livre, Fixo, Embutido, FGTS).

2. **Fluxo e Listagem de Cotas:**
   - O módulo de Cotas **NÃO** deve fazer fetch global ou exibir uma listagem inicial com todas as cotas do sistema.
   - Deve apresentar um formulário de **Busca Ativa**, permitindo pesquisar por: `Grupo`, `Cota`, `Versão` e `CPF/CNPJ`.
   - Ao executar a busca, a tela exibe os resultados correspondentes. Ao clicar em uma cota específica nos resultados, o sistema navega para exibir todos os dados detalhados dessa cota.
