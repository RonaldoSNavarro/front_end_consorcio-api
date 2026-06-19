# 📋 Especificação de UI — Gestão de Assembleias (assembleia)

*   **Status**: IMPLEMENTED v1.0
*   **Versão**: v1.0
*   **Spec Backend**: [spec.md](../../../../consorcio-api/docs/specs/assembleia/spec.md)
*   **API Contract**: [api-contract.md](../../../../consorcio-api/docs/specs/assembleia/api-contract.md)
*   **Última alteração**: Criação inicial da especificação de UI — origem: SPECIFY-UI inicial

---

## 🎯 Objetivo de UI
Permitir ao operador agendar assembleias ordinárias vinculadas a grupos, visualizar o histórico de assembleias, captar ofertas de lances durante a janela de captação e executar a apuração com resultados visuais (contemplações, confetti para vencedores).

---

## 🖥️ Telas e Componentes

### Página: AssembleiasPage
- **Rota**: `/assembleias`
- **Permissões**: 🔒 Autenticado
- **REQ-IDs cobertos**: REQ-ASM-001, REQ-ASM-002, REQ-LAN-001, REQ-CON-001, REQ-CON-006
- **Arquivo existente**: `src/pages/AssembleiasPage.jsx`

#### Componentes

| Componente | Tipo | REQ-ID | Hook TanStack | Schema Zod |
|-----------|------|--------|--------------|-----------|
| Seletor de Grupo | Select | REQ-ASM-002 | useGrupos() | — |
| Formulário Agendar AGO | Form | REQ-ASM-001 | useMutation (criar assembleia) | assembleiaSchema |
| Histórico de Assembleias | Table | REQ-ASM-001 | useAssembleias(grupoId) | — |
| Formulário de Lance | Form | REQ-LAN-001 | useMutation (criar lance) | lanceSchema |
| Lista de Lances da AGO | Table | REQ-LAN-001 | useLances(assembleiaId) | — |
| Botão Apurar | Action | REQ-CON-001 | useMutation (apurar) | — |
| Resultado da Apuração | Display | REQ-CON-001, REQ-CON-006 | — | — |
| Confetti | Efeito | — | — | — |

#### Endpoints Consumidos

| Endpoint | Método | Hook | Ação |
|----------|--------|------|------|
| `POST /api/assembleias` | POST | useMutation | Agendar assembleia |
| `GET /api/assembleias/grupo/{grupoId}` | GET | useQuery | Listar histórico |
| `POST /api/lances` | POST | useMutation | Cadastrar lance |
| `POST /api/contemplacoes` | POST | useMutation | Executar apuração |
| `GET /api/contemplacoes/assembleia/{assembleiaId}` | GET | useQuery | Listar contemplações |

#### Estados

| Estado | Componente/Comportamento |
|--------|------------------------|
| Loading (assembleias) | Skeleton na tabela de histórico |
| Error (agendamento) | Toast com mensagem de erro (400/404) |
| Empty State | "Nenhuma assembleia registrada para este grupo" |
| Success (apuração) | Confetti + destaque visual do vencedor |
| Captando | Badge verde "CAPTANDO" habilitando formulário de lance |
| Fechada | Badge cinza "FECHADA" desabilitando ações |

---

## 🎯 Critérios de Aceitação de UI

### REQ-ASM-001 - AC-UI-1: Agendamento de Assembleia
- **Given**: O operador selecionou um grupo e preencheu a data da assembleia.
- **When**: O operador clica em "Agendar AGO".
- **Then**: A assembleia aparece na tabela de histórico com badge "CAPTANDO" e o cache é invalidado.

### REQ-ASM-002 - AC-UI-1: Duplicata de Assembleia Captando
- **Given**: O grupo já possui uma assembleia com status CAPTANDO.
- **When**: O operador tenta agendar outra assembleia para o mesmo grupo.
- **Then**: O sistema exibe toast de erro indicando "Já existe assembleia em captação para este grupo".

### REQ-LAN-001 - AC-UI-1: Formulário de Oferta de Lance na AGO
- **Given**: Uma assembleia no status CAPTANDO está selecionada.
- **When**: O operador preenche o formulário de lance (cota, tipo, modalidade, valor).
- **Then**: O lance é registrado e aparece na lista de lances da assembleia.

### REQ-CON-001 - AC-UI-1: Execução Visual da Apuração
- **Given**: A assembleia possui lances registrados e está CAPTANDO.
- **When**: O operador clica em "Apurar Assembleia".
- **Then**: O resultado da apuração é exibido com destaque visual para o vencedor, efeito confetti, e badge de status atualizado para "REALIZADA".
