# Specification: Capability Resolution Engine (v3-capability-resolution-engine)

Esta especificação define o algoritmo matemático e lógico determinístico utilizado pelo **Capability Loader** para selecionar e acoplar a Capability ideal de execução para uma Work Unit (WU) ativa, sem a necessidade de código em tempo de compilação ou modificação do núcleo core congelado.

---

## 🎯 1. Algoritmo de Matching e Pontuação (Matching Score)

O **Matching Score (MS)** é a pontuação numérica que mede a aderência de uma Capability a uma determinada Work Unit. Ele é calculado ponderando a correspondência semântica de três campos autodeclarados nos metadados da Capability com as exigências da Work Unit:

$$MS = (D \times 0.5) + (T \times 0.3) + (K \times 0.2)$$

Onde:
*   **$D$ (Domain Match):** Retorna `1.0` se o domínio primário exigido pela Work Unit (ex: `ui`) estiver contido na lista de `Supported Domains` da Capability. Caso contrário, retorna `0.0`. (Peso: 50%).
*   **$T$ (Task Type Match):** Retorna `1.0` se o tipo de tarefa da Work Unit (ex: `visual-interface`) estiver na lista de `Supported Task Types`. Caso contrário, retorna `0.0`. (Peso: 30%).
*   **$K$ (Keywords Match):** Mede a interseção das palavras-chave da Work Unit com a lista de `Keywords` declaradas pela Capability.
    $$K = \frac{|\text{Keywords da WU} \cap \text{Keywords da Capability}|}{|\text{Keywords da WU}|}$$
    (Peso: 20%).

*Limiar de Aceitação:* Uma Capability só é considerada elegível para execução se $MS \ge 0.5$.

---

## ⚖️ 2. Regras de Prioridade (Priority Rules)

Para garantir que a Engine sempre escolha a ferramenta mais especializada, aplicam-se as seguintes regras hierárquicas de prioridade:

1.  **Specialized Over General (Especialização):** Capabilities especializadas (ex: `v3-capability-ui`) possuem prioridade nativa sobre Capabilities genéricas de escrita (ex: `v3-capability-execution-engine`), mesmo que ambas declarem o domínio correspondente.
2.  **Explicit Priority Tag (Tag de Prioridade):** Toda Capability declara um nível numérico de prioridade de `1` (mínima) a `10` (máxima) nos seus metadados. Em caso de empate de domínios, a de maior valor numérico toma a precedência.

---

## 🏆 3. Resolução de Conflitos e Desempate (Conflict Resolution)

Se duas ou mais Capabilities elegíveis atingirem exatamente o mesmo Matching Score ($MS$), o Capability Loader aplicará os seguintes critérios de desempate sequenciais:

```
[Empate de MS] ➔ [1. Prioridade Declarada] ➔ [2. Confidence Score] ➔ [3. Menor Número de Dependências]
```

1.  **Critério 1 - Prioridade:** Seleciona a Capability com a maior tag `Priority` declarada nos seus metadados.
2.  **Critério 2 - Confidence Score:** Escolhe a Capability com o maior `Confidence Score` (autodeclaração de acurácia baseada em conformidade histórica).
3.  **Critério 3 - Menor Número de Dependências:** Seleciona a Capability com o menor array de `Dependencies`, reduzindo riscos de carregamento de contexto cíclico.

---

## 🛡️ 4. Mecanismo de Fallback

Se nenhuma Capability da biblioteca atingir o Matching Score mínimo ($MS \ge 0.5$), a Engine ativará a esteira de contingência:

1.  **Fallback Primário (Capability Genérica):** O Loader delega a execução à Capability genérica `v3-capability-general`, que possui escopo aberto de leitura e escrita documental.
2.  **Fallback Secundário (Abort):** Caso a `v3-capability-general` não esteja disponível ou a Work Unit declare domínios explicitamente restritos (como banco de dados com segredos), a transação é suspensa no Runtime State como `Failed` e a execução trava exigindo intervenção humana.

---

## 🏷️ 5. Confidence Score (Grau de Confiança)

O **Confidence Score (CS)** representa a garantia de estabilidade e taxa de sucesso autodeclarada da Capability. Ele é classificado em:
*   **High (9.0 - 10.0):** Capabilities core testadas exaustivamente e livre de efeitos colaterais na toolchain (ex: `planning`, `documentation`).
*   **Medium (7.0 - 8.9):** Capabilities especializadas de escrita de código com validações em compiladores (ex: `ui`, `backend`).
*   **Low (1.0 - 6.9):** Plugins experimentais ou Capabilities sob homologação (ex: `analysis`).

---

## 👥 6. Grupos de Capabilities (Capability Groups)

As Capabilities são organizadas em quatro grupos lógicos de controle no [FRAMEWORK_INDEX.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/docs/framework/FRAMEWORK_INDEX.md):

1.  **Control Group (Controle):** Módulos encarregados de orquestrar a Engine (ex: `planning`, `capability-loader`).
2.  **Infrastructure Group (Infraestrutura):** Responsáveis por gerenciar dados e RAM (ex: `context-builder`, `runtime-state`, `result-processor`).
3.  **Execution Group (Escrita):** Responsáveis pela modificação de arquivos de código e documentação (ex: `ui`, `backend`, `documentation`).
4.  **Verification Group (Auditoria):** Responsáveis pelas checagens de linters e testes (ex: `toolchain-gateway`, `analysis`).
