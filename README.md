# Devio Platform — Fundação de Produção V4.0.0 Stable

```text
                Devio Platform
                    README
                       
               START_HERE.md
                       
     
 Landing         SaaS         API / ERP
                                  
 Workflow      Workflow       Workflow
                                  
 Framework Engine V4
```

A **Devio Platform** é a infraestrutura de engenharia e desenvolvimento mestre da agência para construção de aplicações web, painéis de gestão e microsserviços integrados de altíssimo desempenho, combinando front-end moderno e inteligência artificial contextual.

---

## 🏛️ Divisão e Componentes do Ecossistema

Para compreender a plataforma, é necessário entender as três engrenagens que trabalham juntas:

### 1. O Boilerplate Next.js (Interface Frontend & SaaS)
É a base de código visual localizada em `src/`, estruturada sob os padrões de **Feature-Sliced Design (FSD)** e **Route Groups**. Ela oferece App Shell completo (Sidebar + Topbar), acessibilidade de formulários (BaseInput), SEO técnico nativo (sitemap/robots dinâmicos) e integração completa com o Supabase SSR para banco de dados e sessão via cookies no servidor.

### 2. O AI Development Framework (Camada Cognitiva Local)
O diretório cognitivo localizado em `.agents/` e `.ai-workspace/` que contém as capacidades (`capabilities`), checklists de aceitação, regras de estilo e workflows específicos para orientar a atuação de engenheiros e agentes de IA autônomos dentro do workspace do projeto.

### 3. A Framework Engine V4 (Knowledge Engine)
Localizada em `framework-engine/`, é a engine executável local, agnóstica a modelos e provedores de IA, responsável por compilar o grafo de dependências da AST do código, planejar subqueries, comprimir payloads redundantes e montar prompts seguros que respeitam o orçamento útil de tokens do LLM de forma 100% determinística.

---

## 🔄 Como eles Trabalham Juntos?

1. **Desenvolvimento e Ações:** O desenvolvedor ou o agente de IA recebe uma tarefa descrita nas especificações da `.ai-workspace/`.
2. **Consulta e Contexto (Engine V4):** A IA aciona a `KnowledgeEngine` para buscar dependências do código. O `RealGraphWatcher` detecta se há arquivos modificados no disco e sincroniza de forma lazy com o servidor MCP do Graphify. O `QueryPlanner` constrói o plano de consulta, o resolvedor filtra duplicações e o compressor reduz o texto bruto em até **96%**.
3. **Prompt Assembly e Envio:** O `PromptAssembler` monta o prompt no orçamento exato do modelo (OpenAI, Gemini ou Claude).
4. **Modificação Física (FSD):** A resposta da IA altera o código do front-end Next.js dentro do respectivo módulo em `src/features/` seguindo as diretrizes estruturais de design do projeto.
5. **CI/CD e Homologação:** Ao efetuar o push do código, os workflows do GitHub Actions rodam testes de regressão da Engine e compilam o build de produção do Next.js de forma infalível.

---

## 🚀 Como Iniciar um Novo Projeto

1. **Clonar e Configurar o Repositório:**
   ```bash
   git clone <repositorio>
   cd Boilerplate-v2
   pnpm install
   ```
2. **Configurar Chaves do Supabase:** Copie o arquivo `.env.example` para `.env` e ajuste as credenciais.
3. **Iniciar o Servidor Local:**
   ```bash
   pnpm run dev
   ```
4. **Verificar Situação do Projeto:** Consulte o guia [**`START_HERE.md`**](./START_HERE.md) para escolher o workflow adequado para o seu cenário (Landing Page, SaaS, ERP, API, etc.).

---

## Estrutura da Documentação

A documentação da **Devio Platform** segue uma sequência curta de entrada e depois se divide por finalidade:

```text
README.md
↓
START_HERE.md
↓
WHY.md
↓
docs/
```

### Arquivos na Raiz:
*   [**`README.md`**](./README.md) — Visão geral da plataforma, arquitetura de componentes e fluxos.
*   [**`START_HERE.md`**](./START_HERE.md) — O guia de início principal com rotas operacionais por tipo de projeto.
*   [**`WHY.md`**](./WHY.md) — Justificativas técnicas e decisões de arquitetura (Clean Architecture, FSD, MCP, Graphify).
*   [**`CHANGELOG.md`**](./CHANGELOG.md) — Registro histórico das evoluções de versões.
*   [**`REPOSITORY_STATUS.md`**](./REPOSITORY_STATUS.md) — Status oficial de certificação e produção do repositório.
*   [**`AGENTS.md`**](./AGENTS.md) — Regras regulatórias e de estilo para agentes de IA autônomos.

### Diretório [`docs/`](./docs/):
*   [`architecture/`](./docs/architecture/) — Contratos, limites e regras estruturais da plataforma.
*   [`framework/`](./docs/framework/) — Manuais técnicos da Framework Engine e seus módulos.
*   [`guides/`](./docs/guides/) — Guias práticos de desenvolvimento, boas práticas e migração.
*   [`history/`](./docs/history/) — Estados, relatórios e histórico de evolução do projeto.
*   [`references/`](./docs/references/) — Inventários, mapas e referências operacionais.
*   [`decisions/`](./docs/decisions/) — Registros formais de decisões arquiteturais.

---

## 📚 Documentação Relacionada e Guias de Produto

Para se aprofundar nas diretrizes operacionais do projeto:
*   [**`START_HERE.md`**](./START_HERE.md) — Guia rápido de início e roteamento.
*   [**`WHY.md`**](./WHY.md) — Análise técnica e justificativas conceituais.
*   [**`PROJECT_TYPES.md`**](./docs/guides/PROJECT_TYPES.md) — Como configurar o boilerplate por cenário de aplicação.
*   [**`BEST_PRACTICES.md`**](./docs/guides/BEST_PRACTICES.md) — Regras de ouro de uso regulatório da plataforma.
*   [**`UPGRADE.md`**](./docs/guides/UPGRADE.md) — Instruções de migração de projetos antigos para a V4.
*   [**`REPOSITORY_STATUS.md`**](./REPOSITORY_STATUS.md) — Estado de prontidão de produção.
