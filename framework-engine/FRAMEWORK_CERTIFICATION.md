# Framework Engine V3.1 - Official Certification

This document certifies the stabilization, testing, and architecture freeze of Framework Engine V3.1.

## 1. Arquitetura Final
A Framework Engine V3.1 é organizada sob os princípios de Clean Architecture e SOLID, desacoplando o núcleo de execução, o carregador de contexto estruturado (Markdown Loader) e os adaptadores de Language Models (Providers) por meio de abstrações estáveis (`ProviderPort`).

A camada operacional de Diagnósticos (Observability) é totalmente aditiva e independente, monitorando o fluxo de execução sem interferir na lógica de negócio principal ou nos contratos existentes.

## 2. Componentes Existentes
- **Runtime & Loader**:
  - `MarkdownLoader`: Varre diretórios buscando arquivos markdown estruturados com metadados para compor o contexto.
  - `ContextResolver`: Agrupa e seleciona os documentos solicitados por uma unidade de trabalho.
  - `ContextHydrator`: Ordena e gerencia os orçamentos de tokens.
- **Provider Platform**:
  - `ProviderPort`: Interface comum estável implementada por adaptadores.
  - `ProviderRegistry`: Repositório central de instâncias de adaptadores homologados.
  - `ProviderExecutor`: Orquestrador de execução que gerencia as chamadas, cache, retries de requisições e mapeamento de resultados neutros.
- **Diagnostics & Observability**:
  - `EngineLogger`: Logging estruturado com suporte a níveis de severidade (TRACE, DEBUG, INFO, WARN, ERROR, SILENT).
  - `PerformanceTimer`: Temporizador de precisão para medição de latência.
  - `ExecutionTrace`: Gravação do pipeline de execução em spans detalhados.
  - `ExecutionMetrics`: Consolidação de tempos, tokens, tamanhos de payloads, caches e contagens de documentos.
  - `DiagnosticsReport`: Gerador de relatórios em JSON, Markdown e string de console.

## 3. Pipeline Oficial
O ciclo de vida canônico da execução ocorre nas seguintes etapas sequenciais de tracing:
1. **Bootstrap**: Inicialização do pipeline e carregamento da configuração.
2. **Context Resolution**: Descoberta e resolução dos documentos no framework.
3. **Markdown Loader**: Leitura, parseamento de metadados e cacheamento de documentos.
4. **Hydration**: Orquestração e priorização dos documentos no orçamento de tokens.
5. **Prompt Assembly**: Formatação e agrupamento final da mensagem de prompt.
6. **Provider Execution**: Envio da requisição estruturada ao adaptador LLM.
7. **Response Parsing**: Processamento e conversão de formato proprietário para neutro.
8. **Pipeline Result**: Tratamento de respostas bem-sucedidas ou erros estruturados.
9. **Completed**: Finalização do ciclo de vida, consolidação de métricas e emissão de snapshot.

## 4. Providers Homologados
- **MockProvider**: Adaptador determinístico para testes e integração contínua (offline).
- **OpenAIProvider**: Adaptador estável integrado com a API de Chat Completions da OpenAI.
- **GeminiProvider**: Adaptador estável integrado com as APIs de conteúdo do Google Gemini.
- **AnthropicProvider**: Adaptador estável integrado com a Messages API do Anthropic Claude.

## 5. APIs Públicas
Disponíveis através do ponto de entrada global `src/index.ts`:
- **Core Execution**: `ProviderExecutor`, `ProviderRegistry`, `ProviderFactory`.
- **Contracts**: `ProviderPort`, `ProviderRequest`, `ProviderResponse`, `ProviderResult`, `HydratedContext`.
- **Context**: `MarkdownLoader`, `ContextResolver`, `ContextHydrator`.
- **Diagnostics**: `EngineLogger`, `DiagnosticsCollector`, `DiagnosticsReport`, `DiagnosticsSnapshot`, `ExecutionMetrics`, `ExecutionTrace`, `LogLevel`, `PerformanceTimer`.

## 6. Cobertura Funcional
- Cobertura completa de testes automatizados garantindo estabilidade e zero regressões.
- Suporte a retries inteligentes (códigos 429 e 5xx) e tratamento estruturado de timeouts ou cancelamentos (via AbortController) em todos os adaptadores estáveis.
- Validação estrita de limites de tokens em tempo de hidratação (Context Budget).

## 7. Métricas Finais
- Latência total e latência individual por spans de estágio.
- Contagem exata de tokens estimados e retornados.
- Controle de eficácia de cache (Hits/Misses).
- Estatísticas de tamanho de transmissão física de prompt e resposta em caracteres.
- Log detalhado de retries aplicados nas requisições.

## 8. Benchmark Consolidado
- Execução determinística simulada composta por:
  - 10 execuções do Mock Provider.
  - 10 execuções simuladas do OpenAI Provider (via Mocked HTTP Fetcher).
- Estatísticas calculadas de tempo: média, mínimo, máximo e desvio padrão.

## 9. Limitações Conhecidas
- A API pública da V3.1 opera exclusivamente em formato síncrono (não há suporte unificado a streaming no `ProviderPort` atual).
- Os orçamentos de tokens (Context Budget) usam estimativa simples de caracteres/tokens na hidratação em vez de tokenizadores locais específicos de modelo (BPE).

## 10. Roadmap Oficial da V4
Consulte o arquivo `ROADMAP_V4.md` na raiz para o planejamento de expansão. Os tópicos principais de V4 cobrem:
- Extensão unificada para streaming.
- Exportadores nativos de OpenTelemetry para integração industrial.
- Políticas corporativas de censura e redação de payloads de prompt/resposta.
- Suporte a chamadas concorrentes assíncronas e controle refinado de concorrência.
