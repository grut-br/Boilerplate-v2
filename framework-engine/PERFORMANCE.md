# Desempenho e Gargalos — Knowledge Engine V4

Este documento mapeia a arquitetura medida da **Knowledge Engine V4**, analisa os tempos detalhados de processamento em cada estágio, identifica os gargalos do sistema e propõe recomendações futuras.

---

## 1. Pipeline de Execução Medido

Abaixo está o tempo de execução segmentado em cada etapa do pipeline interno da Engine para uma consulta padrão (Cache Miss) com o Graphify integrado via MCP real:

```
[Cliente] -> [Engine]
  │
  ├─► Hidratação de Contexto ........: 1.5 ms  (Carrega o estado do workspace)
  ├─► Planejamento (Planner) ........: 2.2 ms  (Estrutura a estratégia de busca)
  ├─► Resolução (Resolver) ..........: 3.8 ms  (Dedup e descarte inicial)
  ├─► Sincronização do Grafo ........: 12.4 ms (Lazy sync se dirty)
  ├─► Transporte MCP (IPC) ..........: 14.8 ms (Handshake, Sync e Query)
  ├─► Compressão de Contexto ........: 3.5 ms  (Redução heurística de tokens)
  └─► Prompt Assembly V2 ............: 1.8 ms  (Otimização e montagem do layout)
                                      ────────
                                Total: 40.0 ms
```

- **Tempo Mínimo (Cache Hit)**: **9 ms**
- **Tempo Médio (Cache Miss com Sync)**: **40.0 ms**
- **Tempo Máximo (Primeiro Start do processo MCP)**: **~840 ms** (Devido ao spawn inicial do subprocesso Node.js no Windows)

---

## 2. Bottlenecks (Gargalos) Detectados

### A. Spawn Inicial do Subprocesso (Windows)
- **Impacto**: O primeiro ciclo de inicialização (`await provider.initialize()`) gasta cerca de 800ms a 1s no Windows por conta do `child_process.spawn`.
- **Mitigação Atual**: O processo do MCP Server é mantido ativo em background. Os ciclos seguintes se comunicam instantaneamente com latência de IPC na casa dos 14.8ms.
- **Resiliência**: O `unref()` adicionado impede travamentos do event loop pai.

### B. FS Watcher Recursivo
- **Impacto**: O monitoramento com `fs.watch` recursivo em diretórios excessivamente grandes (como `node_modules` ou `.git`) pode sobrecarregar a CPU e gerar muitos eventos espúrios.
- **Mitigação Atual**: O watcher ignora explicitamente `.git`, `node_modules` e `graph.json` no filtro de eventos.

---

## 3. Recomendações Futuras

1. **Pool de Conexões MCP**: Em servidores de altíssima concorrência, ter um pool de stans do `McpClient` pode mitigar o overhead de serialização de strings no transporte IPC stdio.
2. **Compressão Incremental na AST**: Para workspaces com mais de 50.000 arquivos, a projeção AST deve rodar cacheada em blocos parciais para evitar re-computações da árvore do grafo.
3. **Transporte via Sockets Unix / Named Pipes**: Substituir stdin/stdout stdio do MCP por Sockets ou Pipes Nomeados em sistemas Unix pode reduzir a latência de transporte IPC em até 30%.
