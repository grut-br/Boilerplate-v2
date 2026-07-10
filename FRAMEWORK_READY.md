# Framework Ready — Certificação Oficial V2.1.1

Este documento chancela a versão atual do AI Development Framework (V2.1.1) como pronta para uso. Ele atua como o ponto de partida conceitual e operacional para qualquer projeto a ser desenvolvido neste repositório.

## 📅 Dados da Versão
* **Versão Atual:** v2.1.1
* **Data da Versão:** 2026-07-09
* **Status:** Framework Frozen (Ready for Real Project)

## 🎯 Objetivo do Framework
O AI Development Framework V2.1.1 é um ecossistema operacional voltado para o desenvolvimento assistido por IA de forma incremental, encapsulada e de alta fidelidade técnica. Ele visa reduzir o consumo de tokens das IAs (via indexação inteligente e consulta opcional de Skills), desburocratizar a execução de pequenas manutenções (via Fast Track), formalizar a evolução da arquitetura (via ADRs) e blindar o código-fonte por meio de níveis de autoridade explícitos e checkpoints rigorosos de qualidade.

## 📂 Estrutura Completa e Componentes Existentes
O ecossistema é composto pelas seguintes camadas organizacionais e arquivos:

```text
/ (Raiz)
├── .ai-workspace/                     # Camada analítica do projeto (Dados de IA)
│   ├── active/                        # Especificações ativas na sprint
│   ├── completed/                     # Arquivo de especificações concluídas
│   ├── decisions/                     # Registro de decisões (ADRs)
│   │   └── ADR_TEMPLATE.md            # Formulário padrão para registrar ADRs
│   ├── logs/                          # Inventário e históricos de execução
│   ├── roadmap/                       # Escopos macros planejados
│   ├── specifications/                # Especificações recebidas
│   └── templates/                     # Formulários padrão de modelagem
│
├── .agents/                           # Camada técnica do framework
│   ├── checklists/                    # Filtros de conformidade técnica
│   ├── knowledge/                     # Bases conceituais permanentes e reutilizáveis
│   ├── memory/                        # Contexto volátil (marca, stack, projeto)
│   ├── roles/                         # Perfis comportamentais das IAs
│   ├── rules/                         # Diretrizes absolutas e de estilo
│   │   └── authority-levels.md        # Regra de níveis de autoridade
│   ├── templates/                     # Recursos auxiliares das roles
│   └── workflows/                     # Guias de processos passo a passo
│
├── FRAMEWORK_READY.md                 # Certificação oficial da V2.1.1
├── FRAMEWORK_INDEX.md                 # Mapa de navegação de contexto da IA
├── DEVELOPMENT_GUIDE.md               # Manual de instruções e fluxo de trabalho
└── PROJECT_STATE.md                   # Snapshot Operacional de progresso
```

### Componentes Ativos nesta Versão:
* **Orquestração (Role):** [manager.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/roles/manager.md)
* **Executores (Roles):** [frontend.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/roles/frontend.md) e [backend.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/roles/backend.md)
* **Regras (Rules):** [always-read.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/rules/always-read.md), [architecture.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/rules/architecture.md), [coding-style.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/rules/coding-style.md) e [authority-levels.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/rules/authority-levels.md)
* **Processos (Workflows):** [new-feature.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/workflows/new-feature.md), [landing-page.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/workflows/landing-page.md), [crud.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/workflows/crud.md), [bugfix.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/workflows/bugfix.md) e [review.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/workflows/review.md)
* **Checklists (Qualidade):** [feature-done.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/checklists/feature-done.md), [crud-done.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/checklists/crud-done.md), [landing-done.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/checklists/landing-done.md) e [deploy-done.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/checklists/deploy-done.md)
* **Conhecimento (Knowledge Layer):** 11 documentos conceituais independentes de tecnologia.
* **Mapa de Contexto:** [FRAMEWORK_INDEX.md](file:///C:/Users/lucas/Projetos/Boilerplate-v2/FRAMEWORK_INDEX.md) para controle do escopo de leitura técnica da IA.

## 🔄 Fluxo Operacional Resumido
1. O usuário discute a demanda no **Chat Externo** e preenche um **Template** oficial.
2. A especificação é salva na pasta de **specifications** do `.ai-workspace/`.
3. O **Manager** lê a especificação, seleciona o **Workflow**, quebra a demanda em **Features** e **Work Units** e atualiza o **PROJECT_STATE**.
4. O Manager delega a primeira **Work Unit** para a **Role** especialista (`frontend` ou `backend`), fornecendo as referências conceituais da **Knowledge Layer** adequadas.
5. O especialista executa a tarefa isolada sob as diretrizes do **coding-style**.
6. O resultado é auditado na esteira do workflow de `review` contra os critérios do **Checklist** de homologação.
7. O **PROJECT_STATE** é atualizado registrando a conclusão e o histórico de execução na tabela dedicada, reiniciando o ciclo.

## 🏛️ Hierarquia de Conhecimento (Knowledge Hierarchy)
Para guiar a cognição da IA durante o processamento de regras e lógica, o repositório estabelece oficialmente a seguinte hierarquia de conhecimento:

1. **Framework Core:** Composto pelas diretrizes base em [.agents/rules/](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/rules/), [.agents/roles/](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/roles/), [.agents/workflows/](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/workflows/) e [.agents/knowledge/](file:///C:/Users/lucas/Projetos/Boilerplate-v2/.agents/knowledge/).
2. **Especificações (Specifications):** Escopos e briefings preenchidos contidos na pasta de especificações e ADRs de decisões de arquitetura.
3. **Skills da Agência (Opcional):** Biblioteca de especialidades contida em `.agents/skills/` e catalogada em `AI_ARSENAL.md`.
4. **Conhecimento Geral do Modelo:** Os pesos cognitivos preexistentes na rede neural da IA sobre linguagens de programação e tecnologias genéricas.

> **Regra de Ouro:** Uma Skill da agência ou conhecimento geral do modelo **nunca possui prioridade superior ao Framework**. Diretrizes contidas nas Rules e Workflows sempre se sobrepõem e superam as orientações descritas nas Skills locais ou nas heurísticas padrões da IA.

## 🧠 Filosofia Core
* **Código como Fonte Única da Verdade:** Documentos como `PROJECT_STATE.md` são apenas snapshots. O código físico sempre possui precedência máxima.
* **Context Driven Development:** Consciência contínua do estado atual com foco no controle de tokens via `FRAMEWORK_INDEX.md`.
* **Incremental Development (Work Units):** Divisão lógica e atômica de complexidade técnica.
* **Low Context Consumption:** Otimização agressiva de leitura de diretórios pelos agentes.

## 🚧 Limitações Conhecidas desta Versão
* **Papéis Auxiliares Inativos:** As roles de `database.md` e `reviewer.md` encontram-se estruturadas mas sem lógica de comportamento nesta versão, sendo suas tarefas temporariamente assimiladas pelas demais roles ativas (`backend.md` e workflow `review.md`).
* **Sincronia do Snapshot:** O `PROJECT_STATE.md` necessita de atualização disciplinada por parte do Manager para não gerar divergência operacional temporária frente ao código físico.

## 🎯 O que será validado no Projeto Piloto
* A eficácia da **Classificação de Tarefas** e a velocidade operacional do modo **Fast Track**.
* A redução no consumo de tokens trazida pela injeção exclusiva de contexto mapeada no **FRAMEWORK_INDEX.md**.
* A robustez das revisões utilizando os níveis de prioridade do **authority-levels.md**.
* O histórico e evolução de decisões técnicas via criação de novas **ADRs**.
