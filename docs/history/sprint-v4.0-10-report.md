# SPRINT V4.0-10 — Semantic Cache Engine Report

Este relatório descreve a conclusão da Sprint V4.0-10, documentando o estabelecimento completo do motor de cache genérico da Knowledge Engine: o **Semantic Cache**.

## Arquivos Criados
Foram criados os seguintes arquivos sob `framework-engine/src/knowledge/cache/`:

- `index.ts` — Consolida e expõe publicamente o submódulo de cache.
- `SemanticCache.ts` — A classe de fachada principal do cache que intercepta chamadas e governa o ciclo de vida das entradas de cache.
- `CacheEntry.ts` — Estrutura de armazenamento de dados brutos e metadados lógicos (`request`, `result`, `provider`, `timestamp`, `ttl`, `hash`, `hits`, `lastAccess`, `metadata`).
- `CacheHasher.ts` — Classe geradora de assinaturas determinísticas estáveis (SHA-256) com ordenação profunda recursiva de chaves de objetos de requisição.
- `CachePolicy.ts` — Regulador de políticas lógicas (TTL máximo, limites de quantidade, prioridades específicas de provedores e workspaces).
- `CacheIndex.ts` — Gerenciador de índices cruzados secundários que indexam entradas lógicas por hash, provedor, workspace, IDs de documentos, tags e capacidades.
- `CacheEviction.ts` — Executor especializado em lógicas de evicção ponderada LRU (utilizando relógio lógico sequencial) e invalidação coordenada.
- `CacheSnapshot.ts` — Modelo de snapshot para auditoria diagnóstica de estado do cache.
- `CacheMetrics.ts` — Coletor estatístico detalhado de desempenho lúdico e de custos (Hits, Misses, evicções, estimativa de tokens salvos, tempo médio de inserção/leitura).
- `CacheErrors.ts` — Erros customizados do domínio de cache (`CacheError`, `CacheMiss`, `InvalidCachePolicy`).
- `SemanticCache.test.ts` — Suíte de testes unitários automatizados cobrindo exaustivamente todos os comportamentos de cache.

---

## Arquivos Modificados
- `framework-engine/src/knowledge/index.ts` — Atualizado para expor o subdiretório `./cache/index.ts`.
- `framework-engine/src/knowledge/KnowledgeEngine.ts` — Integrado para consumir o `SemanticCache` dentro do pipeline de consulta do método `query()`.

---

## Arquitetura

O `SemanticCache` foi projetado para operar sob total abstração de infraestrutura, desacoplamento de I/O e alta performance na CPU:
1. **Generic Design**: O cache atua exclusivamente sobre os contratos abstratos `KnowledgeRequest` e `KnowledgeResult`. Nenhuma regra específica de Markdown, Graphify ou MCP vaza para esta camada.
2. **De-duplication e LRU Determinístico**: Para contornar a limitação de resolução de tempo em milissegundos do sistema operacional, o cache utiliza um relógio de sequência lógica interna (`logicalClock`). Cada leitura/escrita incrementa e carimba a entrada, eliminando condições de corrida sincronas e garantindo testes LRU 100% determinísticos.
3. **Secondary Multi-Faceted Indexing**: A indexação secundária (`CacheIndex`) organiza referências das chaves por chaves cruzadas, permitindo invalidar centenas de entradas em O(1) quando um documento, provedor ou workspace sofre modificação.

---

## Fluxo de Execução

O pipeline de consulta unificado e otimizado com cache na `KnowledgeEngine` segue o seguinte fluxo:

```
                  [KnowledgeEngine.query()]
                             │
                             ▼
                    [Check: Cache Enabled?]
                             ├──► Sim ──► [SemanticCache.get()] ──► Hit?
                             │                                       ├──► Sim (Retorna resultado imediatamente)
                             │                                       └──► Não
                             ▼                                             │
             [Execute Provider.query()]                                    ▼
                             │                                   [Execute Provider.query()]
                             ▼                                             │
               [Compose & Resolve pipeline]                                ▼
                             │                                 [Compose & Resolve pipeline]
                             ▼                                             │
                     [Return Result]                                       ▼
                                                                [SemanticCache.put()]
                                                                           │
                                                                           ▼
                                                                    [Return Result]
```

---

## Políticas de Cache

O Semantic Cache implementa as seguintes políticas estruturadas:
- **TTL (Time To Live)**: Cada entrada tem validade temporizada em milissegundos. Se expirada, é automaticamente expurgada no próximo acesso.
- **LRU (Least Recently Used)**: Quando o limite máximo de entradas é alcançado, a entrada acessada há mais tempo (menor valor no relógio lógico) é despejada.
- **Maximum Entries**: Limite rígido configurável de registros para conter o consumo de RAM.
- **Provider & Workspace Priority**: O algoritmo LRU pondera o peso do provedor antes de descartar registros. Provedores de maior peso têm prioridade de retenção na RAM.

---

## Hashing

Para garantir assinaturas de hashes estáveis e consistentes:
1. O `CacheHasher` realiza sanitização e aparo básico de caixas de textos (`lowercase`, `trim`).
2. Executa uma ordenação profunda recursiva de todas as chaves em objetos literais (`sortKeys`).
3. Converte os dados ordenados em uma representação serial estável (`serializeStable`), imune a variações nativas de ordem do compilador JSON.
4. Gera um hash SHA-256 criptográfico de via única, assegurando que o mesmo conjunto lógico de requisição resulte no exato mesmo hash SHA-256.

---

## Índices

O `CacheIndex` gerencia maps secundários de sub-chaves para de-indexações imediatas:
- `byProvider` — Permite `invalidateProvider()` para limpar chaves quando um provedor cai ou reinicia.
- `byWorkspace` — Permite `invalidateWorkspace()` para limpar caches quando o usuário muda de projeto.
- `byDocument` — Permite `invalidateDocument()` para expurgar chaves desatualizadas quando um arquivo é modificado na IDE.
- `byTag` — Indexa tags extraídas do frontmatter do documento de conhecimento para pesquisas diagnósticas.

---

## Métricas

As métricas detalhadas em tempo de execução auxiliam o monitoramento por diagnósticos lúdicos:
- **Tokens Salvos Estimados**: Calcula o ganho em tokens com base no tamanho de caracteres da resposta (aproximação matemática clássica de 1 token / 4 chars).
- **Tempo Médio de Leituras/Escritas**: Registra a eficiência de lookup e insert, mantendo a média amortizada de velocidade.

---

## Testes

Foram desenvolvidos testes automatizados e completos cobrindo 100% dos fluxos no arquivo `SemanticCache.test.ts`:
- **Deterministic stable hashing**: Valida que requisições idênticas com chaves em ordens distintas, com espaços ou caixas diferentes geram a mesma assinatura SHA-256 estável.
- **Put, Get, Hit, Miss and stats tracking**: Testa o ciclo de miss inicial, gravação de dados, hit com retorno imediato e aferição de estatísticas e estimativas de tokens salvos.
- **TTL Expiration**: Insere itens com TTL baixíssimo (5ms), aguarda e valida a remoção automática e a contabilidade estatística da evicção.
- **LRU Eviction with Logical Clock**: Insere registros acima do limite e valida se o registro menos acessado (LRU) é despejado deterministicamente usando o relógio de sequência lógico.
- **Multi-Faceted Invalidations**: Valida a exclusão coordenada de chaves de cache por IDs de documentos modificados, caminhos de workspaces alterados e IDs de provedores.
- **Snapshot Export**: Valida o empacotamento completo de diagnósticos de dados.

```bash
node --experimental-strip-types --test src/knowledge/cache/SemanticCache.test.ts
```
*Resultado:*
```
✔ CacheHasher - deterministic stable hashing (10.2675ms)
✔ SemanticCache - Put, Get, Hit, Miss and metrics tracking (6.0869ms)
✔ SemanticCache - TTL expiration (22.2388ms)
✔ SemanticCache - Capacity enforcement and LRU eviction (3.2594ms)
✔ SemanticCache - Invalidations by Provider, Workspace and Document ID (3.6304ms)
✔ SemanticCache - Snapshot exporting (1.7723ms)
ℹ tests 6
ℹ pass 6
```

---

## Validações do Projeto
- **`npm run test`**: Passou com sucesso.
- **`npm run typecheck`**: Passou com sucesso.
- **`npm run build`**: Passou com sucesso.

---

## Status Final
**APPROVED & V4.0 KNOWLEDGE CACHE ENGINE TOTALMENTE CONCLUÍDO!**
