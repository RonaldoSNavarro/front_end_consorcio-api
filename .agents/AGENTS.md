# REGRAS DO PROJETO — FRONT-END CONSÓRCIO API

Ao trabalhar em qualquer tarefa do repositório `front_end_consorcio-api`, os agentes DEVEM:

1. **Governança do Cortex (Mandatória):** Todas as decisões de interface, padrões de componentes, integrações com o backend `consorcio-api`, refatorações e regras de UI/UX DEVEM ser consultadas (`query`) e persistidas ativamente no MCP Cortex (`cortex`) através de `write_page` ou `capture`. A memória principal do agente é o Cortex.
2. **Nomenclatura Estrita de Entidades (Domain-Driven):** As propriedades de DTOs e entidades exibidas na UI ou enviadas nas requisições devem respeitar estritamente a nomenclatura do backend (`codigoCota`, `codigoGrupo`, `versao` para Optimistic Lock e `versaoHistorico` para histórico de cota).
3. **Módulo Financeiro e Contemplação:** Respeitar a separação entre "Financeiro" (listagem de parcelas, cobrança, quitação) e "Contemplação/Credenciamento de Lances" (oferta de lance livre/fixo/embutido).
4. **Busca Ativa de Cotas:** Manter o padrão de Busca Ativa no módulo de Cotas (filtragem por Grupo, Cota, Versão e CPF/CNPJ), evitando fetch global de listagem inteira.
5. **Automação Mandatória de Skills (.agents):** Ao atuar neste repositório, o agente é OBRIGADO a verificar o conteúdo da pasta `.agents` e carregar/ler os arquivos lá contidos sempre que o contexto exigir, utilizando as ferramentas ativas, sem precisar de aprovação prévia.
