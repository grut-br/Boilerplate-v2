# SPRINT V4.0-04 — Knowledge Provider Composition Report

Este relatório documenta a entrega da Sprint V4.0-04, com o estabelecimento completo da camada de composição, prioridade e seleção de Knowledge Providers, além de sua integração na `KnowledgeEngine`.

## Arquivos Criados
Foram criados os seguintes arquivos sob `framework-engine/src/knowledge/composition/`:

- `index.ts` — Consolida e expõe publicamente o submódulo de composição.
- `KnowledgeComposer.ts` — Classe principal que gerencia o fluxo de mesclagem e filtragem de resultados obtidos de múltiplos provedores.
- `KnowledgeAggregation.ts` — Mecanismo de fusão determinística de `KnowledgeResult` que resolve duplicidades e mescla metadados e diagnósticos respeitando prioridades de provedores.
- `KnowledgePriority.ts` — Sistema de prioridades dinâmicas (iniciando com Markdown Provider = 1) usado na ordenação e na resolução de conflitos.
- `KnowledgeSelection.ts` — Motor de seleção por tipo, metadados, tags e limite de documentos/nós, sem usar busca semântica.
- `KnowledgeCompositionErrors.ts` — Erros específicos do domínio de composição (`CompositionError`, `DuplicateKnowledgeDocument`, `InvalidKnowledgeComposition`, `ProviderConflict`).
- `KnowledgeComposition.test.ts` — Suíte de testes unitários abrangente para cobrir os fluxos do composer.

---

## Arquivos Modificados
- `framework-engine/src/knowledge/index.ts` — Atualizado para exportar o subdiretório `./composition/index.ts`.
- `framework-engine/src/knowledge/KnowledgeEngine.ts` — Integrado para consumir `KnowledgeComposer` na consolidação e filtragem da query.

---

## Arquitetura

O design da composição foi concebido seguindo estritamente os princípios de responsabilidade única (SRP) e alta extensibilidade:
1. **Engine Unificada & Focada**: A `KnowledgeEngine` não herda regras de merge ou filtros de seleção de documentos. Ela apenas orquestra o ciclo de vida e delega a consolidação dos dados para o `KnowledgeComposer`.
2. **Resolução de Conflitos Baseada em Prioridade**: Se múltiplos provedores retornarem documentos com o mesmo ID, o `KnowledgeAggregation` avalia o nível de prioridade cadastrado no `KnowledgePriority`. O documento do provedor de maior prioridade sobresscreve os dados do de menor prioridade.
3. **Seleção Limpa**: O `KnowledgeSelection` filtra as respostas consolidadas aplicando critérios determinísticos de extensão, metadados correspondentes, tags no frontmatter e limites de quantidade de documentos, permanecendo totalmente agnóstico de redes neuronais, buscas vetoriais ou modelos matemáticos de embeddings.

---

## Fluxo de Composição

1. **Agrupamento**: O `KnowledgeComposer` recebe um array contendo as respostas estruturadas de cada provedor junto com seu ID de origem: `Array<{ providerId: string, result: KnowledgeResult }>`.
2. **Ordenação por Prioridade**: O `KnowledgeAggregation` ordena os resultados do maior para o menor peso de prioridade definido em `KnowledgePriority`.
3. **Mesclagem Determinística**:
   - **Documents / Nodes**: Mesclados sequencialmente. O primeiro ID único encontrado em um provedor de maior prioridade é mantido; os IDs repetidos subsequentes de menor prioridade são filtrados (de-duplication).
   - **Metadata / Diagnostics**: Mesclados de forma recursiva de baixo para alto peso, permitindo que chaves do provedor prioritário fiquem por cima.
   - **Duration**: Somada para representar o tempo total de processamento agregado de todos os provedores participantes da query.
4. **Seleção de Dados**: O `KnowledgeSelection` recebe o resultado unificado e filtra os documentos e nós que combinam com os critérios de busca específicos (ex: apenas arquivos `md`, que contenham a tag `typescript`, ou limitando o output em no máximo N documentos).

---

## Fluxo Engine → Executor → Composer

O fluxo de processamento de uma busca de conhecimento estruturada na V4 ocorre na seguinte ordem:

```
[Cliente] 
   │
   ▼
1. KnowledgeEngine.query(request, selectionOptions)
   │
   ├─► 2. Invoca Provedor Ativo (config.provider.query)
   │      │
   │      ▼ (Caso o runtime opcional de executor seja utilizado)
   │   3. KnowledgeProviderExecutor.execute(provider, request)
   │      │  ├─► Executa query no banco físico/pasta Markdown
   │      │  └─► Registra métricas de desempenho & tempo
   │      ▼
   ├─► 4. Recebe o KnowledgeResult bruto do Provedor
   │
   ├─► 5. Repassa ao KnowledgeComposer.compose([ results ], selectionOptions)
   │      │  ├─► Mescla com outros resultados via KnowledgeAggregation (de-duplicate)
   │      │  └─► Filtra os documentos de interesse via KnowledgeSelection
   │      ▼
   └─► 6. Retorna o resultado final consolidado, limpo e estruturado ao Cliente
```

---

## Testes Executados

Foram criados testes robustos e de alta cobertura em `KnowledgeComposition.test.ts`:
- **KnowledgePriority**: Testa a definição de prioridades em tempo de execução e a ordenação decrescente de objetos.
- **KnowledgeAggregation**: Valida a mesclagem estruturada de múltiplos resultados, garantindo que o documento duplicado de maior prioridade (`high-priority`) substitua os dados do de menor prioridade (`low-priority`), somando as durações e mesclando os metadados.
- **KnowledgeSelection**: Testa a filtragem por extensão do arquivo (`md`), por campos exatos do metadata (`category: 'guide'`), presença obrigatória de múltiplas tags no frontmatter (`typescript` e `node`), e limites máximos de saída.
- **KnowledgeComposer (E2E)**: Simula o processamento completo de composição e seleção integrados de ponta a ponta.

```bash
node --experimental-strip-types --test src/knowledge/composition/KnowledgeComposition.test.ts
```
*Resultado:*
```
✔ KnowledgePriority - default priorities and sorting (1.9517ms)
✔ KnowledgeAggregation - merge documents, metadata and diagnostics with duplicate resolution (1.0932ms)
✔ KnowledgeSelection - filtering by type, metadata, tags, limit (0.7975ms)
✔ KnowledgeComposer - end-to-end composer execution with selection (0.6024ms)
ℹ tests 4
ℹ pass 4
```

---

## Validações do Projeto
- **`npm run test`**: Passou com sucesso.
- **`npm run typecheck`**: Passou com sucesso.
- **`npm run build`**: Passou com sucesso.

---

## Status Final
**APPROVED & READY FOR NEXT SPRINT (V4.0-05)**
