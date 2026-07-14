# Framework Engine V5 — Roadmap de Funcionalidades Futuras

Este documento planeja de forma estritamente conceitual as funcionalidades futuras previstas para o próximo grande ciclo de evolução da engine (V5). Nenhuma dessas ideias está implementada no código atual, preservando o congelamento da arquitetura estável da V4.

---

## 1. Plataforma de Execução de Agentes (Agent Runtime)
- **Multi-Agent Orchestration**: Suporte nativo para múltiplos agentes autônomos trabalhando em paralelo sobre o mesmo workspace, com comunicação regulada exclusivamente por contratos da Engine.
- **Inter-Agent Message Bus**: Canal estruturado e auditável de mensagens e compartilhamento de memórias entre agentes.
- **Agent Lifecycle States**: Estados de ciclo de vida de agentes (Idle, Thinking, Executive, Suspended, Handover).

---

## 2. Protocolos de Grafo e MCP
- **MCP Runtime Completo**: Suporte nativo a servidores MCP adicionais rodando dinamicamente em rede distribuída via HTTP/Websockets para além de spawn local stdin/stdout.
- **Visual Graph Explorer**: Interface visual web integrada para explorar, auditar e inspecionar visualmente o grafo da AST do workspace (`graph.json`) em tempo real.
- **Cloud Sync**: Sincronização automática e incremental do grafo local do código com repositórios e serviços de armazenamento em nuvem de alta latência.

---

## 3. Desempenho e Concorrência
- **Parallel Query Execution**: Planejamento e execução concorrente assíncrona de subqueries com controle de concorrência adaptativo ao limite de requisições por minuto (RPM/TPM) do provedor de IA.
- **Knowledge Memory (RAG Avançado)**: Camada de armazenamento vetorial local em banco de dados embarcado (como DuckDB ou SQLite vector extension) para busca híbrida estruturada (Graph) + não-estruturada (Vetor).
- **Incremental Compilation**: Re-compilação e sincronização do grafo baseando-se em hashes locais da AST, processando apenas as modificações parciais (deltas) em workspaces gigantescos.

---

## 4. Ecossistema de Extensões
- **VSCode Extension**: Extensão oficial para integrar a Knowledge Engine diretamente ao painel de desenvolvedor do VS Code (incluindo diagnósticos em tempo real na aba Problems).
- **Web Dashboard**: Painel visual local para monitoramento detalhado de estatísticas de cache semântico, consumo de tokens por Section de prompt, relatórios do doctor de providers e logs de execução.
- **Plugin SDK**: SDK modular para criação de carregadores de contexto personalizados (custom loaders) e estratégias de compressão personalizadas por tipo de projeto.
- **Telemetry Exporter**: Exportadores OpenTelemetry corporativos para monitoramento distribuído e integração nativa com Datadog, Prometheus e Grafana.
