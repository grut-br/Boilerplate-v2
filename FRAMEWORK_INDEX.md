# Índice do Framework (Framework Index) — V3.0

Este documento atua estritamente como o **Mapa de Navegação Rápida** do ecossistema do framework. Seu objetivo é indicar a localização, regras de carregamento e propriedade intelectual de cada arquivo do repositório para o `v3-capability-context-builder` em tempo de execução.

---

## 🗺️ Catálogo de Caminhos e Propriedade de Conhecimento

| Documento / Caminho | Camada | Quando Carregar (Contexto) | Proprietário (Single Source of Truth) |
| :--- | :--- | :--- | :--- |
| `always-read.md` | Foundation | **Sempre Carregar** (Todas as execuções) | Regras inegociáveis de controle global. |
| [FRAMEWORK_ENTRYPOINT.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/FRAMEWORK_ENTRYPOINT.md) | Entrypoint | Inicialização da Engine. | Ponto de partida operacional único do ecossistema. |
| [V3_ARCHITECTURE.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/V3_ARCHITECTURE.md) | Foundation | Alinhamento arquitetural macro. | Visão geral da arquitetura de transição V3.0. |
| [DEVELOPMENT_GUIDE.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/DEVELOPMENT_GUIDE.md) | Foundation | Alinhamento de filosofia de desenvolvimento. | Princípios de CDD e políticas de congelamento. |
| [DOCUMENTATION_GUIDELINES.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/DOCUMENTATION_GUIDELINES.md) | Foundation | Modificações lógicas ou de documentação. | Diretrizes de ownership e camadas lógicas. |
| [FRAMEWORK_INDEX.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/FRAMEWORK_INDEX.md) | Foundation | Mapeamento de caminhos e contexto (Loader/Builder). | Este arquivo (Mapa de navegação). |
| [FRAMEWORK_ENGINE.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/FRAMEWORK_ENGINE.md) | Foundation | Visão geral resumida dos módulos lógicos. | Motor Cognitivo central. |
| [FRAMEWORK_EXECUTION.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/FRAMEWORK_EXECUTION.md) | Modules | Carregamento da Engine de Escrita. | Manual técnico do Prompt Assembly Pipeline. |
| [FRAMEWORK_TOOLCHAIN.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/FRAMEWORK_TOOLCHAIN.md) | Modules | Validação local por terminal físico. | Manual técnico de ferramentas sintáticas locais. |
| [FRAMEWORK_RUNTIME.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/FRAMEWORK_RUNTIME.md) | Modules | Execução de controle temporário e RAM. | Manual técnico de isolamento e reversões. |
| [FRAMEWORK_RESULT_PROCESSOR.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/FRAMEWORK_RESULT_PROCESSOR.md) | Modules | Fechamento transacional e homologação. | Manual técnico de julgamento e arquivamento. |
| [CAPABILITY_CONTRACT.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/CAPABILITY_CONTRACT.md) | Contracts | Criação ou validação de Capabilities. | Contrato padrão contendo regras de interface. |
| [`.agents/capabilities/planning.md`](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/capabilities/planning.md) | Capabilities | Ativação de análise e decomposição de requisitos. | Regras da Planning Capability. |
| `.agents/capabilities/capability-loader.md` | Capabilities | Ativação da triagem de metadados. | Regras do selecionador de Capabilities. |
| `.agents/capabilities/context-builder.md` | Capabilities | Ativação do hidratador dinâmico. | Regras da infraestrutura de contexto. |
| `.agents/capabilities/execution-engine.md` | Capabilities | Ativação do motor de escrita física. | Regras do escritor do repositório. |
| `.agents/capabilities/toolchain-gateway.md` | Capabilities | Ativação da auditoria por terminal. | Regras do validador cego local. |
| `.agents/capabilities/runtime-state.md` | Capabilities | Ativação de isolamento temporário. | Regras da memória RAM operacional. |
| `.agents/capabilities/result-processor.md` | Capabilities | Ativação da homologação final. | Regras da decisão de fechamento da WU. |
| [`.agents/capabilities/documentation.md`](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/capabilities/documentation.md) | Capabilities | Geração de documentações, READMEs e changelogs. | Regras da Documentation Capability. |
| [`.agents/capabilities/analysis.md`](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/capabilities/analysis.md) | Capabilities | Análises estruturais e auditorias lógicas passivas. | Regras da Analysis Capability. |
| `.ai-workspace/specifications/` | Specifications | Execução da Work Unit ativa correspondente. | Requisitos funcionais da feature. |
| `.ai-workspace/templates/` | Templates | Inicialização de novas especificações. | Estruturas e placeholders base. |
| `.ai-workspace/logs/` | Logs | Auditoria histórica pós-fechamento. | Relatórios cronológicos de sprints. |
| `.ai-workspace/roadmap/` | Roadmaps | Planejamento estratégico. | Metas cronológicas do projeto de longo prazo. |
| `.ai-workspace/decisions/` | ADRs | Análise de desvios arquiteturais passados. | Registros formais de decisões lógicas. |

---

## 💧 Regras de Resolução de Contexto (Context Resolution Rules)

Esta matriz define quais arquivos da tabela de caminhos o `v3-capability-context-builder` está autorizado a carregar no buffer cognitivo para cada Capability ativa, impedindo Context Bloat:

| Capability | Documentos Obrigatórios (Mandatory) | Documentos Opcionais (Optional) | Documentos Proibidos (Forbidden) |
| :--- | :--- | :--- | :--- |
| **Planning** | `PROJECT_STATE.md`, `specifications/` (ativos), `decisions/` (ADRs), `FRAMEWORK_ENGINE.md` | Nenhuma | `knowledge/ui.md`, `knowledge/security.md`, `checklists/`, `src/` |
| **Capability Loader** | `CAPABILITY_CONTRACT.md`, `FRAMEWORK_INDEX.md`, `Work Unit Metadados` | Nenhuma | `knowledge/ui.md`, `knowledge/security.md`, `checklists/`, `src/` |
| **Context Builder** | `FRAMEWORK_INDEX.md`, `CAPABILITY_CONTRACT.md`, `Work Unit Metadados` | Nenhuma | `src/` |
| **Execution Engine** | `FRAMEWORK_EXECUTION.md`, `rules/always-read.md`, `src/` (arquivos afetados) | `rules/coding-style.md` | `knowledge/`, `roadmap/`, `src/` (exceto afetados) |
| **Toolchain Gateway** | `FRAMEWORK_TOOLCHAIN.md`, `rules/always-read.md`, lista de arquivos modificados | Checklists de deploy | `knowledge/`, `roadmap/`, `src/` (exceto afetados) |
| **Runtime State** | `FRAMEWORK_RUNTIME.md`, `rules/always-read.md`, `Work Unit Metadados` | Nenhuma | `src/` |
| **Result Processor** | `FRAMEWORK_RESULT_PROCESSOR.md`, `PROJECT_STATE.md`, `rules/always-read.md`, logs do Runtime | Checklists de deploy | `knowledge/`, `roadmap/`, `src/` |
| **Documentation** | `DOCUMENTATION_GUIDELINES.md`, `rules/always-read.md`, `specifications/` (ativos) | `PROJECT_STATE.md`, `FRAMEWORK_INDEX.md` | `src/` (exceto assinaturas), arquivos de configuração (`package.json`, etc.) |
| **Analysis** | `rules/always-read.md`, `rules/coding-style.md`, `specifications/` (ativos) | `PROJECT_STATE.md`, `FRAMEWORK_INDEX.md` | `src/` (exceto arquivos alvo de leitura), arquivos de configuração (`package.json`, etc.) |

---

## 🛠️ Matriz Operacional de Capabilities (Operational Capability Matrix)

Esta matriz registra o status de homologação, proprietários e templates de referência associados às Capabilities operacionais da Engine V3.0:

| Capability | Status | Proprietário (Owner) | Contexto Obrigatório | Template Utilizado |
| :--- | :--- | :--- | :--- | :--- |
| **Planning** | Operational (Validated) | Engine Core (Control Plane) | [always-read.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/rules/always-read.md), [DEVELOPMENT_GUIDE.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/DEVELOPMENT_GUIDE.md) | [work-unit-template-v3.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.ai-workspace/templates/work-unit-template-v3.md) |
| **Documentation** | Operational (Validated) | Engine Core (Execution Engine) | [always-read.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/rules/always-read.md), [DOCUMENTATION_GUIDELINES.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/DOCUMENTATION_GUIDELINES.md) | Templates do workspace e especificações |
| **Analysis** | Plugin (Operational) | Engine Core (Execution Engine) | [always-read.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/rules/always-read.md), [DEVELOPMENT_GUIDE.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/DEVELOPMENT_GUIDE.md) | Relatórios estruturados e logs em markdown |

---

## 🧭 Matriz de Resolução de Capabilities (Capability Resolution Matrix)

Esta matriz orienta o `v3-capability-loader` na triagem, pontuação e escolha das Capabilities no ecossistema:

| Capability | Domains | Keywords de Match | Priority | Confidence | Fallback |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Planning** | `["planning", "specifications", "work-units"]` | `["requirements", "decomposition", "wu-id"]` | 10 | High | `v3-capability-general` |
| **Documentation** | `["documentation", "specifications", "readmes"]` | `["readme", "markdown", "changelog"]` | 9 | High | `v3-capability-general` |
| **Analysis** | `["analysis", "audits", "reports"]` | `["fsd", "static-audit", "imports"]` | 7 | Medium | `v3-capability-general` |



