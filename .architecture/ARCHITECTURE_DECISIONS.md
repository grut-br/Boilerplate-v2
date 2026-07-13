# Architecture Decisions

## Decision 001

Inicialmente a V4 utilizaria Graphify diretamente.

Problema:

Acoplamento.

Decisão:

Criar KnowledgeProvider.

---

Decision 002

Inicialmente foi proposta uma Framework Graph.

Problema:

Duplicação de conhecimento.

Decisão:

Substituir por Knowledge Resolver.

---

Decision 003

Inicialmente cogitou-se reconstruir o Graphify após toda alteração.

Problema:

Baixo desempenho.

Decisão:

Lazy Synchronization.

---

Decision 004

Planner nunca controla fluxo.

A Engine permanece responsável pela execução.

---

Decision 005

Multi-Agent Runtime nunca permite comunicação direta entre agentes.

Toda comunicação ocorre através da Engine.