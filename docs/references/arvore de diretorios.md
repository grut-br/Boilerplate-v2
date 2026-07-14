Devio Platform V4 (Root)
├── .agents/                    # Infraestrutura e Regras Locais para Agentes de IA
│   ├── capabilities/           # Definições de capabilities técnicas das IAs
│   │   ├── analysis.md
│   │   ├── capability-loader.md
│   │   ├── context-builder.md
│   │   ├── documentation-runtime.md
│   │   ├── documentation.md
│   │   ├── execution-engine.md
│   │   ├── planning.md
│   │   ├── result-processor.md
│   │   ├── runtime-state.md
│   │   └── toolchain-gateway.md
│   ├── checklists/             # Checklists de validação e critérios de aceitação
│   │   ├── crud-done.md
│   │   ├── deploy-done.md
│   │   ├── feature-done.md
│   │   └── landing-done.md
│   ├── knowledge/              # Bases de conhecimento de arquitetura, SEO e testes
│   │   ├── accessibility.md
│   │   ├── architecture-principles.md
│   │   ├── business-rules.md
│   │   ├── clean-code.md
│   │   ├── documentation.md
│   │   ├── performance.md
│   │   ├── security.md
│   │   ├── seo.md
│   │   ├── testing.md
│   │   ├── ui.md
│   │   └── ux.md
│   ├── memory/                 # Memórias acumuladas de aprendizados do projeto
│   │   ├── current-brand.md
│   │   ├── current-project.md
│   │   └── current-stack.md
│   ├── roles/                  # Perfis de atuação lógica dos agentes
│   │   ├── backend.md
│   │   ├── database.md
│   │   ├── frontend.md
│   │   ├── manager.md
│   │   └── reviewer.md
│   ├── rules/                  # Regras estruturais e convenções de estilo de código
│   │   ├── always-read.md
│   │   ├── architecture.md
│   │   ├── authority-levels.md
│   │   └── coding-style.md
│   ├── skills/                 # Diretrizes portáveis (A11y, Supabase, UX, Design Systems)
│   │   ├── a11y-micro-acessibilidade/
│   │   │   └── SKILL.md
│   │   ├── backend-supabase-mastery/
│   │   │   └── SKILL.md
│   │   ├── brand/
│   │   │   ├── references/
│   │   │   ├── scripts/
│   │   │   └── SKILL.md
│   │   ├── brand-guidelines/
│   │   │   └── SKILL.md
│   │   ├── core-web-vitals/
│   │   │   └── SKILL.md
│   │   ├── design/
│   │   │   ├── data/
│   │   │   ├── references/
│   │   │   ├── scripts/
│   │   │   └── SKILL.md
│   │   ├── design-system/
│   │   │   ├── data/
│   │   │   ├── references/
│   │   │   ├── scripts/
│   │   │   └── SKILL.md
│   │   ├── find-skills/
│   │   │   └── SKILL.md
│   │   ├── frontend-design/
│   │   │   └── SKILL.md
│   │   ├── mcp-builder/
│   │   │   ├── reference/
│   │   │   ├── scripts/
│   │   │   └── SKILL.md
│   │   ├── skill-creator/
│   │   │   ├── agents/
│   │   │   ├── scripts/
│   │   │   └── SKILL.md
│   │   ├── theme-factory/
│   │   │   ├── themes/
│   │   │   └── SKILL.md
│   │   ├── ui-styling/
│   │   │   ├── references/
│   │   │   ├── scripts/
│   │   │   └── SKILL.md
│   │   ├── ui-ux-pro-max/
│   │   │   ├── data/
│   │   │   ├── scripts/
│   │   │   └── SKILL.md
│   │   ├── ux-writing/
│   │   │   └── SKILL.md
│   │   ├── vercel-react-best-practices/
│   │   │   ├── rules/
│   │   │   └── SKILL.md
│   │   └── webapp-testing/
│   │       ├── examples/
│   │       ├── scripts/
│   │       └── SKILL.md
│   └── workflows/              # Roteiros passo a passo de desenvolvimento
│       ├── bugfix.md
│       ├── crud.md
│       ├── landing-page.md
│       ├── new-feature.md
│       └── review.md
├── .ai-workspace/              # Motor de automação e logs de tarefas de IA
│   ├── active/                 # Tarefas ativas
│   ├── completed/              # Tarefas finalizadas
│   ├── logs/                   # Histórico de logs operacionais
│   ├── roadmap/                # Roadmap do workspace
│   ├── specifications/         # Metas e especificações
│   └── templates/              # Templates de arquivos (.md, .json)
├── .architecture/              # Regras originais de congelamento da V4 (ADRs)
│   ├── ADR_INDEX.md
│   ├── ARCHITECTURE_DECISIONS.md
│   ├── ARCHITECTURE_FREEZE.md
│   ├── ARCHITECTURE_PRINCIPLES.md
│   ├── ARCHITECTURE_VISION.md
│   ├── README.md
│   └── V4_IMPLEMENTATION_GUIDE.md
├── .github/                    # Configurações do GitHub e Workflows de CI/CD
│   └── workflows/
│       ├── cd-backend.yml      # Sincronização e deploy Hostinger (Rsync/SSH)
│       └── ci.yml              # Pipeline de Integração Contínua (TypeScript, Lint, Testes, Build)
├── docs/                       # Reorganização Estrutural da Documentação Oficial
│   ├── architecture/           # Manuais estruturais e visões de arquitetura
│   ├── decisions/              # Registro de decisões tomadas no projeto
│   ├── framework/              # Arquivos informativos do framework cognitivo
│   │   ├── FRAMEWORK_ENGINE.md
│   │   ├── FRAMEWORK_ENTRYPOINT.md
│   │   ├── FRAMEWORK_EXECUTION.md
│   │   ├── FRAMEWORK_INDEX.md
│   │   ├── FRAMEWORK_READY.md
│   │   ├── FRAMEWORK_RESULT_PROCESSOR.md
│   │   ├── FRAMEWORK_RUNTIME.md
│   │   └── FRAMEWORK_TOOLCHAIN.md
│   ├── guides/                 # Manuais operacionais
│   ├── history/                # Histórico de relatórios de sprints concluídos (V4)
│   │   ├── sprint-v4.0-01-report.md
│   │   ├── sprint-v4.0-02-report.md
│   │   ├── ...
│   │   └── sprint-v4.0-17-report.md
│   └── references/             # Documentos e links de referências externas
├── framework-engine/           # A Engine Cognitiva da Knowledge Engine V4
│   ├── src/
│   │   ├── cli/                # Linha de comando para diagnóstico
│   │   │   ├── CLI.ts
│   │   │   └── CLI.test.ts
│   │   ├── config/             # Configurações globais do framework
│   │   ├── diagnostics/        # Coleta de métricas e traces
│   │   ├── knowledge/          # Núcleo de busca inteligente da Engine (Planner, Cache, AST)
│   │   ├── prompt/             # Prompt Assembly V2 (orçamentos e layouts)
│   │   ├── providers/          # Adaptadores genéricos de IA (OpenAI, Gemini, Claude)
│   │   └── index.ts            # Ponto de entrada global público
│   ├── BENCHMARKS.md           # Tabela oficial de performance e stress
│   ├── PERFORMANCE.md          # Análise de tempos e gargalos de I/O
│   ├── API.md                  # Referência pública de classes da Engine
│   ├── README.md               # Apresentação do framework
│   └── VERSION.md              # Status estável e congelado da V4
├── src/                        # APLICAÇÃO NEXT.JS (FRONTEND & SAAS)
│   ├── app/                    # Rotas do App Router organizadas por grupos lógicos
│   │   ├── (app)/              # Painel privado do sistema SaaS (Sidebar + Topbar)
│   │   ├── (auth)/             # Telas de login e cadastro
│   │   ├── (marketing)/        # Site institucional e landing pages públicas
│   │   ├── favicon.ico
│   │   ├── globals.css         # Estilos globais e variáveis do Tailwind v4
│   │   ├── layout.tsx          # RootLayout base
│   │   ├── robots.ts           # robots.txt dinâmico
│   │   └── sitemap.ts          # sitemap.xml dinâmico
│   ├── components/             # Componentes de interface de usuário reutilizáveis
│   ├── config/                 # Central de dados estáticos do projeto
│   ├── features/               # Lógica de negócio baseada em FSD (auth)
│   └── lib/                    # Uteis e clients Supabase SSR
├── AGENTS.md                   # Regras para agentes e colaboradores automatizados
├── CHANGELOG.md                # Histórico de evolução do produto
├── REPOSITORY_STATUS.md        # Estado de certificação de produção
├── WHY.md                      # Justificativas das decisões técnicas
├── START_HERE.md               # Guia principal de início rápido e workflows
├── README.md                   # Apresentação e diagrama de fluxos do projeto
├── package.json                # Dependências e scripts do repositório
└── tsconfig.json               # Configurações TypeScript
