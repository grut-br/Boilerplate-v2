# Roadmap de Implementação — AI Development Framework V3.1

Este documento apresenta o planejamento de implementação física para a **Versão V3.1** (Fase B) da Engine do framework. O desenvolvimento ocorrerá de forma linear e incremental em 9 sprints operacionais.

---

## 🗺️ Sprints do Roadmap V3.1

### Sprint V3.1-01: Foundation & Monorepo Bootstrap
* **Objetivo:** Setup do ambiente físico em monorepo pnpm workspaces, TS Project References e Turborepo.
* **Foco:** Configurações globais compartilhadas, CLI de bootstrap e compilação em árvore.
* **Status:** Concluído (Foundation Started).

### Sprint V3.1-02: Filesystem Driver & Local Context Layer
* **Objetivo:** Criar os mecanismos físicos de gravação e leitura segura de arquivos na pasta do projeto.
* **Foco:** Workspace temporário sob UUIDs, checkout do git para rollbacks e restrições territoriais físicas.
* **Status:** Planejado.

### Sprint V3.1-03: Model Provider Gateway
* **Objetivo:** Implementar os conectores de comunicação com provedores de IA (OpenAI, Anthropic, Gemini).
* **Foco:** Abstração de chats, tratamento de erros de conexão, rate limiting e mock offline.
* **Status:** Planejado.

### Sprint V3.1-04: Prompt Assembler & Context Hydration
* **Objetivo:** Desenvolver o hidratador dinâmico de prompts do prompt assembly.
* **Foco:** Compactação de contexto, injeção seletiva de regras e mitigação de Context Bloat.
* **Status:** Planejado.

### Sprint V3.1-05: Planning Engine
* **Objetivo:** Desenvolver o módulo executor de divisão semântica de especificações.
* **Foco:** Divisão de Epics, geração e rastreabilidade de grafos de tarefas de Work Units.
* **Status:** Planejado.

### Sprint V3.1-06: Capability Loader & Resolver
* **Objetivo:** Implementar o algoritmo de triagem de capabilities pelo Matching Score ($MS$).
* **Foco:** Cálculo dinâmico de score por domínios e keywords, prioridades e fallbacks de carregamento.
* **Status:** Planejado.

### Sprint V3.1-07: Execution Runtime
* **Objetivo:** Desenvolver o motor executor e coordenador de turnos na memória volátil de RAM.
* **Foco:** Prompt assembly em tempo de execução e isolamento por UUID.
* **Status:** Planejado.

### Sprint V3.1-08: Toolchain Gateway & Compilation
* **Objetivo:** Integrar os linters (`next lint`), compiladores (`tsc`) e executores de testes locais.
* **Foco:** Captura de saídas de console e retentativas automáticas de self-healing.
* **Status:** Planejado.

### Sprint V3.1-09: Result Processor & State Consolidation
* **Objetivo:** Implementar a esteira de julgamento de sucesso, persistência em histórico e expurgo.
* **Foco:** Gravação definitiva em PROJECT_STATE, descarte de RAM para evitar Context Drift e liberação de travas.
* **Status:** Planejado.

