# Sprint V4.0-12 Report — Query Planner

## Status Final

**CONCLUÍDO COM SUCESSO**

- ✅ 9/9 testes de planejamento passando
- ✅ 2/2 testes de integração do KnowledgeEngine passando (com QueryPlanner integrado)
- ✅ 62/62 testes de compressão passando
- ✅ Zero erros de typecheck (`tsc --noEmit`)
- ✅ Build de produção do Next.js compilado com sucesso
- ✅ Zero regressões em toda a suíte de testes

---

## Arquivos Criados

| Arquivo | Responsabilidade |
|---------|-----------------|
| `planner/PlanningErrors.ts` | Erros específicos da camada de planejamento de consultas. |
| `planner/PlanningPolicy.ts` | Limites configuráveis da política de planejamento de buscas. |
| `planner/QueryNode.ts` | Interface representando cada nó de busca individual. |
| `planner/PlanningContext.ts` | Estado e preferências mapeadas para o Query Planner. |
| `planner/QueryPlan.ts` | Estrutura final com a ordem de execução topológica e estimativas do plano. |
| `planner/PlanningMetrics.ts` | Monitoramento e captura de métricas do planejamento. |
| `planner/PlanningSnapshot.ts` | Snapshot serializável do plano gerado para auditoria e logs. |
| `planner/PlanningStrategy.ts` | Arquitetura de estratégias flexíveis (Default/Simple). |
| `planner/QueryPlanner.ts` | Orquestrador principal da camada de planejamento de consulta. |
| `planner/QueryPlanner.test.ts` | Cobertura de 9 testes focados em planejamento e validações. |
| `planner/index.ts` | Barrel de exportações públicas do planner. |

---

## Arquivos Modificados

| Arquivo | Modificação |
|---------|-------------|
| `knowledge/index.ts` | Exportação de `./planner/index.ts` adicionada no barrel geral. |
| `knowledge/KnowledgeEngine.ts` | Integração do `QueryPlanner` logo no início do método `query()`. |
| `knowledge/KnowledgeEngine.test.ts` | Testes adicionais de integração com `QueryPlanner` e validação de políticas. |

---

## Arquitetura

O `QueryPlanner` atua estrategicamente logo na entrada da query para criar a estrutura ótima de busca:

```
                  KnowledgeRequest
                         │
                         ▼
┌────────────────── QueryPlanner ──────────────────┐
│   DefaultPlanningStrategy / PlanningContext      │
│                        │                         │
│                        ▼                         │
│       Cria nós (QueryNodes) decompilados         │
│                        │                         │
│                        ▼                         │
│   Calcula prioridades, dependências e custos     │
│                        │                         │
│                        ▼                         │
│      Valida contra a PlanningPolicy              │
└────────────────────────┬─────────────────────────┘
                         │
                         ▼
                     QueryPlan (Estrutura gerada)
                         │
                         ▼
        Busca do Provider / KnowledgeEngine
                         │
                         ▼
                 KnowledgeResolver
                         │
                         ▼
                 ContextCompressor
                         │
                         ▼
                  Prompt Assembly
```

---

## Fluxo de Execução

1. **Validação e Contexto**: Uma nova query é recebida pelo `KnowledgeEngine` que a envia ao `QueryPlanner` junto com o contexto (workspace, capabilities, providers disponíveis).
2. **Decomposição Estratégica**: Usando a estratégia ativa (como a decomposição de conectivos no `DefaultPlanningStrategy`), o planejador mapeia tópicos individuais e atribui providers adequados.
3. **Ordenação Topológica**: O planejador avalia dependências e monta grupos de execução (`executionOrder`) paralelos. Nós dependentes são colocados em camadas subsequentes, aumentando a profundidade (`depth`) do plano.
4. **Estimativa de Custos/Tokens**: Estima-se heuristicamente tokens e custos determinísticos antes de bater em bases de dados.
5. **Checagem de Políticas**: O plano é validado contra a `PlanningPolicy`. Se houver excessos, lança um erro tipado impedindo custos indesejados.
6. **Mapeamento e Resultados**: O plano é acoplado aos diagnósticos finais do resultado da busca, fornecendo rastreabilidade completa ao assemble de prompts.

---

## Políticas (`PlanningPolicy`)

| Parâmetro | Padrão | Descrição |
|-----------|--------|-----------|
| `maxProviders` | 5 | Número máximo de providers diferentes mapeados no plano. |
| `maxQueries` | 10 | Número máximo de consultas/nós gerados. |
| `maxDepth` | 3 | Profundidade de dependência de camadas (níveis paralelos). |
| `maxCost` | 100 | Custo máximo estimado aceitável para o plano. |
| `maxEstimatedTokens` | 16.000 | Limite de tokens estimados retornados/consumidos. |
| `maxDocuments` | 50 | Limite máximo estimado de documentos. |

---

## Estratégias (`PlanningStrategy`)

- **DefaultPlanningStrategy**: Analisa a query e decompõe o texto por conectivos para detectar múltiplas etapas interdependentes ou paralelas. Cria uma ordenação orientada a dependências (ex: configurar banco antes de configurar segurança).
- **SimplePlanningStrategy**: Mapeia a query inteira de forma direta para cada um dos providers de busca disponíveis sem fazer decomposição textual ou dependências.

---

## Métricas (`PlanningMetrics`)

O planejador monitora:
- `providersUsed`: Quantidade de bases utilizadas.
- `queriesGenerated`: Consultas geradas no plano.
- `estimatedTokens`: Tokens estimados.
- `estimatedDocuments`: Estimativa de documentos retornados.
- `estimatedCost`: Custo da estratégia.
- `executionTime`: Tempo de planejamento em milissegundos.

---

## Validações de Testes

| Suite | Testes | Status |
|-------|--------|--------|
| `QueryPlanner.test.ts` (Planner Unitário) | 9 | Pass ✅ |
| `KnowledgeEngine.test.ts` (Integração) | 2 | Pass ✅ |
| `ContextCompressor.test.ts` (Compressor) | 62 | Pass ✅ |
| `CLI.test.ts` (CLI/Geral) | 8 | Pass ✅ |
| **Total Workspace** | **81** | **Pass ✅** |

---

## Restrições Cumpridas

- **Não realiza buscas de dados** na etapa do planejador (totalmente determinístico).
- **Não acessa providers**, não utiliza Graphify ou APIs externas de IA.
- **Não acessa Cache** diretamente dentro do planejador.
- **Toda decisão é determinística** e segue a árvore de dependências computada topologicamente.
