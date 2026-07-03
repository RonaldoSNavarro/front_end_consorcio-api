# Original User Request

## Initial Request — 2026-07-02T01:15:35Z

Desenvolver e integrar o novo módulo de "Vendas, Reserva de Cotas e Contratos" na base de código **já existente** do sistema Consórcio API. O projeto atual é um front-end React (Vite + TailwindCSS). A equipe deve primeiro analisar as rotas, o sistema de design (componentes UI existentes) e os padrões do projeto em `src/` antes de criar o novo fluxo. O front-end deve suportar o fluxo desde a simulação de crédito até a reserva da cota e emissão do contrato, garantindo aderência às regras do BACEN.

Working directory: f:\Dev\Projetos\front_end_consorcio-api
Integrity mode: development

## Requirements

### R1. Integração com Padrões Existentes
A equipe deve analisar a estrutura atual de rotas e componentes de UI do repositório antes de criar novas telas. O novo módulo deve parecer nativo ao sistema e reutilizar componentes sempre que possível.

### R2. Foco em B2B / Backoffice para Corretores
A interface deve ser voltada para corretores e vendedores (B2B). O layout deve permitir acesso rápido e detalhado às informações de grupos, permitindo escolher cotas específicas e gerar contratos com captura completa dos dados do consorciado. A interface deve ser densa em informações, mas com excelente usabilidade.

### R3. Seleção Guiada de Grupos e Cotas
O fluxo deve iniciar com uma simulação de crédito/parcela. O sistema deve então listar os grupos compatíveis disponíveis, exibindo indicadores de "saúde do grupo" (ex: % arrecadado, prazo restante). O corretor poderá escolher um grupo e uma cota vaga específica para reservar para o cliente.

### R4. Geração Visual e Aceite de Contrato
A etapa final do fluxo deve exibir os dados comerciais estruturados (valor do crédito, prazo, composição da parcela: Fundo Comum, Taxa de Administração, Fundo de Reserva, etc). O vendedor poderá colher um "Aceite Sistêmico" imediato na interface para efetivar a reserva.

## Acceptance Criteria

### Verificação do Fluxo e Integração Visual
- [ ] A equipe de agentes deve garantir que a aplicação inicie corretamente com o comando de desenvolvimento (ex: `npm run dev`) sem quebrar rotas já existentes.
- [ ] O agente deve usar navegação em browser/simulação para confirmar que é possível entrar no novo módulo, preencher a simulação, escolher um grupo, clicar em uma cota e ir para a tela de contrato.
- [ ] O layout final do Contrato deve renderizar na tela listando com clareza as divisões exigidas pelo BCB (Fundo Comum, Taxa Adm., Fundo Reserva).
- [ ] Se houver erros visuais graves, conflitos de rota ou crash na renderização, a equipe deve corrigir antes de considerar a tarefa entregue.

## Follow-up — 2026-07-03T01:18:12Z

Olá equipe Teamwork! O servidor foi reiniciado e a execução de vocês havia sido pausada anteriormente por limite de quota. Vocês podem retomar o trabalho de onde pararam.

Antes da pausa, o Victory Auditor identificou que 1 teste do front-end está falhando:
Arquivo: `src/test/hooks.test.jsx`
Teste: `useVendaProposta > deve permitir navegar entre passos`
Erro: `AssertionError: expected +0 to be 1`

O teste está tentando fazer `result.current.setStep(1);` dentro de um `waitFor`, o que não está atualizando o estado (provavelmente precisa usar `act()` do `@testing-library/react` ou chamar `result.current.handleNextStep()`).

Por favor:
1. Corrijam esse teste para que passe.
2. Certifiquem-se de que todos os testes (`npm run test:run`) e o build estejam passando.
3. Concluam a integração da interface de "Vendas, Reserva de Cotas e Contratos" conforme o prompt original (seleção guiada de grupos, contrato visual com regras do BACEN, etc).
4. Me avisem quando estiver tudo pronto!
