# Simulação de Fast Track: Ajustar Padding do Header (Micro Task)

Este documento demonstra o funcionamento do mecanismo de **Fast Track** da Framework Engine V3.0, projetado para acelerar o processamento e reduzir o consumo de tokens em tarefas de manutenção pontual (Micro Tasks).

---

## 📥 1. Entrada do Desenvolvedor (Usuário)
O desenvolvedor humano solicita um ajuste visual pontual no chat:
> "Ajustar o padding vertical do Header institucional para py-4."

---

## ⚡ 2. Triagem e Classificação Acelerada (Bypass)

O Control Plane intercepta a requisição e a Planning Capability faz a classificação instantânea:
*   **Complexidade Avaliada:** `Micro Task` (alteração em um único arquivo de estilo visual, sem dependências lógicas ou estruturais).
*   **Mecanismo de Bypass Ativado:**
    *   O planejador suprime a necessidade de criar arquivos físicos individuais de Work Unit.
    *   A especificação é processada diretamente na RAM volátil sob uma transação de Fast Track (`tx_fast_header_01`).

---

## 🔌 3. Resolução e Hidratação de Contexto Mínimo

1.  **Resolution:** O `v3-capability-loader` acopla a capability `v3-capability-ui` com base no domínio visual.
2.  **Hydration (Contexto Restrito):** O Context Builder injeta unicamente:
    *   [.agents/rules/always-read.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/rules/always-read.md) (Regra compulsória).
    *   `src/components/layout/Header.tsx` (O arquivo físico a ser alterado).
    *   *Forbidden Context:* Todos os outros arquivos de especificações, logs e conhecimentos de banco de dados são bloqueados para evitar *Context Bloat*.

---

## ⚡ 4. Escrita e Validação Física Progressiva

1.  **Execution:** A Execution Engine altera a propriedade de estilo Tailwind CSS no arquivo `src/components/layout/Header.tsx` (ex: substituindo `py-6` por `py-4` na tag `<header>`).
2.  **Toolchain Gateway (Falha Rápida):** Executa unicamente a validação estática no arquivo modificado:
    ```bash
    next lint --file src/components/layout/Header.tsx
    ```
    *Status:* `PASS`.

---

## 🏁 5. Julgamento de Fechamento (Result)

O Result Processor avalia o retorno de sucesso e consolida as modificações diretamente:
*   **PROJECT_STATE.md:** Registra a tarefa diretamente na tabela de histórico de Work Units como concluída sob o status de Fast Track.
*   **Runtime State:** Limpa o buffer de RAM de forma instantânea.
*   **Tempo Reduzido & Economia de Contexto:**
    *   *Economia de Tokens:* Redução de até 85% de tokens de contexto devido à ausência de planejamento estruturado e leitura de ADRs.
    *   *Tempo Operacional:* Turno finalizado em menos de 10 segundos.
