# Sprint V4.1-02 — Work Unit Runtime

## Arquivos Criados

- `src/workunit/WorkUnit.ts`
- `src/workunit/WorkUnitParser.ts`
- `src/workunit/WorkUnitLoader.ts`
- `src/workunit/WorkUnitValidator.ts`
- `src/workunit/WorkUnitMetadata.ts`
- `src/workunit/WorkUnitErrors.ts`
- `src/workunit/WorkUnitSchema.ts`
- `src/workunit/index.ts`
- `src/workunit/WorkUnit.test.ts`
- `sprint-v4.1-02-report.md`

## Arquivos Modificados

- `src/index.ts`: exports públicos do módulo Work Unit, com alias para preservar o contrato legado `WorkUnit` do contexto existente.
- `src/runtime/Runtime.ts`: exposição de `loadWorkUnit(path)`.
- `src/runtime/RuntimeExecutor.ts`: fluxo assíncrono de leitura, parsing, validação e inserção no contexto.
- `src/runtime/RuntimeContext.ts`: referência `currentWorkUnit`.
- `src/runtime/RuntimeSnapshot.ts`: campo `loadedWorkUnit`.
- `src/runtime/RuntimeMetrics.ts`: tempos de leitura, parsing e validação.

Nenhum Provider, Knowledge Engine, GraphManager, Planner, Prompt Assembly, Cache ou CLI foi modificado.

## Arquitetura

O módulo `workunit/` possui responsabilidades separadas:

```text
WorkUnitLoader -> WorkUnitParser -> WorkUnitValidator -> RuntimeContext
```

O loader somente lê o conteúdo bruto. O parser converte Markdown em contrato estruturado. O validator aplica o schema e o Runtime armazena apenas a referência validada.

## Pipeline Atualizado

O estágio de entrada agora pode carregar uma Work Unit antes da execução:

```text
Runtime
  -> WorkUnitLoader
  -> WorkUnitParser
  -> WorkUnitValidator
  -> RuntimeContext.currentWorkUnit
```

Nenhuma resolução de conhecimento, Graphify, Prompt Assembly ou execução real é acionada.

## Estrutura Work Unit

O contrato contém `id`, `title`, `description`, `objective`, `capability`, `workflow`, `priority`, `tags`, `status`, `author`, `createdAt` e `rawContent`. Também preserva `metadata`, `body`, `instructions`, `references` e `checklist`.

## Testes

`src/workunit/WorkUnit.test.ts` cobre:

- arquivo inexistente;
- carregamento do Markdown bruto;
- parsing e separação de seções;
- metadata inválida;
- campos obrigatórios ausentes;
- capability e workflow inválidos;
- integração de carregamento no Runtime;
- estado `Failed` em erro de leitura.

## Validações

- `node --experimental-strip-types --test framework-engine/src/workunit/WorkUnit.test.ts`: **9 aprovados**.
- `node --experimental-strip-types --test framework-engine/src/runtime/Runtime.test.ts`: **7 aprovados**.
- `npm run test`: **8 aprovados**.
- `npm run build`: **aprovado**.
- `npm run typecheck`: **aprovado**.

## Decisões Técnicas

- O loader usa leitura UTF-8 assíncrona e converte ausência do arquivo em `WorkUnitNotFound`.
- O Markdown usa front matter delimitado por `---`, com fallback para headings de título, descrição e objetivo.
- Apenas `id`, `capability`, `workflow` e `objective` são campos estruturais obrigatórios do validator.
- Capability e workflow aceitam apenas identificadores sem espaços, mantendo resolução futura determinística.
- O Runtime retorna a `Initialized` após carregamento válido, pois nenhuma etapa de execução foi iniciada.
- Falhas de leitura, parsing ou validação colocam o Runtime em `Failed` e preservam os erros específicos.
