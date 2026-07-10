# Mapa de Contexto do Framework (Framework Index)

Este documento atua como o mapa de navegação rápida do ecossistema do framework. Seu objetivo é indicar de forma cirúrgica quais arquivos de regras, papéis, fluxos e bases conceituais devem ser carregados no contexto das inteligências artificiais para cada situação de desenvolvimento, reduzindo drasticamente o consumo de tokens e evitando sobrecarga de contexto.

---

## 🗺️ Mapa de Diretrizes por Situação

### 1. Planejamento de Sprints e Análise de Briefings
* **Papel (Role) Principal:** [manager.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/roles/manager.md)
* **Workflow Recomendado:** [new-feature.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/workflows/new-feature.md)
* **Bases da Knowledge Layer:** [architecture-principles.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/knowledge/architecture-principles.md) e [business-rules.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/knowledge/business-rules.md)
* **Regras (Rules) Obrigatórias:** [always-read.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/rules/always-read.md) e [authority-levels.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/rules/authority-levels.md)

### 2. Implementação de Interfaces e UI/UX (Frontend)
* **Papel (Role) Principal:** [frontend.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/roles/frontend.md)
* **Workflow Recomendado:** [landing-page.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/workflows/landing-page.md) ou [new-feature.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/workflows/new-feature.md)
* **Bases da Knowledge Layer:** [ui.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/knowledge/ui.md), [ux.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/knowledge/ux.md), [accessibility.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/knowledge/accessibility.md) e [performance.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/knowledge/performance.md)
* **Regras (Rules) Obrigatórias:** [always-read.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/rules/always-read.md) e [coding-style.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/rules/coding-style.md)

### 3. Implementação de Lógica, Servidor e Persistência (Backend)
* **Papel (Role) Principal:** [backend.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/roles/backend.md)
* **Workflow Recomendado:** [crud.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/workflows/crud.md) ou [new-feature.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/workflows/new-feature.md)
* **Bases da Knowledge Layer:** [security.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/knowledge/security.md), [business-rules.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/knowledge/business-rules.md), [testing.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/knowledge/testing.md) e [clean-code.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/knowledge/clean-code.md)
* **Regras (Rules) Obrigatórias:** [always-read.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/rules/always-read.md) e [coding-style.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/rules/coding-style.md)

### 4. Resolução de Falhas e Incidentes (Bugfix)
* **Papel (Role) Principal:** [backend.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/roles/backend.md) ou [frontend.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/roles/frontend.md)
* **Workflow Recomendado:** [bugfix.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/workflows/bugfix.md)
* **Bases da Knowledge Layer:** [testing.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/knowledge/testing.md), [clean-code.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/knowledge/clean-code.md) e [documentation.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/knowledge/documentation.md)
* **Regras (Rules) Obrigatórias:** [always-read.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/rules/always-read.md) e [authority-levels.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/rules/authority-levels.md)

### 5. Revisão de Qualidade e Homologação (Code Review)
* **Papel (Role) Principal:** [reviewer.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/roles/reviewer.md) (intermediado no fluxo de IAs)
* **Workflow Recomendado:** [review.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/workflows/review.md)
* **Bases da Knowledge Layer:** [clean-code.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/knowledge/clean-code.md), [testing.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/knowledge/testing.md), [security.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/knowledge/security.md) e [performance.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/knowledge/performance.md)
* **Regras (Rules) Obrigatórias:** [always-read.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/rules/always-read.md) e [coding-style.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/rules/coding-style.md)
* **Checklist Aplicável:** [feature-done.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/checklists/feature-done.md) ou correspondente da demanda.

### 6. Divulgação ou Promoção de Código (Deploy)
* **Papel (Role) Principal:** Desenvolvedor Humano / Agente Operacional
* **Checklist Aplicável:** [deploy-done.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/checklists/deploy-done.md)
* **Bases da Knowledge Layer:** [performance.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/knowledge/performance.md) e [security.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/knowledge/security.md)
* **Regras (Rules) Obrigatórias:** [authority-levels.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/rules/authority-levels.md)

---

## 🛠️ Consulta de Skills (Biblioteca Opcional)

A biblioteca de Skills da agência funciona sob a filosofia **"Framework First, Skills Second"**. O arquivo [AI_ARSENAL.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/AI_ARSENAL.md) serve estritamente como um índice ou catálogo de Skills disponíveis. Ele **nunca deve ser carregado completamente no contexto da IA**.

### 🔄 Fluxo de Decisão para Uso de Skills:

1. **Resolver utilizando Framework:** A IA deve tentar executar a Work Unit utilizando exclusivamente as *Rules*, *Roles*, *Workflows*, especificações e a *Knowledge Layer*.
2. **Existe conhecimento especializado necessário?**
   * ❌ **NÃO:** O desenvolvimento segue o fluxo normal de execução do framework, finalizando a Work Unit sem carregar nenhuma Skill.
   * ──> **SIM:** A IA consulta o índice [AI_ARSENAL.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/AI_ARSENAL.md) para identificar qual Skill específica resolve a lacuna técnica.
3. **Seleção Cirúrgica:** O Manager ou o executor seleciona **apenas a única ou o mínimo necessário de Skills** indicadas no catálogo.
4. **Execução:** O arquivo da Skill selecionada (ex: `SKILL.md` dentro de sua respectiva pasta) é aberto, consumido de forma isolada e executado.

### 🚫 Regras de Utilização
* Nunca carregue uma pasta de Skill inteira se apenas a leitura conceitual basta.
* Skills servem para complementar o conhecimento em vetores específicos (acessibilidade refinada, lógica do Supabase, etc.), mas **jamais prevalecem ou substituem as regras base de codificação do framework**.
