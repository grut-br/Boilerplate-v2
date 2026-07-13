# Relatório Técnico de Execução — Sprint V3.1-07 (Context Resolver)

Este relatório técnico documenta a homologação e a validação em tempo de execução da **Sprint V3.1-07**, focada no desenvolvimento do motor de triagem lógica determinística encarregado de selecionar e priorizar documentos do catálogo cognitivo para compor o contexto estruturado de prompts de IA.

---

## 🏛️ Arquitetura Criada

O módulo de resolução foi implementado na subpasta `src/core/context/` do repositório **framework-engine**:
*   `src/core/context/ContextRequest.ts` — Interface contendo as propriedades de requisição de tarefas (tags, capability demandada, constraints operacionais).
*   `src/core/context/ContextDocument.ts` — Interface representando a entidade selecionada para a prompt, guardando ID, peso de prioridade, justificativa e marcação de obrigatoriedade.
*   `src/core/context/ContextRules.ts` — Centraliza as regras operacionais de triagem determinística, pesos e comportamentos de restrições.
*   `src/core/context/ContextResolver.ts` — Classe que varre o catálogo de documentos (`DocumentRegistry`), aplica as regras, descarta repetições e ordena a saída em ordem decrescente de relevância.

---

## ⚙️ Algoritmo de Resolução e Pesos de Prioridades

O matching de seleção lógica de contexto estático baseia-se na seguinte escala de pesos de relevância ($1$ a $10$):
*   **Prioridade 10 (Required: true) — `Rules`:** Regras lógicas e diretrizes globais (ex: `.agents/rules/`). Sempre incluídas para blindagem cognitiva.
*   **Prioridade 9 (Required: true) — `Capabilities Descriptor`:** A especificação ou contrato que descreve a capability solicitada na tarefa (ex: `capabilities/planning.md`).
*   **Prioridade 8 (Required: true/false) — `Specifications`:** Especificações físicas associadas à capability solicitada.
*   **Prioridade 8 (Required: false) — `Targeted Knowledge`:** Skills ou guias técnicos específicos que possuam relação direta com a capability demandada (ex: skill de acessibilidade para capabilities de interface UI).
*   **Prioridade 7 (Required: false) — `Templates`:** Modelos de documentos ou work units de apoio específicos.
*   **Prioridade 6 (Required: false) — `General Specifications`:** Outras especificações gerais do sistema.
*   **Prioridade 5 (Required: false) — `General Templates`:** Modelos gerais de documentos.
*   **Prioridade 4 (Required: false) — `General Knowledge`:** Skills e diretrizes gerais de agência.
*   **Prioridade 3 (Required: false) — `Logs`:** Relatórios históricos. **Somente incluídos** se solicitados explicitamente via constraints (`include-logs`) ou tags (`logs`).
*   **Prioridade 1 (Required: false) — `Roadmaps`:** Planos e roadmaps. **Nunca incluídos automaticamente** (excluídos por padrão, a menos que haja flag `include-roadmaps`).

---

## 📊 Diagrama do Fluxo de Resolução de Contexto

O loop de resolução lógica e triagem opera sob a esteira de dados abaixo:

```mermaid
graph TD
    A[Engine.resolveContext request] --> B[Instanciar ContextResolver]
    B --> C[Consultar DocumentRegistry.list]
    C --> D[Loop por Documento]
    D --> E[ContextRules.shouldInclude]
    E -- include: false --> D
    E -- include: true --> F{documentId duplicado?}
    F -- Não --> G[Adicionar doc com prioridade e razão]
    F -- Sim --> H{Nova prioridade > existente?}
    H -- Sim --> G
    H -- Não --> D
    G --> D
    D -- Fim do Loop --> I[Ordenar Array por prioridade desc]
    I --> J[Retornar ContextDocument[]]
```

---

## 📝 Exemplos Práticos de Seleção de Contexto

### Exemplo 1: Demanda de Planejamento (Request: `capability: 'planning'`)
*   **Rules (Prioridade 10):** `.agents/rules/always-read.md` (Global rule required...)
*   **Capabilities (Prioridade 9):** `.agents/capabilities/planning.md` (Target capability descriptor...)
*   **Specifications (Prioridade 8):** `.ai-workspace/specifications/planning-runtime.md` (Specification linked...)
*   **Templates (Prioridade 7):** `.ai-workspace/templates/work-unit-template-v3.md` (Template associated...)

---

## 🏁 Resultados e Confirmação dos Testes

Executamos a esteira de testes locais via `npm run test` com sucesso absoluto:
*   **[Teste 1] Resolução para Planning:** PASSOU. Retornou corretamente as regras globais e a descriptor de planejamento.
*   **[Teste 2] Resolução para Documentation:** PASSOU. Incluiu a capability de documentação de forma direcionada.
*   **[Teste 3] Resolução para Analysis:** PASSOU. Triou e incluiu a capability de análise semântica.
*   **[Teste 4] Obrigatoriedade de Rules:** PASSOU. Garantiu que todos os arquivos `.agents/rules/` são inseridos com prioridade máxima ($10$) e exigidos (`required: true`).
*   **[Teste 5] Ordenação:** PASSOU. Ordenou o array final por ordem estritamente decrescente de relevância.
*   **[Teste 6] Duplicidades:** PASSOU. Eliminou 100% de colisões e IDs repetidos no array resolvido.
*   **[Teste 7] Controle de Logs:** PASSOU. Excluiu logs por padrão e os adicionou de forma bem-sucedida somente através do uso de constraint `include-logs`.
*   **Compilação & Tipagem:** `npm run build` e `npm run typecheck` completados com zero erros.
