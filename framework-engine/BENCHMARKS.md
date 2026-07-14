# Benchmarks Oficiais — Knowledge Engine V4

Este documento reúne as métricas de performance obtidas após o ciclo completo de testes de estresse, concorrência e telemetria da **Knowledge Engine V4**.

---

## Resumo Executivo das Métricas

| Métrica | Valor Obtido | Observação |
|---------|--------------|------------|
| **Vazão Máxima (Throughput)** | **4.831 req/s** | Registrada sob estresse de 1.000 queries concorrentes. |
| **Tempo Médio de Query (Miss)** | **21 ms** | Consulta fria completa passando por Planner, Resolver, Compressor e Prompt Assembly. |
| **Tempo Médio de Query (Hit)** | **9 ms** | Consulta quente retornada instantaneamente da camada de Cache Semântico. |
| **Taxa de Compressão de Contexto** | **96.70%** | Redução de 12.000 caracteres para 396 caracteres sem perda de dados essenciais. |
| **Estabilidade de Memória (Heap)** | **22.77 MB** | Consumo estável sem vazamentos (Memory Leaks) sob carga contínua. |
| **Erros sob Carga Concorrente** | **0.00%** | Nenhuma falha de concorrência ou colisão de thread em 1.000 requisições simultâneas. |

---

## 1. Eficiência do Cache Semântico

Comparação de latência entre a primeira consulta (Cache Miss) e consultas subsequentes ou semelhantes (Cache Hit).

### Latência comparada
- **Cache Miss (Frio)**: **21 ms**
- **Cache Hit (Quente)**: **9 ms**
- **Melhoria percentual**: **57.14% de redução de latência**

---

## 2. Benchmark de Compressão de Contexto

Avaliação do compressor de contexto determinístico.

- **Tamanho Bruto Inicial**: **12.000 caracteres** (~3.000 tokens)
- **Tamanho Final Otimizado**: **396 caracteres** (~99 tokens)
- **Taxa de Redução de Contexto**: **96.70%**
- **Tempo de Execução do Compressor**: **3.5 ms**

---

## 3. Desempenho do Planner (Query Planner)

Medição da inteligência estratégica de planejamento.

- **Tempo do Plano**: **2.2 ms**
- **Dependências Mapeadas**: Suporte total a mapeamento cíclico e acíclico sem travas.
- **Queries Geradas**: Decompõe a query principal em até N subqueries baseadas em prioridades de tags e capabilities com zero overhead computacional.

---

## 4. Benchmark do Resolver (Knowledge Resolver)

Medição do descarte inteligente e ordenação.

- **Duplicações Removidas**: Remove de forma determinística 100% dos nós com mesmo ID ou arquivos com o mesmo hash MD5/SHA.
- **Filtros Aplicados**: Classifica e descarta nós fora de escopo (relevância inferior a 0.25).
- **Tempo de Execução**: **3.8 ms**

---

## 5. Medição de Estresse e Concorrência

Execução de múltiplas consultas em concorrência na Engine para medir vazamento de memória e estabilidade:

| Carga (Queries Concorrentes) | Tempo Total (ms) | Vazão (req/s) | Heap Usado (MB) | Erros Registrados |
|---|---|---|---|---|
| **100** | 48 ms | 2.083 req/s | 13.36 MB | 0 |
| **500** | 160 ms | 3.125 req/s | 20.11 MB | 0 |
| **1.000** | 207 ms | 4.831 req/s | 22.77 MB | 0 |
