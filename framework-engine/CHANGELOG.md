# Changelog

Todas as mudanças notáveis no projeto **Framework Engine** serão documentadas neste arquivo.

---

## [4.0.0] - 2026-07-13

### Adicionado
- **Knowledge Engine**: Núcleo do pipeline de consultas unificado para busca semântica, cache, planner e resolvers de dados.
- **Query Planner**: Motor descentralizado para planejamento estratégico de subqueries baseadas em dependências e tags.
- **Graphify MCP Server**: Servidor MCP nativo em Node.js com suporte a operações JSON-RPC stdio/ipc e integração do arquivo `graph.json`.
- **SpawnMcpTransport**: Canal de transporte robusto IPC para execução de processos MCP filhos com controle de encerramento via `unref()`.
- **RealGraphWatcher**: Watcher de arquivos em tempo real utilizando FS events nativos do Node.js para monitoramento de desvios.
- **Lazy Synchronization**: Sincronização automatizada sob demanda baseada em desvios do watcher no disco.
- **Ghost State Protection**: Prevenção ativa e determinística de leitura de grafos de códigos desatualizados.
- **Context Compression**: Pipeline de normalização, deduplicação heurística (MD5/SHA) e seleção de prioridade linear de contexto.
- **Prompt Assembly V2**: Motor de orquestração de layouts estruturados, controle de orçamento de tokens úteis e poda de seções opcionais baseado em prioridade sob limites rígidos.
- **Testes de Integração Real**: suite completa de E2E cobrindo pipelines de spawns e queries reais.

### Comparativo de Desempenho (V3.1 vs V4.0)
- **Latência média de cache (Hit)**: Reduzida de **~15ms** para **9ms** (-40%).
- **Processamento Concorrente**: Suporta **4.830 req/s** com heap estável em **22MB** (V3.1 operava a no máximo ~2.000 req/s).
- **Consumo de Contexto**: Redução de até **96.70%** no payload final via compressor determinístico e normalizador.

---

## [3.1.0-rc.1] - 2026-07-12

### Adicionado
- Adaptador de API do Anthropic Claude Messages como o terceiro provedor oficial.
- Logging estruturado com níveis de severidade TRACE, DEBUG, INFO, WARN, ERROR e SILENT.
- Coletor de diagnósticos de execução, temporizador de performance, métricas e trace canônico de execução.
- Benchmark de provedor determinístico com estatísticas de resumo.

---

## [3.0.0] - 2026-07-10
- Estabelecido o runtime de execução de provedores neutros, hidratação de contexto e contratos operacionais base.
