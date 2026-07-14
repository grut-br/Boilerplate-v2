# Resumo Geral do Projeto — Devio Master Boilerplate

Este documento consolida tudo o que foi planejado, desenvolvido, otimizado e estruturado para o **devio-master-boilerplate**, o template mestre e a fundação técnica que a agência utilizará para gerar todos os futuros sites institucionais, SaaS e sistemas corporativos.

---

## 🚀 O que é o Devio Master Boilerplate?

É uma base modular de produção inspirada nos conceitos de Clean Architecture, Feature-Sliced Design (FSD) e DRY. Ele integra layouts inteligentes por grupos de rotas, SEO dinâmico, acessibilidade física de formulários (A11y), banco de dados e autenticação por cookies (Supabase SSR), além de contar com a robusta **Framework Engine V4 (Knowledge Engine)** para automação e compilação de contexto de inteligência artificial de alta performance.

---

## 🛠 Stack Tecnológica Base

* **Framework:** Next.js 16.2 (App Router & Turbopack)
* **Biblioteca UI:** React 19
* **Estilização:** Tailwind CSS v4 (configuração baseada no globals.css)
* **Animações:** Framer Motion (para transições dinâmicas e fluidas)
* **Ícones:** Lucide React
* **Validação:** Zod (para validação estrita de runtime no browser e servidor)
* **Backend & SSR:** Supabase via `@supabase/ssr` e `@supabase/supabase-js`
* **Execution & AI Context Engine:** Node.js + TypeScript (com suporte nativo a strip-types e protocolo MCP)

---

## 📂 Arquitetura Completa de Pastas do Repositório

O projeto está dividido de forma rigorosa em três grandes camadas: Aplicação Frontend Next.js, Engine de Contexto de IA e a Infraestrutura Local de Automação e Agentes de IA.

```text
C:\Users\lucas\Projetos\Boilerplate-v2\
├── .agents/                   # INFRAESTRUTURA LOCAL DE AGENTES DE IA
│   ├── capabilities/          # Markdown descritivos de capacidades técnicas autónomas
│   ├── checklists/            # Critérios de qualidade e testes para entrega de tarefas
│   ├── knowledge/             # Bases de conhecimento de projetos específicos
│   ├── memory/                # Memória persistida de aprendizados das IAs
│   ├── roles/                 # Perfis de agentes (Architect, Developer, QA, etc.)
│   ├── rules/                 # Regras rígidas de codificação e boas práticas
│   ├── skills/                # Skills portáveis de A11y, Supabase, UX e CSS
│   ├── templates/             # Esboços padrão para novos arquivos
│   └── workflows/             # Fluxos de trabalho (CRUD, Landing Page, Review, Bugfix, etc.)
├── .ai-workspace/             # MOTOR DE EXECUÇÃO E LOGS DE TAREFAS DOS AGENTES
│   ├── active/                # Sessões e tarefas ativas em andamento
│   ├── completed/             # Histórico de tarefas finalizadas
│   ├── logs/                  # Logs detalhados de execuções
│   └── specifications/        # Especificações formais das metas e sprints
├── .architecture/             # DECISÕES ARQUITETÔNICAS E CONGELAMENTO (ADRs)
│   ├── ADR_INDEX.md           # Índice de decisões de arquitetura
│   ├── ARCHITECTURE_DECISIONS.md # Lista de ADRs com justificativas históricas
│   ├── ARCHITECTURE_FREEZE.md # Declaração de limites e congelamento da V4
│   ├── ARCHITECTURE_PRINCIPLES.md # Princípios fundamentais de design desacoplado
│   └── V4_IMPLEMENTATION_GUIDE.md # Cronograma de execução da V4
├── framework-engine/          # A ENGINE COGNITIVA DA KNOWLEDGE ENGINE V4
│   ├── src/
│   │   ├── knowledge/         # Núcleo da busca baseada em grafo (Planner, Resolver, Cache, AST)
│   │   ├── prompt/            # Prompt Assembly V2 (layouts, budgets, optimizers)
│   │   ├── cli/               # Linha de comando para diagnóstico
│   │   └── diagnostics/       # Telemetria e medição de spans de execução
│   └── sprint-*-report.md     # Relatórios detalhados de entrega de cada Sprint
├── src/                       # APLICAÇÃO NEXT.JS (FRONTEND & SAAS)
│   ├── app/                   # Roteamento baseado em Route Groups (marketing, app, auth)
│   ├── components/            # Componentes visuais compartilhados (layout, UI, forms)
│   ├── features/              # Feature-Sliced Design (ex: módulo auth)
│   ├── config/                # Central de dados estáticos (siteConfig, menus, navigation)
│   └── lib/                   # Configuração e clients Supabase SSR e utilitários
├── AGENTS.md                  # Regras locais e restrições de Next.js/Tailwind v4
├── AI_ARSENAL.md              # MCPs disponíveis e mapeamento de ferramentas
├── TEMPLATE_INSTRUCTIONS.md   # Manual de desenvolvimento e regras de ouro
└── resumo do projeto.md       # Este documento de visão geral
```

---

## 🧠 A Framework Engine V4 (Knowledge Engine)

Desenvolvida e homologada para compilar, otimizar e formatar o contexto do código do workspace enviado aos modelos de linguagem de forma eficiente e determinística.

* **Query Planner**: Compilação descentralizada de requisições de busca em planos estratégicos com árvores de dependência e análise de custo.
* **Graphify MCP Server**: Servidor de protocolo MCP stdin/stdout integrado para buscas de AST do código, monitorando arquivos via `RealGraphWatcher`.
* **Lazy Synchronization & Ghost State Protection**: Sincronização automatizada baseada em desvios do watcher no disco, prevenindo leituras de dados antigos ou desatualizados.
* **Context Compression**: Pipeline de normalização, deduplicação (via hashes de conteúdo) e seleção de prioridade linear de documentos em memória.
* **Prompt Assembly V2**: Motor de layouts estruturados que executa a poda recursiva de seções opcionais baseada em prioridade caso o payload final exceda o orçamento de tokens do modelo.

---

## 🤖 Infraestrutura de Agentes de IA (`.agents/` & `.ai-workspace/`)

O boilerplate conta com um ecossistema nativo voltado para facilitar a atuação de IAs autônomas no projeto:
* **Capabilities**: Define as ações suportadas por IAs (ex: `capability-loader.md`, `execution-engine.md`, `planning.md`).
* **Workflows**: Roteiros passo a passo automatizados para ações frequentes:
  * `landing-page.md`: Criação de seções institucionais animadas, responsivas e acessíveis.
  * `crud.md`: Implementação de fluxos de dados completos com validações Zod e Server Actions.
  * `bugfix.md` / `new-feature.md`: Correção e criação de features sem regressões.
  * `review.md`: Fluxo detalhado de auditoria de código e testes.
* **Skills**: Guias e boas práticas em design systems ([design-system.md](../../.agents/skills/design-system/SKILL.md)), micro-acessibilidade ([a11y-micro-acessibilidade.md](../../.agents/skills/a11y-micro-acessibilidade/SKILL.md)) e Supabase ([backend-supabase-mastery.md](../../.agents/skills/backend-supabase-mastery/SKILL.md)).

---

## 📂 Organização dos Grupos de Rotas da Aplicação (`src/app/`)

* **`(marketing)/` (Site Institucional)**:
  * Páginas públicas que compartilham o layout padrão contendo o `Header` e o `Footer`. Esses componentes são injetados automaticamente pelo layout do grupo e nunca devem ser importados individualmente.
* **`(auth)/` (Fluxo de Acesso)**:
  * Páginas de login e cadastro. Centraliza elementos de login no meio da tela com layout limpo em tela cheia para evitar distrações.
* **`(app)/` (SaaS/Dashboard)**:
  * Área protegida do sistema. O layout do grupo monta o painel administrativo (Sidebar fixa na esquerda, Topbar superior e painel com rolagem independente).
  * **Proteção por Middleware**: Controlado no arquivo `src/middleware.ts` na raiz do código. Por padrão, ele protege o caminho `/dashboard` (redirecionando para `/login` caso não haja sessão ativa). Novas rotas privadas como `/settings`, `/profile`, `/billing`, `/users` e `/admin` devem ser explicitamente mapeadas na lógica do middleware ou no array de configurações `matcher`.

---

## 📈 Resultados Consolidados dos Benchmarks (Engine V4)

* **Vazão (Throughput)**: **4.831 req/s** sob carga simultânea concorrente de 1.000 queries concorrentes.
* **Consumo de Memória (Heap)**: Estabilizado na faixa de **22.77 MB** sem vazamentos (Memory Leaks).
* **Latência de Cache Semântico**:
  * **Cache Miss (Frio)**: **21 ms** (tempo de processamento completo do pipeline).
  * **Cache Hit (Quente)**: **9 ms** (tempo de resposta do cache semântico de alta performance).
  * **Eficiência**: **57.14% de redução de tempo**.
* **Redução de Payload (Context)**: Redução determinística de até **96.70%** no tamanho físico do prompt final.
