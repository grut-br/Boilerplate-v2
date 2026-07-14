# Referência da API Pública — Framework Engine V4.0.0

A API pública da **Framework Engine V4** está exposta a partir do ponto de entrada global [`src/index.ts`](file:///C:/Users/lucas/Projetos/Boilerplate-v2/framework-engine/src/index.ts).

---

## 1. Núcleo do Pipeline (`KnowledgeEngine`)

O ponto central para submeter buscas estruturadas ao workspace.

```ts
import { KnowledgeEngine } from 'devio-master-boilerplate';

const engine = new KnowledgeEngine({
  provider: graphifyProvider,
  futureOptions: {
    cache: {
      enabled: true,
      ttl: 60000,
    },
    compression: {
      maxDocuments: 10,
      maxCharacters: 8000,
      enableDeduplication: true,
    },
    promptAssembly: {
      maxTokens: 4096,
    }
  }
});

await engine.initialize();

const result = await engine.query({
  query: 'buscar controllers de rota de autenticação',
  workspace: '/meu-projeto',
  capability: 'semanticSearch',
});

console.log(result.diagnostics.promptText); // Prompt estruturado, otimizado e montado
```

### Contratos Principais:
- `KnowledgeRequest`: Contrato neutro que encapsula a query do usuário, workspace, filtros de busca, prioridades e capabilities desejadas.
- `KnowledgeResult`: Retorno estruturado contendo documentos resolvidos, nós projetados do grafo da AST, metadados de telemetria e o prompt final gerado.

---

## 2. Query Planner (`QueryPlanner`)
Decide de forma descentralizada e estratégica a árvore de sub-buscas necessárias.
- `QueryPlanner`: Classe responsável por compilar a requisição e construir o plano.
- `QueryPlan`: O plano resultante contendo a lista ordenada de nós a serem pesquisados.
- `QueryNode`: Cada unidade atômica de consulta com dependências mapeadas, tags e custos de busca estimados.
- `PlanningPolicy`: Regras regulatórias que limitam o plano (ex: número máximo de nós ou profundidade de recursão permitida).

---

## 3. Sincronização e Processos (`GraphManager` & `GraphProcessManager`)
Controlam a integridade de dados e evitam leituras desatualizadas.
- `GraphManager`: Coordenador de estado e consistência da Engine que avalia se o Grafo está desatualizado.
- `GraphProcessManager`: Orquestrador de ciclo de vida do processo spawnado do servidor MCP. Oferece as operações:
  - `start()` / `stop()` / `restart()`
  - `health()` (retorna PID, dirty files e telemetria fina)
  - `synchronize()` (envia comando MCP de sincronização com o disco)
- `RealGraphWatcher`: Monitora o sistema de arquivos via FS events nativos e enfileira desvios na fila de sincronização.

---

## 4. Integração Real de Grafo (`GraphifyKnowledgeProvider`)
Implementa o protocolo MCP sobre subprocessos em pipes stdio e operações IPC.
- `GraphifyKnowledgeProvider`: Adaptador oficial para a tecnologia de grafos. Métodos públicos:
  - `search(query)`: Busca por texto/similaridade no grafo.
  - `lookup(symbol)`: Localização direta de assinaturas e declarações da AST.
  - `dependencies(symbol)`: Nós que dependem do símbolo informado.
  - `references(symbol)`: Onde o símbolo é referenciado no código.
  - `symbols()`: Retorna todos os identificadores conhecidos do grafo.
- `SpawnMcpTransport`: Transporte IPC robusto rodando sobre subprocessos reais com controle de encerramento via `unref()`.

---

## 5. Projeção de AST (`AstProjectionEngine`)
Permite selecionar nós e arestas específicas sem carregar árvores de arquivos gigantescas.
- `AstProjectionEngine`: Executa filtros estruturais de expansão, recolhimento e podas de nós da AST baseando-se em profundidade e prioridade.

---

## 6. Compressão de Contexto (`ContextCompressor`)
Executa pipelines locais determinísticos de redução de volume de texto.
- `ContextCompressor`: Coordena o fluxo de normalização, deduplicação heurística (via hashes de conteúdo MD5/SHA) e seleção de prioridade de documentos.

---

## 7. Prompt Assembly V2 (`PromptAssembler`)
Motor determinístico de montagem final estruturada de prompts no orçamento do modelo.
- `PromptAssembler`: Orquestrador que formata e agrupa as seções ordenadas conforme o `PromptLayout` preset selecionado.
- `PromptBudget`: Controla os limites máximos e tokens reservados, estimando o orçamento útil de caracteres e tokens.
- `PromptSection`: Representa cada partição estrutural do prompt (System, Task, Rules, Context, etc.) e estima deterministicamente seu tamanho (heurística: caracteres / 4).
- `PromptOptimizer`: Pratica a poda linear e recursiva de seções opcionais de menor prioridade de forma automatizada caso o tamanho final exceda o orçamento útil do modelo.
- `PromptSnapshot`: Captura uma fotografia imutável com o resultado final do prompt, estatísticas de tokens gastos e métricas detalhadas.
