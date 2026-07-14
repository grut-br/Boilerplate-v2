# SPRINT V4.0-02 — Knowledge Provider Runtime Report

Este relatório descreve a conclusão da Sprint V4.0-02, com o estabelecimento completo da infraestrutura de runtime para registro, criação e execução desacoplada de Knowledge Providers.

## Arquivos Criados
Foram criados os seguintes arquivos sob `framework-engine/src/knowledge/runtime/`:

- `index.ts` — Consolida e reexporta todo o módulo de runtime.
- `KnowledgeProviderRegistry.ts` — Mecanismo central para registrar e gerenciar instâncias de provedores de conhecimento.
- `KnowledgeProviderFactory.ts` — Factory baseada em criadores (creators) registrados dinamicamente, permitindo extensão futura sem acoplamento.
- `KnowledgeProviderExecutor.ts` — Executor unificado das consultas aos provedores, gerenciando também o tratamento de erros e gravação de métricas.
- `KnowledgeProviderMetrics.ts` — Estrutura de gravação e gerenciamento de métricas em memória (duração, contagem de nós, cache, erros, etc.).
- `KnowledgeProviderStatus.ts` — Enum e tipos com os estados do provedor (`Registered`, `Ready`, `Running`, `Unavailable`, `Failed`).
- `KnowledgeRuntimeErrors.ts` — Erros customizados do runtime (`ProviderAlreadyRegistered`, `ProviderNotFound`, `ProviderExecutionError`, `InvalidProviderState`).
- `KnowledgeProviderRuntime.test.ts` — Suíte de testes unitários automatizados para todo o runtime.

---

## Arquivos Modificados
- `framework-engine/src/knowledge/index.ts` — Atualizado para expor o módulo `./runtime/index.ts` publicamente.

---

## Arquitetura

O design do runtime respeita perfeitamente as decisões arquiteturais globais de desacoplamento absoluto e interfaces abstratas:
1. **Desacoplamento de Instanciação (`Factory`)**: A `KnowledgeProviderFactory` evita herança rígida ou imports de provedores específicos. Ela permite o registro dinâmico de funções criadoras (`KnowledgeProviderCreator`), mantendo o core do framework agnóstico.
2. **Abstração Total de Execução (`Executor`)**: O `KnowledgeProviderExecutor` executa chamadas delegadas exclusivamente pela interface abstrata `KnowledgeProvider` definida na Sprint 1. Não há verificações de tipo concretas, heranças indesejadas, casts ou acoplamentos de frameworks externos.
3. **Gerenciamento de Métricas**: O executor automaticamente monitora a duração da query, o status do cache e as estatísticas dos dados retornados, armazenando de forma estruturada nas métricas internas do sistema.

---

## Contratos Públicos

### `KnowledgeProviderRegistry`
```typescript
export class KnowledgeProviderRegistry {
  register(provider: KnowledgeProvider): this;
  unregister(id: string): boolean;
  get(id: string): KnowledgeProvider;
  has(id: string): boolean;
  list(): KnowledgeProvider[];
  clear(): void;
}
```

### `KnowledgeProviderFactory`
```typescript
export type KnowledgeProviderCreator = (config: KnowledgeConfiguration) => KnowledgeProvider;

export class KnowledgeProviderFactory {
  register(type: string, creator: KnowledgeProviderCreator): this;
  create(type: string, config: KnowledgeConfiguration): KnowledgeProvider;
  has(type: string): boolean;
  clear(): void;
}
```

### `KnowledgeProviderExecutor`
```typescript
export class KnowledgeProviderExecutor {
  constructor(registry?: KnowledgeProviderRegistry, metrics?: KnowledgeProviderMetrics);
  execute(providerOrId: KnowledgeProvider | string, request: KnowledgeRequest): Promise<KnowledgeResult>;
  getMetrics(): KnowledgeProviderMetrics;
}
```

---

## Fluxo de Execução

1. **Injeção/Registro**: O Provedor é instanciado via `KnowledgeProviderFactory.create()` e registrado no `KnowledgeProviderRegistry`.
2. **Resolução**: Ao receber uma requisição de conhecimento, o `KnowledgeProviderExecutor` resolve a instância do provedor (caso seja passado por ID através do registry).
3. **Invocação e Gravação**: O executor chama de forma assíncrona o método `query()` do provedor e encapsula a sua resposta em um `KnowledgeResult`.
4. **Captura de Erros**: Qualquer falha controlada ou não do provedor gera um log na estrutura de métricas correspondente e é relançada sob a forma de `ProviderExecutionError`.

---

## Testes Executados

Foram criados testes robustos cobrindo 100% dos cenários solicitados no arquivo `KnowledgeProviderRuntime.test.ts`:
- **Registry**: Inclusão de provedor, prevenção de IDs duplicados, verificação de existência, listagem e remoção segura.
- **Factory**: Registro de criador baseado em contrato, instanciação de provedor mockado e tratamento de tipo não registrado.
- **Executor & Métricas**: Execução com sucesso verificando duração e dados, gravação correta de métricas, interrupção de fluxo com `ProviderExecutionError` para falhas do banco mockado, e tratamento de provedor não localizado.

```bash
node --experimental-strip-types --test src/knowledge/runtime/KnowledgeProviderRuntime.test.ts
```
*Resultado:*
```
✔ KnowledgeProviderRegistry - registration, duplicate prevention, removal (4.5426ms)
✔ KnowledgeProviderFactory - contract-based registration and creation (0.6095ms)
✔ KnowledgeProviderExecutor - execution, metrics and controlled failure (1.7377ms)
ℹ tests 3
ℹ pass 3
```

---

## Validações do Projeto
- **`npm run test`**: Passou com sucesso.
- **`npm run typecheck`**: Passou com sucesso.
- **`npm run build`**: Passou com sucesso.

---

## Status Final
**APPROVED & READY FOR SPRINT V4.0-03**
