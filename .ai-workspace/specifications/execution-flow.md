# Specification: Execution Flow & Module Protocol (v3-execution-flow)

Esta especificação define o detalhamento operacional, responsabilidades e fronteiras documentais de cada fase e ator envolvido no fluxo completo de desenvolvimento da **Framework Engine V3.0**.

---

## 🗺️ Mapa de Transições de Dados do Pipeline

```
[Developer] ➔ [Specification] ➔ [Planning] ➔ [Resolution] ➔ [Context Builder] 
      ➔ [Execution] ➔ [Toolchain] ➔ [Runtime] ➔ [Result Processor] ➔ [Developer]
```

---

## 🔍 Detalhamento das Etapas do Fluxo

### 1. Developer (Desenvolvedor Humano)
*   **Responsável:** Desenvolvedor Humano.
*   **Entradas:** Requisitos de negócios e regras de negócio corporativas.
*   **Saídas:** Especificação abstrata inicial de feature ou correção.
*   **Documentos Utilizados:** [DEVELOPMENT_GUIDE.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/docs/guides/DEVELOPMENT_GUIDE.md) (para convenções de nomenclatura).
*   **Documentos Proibidos:** N/A (Acesso total).

---

### 2. Specification (Fase de Escopo)
*   **Responsável:** Control Plane (Camada Cognitiva).
*   **Entradas:** Descrição inicial de negócio fornecida pelo Desenvolvedor.
*   **Saídas:** Arquivo físico de especificação em `.ai-workspace/specifications/` (ex: `auth-flow.md`).
*   **Documentos Utilizados:** Templates de especificação estruturada.
*   **Documentos Proibidos:** Arquivos de configurações do build (`package.json`, etc.) e diretório `src/`.

---

### 3. Planning (Fase de Planejamento)
*   **Responsável:** `v3-capability-planning`.
*   **Entradas:** Arquivo de especificação de feature e [PROJECT_STATE.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/docs/history/PROJECT_STATE.md).
*   **Saídas:** Plano de execução gerado e Work Units estruturadas.
*   **Documentos Utilizados:** [always-read.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/rules/always-read.md), [DEVELOPMENT_GUIDE.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/docs/guides/DEVELOPMENT_GUIDE.md).
*   **Documentos Proibidos:** Todo o código-fonte em `src/`, guias de design [ui.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/knowledge/ui.md) ou segurança.

---

### 4. Resolution (Fase de Triagem)
*   **Responsável:** `v3-capability-loader`.
*   **Entradas:** Assinatura de metadados da Work Unit ativa (WU).
*   **Saídas:** Identificador da Capability a ser carregada (ex: `v3-capability-ui`).
*   **Documentos Utilizados:** [CAPABILITY_CONTRACT.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/docs/architecture/CAPABILITY_CONTRACT.md), [FRAMEWORK_INDEX.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/docs/framework/FRAMEWORK_INDEX.md).
*   **Documentos Proibidos:** Código-fonte em `src/` e especificações de features não ativas.

---

### 5. Context Builder (Fase de Hidratação)
*   **Responsável:** `v3-capability-context-builder`.
*   **Entradas:** Requisitos de contexto declarados na Capability selecionada.
*   **Saídas:** Context Payload compactado e livre de redundâncias.
*   **Documentos Utilizados:** [FRAMEWORK_INDEX.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/docs/framework/FRAMEWORK_INDEX.md), [always-read.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/rules/always-read.md).
*   **Documentos Proibidos:** Arquivos estáticos de log históricos e qualquer arquivo de código que não seja explicitamente referenciado na Work Unit.

---

### 6. Execution (Fase de Escrita Física)
*   **Responsável:** `v3-capability-execution-engine` (guiada pela Capability ativa).
*   **Entradas:** Context Payload e metadados da Work Unit.
*   **Saídas:** Arquivos de código ou documentação gravados e salvos no repositório.
*   **Documentos Utilizados:** [coding-style.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/rules/coding-style.md), arquivos alvo declarados na WU.
*   **Documentos Proibidos:** Documentos de planejamento estratégico, roadmaps e arquivos lógicos fora do escopo da WU.

---

### 7. Toolchain (Fase de Auditoria Sintática)
*   **Responsável:** `v3-capability-toolchain-gateway`.
*   **Entradas:** Lista de arquivos alterados e criados.
*   **Saídas:** Relatório estruturado de validação contendo o status `PASS` ou `FAIL` e erros extraídos do console.
*   **Documentos Utilizados:** [FRAMEWORK_TOOLCHAIN.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/docs/framework/FRAMEWORK_TOOLCHAIN.md), Checklists de homologação.
*   **Documentos Proibidos:** Bases de conhecimentos teóricos e roadmaps.

---

### 8. Runtime (Fase de Gerenciamento de RAM)
*   **Responsável:** `v3-capability-runtime-state`.
*   **Entradas:** logs de validação da toolchain e status do processamento cognitivo.
*   **Saídas:** transições de estado isoladas registradas em memória.
*   **Documentos Utilizados:** [FRAMEWORK_RUNTIME.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/docs/framework/FRAMEWORK_RUNTIME.md).
*   **Documentos Proibidos:** Qualquer arquivo de código fonte na pasta `src/`.

---

### 9. Result Processor (Fase de Julgamento e Fechamento)
*   **Responsável:** `v3-capability-result-processor`.
*   **Entradas:** Snapshot final gravado no Runtime State.
*   **Saídas:** Gravação definitiva de sucesso em [PROJECT_STATE.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/docs/history/PROJECT_STATE.md), logs estáticos em `.ai-workspace/logs/` e sinal de descarte do buffer.
*   **Documentos Utilizados:** [always-read.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/rules/always-read.md), [PROJECT_STATE.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/docs/history/PROJECT_STATE.md).
*   **Documentos Proibidos:** Códigos fontes lógicos em `src/`.

---

### 10. Retorno ao Developer (Developer Loopback)
*   **Responsável:** Desenvolvedor Humano / Control Plane.
*   **Entradas:** Histórico consolidado e notificação de liberação da Engine.
*   **Saídas:** Aprovação final de release ou início de nova triagem estratégica.
*   **Documentos Utilizados:** [PROJECT_STATE.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/docs/history/PROJECT_STATE.md), logs de auditoria.
*   **Documentos Proibidos:** N/A (Acesso total).
