# Framework Engine V4.0.0 (Stable)

O **Framework Engine V4** é um runtime de execução desacoplado e agnóstico a provedores de IA para hidratação de contexto de unidades de trabalho e compilação inteligente de prompts com busca baseada em grafos, planejamento descentralizado, cache e compressão determinística.

---

## Novidades da V4.0.0

A segunda geração do framework introduz a **Knowledge Engine**, reestruturando a compilação do contexto antes do envio ao LLM:
*   **Query Planner**: Compilação de requisições de busca em planos estratégicos de subqueries com árvores de dependências e estimativas de custo.
*   **Graphify MCP Server**: Servidor MCP real rodando em segundo plano via IPC stdio para processar e buscar relacionamentos de AST do código.
*   **Lazy Synchronization**: Monitoramento dinâmico do disco e compilação sob demanda do grafo de dependências.
*   **Ghost State Protection**: Garantia absoluta de consistência de dados, impedindo consultas sobre arquivos desatualizados.
*   **AST Projection Engine**: Projeção e expansão sob demanda de nós relevantes da árvore da AST baseando-se em profundidade e prioridade.
*   **Context Compression**: Compressor determinístico para remoção de redundâncias de espaçamentos, deduplicação (via hashes de conteúdo) e ordenação por pontuação de prioridade.
*   **Prompt Assembly V2**: Motor de orquestração de layouts estruturados (Presets: Code Gen, Review, Planning, etc.) e otimizador com poda linear recursiva de seções sob orçamentos estritos de tokens do modelo.

---

## 🚀 Arquitetura de Pipelines

O fluxo unificado ocorre sob desacoplamento total através de interfaces abstratas (`KnowledgeProvider`):

```
                  KnowledgeRequest
                         │
                         ▼
                    QueryPlanner (Estratégia)
                         │
                         ▼
                 KnowledgeResolver (Filtros)
                         │
                         ▼
               AST Projection Engine (AST)
                         │
                         ▼
                 ContextCompressor (Deduplicação)
                         │
                         ▼
                 Prompt Assembly V2 (Montagem & Poda)
                         │
                         ▼
                     Prompt Final
                         │
                         ▼
                LLM Provider (Mock/OpenAI/Gemini/Anthropic)
```

---

## 🛠️ APIs Públicas

O ponto de entrada público global é [`src/index.ts`](file:///C:/Users/lucas/Projetos/Boilerplate-v2/framework-engine/src/index.ts). Ele expõe:
*   **Busca e Engine**: `KnowledgeEngine`, `KnowledgeContext`, `KnowledgeComposer`, `KnowledgeRequest`, `KnowledgeResult`.
*   **Planejador**: `QueryPlanner`, `QueryPlan`, `QueryNode`, `PlanningContext`, `PlanningPolicy`.
*   **Grafo e MCP**: `GraphManager`, `GraphProcessManager`, `RealGraphWatcher`, `GraphifyKnowledgeProvider`, `SpawnMcpTransport`.
*   **Projeção e Compressão**: `AstProjectionEngine`, `ContextCompressor`, `DuplicateDetector`, `ContextNormalizer`.
*   **Prompt Assembly**: `PromptAssembler`, `PromptBudget`, `PromptSection`, `PromptTemplate`, `PromptLayout`, `PromptOptimizer`, `PromptPolicies`.

Consulte o documento [**`API.md`**](./API.md) para detalhes de uso e assinaturas das classes.

---

## 📊 Medições e Benchmarks

Consulte os resultados de benchmarks, testes de concorrência e vazão nos arquivos:
*   [**`BENCHMARKS.md`**](./BENCHMARKS.md): Taxas de throughput (4.800 req/s), latência de cache (9ms) e redução de tokens (96%).
*   [**`PERFORMANCE.md`**](./PERFORMANCE.md): Pipeline detalhado de tempos e análise de gargalos.

---

## 🧪 Validação e Homologação

Para executar as suítes de teste de regressão globais e compilação do framework:

```bash
# Executa todos os testes
npm run test

# Executa o typecheck do TypeScript
npm run typecheck

# Compila o build de produção do Next.js
npm run build
```

A Framework Engine V4 está certificada e homologada para ambientes de produção.
Para detalhes de homologação, consulte a [**Certificação de Produção**](./FRAMEWORK_CERTIFICATION.md).
