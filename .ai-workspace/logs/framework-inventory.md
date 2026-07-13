# Inventário do AI Development Framework V2.1.1

Este documento cataloga todos os artefatos estruturais, operacionais e de conhecimento criados para a versão V2.1.1 do framework, detalhando suas responsabilidades e escopos de uso.

## 📊 Tabela de Inventário

| Documento | Responsabilidade | Quem Utiliza | Quem Consulta | Quando deve ser Utilizado |
| :--- | :--- | :--- | :--- | :--- |
| **Gerais / Raiz** | | | | |
| [DEVELOPMENT_GUIDE.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/DEVELOPMENT_GUIDE.md) | Manual geral de instruções, classificação de tarefas e ciclo operacional. | Desenvolvedor, IAs | Todos | Na inicialização do projeto e consultas de fluxo. |
| [PROJECT_STATE.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/PROJECT_STATE.md) | Snapshot Operacional com o progresso de tarefas e histórico de Work Units. | Manager, Desenvolvedor | Todos | A cada transição de status de tarefas ou sprints. |
| [FRAMEWORK_READY.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/FRAMEWORK_READY.md) | Certificação oficial da versão V2.1.1 e limites operacionais. | Todos | Todos | Ponto de partida inicial de novos projetos. |
| [FRAMEWORK_INDEX.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/FRAMEWORK_INDEX.md) | Mapa de navegação de contexto para indicar arquivos por situação técnica. | Manager | Todos | Na injeção inicial de prompts para economizar tokens. |
| **Rules (`.agents/rules/`)** | | | | |
| [always-read.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/rules/always-read.md) | Ancoragem de conduta, prioridade e regras inegociáveis de IA. | Agentes de IA | Desenvolvedor | Antes de iniciar qualquer tarefa de prompt ou código. |
| [architecture.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/rules/architecture.md) | Diretrizes e princípios estruturais (Clean Arch, FSD). | Manager, Executores | Todos | Em discussões técnicas e planejamento de módulos. |
| [coding-style.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/rules/coding-style.md) | Padrões de nomenclatura, TypeScript, React e actions. | Frontend, Backend | Reviewer | Durante a escrita pura e auditoria de código. |
| [authority-levels.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/rules/authority-levels.md) | Hierarquia de prioridade em caso de conflito (Código > ADR > Specs > Snapshot). | Todos | Todos | Quando houver divergência de informações entre arquivos. |
| **Workflows (`.agents/workflows/`)** | | | | |
| [new-feature.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/workflows/new-feature.md) | Processo para desenvolvimento incremental de novas features. | Manager, Executores | Todos | Na criação de qualquer recurso novo (Epic/Feature). |
| [landing-page.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/workflows/landing-page.md) | Processo focado em visual, SEO, UX e dobras de marketing. | Manager, Frontend | Desenvolvedor | No desenvolvimento de páginas institucionais de alta conversão. |
| [crud.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/workflows/crud.md) | Processo de manutenção seguro e em camadas de entidades. | Manager, Backend | Todos | Na criação de listagens e formulários de persistência. |
| [bugfix.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/workflows/bugfix.md) | Processo de reprodução e mitigação de bugs em sua raiz. | Manager, Executores | Todos | Na ocorrência e correção de comportamentos inadequados. |
| [review.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/workflows/review.md) | Processo de auditoria e revisão de Work Units concluídas. | Reviewer, Manager | Executores | Após a finalização técnica de qualquer Work Unit. |
| **Roles (`.agents/roles/`)** | | | | |
| [manager.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/roles/manager.md) | Papel orquestrador, classifica tarefas, filtra documentos e gera WUs. | Agente de IA | Todos | No recebimento de especificações e delegações. |
| [frontend.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/roles/frontend.md) | Papel executor de apresentação visual, A11y, UX e CSS. | Agente de IA | Manager, Reviewer | Na codificação visual da Work Unit designada. |
| [backend.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/roles/backend.md) | Papel executor de lógica, APIs, banco de dados e segurança. | Agente de IA | Manager, Reviewer | Na codificação estrutural e segurança do lado do servidor. |
| **Checklists (`.agents/checklists/`)** | | | | |
| [feature-done.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/checklists/feature-done.md) | Checklist para validação final de novas funcionalidades. | Reviewer | Todos | Na etapa de Code Review de novas features. |
| [crud-done.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/checklists/crud-done.md) | Checklist para validação final de manutenções de dados. | Reviewer | Todos | Na etapa de Code Review de rotinas CRUD. |
| [landing-done.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/checklists/landing-done.md) | Checklist para validação final de páginas de marketing. | Reviewer | Todos | Na etapa de Code Review de landing pages. |
| [deploy-done.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/checklists/deploy-done.md) | Checklist para homologação de promoção para produção. | Desenvolvedor, IAs | Todos | Imediatamente antes de disparar o deploy de release. |
| **Templates (`.ai-workspace/templates/`)** | | | | |
| [feature-template.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.ai-workspace/templates/feature-template.md) | Formulário de especificação para nova funcionalidade. | Desenvolvedor, IAs | Manager | Na modelagem inicial no chat externo. |
| [screen-template.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.ai-workspace/templates/screen-template.md) | Formulário de especificação para nova tela/view. | Desenvolvedor, IAs | Manager | No mapeamento estrutural de layouts e acessibilidade. |
| [crud-template.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.ai-workspace/templates/crud-template.md) | Formulário de especificação para rotinas de entidade. | Desenvolvedor, IAs | Manager | No mapeamento relacional e regras de backend. |
| [ADR_TEMPLATE.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.ai-workspace/templates/ADR_TEMPLATE.md) | Formulário padrão para registrar decisões arquiteturais (ADRs). | Desenvolvedor, IAs | Todos | Na formalização de decisões de design técnico relevantes. |
| [landing-section-template.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.ai-workspace/templates/landing-section-template.md) | Formulário para especificação de seções e dobras. | Desenvolvedor, IAs | Manager | No planejamento de copies e CTAs de blocos. |
| [bug-report-template.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.ai-workspace/templates/bug-report-template.md) | Formulário de reporte e dados de reprodução de anomalias. | Desenvolvedor, IAs | Manager | No momento de cadastro e triagem de falhas. |
| **Knowledge (`.agents/knowledge/`)** | | | | |
| [architecture-principles.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/knowledge/architecture-principles.md) | Conceitos de desacoplamento, SoC e inversão de dependência. | IAs, Executores | Todos | Como diretriz de design conceitual. |
| [clean-code.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/knowledge/clean-code.md) | Regras teóricas de legibilidade, SRP, nomes e refatoração. | Executores | Reviewer | Na escrita e revisão de sintaxes lógicas. |
| [performance.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/knowledge/performance.md) | Teoria de caminhos de rede críticos, render e cache. | Executores | Reviewer | Em otimizações de fluxos de carregamento de tela. |
| [security.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/knowledge/security.md) | Conceitos de menor privilégio, sanitização e vazamento. | Backend | Reviewer | Na modelagem de endpoints e regras de dados. |
| [accessibility.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/knowledge/accessibility.md) | Acessibilidade digital, ARIA nativo, foco e formulários. | Frontend | Reviewer | Na codificação semântica do front-end. |
| [ux.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/knowledge/ux.md) | Leis de usabilidade, prevenção de falhas e feedback. | Frontend | Manager | No mapeamento lógico de fluxos visuais. |
| [ui.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/knowledge/ui.md) | Grades, alinhamentos, hierarquias e design tokens. | Frontend | Manager | No desenho e posicionamento de elementos gráficos. |
| [testing.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/knowledge/testing.md) | Pirâmides de teste, isolamentos e validações estáticas. | Executores | Reviewer | Na confecção de rotinas de verificação automatizada. |
| [documentation.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/knowledge/documentation.md) | Código autoexplicativo, Docs-as-Code e ADRs. | Todos | Todos | Na escrita de logs, guias e histórico de commits. |
| [seo.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/knowledge/seo.md) | Semântica robô, crawling, sitemaps e metadados. | Frontend | Manager | Na estruturação estática de views institucionais. |
| [business-rules.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/knowledge/business-rules.md) | Modelagens de estados de regras corporativas vs. sintaxe. | Backend | Manager | Na divisão das ações de negócio em controlador isolado. |

---

## 🏛️ Pacotes Físicos do Monorepo V3.1

Abaixo estão listados os componentes de infraestrutura física criados para o bootstrap da V3.1:

* **CLI (`apps/cli/`):** Interface de linha de comando que gerencia as interações do desenvolvedor humano e comandos do framework.
* **Engine Core (`packages/engine/`):** Núcleo que executa o planejamento, carregamento de metadados, montagem de prompts e gravação física.
* **SDK (`packages/sdk/`):** Biblioteca unificada para interações programáticas do ecossistema.
* **Providers (`packages/providers/`):** Barramento de conexão com as APIs de LLMs normalizadas (OpenAI, Anthropic, Gemini, Ollama, Mock).
* **Shared (`packages/shared/`):** Tipos TypeScript comuns, constantes, tratadores de erro e utilitários globais.

---

## 📜 Documentações do Framework

* **[FRAMEWORK_ENTRYPOINT.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/FRAMEWORK_ENTRYPOINT.md):** Manual principal e ponto de inicialização unificado de execuções lógicas.
* **[README.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/README.md):** Visão geral, estrutura do monorepo, como executar e roadmap da V3.1.
* **[ARCHITECTURE.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/ARCHITECTURE.md):** Grafo de dependências físicas dos pacotes e mapa de responsabilidades.
