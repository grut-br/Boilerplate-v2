# Matriz de Memória e Diferenciação de Estado — V3.0

Este documento define a especificação de arquitetura da memória em tempo de execução e estabelece a diferenciação clara de todos os tipos de estados lógicos e arquivos conceituais presentes no AI Development Framework V3.0.

---

## 🔄 Ciclo de Vida do Runtime State

A memória operacional possui um ciclo de vida efêmero e transacional, regulado por cinco marcos cronológicos:

1. **Nascimento (Born):** O Runtime State nasce no início absoluto de uma execução (quando o Control Plane lê uma nova especificação e emite o plano). Ele gera um UUID exclusivo para a sessão.
2. **Mutação (Mutate):** O estado sofre alterações conceituais contínuas conforme as Capabilities avançam (ex: o Context Builder injeta a lista de caminhos hidratados, a Execution Engine registra arquivos modificados, e o Toolchain Gateway grava logs de erros).
3. **Persistência Temporária (Temporary Persist):** O estado é persistido unicamente em memória RAM de contexto durante as rodadas de retentativa (Self-Healing). Ele **nunca é salvo no repositório Git**.
4. **Descarte (Discard):** Assim que a tarefa é validada com sucesso (PASS) ou cancelada por falhas persistentes (FAIL), toda a estrutura de estado do Runtime é sumariamente apagada do buffer da IA.
5. **Reuso (Reusability):** O Runtime State **nunca é reutilizado**. Cada nova execução é limpa e reinicia com um novo UUID exclusivo, eliminando qualquer risco de drift de contexto.

---

## 📊 Matriz Comparativa de Estados e Documentos

Para evitar confusão e sobreposição de responsabilidades no framework, a tabela abaixo mapeia o papel de cada estrutura:

| Estrutura | Escopo Temporal | Persistência | Propósito Principal | Onde Fica |
| :--- | :--- | :--- | :--- | :--- |
| **Runtime State** | Imediato (Volátil) | RAM (Descartado ao fim) | Evitar Context Drift e isolar transações ativas. | Memória de Prompt |
| **PROJECT_STATE** | Longo Prazo | Permanente (Git) | Snapshot operacional do progresso geral do projeto. | Raiz (`PROJECT_STATE.md`) |
| **Logs** | Histórico | Permanente (Git/Local) | Registro cronológico detalhado de execuções passadas. | `.ai-workspace/logs/` |
| **ADRs** | Decisão de Projeto | Permanente (Git) | Registro de decisões arquiteturais inegociáveis. | `.ai-workspace/decisions/` |
| **Specifications** | Escopo da Feature | Permanente (Git) | Requisitos estáticos de escopo da funcionalidade. | `.ai-workspace/specifications/` |
