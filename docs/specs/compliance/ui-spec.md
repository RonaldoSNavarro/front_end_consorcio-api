# 📋 Especificação de UI — Compliance e Listas Restritivas (compliance)

*   **Status**: LOCKED
*   **Versão**: v1.1
*   **Spec Backend**: [spec.md](../../consorcio-api/docs/specs/compliance/spec.md)
*   **API Contract**: [api-contract.md](../../consorcio-api/docs/specs/compliance/api-contract.md)
*   **Última alteração**: Adição de uploads manuais (PEP, ONU, IBGE) e formulário de agendamento do Job via cron. — origem: SPECIFY-UI Sprint 5

---

## 🎯 Objetivo de UI
Esta capability fornece aos analistas de compliance e administradores um painel dedicado contendo três abas funcionais:
1. **Alertas de PLD/FT**: Monitoramento e deliberação de alertas ativos.
2. **Importar Listas**: Carga manual das tabelas de referência via upload de arquivos (PEP CSV, ONU XML, IBGE XLS).
3. **Agendamento de Job**: Configuração de horário e frequência (Diário, Semanal, Mensal) de execução do processador em lote automático.

---

## 🖥️ Telas e Componentes

### Página: CompliancePainelPage
- **Rota**: `/compliance/alertas`
- **Permissões**: ROLE_COMPLIANCE | ROLE_ADMIN
- **REQ-IDs cobertos**: REQ-COMP-002, REQ-COMP-005, REQ-COMP-006, REQ-COMP-008

#### Componentes e Abas

##### Aba 1: Alertas de PLD/FT
- Tabela com filtros por status e origem.
- Botão "Sincronizar" (dispara `/api/compliance/sincronizar`).
- `DeliberacaoModal`: preenchimento de veredito e justificativa obrigatória (>10 chars).

##### Aba 2: Importar Listas
- Três cartões/zonas de upload para os arquivos de referência:
  - **PEP (CSV)**: aceita apenas arquivos `.csv`.
  - **ONU (XML)**: aceita apenas arquivos `.xml`.
  - **IBGE (XLS/XLSX)**: aceita arquivos `.xls` ou `.xlsx`.
- Cada cartão exibe:
  - Título da lista.
  - Indicador visual da extensão requerida.
  - Zona de arrastar e soltar (drag-and-drop) e seletor manual.
  - Spinner/loader individual durante a mutação (`useMutation`).
  - Mensagem de feedback de sucesso detalhando registros processados.

##### Aba 3: Agendamento de Job
- Formulário contendo:
  - Campo "Frequência de Processamento": Select com opções `DIARIO`, `SEMANAL`, `MENSAL`.
  - Campo "Horário de Disparo": Input do tipo `time` (formato `HH:mm`).
  - Botão "Salvar Configuração": Desabilitado durante o envio, exibindo spinner.
- Detalhe de auditoria mostrando: `"Última atualização: [Data e Hora formatada]"`.

#### Endpoints Consumidos

| Endpoint | Método | Hook | Ação |
|----------|--------|------|------|
| `/api/compliance/alertas` | GET | useQuery | Listar alertas (filtros: status, origemLista) |
| `/api/compliance/alertas/{alertaId}/deliberar` | PUT | useMutation | Deliberar alerta |
| `/api/compliance/sincronizar` | POST | useMutation | Sincronizar listas restritivas |
| `/api/compliance/upload/pep` | POST | useMutation | Upload da lista PEP (FormData) |
| `/api/compliance/upload/onu` | POST | useMutation | Upload da lista ONU (FormData) |
| `/api/compliance/upload/ibge` | POST | useMutation | Upload da lista IBGE (FormData) |
| `/api/compliance/config` | GET | useQuery | Buscar configurações do Cron |
| `/api/compliance/config` | PUT | useMutation | Salvar nova configuração do Cron |

---

## 🎯 Critérios de Aceitação de UI

### REQ-COMP-002 - AC-UI-1: Disparar Sincronização Manual
- **Given**: Usuário autenticado com perfil `ROLE_ADMIN` ou `ROLE_COMPLIANCE` na tela de Compliance.
- **When**: Clica no botão "Sincronizar Bases".
- **Then**: O botão entra em estado de loading e exibe Toast de sucesso.

### REQ-COMP-002 - AC-UI-2: Feedback de Sincronização
- Após a sincronização manual ser iniciada, um toast de sucesso deve aparecer informando quantos registros foram sincronizados de cada fonte, caso o backend retorne o resultado sincronicamente, ou informar que a rotina está em background.

### REQ-COMP-010 - AC-UI-OFAC-1: Card de Status OFAC
- Deve haver um card específico da integração OFAC na aba "Importar Listas", exibindo o status atual da conexão e permitindo forçar a atualização individual.

### REQ-COMP-005 - AC-UI-1: Filtros de Alertas
- **Given**: Tabela de alertas carregada na aba "Alertas de PLD/FT".
- **When**: Seleciona os filtros de status e origem.
- **Then**: Atualiza a tabela chamando a API com parâmetros correspondentes.

### REQ-COMP-005 - AC-UI-2: Deliberar Alerta de Suspeita
- **Given**: Modal de deliberação aberto para um alerta pendente.
- **When**: Insere justificativa com menos de 10 caracteres.
- **Then**: Exibe erro e impede envio.
- **When**: Preenche justificativa válida e envia.
- **Then**: Fecha modal, envia `PUT`, exibe Toast e recarrega alertas.

### REQ-COMP-006 - AC-UI-1: Upload de Listas Restritivas
- **Given**: Usuário na aba "Importar Listas".
- **When**: Tenta carregar um arquivo com extensão inválida (ex: `.pdf` noPEP).
- **Then**: O sistema rejeita localmente com Toast de erro: `"Extensão de arquivo inválida. Esperado: .csv"`.
- **When**: Seleciona um arquivo válido e clica para enviar.
- **Then**: O cartão do respectivo arquivo exibe loader e desabilita novas interações até a conclusão.
- **When**: A requisição retorna sucesso 200.
- **Then**: Exibe Toast de sucesso com o total de registros inseridos (ex: `"Arquivo PEP processado com sucesso. 1500 registros inseridos/atualizados."`).

### REQ-COMP-008 - AC-UI-1: Configuração do Agendamento do Cron
- **Given**: Usuário na aba "Agendamento de Job".
- **When**: A página ou aba é carregada.
- **Then**: Faz o `GET` da configuração e preenche os campos "Frequência" e "Horário" com os valores vigentes.
- **Then**: Envia a requisição `PUT`, exibe Toast de sucesso `"Configuração de agendamento atualizada com sucesso."` e atualiza a data/hora da última alteração.

### REQ-COMP-009 - AC-UI-LOGS-1: Visualização de Logs de Execução
- A aba "Agendamento de Job" deve possuir uma seção para exibir os logs das últimas execuções de sincronização (horário, trigger, status da OFAC e contagem de registros).
