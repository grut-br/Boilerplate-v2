# Exemplos de Resolução de Capabilities (Capability Resolution Examples)

Este documento reúne 15 exemplos de simulação do algoritmo de resolução determinística do **Capability Loader** da Engine V3.0, demonstrando o cálculo do Matching Score (MS), precedências de prioridade e capacidades selecionadas.

---

## 🏆 Exemplos Práticos de Resolução

### Exemplo 1: Criar Landing Page de Vendas
*   **Requisito da WU:** Desenvolver a estrutura visual e copies da Home Page.
*   **Domínio:** `ui` | **Task Type:** `visual-interface` | **Keywords:** `["landing-page", "css", "html"]`
*   **Candidatos Avaliados:**
    *   `v3-capability-ui`: Domain Match ($1.0$), Task Match ($1.0$), Keywords Match ($1.0$). $MS = 1.0$ (Priority: 8)
    *   `v3-capability-general`: Domain Match ($1.0$), Task Match ($0.0$), Keywords Match ($0.3$). $MS = 0.56$ (Priority: 1)
*   **Resolução:** **`v3-capability-ui`** selecionada (Maior MS e especialização).

---

### Exemplo 2: Escrever README.md de Acessibilidade
*   **Requisito da WU:** Redigir guias de uso de teclado para leitores de tela em Markdown.
*   **Domínio:** `documentation` | **Task Type:** `technical-writing` | **Keywords:** `["readme", "a11y", "markdown"]`
*   **Candidatos Avaliados:**
    *   `v3-capability-documentation`: $MS = 1.0$ (Priority: 9)
*   **Resolução:** **`v3-capability-documentation`** selecionada.

---

### Exemplo 3: Auditar conformidade de Feature-Sliced Design (FSD)
*   **Requisito da WU:** Analisar a árvore de diretórios e imports da pasta `src/features/` sem alterar arquivos.
*   **Domínio:** `analysis` | **Task Type:** `static-review` | **Keywords:** `["fsd", "imports", "audit"]`
*   **Candidatos Avaliados:**
    *   `v3-capability-analysis`: $MS = 1.0$ (Priority: 7)
*   **Resolução:** **`v3-capability-analysis`** selecionada.

---

### Exemplo 4: Revisar Pull Request pós-sprint
*   **Requisito da WU:** Analisar diff de modificações e rodar checklist de homologação final.
*   **Domínio:** `review` | **Task Type:** `pr-audit` | **Keywords:** `["diff", "checklist", "approval"]`
*   **Candidatos Avaliados:**
    *   `v3-capability-review`: $MS = 1.0$ (Priority: 8)
*   **Resolução:** **`v3-capability-review`** selecionada.

---

### Exemplo 5: Refatorar actions legadas para usar safeParse
*   **Requisito da WU:** Substituir a validação direta de campos por checagem Zod segura em actions do backend.
*   **Domínio:** `refactor` | **Task Type:** `code-optimization` | **Keywords:** `["refactoring", "zod", "safeParse"]`
*   **Candidatos Avaliados:**
    *   `v3-capability-refactor`: $MS = 1.0$ (Priority: 8)
*   **Resolução:** **`v3-capability-refactor`** selecionada.

---

### Exemplo 6: Escrever testes E2E com Playwright
*   **Requisito da WU:** Adicionar arquivo `login.spec.ts` para testar fluxos de input e validações de rotas.
*   **Domínio:** `testing` | **Task Type:** `unit-testing` | **Keywords:** `["playwright", "e2e", "assertion"]`
*   **Candidatos Avaliados:**
    *   `v3-capability-testing`: $MS = 1.0$ (Priority: 8)
*   **Resolução:** **`v3-capability-testing`** selecionada.

---

### Exemplo 7: Criar tabela de Clientes com RLS (Banco de Dados)
*   **Requisito da WU:** Gerar script SQL de migração com regras Row Level Security.
*   **Domínio:** `database` | **Task Type:** `db-schema` | **Keywords:** `["sql", "rls", "migration"]`
*   **Candidatos Avaliados:**
    *   `v3-capability-database`: $MS = 1.0$ (Priority: 9)
*   **Resolução:** **`v3-capability-database`** selecionada.

---

### Exemplo 8: Criar Server Action para Cadastro
*   **Requisito da WU:** Desenvolver método asíncrono no servidor com retorno padronizado `ActionState`.
*   **Domínio:** `backend` | **Task Type:** `server-action` | **Keywords:** `["use-server", "supabase", "register"]`
*   **Candidatos Avaliados:**
    *   `v3-capability-backend`: $MS = 1.0$ (Priority: 8)
*   **Resolução:** **`v3-capability-backend`** selecionada.

---

### Exemplo 9: Criar Hook customizado useAuth
*   **Requisito da WU:** Criar lógica reativa de leitura de sessão do usuário no lado do navegador.
*   **Domínio:** `frontend` | **Task Type:** `react-logic` | **Keywords:** `["hook", "use-state", "context"]`
*   **Candidatos Avaliados:**
    *   `v3-capability-frontend`: $MS = 1.0$ (Priority: 8)
*   **Resolução:** **`v3-capability-frontend`** selecionada.

---

### Exemplo 10: Inicializar dados de Work Unit
*   **Requisito da WU:** Ler a assinatura de metadados da tarefa e acoplar a capability.
*   **Domínio:** `planning` | **Task Type:** `unit-initialization` | **Keywords:** `["loader", "wu-id"]`
*   **Candidatos Avaliados:**
    *   `v3-capability-loader`: $MS = 1.0$ (Priority: 10)
*   **Resolução:** **`v3-capability-loader`** selecionada.

---

### Exemplo 11: Hydration de prompt cognitivo
*   **Requisito da WU:** Mapear arquivos obrigatórios e criar payload mínimo sem exceder o budget.
*   **Domínio:** `infrastructure` | **Task Type:** `context-hydration` | **Keywords:** `["builder", "tokens", "budget"]`
*   **Candidatos Avaliados:**
    *   `v3-capability-context-builder`: $MS = 1.0$ (Priority: 10)
*   **Resolução:** **`v3-capability-context-builder`** selecionada.

---

### Exemplo 12: Julgamento pós-testes da Toolchain
*   **Requisito da WU:** Consumir logs do terminal e decidir transição de estado da transação.
*   **Domínio:** `infrastructure` | **Task Type:** `result-processing` | **Keywords:** `["processor", "decision", "success"]`
*   **Candidatos Avaliados:**
    *   `v3-capability-result-processor`: $MS = 1.0$ (Priority: 10)
*   **Resolução:** **`v3-capability-result-processor`** selecionada.

---

### Exemplo 13: Criar README do rodapé institucional
*   **Requisito da WU:** Gerar manual explicativo sobre o Footer.
*   **Domínio:** `documentation` | **Task Type:** `technical-writing` | **Keywords:** `["footer", "documentation"]`
*   **Candidatos Avaliados:**
    *   `v3-capability-documentation`: $MS = 1.0$ (Priority: 9)
*   **Resolução:** **`v3-capability-documentation`** selecionada.

---

### Exemplo 14: Integrar Gateway de Pagamento Stripe no Servidor
*   **Requisito da WU:** Criar rotas no servidor Next.js para processamento de webhook do Stripe.
*   **Domínio:** `backend` | **Task Type:** `server-action` | **Keywords:** `["stripe", "webhook", "api"]`
*   **Candidatos Avaliados:**
    *   `v3-capability-backend`: $MS = 1.0$ (Priority: 8)
*   **Resolução:** **`v3-capability-backend`** selecionada.

---

### Exemplo 15: Tratar foco de teclado no Menu Drawer Mobile
*   **Requisito da WU:** Integrar atalhos de navegação e foco visível ao abrir painel mobile.
*   **Domínio:** `ui` | **Task Type:** `visual-interface` | **Keywords:** `["focus-visible", "keyboard", "accessibility"]`
*   **Candidatos Avaliados:**
    *   `v3-capability-ui`: $MS = 0.9$ (Priority: 8)
*   **Resolução:** **`v3-capability-ui`** selecionada.
