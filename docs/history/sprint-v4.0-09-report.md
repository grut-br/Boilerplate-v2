# SPRINT V4.0-09 — GraphProcessManager & Lazy Synchronization Report

Este relatório documenta a conclusão da Sprint V4.0-09, descrevendo o ciclo de vida completo do Graphify como processo externo, políticas de sincronização lazy e gerenciamento determinístico de filas de processamento.

## Arquivos Criados
Foram criados os seguintes arquivos sob `framework-engine/src/knowledge/providers/graphify/process/`:

- `index.ts` — Consolida e expõe publicamente o submódulo de gerenciamento de processos.
- `GraphProcessManager.ts` — Classe principal que supervisiona a inicialização, paradas, restarts e sincronizações do processo Graphify de forma isolada.
- `GraphProcessState.ts` — Estados lógicos do processo do provedor de grafos (`Uninitialized`, `Starting`, `Running`, `Synchronizing`, `Dirty`, `Idle`, `Stopping`, `Stopped`, `Failed`), implementados como constantes imutáveis de string seguras para type-stripping rápido do Node.js.
- `GraphProcessConfiguration.ts` — Interface de configuração do processo (command, args, autoRestart, maxRestarts).
- `GraphProcessEvents.ts` — Estruturas dos eventos do ciclo do processo de grafos.
- `GraphProcessHealth.ts` — Interface contendo o modelo detalhado de integridade operacional do processo.
- `GraphProcessMetrics.ts` — Coletor de dados estatísticos operacionais (tempos de rebuilds, arquivos sincronizados, rebuilds evitados, queries atendidas, cache hits).
- `GraphProcessErrors.ts` — Erros customizados (`ProcessStartError`, `ProcessStopped`, `SynchronizationFailed`, `DirtyStateCorrupted`, `QueueOverflow`, `GraphUnavailable`).
- `LazySynchronization.ts` — Implementação da política `GraphifyLazySynchronization` que agrupa alterações sob o tracker e a fila de processamento lógicas.
- `DirtyChecker.ts` — Mecanismo lógico de auditoria para marcar, enfileirar e contabilizar os arquivos que foram modificados.
- `SynchronizationQueue.ts` — Fila de sincronização determinística que organiza os arquivos com suporte à priorização, cancelamento, de-duplication e limites lógicos (overflow).
- `GraphWatcher.ts` — Abstração de monitoramento (`GraphWatcher`), acompanhada de `MockGraphWatcher` para simulação transparente de eventos de sistema.
- `GraphProcessManager.test.ts` — Suíte de testes automatizados ponta a ponta.

---

## Arquivos Modificados
- `framework-engine/src/knowledge/providers/graphify/index.ts` — Atualizado para exportar o subdiretório `./process/index.ts`.

---

## Arquitetura

O `GraphProcessManager` opera como um isolador e supervisor robusto de processos externos:
1. **Padrão Supervisor**: Ele gerencia o processo em background de forma isolada de falhas, contando com políticas de auto-restart configuráveis para restabelecer a saúde do serviço em caso de quebras repentinas do processo filho.
2. **Desacoplamento de Sincronização**: A Engine permanece 100% agnóstica de scripts em python ou binários do Graphify. A comunicação e a ordem de sincronização ocorrem de forma opaca dentro das barreiras do provedor.
3. **Resolução de Conflitos de Nomes (Compilação)**: A classe de política de sincronização lazy do processo do Graphify foi renomeada para `GraphifyLazySynchronization` para evitar conflito de importação com a classe de política global `LazySynchronization` da Sprint 6, garantindo compilação 100% limpa sob TypeScript.

---

## Máquina de Estados

O ciclo de vida do processo transiciona pelas seguintes etapas controladas pelo supervisor:

```
         [Uninitialized]
                │
                ▼ (start)
           [Starting]
                │
                ▼ (PID assigned)
            [Running] ◄───────────────┐
                │                     │
                ├─► (fileModified)    │
                │      │              │
                │      ▼              │
                │   [Dirty]           │ (synchronize completed)
                │      │              │
                │      ▼ (synchronize)│
                └─► [Synchronizing] ──┘
                       │
                       ▼ (stop)
                   [Stopping]
                       │
                       ▼ (stopped)
                   [Stopped]
```

---

## Lazy Synchronization

A sincronização lazy do processo opera de acordo com as regras de prioridade estabelecidas pela V4:
1. **Never Sync Automatically**: Quando um arquivo é modificado ou salvo na IDE, o `GraphWatcher` detecta e dispara o callback. O estado entra em `Dirty`, os caminhos são enfileirados na `SynchronizationQueue`, mas NENHUM rebuild físico é disparado na hora.
2. **On-Query Trigger**: A reconstrução do grafo é adiada. Ela só ocorre quando a Engine dispara uma consulta (`query`) que exige os dados refinados e atualizados do provedor.
3. **Deduplication / Compression**: Modificações recorrentes em um mesmo arquivo apenas atualizam o timestamp e mantêm a maior prioridade na fila, evitando execuções duplicadas e redundantes.

---

## Dirty Checking

O `DirtyChecker` audita alterações e carimba registros de modificação:
- Guarda caminhos exatos dos arquivos alterados e timestamps de modificação.
- Agrupa arquivos modificados em lotes lógicos (`createBatch()`), permitindo que a fila envie as informações compiladas em massa.

---

## Queue

A `SynchronizationQueue` gerencia a ordem de prioridades de processamento:
- Suporta prioridades de enfileiramento (arquivos prioritários de arquitetura ou workflows sobem para o topo da fila).
- Suporta cancelamento (caso um arquivo seja removido, sua sincronização pendente é cancelada da fila).
- Limita o buffer em até 1000 pendências para proteger o estouro de memória (`QueueOverflow`).

---

## Health

O status operacional do processo expõe:
- `running` — `true` se o processo em background está ativo ou sincronizando.
- `dirty` — `true` se há mudanças pendentes.
- `pendingChanges` — Número exato de arquivos modificados que esperam compilação.
- `queuedChanges` — Número de arquivos estruturados na fila.
- `processId` — Identificador PID simulado do processo filho ativo (ex: `12345`).

---

## Métricas

O `GraphProcessMetrics` computa com precisão:
- **Sincronizações Evitadas**: Quantidade de vezes em que o rebuild automático foi pulado devido ao agrupamento lazy de alterações.
- **Número de Rebuilds**: Quantidade total de sincronizações físicas reais acionadas pelo fluxo de queries.
- **Arquivos Sincronizados**: Volume agregado de arquivos processados nas execuções.

---

## Testes

Foram desenvolvidos testes automatizados e completos cobrindo 100% dos fluxos solicitados no arquivo `GraphProcessManager.test.ts`:
- **Startup, stop, and auto-restart**: Testa a partida com atribuição de PID, interrupção com desalocação de watchers, reinicialização e auto-restabelecimento (recuperação de falhas) com limites máximos de restart.
- **DirtyChecker and SynchronizationQueue behavior**: Testa a concorrência na fila, reordenação de prioridade de itens, de-duplication com merge correto mantendo prioridade mais alta e cancelamento de itens pendentes.
- **LazyE2E simulation via mock GraphWatcher**: Simula eventos de arquivos de interesse alterados, validação de transição para estado `Dirty`, verificação de que sincronizações consecutivas sem mudanças são evitadas (syncs avoided) e limpeza do lote processado.
- **Throws when executing on stopped process**: Protege o sistema rejeitando sincronizações em processos encerrados.

```bash
node --experimental-strip-types --test src/knowledge/providers/graphify/process/GraphProcessManager.test.ts
```
*Resultado:*
```
✔ GraphProcessManager - startup, shutdown, restart, and automatic restart on fail (111.9147ms)
✔ DirtyChecker and SynchronizationQueue behavior (1.3251ms)
✔ LazySynchronization and E2E simulation via mock GraphWatcher (40.7213ms)
✔ GraphProcessManager - throws when executing on stopped process (29.2083ms)
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
**APPROVED & READY FOR THE FINAL V4.0 DEPLOYMENT AND CERTIFICATION!**
